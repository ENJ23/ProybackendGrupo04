const { Resend } = require('resend');

// Asegurate de tener la variable RESEND_API_KEY en tu archivo .env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo de recordatorio al cliente.
 * @param {string} to - Email del cliente
 * @param {string} nombre - Nombre del cliente
 * @param {string} fecha - Fecha de la reserva (YYYY-MM-DD)
 * @param {string} hora - Hora de la reserva (ej. "18:00")
 */
async function enviarRecordatorioEmail(to, nombre, fecha, hora) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Dominio verificado o 'onboarding@resend.dev' si estás en modo test
      to,
      subject: 'Recordatorio de tu reserva',
      html: `
        <h2>¡Hola ${nombre}!</h2>
        <p>Te recordamos que tenés una reserva programada para el <strong>${fecha}</strong> a las <strong>${hora}</strong>.</p>
        <p>¡Te esperamos!</p>
        <hr/>
        <small>Este es un mensaje automático, por favor no responder.</small>
      `
    });

    if (error) {
      console.error('❌ Error al enviar el correo:', error);
      return null;
    }

    console.log('📩 Correo enviado a:', to);
    return data;

  } catch (err) {
    console.error('❌ Error inesperado al enviar correo:', err);
    return null;
  }
}

module.exports = { enviarRecordatorioEmail };
