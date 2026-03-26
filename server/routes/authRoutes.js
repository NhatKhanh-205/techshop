const router = require("express").Router();
const { sql } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// dangky
router.post("/register", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { Username, Password } = req.body;

    if (!Username || !Password) {
      return res.status(400).send("Thiếu thông tin");
    }

    const check = await sql.query`
      SELECT * FROM Users WHERE Username = ${Username}
    `;

    if (check.recordset.length > 0) {
      return res.status(400).send("Username đã tồn tại");
    }

    const hash = await bcrypt.hash(Password, 10);

    await sql.query`
      INSERT INTO Users (Username, Password, Role)
      VALUES (${Username}, ${hash}, 'user')
    `;

    res.send("Register success");

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).send(err.message);
  }
});

// dangnhap
router.post("/login", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).send("Thiếu thông tin");
    }

    const result = await sql.query`
      SELECT * FROM Users WHERE Username = ${username}
    `;

    const user = result.recordset[0];

    if (!user) return res.status(400).send("Nguoi dung khong ton tai");

    const match = await bcrypt.compare(password, user.Password);

    if (!match) return res.status(400).send("Sai mat khau");

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