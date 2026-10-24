# Nisha Boutique — Neon (PostgreSQL) Version

Frontend: React · Backend: Node/Express · Database: **Neon PostgreSQL** (MongoDB ippo thevai illa)
Footer: © Nexora Solution – Thiruchuli

## 1. Neon database set panna (5 nimisham)
1. https://neon.tech → Sign up → **Create project**
2. Dashboard la **Connection string** copy pannunga (`postgresql://...neon.tech/neondb?sslmode=require`)
3. `backend/.env.example` ah copy panni `backend/.env` nu peru maathunga
4. `DATABASE_URL=` kitta andha string ah paste pannunga

## 2. Run panna
```bash
npm run install:all      # backend + frontend packages
cd backend && npm run seed   # tables create + admin account + sample products
cd .. && npm run dev     # backend :5000, frontend :3000
```
Tables ellam automatic ah create aagum (server start aagum pothum `migrate` odum).
Neon SQL Editor la manual ah run panna nenacha `backend/src/db/schema.sql` paste pannunga.

## 3. Login
| Yaaru | Epdi | Enga pogum |
|---|---|---|
| **Admin** | Login page → **Admin Login** tab → `boutiquehilook965@gmail.com` / `Hilook@123` | `/admin` Dashboard |
| **User** | Login page → **User Login** tab → email + password → **OTP** (email) | `/orders` Order Tracking |
| **New user** | Create Account → details → OTP verify | `/orders` |

* User ku dashboard open aagathu (frontend + backend rendum block). Admin password `.env` la `ADMIN_PASSWORD` la maathalam, `npm run seed` panna reset aagum.
* **OTP email**: `.env` la `EMAIL_USER` + `EMAIL_PASS` (Gmail App Password) kudunga. Kudukkala na OTP server console la theriyum (development la screen la um varum).

## 4. Neon tables (thani thaniya)
| Table | Enna store aagum |
|---|---|
| `users` | customers + admin, login count, last login |
| `login_history` | ovvoru login / register / admin login attempt (IP, success/fail) |
| `otp_codes` | hashed OTP, expiry, attempts |
| `addresses` | saved addresses |
| `categories`, `products` | catalog (sizes, colors, images, stock) |
| `reviews`, `wishlist`, `coupons`, `banners` | extras |
| `orders`, `order_items` | order + items snapshot |
| `order_tracking` | status timeline (Placed → Delivered) – user tracking page la therum |
| `payments` | COD / Razorpay payment records |
| `testimonials`, `contact_messages` | Happy customers, contact form |

## 5. Payment
* Online only (Razorpay). Cash on Delivery is switched OFF (`ALLOW_COD=false`, `REACT_APP_ENABLE_COD=false`).
* Use `rzp_test_` keys for testing. See DEPLOY_STEPS.md.

## 6. Deploy
* Backend (Render/Railway): env variables ellam add pannunga, `FRONTEND_URL` = unga site URL, `NODE_ENV=production`
* Frontend (Vercel/Netlify): `REACT_APP_API_URL` = backend URL, build `npm run build`


Full step-by-step: **DEPLOY_STEPS.md**
