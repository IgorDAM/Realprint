-- Insertar roles básicos
INSERT INTO troles (id_rol, nombre_rol, descripcion, nivel_acceso) VALUES ('ADM', 'Administrador', 'Acceso total al sistema', 5);
INSERT INTO troles (id_rol, nombre_rol, descripcion, nivel_acceso) VALUES ('JEF', 'Jefe de Sección', 'Gestión de producción y pedidos', 4);
INSERT INTO troles (id_rol, nombre_rol, descripcion, nivel_acceso) VALUES ('OPE', 'Operario', 'Gestión de tareas asignadas', 3);
INSERT INTO troles (id_rol, nombre_rol, descripcion, nivel_acceso) VALUES ('CLI', 'Cliente', 'Acceso a pedidos y documentos', 2);

-- Insertar permisos básicos
INSERT INTO tpermisos (id_permiso, nombre_permiso, descripcion, modulo) VALUES ('USR', 'Gestión de Usuarios', 'Crear, editar y eliminar usuarios', 'USUARIOS');
INSERT INTO tpermisos (id_permiso, nombre_permiso, descripcion, modulo) VALUES ('PED', 'Gestión de Pedidos', 'Crear y gestionar pedidos', 'PEDIDOS');
INSERT INTO tpermisos (id_permiso, nombre_permiso, descripcion, modulo) VALUES ('PRO', 'Gestión de Producción', 'Programar y gestionar producción', 'PRODUCCION');
INSERT INTO tpermisos (id_permiso, nombre_permiso, descripcion, modulo) VALUES ('FAC', 'Gestión de Facturas', 'Crear y gestionar facturas', 'FACTURACION');

-- Asignar permisos a roles
INSERT INTO trol_permisos (id_rol, id_permiso) VALUES ('ADM', 'USR');
INSERT INTO trol_permisos (id_rol, id_permiso) VALUES ('ADM', 'PED');
INSERT INTO trol_permisos (id_rol, id_permiso) VALUES ('ADM', 'PRO');
INSERT INTO trol_permisos (id_rol, id_permiso) VALUES ('ADM', 'FAC');
INSERT INTO trol_permisos (id_rol, id_permiso) VALUES ('JEF', 'PED');
INSERT INTO trol_permisos (id_rol, id_permiso) VALUES ('JEF', 'PRO');
INSERT INTO trol_permisos (id_rol, id_permiso) VALUES ('OPE', 'PRO');
INSERT INTO trol_permisos (id_rol, id_permiso) VALUES ('CLI', 'PED');

-- Insertar usuario administrador
INSERT INTO tusuario (id_usuario, nombre, correo, telefono) VALUES ('001', 'Admin', 'admin@realprint.com', 600000001);
INSERT INTO tusuario_roles (id_usuario, id_rol) VALUES ('001', 'ADM');

-- Insertar materiales básicos
INSERT INTO tmaterial (id_material, nombre_material, provedor, stock, unidad_medida, precio_actual, descripcion) 
VALUES ('001', 'Tinta DTF Negro', 'Proveedor1', 100, 'litros', 25.50, 'Tinta para impresión DTF color negro');
INSERT INTO tmaterial (id_material, nombre_material, provedor, stock, unidad_medida, precio_actual, descripcion) 
VALUES ('002', 'Film DTF', 'Proveedor2', 50, 'rollos', 45.75, 'Film para transferencia DTF');

-- Insertar productos básicos
INSERT INTO tproducto (id_producto, nombre_producto, precio_venta, descripcion, id_material_principal) 
VALUES ('001', 'Camiseta Básica', 15.99, 'Camiseta de algodón 100%', '001');
INSERT INTO tproducto (id_producto, nombre_producto, precio_venta, descripcion, id_material_principal) 
VALUES ('002', 'Taza Personalizada', 8.99, 'Taza cerámica con impresión DTF', '002');

-- Insertar máquinas
INSERT INTO tmaquinas (id_maquina, nombre, tipo, estado, ultimo_mantenimiento, proximo_mantenimiento) 
VALUES ('001', 'Impresora DTF 1', 'DTF', 'disponible', SYSDATE-30, SYSDATE+30);
INSERT INTO tmaquinas (id_maquina, nombre, tipo, estado, ultimo_mantenimiento, proximo_mantenimiento) 
VALUES ('002', 'Prensa Térmica 1', 'Prensa', 'disponible', SYSDATE-15, SYSDATE+45); 