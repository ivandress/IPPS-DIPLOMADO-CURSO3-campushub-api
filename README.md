# CampusHub · tu proyecto del curso (la API)

Este es **el repositorio** que crecerá capítulo a capítulo hasta convertirse en
una **plataforma backend completa**: cursos, alumnos, matrículas, autenticación
y correo.

Empiezas con un **Express mínimo** y lo construyes **lab por lab**. Al final,
este repo es la evidencia de que te volviste Backend Developer — y, muy importante,
**se podrá conectar a un frontend real** que te entregaremos para probarlo.

---

## ⚠️ LEE ESTO PRIMERO: respeta el contrato

Al terminar el curso, tu API se conectará a un **frontend de referencia**. Para
que funcione, tu API tiene que hablar **exactamente el mismo idioma** que el
frontend espera. Eso significa **tres reglas que NO puedes cambiar**:

1. **Los nombres de las rutas** — si el frontend llama a `POST /matriculas`, tu
   ruta tiene que ser `/matriculas` (no `/matricula`, no `/inscripciones`).
2. **Los nombres de los campos del body y de la respuesta** — si el contrato dice
   que matricular recibe `{ alumno, curso }`, esos son los nombres. No `alumnoId`,
   no `idAlumno`. **Un solo nombre distinto y la conexión se rompe**, aunque tu
   código "funcione".
3. **La estructura por capas** — routes → controllers → services → models. No es
   un capricho: es lo que hace tu proyecto mantenible y lo que evaluamos.

> 💡 Puedes agregar campos o rutas **extra** si quieres. Lo que no puedes es
> **renombrar ni quitar** los que están en el contrato de abajo.

Verifica tu avance contra **este README** y contra **los laboratorios del libro**.
Si tu Postman devuelve lo mismo que la tabla de contrato, vas bien.

---

## El contrato de la API (lo que el frontend espera)

Autenticación: todas las rutas marcadas 🔒 exigen el header
`Authorization: Bearer <token>`. El token lo obtienes en `POST /login`.

Las listas (`GET /cursos`, `/alumnos`, `/profesores`) devuelven un **array** en
la raíz.

| Método + ruta | Body que recibe | Qué devuelve | Auth |
|---|---|---|---|
| `POST /register` | `{ email, password, rol, nombre }` | `201 { id, email, rol }` (sin token) | — |
| `POST /login` | `{ email, password }` | `{ usuario: { id, email, rol }, token }` | — |
| `GET /cursos` | — | array de cursos (con `profesor` poblado) | — |
| `GET /cursos/:id` | — | un curso; `404` si no existe | — |
| `POST /cursos` | `{ nombre, descripcion, fechaInicio, fechaTermino, estado, profesor }` | `201` con el curso | 🔒 profesor |
| `PUT /cursos/:id` | idem | curso actualizado | 🔒 |
| `DELETE /cursos/:id` | — | `204` | 🔒 |
| `POST /cursos/:id/portada` | `multipart/form-data`, campo **`portada`** (File) | curso con `portada` guardada | 🔒 |
| `GET /profesores` | — | array de profesores | — |
| `POST /profesores` | `{ nombre, email, especialidad }` | `201` | 🔒 |
| `PUT /profesores/:id` · `DELETE /profesores/:id` | — | actualizado / `204` | 🔒 |
| `GET /alumnos` | — | array de alumnos | — |
| `POST /alumnos` | `{ nombre, email }` | `201` con el alumno | 🔒 profesor |
| `DELETE /alumnos/:id` | — | `204` | 🔒 profesor |
| `POST /matriculas` | `{ alumno, curso }` (ambos `_id`) | `201`; dispara correo al profesor | 🔒 |
| `GET /auth/google` | — | redirige a Google (OAuth, Lab 30) | — |

> El botón "Continuar con Google" del frontend apunta a `GET /auth/google`. El resto
> del flujo OAuth (callback, firmar el token, elegir rol si el usuario es nuevo) lo
> construyes en el **Lab 30**; es opcional para que el frontend funcione — el login
> con email y contraseña ya cubre todo el contrato.

**Detalles del contrato que se rompen fácil:**

- `login` devuelve el **rol dentro de `usuario`** (`usuario.rol`), además de meterlo
  en el token. El frontend lee `usuario.rol` para saber si eres alumno o profesor.
  Devuelve `{ usuario: { id, email, rol }, token }` — el `rol` en el cuerpo, no solo
  en el JWT.
- `rol` sólo puede ser `"alumno"` o `"profesor"`.
- **`GET /cursos` y `GET /cursos/:id` deben hacer `.populate('profesor')`.** El curso
  guarda el profesor como un id (referencia); sin `populate`, devuelves `profesor: "665f…"`
  (un id pelado). El frontend necesita el **nombre** del profesor para mostrarlo en cada
  tarjeta → sin `populate` verías el id o un hueco. No es un lujo, es parte del contrato.
- **Modelo `Alumno`: solo `nombre` y `email` son obligatorios.** Puedes agregar
  `rut`, `teléfono`, etc., pero déjalos **opcionales** (sin `required`). El frontend crea
  alumnos enviando solo `{ nombre, email }`; si marcas `rut` obligatorio, ese
  `POST /alumnos` fallaría con `400`.
- `estado` de un curso: usa `"abierto"`, `"en curso"` o `"cerrado"` (son los valores
  que muestra el selector del frontend). El modelo puede tener `default: "abierto"`.
- **Middleware de auth: llámalo `requiereToken`** (así se usa en todo el libro, Cap 4-9).
  Ojo: `verificarToken` es la **utilidad** de `utils/jwt.js` que hace `jwt.verify` — es
  otra cosa. No los confundas: `requiereToken` (middleware) usa `verificarToken` (utilidad).
- Los **errores** se responden como JSON. El frontend acepta dos formas:
  `{ error: "mensaje" }` (la del libro, Lab 21) o `{ error: true, message: "mensaje" }`.
  Lo importante es que el texto llegue en `error` (como string) o en `message`.
- La **portada**: guarda la ruta del archivo y **sirve la carpeta** con
  `app.use('/uploads', express.static('uploads'))`, si no, la imagen da 404.

---

## Los controllers que vas a tener (uno por recurso)

Cada recurso vive en su propio controller (capa que traduce HTTP ↔ lógica):

- `controllers/cursos.controller.js`
- `controllers/alumnos.controller.js`
- `controllers/profesores.controller.js`
- `controllers/matriculas.controller.js`
- `controllers/auth.controller.js` — `register` y `login`
- `controllers/errores.js` — `responderError(res, err)`: traduce errores de
  negocio a códigos HTTP (no repartas `try/catch` con 500 por todos lados).
  Se construye en el **Lab 21**: un mapa `NOMBRE_ERROR → { status, mensaje }`
  (ej. `CURSO_NO_ENCONTRADO` → 404, `FALTAN_DATOS` → 400) y una función que
  responde el código conocido, o 500 si el error es inesperado.

Cada controller llama a su **service** (`services/*.service.js`), y el service
habla con el **model** (`models/*.js`). El controller **no** toca Mongoose directo.
El patrón es: el **service piensa** (valida y lanza `throw new Error('NOMBRE')`),
el **controller traduce** (su `catch` llama a `responderError`).

---

## Todas las rutas van documentadas en Swagger

Cada vez que agregues una ruta, **documéntala en tu spec OpenAPI** y publícala en
Swagger UI (lo montas en el Lab 11 y lo alimentas de ahí en adelante). Al terminar,
`GET /docs` debe mostrar **todas** las rutas del contrato de arriba. La
documentación es parte del entregable, no un extra.

---

## El scaffolding final (así se verá tu proyecto al terminar)

Empiezas casi en blanco. **No crees todo esto de una vez**: cada carpeta/archivo
aparece cuando su lab lo pide (te decimos en cuál). Esta es la meta para que sepas
hacia dónde vas y puedas ir tachando:

```
campushub-api/
├── uploads/                     # portadas subidas (Lab 10) — en .gitignore
├── src/
│   ├── config/
│   │   ├── db.js                # conexión a Mongo (Cap 6 / Lab 22)
│   │   └── passport.js          # estrategia Google OAuth (Lab 30)
│   ├── models/                  # Cap 6 (Lab 14) → aislados en Cap 7 (Lab 18)
│   │   ├── Curso.js
│   │   ├── Alumno.js
│   │   ├── Profesor.js
│   │   ├── Matricula.js
│   │   └── Usuario.js           # email, passwordHash, rol, nombre
│   ├── routes/                  # Cap 7 (Lab 17)
│   │   ├── index.js             # monta todos los routers (barrel)
│   │   ├── cursos.routes.js
│   │   ├── alumnos.routes.js
│   │   ├── profesores.routes.js
│   │   ├── matriculas.routes.js
│   │   └── auth.routes.js       # /register y /login
│   ├── controllers/             # Cap 7 (Lab 19) + errores.js (Lab 21)
│   │   ├── cursos.controller.js
│   │   ├── alumnos.controller.js
│   │   ├── profesores.controller.js
│   │   ├── matriculas.controller.js
│   │   ├── auth.controller.js
│   │   └── errores.js
│   ├── services/                # Cap 7 (Lab 20)
│   │   ├── cursos.service.js
│   │   ├── alumnos.service.js
│   │   ├── profesores.service.js
│   │   ├── matriculas.service.js
│   │   ├── auth.service.js
│   │   └── mailer.js            # Nodemailer (Lab 28)
│   ├── middlewares/
│   │   ├── auth.js              # requiereToken / requiereRol (Lab 26-27)
│   │   └── upload.js            # multer (Lab 10 → extraído en Lab 17)
│   ├── utils/
│   │   └── jwt.js               # firmarToken / verificarToken (Cap 4)
│   ├── docs/
│   │   └── openapi.json         # spec Swagger (Lab 11+)
│   └── server.js                # arranque: middlewares + monta routes/index.js
├── .env                         # tus secretos (NO se sube)
├── .env.example                 # plantilla (SÍ se sube)
└── package.json
```

> Hoy tu `server.js` está en la raíz y casi vacío. En el Cap 7 lo moverás a
> `src/` y quedará **mínimo**: sólo enchufa las piezas. Ese es el objetivo —
> tu monstruo inicial se divide en cinco capas ordenadas. 🧸

---

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- MongoDB (Atlas o local) — a partir del Cap 6

## Cómo correr

```bash
npm install       # instala las dependencias
npm run dev       # arranca en modo watch (se reinicia solo al guardar)
# o
npm start         # arranca normal
```

La API queda en `http://localhost:3000`.

## Variables de entorno — créalas desde `.env.example`

**Copia** la plantilla y rellénala a medida que cada lab te lo pida:

```bash
cp .env.example .env
```

Luego abre `.env` y completa los valores. **No todas hacen falta al inicio**: cada
variable dice en qué lab la necesitas.

> ⚠️ Nunca subas tu `.env` al repo (ya está en `.gitignore`). El `.env.example`
> **sí** se sube (es la plantilla, sin secretos); tu `.env` con valores reales **no**.

### Conectar el frontend a TU API

Cuando te entreguemos el frontend, apúntalo a tu API con su propia variable
`VITE_API_URL` (en el `.env` del frontend), por ejemplo
`VITE_API_URL=http://localhost:3000`. Si levantas tu API en otro puerto, ajústala
ahí. El frontend usa esa URL para todas las llamadas del contrato de arriba.

---

## Roadmap — qué construyes en cada capítulo

| Cap | Qué agregas |
|-----|-------------|
| **5** | CRUD RESTful de `/cursos` y `/alumnos`, subir portada (multer), Swagger |
| **6** | MongoDB: los datos dejan de vivir en memoria; modelo de datos con relaciones |
| **7** | Arquitectura por capas (routes → controllers → services → models) |
| **8** | Mantenedor de profesores, registro, login (JWT + bcrypt), roles y permisos |
| **9** | Correo al matricularse (Nodemailer + HBS) y login con Google (OAuth) |

Este archivo, `server.js`, empieza casi en blanco a propósito: **tú lo
construyes lab por lab.**
