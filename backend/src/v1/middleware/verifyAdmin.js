const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(500).json({
      success: false,
      message: "You are not login !!!You do not have permission to access this operation. If are you admin, access user admin",
    });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (decoded.roleId !== "admin")
      return res.status(400).json({
        success: false,
        message: "You need Admin role !!!",
      });
    req.userId = decoded.userId;
    console.log(req.userId)
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Token not found !!!",
      error,
    });
  }
};

module.exports = isAdmin;