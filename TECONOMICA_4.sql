CREATE TABLE tfacturas(
    id_factura VARCHAR2(4) PRIMARY KEY,
    id_pedido VARCHAR2(4),
    fecha_emision DATE DEFAULT SYSDATE,
    fecha_vencimiento DATE,
    estado VARCHAR2(15) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'cancelada', 'vencida')),
    subtotal NUMBER(8,2) NOT NULL,
    iva NUMBER(5,2) DEFAULT 21,
    total NUMBER(8,2) NOT NULL,
    metodo_pago VARCHAR2(20),
    observaciones VARCHAR2(200),
    CONSTRAINT fk_factura_pedido FOREIGN KEY (id_pedido) REFERENCES tpedido(id_pedido),
    CONSTRAINT ck_fechas_factura CHECK (fecha_vencimiento > fecha_emision)
);

CREATE TABLE tpagos(
    id_pago VARCHAR2(4) PRIMARY KEY,
    id_factura VARCHAR2(4),
    fecha_pago DATE DEFAULT SYSDATE,
    importe NUMBER(8,2) NOT NULL,
    metodo_pago VARCHAR2(20) NOT NULL,
    referencia_pago VARCHAR2(50),
    estado VARCHAR2(15) DEFAULT 'confirmado' CHECK (estado IN ('confirmado', 'pendiente', 'rechazado')),
    CONSTRAINT fk_pago_factura FOREIGN KEY (id_factura) REFERENCES tfacturas(id_factura)
);

CREATE TABLE tprecios(
    id_precio VARCHAR2(4) PRIMARY KEY,
    id_producto VARCHAR2(3),
    precio_base NUMBER(6,2) NOT NULL,
    fecha_inicio DATE DEFAULT SYSDATE,
    fecha_fin DATE,
    estado VARCHAR2(10) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    CONSTRAINT fk_precio_producto FOREIGN KEY (id_producto) REFERENCES tproducto(id_producto),
    CONSTRAINT ck_fechas_precio CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
);

CREATE TABLE tdescuentos(
    id_descuento VARCHAR2(4) PRIMARY KEY,
    codigo VARCHAR2(20) UNIQUE,
    tipo VARCHAR2(15) CHECK (tipo IN ('porcentaje', 'cantidad_fija')),
    valor NUMBER(5,2) NOT NULL,
    fecha_inicio DATE DEFAULT SYSDATE,
    fecha_fin DATE,
    minimo_compra NUMBER(8,2),
    maximo_descuento NUMBER(8,2),
    estado VARCHAR2(10) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    CONSTRAINT ck_fechas_descuento CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
); 