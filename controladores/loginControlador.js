const clientesModelo = require('../modelos/clientesModelo');
const db = require('../config/db');

// Autenticar Cliente
const autenticarCliente = (correo, contrasena, callback) => {
    const sql = `SELECT * FROM clientes WHERE correo = ? AND contrasena = ?`;

    db.query(sql, [correo, contrasena], (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return callback('database'); // Mensaje de error genérico
        }
        if (result.length > 0) {
            callback(null, result[0]);  // Usuario encontrado
        } else {
            callback(null, null);  // Usuario no encontrado
        }
    });
};

// Iniciar sesión
const iniciarSesion = (req, res) => {
    const { correo, contrasena } = req.body;

    // Validar que se hayan proporcionado el correo y la contraseña
    if (!correo || !contrasena) {
        return res.redirect('/error.html?error=required'); // Redirigir a la página de error
    }

    // Autenticar al cliente
    clientesModelo.autenticarCliente(correo, contrasena, (err, usuario) => {
        if (err) {
            console.error(err); // Log del error
            return res.redirect('/error.html?error=database'); // Redirigir a una página de error de base de datos
        }
        if (!usuario) {
            return res.redirect('/error.html?error=invalid'); // Redirigir a la página de error de credenciales inválidas
        }

        // Guardar información del cliente en la sesión
        req.session.usuario = {
            clienteId: usuario.clienteId,
            nombres: usuario.nombres,
            correo: usuario.correo
        };

        // Redirigir a la página de cotización después de iniciar sesión
        res.redirect('/cotizar');
    });
};

// Cerrar sesión
const cerrarSesion = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err); // Log del error
            return res.redirect('/error.html?error=logout'); // Redirigir a una página de error al cerrar sesión
        }
        res.redirect('/login.html');  // Redirigir a la página de inicio de sesión
    });
};

module.exports = {
    iniciarSesion,
    autenticarCliente,
    cerrarSesion
};