// Configuración de la conexión a la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'realprint',
    port: 3306
};

// Función para obtener una conexión
async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }
}

// Función para ejecutar consultas
async function executeQuery(query, params = []) {
    const connection = await getConnection();
    try {
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Función para autenticar usuarios
async function authenticateUser(email, password) {
    try {
        const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
        const results = await executeQuery(query, [email, password]);
        return results[0] || null;
    } catch (error) {
        console.error('Error en autenticación:', error);
        throw error;
    }
}

// Función para obtener pedidos de un cliente
async function getClientOrders(clientId) {
    try {
        const query = `
            SELECT p.*, c.nombre, c.apellidos 
            FROM pedidos p 
            JOIN clientes c ON p.id_cliente = c.id_cliente 
            WHERE p.id_cliente = ?
        `;
        return await executeQuery(query, [clientId]);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        throw error;
    }
}

// Función para crear un nuevo pedido
async function createOrder(orderData) {
    try {
        const query = `
            INSERT INTO pedidos (id_cliente, estado, total) 
            VALUES (?, ?, ?)
        `;
        const result = await executeQuery(query, [
            orderData.clientId,
            'pendiente',
            orderData.total
        ]);
        return result.insertId;
    } catch (error) {
        console.error('Error al crear pedido:', error);
        throw error;
    }
}

// Exportar funciones
module.exports = {
    getConnection,
    executeQuery,
    authenticateUser,
    getClientOrders,
    createOrder
}; 