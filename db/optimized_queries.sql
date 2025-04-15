-- Índices para mejorar el rendimiento
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_maquinas_estado ON maquinas(estado);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Consultas optimizadas

-- Obtener tareas pendientes con información de pedido
SELECT t.*, p.cliente_id, p.fecha_entrega
FROM tareas t
JOIN pedidos p ON t.pedido_id = p.id
WHERE t.estado = 'pendiente'
ORDER BY p.fecha_entrega ASC
LIMIT 100;

-- Obtener estadísticas de producción
SELECT 
    DATE_TRUNC('day', t.fecha_inicio) as fecha,
    COUNT(*) as total_tareas,
    SUM(CASE WHEN t.estado = 'completada' THEN 1 ELSE 0 END) as tareas_completadas,
    AVG(t.progreso) as promedio_progreso
FROM tareas t
WHERE t.fecha_inicio >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', t.fecha_inicio)
ORDER BY fecha DESC;

-- Obtener máquinas con alertas activas
SELECT m.*, COUNT(a.id) as alertas_activas
FROM maquinas m
LEFT JOIN alertas a ON m.id = a.maquina_id AND a.estado = 'activa'
GROUP BY m.id
HAVING COUNT(a.id) > 0;

-- Optimización de consulta de pedidos
SELECT p.*, 
       c.nombre as cliente_nombre,
       COUNT(t.id) as total_tareas,
       SUM(CASE WHEN t.estado = 'completada' THEN 1 ELSE 0 END) as tareas_completadas
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id
LEFT JOIN tareas t ON p.id = t.pedido_id
WHERE p.estado = 'en_proceso'
GROUP BY p.id, c.nombre
ORDER BY p.fecha_entrega ASC;

-- Consulta optimizada para reportes
WITH estadisticas AS (
    SELECT 
        DATE_TRUNC('month', t.fecha_inicio) as mes,
        m.tipo as tipo_maquina,
        COUNT(*) as total_tareas,
        AVG(t.progreso) as promedio_progreso,
        SUM(CASE WHEN t.estado = 'completada' THEN 1 ELSE 0 END) as tareas_completadas
    FROM tareas t
    JOIN maquinas m ON t.maquina_id = m.id
    WHERE t.fecha_inicio >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', t.fecha_inicio), m.tipo
)
SELECT 
    mes,
    tipo_maquina,
    total_tareas,
    promedio_progreso,
    tareas_completadas,
    (tareas_completadas::float / total_tareas) * 100 as porcentaje_completado
FROM estadisticas
ORDER BY mes DESC, tipo_maquina; 