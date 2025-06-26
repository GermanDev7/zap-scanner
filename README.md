#  ZAP Scanner API

Una API REST desarrollada en Node.js que automatiza escaneos de vulnerabilidades web utilizando **OWASP ZAP**. Incluye autenticación JWT, generación de reportes HTML, logs detallados, progreso en tiempo real y documentación interactiva con Swagger.

---

## Características principales

-  Inicia escaneos web desde una URL
-  Autenticación segura con JWT
-  Reportes HTML descargables
-  Logs (stdout, stderr) accesibles
-  Consulta de progreso en tiempo real
-  Documentación Swagger (OpenAPI 3)
-  Pruebas unitarias con Jest + cobertura

---

## 🛠 Tecnologías

- **Node.js** + Express
- **Prisma ORM** + PostgreSQL
- **JWT** para autenticación
- **Swagger** para documentación
- **Jest** para testing
- **OWASP ZAP** como escáner de vulnerabilidades
- **Docker** para ejecutar ZAP sin instalación local

---

##  Estructura del Proyecto

zap-scanner-api/
├── src/
│ ├── config/
│ │ ├── prismaClient.js
│ │ └── swaggerConfig.js
│ ├── controllers/
│ │ ├── authController.js
│ │ └── scanController.js
│ ├── middlewares/
│ │ └── authMiddleware.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ └── scanRoutes.js
│ ├── services/
│ │ ├── authService.js
│ │ └── scanService.js
│ └── app.js
├── tests/
│ └── unit/
│ └── scannerService.test.js
├── reports/ # HTMLs generados por ZAP
├── logs/ # stdout/stderr guardados
├── .env
├── .gitignore
├── README.md
├── package.json
└── server.js

---

##  Requisitos Previos

- Node.js ≥ 18.x
- Docker (para correr OWASP ZAP)
- PostgreSQL
- Prisma CLI (`npm install -g prisma`)
- Git (opcional pero recomendado)

---

##  Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/GermanDev7/zap-scanner.git
cd zap-scanner-api
```

2. Instala dependencias:

```bash
npm install
```


3. Configura .env:

PORT=3000
JWT_SECRET=tu_secreto
DATABASE_URL=postgresql://
usuario:clave@localhost:5432/tu_db

4. Configurar la base de datos con Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Acceder a la documentacion de swagger

http://localhost:3000/api-docs

---

6. Instalar Docker y correr imagen, o instalar ZAP localmente

Instalar Docker y correr la imagen oficial de ZAP (zaproxy/zap-stable)

---

## Iniciar servidor
```bash
npm run dev
```

---


## Ejecutar pruebas con cobertura

```bash
npm run test:cov
```

---


## Seguridad

Esta API requiere autenticación JWT para la mayoría de los endpoints.

---

## Licencia

MIT


