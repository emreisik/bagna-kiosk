# Railway Deployment Rehberi

Bu proje **iki ayrı Railway service** olarak deploy edilmelidir:

1. **Backend API** (Express + Prisma + Neon PostgreSQL)
2. **Frontend** (Vite + React)

---

## 📋 Ön Hazırlık

### 1. Neon PostgreSQL Database

- [Neon Console](https://console.neon.tech)'dan yeni bir database oluştur
- Connection string'i kopyala (başlangıcı: `postgresql://...`)

### 2. Railway Account

- [Railway.app](https://railway.app)'e kaydol/giriş yap
- GitHub hesabını bağla

---

## 🚀 Deployment Adımları

### ADIM 1: GitHub'a Push

```bash
git add .
git commit -m "Railway deployment hazırlığı"
git push origin main
```

### ADIM 2: Backend Service Deploy

1. **Railway Dashboard** → **New Project** → **Deploy from GitHub repo**
2. Repository'ni seç: `kiosk`
3. **Root Directory** ayarla: `backend` (ÖNEMLİ!)
4. Service adını düzenle: `kiosk-backend`

#### Environment Variables Ekle:

Railway dashboard → `kiosk-backend` service → **Variables** tab:

```env
DATABASE_URL=postgresql://...  # Neon'dan aldığın connection string
NODE_ENV=production
JWT_SECRET=en-az-32-karakter-uzun-guclu-random-string-buraya
JWT_EXPIRES_IN=7d
FRONTEND_URL=${{frontend.RAILWAY_PUBLIC_DOMAIN}}  # Railway otomatik doldurur
PORT=${{PORT}}  # Railway otomatik set eder
```

**JWT_SECRET oluşturmak için:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

5. **Deploy** butonuna tıkla
6. Build tamamlanınca **Deployed URL**'i kopyala (örn: `https://kiosk-backend-production.up.railway.app`)
7. Test et: `https://YOUR-BACKEND-URL/health` → `{"status":"ok"}` görmeli

---

### ADIM 3: Frontend Service Deploy

1. **Railway Dashboard** → **New Project** → **Deploy from GitHub repo**
2. Aynı repository'yi seç: `kiosk`
3. **Root Directory** BOŞTA BIRAK (root klasör)
4. Service adını düzenle: `kiosk-frontend`

#### Environment Variables Ekle:

Railway dashboard → `kiosk-frontend` service → **Variables** tab:

```env
VITE_API_URL=https://YOUR-BACKEND-URL  # Adım 2'de kopyaladığın backend URL
```

**ÖNEMLİ:** `VITE_API_URL` sonunda `/` olmamalı!

5. **Deploy** butonuna tıkla
6. Build tamamlanınca **Deployed URL**'i kopyala (örn: `https://kiosk-frontend-production.up.railway.app`)

---

### ADIM 4: CORS Ayarları Güncelle

Backend CORS ayarlarında frontend URL'ini whitelist'e ekle:

**Dosya:** `backend/src/middleware/cors.middleware.ts`

```typescript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5177",
  "https://YOUR-FRONTEND-URL", // Railway frontend URL'ini buraya ekle
];
```

Değişikliği commit + push et → Railway otomatik re-deploy eder.

---

### ADIM 5: Backend'e Frontend URL Ekle

Backend environment variables'a git:

Railway dashboard → `kiosk-backend` → **Variables**:

```env
FRONTEND_URL=https://YOUR-FRONTEND-URL  # Adım 3'ten aldığın URL
```

Save → Railway otomatik re-deploy eder.

---

## ✅ Deployment Testi

### Backend Test:

```bash
curl https://YOUR-BACKEND-URL/health
# Response: {"status":"ok","timestamp":"...","env":"production"}

curl https://YOUR-BACKEND-URL/api/products?limit=1
# Response: {"data":[...],"pagination":{...}}
```

### Frontend Test:

1. Browser'da `https://YOUR-FRONTEND-URL` aç
2. Products yüklendiğini kontrol et (Network tab → API calls)
3. Admin panele giriş yap: `https://YOUR-FRONTEND-URL/admin/login`

---

## 🔍 Troubleshooting

### Backend build başarısız olursa:

**Error:** `Cannot find module @rollup/rollup-linux-x64-gnu`

- **Sebep:** Vite frontend ile karışma
- **Çözüm:** Root directory'nin `backend` olduğundan emin ol

**Error:** `Prisma migrate failed`

- **Sebep:** DATABASE_URL yanlış
- **Çözüm:** Neon connection string'i kontrol et, başına `postgresql://` ekli mi?

**Error:** `EADDRINUSE: address already in use`

- **Sebep:** PORT conflict
- **Çözüm:** Environment variable'da `PORT=${{PORT}}` olduğundan emin ol

### Frontend build başarısız olursa:

**Error:** `VITE_API_URL is not defined`

- **Sebep:** Environment variable eksik
- **Çözüm:** Railway Variables tab'dan `VITE_API_URL` ekle

**Error:** `Failed to fetch products`

- **Sebep:** Backend URL yanlış veya CORS
- **Çözüm:**
  1. `VITE_API_URL` doğru mu? (sonunda `/` yok)
  2. Backend CORS whitelist'e frontend URL eklenmiş mi?

---

## 📊 Monorepo Alternatifi (İsteğe Bağlı)

Tek bir Railway service kullanmak istersen:

1. **Root Directory:** Boş bırak
2. **Build Command:**
   ```bash
   cd backend && npm ci && npm run build && cd .. && npm ci && npm run build
   ```
3. **Start Command:**
   ```bash
   (cd backend && npm start) & npm run preview -- --host 0.0.0.0 --port 8080
   ```

**Not:** Bu yaklaşım önerilmez çünkü:

- Scaling zorlaşır
- Environment variables karışır
- Debugging zor

---

## 🎯 Production Checklist

Backend service:

- [ ] DATABASE_URL Neon'dan alındı
- [ ] JWT_SECRET güçlü (min 64 karakter)
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL doğru
- [ ] Health check çalışıyor: `/health`

Frontend service:

- [ ] VITE_API_URL backend URL'i ile ayarlandı
- [ ] Products yükleniyor
- [ ] Admin login çalışıyor
- [ ] Images görünüyor

CORS:

- [ ] Backend CORS'ta frontend URL whitelist'te
- [ ] Preflight requests (OPTIONS) çalışıyor

---

## 🔄 Re-deployment

Kod değişikliği yaptığında:

```bash
git add .
git commit -m "Değişiklik açıklaması"
git push origin main
```

Railway otomatik olarak:

1. Commit'i algılar
2. Build başlatır
3. Deploy eder
4. Health check yapar

**Not:** Railway free tier monthly 500 saat sunuyor, deployment başına ~2-3 dakika build süresi.

---

## 📞 Yardım

Railway logs görüntüle:

- Dashboard → Service seç → **Deployments** tab → Deployment tıkla → **View Logs**

Railway support:

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
