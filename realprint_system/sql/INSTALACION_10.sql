-- Script de instalación de RealPrint
-- Este script debe ejecutarse en el siguiente orden:

-- 1. Crear tablas básicas
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('ADM', 'EMP', 'CLI') NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME,
    estado ENUM('activo', 'inactivo', 'bloqueado') DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT PRIMARY KEY,
    empresa VARCHAR(100),
    cif VARCHAR(20),
    direccion VARCHAR(200),
    ciudad VARCHAR(50),
    codigo_postal VARCHAR(10),
    pais VARCHAR(50) DEFAULT 'España',
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario)
);

-- 2. Crear roles y permisos
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS rol_permiso (
    id_rol INT,
    id_permiso INT,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso)
);

-- 3. Crear tablas de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    tipo ENUM('material', 'servicio') NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo'
);

-- 4. Crear tablas de producción
CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'en_proceso', 'completado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

-- 5. Crear tablas económicas
CREATE TABLE IF NOT EXISTS facturas (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'pagada', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

-- 6. Crear tablas de documentos
CREATE TABLE IF NOT EXISTS documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    tipo ENUM('diseño', 'factura', 'contrato') NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

-- 7. Insertar datos iniciales
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso total al sistema'),
('Empleado', 'Acceso a módulos de producción'),
('Cliente', 'Acceso a pedidos y perfil');

INSERT INTO permisos (nombre, descripcion) VALUES
('gestion_usuarios', 'Gestionar usuarios del sistema'),
('gestion_pedidos', 'Gestionar pedidos'),
('ver_reportes', 'Ver reportes y estadísticas'),
('gestion_inventario', 'Gestionar inventario');

-- 8. Crear procedimientos almacenados
DELIMITER //

CREATE PROCEDURE sp_crear_usuario(
    IN p_nombre VARCHAR(50),
    IN p_apellidos VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_rol ENUM('ADM', 'EMP', 'CLI')
)
BEGIN
    INSERT INTO usuarios (nombre, apellidos, email, password, rol)
    VALUES (p_nombre, p_apellidos, p_email, p_password, p_rol);
END //

CREATE PROCEDURE sp_actualizar_estado_pedido(
    IN p_id_pedido INT,
    IN p_estado ENUM('pendiente', 'en_proceso', 'completado', 'cancelado')
)
BEGIN
    UPDATE pedidos SET estado = p_estado WHERE id_pedido = p_id_pedido;
END //

DELIMITER ;

-- 9. Crear triggers
DELIMITER //

CREATE TRIGGER tr_actualizar_ultimo_acceso
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    IF NEW.ultimo_acceso IS NULL THEN
        SET NEW.ultimo_acceso = CURRENT_TIMESTAMP;
    END IF;
END //

DELIMITER ;

-- 10. Crear vistas
CREATE VIEW vw_pedidos_activos AS
SELECT p.id_pedido, c.nombre, c.apellidos, p.fecha_pedido, p.estado, p.total
FROM pedidos p
JOIN clientes c ON p.id_cliente = c.id_cliente
WHERE p.estado IN ('pendiente', 'en_proceso');

-- Mensaje de finalización
SELECT 'Instalación completada correctamente' AS mensaje; 