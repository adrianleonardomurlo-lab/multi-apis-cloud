import express from "express";
import cors from "cors";
import { pool } from "./db.js";



const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;
const SERVICE = process.env.SERVICE_NAME || "products-api";
const USERS_API_URL = process.env.USERS_API_URL || "http://users-api:4001";

app.get("/db/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});




// Crear producto
app.post("/products", async (req, res) => {
  const { name, price, stock } = req.body ?? {};
  if (!name || price == null) {
    return res.status(400).json({ error: "name & price required" });
  }

  try {
    const r = await pool.query(
      `INSERT INTO products_schema.products(name, price, stock) 
       VALUES($1, $2, $3) 
       RETURNING id, name, price, stock`,
      [name, price, stock ?? 0]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "insert failed", detail: String(e) });
  }
});


app.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const r = await pool.query(
      "SELECT id, name, price, stock FROM products_schema.products WHERE id = $1",
      [id]
    );

    if (r.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

// Listar productos
app.get("/products", async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, name, price, stock FROM products_schema.products ORDER BY id ASC"
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});


// Actualizar producto
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body ?? {};

  try {
    const r = await pool.query(
      `UPDATE products_schema.products 
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           stock = COALESCE($3, stock)
       WHERE id = $4
       RETURNING id, name, price, stock`,
      [name, price, stock, id]
    );

    if (r.rows.length === 0) return res.status(404).json({ error: "product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "update failed", detail: String(e) });
  }
});

// Eliminar producto
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const r = await pool.query(
      "DELETE FROM products_schema.products WHERE id = $1 RETURNING id, name",
      [id]
    );

    if (r.rows.length === 0) return res.status(404).json({ error: "product not found" });
    res.json({ message: "product deleted", product: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: "delete failed", detail: String(e) });
  }
});

app.listen(PORT, () => console.log(`✅ users-api on http://localhost:${PORT}`));
