const Reserva = require('../models/Reserva');

// Crear una nueva reserva (POST)
const crearReserva = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Crear una nueva reserva'
    #swagger.description = 'Crea una reserva nueva en la base de datos.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos de la reserva a crear',
      required: true,
      schema: { $ref: '#/definitions/Reserva' }
    }
    #swagger.responses[201] = {
      description: 'Reserva creada exitosamente',
      schema: { $ref: '#/definitions/Reserva' }
    }
  */
  try {
    const nuevaReserva = new Reserva(req.body);
    const reservaGuardada = await nuevaReserva.save();
    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: reservaGuardada
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las reservas (GET)
const obtenerReservas = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Obtener todas las reservas'
    #swagger.description = 'Retorna una lista de todas las reservas registradas.'
    #swagger.responses[200] = {
      description: 'Lista de reservas obtenida con éxito.',
      schema: { $ref: '#/definitions/Reserva' }
    }
  */
  try {
    const reservas = await Reserva.find()
      .populate('horariosReservados')
      .populate('cancha')
      .populate('cliente')
      .populate('pago');
    res.status(200).json({
      success: true,
      message: 'Reservas recuperadas exitosamente',
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una reserva por ID (GET)
const obtenerReservaPorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Obtener una reserva por ID'
    #swagger.parameters['id'] = { description: 'ID de la reserva', required: true }
    #swagger.responses[200] = {
      description: 'Reserva encontrada',
      schema: { $ref: '#/definitions/Reserva' }
    }
    #swagger.responses[404] = { description: 'Reserva no encontrada' }
  */
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('horariosReservados')
      .populate('cancha')
      .populate('cliente')
      .populate('pago');
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reserva encontrada',
      data: reserva
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una reserva (PUT)
const actualizarReserva = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Actualizar una reserva'
    #swagger.parameters['id'] = { description: 'ID de la reserva', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos de la reserva a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Reserva' }
    }
    #swagger.responses[200] = {
      description: 'Reserva actualizada exitosamente',
      schema: { $ref: '#/definitions/Reserva' }
    }
    #swagger.responses[404] = { description: 'Reserva no encontrada' }
  */
  try {
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reservaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      data: reservaActualizada
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una reserva (DELETE)
const eliminarReserva = async (req, res, next) => {
  /*
    #swagger.tags = ['Reservas']
    #swagger.summary = 'Eliminar una reserva'
    #swagger.parameters['id'] = { description: 'ID de la reserva', required: true }
    #swagger.responses[200] = { description: 'Reserva eliminada exitosamente' }
    #swagger.responses[404] = { description: 'Reserva no encontrada' }
  */
  try {
    const reservaEliminada = await Reserva.findByIdAndDelete(req.params.id);
    if (!reservaEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Reserva eliminada exitosamente',
      data: reservaEliminada
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  eliminarReserva
};