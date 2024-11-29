const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

app.use(cors());
const port = process.env.PORT || 8000;

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.Host,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).send("Backend is running...");
});

app.post("/api/login", async (req, res) => {
  const { username, password, gate_no } = req.body;
  if (!username || !password || !gate_no) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    // Query to check if the credentials exist
    const result = await pool.query(
      "SELECT id, gate_no FROM login WHERE username = $1 AND password = $2 AND gate_no = $3",
      [username, password, gate_no]
    );
    // Check if result has rows
    if (result.rowCount > 0) {
      // Credentials match
      return res.status(200).json({
        message: "Login Successfully !!",
        user_id: result.rows[0].id,
        gate_no: result.rows[0].gate_no,
      });
    } else {
      // No match found
      return res.status(401).json({ error: "Credentials do not match!!" });
    }
  } catch (error) {
    // If an actual error happens during database operation
    return res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/store-qr", async (req, res) => {
  const { name, tickets, phone_no, email, gate_no, user_id } = req.body;

  if ((!name || !tickets || !phone_no || !email, !user_id, !gate_no)) {
    return res.status(400).json({ error: "QR code data is required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO qr_code (name, tickets, phone_no, email, gate_no, user_id) VALUES ($1,$2,$3, $4, $5,$6) RETURNING id",
      [name, tickets, phone_no, email, gate_no, user_id]
    );
    return res.status(201).json({
      message: "QR code data stored successfully",
      id: result.rows[0].id,
    });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.use(express.static("./"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
