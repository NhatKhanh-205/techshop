const router = require("express").Router();

const auth = require("../middleWare/authMiddleWare");
const admin = require("../middleWare/adminMiddleWare");

console.log("auth:", auth);
console.log("admin:", admin);

//  GET ALL
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


//  GET BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql.query`
      SELECT * FROM Products WHERE Id = ${id}
    `;

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// CREATE (ADMIN) 
router.post("/", auth, admin, async (req, res) => {
  try {
    const { name, price, image, describe } = req.body;

    await pool.query(
      "INSERT INTO products (name, price, image, describe) VALUES ($1, $2, $3, $4)",
      [name, price, image, describe]
    );

    res.send("Product created");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


//  UPDATE (ADMIN) 
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image, describe } = req.body;

    await pool.query(
      "UPDATE products SET name=$1, price=$2, image=$3, describe=$4 WHERE id=$5",
      [name, price, image, describe, id]
    );

    res.send("Product updated");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


//  DELETE (ADMIN)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM products WHERE id=$1", [id]);

    res.send("Product deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;