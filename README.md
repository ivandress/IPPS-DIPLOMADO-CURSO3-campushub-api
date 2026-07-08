# CampusHub · tu proyecto del curso

Este es **el repositorio** que crecerá capítulo a capítulo hasta convertirse en
una **plataforma backend completa**: cursos, alumnos, matrículas, autenticación
y correo.

Empiezas con un **Express mínimo** y un recurso `/cursos` en memoria. En los
laboratorios le irás agregando **MongoDB**, **arquitectura por capas**, **JWT**,
**roles**, **correo** y **OAuth**. Al final, este repo es la evidencia de que te
volviste Backend Developer.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior

## Cómo correr

```bash
npm install       # instala las dependencias (express, cors)
npm run dev       # arranca en modo watch (se reinicia solo al guardar)
# o
npm start         # arranca normal
```

La API queda en `http://localhost:3000`.

Prueba con Postman o el navegador:

- `GET  http://localhost:3000/cursos` → lista de cursos
- `POST http://localhost:3000/cursos` con body JSON `{ "nombre": "Mi curso" }`

## Variables de entorno

Copia `.env.example` como `.env` y rellena los valores **a medida que cada lab
te lo pida**.

> ⚠️ Nunca subas tu `.env` al repo (ya está ignorado en `.gitignore`).

## Roadmap — qué construyes en cada capítulo

| Cap | Qué agregas |
|-----|-------------|
| **5** | CRUD RESTful de `/cursos` (5 rutas + códigos de estado) |
| **6** | MongoDB: los cursos dejan de vivir en memoria |
| **7** | Arquitectura por capas (rutas → controladores → servicios → modelos) |
| **8** | Autenticación con JWT y roles (alumno / profesor / admin) |
| **9** | Correo (Nodemailer) y login con Google OAuth |

Este archivo, `server.js`, empieza casi en blanco a propósito: **tú lo
construyes lab por lab.**
