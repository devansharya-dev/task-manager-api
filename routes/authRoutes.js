const express = require("express");

const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", login);

module.exports = router;
