CREATE TABLE tdocumentos(
    id_documento VARCHAR2(4) PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    tipo VARCHAR2(20) NOT NULL,
    ruta_archivo VARCHAR2(200) NOT NULL,
    tamano NUMBER(10),
    fecha_subida DATE DEFAULT SYSDATE,
    id_usuario_subida VARCHAR2(3),
    estado VARCHAR2(10) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    CONSTRAINT fk_documento_usuario FOREIGN KEY (id_usuario_subida) REFERENCES tusuario(id_usuario)
);

CREATE TABLE tdocumentos_pedido(
    id_documento VARCHAR2(4),
    id_pedido VARCHAR2(4),
    tipo_relacion VARCHAR2(20) CHECK (tipo_relacion IN ('diseño', 'factura', 'contrato', 'otro')),
    CONSTRAINT pk_documentos_pedido PRIMARY KEY (id_documento, id_pedido),
    CONSTRAINT fk_doc_pedido_documento FOREIGN KEY (id_documento) REFERENCES tdocumentos(id_documento),
    CONSTRAINT fk_doc_pedido_pedido FOREIGN KEY (id_pedido) REFERENCES tpedido(id_pedido)
);

CREATE TABLE tcompartir_documentos(
    id_compartir VARCHAR2(4) PRIMARY KEY,
    id_documento VARCHAR2(4),
    id_usuario_destino VARCHAR2(3),
    permisos VARCHAR2(10) CHECK (permisos IN ('lectura', 'escritura', 'completo')),
    fecha_compartido DATE DEFAULT SYSDATE,
    fecha_expiracion DATE,
    estado VARCHAR2(10) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    CONSTRAINT fk_compartir_documento FOREIGN KEY (id_documento) REFERENCES tdocumentos(id_documento),
    CONSTRAINT fk_compartir_usuario FOREIGN KEY (id_usuario_destino) REFERENCES tusuario(id_usuario),
    CONSTRAINT ck_fechas_compartir CHECK (fecha_expiracion IS NULL OR fecha_expiracion > fecha_compartido)
);

CREATE TABLE tbackups(
    id_backup VARCHAR2(4) PRIMARY KEY,
    fecha_backup DATE DEFAULT SYSDATE,
    tipo VARCHAR2(20) CHECK (tipo IN ('completo', 'incremental', 'diferencial')),
    ruta_archivo VARCHAR2(200) NOT NULL,
    tamano NUMBER(10),
    estado VARCHAR2(10) DEFAULT 'completado' CHECK (estado IN ('completado', 'fallido', 'en_proceso')),
    observaciones VARCHAR2(200)
); 