# CPEMS - Coolman Power Environment Monitoring System

**Sistem Monitoring Suhu dan Kelembapan Real-time untuk Ruang Elektrikal**

---

## 📋 Deskripsi Proyek

CPEMS adalah sistem monitoring terpadu yang dirancang untuk memantau suhu dan kelembapan ruangan elektrikal kritis di lingkungan industri:

- **Ruang PDB** (Power Distribution Board)
- **Ruang UPS** (Uninterruptible Power Supply)
- **Ruang Battery**

Sistem ini menggunakan sensor **SHT31** dengan microcontroller **ESP32-C3 Super Mini** untuk pengumpulan data real-time dan mengirimkannya ke dashboard web yang dapat diakses oleh **Operator** dan **Teknisi** di lapangan.

---

## 🎯 Fitur Utama

### ✅ Sudah Tersedia

| Fitur | Status | Keterangan |
|-------|--------|------------|
| **📊 Dashboard Real-time** | ✅ | Overview suhu, kelembapan, alert count semua ruangan dengan gradient accent cards |
| **📈 Grafik Interaktif** | ✅ | Recharts chart dengan threshold zones, time alignment per-menit, filter 1h/6h/24h/7d |
| **👁️ Monitoring Real-time** | ✅ | Chart adaptif dengan sparklines, WIB timezone, threshold reference lines |
| **🔔 Alert Management** | ✅ | Pill button filter (severity, status), acknowledge, debounce search, optimistic update |
| **📱 Multi-Device** | ✅ | Grid cards dengan search, filter, sort, dan detail modal per device |
| **📋 Report Generation** | ✅ | 3 tipe laporan (Daily Summary, Detailed Logs, Alerts), export CSV & PDF dengan date range picker |
| **📱 Responsive Layout** | ✅ | Mobile card ↔ Desktop table, dark mode konsisten |
| **🔐 Admin Auth** | ✅ | Server-side password verification (ADMIN_KEY), httpOnly cookie session, rate limiting |
| **⚙️ Settings** | ✅ | Threshold suhu & humidity, data retention (7-365 hari), auto cleanup |
| **⚠️ Toast Notifications** | ✅ | Feedback success/error/warning/info |
| **🔌 Adaptive Offline Detection** | ✅ | Threshold adaptif berdasarkan interval kirim data, auto alert saat device offline |
| **🧹 Auto Cleanup** | ✅ | Hapus data lama otomatis via Vercel cron (daily 03:00 WIB) sesuai data retention |

### 🔄 Dalam Pengembangan

- [ ] Multi-language support (EN, ID)
- [ ] Email & SMS notifications
- [ ] Advanced analytics & ML predictions
- [ ] Preventive maintenance alerts
- [ ] Data encryption hardening
- [ ] Mobile app (iOS/Android)
- [ ] User role management (admin, operator, teknisi)

---

## 🛠️ Tech Stack

### Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 16.2.7 | Full-stack React framework |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4 | Styling framework |
| Recharts | 3.8.1 | Data visualization |
| Shadcn/ui | 4.10.0 | Component library |
| Framer Motion | 12.40.0 | Animations |
| Lucide React | 1.17.0 | Icons |
| papaparse | 5.5.3 | CSV export |
| jspdf + jspdf-autotable | 4.2.1 | PDF export |
| react-hook-form | 7.77.0 | Form management |
| lodash.debounce | 4.0.8 | Search debounce |

### Backend & Database

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js API Routes | 16.2.7 | Backend API |
| Prisma ORM | 6.19.3 | Database abstraction |
| PostgreSQL | - | Database |
| Supabase | - | Cloud DB & hosting |

> **Catatan**: `@tanstack/react-query` terinstal namun belum aktif digunakan. Proyek menggunakan SWR + useState untuk data fetching.

### Hardware

| Komponen | Spesifikasi |
|----------|-------------|
| Microcontroller | ESP32-C3 Super Mini |
| Sensor | SHT31 (Temperature & Humidity) |
| Interface | I2C (SCL: GPIO8, SDA: GPIO9) |

---

## 📊 Arsitektur Database

### Model: Device

```prisma
model Device {
  id        String @id @default(cuid())
  deviceId  String @unique          // ID unik perangkat
  location  String                  // Lokasi ruangan (PDB, UPS, Battery)
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

Dashboard dilindungi password. Masukkan password yang sesuai dengan `ADMIN_KEY` di environment variable. Session berlaku 24 jam via httpOnly cookie. Endpoint `/api/auth/check-session` digunakan untuk validasi session dari client.

### 🏠 Dashboard

- Overview suhu rata-rata, humidity rata-rata, total device, alert aktif
- Status perangkat online/offline dengan adaptive offline detection
- Ringkasan harian dengan gradient accent cards
- Loading skeleton animasi saat memuat data

### 👁️ Monitoring

- Grafik suhu & kelembapan real-time dengan time alignment per-menit
- Threshold zones (Warning, Critical, Low) dengan reference lines
- Filter berdasarkan ruangan + rentang waktu: 1 Jam / 6 Jam / 24 Jam / 7 Hari
- Sparkline per device untuk ringkasan cepat
- WIB timezone (UTC+7) konsisten di semua tampilan waktu

### 📱 Devices

- Grid cards dengan search, filter (online/offline), dan sort
- Detail modal per device dengan riwayat data
- Adaptive offline detection: threshold otomatis berdasarkan interval kirim data

### 🔔 Alerts

- Pill button filter untuk severity (Critical, Warning) dan status (New, Acknowledged)
- Search dengan debounce 300ms
- Acknowledge alert dengan optimistic update
- Auto-generated saat device offline atau threshold terlewati
- Polling 30 detik, responsive card di mobile

### 📊 Reports

- 3 tipe laporan: Daily Summary, Detailed Logs, Alerts Report
- Date range picker dengan quick select (7/14/30 hari)
- Export CSV & PDF dengan format:
  - Tanggal WIB (DD/MM/YYYY HH:mm:ss)
  - Unit label (°C, %)
  - Pagination server-side
- Download dengan loading indicator

### ⚙️ Settings (Admin)

- Konfigurasi threshold suhu & humidity (min/max)
- Data retention: 7–365 hari (default 365 hari)
- Auto cleanup: hapus data lama otomatis via cron daily 03:00 WIB
- Preview jumlah data yang akan dihapus sebelum execute
- Auto-save dengan Toast feedback

---

## 🔌 API Endpoints

### Dashboard APIs

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/dashboard/overview` | Overview semua device |
| GET | `/api/dashboard/monitoring` | Data monitoring real-time |
| GET | `/api/dashboard/alerts` | Alerts dengan filter |
| GET | `/api/dashboard/chart` | Data charts/grafik (time-aligned) |
| GET | `/api/dashboard/devices` | Daftar devices & status |
| GET | `/api/dashboard/daily-stats` | Statistik harian |

### Reports APIs

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/reports/summary` | Daily summary statistics |
| GET | `/api/reports/logs` | Detailed sensor logs |
| GET | `/api/reports/alerts` | Alert report (dengan stats total) |

### Sensor APIs

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/sensors` | Daftar semua sensor |
| POST | `/api/sensors` | Tambah sensor baru |
| POST | `/api/sensors/:id/data` | Kirim data dari ESP32 |

### Auth APIs

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/verify-admin` | Verifikasi password admin |
| POST | `/api/auth/check-session` | Validasi session aktif |
| GET | `/api/auth/logout` | Hapus session cookie |

### Settings & Cleanup APIs

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/settings` | Ambil konfigurasi settings |
| PATCH | `/api/settings/update` | Update settings (admin only) |
| GET | `/api/settings/cleanup?execute=true&token=KEY` | Jalankan cleanup data lama |

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

- Sensor membaca data setiap **30 detik**
- Kirim ke API setiap **1 menit** atau saat ada perubahan >1°C / >5% RH
- Retry **3x** jika gagal kirim, reboot setelah **5 kegagalan berturut-turut**
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
# Build aplikasi (otomatis generate Prisma client)
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
5. (Optional) Aktifkan Vercel Cron untuk auto cleanup daily 03:00 WIB

---

## 🐛 Troubleshooting

### Prisma EPERM Error (Windows)

```
EPERM: operation not permitted, rename 'query_engine-windows.dll.node.tmp...'
```

**Solusi:**
- Tutup semua proses Node.js (termasuk `npm run dev`, VS Code terminal, dll)
- Hapus file `.tmp` di `node_modules/.prisma/client/`
- Jalankan `npx prisma generate` ulang

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
- Cek rate limiting: setelah 5 percobaan gagal, akun dikunci 15 menit

### Sensor Data Tidak Muncul

**Solusi:**
- Cek ESP32 sudah terhubung ke WiFi (lihat serial monitor)
- Verify API endpoint di firmware sudah benar
- Cek network requests di browser DevTools
- Lihat server logs: `npm run dev`
- Device otomatis ditandai offline setelah tidak ada data selama threshold adaptif

### Device Offline

**Solusi:**
- Cek koneksi WiFi ESP32
- Verify API endpoint `/api/sensors/:id/data` accessible
- Adaptive offline detection: threshold menyesuaikan dengan interval kirim data
- Cek alert history di halaman Alerts untuk timeline kejadian
- Restart device atau reset WiFi

---

## 📋 Struktur Folder

```
thermal-monitoring-system/
├── src/
│   ├── app/
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/                # Auth (verify-admin, check-session, logout)
│   │   │   ├── dashboard/           # Dashboard APIs (overview, chart, monitoring, alerts, devices, daily-stats)
│   │   │   ├── reports/             # Reports APIs (summary, logs, alerts)
│   │   │   ├── sensors/             # Sensor APIs (CRUD + data ingestion)
│   │   │   └── settings/            # Settings API + cleanup endpoint
│   │   ├── dashboard/               # Dashboard Pages
│   │   │   ├── monitoring/
│   │   │   ├── alerts/
│   │   │   ├── devices/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                  # React Components
│   │   ├── cards/                   # Stat cards dengan gradient accent
│   │   ├── charts/                  # Recharts (Comparison, DailyTrend, DeviceDetail, Realtime)
│   │   ├── tables/                  # Data tables
│   │   ├── alerts/                  # AlertFilter, AlertRow, AlertTable, AlertSummary
│   │   ├── devices/                 # DeviceGrid, DeviceFilter, DeviceDetailModal
│   │   ├── monitoring/              # MonitoringHeader, MonitoringCard, MonitoringGrid, EnhancedMonitoringChart
│   │   ├── filters/                 # TimeRangeFilter
│   │   ├── layout/                  # Sidebar, Header
│   │   └── ui/                      # Toast, LoadingSpinner, dll
│   ├── hooks/                       # Custom hooks (useMonitoringData, useSystemStatus)
│   ├── lib/                         # Utilities (auth, prisma, chartUtils, formatWIB, deviceStatus, dll)
│   ├── services/                    # API clients (alertService)
│   └── types/                       # TypeScript types
├── prisma/
│   └── schema.prisma
├── public/
├── .env.example
├── vercel.json                      # Cron config untuk auto cleanup
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## 📈 Roadmap

### ✅ Tersedia

- ✅ Admin authentication dengan httpOnly cookie + rate limiting
- ✅ Dashboard overview real-time dengan gradient cards
- ✅ Monitoring dengan chart adaptif, threshold zones, sparklines
- ✅ Alert management dengan pill button filter dan optimistic update
- ✅ Device management dengan search, filter, sort, detail modal
- ✅ Report generation (CSV & PDF) dengan date range picker
- ✅ Responsive layout (mobile, tablet, desktop) + dark mode
- ✅ Toast notification system (success, error, warning, info)
- ✅ Settings management dengan data retention config
- ✅ Adaptive offline detection otomatis
- ✅ Auto cleanup data via Vercel cron (daily 03:00 WIB)
- ✅ WIB timezone (UTC+7) konsisten di semua komponen

### 🔄 Rencana ke Depan

- [ ] Multi-language support (EN, ID)
- [ ] Email & SMS notifications
- [ ] Advanced analytics & ML predictions
- [ ] Mobile app (iOS/Android)
- [ ] Preventive maintenance alerts
- [ ] User role management (admin, operator, teknisi)
- [ ] Data encryption & security hardening

---

## 📝 Changelog

### v1.1.0 (28 Juni 2026)

- ✅ Redesign Monitoring page (adaptive chart, WIB timezone, sparklines)
- ✅ Redesign Alerts page (pill button filter, gradient cards, acknowledge optimistic)
- ✅ Device page enhancement (search, filter, sort, detail modal)
- ✅ Dashboard page upgrade (gradient header, loading skeleton, fix React 19 effects)
- ✅ Server-side auth hardening (rate limiting, check-session API, session validation)
- ✅ Data retention & auto cleanup (Vercel cron, configurable 7-365 hari)
- ✅ Adaptive offline detection (threshold berdasarkan interval kirim data)
- ✅ Chart time alignment (regular buckets per-menit, ISO timestamp)
- ✅ WIB timezone konsisten (Header, Monitoring, Reports, Alerts)
- ✅ AlertFilter: dropdown → pill button (konsisten DeviceFilter)
- ✅ Toast notification: tambah type "info"
- ✅ Prisma schema cleanup (hapus archivedAt kolom)
- ✅ Settings page: back button, data retention UI, cleanup preview

### v1.0.0 (24 Juni 2026)

- ✅ Initial release dengan semua halaman utama (Dashboard, Monitoring, Devices, Alerts, Reports, Settings)
- ✅ Admin authentication dengan httpOnly cookie
- ✅ Export CSV & PDF dengan format WIB
- ✅ Responsive layout mobile + desktop
- ✅ Toast notification system

---

## 👥 Tim Pengembang

- **Project Owner**: Coolman / Facility Support Team
- **Area**: Technical Support & Facility Management
- **Status**: Production Ready
- **Version**: v1.1.0
- **Last Updated**: Juni 2026

---

## 📝 Catatan Penting

⚠️ **ADMIN_KEY** wajib di-set di environment variable Vercel untuk production
💾 **Data retention** default 1 tahun (365 hari) — dapat diubah di Settings
🔄 **Auto cleanup** berjalan daily pukul 03:00 WIB via Vercel cron
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
