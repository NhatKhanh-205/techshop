const router = require("express").Router();
const { sql } = require("../config/db");
const auth = require("../middleWare/authMiddleWare");

console.log("Cart route loaded");


router.get("/test", (req, res) => {
  res.send("cart ok");
});
router.post("/add", auth, async (req, res) => {
  console.log("BODY:", req.body);
  console.log("productId:", req.body.productId);
  try {
    const productId = req.body.productId || req.body.ProductId;

    if (!productId) {
      return res.status(400).send("Thiếu productId");
    }

    const userId = req.user.id;

    let cart = await sql.query`
      SELECT * FROM Cart WHERE UserId = ${userId}
    `;

    let cartId;

    if (cart.recordset.length === 0) {
      const newCart = await sql.query`
        INSERT INTO Cart (UserId)
        OUTPUT INSERTED.Id
        VALUES (${userId})
      `;
      cartId = newCart.recordset[0].Id;
    } else {
      cartId = cart.recordset[0].Id;
    }

    await sql.query`
      INSERT INTO CartItems (CartId, ProductId, Quantity)
      VALUES (${cartId}, ${productId}, 1)
    `;

    res.send("Added to cart");

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await sql.query`
      SELECT p.*, ci.Quantity
      FROM Cart c
      JOIN CartItems ci ON c.Id = ci.CartId
      JOIN Products p ON p.Id = ci.ProductId
      WHERE c.UserId = ${userId}
    `;

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;