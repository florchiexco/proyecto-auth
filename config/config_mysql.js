const mysql = require("mysql");

/**
 * File of connection to the data base.
 */

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "proyecto_auth"
});

module.exports = connection;