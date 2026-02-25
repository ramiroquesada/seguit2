# Guía de Desarrollo - Seguit 2.0

Este documento contiene los comandos esenciales para trabajar en el proyecto.

## 🚀 Inicio Rápido

### Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### Backend
```bash
cd backend
npm install
npm run start:dev
```
La API estará disponible en `http://localhost:3000`.

---

## 🗄️ Base de Datos (Prisma)

Los comandos de base de datos deben ejecutarse dentro de la carpeta `/backend`.

### Sincronizar Esquema y Crear Migración
Usa esto cuando hagas cambios en `schema.prisma`.
```bash
npx prisma migrate dev --name descripcion_del_cambio
```

### Generar Cliente Prisma
```bash
npx prisma generate
```

### Poblar Base de Datos (Seed)
Esto borrará los datos actuales y cargará los equipos realistas y usuarios iniciales.
```bash
npm run db:seed
```

### Explorador de Base de Datos (GUI)
Abre una interfaz web para ver y editar los datos.
```bash
npx prisma studio
```

---

## 🔑 Credenciales por Defecto
- **Usuario:** `root`
- **Contraseña:** `root1234`
- **Usuario Técnico:** `tecnico1` / `tecnico1234`

---

## 🛠️ Tecnologías Utilizadas
- **Frontend:** React + Vite, TanStack Query (React Query), Lucide React.
- **Backend:** NestJS, Prisma ORM, PostgreSQL.
- **Identidad:** Intendencia de Soriano (Teal & Navy Blue).
