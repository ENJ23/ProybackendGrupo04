const cron = require('node-cron');
const Reserva = require('./models/Reserva');
const Cliente = require('./models/Cliente');
const { enviarRecordatorioEmail } = require('../services/emailServiceResend');

// Ejecuta todos los días a las 10:00 AM
cron.schedule('0 10 * * *', async () => {
  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const fecha = mañana.toISOString().split('T')[0]; // formato YYYY-MM-DD

  const reservas = await Reserva.find({ fecha }).populate('cliente');
  for (let r of reservas) {
    await enviarRecordatorioEmail(r.cliente.email, r.cliente.nombre, r.fecha, r.horaInicio);
  }
});
