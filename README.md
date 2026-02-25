# Seguit 2.0 - Sistema de Gestión de Inventario IT (Soriano)

Seguit 2.0 es una plataforma web moderna diseñada para el seguimiento y gestión de equipamiento informático para la **Intendencia de Soriano**. Permite gestionar la ubicación de los equipos, su estado actual y mantener un historial detallado de movimientos y reparaciones bajo una identidad visual institucional.

## 🚀 Características Principales

- **Identidad Institucional**: Interfaz personalizada con los colores Teal (`#00A79D`) y Navy Blue (`#003366`) de Soriano.
- **Dashboard General**: Estadísticas en tiempo real y vista rápida de los últimos ingresos.
- **Gestión de Equipos**: Listado avanzado con filtros dinámicos por tipo, estado y ubicación jerárquica.
- **Sistema de Mantenimiento**: Acciones directas para traslados y envío a soporte técnico con registro obligatorio de motivos.
- **Historial Completo**: Línea de tiempo detallada que registra quién, cuándo y por qué se realizó cada cambio en el equipo.
- **Ubicaciones Dinámicas**: Estructura de Ciudades -> Secciones -> Oficinas totalmente configurable.
- **Plantillas de Modelos**: Sistema de plantillas que auto-completan especificaciones técnicas para agilizar el registro de equipos.
- **Administración de Usuarios**: Panel especializado para gestionar técnicos, sus roles y estados (Activo/Inactivo).
- **Seguridad**: Autenticación basada en JWT con roles de Administrador (Root) y Técnico, controlando el acceso a áreas críticas.

## 🛠️ Tecnologías

### Backend
- **Framework**: NestJS (Node.js)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Seguridad**: Passport.js + JWT + Bcrypt

### Frontend
- **Framework**: React 19 + Vite
- **Estado/API**: TanStack Query (React Query) + Axios
- **Iconos**: Lucide React

---

## 📦 Instalación y Configuración

Siga estos pasos para levantar el proyecto en un entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/ramiroquesada/seguit2.git
cd seguit2
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```
- Copie el archivo `.env.example` a `.env` y configure sus credenciales de base de datos.
- Inicialice la base de datos:
```bash
npx prisma migrate dev
npm run db:seed
```
- Inicie en modo desarrollo:
```bash
npm run start:dev
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```
- Copie el archivo `.env.example` a `.env` y configure `VITE_API_URL` (generalmente `http://localhost:3000` en desarrollo).
- Inicie el sitio:
```bash
npm run dev
```

---

## 🔑 Usuarios por Defecto (Seed)

Después de ejecutar el comando de seed, puede ingresar con las siguientes credenciales:

- **Root Admin**: `root` / `root1234`
- **Técnico**: `tech1` / `tech1234`

---

## 📂 Estructura del Proyecto

```
seguit2/
├── backend/    # NestJS API & Prisma Schema
└── frontend/   # React & Vite Application
```

Desarrollado para la Intendencia de Soriano.
