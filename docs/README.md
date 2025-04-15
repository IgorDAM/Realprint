# Documentación de RealPrint

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Guías de Uso](#guías-de-uso)
5. [API](#api)
6. [Desarrollo](#desarrollo)
7. [Despliegue](#despliegue)
8. [Mantenimiento](#mantenimiento)
9. [Contribución](#contribución)
10. [Licencia](#licencia)

## Introducción
RealPrint es una plataforma web para la gestión de pedidos de impresión y serigrafía. Este documento proporciona una guía completa para la instalación, configuración y uso del sistema.

### Características Principales
- Gestión de pedidos en línea
- Sistema de autenticación seguro
- Dashboard para diferentes roles
- Sistema de notificaciones
- Integración con servicios externos
- Monitoreo y análisis de rendimiento

## Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- npm (v6 o superior)
- Git
- MySQL (v8.0 o superior)
- Redis (v6.0 o superior)

### Pasos de Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/realprint/realprint.git
   cd realprint
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. Inicializar la base de datos:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Iniciar el servidor:
   ```bash
   npm start
   ```

## Estructura del Proyecto
```
realprint/
├── src/
│   ├── api/          # Endpoints de la API
│   ├── config/       # Configuraciones
│   ├── db/          # Modelos y migraciones
│   ├── middleware/  # Middleware
│   ├── public/      # Archivos estáticos
│   └── utils/       # Utilidades
├── tests/           # Tests
├── docs/            # Documentación
└── scripts/         # Scripts de utilidad
```

## Guías de Uso

### Para Administradores
1. **Gestión de Usuarios**
   ```javascript
   // Crear nuevo usuario
   const user = await admin.createUser({
     nombre: 'Juan',
     apellidos: 'Pérez',
     email: 'juan@example.com',
     rol: 'operario'
   });
   ```

2. **Gestión de Pedidos**
   ```javascript
   // Actualizar estado de pedido
   await admin.updateOrderStatus(orderId, 'en_proceso');
   ```

### Para Clientes
1. **Realizar Pedido**
   ```javascript
   // Crear nuevo pedido
   const order = await client.createOrder({
     tipo: 'serigrafia',
     cantidad: 100,
     descripcion: 'Camisetas personalizadas'
   });
   ```

2. **Seguimiento de Pedidos**
   ```javascript
   // Obtener estado de pedido
   const status = await client.getOrderStatus(orderId);
   ```

### Para Operarios
1. **Gestión de Producción**
   ```javascript
   // Actualizar progreso
   await operator.updateProductionProgress(orderId, 50);
   ```

2. **Reportar Problemas**
   ```javascript
   // Reportar incidencia
   await operator.reportIssue(orderId, 'Falta de material');
   ```

## API

### Autenticación
```javascript
// Login
POST /api/auth/login
{
  "email": "usuario@example.com",
  "password": "contraseña"
}

// Registro
POST /api/auth/register
{
  "nombre": "Usuario",
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

### Pedidos
```javascript
// Crear pedido
POST /api/orders
{
  "tipo": "serigrafia",
  "cantidad": 100,
  "descripcion": "Descripción del pedido"
}

// Obtener pedidos
GET /api/orders
GET /api/orders/:id
```

## Desarrollo

### Estándares de Código
- Usar ESLint para linting
- Seguir las convenciones de nombrado
- Documentar todas las funciones
- Escribir tests para nuevo código

### Flujo de Trabajo
1. Crear rama desde `develop`
2. Implementar cambios
3. Escribir tests
4. Hacer pull request
5. Revisión de código
6. Merge a `develop`

## Despliegue

### Requisitos
- Servidor con Node.js
- Base de datos MySQL
- Servidor Redis
- Certificado SSL

### Pasos
1. Configurar servidor
2. Clonar repositorio
3. Instalar dependencias
4. Configurar variables de entorno
5. Iniciar servicios
6. Configurar nginx/apache
7. Configurar SSL

## Mantenimiento

### Monitoreo
- Usar el dashboard de monitoreo
- Revisar logs regularmente
- Configurar alertas

### Backup
- Backup automático cada hora
- Retención de 24 backups
- Verificación semanal

### Actualizaciones
- Actualizar dependencias mensualmente
- Aplicar parches de seguridad
- Probar en entorno de staging

## Contribución
1. Fork el proyecto
2. Crear rama de feature
3. Commit cambios
4. Push a la rama
5. Crear Pull Request

## Licencia
Este proyecto está licenciado bajo MIT License - ver el archivo [LICENSE](LICENSE) para más detalles. 