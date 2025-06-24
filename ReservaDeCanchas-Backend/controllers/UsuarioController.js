const Usuario = require('../models/Usuario');

// Crear un nuevo usuario (POST)
const crearUsuario = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Crear un nuevo usuario'
    #swagger.description = 'Crea un usuario nuevo en la base de datos.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del usuario a crear',
      required: true,
      schema: { $ref: '#/definitions/Usuario' }
    }
    #swagger.responses[201] = {
      description: 'Usuario creado exitosamente',
      schema: { $ref: '#/definitions/Usuario' }
    }
  */
  try {
    const nuevoUsuario = new Usuario(req.body);
    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuarioGuardado
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los usuarios (GET)
const obtenerUsuarios = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Obtener todos los usuarios'
    #swagger.description = 'Retorna una lista de todos los usuarios registrados.'
    #swagger.responses[200] = {
      description: 'Lista de usuarios obtenida con éxito.',
      schema: { $ref: '#/definitions/Usuario' }
    }
  */
  try {
    const usuarios = await Usuario.find();
    res.status(200).json({
      success: true,
      message: 'Usuarios recuperados exitosamente',
      count: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID (GET)
const obtenerUsuarioPorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Obtener un usuario por ID'
    #swagger.parameters['id'] = { description: 'ID del usuario', required: true }
    #swagger.responses[200] = {
      description: 'Usuario encontrado',
      schema: { $ref: '#/definitions/Usuario' }
    }
    #swagger.responses[404] = { description: 'Usuario no encontrado' }
  */
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Usuario encontrado',
      data: usuario
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario (PUT)
const actualizarUsuario = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Actualizar un usuario'
    #swagger.parameters['id'] = { description: 'ID del usuario', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del usuario a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Usuario' }
    }
    #swagger.responses[200] = {
      description: 'Usuario actualizado exitosamente',
      schema: { $ref: '#/definitions/Usuario' }
    }
    #swagger.responses[404] = { description: 'Usuario no encontrado' }
  */
  try {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario (DELETE)
const eliminarUsuario = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Eliminar un usuario'
    #swagger.parameters['id'] = { description: 'ID del usuario', required: true }
    #swagger.responses[200] = { description: 'Usuario eliminado exitosamente' }
    #swagger.responses[404] = { description: 'Usuario no encontrado' }
  */
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: usuarioEliminado
    });
  } catch (error) {
    next(error);
  }
};

const loginUsuario = async (req, res) => {
  const criteria = {
    correo: req.body.correo, 
    contraseña: req.body.contraseña
  }
  try {
    const user = await Usuario.findOne(criteria);
    if(!user){
      res.json({
        status: 0,
        msg: "not found"
      })
    }else{
      res.json({
        status: 1,
        msg: "Success",
        correo: user.correo,
        tipo: user.tipo,
        userid: user._id
      })
    }
  } catch (error) {
    res.json({
      status: 0,
      msg: "error"
    })
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario
};