import express from "express";
import { connectDB } from "./db.js";
import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4002;

// 🔌 Conexión a la base de datos
await connectDB();


const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export const Product = mongoose.model("Product", productSchema);


// 🩺 Ruta de salud
app.get("/health", (req, res) => {
  res.send("API de productos funcionando correctamente 🚀");
});

app.get("/clase", (req, res) => {
  res.send("Clase de hoy 24/10");
});

app.get("/products/:id", async (req, res) => {
  try {
    
    const product = await Product.findOne({ _id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});


// 📦 Obtener todos los productos
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});




// ➕ Crear un nuevo producto
app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const newProduct = new Product({ name, price });
    await newProduct.save();

    res.status(201).json({
      message: "Producto creado exitosamente",
      _id: newProduct._id,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id }, // buscar por el campo autoincrementable
      req.body,
      { new: true } // devuelve el documento actualizado
    );

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    res.json({ message: "Producto actualizado correctamente", product });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar producto", error });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const products = await Product.deleteOne({_id: req.params.id});
    res.json({message: "Producto eliminado correctamente"});
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// 🚀 Inicio del servidor
app.listen(PORT, () => {
  console.log(`✅ products-api on http://localhost:${PORT}`);
});
