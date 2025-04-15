CREATE TABLE tmaquinas(
    id_maquina VARCHAR2(3) PRIMARY KEY,
    nombre VARCHAR2(30) NOT NULL,
    tipo VARCHAR2(20) NOT NULL,
    estado VARCHAR2(15) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'en_uso', 'mantenimiento', 'averiada')),
    ultimo_mantenimiento DATE,
    proximo_mantenimiento DATE
);

CREATE TABLE tprogramacion_produccion(
    id_programacion VARCHAR2(4) PRIMARY KEY,
    id_pedido VARCHAR2(4),
    id_maquina VARCHAR2(3),
    id_usuario_responsable VARCHAR2(3),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR2(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'en_proceso', 'completado', 'cancelado')),
    prioridad NUMBER(1) CHECK (prioridad BETWEEN 1 AND 5),
    observaciones VARCHAR2(200),
    CONSTRAINT fk_programacion_pedido FOREIGN KEY (id_pedido) REFERENCES tpedido(id_pedido),
    CONSTRAINT fk_programacion_maquina FOREIGN KEY (id_maquina) REFERENCES tmaquinas(id_maquina),
    CONSTRAINT fk_programacion_usuario FOREIGN KEY (id_usuario_responsable) REFERENCES tusuario(id_usuario),
    CONSTRAINT ck_fechas_programacion CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE tincidencias(
    id_incidencia VARCHAR2(4) PRIMARY KEY,
    id_programacion VARCHAR2(4),
    tipo VARCHAR2(20) NOT NULL,
    descripcion VARCHAR2(200) NOT NULL,
    gravedad VARCHAR2(10) CHECK (gravedad IN ('baja', 'media', 'alta', 'critica')),
    estado VARCHAR2(15) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'en_proceso', 'resuelta', 'cerrada')),
    fecha_apertura DATE DEFAULT SYSDATE,
    fecha_resolucion DATE,
    id_usuario_reporta VARCHAR2(3),
    id_usuario_resuelve VARCHAR2(3),
    CONSTRAINT fk_incidencia_programacion FOREIGN KEY (id_programacion) REFERENCES tprogramacion_produccion(id_programacion),
    CONSTRAINT fk_incidencia_usuario_reporta FOREIGN KEY (id_usuario_reporta) REFERENCES tusuario(id_usuario),
    CONSTRAINT fk_incidencia_usuario_resuelve FOREIGN KEY (id_usuario_resuelve) REFERENCES tusuario(id_usuario)
); 