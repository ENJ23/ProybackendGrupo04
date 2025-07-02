const cron = require('node-cron');
const Reserva = require('../models/Reserva');
const { enviarRecordatorioEmail } = require('../services/email/strategies/emailService');

// Ejecuta todos los días a las 10:00 AM
cron.schedule('0 10 * * *', { timezone: 'America/Argentina/Buenos_Aires' }, async () => {
    try {
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      const fecha = mañana.toISOString().split('T')[0];
  
      const reservas = await Reserva.find({ fecha }).populate('cliente');
  
      for (let r of reservas) {
        const fechaBonita = new Date(`${r.fecha}T${r.horaInicio}`).toLocaleString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          // → 'jueves, 3 de julio de 2025, 20:00'
          
        await enviarRecordatorioEmail({
            email: r.cliente.email,
            nombre: r.cliente.nombre,
            cancha: r.cancha.nombre,
            fecha: fechaBonita,
            horaInicio: r.horaInicio
        }); 
      }
    } catch (error) {
      console.error('❌ Error al enviar recordatorios:', error);
    }
  });
  
