const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
   console.log("HEADER:", authHeader);

  if (!authHeader) {
    return res.status(401).send("Chưa đăng nhập");
  }


  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Token không hợp lệ");
  }
}

module.exports = authMiddleware;