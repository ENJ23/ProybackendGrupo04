const jwt = require('jsonwebtoken');

// ...existing code...

// Agrega esto donde generes el token, por ejemplo en loginUsuario y loginConGoogle
function generarToken(usuario) {
  return jwt.sign(
    {
      userid: usuario._id,
      correo: usuario.correo,
      tipo: usuario.tipo,
      nombre: usuario.nombre
    },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '7d' }
  );
}

module.exports = { generarToken };
