CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('ADM', 'EMP', 'CLI') NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME,
    estado ENUM('activo', 'inactivo', 'bloqueado') DEFAULT 'activo',
    notify_email BOOLEAN DEFAULT TRUE,
    notify_sms BOOLEAN DEFAULT FALSE,
    language VARCHAR(2) DEFAULT 'es'
);

CREATE TABLE clientes (
    id_cliente INT PRIMARY KEY,
    empresa VARCHAR(100),
    cif VARCHAR(20),
    direccion VARCHAR(200),
    ciudad VARCHAR(50),
    codigo_postal VARCHAR(10),
    pais VARCHAR(50) DEFAULT 'España',
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario)
);

DESC tusuario;

SELECT * FROM tusuario;

DELETE FROM tusuario;

DROP TABLE tmaterial;
