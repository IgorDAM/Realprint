const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para ejecutar consultas
const query = async (sql, params) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return [rows];
    } catch (error) {
        console.error('Error en la consulta:', error);
        throw error;
    }
};

module.exports = {
    pool,
    query
}; 