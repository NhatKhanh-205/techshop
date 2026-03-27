const router = require("express").Router();
const { poolPromise, sql } = require("../config/db");
const auth = require("../middleWare/authMiddleWare");
const admin = require("../middleWare/adminMiddleWare");

// GET ALL
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Products");
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// CREATE
router.post("/", auth, admin, async (req, res) => {
  try {
    const { name, price, image, describe } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("price", sql.Float, parseFloat(price))
      .input("image", sql.NVarChar, image || "")
      .input("describe", sql.NVarChar, describe || "")
      .query(`
        INSERT INTO Products (Name, Price, Image, Describe)
        VALUES (@name, @price, @image, @describe)
      `);

    res.send("Created");

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// UPDATE
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { name, price, image, describe } = req.body;

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("name", sql.NVarChar, name)
      .input("price", sql.Float, parseFloat(price))
      .input("image", sql.NVarChar, image)
      .input("describe", sql.NVarChar, describe)
      .query(`
        UPDATE Products
        SET Name=@name, Price=@price, Image=@image, Describe=@describe
        WHERE Id=@id
      `);

    res.send("Updated");

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// DELETE
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Products WHERE Id=@id");

    res.send("Deleted");

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;