const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({
      success: false,
      message: "User is not login !!!",
    });
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

    req.userId = decoded.userId;
    console.log(req.userId)
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Token not found !!!",
    });
  }
};

module.exports = verifyToken;