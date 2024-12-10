const { prismaClient } = require('@prisma/client');
const prisma = new prismaClient();

module.exports = { prisma };
