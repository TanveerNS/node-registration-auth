const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../helpers/responseHelper");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return errorResponse(res, "Missing required fields: name, email, or password.", 400);
    }

    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, "Invalid email format.", 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, "User already exists with this email.", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userId = newUser._id;
    const responseData = { userId, email };
    return successResponse(res, responseData);
  } catch (error) {
    console.error("Error during user registration:", error.message);

    if (error.name === "ValidationError") {
      return errorResponse(res, "Validation Error: " + error.message, 422);
    } else if (error.code === 11000) {
      return errorResponse(res, "Duplicate entry error, please check your data.", 400);
    } else {
      return errorResponse(res, "Server Error, please try again later.", 500);
    }
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return errorResponse(res, "Missing required fields: email or password.", 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return errorResponse(res, "Invalid email or password.", 401);
    }
    const userId = user._id;
    const payload = {
      userId,
      email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const responseData = { userId, email, token };
    return successResponse(res, responseData);
  } catch (error) {
    console.error("Error during user login:", error.message);
    return errorResponse(res, "Server Error, please try again later.", 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const profileData = {
      userId: user._id,
      email: user.email,
      name: user.name,
    };

    return successResponse(res, profileData);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    return errorResponse(res, "Server Error", 500);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
