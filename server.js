// ============================================================
//  CampusHub · server.js
//  El backend REAL de tu proyecto del curso: la API de CampusHub.
//  Arranca casi vacío a propósito: en el Lab 9 construyes tú el
//  recurso /cursos, y lab a lab le agregas MongoDB, arquitectura
//  por capas, autenticación, roles, correo y OAuth.
//
//  Para levantarlo:  npm install  y luego  npm run dev
// ============================================================

import express from 'express'
import cors from 'cors'

const app = express()

// --- Middlewares base ---
app.use(cors())          // permite que el front (otro origen) llame a la API
app.use(express.json())  // entiende los body en JSON de los POST/PUT

// ── Lo que TÚ vas a construir, empezando en el Lab 9 ──────────
//
//  Lab 9  · CRUD REST de /cursos (en memoria):
//           - const cursos = []
//           - GET    /cursos       → listar
//           - POST   /cursos       → crear (validar, 201)
//           - GET    /cursos/:id   → leer uno (404 si no existe)
//           - PUT    /cursos/:id   → actualizar
//           - DELETE /cursos/:id   → borrar (204)
//
//  Cap 6  · reemplazar el array por MongoDB (Mongoose).
//  Cap 7  · separar en capas: routes / controllers / services / models.
//  Cap 8  · login (JWT + bcrypt), roles y permisos.
//  Cap 9  · correo al matricularse (Nodemailer) y login con Google (OAuth).
//
//  Escribe tu código aquí arriba de app.listen(). ¡Manos a la obra!

// --- Arranca el servidor ---
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`CampusHub escuchando en http://localhost:${PORT}`)
})
