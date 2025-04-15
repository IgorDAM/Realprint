-- Procedimiento para crear un nuevo pedido
CREATE OR REPLACE PROCEDURE crear_pedido(
    p_id_usuario IN VARCHAR2,
    p_id_producto IN VARCHAR2,
    p_cantidad IN NUMBER,
    p_precio_unitario IN NUMBER,
    p_resultado OUT VARCHAR2
) AS
    v_id_pedido VARCHAR2(4);
BEGIN
    -- Generar ID de pedido
    SELECT 'P' || LPAD(TO_CHAR(COALESCE(MAX(TO_NUMBER(SUBSTR(id_pedido, 2))), 0) + 1), 3, '0')
    INTO v_id_pedido
    FROM tpedido;

    -- Insertar el pedido
    INSERT INTO tpedido (
        id_pedido,
        id_usuario,
        id_producto,
        cantidad,
        precio_unitario,
        tipo_pedido
    ) VALUES (
        v_id_pedido,
        p_id_usuario,
        p_id_producto,
        p_cantidad,
        p_precio_unitario,
        'producto'
    );

    p_resultado := 'Pedido creado correctamente con ID: ' || v_id_pedido;
EXCEPTION
    WHEN OTHERS THEN
        p_resultado := 'Error al crear el pedido: ' || SQLERRM;
END;
/

-- Procedimiento para actualizar el estado de un pedido
CREATE OR REPLACE PROCEDURE actualizar_estado_pedido(
    p_id_pedido IN VARCHAR2,
    p_nuevo_estado IN VARCHAR2,
    p_resultado OUT VARCHAR2
) AS
BEGIN
    UPDATE tpedido
    SET estado = p_nuevo_estado
    WHERE id_pedido = p_id_pedido;

    IF SQL%ROWCOUNT = 0 THEN
        p_resultado := 'No se encontró el pedido con ID: ' || p_id_pedido;
    ELSE
        p_resultado := 'Estado del pedido actualizado correctamente';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        p_resultado := 'Error al actualizar el estado: ' || SQLERRM;
END;
/

-- Procedimiento para generar factura
CREATE OR REPLACE PROCEDURE generar_factura(
    p_id_pedido IN VARCHAR2,
    p_resultado OUT VARCHAR2
) AS
    v_id_factura VARCHAR2(4);
    v_subtotal NUMBER;
    v_iva NUMBER;
    v_total NUMBER;
BEGIN
    -- Calcular subtotal
    SELECT cantidad * precio_unitario
    INTO v_subtotal
    FROM tpedido
    WHERE id_pedido = p_id_pedido;

    -- Calcular IVA (21%)
    v_iva := v_subtotal * 0.21;
    v_total := v_subtotal + v_iva;

    -- Generar ID de factura
    SELECT 'F' || LPAD(TO_CHAR(COALESCE(MAX(TO_NUMBER(SUBSTR(id_factura, 2))), 0) + 1), 3, '0')
    INTO v_id_factura
    FROM tfacturas;

    -- Insertar la factura
    INSERT INTO tfacturas (
        id_factura,
        id_pedido,
        fecha_emision,
        fecha_vencimiento,
        subtotal,
        iva,
        total
    ) VALUES (
        v_id_factura,
        p_id_pedido,
        SYSDATE,
        SYSDATE + 30,
        v_subtotal,
        v_iva,
        v_total
    );

    p_resultado := 'Factura generada correctamente con ID: ' || v_id_factura;
EXCEPTION
    WHEN OTHERS THEN
        p_resultado := 'Error al generar la factura: ' || SQLERRM;
END;
/

-- Procedimiento para programar producción
CREATE OR REPLACE PROCEDURE programar_produccion(
    p_id_pedido IN VARCHAR2,
    p_id_maquina IN VARCHAR2,
    p_id_usuario_responsable IN VARCHAR2,
    p_fecha_inicio IN DATE,
    p_fecha_fin IN DATE,
    p_prioridad IN NUMBER,
    p_resultado OUT VARCHAR2
) AS
    v_id_programacion VARCHAR2(4);
BEGIN
    -- Generar ID de programación
    SELECT 'PR' || LPAD(TO_CHAR(COALESCE(MAX(TO_NUMBER(SUBSTR(id_programacion, 3))), 0) + 1), 2, '0')
    INTO v_id_programacion
    FROM tprogramacion_produccion;

    -- Insertar la programación
    INSERT INTO tprogramacion_produccion (
        id_programacion,
        id_pedido,
        id_maquina,
        id_usuario_responsable,
        fecha_inicio,
        fecha_fin,
        prioridad
    ) VALUES (
        v_id_programacion,
        p_id_pedido,
        p_id_maquina,
        p_id_usuario_responsable,
        p_fecha_inicio,
        p_fecha_fin,
        p_prioridad
    );

    p_resultado := 'Producción programada correctamente con ID: ' || v_id_programacion;
EXCEPTION
    WHEN OTHERS THEN
        p_resultado := 'Error al programar la producción: ' || SQLERRM;
END;
/

DELIMITER //

-- Procedimiento para crear un nuevo usuario
CREATE PROCEDURE sp_crear_usuario(
    IN p_nombre VARCHAR(50),
    IN p_apellidos VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_telefono VARCHAR(20),
    IN p_rol ENUM('ADM', 'EMP', 'CLI')
)
BEGIN
    DECLARE v_id_usuario INT;
    
    INSERT INTO usuarios (nombre, apellidos, email, password, telefono, rol)
    VALUES (p_nombre, p_apellidos, p_email, p_password, p_telefono, p_rol);
    
    SET v_id_usuario = LAST_INSERT_ID();
    
    IF p_rol = 'CLI' THEN
        INSERT INTO clientes (id_cliente)
        VALUES (v_id_usuario);
    END IF;
END //

-- Procedimiento para actualizar información del cliente
CREATE PROCEDURE sp_actualizar_cliente(
    IN p_id_cliente INT,
    IN p_empresa VARCHAR(100),
    IN p_cif VARCHAR(20),
    IN p_direccion VARCHAR(200),
    IN p_ciudad VARCHAR(50),
    IN p_codigo_postal VARCHAR(10),
    IN p_pais VARCHAR(50)
)
BEGIN
    UPDATE clientes
    SET empresa = p_empresa,
        cif = p_cif,
        direccion = p_direccion,
        ciudad = p_ciudad,
        codigo_postal = p_codigo_postal,
        pais = p_pais
    WHERE id_cliente = p_id_cliente;
END //

-- Procedimiento para actualizar preferencias del usuario
CREATE PROCEDURE sp_actualizar_preferencias(
    IN p_id_usuario INT,
    IN p_notify_email BOOLEAN,
    IN p_notify_sms BOOLEAN,
    IN p_language VARCHAR(2)
)
BEGIN
    UPDATE usuarios
    SET notify_email = p_notify_email,
        notify_sms = p_notify_sms,
        language = p_language
    WHERE id_usuario = p_id_usuario;
END //

-- Procedimiento para cambiar contraseña
CREATE PROCEDURE sp_cambiar_password(
    IN p_id_usuario INT,
    IN p_password_actual VARCHAR(255),
    IN p_password_nueva VARCHAR(255)
)
BEGIN
    DECLARE v_password_actual VARCHAR(255);
    
    SELECT password INTO v_password_actual
    FROM usuarios
    WHERE id_usuario = p_id_usuario;
    
    IF v_password_actual = p_password_actual THEN
        UPDATE usuarios
        SET password = p_password_nueva
        WHERE id_usuario = p_id_usuario;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Contraseña actual incorrecta';
    END IF;
END //

DELIMITER ; 