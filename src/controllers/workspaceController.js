const { body, validationResult } = require('express-validator');
const prisma = require('../db/client');
const upload = require('../utils/multer');
const supabase = require('../utils/supabase');
const path = require('path');
const crypto = require('crypto');
const HttpError = require('../errors/httpError');

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
    .isLength({ max: 10 })
    .withMessage('Description is too long (less that 10 characters)'),
];

async function createWorkspace(req, res) {
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
  const { upload_path, workspace } = req.body;
  const files = req.files;

  for (const file of files) {
    const fileName = hashFileName(file.originalname, req.user.id);
    const filePath = path.join(upload_path, fileName);

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

    // Upload to Supabase
    await supabase.storage
      .from(process.env.BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    const wk = await prisma.workspace.findFirst({
      where: {
        name: workspace,
        user: {
          id: req.user.id,
        },
      },
    });

    // Query the database
    await prisma.file.create({
      data: {
        byte_size: file.size,
        name: fileName,
        mimeType: file.mimetype,
        path: filePath,
        folder: {
          connect: {
            workspaceId_path: {
              workspaceId: wk.id,
              path: upload_path,
            },
          },
        },
      },
    });
  }
  
  res.redirect('/');
}

async function fileExists(filePath) {
  const file = await prisma.file.findFirst({
    where: {
      path: filePath,
    },
  });

  return !!file;
}

module.exports = {
  createWorkspace: [createWorkspaceSchema, createWorkspace],
  uploadFiles: [upload.array('upload_content', 10), uploadFiles],
};
