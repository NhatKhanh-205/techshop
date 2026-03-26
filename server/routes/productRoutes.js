const router = require("express").Router();
const { sql } = require("../config/db");

const auth = require("../middleWare/authMiddleWare");
const admin = require("../middleWare/adminMiddleWare");

console.log("auth:", auth);
console.log("admin:", admin);

//  GET ALL
router.get("/", async (req, res) => {
  try {
    const result = await sql.query("SELECT * FROM Products");
    res.json(result.recordset);
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

    await sql.query`
      INSERT INTO Products (Name, Price, Image, Describe)
      VALUES (${name}, ${price}, ${image}, ${describe})
    `;

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

    await sql.query`
      UPDATE Products
      SET Name = ${name},
          Price = ${price},
          Image = ${image},
          Describe = ${describe}
      WHERE Id = ${id}
    `;

    res.send("Product updated");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


//  DELETE (ADMIN)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    await sql.query`
      DELETE FROM Products WHERE Id = ${id}
    `;

    res.send("Product deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;