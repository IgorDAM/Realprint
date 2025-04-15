const jwt = require('jsonwebtoken');
const db = require('../db/conexion');

// Verificar token JWT
const verificarToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Verificar rol del usuario
const verificarRol = (rolRequerido) => {
    return async (req, res, next) => {
        try {
            const [usuario] = await db.query(`
                SELECT rol 
                FROM usuarios 
                WHERE id_usuario = ?
            `, [req.usuario.id]);

            if (!usuario || usuario.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            if (usuario[0].rol !== rolRequerido) {
                return res.status(403).json({ error: 'No tiene permisos para acceder a este recurso' });
            }

            next();
        } catch (error) {
            console.error('Error al verificar rol:', error);
            res.status(500).json({ error: 'Error al verificar rol' });
        }
    };
};

module.exports = {
    verificarToken,
    verificarRol
}; 