const cotizarModelo = require('../modelos/cotizarModelo');
const { sendMail } = require('../config/mailer');

const cotizarControlador = {
    crearCotizacion: async (req) => {
        const clienteId = req.session.usuario.clienteId;
        if (!clienteId) {
            throw new Error('clienteId no está definido en la sesión.');
        }

        const nuevaCotizacion = {
            personas: req.body.personas,
            evento: req.body.evento,
            fecha: req.body.fecha,
            hora: req.body.hora,
            buffet: req.body.buffet,
            carne: req.body.carne,
            arroz: req.body.arroz,
            bebida: req.body.bebida,
            postre: req.body.postre,
            mesa_dulces: req.body.mesa_dulces,
            decoracion: req.body.decoracion,
            alquiler: req.body.alquiler,
            musica: req.body.musica,
            total: req.body.total,
            clienteId: clienteId,
        };

        // Validar fecha
        const fechaActual = new Date();
        const fechaReserva = new Date(nuevaCotizacion.fecha);
        const dosSemanas = 14 * 24 * 60 * 60 * 1000; // 14 días en milisegundos

        if (
            fechaReserva <= fechaActual || // Fecha es hoy o en el pasado
            fechaReserva - fechaActual < dosSemanas // Fecha está dentro de las próximas dos semanas
        ) {
            throw new Error('La fecha seleccionada no es válida.');
        }

        // Verificar si ya existe una cotización para la misma fecha
        const existeCotizacion = await cotizarModelo.verificarCotizacion(clienteId, nuevaCotizacion.fecha);
        if (existeCotizacion) {
            throw new Error('Ya existe una cotización para esta fecha.');
        }

        try {
            const resultado = await cotizarModelo.crearCotizacion(nuevaCotizacion);

            const emailCliente = req.session.usuario.correo;
            const subject = '¡Reserva Confirmada!';
            const html = `
                <div style="font-family: Arial, sans-serif; color: #444; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                    <h2>¡Reserva Confirmada!</h2>
                    <p>Hola ${req.session.usuario.nombres},</p>
                    <p>Detalles:</p>
                    <ul>
                        <li><strong>Evento:</strong> ${nuevaCotizacion.evento}</li>
                        <li><strong>Fecha:</strong> ${nuevaCotizacion.fecha}</li>
                        <li><strong>Total:</strong> $${nuevaCotizacion.total}</li>
                    </ul>
                </div>`;
            await sendMail(emailCliente, subject, html);

            return resultado;
        } catch (err) {
            console.error('Error al registrar la cotización:', err);
            throw err;
        }
    },
};

module.exports = cotizarControlador;
