# CPEMS - Coolman Power Environment Monitoring System

**Sistem Monitoring Suhu dan Kelembapan Real-time untuk Ruang Elektrikal**

---

## 📋 Deskripsi Proyek

CPEMS adalah sistem monitoring terpadu yang dirancang untuk memantau suhu dan kelembapan ruangan elektrikal kritis seperti:

- **Ruang PDB** (Power Distribution Board)
- **Ruang UPS** (Uninterruptible Power Supply)
- **Ruang Battery**
- Dan ruang-ruang elektrikal lainnya

Sistem ini menggunakan sensor **SHT31** dengan microcontroller **ESP32-C3 Super Mini** untuk pengumpulan data real-time dan mengirimkannya ke dashboard web yang dapat diakses oleh **Operator** dan **Teknisi** di lapangan.

---

## 🎯 Fitur Utama

### ✅ Sudah Tersedia

| Fitur | Status | Keterangan |
|-------|--------|------------|
| **📊 Dashboard Real-time** | ✅ | Overview suhu, kelembapan, alert count semua ruangan |
| **📈 Grafik Interaktif** | ✅ | Recharts chart dengan filter 1h/6h/24h/7d |
| **🔔 Alert Management** | ✅ | Filter server-side (severity, search, status), acknowledge |
| **📱 Multi-Device** | ✅ | Monitoring dari berbagai ruangan |
| **📋 Report Generation** | ✅ | Export CSV & PDF dengan date filter, pagination |
| **📱 Responsive Layout** | ✅ | Mobile card layout + Desktop table |
| **🔐 Admin Auth** | ✅ | httpOnly cookie session via env variable |
| **⚙️ Settings** | ✅ | Threshold temperature & humidity configuration |
| **⚠️ Toast Notifications** | ✅ | Feedback success/error/warning konsisten |

### 🔄 Dalam Pengembangan

- [ ] Multi-language support (EN, ID)
- [ ] Email & SMS notifications
- [ ] Advanced analytics & predictions
- [ ] Preventive maintenance alerts
- [ ] Data encryption hardening

---

## 🛠️ Tech Stack

### Frontend

| Teknologi       | Versi   | Fungsi                     |
| --------------- | ------- | -------------------------- |
| Next.js         | 16.2.7  | Full-stack React framework |
| React           | 19.2.4  | UI library                 |
| Tailwind CSS    | 4       | Styling framework          |
| Recharts        | 3.8.1   | Data visualization         |
| Shadcn/ui       | 4.10.0  | Component library          |
| Zustand         | 5.0.14  | State management           |
| TanStack Query  | 5.101.0 | Server state management    |
| SWR             | 2.4.1   | Data fetching & caching    |
| React Hook Form | 7.77.0  | Form management            |
| Lucide React    | -       | Icons                      |
| papaparse       | -       | CSV export                 |
| jspdf           | -       | PDF export                 |

### Backend & Database

| Teknologi          | Versi  | Fungsi               |
| ------------------ | ------ | -------------------- |
| Next.js API Routes | 16.2.7 | Backend API          |
| Prisma ORM         | 6.19.3 | Database abstraction |
| PostgreSQL         | -      | Database             |
| Supabase           | -      | Cloud DB & hosting   |

### Hardware

| Komponen        | Spesifikasi                    |
| --------------- | ------------------------------ |
| Microcontroller | ESP32-C3 Super Mini            |
| Sensor          | SHT31 (Temperature & Humidity) |
| Interface       | I2C (SCL: GPIO8, SDA: GPIO9)   |

---

## 📊 Arsitektur Database

### Model: Device

```prisma
model Device {
  id        String @id @default(cuid())
  deviceId  String @unique          // ID unik perangkat
  location  String                  // Lokasi ruangan (PDB, UPS, Battery, dll)
  lastSeen  DateTime?               // Terakhir kali online
  logs      SensorLog[]             // Relasi ke data sensor
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Model: SensorLog

```prisma
model SensorLog {
  id          String   @id @default(cuid())
  temperature Float    // Suhu dalam Celsius
  humidity    Float    // Kelembapan dalam %
  createdAt   DateTime @default(now())
  deviceId    String
  device      Device   @relation(fields: [deviceId], references: [deviceId])
}
```

### Model: Alert

```prisma
model Alert {
  id          String   @id @default(cuid())
  deviceId    String   // Device yang memicu alert
  location    String   // Lokasi ruangan
  type        String   // Jenis alert (HIGH_TEMP, LOW_HUMIDITY, dll)
  message     String   // Pesan detail
  severity    String   // Level: CRITICAL, WARNING
  createdAt   DateTime @default(now())
  acknowledged Boolean  @default(false) // Status penanganan
}
```

### Model: Settings

```prisma
model Settings {
  id                String @id @default(cuid())
  key               String @unique
  value             Json
  updatedAt         DateTime @updatedAt
}
```

---

## 🚀 Instalasi & Setup

### Prerequisites

- Node.js 18+
- npm atau yarn
- PostgreSQL 13+ (atau Supabase account)
- Git

### Langkah-langkah Instalasi

**1. Clone repository**

```bash
git clone <repository-url>
cd thermal-monitoring-system
```

**2. Install dependencies**

```bash
npm install
```

**3. Setup environment variables**

Buat file `.env.local` di root directory:

```env
# ========== DATABASE ==========
DATABASE_URL="postgresql://user:***@db.supabase.co:5432/postgres"
DIRECT_URL="postgresql://user:***@db.supabase.co:5432/postgres"

# ========== ADMIN ==========
# Password untuk mengakses dashboard admin
ADMIN_KEY="your-secure-admin-password"

# ========== API ==========
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

> **Keamanan**: `ADMIN_KEY` wajib di-set di environment variable Vercel untuk production. Jangan commit `.env` ke Git.

**4. Setup Database dengan Prisma**

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrations
npx prisma migrate dev

# (Optional) Seed database dengan data dummy
npx prisma db seed
```

**5. Jalankan development server**

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

---

## 📱 Panduan Penggunaan

### 🔐 Admin Access

Dashboard dilindungi password. Masukkan password yang sesuai dengan `ADMIN_KEY` di environment variable. Session berlaku 24 jam via httpOnly cookie.

### 🏠 Dashboard

- Overview suhu rata-rata, humidity rata-rata, total device, alert aktif
- Status perangkat online/offline
- Akses cepat ke semua halaman

### 👁️ Monitoring

- Grafik suhu & kelembapan real-time (refresh 30 detik)
- Filter berdasarkan ruangan (All, PDB, UPS, Battery)
- Rentang waktu: 1 Jam / 6 Jam / 24 Jam / 7 Hari
- Threshold line indicator

### 🔔 Alerts

- Server-side filtering (search, severity, status)
- Acknowledge alert dengan loading state
- Polling 30 detik
- Responsive card layout di mobile

### 📊 Reports

- 3 tipe laporan: Daily Summary, Detailed Logs, Alerts Report
- Filter tanggal, lokasi, severity
- Export CSV & PDF dengan format:
  - Tanggal WIB (DD/MM/YYYY HH:mm:ss)
  - Unit label (°C, %)
  - Pagination server-side
- Download dengan loading indicator

### ⚙️ Settings (Admin)

- Konfigurasi threshold suhu (min/max)
- Konfigurasi threshold humidity (min/max)
- Auto-save dengan Toast feedback

---

## 🔌 API Endpoints

### Dashboard APIs

| Method | Endpoint                    | Deskripsi                  |
| ------ | --------------------------- | -------------------------- |
| GET    | `/api/dashboard/overview`   | Overview semua device      |
| GET    | `/api/dashboard/monitoring` | Data monitoring real-time  |
| GET    | `/api/dashboard/alerts`     | Alerts dengan filter      |
| GET    | `/api/dashboard/chart`      | Data charts/grafik        |
| GET    | `/api/dashboard/devices`    | Daftar devices & status    |
| GET    | `/api/dashboard/reports`    | Data laporan               |

### Reports APIs

| Method | Endpoint              | Deskripsi                          |
| ------ | --------------------- | ---------------------------------- |
| GET    | `/api/reports/summary`  | Daily summary statistics          |
| GET    | `/api/reports/logs`     | Detailed sensor logs              |
| GET    | `/api/reports/alerts`   | Alert report (dengan stats total) |

### Sensor APIs

| Method | Endpoint                | Deskripsi              |
| ------ | ----------------------- | ---------------------- |
| GET    | `/api/sensors`          | Daftar semua sensor    |
| POST   | `/api/sensors`          | Tambah sensor baru     |
| GET    | `/api/sensors/:id`      | Detail sensor spesifik |
| POST   | `/api/sensors/:id/data` | Kirim data dari ESP32  |

### Auth APIs

| Method | Endpoint                    | Deskripsi                     |
| ------ | --------------------------- | ----------------------------- |
| POST   | `/api/auth/verify-admin`    | Verifikasi password admin     |
| GET    | `/api/auth/logout`          | Hapus session cookie          |

---

## 🔌 Setup Hardware (ESP32-C3)

### Koneksi Sensor SHT31 ke ESP32-C3

```
┌─────────────┐         ┌──────────────────┐
│   SHT31     │         │   ESP32-C3       │
├─────────────┤         ├──────────────────┤
│ VCC         ├────────→│ 3.3V             │
│ GND         ├────────→│ GND              │
│ SCL         ├────────→│ GPIO8 (I2C SCL)  │
│ SDA         ├────────→│ GPIO9 (I2C SDA)  │
└─────────────┘         └──────────────────┘
```

### Firmware Configuration

- Sensor membaca data setiap 30 detik
- Kirim ke API setiap 5 menit atau saat ada perubahan >1°C / >5% RH
- Auto-reconnect jika WiFi terputus
- Format data: JSON dengan `temperature`, `humidity`, `deviceId`

### Upload Firmware

1. Install Arduino IDE atau PlatformIO
2. Setup ESP32 board library
3. Konfigurasi WiFi dan API endpoint di firmware
4. Flash firmware ke device

---

## 📦 Build untuk Production

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm start
```

### Deployment ke Vercel

1. Push repository ke GitHub
2. Import project di Vercel
3. Set environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `ADMIN_KEY` → password dashboard
4. Deploy

---

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solusi:**
- Pastikan `DATABASE_URL` dan `DIRECT_URL` sudah benar
- Cek koneksi ke database server
- Test connection: `psql <DATABASE_URL>`
- Untuk Supabase, pastikan IP diizinkan di database settings

### Admin Password Tidak Cocok

**Solusi:**
- Pastikan `ADMIN_KEY` sudah di-set di environment variable
- Restart server setelah mengubah `.env`
- Untuk Vercel: set di dashboard → Environment Variables
- Password bersifat case-sensitive

### Sensor Data Tidak Muncul

**Solusi:**
- Cek ESP32 sudah terhubung ke WiFi (lihat serial monitor)
- Verify API endpoint di firmware sudah benar
- Cek network requests di browser DevTools
- Lihat server logs: `npm run dev`

### Device Offline

**Solusi:**
- Cek koneksi WiFi ESP32
- Verify API endpoint `/api/sensors/:id/data` accessible
- Check firewall rules
- Restart device atau reset WiFi

---

## 📋 Struktur Folder

```
thermal-monitoring-system/
├── src/
│   ├── app/
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/            # Auth (verify-admin, logout)
│   │   │   ├── dashboard/       # Dashboard APIs
│   │   │   ├── reports/         # Reports APIs
│   │   │   └── sensors/         # Sensor APIs
│   │   ├── dashboard/           # Dashboard Pages
│   │   │   ├── monitoring/
│   │   │   ├── alerts/
│   │   │   ├── devices/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/              # React Components
│   │   ├── cards/
│   │   ├── charts/
│   │   ├── tables/
│   │   ├── alerts/
│   │   ├── devices/
│   │   ├── filters/
│   │   └── ui/                  # Toast, dll
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Utilities & helpers
│   ├── services/                # API clients
│   └── types/                   # TypeScript types
├── prisma/
│   └── schema.prisma
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
└── ADMIN_ACCESS_SETUP.md
```

---

## 📈 Roadmap

### ✅ Tersedia
- ✅ Admin authentication dengan httpOnly cookie
- ✅ Dashboard overview real-time
- ✅ Monitoring dengan grafik interaktif
- ✅ Alert management dengan server-side filtering
- ✅ Report generation (CSV & PDF)
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Toast notification system
- ✅ Settings management

### 🔄 Rencana ke Depan
- [ ] Multi-language support (EN, ID)
- [ ] Email & SMS notifications
- [ ] Advanced analytics & ML predictions
- [ ] Mobile app (iOS/Android)
- [ ] Preventive maintenance alerts
- [ ] User role management (admin, operator, teknisi)
- [ ] Data encryption & security hardening

---

## 👥 Tim Pengembang

- **Project Owner**: Coolman / Facility Support Team
- **Area**: Technical Support & Facility Management
- **Status**: Production Ready (v1.0.0)
- **Last Updated**: Juni 2026

---

## 📝 Catatan Penting

⚠️ **ADMIN_KEY** wajib di-set di environment variable Vercel untuk production
💾 **Backup database** secara berkala untuk keamanan data historis
🔐 **Jangan commit `.env`** ke Git — gunakan `.env.example`
🔄 **Update firmware ESP32** secara berkala untuk patch security
📞 **Support**: Hubungi tim Technical Support untuk bantuan

---

## 🙋 Support & Feedback

Untuk pertanyaan, bug reports, atau feedback:

- 📧 Hubungi tim Technical Support
- 🐛 Buka issue di repository ini
- 💬 Chat dengan teknisi team

---

**Terima kasih sudah menggunakan CPEMS! 🎉**
