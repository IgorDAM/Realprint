// Configuración de conexión a la base de datos
const dbConfig = {
    user: 'realprint',
    password: 'realprint123',
    connectString: 'localhost:1521/XE',
    poolMin: 2,
    poolMax: 5,
    poolIncrement: 1
};

// Función para obtener una conexión
async function getConnection() {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        return connection;
    } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
        throw err;
    }
}

// Función para ejecutar consultas
async function executeQuery(sql, params = []) {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(sql, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
    } catch (err) {
        console.error('Error al ejecutar consulta:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar conexión:', err);
            }
        }
    }
}

// Función para autenticar usuarios
async function authenticateUser(email, password) {
    const sql = `
        SELECT u.id_usuario, u.nombre, r.nombre_rol
        FROM tusuario u
        JOIN tusuario_roles ur ON u.id_usuario = ur.id_usuario
        JOIN troles r ON ur.id_rol = r.id_rol
        WHERE u.correo = :email AND u.contrasena = :password
    `;
    
    try {
        const result = await executeQuery(sql, [email, password]);
        return result.length > 0 ? result[0] : null;
    } catch (err) {
        console.error('Error en autenticación:', err);
        throw err;
    }
}

// Función para obtener pedidos de un usuario
async function getUserOrders(userId) {
    const sql = `
        SELECT p.*, pr.nombre_producto, pr.precio_venta
        FROM tpedido p
        JOIN tproducto pr ON p.id_producto = pr.id_producto
        WHERE p.id_usuario = :userId
        ORDER BY p.fecha_pedido DESC
    `;
    
    try {
        return await executeQuery(sql, [userId]);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        throw err;
    }
}

// Función para crear un nuevo pedido
async function createOrder(orderData) {
    const sql = `
        BEGIN
            crear_pedido(
                :p_id_usuario,
                :p_id_producto,
                :p_cantidad,
                :p_precio_unitario,
                :p_resultado
            );
        END;
    `;
    
    try {
        const result = await executeQuery(sql, [
            orderData.userId,
            orderData.productId,
            orderData.quantity,
            orderData.unitPrice,
            { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        ]);
        return result;
    } catch (err) {
        console.error('Error al crear pedido:', err);
        throw err;
    }
}

// Exportar funciones
module.exports = {
    getConnection,
    executeQuery,
    authenticateUser,
    getUserOrders,
    createOrder
}; 