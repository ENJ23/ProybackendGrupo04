const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true }
}, {
  discriminatorKey: 'tipo', // Campo que diferencia los tipos
  collection: 'usuarios'    // Todos en la misma colección
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;