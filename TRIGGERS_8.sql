-- Trigger para actualizar el stock de materiales
CREATE OR REPLACE TRIGGER actualizar_stock_material
AFTER INSERT ON tpedido
FOR EACH ROW
WHEN (NEW.tipo_pedido = 'material')
DECLARE
    v_cantidad_actual NUMBER;
BEGIN
    -- Obtener cantidad actual
    SELECT stock INTO v_cantidad_actual
    FROM tmaterial
    WHERE id_material = :NEW.id_material;

    -- Actualizar stock
    UPDATE tmaterial
    SET stock = v_cantidad_actual - :NEW.cantidad
    WHERE id_material = :NEW.id_material;

    -- Verificar stock mínimo
    IF v_cantidad_actual - :NEW.cantidad < 10 THEN
        -- Aquí se podría implementar una notificación
        DBMS_OUTPUT.PUT_LINE('¡Alerta! Stock bajo para el material ' || :NEW.id_material);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error al actualizar stock: ' || SQLERRM);
END;
/

-- Trigger para actualizar el estado de la máquina
CREATE OR REPLACE TRIGGER actualizar_estado_maquina
AFTER INSERT OR UPDATE ON tprogramacion_produccion
FOR EACH ROW
BEGIN
    IF :NEW.estado = 'en_proceso' THEN
        UPDATE tmaquinas
        SET estado = 'en_uso'
        WHERE id_maquina = :NEW.id_maquina;
    ELSIF :NEW.estado = 'completado' THEN
        UPDATE tmaquinas
        SET estado = 'disponible'
        WHERE id_maquina = :NEW.id_maquina;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error al actualizar estado de máquina: ' || SQLERRM);
END;
/

-- Trigger para registrar cambios en pedidos
CREATE OR REPLACE TRIGGER registrar_cambios_pedido
AFTER UPDATE ON tpedido
FOR EACH ROW
BEGIN
    IF :OLD.estado != :NEW.estado THEN
        -- Aquí se podría implementar un sistema de notificaciones
        DBMS_OUTPUT.PUT_LINE('El pedido ' || :NEW.id_pedido || ' ha cambiado de estado: ' || 
                            :OLD.estado || ' -> ' || :NEW.estado);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error al registrar cambios: ' || SQLERRM);
END;
/

-- Trigger para verificar disponibilidad de máquina
CREATE OR REPLACE TRIGGER verificar_disponibilidad_maquina
BEFORE INSERT ON tprogramacion_produccion
FOR EACH ROW
DECLARE
    v_estado_maquina VARCHAR2(15);
    v_solapamiento NUMBER;
BEGIN
    -- Verificar estado de la máquina
    SELECT estado INTO v_estado_maquina
    FROM tmaquinas
    WHERE id_maquina = :NEW.id_maquina;

    IF v_estado_maquina != 'disponible' THEN
        RAISE_APPLICATION_ERROR(-20001, 'La máquina no está disponible');
    END IF;

    -- Verificar solapamiento de horarios
    SELECT COUNT(*)
    INTO v_solapamiento
    FROM tprogramacion_produccion
    WHERE id_maquina = :NEW.id_maquina
    AND estado != 'cancelado'
    AND (
        (:NEW.fecha_inicio BETWEEN fecha_inicio AND fecha_fin)
        OR
        (:NEW.fecha_fin BETWEEN fecha_inicio AND fecha_fin)
        OR
        (fecha_inicio BETWEEN :NEW.fecha_inicio AND :NEW.fecha_fin)
    );

    IF v_solapamiento > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Existe solapamiento con otra programación');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20000, 'Error al verificar disponibilidad: ' || SQLERRM);
END;
/

DELIMITER //

-- Trigger para actualizar el último acceso
CREATE TRIGGER tr_actualizar_ultimo_acceso
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    IF NEW.ultimo_acceso IS NULL THEN
        SET NEW.ultimo_acceso = CURRENT_TIMESTAMP;
    END IF;
END //

-- Trigger para validar el email
CREATE TRIGGER tr_validar_email
BEFORE INSERT ON usuarios
FOR EACH ROW
BEGIN
    IF NEW.email NOT LIKE '%@%.%' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Formato de email inválido';
    END IF;
END //

-- Trigger para validar el CIF
CREATE TRIGGER tr_validar_cif
BEFORE INSERT ON clientes
FOR EACH ROW
BEGIN
    IF NEW.cif IS NOT NULL AND NEW.cif NOT REGEXP '^[A-Z][0-9]{8}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Formato de CIF inválido';
    END IF;
END //

-- Trigger para validar el código postal
CREATE TRIGGER tr_validar_codigo_postal
BEFORE INSERT ON clientes
FOR EACH ROW
BEGIN
    IF NEW.codigo_postal NOT REGEXP '^[0-9]{5}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Formato de código postal inválido';
    END IF;
END //

DELIMITER ; 