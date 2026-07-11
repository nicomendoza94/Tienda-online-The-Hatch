# Tienda Online - The Hatch 🐧

Larry el Pingüino se jubila después de 20 años gritando "¡PESCADO A LA VENTA!" desde un iceberg. Paula, su asistente, está modernizando el negocio con una plataforma de e-commerce como corresponde: un **Panel de Admin** para que Paula gestione productos y pedidos, y una **Tienda Online** pública para que los pingüinos compren desde sus iglús — sin necesidad de JavaScript.

## Stack tecnológico

- **Runtime / Framework:** Node.js + Express (dos servidores independientes)
- **Base de datos:** MongoDB Atlas (driver nativo `mongodb`, sin ODM)
- **Templating:** Pug (renderizado 100% server-side, cero JavaScript del lado del cliente)
- **Sesiones:** `express-session` + `connect-mongo` (persistidas en MongoDB)
- **Auth:** hashing de contraseñas con `bcrypt` + cookies de sesión httpOnly
- **Subida de archivos:** `multer` (almacenamiento local)

## Estructura del proyecto

```
Tienda-online-The-Hatch/
├── backend/    # Panel de Admin — gestión de productos y pedidos (solo Paula)
└── frontend/   # Tienda Online — vidriera pública (pingüinos)
```

Ambos servidores se conectan a la **misma base de datos MongoDB**, compartiendo las colecciones `products`, `orders` y `admins`. Corren de forma independiente y se pueden iniciar en cualquier orden.

---

## Requisitos previos

- **Node.js** v20.x o superior ([descargar acá](https://nodejs.org))
- **npm** (viene incluido con Node.js)
- Una cuenta de **MongoDB Atlas** con un cluster gratuito (M0) — [creá una acá](https://www.mongodb.com/cloud/atlas/register)
  - Vas a necesitar tu connection string (`mongodb+srv://...`) con el usuario y contraseña de un usuario de base de datos

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/nicomendoza94/Tienda-online-The-Hatch.git
cd Tienda-online-The-Hatch
```

### 2. Configurar el Backend (Panel de Admin)

```bash
cd backend
npm install
```

Creá un archivo `.env` en `backend/` basado en `.env.example`:

```
PORT=3000
MONGO_URI=mongodb+srv://tu_usuario:tu_password@tu_cluster.mongodb.net/larry_pinguino?appName=Cluster0
SESSION_SECRET=una_cadena_random_larga_que_elijas
```

Creá el usuario admin (Paula) corriendo el script de seed y siguiendo las instrucciones interactivas:

```bash
node scripts/seedAdmin.js
```

Te va a pedir que elijas un usuario y una contraseña — recordalos, los vas a usar para iniciar sesión.

Iniciá el servidor del backend:

```bash
npm run dev
```

El Panel de Admin va a estar disponible en **http://localhost:3000**.

### 3. Configurar el Frontend (Tienda Online)

Abrí una **segunda terminal** (el backend tiene que seguir corriendo, ya que el frontend lo usa para servir las imágenes de los productos):

```bash
cd frontend
npm install
```

Creá un archivo `.env` en `frontend/` basado en `.env.example`:

```
PORT=4000
MONGO_URI=mongodb+srv://tu_usuario:tu_password@tu_cluster.mongodb.net/larry_pinguino?appName=Cluster0
BACKEND_URL=http://localhost:3000
```

> Usá el **mismo** `MONGO_URI` que en el backend — ambos servidores comparten la misma base de datos.

Iniciá el servidor del frontend:

```bash
npm run dev
```

La Tienda Online va a estar disponible en **http://localhost:4000**.

---

## Uso

1. Iniciá sesión en el Panel de Admin (`http://localhost:3000/login`) con las credenciales que creaste con `seedAdmin.js`.
2. Agregá algunos productos (nombre, descripción, precio, stock, categoría, e imagen — la imagen es obligatoria).
3. Abrí la Tienda Online (`http://localhost:4000`) para ver los productos que acabás de agregar.
4. Hacé click en un producto, y luego en "Order this" para hacer un pedido con nombre, dirección del iglú, y cantidad.
5. Volvé al Panel de Admin → **Orders** para ver el pedido que Paula acaba de recibir, y confirmá que el stock del producto se descontó automáticamente.

---

## Referencia de variables de entorno

| Variable | Usada en | Descripción |
|---|---|---|
| `PORT` | ambos | Puerto en el que corre el servidor (3000 para backend, 4000 para frontend) |
| `MONGO_URI` | ambos | Connection string de MongoDB Atlas (misma para ambos servidores) |
| `SESSION_SECRET` | solo backend | Secreto usado para firmar las cookies de sesión |
| `BACKEND_URL` | solo frontend | URL base usada para armar los links de las imágenes de productos, servidas por el backend |

Nunca subas tu `.env` real al repositorio — solo `.env.example` (con valores de ejemplo) está trackeado acá.

---

## Notas sobre la arquitectura

- **Cero JavaScript del lado del cliente**: todo el renderizado ocurre en el servidor vía Pug. Los formularios usan `method`/`action` nativos de HTML, y se usa `method-override` en el Panel de Admin para soportar `PUT`/`DELETE` desde formularios HTML comunes.
- **Flujo de pedido directo**: la tienda no usa un carrito multi-producto — los clientes piden un producto a la vez (nombre, dirección del iglú, cantidad), manteniendo el flujo simple y 100% renderizado en servidor.
- **Sesiones en vez de tokens**: la autenticación usa sesiones del lado del servidor con cookies httpOnly (persistidas en MongoDB vía `connect-mongo`), no JWT.
- **Driver nativo de MongoDB**: sin Mongoose ni otro ODM — se accede a las colecciones directamente para tener control total y practicar queries nativas de MongoDB.

---

