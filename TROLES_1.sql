CREATE TABLE troles(
    id_rol VARCHAR2(3) PRIMARY KEY,
    nombre_rol VARCHAR2(20) NOT NULL,
    descripcion VARCHAR2(100),
    nivel_acceso NUMBER(1) CHECK (nivel_acceso BETWEEN 1 AND 5)
);

CREATE TABLE tpermisos(
    id_permiso VARCHAR2(3) PRIMARY KEY,
    nombre_permiso VARCHAR2(30) NOT NULL,
    descripcion VARCHAR2(100),
    modulo VARCHAR2(20) NOT NULL
);

CREATE TABLE tusuario_roles(
    id_usuario VARCHAR2(3),
    id_rol VARCHAR2(3),
    fecha_asignacion DATE DEFAULT SYSDATE,
    CONSTRAINT pk_usuario_roles PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_usuario_roles_usuario FOREIGN KEY (id_usuario) REFERENCES tusuario(id_usuario),
    CONSTRAINT fk_usuario_roles_rol FOREIGN KEY (id_rol) REFERENCES troles(id_rol)
);

CREATE TABLE trol_permisos(
    id_rol VARCHAR2(3),
    id_permiso VARCHAR2(3),
    CONSTRAINT pk_rol_permisos PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT fk_rol_permisos_rol FOREIGN KEY (id_rol) REFERENCES troles(id_rol),
    CONSTRAINT fk_rol_permisos_permiso FOREIGN KEY (id_permiso) REFERENCES tpermisos(id_permiso)
); 