-- Script de instalación de RealPrint
-- Este script debe ejecutarse en el siguiente orden:

-- 1. Crear tablas básicas
@TUSUARIO_1.sql
@TMATERIAL_2.sql
@TPRODUCTO_3.sql
@TPEDIDO_4.sql

-- 2. Crear tablas de roles y permisos
@TROLES_1.sql

-- 3. Crear tablas de proveedores
@TPROVEEDORES_2.sql

-- 4. Crear tablas de producción
@TPRODUCCION_3.sql

-- 5. Crear tablas económicas
@TECONOMICA_4.sql

-- 6. Crear tablas de documentos
@TDOCUMENTOS_5.sql

-- 7. Insertar datos iniciales
@DATOS_INICIALES_6.sql

-- 8. Crear procedimientos almacenados
@PROCEDIMIENTOS_7.sql

-- 9. Crear triggers
@TRIGGERS_8.sql

-- 10. Crear vistas
@VISTAS_9.sql

-- Mensaje de finalización
BEGIN
    DBMS_OUTPUT.PUT_LINE('=========================================');
    DBMS_OUTPUT.PUT_LINE('Instalación de RealPrint completada');
    DBMS_OUTPUT.PUT_LINE('=========================================');
    DBMS_OUTPUT.PUT_LINE('Base de datos creada correctamente');
    DBMS_OUTPUT.PUT_LINE('Datos iniciales insertados');
    DBMS_OUTPUT.PUT_LINE('Procedimientos y triggers creados');
    DBMS_OUTPUT.PUT_LINE('Vistas generadas');
    DBMS_OUTPUT.PUT_LINE('=========================================');
END;
/ 