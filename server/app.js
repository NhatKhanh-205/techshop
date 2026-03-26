require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");

const app = express();
const cartRoute = require("./routes/cartRoutes");


app.use(cors());
app.use(express.json());


connectDB();

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});