function adminMiddleWare(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).send("Không có quyền");
  }
  next();
}

module.exports = adminMiddleWare;