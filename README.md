# RealPrint - Sistema de Gestión de Pedidos

Sistema de gestión de pedidos de impresión y serigrafía personalizada.

## Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone [url-del-repositorio]
cd realprint
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
- Copiar el archivo `.env.example` a `.env`
- Configurar las variables de entorno según tu entorno:
  ```
  DB_HOST=localhost
  DB_USER=tu_usuario
  DB_PASSWORD=tu_contraseña
  DB_NAME=realprint
  JWT_SECRET=tu_clave_secreta
  PORT=3000
  ```

4. Ejecutar el script de instalación de la base de datos:
```bash
mysql -u tu_usuario -p < INSTALACION_10.sql
```

5. Iniciar el servidor:
```bash
npm start
```

Para desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
realprint/
├── api/                # Rutas de la API
├── db/                 # Configuración de base de datos
├── middleware/         # Middleware de autenticación
├── public/            # Archivos estáticos
│   ├── css/
│   ├── js/
│   └── img/
├── .env               # Variables de entorno
├── package.json       # Dependencias
├── server.js          # Servidor principal
└── README.md          # Documentación
```

## API Endpoints

### Autenticación
- POST `/api/auth/login` - Iniciar sesión

### Usuario
- GET `/api/user/profile` - Obtener perfil de usuario

### Administración
- GET `/api/admin/estadisticas` - Obtener estadísticas generales
- GET `/api/admin/usuarios` - Listar usuarios
- GET `/api/admin/usuarios/:id` - Obtener usuario específico
- PUT `/api/admin/usuarios/:id` - Actualizar usuario
- GET `/api/admin/graficos` - Obtener datos para gráficos

## Seguridad

- Autenticación mediante JWT
- Protección de rutas por roles
- Encriptación de contraseñas
- Validación de datos

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 