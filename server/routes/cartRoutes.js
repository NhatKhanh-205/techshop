const router = require("express").Router();
const { poolPromise, sql } = require("../config/db");
const auth = require("../middleWare/authMiddleWare");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

if (!fs.existsSync("invoices")) {
  fs.mkdirSync("invoices");
}

if (!fs.existsSync("reports")) {
  fs.mkdirSync("reports");
}

console.log("Cart route loaded");

// test route
router.get("/test", (req, res) => {
  res.send("cart ok");
});

// add product to cart
router.post("/add", auth, async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).send("Thiếu productId");
    }

    const pool = await poolPromise;

    // check if cart exists
    let cartResult = await pool.request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Cart WHERE UserId = @userId");

    let cartId;

    if (cartResult.recordset.length === 0) {
      // tạo cart mới
      const newCart = await pool.request()
        .input("userId", sql.Int, userId)
        .query("INSERT INTO Cart (UserId) OUTPUT INSERTED.Id VALUES (@userId)");

      cartId = newCart.recordset[0].Id;
    } else {
      cartId = cartResult.recordset[0].Id;
    }

    // thêm item vào cart
    await pool.request()
      .input("cartId", sql.Int, cartId)
      .input("productId", sql.Int, productId)
      .input("quantity", sql.Int, 1)
      .query("INSERT INTO CartItems (CartId, ProductId, Quantity) VALUES (@cartId, @productId, @quantity)");

    res.send("Added to cart");

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get cart items
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT p.*, ci.Quantity
        FROM Cart c
        JOIN CartItems ci ON c.Id = ci.CartId
        JOIN Products p ON p.Id = ci.ProductId
        WHERE c.UserId = @userId
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/checkout", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { method } = req.body;

    const pool = await poolPromise;

    // 🔥 lấy cart
    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT p.Name, p.Price, ci.Quantity
        FROM Cart c
        JOIN CartItems ci ON c.Id = ci.CartId
        JOIN Products p ON p.Id = ci.ProductId
        WHERE c.UserId = @userId
      `);

    const items = result.recordset;

    if (items.length === 0) {
      return res.status(400).send("Cart rỗng");
    }

    // 🔥 tính tổng
    const total = items.reduce(
      (sum, i) => sum + i.Price * i.Quantity,
      0
    );

    // =====================
    // 🧾 TẠO FILE WORD
    // =====================
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun("HÓA ĐƠN BÁN HÀNG")],
            }),
            ...items.map(i =>
              new Paragraph(
                `${i.Name} - ${i.Quantity} x ${i.Price}`
              )
            ),
            new Paragraph(`Tổng: ${total}`)
          ]
        }
      ]
    });

    const invoicePath = `invoices/invoice_${Date.now()}.docx`;

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(invoicePath, buffer);

    // =====================
    // 📊 GHI EXCEL
    // =====================
    const path = require("path");

    // lấy ngày hiện tại
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

    const excelPath = path.join(__dirname, "../reports", `report_${today}.xlsx`);

    let workbook;
    let sheet;

    if (fs.existsSync(excelPath)) {
      // 🔥 nếu file đã tồn tại → đọc file cũ
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(excelPath);
      sheet = workbook.getWorksheet("Sales");
    } else {
      // 🔥 nếu chưa có → tạo mới
      workbook = new ExcelJS.Workbook();
      sheet = workbook.addWorksheet("Sales");

      sheet.columns = [
        { header: "Tên SP", key: "name" },
        { header: "Số lượng", key: "qty" },
        { header: "Tổng tiền", key: "total" }
      ];
    }

    // 🔥 cập nhật dữ liệu
    items.forEach(i => {
      let found = false;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // bỏ header

        if (row.getCell(1).value === i.Name) {
          // nếu sản phẩm đã tồn tại → cộng dồn
          row.getCell(2).value += i.Quantity;
          row.getCell(3).value += i.Price * i.Quantity;
          found = true;
        }
      });

      // nếu chưa có → thêm mới
      if (!found) {
        sheet.addRow({
          name: i.Name,
          qty: i.Quantity,
          total: i.Price * i.Quantity
        });
      }
    });

    // lưu file
    await workbook.xlsx.writeFile(excelPath);

    // =====================
    // 🗑 CLEAR CART
    // =====================
    await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        DELETE ci
        FROM CartItems ci
        JOIN Cart c ON ci.CartId = c.Id
        WHERE c.UserId = @userId
      `);

    res.json({
      message: "Checkout thành công",
      invoice: invoicePath,
      excel: excelPath
    });

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

//xoa san pham khoi cart
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    const pool = await poolPromise;

    await pool.request()
      .input("userId", sql.Int, userId)
      .input("productId", sql.Int, productId)
      .query(`
        DELETE ci
        FROM CartItems ci
        JOIN Cart c ON ci.CartId = c.Id
        WHERE c.UserId = @userId AND ci.ProductId = @productId
      `);

    res.send("Đã xoá sản phẩm");

  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;