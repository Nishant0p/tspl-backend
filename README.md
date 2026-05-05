# tspl-admin-backend

Minimal Express backend for admin panel, contact/service/job collection, file uploads, Excel logging, and Strapi forwarding.

Quick start:

1. Copy `.env.example` to `.env` and fill values (Postgres DATABASE_URL, JWT_SECRET, SUPERUSER_EMAIL, SUPERUSER_PASSWORD, STRAPI_ENDPOINT).
2. Install dependencies:

```bash
cd tspl-admin-backend
npm install
```

3. Start server:

```bash
npm run start
```

APIs:
- `POST /api/forms/submit` - fields: `type` = contact|service|job, `name,email,message,phone,metadata` and files `pdf`, `cv` for job
- `GET /api/forms/list/:section` - `contacts|services|jobs` returns JSON list (requires auth)
- `GET /api/forms/preview/:filename` - preview file inline in browser (requires auth)
- `GET /api/forms/download/:filename` - download file (requires auth)
- `POST /api/auth/login` - body: `email,password` returns JWT
- `POST /api/auth/admins` - create admin (requires superuser JWT)
- `GET /admin/dashboard` - admin panel dashboard (requires auth, shows contacts/services/jobs with file previews)

Admin Dashboard:
- Access at `/admin/dashboard?section=contacts|services|jobs`
- View all submissions with details and timestamps
- **For job applications:** Direct preview of CV and PDF files without download
- **View CV** button opens PDF/image in modal viewer
- **Download** link available for file download

Notes:
- On first run, if DB has no users and `SUPERUSER_EMAIL` and `SUPERUSER_PASSWORD` are set, an initial superuser will be created from env.
- This backend forwards form data to the `STRAPI_ENDPOINT` if configured.
- All admin dashboard pages require JWT authentication
- File preview supports PDFs, images (JPG, PNG, GIF)
- Files are stored in the `UPLOAD_DIR` (default: `uploads/`) on the VPS

Deployment options
------------------

PM2 (recommended for node process management):

- File: [tspl-admin-backend/ecosystem.config.js](tspl-admin-backend/ecosystem.config.js)
- Install PM2 and start:

```bash
npm install -g pm2
cd tspl-admin-backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # follow printed instructions to enable on boot
```

Systemd (example):

- Example unit file available at [tspl-admin-backend/deploy/tspl-admin.service](tspl-admin-backend/deploy/tspl-admin.service). Update `WorkingDirectory` and environment values before installing.
- Install and enable:

```bash
# copy unit file to /etc/systemd/system/ and edit paths/env
sudo cp deploy/tspl-admin.service /etc/systemd/system/tspl-admin.service
sudo systemctl daemon-reload
sudo systemctl enable --now tspl-admin.service
sudo journalctl -u tspl-admin -f
```

Security note: prefer storing secrets in environment variables managed by your VPS or use a secret manager. The unit file here is an example only.

