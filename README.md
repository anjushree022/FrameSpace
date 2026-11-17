# FrameSpace

A Pinterest-inspired photography-sharing platform. Upload photographs, explore a masonry gallery, like and bookmark favourites, build a profile and join weekly photography challenges. Includes an admin dashboard and a light/dark theme.

**Stack:** React, Tailwind CSS, React Router, Axios, Lucide React · Node.js, Express · MongoDB Atlas + Mongoose · Cloudinary · JWT authentication.

```
framespace/
  frontend/   React app (Vite)
  backend/    Express REST API
```

## 1. Prerequisites

- Node.js 18.11 or newer (`node -v`)
- A free **MongoDB Atlas** cluster
- A free **Cloudinary** account

### MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/atlas.
2. **Database Access:** add a database user (username and password).
3. **Network Access:** add your current IP address (or `0.0.0.0/0` while developing).
4. **Connect > Drivers:** copy the connection string and add a database name, e.g. `...mongodb.net/framespace?retryWrites=true&w=majority`.

### Cloudinary

From the Cloudinary dashboard (**API Keys**), copy the cloud name, API key and API secret.

## 2. Configure the backend

```bash
cd backend
cp .env.example .env     # Windows: copy .env.example .env
```

Fill in `.env`:

| Variable | What to put |
| --- | --- |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From Cloudinary |
| `CLIENT_URL` | `http://localhost:5173` (comma-separate several origins if needed) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created by the seed script |

## 3. Install, seed and run

```bash
# terminal 1: API on http://localhost:5001
cd backend
npm install
npm run seed      # sample users, photographs, challenges (wipes those collections)
npm run dev

# terminal 2: website on http://localhost:5173
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend proxies `/api` to the backend (see `frontend/vite.config.js`).

### Seeded accounts

| Role | Email | Password |
| --- | --- | --- |
| Photographer | `aarav@example.com` | `demo1234` |
| Admin | `ADMIN_EMAIL` (default `admin@framespace.app`) | `ADMIN_PASSWORD` (default `admin1234`) |

`meera@`, `lucas@`, `sofia@` and `noor@example.com` also use `demo1234`. Change the admin password in `.env` before seeding anything you share.
`npm run seed` is for development: it refuses to run when `NODE_ENV=production`. The seeded photographs are hosted on Unsplash; photographs you upload go to Cloudinary.

## Theme toggle

The sun/moon button in the navigation bar switches between light and dark mode. The choice is saved in the browser; on first visit it follows the system setting. Colours are CSS variables defined in `frontend/src/index.css`, so every page switches together.

## REST API

All routes are under `/api`. Send `Authorization: Bearer <token>` for protected routes.

| Method and path | Access | Purpose |
| --- | --- | --- |
| `POST /auth/register`, `POST /auth/login` | Public | Create account / log in (returns JWT) |
| `GET /auth/me` | User | Current user |
| `GET /photos?q=&category=&sort=&page=&limit=` | Public | Search, filter and page through photographs |
| `POST /photos` (multipart `image`, `caption`, `description`, `category`, `tags`) | User | Upload to Cloudinary and save to MongoDB |
| `GET /photos/:id`, `GET /photos/:id/related` | Public | Details / more in the same category |
| `DELETE /photos/:id` | Owner or admin | Delete photograph (also removes likes, bookmarks, entries, Cloudinary file) |
| `POST` / `DELETE /photos/:id/like` | User | Like / unlike |
| `POST` / `DELETE /photos/:id/bookmark` | User | Bookmark / remove |
| `GET /bookmarks` | User | Your saved photographs |
| `GET /users/:username`, `GET /users/:username/photos` | Public | Profile, stats and photographs |
| `PUT /users/me` | User | Edit your own profile and picture |
| `GET /challenges`, `GET /challenges/:id` | Public | Challenges and their entries |
| `POST /challenges/:id/submissions` | User | Submit one of your photographs (one per challenge) |
| `POST /challenges`, `PUT` / `DELETE /challenges/:id` | Admin | Manage challenges |
| `GET /admin/stats`, `/admin/users`, `/admin/photos` | Admin | Dashboard data |

## How the requirements are met

- **Passwords:** hashed with bcrypt (cost 12); the hash is never returned by the API.
- **Duplicate likes, bookmarks and entries:** prevented by unique compound indexes in MongoDB, so they hold even under concurrent requests.
- **Ownership:** only the owner (or an admin) can delete a photograph; `PUT /users/me` only ever edits the logged-in user.
- **Admin routes:** protected on the server by `requireAdmin`; the role can only be set in the database/seed, never through registration.
- **Validation:** every endpoint validates input with Zod; the forms validate on the client too.
- **Hardening:** Helmet, CORS allow-list, rate limiting (stricter on login/register), 10 MB JPEG/PNG/WebP upload limit, regex-escaped search.
- **Persistence:** everything, including likes and bookmarks, lives in MongoDB and survives refreshes.

## Troubleshooting

- **`Missing environment variables`:** `backend/.env` is missing or incomplete.
- **`Could not connect to MongoDB`:** check the connection string and that your IP is allowed in Atlas Network Access.
- **Uploads return 503:** the `CLOUDINARY_*` values are not set.
- **Frontend shows "Cannot reach the server":** the backend is not running, or is not on port 5001.
- **Port 5001 in use:** change `PORT` in `backend/.env` and the proxy target in `frontend/vite.config.js`.
- **Photographs missing after seeding:** restart the backend, then refresh the browser.
