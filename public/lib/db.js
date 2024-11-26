import mysql from 'mysql2';

// Configuración de la conexión a la base de datos utilizando las variables de entorno
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Exportar la conexión para usarla en otros archivos
export default connection;
