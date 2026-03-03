const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../utils/emailService");
const crypto = require("crypto");

// SignUp
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user exists
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2. Generate 6-digit OTP and Expiry (10 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save to DB with OTP and isVerified: false
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      verificationCode: otpCode, // Matches your updated Model
      codeExpires: expires,      // Matches your updated Model
      isVerified: false,
    });

    // 5. Send the Verification Email
    try {
      await sendVerificationEmail(newUser.email, otpCode);
    } catch (mailError) {
      console.error("Mail service error:", mailError);
      // We don't necessarily want to fail the whole signup if the email fails, 
      // but we should warn the user or provide a "Resend" option later.
    }

    // 6. Return response (Don't send the password back!)
    res.status(201).json({
      success: true,
      message: "Account created! Please check your email for the verification code.",
      userId: newUser.id,
      email: newUser.email
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// Login

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // CHECK VERIFICATION STATUS
  if (!user.isVerified) {
    return res.status(403).json({ 
      success: false, 
      message: "Please verify your email first",
      unverified: true
    });
  }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create a JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Payload (Data we want to store in token)
      JWT_SECRET,                      // Secret Key
      { expiresIn: "1d" }              // Token expires in 1 day
    );

    // Send token in a secure cookie
    res.cookie("shopease_token", token, {
      httpOnly: true,       // Prevents JS access
      // secure: process.env.NODE_ENV === "production", // Only over HTTPS in prod
      secure: false,
      sameSite: "lax",   // Prevents CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/"
    });


    // Send token + user info to frontend
    res.status(200).json({
      success: true,
      token, // The frontend will save this
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Get me: fetch the user based on the ID stored in the token
const getMe = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.userId, {
      attributes: { exclude: ['password'] } // Never send the password back!
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout
const logout = (req, res) => {
  res.cookie("shopease_token", "", {
    httpOnly: true,
    expires: new Date(0), // Expire the cookie immediately
  });
  res.status(200).json({success: true, message: "Logged out successfully" });
};


const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email and code
    const user = await UserModel.findOne({ 
      where: { 
        email, 
        verificationCode: code 
      } 
    });

    // If no user found, the code is wrong
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid verification code. Please check your email." 
      });
    }

    // Check if the code has expired (10 minute window)
    const now = new Date();
    if (now > user.codeExpires) {
      return res.status(400).json({ 
        success: false, 
        message: "Code has expired. Please request a new one." 
      });
    }

    // Success: Update user status
    user.isVerified = true;
    user.verificationCode = null; // Clear code after successful use
    user.codeExpires = null;      // Clear expiry
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully! You can now login." 
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Verification failed", 
      error: error.message 
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Find the user
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "This account is already verified. Please login." });
    }

    // Generate new OTP and Expiry
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update the user record
    await user.update({
      verificationCode: newOtp,
      codeExpires: newExpires
    });
    await sendVerificationEmail(user.email, newOtp);

    res.status(200).json({ 
      success: true, 
      message: "A fresh verification code has been sent to your email!" 
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Could not resend OTP", 
      error: error.message 
    });
  }
};

module.exports = {login, signup, getMe, logout, verifyOTP, resendOTP};