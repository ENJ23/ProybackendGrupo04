const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("694732029000-2spfvr38jrm751h35ptm39atgs82bhhq.apps.googleusercontent.com");

// Crear un nuevo usuario (POST)
const crearUsuario = async (req, res, next) => {
  /*
    #swagger.tags = ['Usuarios']
    #swagger.summary = 'Crear un nuevo usuario'
    #swagger.description = 'Crea un usuario nuevo en la base de datos.'
    #swagger.parameters['body'] = {oi
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
    // Verificar que no exista otro usuario con ese correo
    const existe = await Usuario.findOne({ correo: req.body.correo });
    if (existe) {
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    req.body.contraseña = await bcrypt.hash(req.body.contraseña, salt);
    req.body.proveedor = 'manual';

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
  const { correo, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });

    if (!usuario || usuario.proveedor !== 'manual') {
      return res.status(401).json({ status: 0, msg: "Usuario no encontrado o no válido para login manual" });
    }

    const validPass = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!validPass) {
      return res.status(401).json({ status: 0, msg: "Contraseña incorrecta" });
    }

    res.json({
      status: 1,
      msg: "Login exitoso",
      nombre: usuario.nombre,
      correo: usuario.correo,
      tipo: usuario.tipo,
      userid: usuario._id
    });
  } catch (error) {
    res.status(500).json({ status: 0, msg: "Error interno del servidor" });
  }
};

const loginConGoogle = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: "694732029000-2spfvr38jrm751h35ptm39atgs82bhhq.apps.googleusercontent.com"
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const nombre = payload.given_name;
    const apellido = payload.family_name || "";

    let usuario = await Usuario.findOne({ correo: email });

    if (!usuario) {
      usuario = new Usuario({
        nombre,
        apellido,
        correo: email,
        contraseña: '-', // no se usa
        proveedor: 'google',
        tipo: 'Cliente'
      });
      await usuario.save();
    }

    res.json({
      success: true,
      message: 'Login con Google exitoso',
      correo: usuario.correo,
      tipo: usuario.tipo,
      userid: usuario._id
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido de Google'
    });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  loginUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginConGoogle
};