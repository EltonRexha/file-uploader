const { body, validationResult } = require('express-validator');
const prisma = require('../db/client');

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
      name,
      description,
    },
  });

  res.redirect('/');
}

module.exports = {
  createWorkspace: [createWorkspaceSchema, createWorkspace],
};
