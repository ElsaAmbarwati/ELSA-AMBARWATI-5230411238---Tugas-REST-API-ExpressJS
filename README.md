# Tugas Pengembangan Aplikasi Back-End (RPL)

Repositori ini berisi penyelesaian tugas pembuatan REST API menggunakan **ExpressJS** beserta antarmuka frontend sederhana untuk manajemen stok produk (Logistik Elsa).

## Identitas Mahasiswa
- **Nama**: Elsa Ambarwati
- **NPM**: 5230411238
- **Tugas**: REST API ExpressJS

## Struktur Proyek
Proyek ini dipisahkan menjadi dua bagian utama:
1. **`backend/`** : Berisi server ExpressJS, konfigurasi rute (routes), dan mock database (JSON).
2. **`frontend/`** : Berisi antarmuka web (HTML, CSS, Vanilla JS) yang terhubung (consume) langsung ke REST API di sisi backend.

## Endpoint REST API
Sesuai dengan spesifikasi tugas, backend memiliki endpoint berikut yang bisa diakses di `http://localhost:3000`:
- `GET /api/products` : Menampilkan semua produk.
- `POST /api/products` : Menambah produk baru.
- `PUT /api/products/:id` : Mengupdate data produk (Harga/Stok) berdasarkan ID.
- `DELETE /api/products/:id` : Menghapus produk berdasarkan ID.

### Struktur Tabel Produk
Penyimpanan menggunakan file JSON (sebagai ganti database riil untuk kemudahan) dengan struktur format berikut:
- `id` (Integer, Primary Key, Auto Increment)
- `name` (Text) - Nama barang
- `price` (Integer) - Harga barang
- `stock` (Integer) - Jumlah stok
- `category` (Text) - Kategori barang (misal: Makanan, Minuman, Alat Tulis)

## Cara Menjalankan Aplikasi

### 1. Menjalankan Backend (Server API)
Buka terminal, masuk ke folder `backend`, dan jalankan perintah berikut:
```bash
cd backend
npm install
npm run dev
```
*Server API akan aktif dan berjalan di `http://localhost:3000`*

### 2. Menjalankan Frontend
Gunakan ekstensi seperti **Live Server** di VS Code, atau jalankan perintah ini dari folder `frontend`:
```bash
cd frontend
npx http-server -p 8080
```
*Akses dashboard Logistik melalui browser di `http://localhost:8080`*
