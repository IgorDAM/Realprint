-- Vista para el calendario de producción
CREATE OR REPLACE VIEW v_calendario_produccion AS
SELECT 
    p.id_programacion,
    p.id_pedido,
    pe.id_usuario,
    u.nombre as nombre_usuario,
    p.id_maquina,
    m.nombre as nombre_maquina,
    p.fecha_inicio,
    p.fecha_fin,
    p.estado,
    p.prioridad,
    p.observaciones
FROM tprogramacion_produccion p
JOIN tpedido pe ON p.id_pedido = pe.id_pedido
JOIN tusuario u ON p.id_usuario_responsable = u.id_usuario
JOIN tmaquinas m ON p.id_maquina = m.id_maquina;

-- Vista para el estado de inventario
CREATE OR REPLACE VIEW v_estado_inventario AS
SELECT 
    m.id_material,
    m.nombre_material,
    m.provedor,
    m.stock,
    m.unidad_medida,
    m.precio_actual,
    m.descripcion,
    CASE 
        WHEN m.stock < 10 THEN 'Bajo'
        WHEN m.stock < 50 THEN 'Medio'
        ELSE 'Alto'
    END as nivel_stock
FROM tmaterial m;

-- Vista para el seguimiento de pedidos
CREATE OR REPLACE VIEW v_seguimiento_pedidos AS
SELECT 
    p.id_pedido,
    p.id_usuario,
    u.nombre as nombre_usuario,
    p.id_producto,
    pr.nombre_producto,
    p.cantidad,
    p.fecha_pedido,
    p.estado,
    p.precio_unitario,
    p.cantidad * p.precio_unitario as total_pedido,
    pp.fecha_inicio as fecha_inicio_produccion,
    pp.fecha_fin as fecha_fin_produccion,
    pp.estado as estado_produccion
FROM tpedido p
JOIN tusuario u ON p.id_usuario = u.id_usuario
JOIN tproducto pr ON p.id_producto = pr.id_producto
LEFT JOIN tprogramacion_produccion pp ON p.id_pedido = pp.id_pedido;

-- Vista para reportes financieros
CREATE OR REPLACE VIEW v_reportes_financieros AS
SELECT 
    f.id_factura,
    f.id_pedido,
    p.id_usuario,
    u.nombre as nombre_usuario,
    f.fecha_emision,
    f.fecha_vencimiento,
    f.estado as estado_factura,
    f.subtotal,
    f.iva,
    f.total,
    pa.fecha_pago,
    pa.importe as importe_pagado,
    pa.estado as estado_pago
FROM tfacturas f
JOIN tpedido p ON f.id_pedido = p.id_pedido
JOIN tusuario u ON p.id_usuario = u.id_usuario
LEFT JOIN tpagos pa ON f.id_factura = pa.id_factura;

-- Vista para el catálogo de productos
CREATE OR REPLACE VIEW v_catalogo_productos AS
SELECT 
    p.id_producto,
    p.nombre_producto,
    p.precio_venta,
    p.descripcion,
    m.id_material,
    m.nombre_material,
    m.stock,
    m.unidad_medida,
    m.precio_actual as precio_material
FROM tproducto p
JOIN tmaterial m ON p.id_material_principal = m.id_material;

-- Vista para mostrar información completa de clientes
CREATE VIEW vw_info_clientes AS
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellidos,
    u.email,
    u.telefono,
    u.fecha_registro,
    u.ultimo_acceso,
    u.estado,
    c.empresa,
    c.cif,
    c.direccion,
    c.ciudad,
    c.codigo_postal,
    c.pais,
    u.notify_email,
    u.notify_sms,
    u.language
FROM usuarios u
JOIN clientes c ON u.id_usuario = c.id_cliente
WHERE u.rol = 'CLI';

-- Vista para mostrar pedidos activos de clientes
CREATE VIEW vw_pedidos_activos AS
SELECT 
    p.id_pedido,
    c.id_cliente,
    u.nombre,
    u.apellidos,
    p.fecha_pedido,
    p.estado,
    p.total,
    c.empresa,
    c.direccion,
    c.ciudad,
    c.codigo_postal
FROM pedidos p
JOIN clientes c ON p.id_cliente = c.id_cliente
JOIN usuarios u ON c.id_cliente = u.id_usuario
WHERE p.estado IN ('pendiente', 'en_proceso');

-- Vista para mostrar estadísticas de clientes
CREATE VIEW vw_estadisticas_clientes AS
SELECT 
    c.id_cliente,
    u.nombre,
    u.apellidos,
    c.empresa,
    COUNT(p.id_pedido) AS total_pedidos,
    SUM(CASE WHEN p.estado = 'completado' THEN 1 ELSE 0 END) AS pedidos_completados,
    SUM(CASE WHEN p.estado = 'pendiente' THEN 1 ELSE 0 END) AS pedidos_pendientes,
    SUM(p.total) AS gasto_total,
    MAX(p.fecha_pedido) AS ultimo_pedido
FROM clientes c
JOIN usuarios u ON c.id_cliente = u.id_usuario
LEFT JOIN pedidos p ON c.id_cliente = p.id_cliente
GROUP BY c.id_cliente, u.nombre, u.apellidos, c.empresa; 