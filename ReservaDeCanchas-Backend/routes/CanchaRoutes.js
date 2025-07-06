const express = require('express');
const router = express.Router();
const CanchaController = require('../controllers/CanchaController');
const jwt = require('jsonwebtoken');

// Middleware para permitir solo a encargados
function soloEncargado(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token inválido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    if (decoded.tipo !== 'Encargado') {
      return res.status(403).json({ message: 'Solo los encargados pueden realizar esta acción' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

router.post('/', soloEncargado, CanchaController.crearCancha);
router.get('/', CanchaController.obtenerCanchas);
router.get('/:id', CanchaController.obtenerCanchaPorId);
router.put('/:id', soloEncargado, CanchaController.actualizarCancha);
router.delete('/:id', soloEncargado, CanchaController.eliminarCancha);

module.exports = router;