const router = require("express").Router();
const { poolPromise, sql } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).send("Thiếu thông tin");
    }

    const pool = await poolPromise;

    const checkResult = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");

    if (checkResult.recordset.length > 0) {
      return res.status(400).send("Username đã tồn tại");
    }

    const checkEmail = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    if (checkEmail.recordset.length > 0) {
      return res.status(400).send("Email đã được sử dụng");
    }

    const hash = await bcrypt.hash(password, 10);

    const crypto = require("crypto");
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hash)
      .input("email", sql.NVarChar, email)
      .input("token", sql.NVarChar, verifyToken)
      .query(`
        INSERT INTO Users (Username, Password, Email, Role, IsVerified, VerifyToken)
        VALUES (@username, @password, @email, 'user', 0, @token)
      `);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const verifyLink = `http://localhost:5000/api/auth/verify/${verifyToken}`;

    await transporter.sendMail({
      to: email,
      subject: "Xác thực tài khoản",
      html: `<a href="${verifyLink}">Xác thực tài khoản</a>`
    });

    res.send("Đăng ký thành công, kiểm tra email");

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// ================= VERIFY =================
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("token", sql.NVarChar, token)
      .query(`
        UPDATE Users
        SET IsVerified = 1, VerifyToken = NULL
        OUTPUT inserted.*
        WHERE VerifyToken = @token
      `);

    if (result.recordset.length === 0) {
      return res.send("Link không hợp lệ hoặc đã xác thực");
    }

    res.send("Xác thực thành công!");

  } catch (err) {
    res.status(500).send(err.message);
  }
});
// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");

    const user = result.recordset[0];

    if (!user) return res.status(400).send("Người dùng không tồn tại");

    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(400).send("Sai mật khẩu");

    if (!user.IsVerified) {
      return res.status(400).send("Vui lòng xác thực email trước");
    }
    console.log("User:", user);
    console.log("Password nhập:", password);
    console.log("MATCH:", match);
    const token = jwt.sign(
      { id: user.Id, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const pool = await poolPromise;

    const userResult = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    const user = userResult.recordset[0];

    if (!user) {
      return res.status(400).send("Email không tồn tại");
    }

    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");



    await pool.request()
      .input("token", sql.NVarChar, resetToken)
      .input("email", sql.NVarChar, email)
      .query(`
        UPDATE Users
        SET ResetToken = @token,
        ResetTokenExpire = DATEADD(MINUTE, 15, GETDATE())
        WHERE Email = @email
  `);

    // 👉 gửi link (hoặc trả về để test)
    const link = `http://localhost:3000/reset-password/${resetToken}`;

    res.json({ link });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("token", sql.NVarChar, token)
      .query(`
        SELECT * FROM Users
        WHERE ResetToken = @token AND ResetTokenExpire > GETDATE()
      `);

    const user = result.recordset[0];



    if (!user) {
      return res.status(400).send("Token không hợp lệ hoặc hết hạn");
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input("password", sql.NVarChar, hash)
      .input("id", sql.Int, user.Id)
      .query(`
        UPDATE Users
        SET Password = @password,
            ResetToken = NULL,
            ResetTokenExpire = NULL
        WHERE Id = @id
      `);

    res.send("Đổi mật khẩu thành công");

  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;