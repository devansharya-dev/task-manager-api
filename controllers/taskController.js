const mongoose = require("mongoose");

const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  parsePaginationParams,
} = require("../utils/validators");

const createTask = asyncHandler(async (req, res) => {
  validateCreateTaskInput(req.body);

  const task = await Task.create({
    title: req.body.title.trim(),
    completed: Boolean(req.body.completed),
    user: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const filter = { user: req.user.id };

  if (req.query.completed === "true") {
    filter.completed = true;
  }

  if (req.query.completed === "false") {
    filter.completed = false;
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Tasks fetched successfully",
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    data: tasks,
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid task id", 400);
  }

  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Task fetched successfully",
    data: task,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  validateUpdateTaskInput(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid task id", 400);
  }

  const updateData = {};

  if (typeof req.body.title === "string") {
    updateData.title = req.body.title.trim();
  }

  if (typeof req.body.completed === "boolean") {
    updateData.completed = req.body.completed;
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user.id,
    },
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid task id", 400);
  }

  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
    data: null,
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
