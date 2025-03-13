require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

const GuestSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  celular: { type: Number, required: true },
  confirmado: { type: String, enum: ["sim", "não", "pendente"], default: "pendente" }
});

const Guest = mongoose.model("convidados", GuestSchema);

app.post("/convidados", async (req, res) => {
  try {
    const novoConvidado = new Guest(req.body);
    await novoConvidado.save();
    res.status(201).json(novoConvidado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/convidados/:id", async (req, res) => {
  try {
    const { nome, celular, confirmado } = req.body;
    const convidadoAtualizado = await Guest.findByIdAndUpdate(
      req.params.id,
      { nome, celular, confirmado },
      { new: true }
    );

    if (!convidadoAtualizado) {
      return res.status(404).json({ error: "Convidado não encontrado" });
    }

    res.json(convidadoAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/convidados/:id", async (req, res) => {
  try {
    const convidadoDeletado = await Guest.findByIdAndDelete(req.params.id);

    if (!convidadoDeletado) {
      return res.status(404).json({ error: "Convidado não encontrado" });
    }

    res.json({ message: "Convidado removido com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/convidados", async (req, res) => {
  const convidados = await Guest.find();
  res.json(convidados);
});

app.get("/convidados/:id", async (req, res) => {
  try {
    const convidado = await Guest.findById(req.params.id);

    if (!convidado) {
      return res.status(404).json({ error: "Convidado não encontrado" });
    }

    res.json(convidado);
  } catch (error) {
    res.status(400).json({ error: "ID inválido ou erro na busca" });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
