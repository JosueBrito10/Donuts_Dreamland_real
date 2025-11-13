// ================== IMPORTAÇÕES ==================
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(express.json());

// ================== CONFIGURAÇÃO DO CORS ==================
app.use(
  cors({
    origin: [
      "http://localhost:5501",
      "http://127.0.0.1:5501",
      "https://donuts-dreamland.onrender.com"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ================== SERVIR O FRONTEND ==================
const rootDir = path.join(__dirname, "../../");
app.use(express.static(rootDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

// ================== CONEXÃO COM O BANCO DE DADOS ==================
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "1234567890",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || "donuts_dreamland",
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false, // SSL ativo no Render
});

// Teste de conexão
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conexão com PostgreSQL bem-sucedida!");
    client.release();
  } catch (err) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", err.message);
    console.error("💡 Verifique suas variáveis de ambiente no Render.");
  }
})();

// ================== ROTA DE CADASTRO ==================
app.post("/cadastro", async (req, res) => {
  console.log("📩 Dados recebidos:", req.body);
  const { email, numero, senha } = req.body;

  if (!email || !numero || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos!" });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await pool.query(
      "INSERT INTO usuario (email, numero, senha) VALUES ($1, $2, $3)",
      [email, numero, senhaCriptografada]
    );

    console.log("✅ Usuário cadastrado com sucesso!");
    res.json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("💥 Erro no banco de dados:", err.message);
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
  }
})
