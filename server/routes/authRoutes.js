const router = require("express").Router();
const { poolPromise, sql } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Thiếu thông tin");
    }

    const pool = await poolPromise;

    // check username
    const checkResult = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");

    if (checkResult.recordset.length > 0) {
      return res.status(400).send("Username đã tồn tại");
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hash)
      .input("role", sql.NVarChar, "user")
      .query("INSERT INTO Users (Username, Password, Role) VALUES (@username, @password, @role)");

    res.send("Register success");

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).send(err.message);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).send("Thiếu thông tin");
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");

    const user = result.recordset[0];

    if (!user) return res.status(400).send("Người dùng không tồn tại");

    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(400).send("Sai mật khẩu");

    const token = jwt.sign(
      { id: user.Id, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;