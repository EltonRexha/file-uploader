const { body, validationResult } = require('express-validator');
const prisma = require('../db/client');
const upload = require('../utils/multer');
const supabase = require('../utils/supabase');
const path = require('path');
const crypto = require('crypto');
const HttpError = require('../errors/httpError');
const { BlobReader, BlobWriter, ZipWriter } = require('@zip.js/zip.js');

function customPathJoin(...segments) {
  const joinedPath = path.join(...segments);
  return joinedPath.replace(/\\/g, '/'); // Replaces backslashes with forward slashes on Windows
}

async function createWorkspace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('createWorkspaceErrors', errors.array());

    res.redirect(`/dashboard/home/allFiles?workspaceModal=true`);
    return;
  }

  const { name: workspaceName, description: workspaceDescription } = req.body;
  const user = req.user;

  const exists = await workspaceExists(workspaceName, user.id);

  if (exists) {
    req.flash('createWorkspaceErrors', [
      { msg: 'A workspace with this name already exists' },
    ]);

    res.redirect(`/dashboard/home/allFiles?workspaceModal=true`);
    return;
  }

  //create the folder for the workspace and define a log for it
  const { error } = await supabase.storage.from(process.env.BUCKET_NAME).upload(
    customPathJoin(req.user.id, workspaceName, 'log.txt'),
    new Blob([`createdAt: ${new Date()}, workspace name: ${workspaceName}`], {
      type: 'text/plain',
    })
  );

  if (error) {
    next(HttpError('An error happened during creation of your workspace', 500));
    return;
  }

  await prisma.workspace.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      folder: {
        create: {
          name: '',
          path: '/',
        },
      },
      name: workspaceName,
      description: workspaceDescription,
    },
  });

  res.redirect('/');
}

async function uploadFiles(req, res, next) {
  const { upload_path: uploadPath, workspace: workspaceName } = req.body;
  const files = req.files;

  for (const file of files) {
    const hashedFilename = hashFileName(file.originalname, req.user.id);
    const filePath = customPathJoin(uploadPath, hashedFilename);

    const exists = await fileExists(filePath);

    if (exists) {
      next(
        new HttpError(
          `A file with the same name: ${file.originalname} has already been uploaded`,
          409
        )
      );
      return;
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        name_userId: {
          name: workspaceName,
          userId: req.user.id,
        },
      },
    });

    if (!workspace) {
      next(new HttpError(`Could not find this workspace`, 409));
    }

    // Upload to Supabase
    const { error } = await supabase.storage
      .from(process.env.BUCKET_NAME)
      .upload(
        customPathJoin(req.user.id, workspaceName, filePath),
        file.buffer,
        {
          contentType: file.mimetype,
        }
      );

    if (error) {
      throw new HttpError('Error uploading your files', 500);
    }

    // Query the database
    await prisma.file.create({
      data: {
        byte_size: file.size,
        name: file.originalname,
        hashName: hashedFilename,
        mimeType: file.mimetype,
        path: filePath,
        folder: {
          connect: {
            workspaceId_path: {
              workspaceId: workspace.id,
              path: uploadPath,
            },
          },
        },
        Activity: {
          create: {
            activity: 'UPLOAD',
            folder: {
              connect: {
                workspaceId_path: {
                  workspaceId: workspace.id,
                  path: uploadPath,
                },
              },
            },
            user: {
              connect: {
                id: req.user.id,
              },
            },
            workspace: {
              connect: {
                id: workspace.id,
              },
            },
          },
        },
      },
    });
  }

  res.redirect(`/workspace/${workspaceName}?path=${uploadPath}`);
}

async function getWorkspaceContent(req, res, next) {
  const { workspaceName } = req.params;
  if (!req.query.path) {
    res.redirect(`/workspace/${workspaceName}?path=/`);
  }

  const exists = await workspaceExists(workspaceName, req.user.id);
  if (!exists) {
    next(new HttpError('Looks like you are lost...', 404));
    return;
  }

  const contentPath = req.query.path;

  const fExists = await folderExists(contentPath, req.user.id);

  if (!fExists) {
    next(new HttpError('Looks like you are lost...', 400));
    return;
  }

  const workspace = await prisma.workspace.findFirst({
    where: {
      name: workspaceName,
      user: {
        id: req.user.id,
      },
    },
  });

  const folders = await prisma.folder.findMany({
    where: {
      parentFolder: {
        path: contentPath,
      },
      workspace: {
        name: workspaceName,
        user: {
          id: req.user.id,
        },
      },
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folder: {
        path: {
          startsWith: contentPath,
        },
        workspace: {
          name: workspaceName,
          user: {
            id: req.user.id,
          },
        },
      },
    },
  });

  const createFolderErrors = req.flash('createFolderErrors');
  if (createFolderErrors.length) {
    res.render('workspaceContent', {
      showFolderModal: true,
      createFolderErrors,
      workspace,
      folders,
      files: files,
      path: contentPath,
    });
    return;
  }

  res.render('workspaceContent', {
    workspace,
    folders,
    files: files,
    path: contentPath,
  });
}

async function createFolder(req, res) {
  const errors = validationResult(req);
  const {
    workspace_name: workspaceName,
    create_path: createPath,
    name: folderName,
  } = req.body;
  if (!errors.isEmpty()) {
    req.flash('createFolderErrors', errors.array());
    res.redirect(`/workspace/${workspaceName}?path=${createPath}`);
    return;
  }

  const pathToFolder = customPathJoin(
    createPath.toLowerCase(),
    folderName.toLowerCase()
  );

  const exists = await folderExists(pathToFolder, req.user.id);
  if (exists) {
    req.flash('createFolderErrors', [
      { msg: 'Folder with this name already exists' },
    ]);
    res.redirect(`/workspace/${workspaceName}?path=${createPath}`);
    return;
  }

  const parentFolder = await prisma.folder.findFirst({
    where: {
      path: createPath,
      workspace: {
        name: workspaceName,
        user: {
          id: req.user.id,
        },
      },
    },
  });

  //child folder
  await prisma.folder.create({
    data: {
      path: pathToFolder,
      name: folderName.toLowerCase(),
      workspace: {
        connect: {
          name_userId: {
            name: workspaceName,
            userId: req.user.id,
          },
        },
      },
      parentFolder: {
        connect: {
          id: parentFolder.id,
        },
      },
    },
  });

  res.redirect(`/workspace/${workspaceName}?path=${createPath}`);
}

async function downloadWorkspace(req, res, next) {
  
}

async function workspaceExists(workspaceName, userId) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      name: workspaceName,
      user: {
        id: userId,
      },
    },
  });

  return !!workspace;
}

async function folderExists(folderPath, userId) {
  const folder = await prisma.folder.findFirst({
    where: {
      path: folderPath,
      workspace: {
        user: {
          id: userId,
        },
      },
    },
  });

  return !!folder;
}

async function fileExists(filePath, userId) {
  const file = await prisma.file.findFirst({
    where: {
      path: filePath,
      folder: {
        workspace: {
          userId: userId,
        },
      },
    },
  });

  return !!file;
}

function hashFileName(fileName, userId) {
  return crypto
    .createHash('sha256')
    .update(fileName + userId)
    .digest('hex');
}

const createFolderSchema = [
  body('name')
    .isLength({ min: 3, max: 15 })
    .withMessage('The name of the folder must be between 3 and 15 characters'),
];

const createWorkspaceSchema = [
  body('name')
    .isLength({ min: 3, max: 8 })
    .withMessage('Name must be between 3 to 8 characters long'),
  body('description')
    .isLength({ max: 30 })
    .withMessage('Description is too long (less that 30 characters)'),
];

module.exports = {
  createWorkspace: [createWorkspaceSchema, createWorkspace],
  uploadFiles: [upload.array('upload_content', 10), uploadFiles],
  createFolder: [createFolderSchema, createFolder],
  downloadWorkspace,
  getWorkspaceContent,
};
