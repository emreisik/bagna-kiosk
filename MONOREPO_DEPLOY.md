# Railway Monorepo Deployment - Yeni Architecture

**✨ Tek Backend Process: Backend hem API hem Frontend'i serve eder**

---

## 🏗️ Architecture Değişikliği

### Eski Yaklaşım (❌ ÇALIŞMIYORDU):

```
Railway Container:
┌─────────────────────────────────────┐
│ Backend (Port 3001) - Background    │ ← Internal, dışarıya kapalı
├─────────────────────────────────────┤
│ Frontend (Port $PORT) - Foreground  │ ← External, ama API'ye ulaşamıyor!
└─────────────────────────────────────┘
```

**Problem:** Railway sadece $PORT'u expose eder. Frontend static server API isteklerini handle edemez!

### Yeni Yaklaşım (✅ ÇALIŞIR):

```
Railway Container:
┌─────────────────────────────────────┐
│ Backend Express (Port $PORT)        │ ← Tek process
│ ├─ /api/* → API routes              │
│ ├─ /health → Health check           │
│ └─ /* → Frontend static files       │
└─────────────────────────────────────┘
```

**Çözüm:** Backend Express, production'da frontend `dist/` klasörünü static olarak serve eder!

---

## 🚀 Deployment Adımları

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
git commit -m "Railway monorepo deployment - single process architecture"
git push origin main
```

---

### 3️⃣ Railway Deploy

1. [Railway Dashboard](https://railway.app/dashboard) → **New Project**
2. **Deploy from GitHub repo** → Repository seç
3. **Root Directory:** BOŞ BIRAK (monorepo otomatik algılar)
4. Service name: `bagna-kiosk`

---

### 4️⃣ Environment Variables Ekle

Railway dashboard → **Variables** tab → **SADECE** aşağıdakileri ekle:

```env
DATABASE_URL=postgresql://...  # Neon'dan kopyaladığın connection string
NODE_ENV=production
JWT_SECRET=BURAYA-64-KARAKTER-RANDOM-STRING
JWT_EXPIRES_IN=7d
```

**JWT_SECRET oluştur:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**⚠️ ÖNEMLİ NOTLAR:**

- ❌ **PORT** ekleme! Railway otomatik sağlar
- ❌ **FRONTEND_URL** gerekli değil (same-origin)
- ❌ **VITE_API_URL** environment variable olarak ekleme (build-time variable, `.env.production`'da tanımlı)

**Save** → Railway otomatik re-deploy başlar

---

### 5️⃣ Test Et

**Build tamamlandığında (3-5 dakika):**

1. **Deployed URL**'i kopyala (örn: `https://bagna-kiosk-production.up.railway.app`)

2. **Health Check Test:**

   ```bash
   curl https://YOUR-URL/health
   # Response: {"status":"ok","timestamp":"..."}
   ```

3. **Frontend Test:**
   - Browser'da URL'i aç
   - Products yüklendiğini kontrol et
   - API isteklerini Network tab'den izle (`/api/products` same-origin)

4. **Admin Panel Test:**
   - `https://YOUR-URL/admin/login`
   - Giriş yap ve product ekle/düzenle

---

## ✅ Deployment Checklist

- [ ] Neon database oluşturuldu
- [ ] DATABASE_URL environment variable eklendi
- [ ] JWT_SECRET 64 karakter (güçlü)
- [ ] NODE_ENV=production set edildi
- [ ] ❌ PORT manuel eklenmedi (Railway otomatik)
- [ ] GitHub'a push edildi
- [ ] Railway build başarılı (Logs kontrol)
- [ ] Health check `/health` çalışıyor (200 OK)
- [ ] Frontend açılıyor (index page)
- [ ] Products yükleniyor (API istekleri çalışıyor)
- [ ] Admin login çalışıyor

---

## 🔍 Sorun Giderme

### Build başarısız olursa:

**Railway Logs:** Dashboard → Service → **Deployments** → Deployment tıkla → **View Logs**

**Yaygın Hatalar:**

#### 1. **`Prisma migrate failed`**

```
Error: P1001: Can't reach database server
```

**Çözüm:**

- DATABASE_URL doğru mu? Neon string'i kontrol et
- Neon database açık mı? Console'da kontrol et
- Migration dosyaları var mı? `backend/prisma/migrations/` kontrol et

#### 2. **`Cannot find module @rollup/...`**

```
Error: Cannot find package @rollup/rollup-linux-x64-gnu
```

**Çözüm:**

- Vite, Tailwind devDependencies'ten dependencies'e taşındı mı?
- `package.json` kontrol et: `@tailwindcss/vite`, `vite`, `tailwindcss` dependencies'te olmalı

#### 3. **Healthcheck failing**

```
Healthcheck attempt #1 failed with service unavailable
```

**Çözüm:**

- Runtime logs kontrol et (Build değil!)
- Backend başladı mı? → `🚀 Server running on` mesajını ara
- PORT Railway'den geliyor mu? → Log'da `PORT=XXXXX` görünmeli
- DATABASE_URL bağlantısı başarılı mı? → Connection error var mı?

#### 4. **Frontend API bağlanamıyor**

```
Failed to fetch /api/products
```

**Çözüm:**

- Frontend build sırasında `.env.production` dosyası okundu mu?
- `VITE_API_URL=/api` relative path olmalı
- Browser Network tab'de istekler `https://YOUR-URL/api/products` şeklinde olmalı

---

## 🔄 Kod Değişikliklerini Deploy Et

```bash
git add .
git commit -m "Yeni özellik eklendi"
git push origin main
```

Railway otomatik algılar ve re-deploy eder (2-3 dakika).

---

## 📊 Yeni Architecture Detayları

### Build Process (Railway):

```bash
# 1. Setup Phase
nixPkgs = ["nodejs-20_x", "npm-10_x"]

# 2. Install Phase
cd backend && npm ci && cd ..  # Backend dependencies
npm ci                          # Frontend dependencies

# 3. Build Phase
cd backend && npm run build:prod  # Prisma generate + migrate + tsc compile
npm run build                     # Vite build → dist/ klasörü oluşur

# 4. Start (Deploy Phase)
cd backend && npm start  # Express başlar, dist/ klasörünü serve eder
```

### Runtime Architecture:

```javascript
// backend/src/app.ts
app.use("/api", apiRoutes); // API endpoints
app.use(express.static("../../dist")); // Frontend static files (production)
app.get("*", (req, res) => {
  res.sendFile("../../dist/index.html"); // SPA routing
});
```

**Single Process Benefits:**

✅ Railway tek PORT kullanır (complexity yok)
✅ CORS problemi yok (same-origin)
✅ Healthcheck doğrudan backend'e gider
✅ Frontend build static dosya, runtime'da dependency yok

---

## 🎯 Environment Variables Özet

### Railway'de SADECE Şunlar:

```env
DATABASE_URL=postgresql://...
NODE_ENV=production
JWT_SECRET=64-chars-random
JWT_EXPIRES_IN=7d
```

### Frontend Build-Time (.env.production):

```env
VITE_API_URL=/api
```

Bu dosya repository'de commit edilmiş, Railway build sırasında otomatik kullanılır.

### EKLEME:

- ❌ PORT (Railway otomatik sağlar)
- ❌ FRONTEND_URL (gerekli değil)
- ❌ VITE_API_URL (build-time variable, zaten .env.production'da var)

---

## 🔐 Security Best Practices

1. **JWT_SECRET**
   - Her environment farklı olmalı
   - Minimum 64 karakter
   - Random hex string (crypto.randomBytes)

2. **Database**
   - Neon otomatik SSL (sslmode=require)
   - Connection pooling enabled
   - Auto-backup (7 gün retention)

3. **CORS**
   - Production: Same-origin (CORS gereksiz)
   - Development: localhost:\* allowed

4. **Helmet CSP**
   - Production'da aktif
   - Vite inline scripts için `unsafe-inline` allowed

---

## 📞 Yardım

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Neon Support:** https://neon.tech/docs
- **Prisma Migration:** https://www.prisma.io/docs/concepts/components/prisma-migrate

---

## 🎉 Success!

Deployment başarılı olduğunda:

```bash
✅ Build completed (3-5 minutes)
✅ Healthcheck passing (/health → 200 OK)
✅ Frontend serving from https://YOUR-URL/
✅ API responding at https://YOUR-URL/api/products
✅ Admin panel accessible at https://YOUR-URL/admin
```

**Enjoy your full-stack kiosk app! 🚀**
