# 🕉️ Pandit Ji Vedic Astrology — Full Stack Website

A premium, production-ready portfolio + lead-generation website for a Vedic astrologer, built with:

- **Frontend:** HTML5, CSS3 (custom saffron/gold/maroon "Sanatani" design system), vanilla JavaScript (no framework, no build step)
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB Atlas (free M0 tier)
- **Auth:** JWT-based admin login
- **File uploads:** Multer (gallery images, Panchang PDFs)
- **Deployment target:** Render.com free tier (single web service serves both API and static frontend)

---

## 1. What's included

```
vedic-astrology/
├── backend/                  Express API + MongoDB models
│   ├── config/db.js          MongoDB Atlas connection
│   ├── models/                Admin, Service, Testimonial, Article, GalleryImage,
│   │                          Panchang, Review, Contact, KundaliRequest
│   ├── routes/                REST endpoints for every model (public + admin)
│   ├── middleware/             JWT auth guard, Multer upload, error handler
│   ├── utils/mailer.js        Optional email notifications (Nodemailer)
│   ├── scripts/seed.js        Creates first admin user + sample services
│   ├── server.js              App entry point (also serves the frontend statically)
│   └── package.json
├── frontend/                  Static site (served by the same Express app)
│   ├── index.html, about.html, services.html, gallery.html,
│   │   blog.html, blog-single.html, contact.html
│   ├── admin/login.html, admin/dashboard.html   Password-protected CMS
│   ├── css/style.css          Design system (saffron / gold / deep maroon)
│   ├── js/config.js, api.js, partials.js, main.js, admin.js
│   ├── robots.txt, sitemap.xml
│   └── images/                (add your own photos — see images/README.md)
└── .gitignore
```

### Features implemented
- Responsive, animated, temple-inspired luxury UI (saffron/gold/maroon palette)
- Service showcase (Kundali, Graha Shanti, Anushthan/Jaap, Griha Pravesh, Vastu, Pujas) — fully editable from admin
- Handwritten 15-page Kundali request form → stored as a lead in MongoDB + optional email alert
- WhatsApp-first CTAs throughout (floating button, hero, forms, service cards)
- Testimonials + public review submission (moderated via admin approval)
- Gallery with category filters, image upload via admin
- Blog / Knowledge Center with categories, pagination, single-article pages
- Monthly Panchang PDF upload + public download list
- Experience timeline, FAQ accordion, scroll animations, loading skeletons
- Contact form with rate limiting + validation
- JWT-protected Admin Dashboard: manage services, articles, testimonials, reviews,
  gallery, Panchang PDFs, and view/manage Kundali + contact leads
- SEO: meta tags, Open Graph tags, JSON-LD schema markup, robots.txt, sitemap.xml
- Security: Helmet, rate limiting, Mongo sanitization, XSS cleaning, bcrypt password hashing, input validation

---

## 2. Run it locally first (recommended before deploying)

**Prerequisites:** Node.js 18+, a free MongoDB Atlas account.

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MongoDB URI, JWT secret, admin email/password (see Section 3)
npm run seed     # creates your first admin login + sample services
npm run dev       # starts on http://localhost:5000
```

Open `http://localhost:5000` — the same Express server serves the frontend, so the whole site works from one URL. Visit `http://localhost:5000/admin/login.html` to log into the dashboard using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`.

---

## 3. MongoDB Atlas Setup (Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Click **"Build a Database"** → choose the **M0 Free** shared cluster → pick a cloud provider/region close to your users (e.g. Mumbai `ap-south-1` for India) → **Create**.
3. **Database Access** (left sidebar) → **Add New Database User**:
   - Authentication method: Password
   - Username/password: choose something strong, save it — you'll need it in the connection string
   - Role: "Read and write to any database"
4. **Network Access** (left sidebar) → **Add IP Address** → choose **"Allow Access from Anywhere"** (`0.0.0.0/0`) — required because Render's IPs are dynamic on the free tier.
5. Go back to **Database** → click **Connect** on your cluster → **Drivers** → copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Insert your database name before the `?`, e.g.:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/vedic_astrology?retryWrites=true&w=majority
   ```
   This becomes your `MONGO_URI`.

---

## 4. Environment Configuration

Copy `backend/.env.example` to `backend/.env` and fill in every value:

| Variable | What it is |
|---|---|
| `MONGO_URI` | Your Atlas connection string from Step 3 |
| `JWT_SECRET` | Any long random string (e.g. generate with `openssl rand -hex 32`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials for your first admin login (used once by `npm run seed`) |
| `CLIENT_URL` | Your deployed site URL (fill this in after you deploy — see Step 6) |
| `BUSINESS_WHATSAPP_NUMBER` | Full number with country code, no `+` or spaces, e.g. `919999999999` |
| `BUSINESS_PHONE`, `BUSINESS_EMAIL` | Shown in emails |
| `SMTP_*` | Optional — only needed if you want email alerts for new leads. A Gmail "App Password" works well. Leave blank to skip email notifications entirely (the site works fine without it). |

**Important:** also update the WhatsApp number and phone number hardcoded in:
- `frontend/js/config.js` (`WHATSAPP_NUMBER`, `PHONE_NUMBER`, business name/email/address)
- Every `wa.me/919999999999` and `tel:+919999999999` link in the HTML files (find & replace is fastest)
- The JSON-LD schema block and meta tags in `index.html` (replace `panditjiastrology.com` with your real domain)

Never commit your real `.env` file — `.gitignore` already excludes it.

---

## 5. Upload the Project to GitHub

```bash
cd vedic-astrology
git init
git add .
git commit -m "Initial commit: Vedic Astrology website"
```

1. Create a new **empty** repository on https://github.com/new (do not initialize with a README).
2. Copy the commands GitHub shows you (or run):
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git branch -M main
   git push -u origin main
   ```

---

## 6. Deploy to Render (Free Tier)

1. Go to https://render.com and sign up (you can sign in with GitHub directly).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and select the repository you just pushed.
4. Configure the service:
   - **Name:** e.g. `pandit-ji-astrology`
   - **Root Directory:** `backend`  ⟵ important, since server.js lives there and also serves the frontend folder
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Under **Environment Variables**, add every variable from your `backend/.env` file (`MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_URL`, `BUSINESS_*`, `SMTP_*` if used). Set `NODE_ENV` to `production`.
   - For `CLIENT_URL`, use the Render URL Render will assign, e.g. `https://pandit-ji-astrology.onrender.com` (you can update this after the first deploy once you know the URL).
6. Click **Create Web Service**. Render will build and deploy automatically — this takes a few minutes.
7. Once live, open a **Shell** on the Render service (top right, "Shell" tab) and run:
   ```bash
   npm run seed
   ```
   This creates your admin user and sample services in the live Atlas database.
8. Visit `https://your-app.onrender.com` to see your live site, and `https://your-app.onrender.com/admin/login.html` to log into the dashboard.

**Note on the free tier:** Render's free web services spin down after ~15 minutes of inactivity and take ~30-60 seconds to wake up on the next request. This is normal and fine for a low-to-medium traffic portfolio site. If you outgrow it, upgrade to a paid instance for always-on hosting.

---

## 7. Connect Your Custom Domain + SSL

1. Buy a domain (GoDaddy, Namecheap, Google Domains, etc.) if you don't have one.
2. In your Render service, go to **Settings → Custom Domains → Add Custom Domain**, and enter your domain (e.g. `www.panditjiastrology.com`).
3. Render will show you a CNAME (for `www`) or A/ALIAS record (for the root domain) to add.
4. Go to your domain registrar's DNS settings and add the record(s) Render gave you.
5. DNS propagation can take a few minutes to a few hours. Once it resolves, Render **automatically issues and renews a free SSL certificate** (via Let's Encrypt) — no extra steps needed. Your site will be served over `https://` automatically.
6. Update `CLIENT_URL` in your Render environment variables to your final domain, and update `<link rel="canonical">`, Open Graph URLs, and `sitemap.xml`/`robots.txt` to use the real domain too. Redeploy (Render redeploys automatically on env var changes or new git pushes).

---

## 8. Production Launch Checklist

- [ ] Replace all placeholder images in `frontend/images/` (see `frontend/images/README.md`)
- [ ] Replace the WhatsApp number, phone number, email, and address everywhere (config.js + HTML files)
- [ ] Change the default admin password immediately after first login (add a "change password" flow, or update `ADMIN_PASSWORD` in Atlas via the seed script logic if needed)
- [ ] Add real services, testimonials, articles, and gallery photos via the Admin Dashboard
- [ ] Update `sitemap.xml` and `robots.txt` with your live domain
- [ ] Submit your sitemap to Google Search Console (`https://search.google.com/search-console`)
- [ ] Test all forms (Kundali request, contact, review) end-to-end on the live site
- [ ] Test the admin dashboard login, CRUD operations, and file uploads on the live site
- [ ] Verify mobile responsiveness on a real phone
- [ ] (Optional) Set up SMTP so you get email alerts for every new lead
- [ ] (Optional) Add Google Analytics / Search Console verification tags to `<head>` of each page

---

## 9. Notes on scaling beyond the free tier

- **File storage:** Uploaded images/PDFs are currently stored on Render's local disk, which is **ephemeral on the free tier** (files can be lost on redeploy/restart). For a production launch with real content, migrate uploads to a persistent store like **Cloudinary** (free tier available) or an S3-compatible bucket — the `middleware/upload.js` file is the only place you'd need to change.
- **MongoDB Atlas M0** free tier has a 512MB storage cap — more than enough for this site's content (text + metadata; images/PDFs live outside the database).
- **Render free tier** sleeps when idle; upgrade to a paid instance ($7/mo+) for zero cold-start latency once the business is live and traffic grows.

---

## 10. Support reference

- Express docs: https://expressjs.com/
- MongoDB Atlas docs: https://www.mongodb.com/docs/atlas/
- Render docs: https://render.com/docs
- Mongoose docs: https://mongoosejs.com/docs/

🙏 Built with devotion for authentic Sanatan Dharma guidance.
