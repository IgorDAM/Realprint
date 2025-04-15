# Documentación de la API de RealPrint

## Autenticación

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
}
```

**Respuesta Exitosa:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
        "id": 1,
        "nombre": "Usuario Ejemplo",
        "email": "usuario@ejemplo.com",
        "rol": "cliente"
    }
}
```

## Usuarios

### Crear Usuario
```http
POST /api/usuarios
```

**Body:**
```json
{
    "nombre": "Nuevo Usuario",
    "email": "nuevo@ejemplo.com",
    "password": "contraseña123",
    "rol": "cliente"
}
```

### Obtener Usuario
```http
GET /api/usuarios/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

## Pedidos

### Crear Pedido
```http
POST /api/pedidos
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
    "cliente_id": 1,
    "fecha_entrega": "2024-04-20",
    "detalles": [
        {
            "producto_id": 1,
            "cantidad": 10,
            "precio_unitario": 15.99
        }
    ]
}
```

### Obtener Pedidos
```http
GET /api/pedidos
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `estado`: Filtrar por estado (pendiente, en_proceso, completado)
- `fecha_inicio`: Filtrar por fecha de inicio
- `fecha_fin`: Filtrar por fecha de fin

## Productos

### Obtener Productos
```http
GET /api/productos
```

**Query Params:**
- `categoria`: Filtrar por categoría
- `precio_min`: Precio mínimo
- `precio_max`: Precio máximo

## Códigos de Estado

- `200`: OK
- `201`: Creado
- `400`: Solicitud incorrecta
- `401`: No autorizado
- `403`: Prohibido
- `404`: No encontrado
- `500`: Error del servidor

## Ejemplos de Uso

### JavaScript
```javascript
const response = await fetch('/api/pedidos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        cliente_id: 1,
        fecha_entrega: '2024-04-20',
        detalles: [{
            producto_id: 1,
            cantidad: 10,
            precio_unitario: 15.99
        }]
    })
});
```

### Python
```python
import requests

response = requests.post(
    'http://api.realprint.com/pedidos',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    },
    json={
        'cliente_id': 1,
        'fecha_entrega': '2024-04-20',
        'detalles': [{
            'producto_id': 1,
            'cantidad': 10,
            'precio_unitario': 15.99
        }]
    }
)
```

## Limitaciones

- Rate limiting: 100 peticiones por IP cada 15 minutos
- Tamaño máximo de petición: 10MB
- Tiempo máximo de respuesta: 30 segundos

## Seguridad

- Todas las peticiones deben usar HTTPS
- Los tokens JWT expiran después de 24 horas
- Las contraseñas deben tener al menos 8 caracteres
- Se recomienda usar autenticación de dos factores

## Producción

### Programar Producción
```http
POST /api/produccion/programar
Authorization: Bearer <token>
Content-Type: application/json

{
    "id_pedido": "P001",
    "id_maquina": "M001",
    "fecha_inicio": "2024-04-15",
    "fecha_fin": "2024-04-16",
    "prioridad": 3
}
```

### Reportar Incidencia
```http
POST /api/produccion/incidencias
Authorization: Bearer <token>
Content-Type: application/json

{
    "id_programacion": "PRG001",
    "tipo": "averia",
    "descripcion": "Máquina fuera de servicio",
    "gravedad": "alta"
}
```

## Facturación

### Generar Factura
```http
POST /api/facturas
Authorization: Bearer <token>
Content-Type: application/json

{
    "id_pedido": "P001",
    "metodo_pago": "tarjeta",
    "observaciones": "Factura urgente"
}
```

### Registrar Pago
```http
POST /api/facturas/:id/pagos
Authorization: Bearer <token>
Content-Type: application/json

{
    "importe": 150.00,
    "metodo_pago": "tarjeta",
    "referencia_pago": "TRX123456"
}
```

## Gestión de Usuarios

### Obtener Perfil
```http
GET /api/usuarios/perfil
Authorization: Bearer <token>
```

### Actualizar Perfil
```http
PUT /api/usuarios/perfil
Authorization: Bearer <token>
Content-Type: application/json

{
    "nombre": "Nombre Actualizado",
    "telefono": "987654321",
    "password": "nueva_contraseña"
}
``` 