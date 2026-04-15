const AppError = require("./AppError");

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateRegisterInput = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  if (!isEmailValid(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (!isEmailValid(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }
};

const validateCreateTaskInput = ({ title }) => {
  if (!title || !title.trim()) {
    throw new AppError("Task title is required", 400);
  }
};

const validateUpdateTaskInput = ({ title, completed }) => {
  if (title === undefined && completed === undefined) {
    throw new AppError("Please provide at least one field to update", 400);
  }

  if (title !== undefined && !String(title).trim()) {
    throw new AppError("Task title cannot be empty", 400);
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    throw new AppError("Completed must be a boolean value", 400);
  }
};

const parsePaginationParams = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateCreateTaskInput,
  validateUpdateTaskInput,
  parsePaginationParams,
};
