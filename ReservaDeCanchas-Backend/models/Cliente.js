const mongoose = require('mongoose');
const Usuario = require('./Usuario');

const clienteSchema = new mongoose.Schema({
  telefono: { type: String, required: true },
  antecedente: { type: String }
});

const Cliente = Usuario.discriminator('Cliente', clienteSchema);

module.exports = Cliente;