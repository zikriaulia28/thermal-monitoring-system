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

✅ **📊 Dashboard Real-time** - Visualisasi data suhu dan kelembapan dalam waktu nyata  
✅ **📈 Grafik Data** - Analisis tren suhu dan kelembapan dengan chart interaktif  
✅ **🔔 Sistem Alert** - Notifikasi otomatis ketika kondisi berada di luar range normal  
✅ **📱 Multi-Device Support** - Monitoring sensor dari berbagai lokasi secara bersamaan  
✅ **⚙️ Device Management** - Kelola dan pantau status perangkat IoT  
✅ **📋 Report Generation** - Generate laporan monitoring untuk dokumentasi  
✅ **🎛️ Settings Management** - Konfigurasi threshold dan parameter monitoring

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

Menyimpan informasi perangkat IoT:

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

Menyimpan data sensor yang dikirim ESP32:

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

Menyimpan sistem notifikasi dan alert:

```prisma
model Alert {
  id          String   @id @default(cuid())
  deviceId    String   // Device yang memicu alert
  location    String   // Lokasi ruangan
  type        String   // Jenis alert (HIGH_TEMP, LOW_HUMIDITY, dll)
  message     String   // Pesan detail
  severity    String   // Level: low, medium, high, critical
  createdAt   DateTime @default(now())
  acknowledged Boolean  @default(false)  // Sudah dibaca?
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
# Ganti dengan credentials Supabase atau PostgreSQL Anda
DATABASE_URL="postgresql://user:password@db.supabase.co:5432/postgres"
DIRECT_URL="postgresql://user:password@db.supabase.co:5432/postgres"

# ========== API ==========
NEXT_PUBLIC_API_URL="http://localhost:3000"

# ========== SUPABASE (Jika menggunakan) ==========
# NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
# NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
```

**4. Setup Database dengan Prisma**

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrations (buat schema di database)
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

### Untuk Operator & Teknisi

1. **🏠 Dashboard**
   - Lihat overview suhu dan kelembapan semua ruangan
   - Identifikasi ruangan dengan kondisi tidak normal
   - Monitor trend data secara real-time

2. **👁️ Monitoring**
   - Pilih ruangan spesifik untuk monitoring mendalam
   - Lihat grafik suhu dan kelembapan per jam/hari
   - Pantau status perangkat (online/offline)

3. **🔔 Alerts**
   - Lihat notifikasi alert yang muncul
   - Tandai alert sebagai "acknowledged" setelah ditangani
   - Filter alert berdasarkan severity/lokasi

4. **⚙️ Devices**
   - Lihat daftar semua sensor/device yang terpasang
   - Cek status koneksi setiap device
   - Lihat lokasi dan last seen time

5. **📊 Reports**
   - Generate laporan monitoring harian/mingguan
   - Export data untuk dokumentasi
   - Analisis tren suhu dan kelembapan

6. **⚙️ Settings** (Admin)
   - Konfigurasi threshold temperature dan humidity
   - Atur interval pengambilan data
   - Kelola user access

---

## 🔌 API Endpoints

### Dashboard APIs

| Method | Endpoint                    | Deskripsi                  |
| ------ | --------------------------- | -------------------------- |
| GET    | `/api/dashboard/overview`   | Data overview semua device |
| GET    | `/api/dashboard/monitoring` | Data monitoring real-time  |
| GET    | `/api/dashboard/alerts`     | Daftar semua alerts        |
| GET    | `/api/dashboard/chart`      | Data untuk charts/grafik   |
| GET    | `/api/dashboard/devices`    | Daftar devices & status    |
| GET    | `/api/dashboard/reports`    | Data laporan               |

### Sensor APIs

| Method | Endpoint                | Deskripsi              |
| ------ | ----------------------- | ---------------------- |
| GET    | `/api/sensors`          | Daftar semua sensor    |
| POST   | `/api/sensors`          | Tambah sensor baru     |
| GET    | `/api/sensors/:id`      | Detail sensor spesifik |
| POST   | `/api/sensors/:id/data` | Kirim data dari ESP32  |

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

- Sensor membaca data setiap 30 detik (dapat dikonfigurasi)
- Kirim ke API setiap 5 menit atau saat ada perubahan >1°C / >5% RH
- Auto-reconnect jika WiFi terputus

### Upload Firmware

1. Install Arduino IDE atau PlatformIO
2. Setup ESP32 board library
3. Flash firmware ke device
4. Konfigurasi WiFi dan API endpoint

---

## 📦 Build untuk Production

```bash
# Build aplikasi untuk production
npm run build

# Jalankan production server
npm start
```

Deployment bisa dilakukan ke:

- **Vercel** (recommended untuk Next.js)
- **Railway**
- **Render**
- **Self-hosted server**

---

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solusi:**

- Pastikan DATABASE_URL dan DIRECT_URL sudah benar
- Cek koneksi ke database server
- Test connection: `psql <DATABASE_URL>`

### Sensor Data Tidak Muncul

**Solusi:**

- Cek ESP32 sudah terhubung ke WiFi (lihat serial monitor)
- Verify API endpoint di firmware sudah benar
- Cek network requests di browser DevTools
- Lihat server logs: `npm run dev`

### Device Offline/Last Seen Tidak Update

**Solusi:**

- Cek koneksi WiFi ESP32
- Verify API POST endpoint `/api/sensors/:id/data` accessible
- Check firewall rules
- Restart device atau reset WiFi

---

## 📋 Struktur Folder

```
thermal-monitoring-system/
├── src/
│   ├── app/
│   │   ├── api/                 # API Routes
│   │   │   ├── dashboard/       # Dashboard APIs
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
│   │   ├── charts/              # Recharts visualizations
│   │   ├── tables/
│   │   ├── alerts/
│   │   ├── devices/
│   │   └── ui/                  # Shadcn components
│   ├── lib/                     # Utilities
│   ├── services/                # API clients
│   └── types/                   # TypeScript types
├── prisma/
│   └── schema.prisma            # Database schema
├── public/                      # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 📈 Roadmap & Fitur yang Akan Datang

- [ ] Multi-language support (EN, ID, China)
- [ ] Email & SMS notifications
- [ ] Data export (CSV, Excel, PDF)
- [ ] Advanced analytics & ML predictions
- [ ] Mobile app (iOS/Android)
- [ ] Preventive maintenance alerts
- [ ] User authentication & role management
- [ ] Data encryption & security hardening

---

## 👥 Tim Pengembang

- **Project Owner**: Coolman/Facility Support Team
- **Area**: Technical Support & Facility Management
- **Status**: Work in Progress (v0.1.0)
- **Last Updated**: June 2026

---

## 📝 Catatan Penting

⚠️ **Sistem dalam tahap development** - fitur masih terus dikembangkan  
💾 **Backup database secara berkala** untuk keamanan data historis  
🔐 **Gunakan environment variables** - jangan commit `.env` ke Git  
🔄 **Update firmware ESP32 secara berkala** untuk patch security  
📞 **Support**: Hubungi tim Technical Support untuk bantuan

---

## 🙋 Support & Feedback

Untuk pertanyaan, bug reports, atau feedback:

- 📧 Hubungi tim Technical Support
- 🐛 Buka issue di repository ini
- 💬 Chat dengan teknisi team

---

**Terima kasih sudah menggunakan CPEMS! 🎉**
