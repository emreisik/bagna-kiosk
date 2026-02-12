# Railway Monorepo Deployment - Hızlı Rehber

**Tek Railway service'te hem backend hem frontend çalışır.**

---

## 🚀 Deployment Adımları (5 Dakika)

### 1️⃣ Neon Database Hazırla

1. [Neon Console](https://console.neon.tech) → **Create Project**
2. Database name: `kiosk-production`
3. **Connection String** kopyala:
   ```
   postgresql://username:password@host.neon.tech/dbname?sslmode=require
   ```

---

### 2️⃣ GitHub Push

```bash
git add .
git commit -m "Railway monorepo deployment hazırlığı"
git push origin main
```

---

### 3️⃣ Railway Deploy

1. [Railway Dashboard](https://railway.app/dashboard) → **New Project**
2. **Deploy from GitHub repo** → Repository seç
3. **Root Directory:** BOŞ BIRAK (monorepo otomatik algılar)
4. Service name: `kiosk-fullstack`

---

### 4️⃣ Environment Variables Ekle

Railway dashboard → **Variables** tab → Aşağıdakileri ekle:

#### Backend Variables:

```env
DATABASE_URL=postgresql://... # Neon'dan kopyaladığın string
NODE_ENV=production
JWT_SECRET=BURAYA-64-KARAKTER-RANDOM-STRING
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:$PORT
```

**JWT_SECRET oluştur:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend Variables:

```env
VITE_API_URL=http://localhost:3001
```

**Save** → Railway otomatik re-deploy başlar

---

### 5️⃣ Test Et

**Build tamamlandığında (3-5 dakika):**

1. **Deployed URL**'i kopyala (örn: `https://kiosk-fullstack-production.up.railway.app`)

2. **Health Check Test:**

   ```bash
   curl https://YOUR-URL/health
   # Response: {"status":"ok","timestamp":"..."}
   ```

3. **Frontend Test:**
   - Browser'da URL'i aç
   - Products yüklendiğini kontrol et

4. **Admin Panel Test:**
   - `https://YOUR-URL/admin/login`
   - Giriş yap ve product ekle/düzenle

---

## ✅ Deployment Checklist

- [ ] Neon database oluşturuldu
- [ ] DATABASE_URL environment variable eklendi
- [ ] JWT_SECRET 64 karakter (güçlü)
- [ ] GitHub'a push edildi
- [ ] Railway build başarılı (Logs kontrol)
- [ ] Health check `/health` çalışıyor
- [ ] Frontend products yüklüyor
- [ ] Admin login çalışıyor

---

## 🔍 Sorun Giderme

### Build başarısız olursa:

**Railway Logs:** Dashboard → Service → **Deployments** → Deployment tıkla → **View Logs**

**Yaygın Hatalar:**

1. **`Prisma migrate failed`**
   - DATABASE_URL yanlış → Neon string'i kontrol et
   - Migration dosyaları eksik → `backend/prisma/migrations` klasörü var mı?

2. **`Cannot find module @rollup/...`**
   - Build phase sırası yanlış
   - `railway.toml` dosyasını kontrol et (backend önce build olmalı)

3. **`EADDRINUSE: port 3001`**
   - Start command'de `sleep 5` değerini artır (örn: `sleep 10`)

4. **Frontend API bağlanamıyor**
   - `VITE_API_URL=http://localhost:3001` doğru mu?
   - Backend başladı mı? (logs kontrol)

---

## 🔄 Kod Değişikliklerini Deploy Et

```bash
git add .
git commit -m "Yeni özellik eklendi"
git push origin main
```

Railway otomatik algılar ve re-deploy eder (2-3 dakika).

---

## 📊 Monorepo Nasıl Çalışıyor?

```
Railway Container:
┌─────────────────────────────────────┐
│  Backend (Express)                  │
│  Port: 3001                         │
│  Process ID: 1                      │
│  ↓                                  │
│  Health check: /health              │
│  API: /api/*                        │
├─────────────────────────────────────┤
│  Frontend (Vite Preview)            │
│  Port: $PORT (Railway dynamic)      │
│  Process ID: 2                      │
│  ↓                                  │
│  Serves: /                          │
│  Proxies to: http://localhost:3001 │
└─────────────────────────────────────┘
```

**Start Command:**

```bash
cd backend && npm start &  # Backend background'da başlar
sleep 5                    # Backend hazır olana kadar bekle
cd .. && npm run preview   # Frontend başlar
```

---

## 🎯 Production Best Practices

1. **Database Backups**
   - Neon otomatik backup yapar (7 gün retention)
   - Manuel backup: Neon Console → Database → **Backup**

2. **Monitoring**
   - Railway logs: Real-time error tracking
   - Health check: `/health` endpoint monitoring

3. **Secrets**
   - JWT_SECRET her environment'ta farklı olmalı
   - Local `.env` dosyaları `.gitignore`'da

4. **CORS**
   - Production URL'i backend CORS'a ekle:
     ```typescript
     // backend/src/middleware/cors.middleware.ts
     const allowedOrigins = [
       "http://localhost:5173",
       "https://YOUR-RAILWAY-URL",
     ];
     ```

---

## 📞 Yardım

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Neon Support:** https://neon.tech/docs
