const jwt = require("jsonwebtoken");
const {User} = require("../models/index");

const protect = async (req, res, next) => {
  const token = req.cookies.shopease_token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user ID to the request object for use in the controller
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// 2. Admin Auth (Combines Protect + Role Check)
const adminOnly = async (req, res, next) => {
  // First, run the protection logic
  await protect(req, res, () => {
    // Then check the role
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ 
        success: false, 
        message: "Forbidden: Admin access required" 
      });
    }
  });
};

module.exports = { protect , adminOnly};
