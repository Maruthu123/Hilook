# Nisha Boutique – Local + Live (Netlify + Render) steps

## 0. Enna maathirukku
| Problem | Fix |
|---|---|
| Live site `localhost:5000` ku call pannudhu | `frontend/src/api/index.js` – live build la Render URL use pannum, localhost ku povadhu. `AdminDashboard.jsx`, `CategoryPage.jsx` kum same URL. `frontend/.env.production` add. |
| Admin login / products CORS | `backend/src/server.js` – `FRONTEND_URL` la comma vechu pala URL podalam; blocked-na log la theriyum |
| manifest.json 401 | `index.html` la `crossorigin="use-credentials"` |
| Cash on Delivery | Code delete pannala – switch OFF (`ALLOW_COD=false`, `REACT_APP_ENABLE_COD=false`). Backend um COD reject pannum |
| Online payment | Razorpay TEST keys. Test mode la "no real money" note checkout la varum |

## 1. Local la run
```bash
npm run install:all
# backend/.env la (unga existing .env la) ithu add pannunga:
#   ALLOW_COD=false
#   RAZORPAY_KEY_ID=rzp_test_xxxxx
#   RAZORPAY_KEY_SECRET=xxxxx
npm run dev          # backend :5000, frontend :3000
```
Check: http://localhost:5000/api/health → `{"status":"OK"}`;  http://localhost:3000 → products; Login → Admin Login → `/admin`.

## 2. Razorpay TEST keys edukka
1. https://dashboard.razorpay.com → sign up (test mode ku KYC vendaam)
2. Top la **Test Mode** ON → Account & Settings → **API Keys** → Generate Test Key
3. `Key Id` (rzp_test_...) + `Key Secret` → `backend/.env` la podunga
Test payment: UPI `success@razorpay` | Card `4111 1111 1111 1111`, any future date, any CVV, OTP `1234` (if asked)
Live payment venum-na (client OK sonna aprom): Razorpay KYC mudichu `rzp_live_` keys → Render env la maathunga. Code maatha vendaam.

## 3. GitHub push
```bash
git add .
git commit -m "fix live API url, CORS, online payment only"
git push
```
`backend/.env` push aagakoodathu (.gitignore la irukku). 

## 4. Render (backend)
Service settings: Root Directory `backend` | Build `npm install` | Start `npm start`
Environment variables (Render → Environment):
```
DATABASE_URL      = (Neon connection string)
NODE_ENV          = production
FRONTEND_URL      = https://hilookboutique.netlify.app      (no trailing /)
JWT_SECRET        = (long random text)
ADMIN_EMAIL       = boutiquehilook965@gmail.com
ADMIN_PASSWORD    = (admin password)
EMAIL_HOST=smtp.gmail.com  EMAIL_PORT=587  EMAIL_USER=...  EMAIL_PASS=(Gmail app password)  EMAIL_FROM=...
ALLOW_COD         = false
RAZORPAY_KEY_ID   = rzp_test_...
RAZORPAY_KEY_SECRET = ...
```
PORT set pannathinga (Render thaane tharum). Save → **Manual Deploy → Deploy latest commit**.
Check: https://hilook-boutique.onrender.com/api/health → `{"status":"OK"}`
(Free plan: 15 min idle na sleep aagum, first request 30-60 sec edukkum – wait pannunga.)

## 5. Netlify (frontend)
Build settings (netlify.toml already irukku): base `frontend`, command `npm run build`, publish `build`.
Site configuration → Environment variables:
```
REACT_APP_API_URL    = https://hilook-boutique.onrender.com     (no trailing /)
REACT_APP_ENABLE_COD = false
```
Deploys → **Trigger deploy → Clear cache and deploy site**.
Site configuration → Access & security → Visitor access/password protection ON-na, client ku password kudunga illa OFF pannunga.

## 6. Live test (client ku link anupurathuku munnaadi)
1. Netlify link open → Ctrl+Shift+R
2. Home la products varanum (first time 60 sec wait aagalam)
3. Login → Admin Login → Dashboard open aaganum
4. User register → OTP → product → Order → Pay Online → success@razorpay → order "Paid / Confirmed"
5. F12 → Network → requests ellam `hilook-boutique.onrender.com` ku pogudha paarunga

## 7. Error vandhaa
| Error | Reason |
|---|---|
| `ERR_CONNECTION_REFUSED localhost` | Netlify la old build – Clear cache deploy |
| `blocked by CORS policy` | Render `FRONTEND_URL` thappu – exact Netlify URL, `/` illama; redeploy |
| `Cannot reach the server` / loading nonstop | Render sleep / deploy fail – Render Logs paarunga |
| `Invalid admin credentials` | Render `ADMIN_EMAIL`/`ADMIN_PASSWORD` paarunga. Reset: Render Shell → `cd backend && npm run seed` |
| Online payment "Not available" | Render la `RAZORPAY_KEY_ID/SECRET` illa |

## 8. Security
`.env` la unga Neon password, Gmail app password irukku – chat/zip/GitHub la share pannina **rotate** pannunga (Neon reset password, Gmail app password regenerate, JWT_SECRET maathunga).
