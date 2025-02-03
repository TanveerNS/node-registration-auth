const express = require("express");
const { registerUser, loginUser, getProfile } = require('../controllers/authController')
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware");

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get("/profile", authMiddleware, getProfile);

module.exports = router