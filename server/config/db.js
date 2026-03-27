const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,   
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,              
    trustServerCertificate: true
  }
};

// tạo pool (connection pooling)
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log(" Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error(" DB Connection Error:", err);
    process.exit(1); 
  });

module.exports = {
  sql,
  poolPromise
};