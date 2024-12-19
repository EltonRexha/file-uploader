const { body, validationResult } = require('express-validator');
const prisma = require('../db/client');
const upload = require('../utils/multer');
const supabase = require('../utils/supabase');
const path = require('path');
const crypto = require('crypto');
const HttpError = require('../errors/httpError');

async function createWorkspace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array();
    const nameError =
      errorMessages.find((err) => err.path === 'name')?.msg || '';
    const descriptionError =
      errorMessages.find((err) => err.path === 'description')?.msg || '';

    res.redirect(
      `/dashboard/home/allFiles?workspaceModal=true&nameError=${encodeURIComponent(
        nameError
      )}&descriptionError=${encodeURIComponent(descriptionError)}`
    );
    return;
  }

  const { name, description } = req.body;
  const user = req.user;

  const exists = await prisma.workspace.findFirst({
    where: {
      name: name,
      user: {
        id: user.id,
      },
    },
  });

  if (exists) {
    next(new HttpError('A workspace with this name already exists', 409));
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
      name,
      description,
    },
  });

  res.redirect('/');
}

async function uploadFiles(req, res, next) {
  const { upload_path, workspaceName } = req.body;
  const files = req.files;

  for (const file of files) {
    const hashedFilename = hashFileName(file.originalname, req.user.id);
    const filePath = path.join(upload_path, hashedFilename);

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

    const workspace = await prisma.workspace.findFirst({
      where: {
        name: workspaceName,
        user: {
          id: req.user.id,
        },
      },
    });

    if (!workspace) {
      next(new HttpError(`Could not find this workspace`, 409));
    }

    // Upload to Supabase
    await supabase.storage
      .from(process.env.BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

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
              path: upload_path,
            },
          },
        },
      },
    });
  }

  res.redirect('/');
}

async function getWorkspaceContent(req, res) {
  const { workspaceName } = req.params;
  if (!req.query.path) {
    res.redirect(`${workspaceName}?path=/`);
  }

  const { path } = req.query;

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
      path: {
        startsWith: path,
      },
      NOT: {
        path: '/',
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
          startsWith: path,
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

  res.render('workspaceContent', { workspace, folders, files: files });
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
  getWorkspaceContent,
};
