CREATE TABLE tproveedores(
    id_proveedor VARCHAR2(3) PRIMARY KEY,
    nombre VARCHAR2(50) NOT NULL,
    direccion VARCHAR2(100),
    telefono NUMBER(9) UNIQUE,
    email VARCHAR2(50) UNIQUE,
    contacto_principal VARCHAR2(50),
    fecha_registro DATE DEFAULT SYSDATE,
    estado VARCHAR2(10) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    CONSTRAINT ck_telefono_proveedor CHECK (telefono BETWEEN 600000000 AND 799999999)
);

CREATE TABLE tvaloraciones_proveedor(
    id_valoracion VARCHAR2(4) PRIMARY KEY,
    id_proveedor VARCHAR2(3),
    puntualidad NUMBER(2) CHECK (puntualidad BETWEEN 1 AND 10),
    calidad NUMBER(2) CHECK (calidad BETWEEN 1 AND 10),
    precio NUMBER(2) CHECK (precio BETWEEN 1 AND 10),
    comentarios VARCHAR2(200),
    fecha_valoracion DATE DEFAULT SYSDATE,
    id_usuario VARCHAR2(3),
    CONSTRAINT fk_valoracion_proveedor FOREIGN KEY (id_proveedor) REFERENCES tproveedores(id_proveedor),
    CONSTRAINT fk_valoracion_usuario FOREIGN KEY (id_usuario) REFERENCES tusuario(id_usuario)
);

CREATE TABLE tproductos_proveedor(
    id_producto_proveedor VARCHAR2(4) PRIMARY KEY,
    id_proveedor VARCHAR2(3),
    id_material VARCHAR2(3),
    nombre_producto VARCHAR2(50) NOT NULL,
    descripcion VARCHAR2(200),
    precio_unitario NUMBER(6,2) CHECK (precio_unitario > 0),
    tiempo_entrega NUMBER(3),
    CONSTRAINT fk_producto_proveedor_proveedor FOREIGN KEY (id_proveedor) REFERENCES tproveedores(id_proveedor),
    CONSTRAINT fk_producto_proveedor_material FOREIGN KEY (id_material) REFERENCES tmaterial(id_material)
); 