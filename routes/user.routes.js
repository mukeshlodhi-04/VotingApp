const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("./../models/user.models");
const jwtAuthMiddleware = require("./../jwt");

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        const newuser = new User(data);
        const response = await newuser.save();

        const payload = { id: response.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.status(201).json({ message: "User created", user: response, token });
    } catch (error) {
        console.error("Error in signup:", error.message);
        res.status(400).json({ message: "Unable to create user" });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { adharNo, password } = req.body;

        // Find user by adharNo
        const user = await User.findOne({ adharNo });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.json({ message: "User logged in", token });
    } catch (error) {
        console.error("Error in login:", error.message);
        res.status(400).json({ message: "Unable to log in" });
    }
});

// Profile Route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user from database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            profile: user,
        });
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ message: "An error occurred while fetching the profile" });
    }
});

// Update Password Route
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currpassword, newpassword } = req.body;

        // Fetch user from database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare current password
        if (!(await user.comparePassword(currpassword))) {
            return res.status(401).json({ message: "Incorrect current password" });
        }

        // Update to the new password
        user.password = newpassword; // Ensure password hashing in model `save` middleware
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error.message);
        res.status(500).json({ message: "An error occurred while updating the password" });
    }
});

module.exports = router;


