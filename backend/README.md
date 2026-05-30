# Elsa Logistics & Inventory Management System

A premium-designed Logistics and Stock Management single-page application built using an **Express.js** REST API and styled with **Vanilla CSS** (featuring dark-mode glassmorphism, responsive sidebar layout, and micro-animations).

---

## Fitur Utama & Pendukung (Premium)
1. **Analisis Dashboard Lengkap**: Total jenis barang, volume stok, valuasi total aset (IDR), dan penanda barang kritis secara real-time.
2. **Grafik Visual Interaktif**: Integrasi Chart.js (via CDN) untuk mendistribusikan volume stok berdasarkan kategori produk.
3. **Pencarian, Filter, dan Pengurutan Cepat**: Menyaring berdasarkan nama barang, filter kategori dinamis, dan urutan stok/harga.
4. **CRUD Lengkap**: Tambah, edit detail, hapus barang dengan respon dinamis.
5. **Adjuster Stok Cepat**: Tombol `+` / `-` instan pada baris tabel untuk memodifikasi stok secara langsung tanpa membuka modal.
6. **Custom Kategori**: Fitur menambahkan kategori baru secara dinamis saat menambahkan produk baru.
7. **Impor / Ekspor CSV**: Mengunduh seluruh inventori ke format `.csv` atau mengunggah data baru menggunakan template file CSV.
8. **Toast Notifikasi**: Indikator status pop-up interaktif untuk menggantikan dialog bawaan browser yang monoton.
9. **Persistent JSON Database**: Data tersimpan dengan aman pada file lokal (`data/products.json`) dengan fitur autoincrement ID simulasi SQL, yang sudah terisi otomatis dengan data default demo saat dijalankan pertama kali.

---

## Persyaratan Sistem
- Node.js (V16.x ke atas direkomendasikan)
- NPM (V7.x ke atas)

---

## Cara Menjalankan Aplikasi

1. **Jalankan Instalasi Dependency (jika belum)**:
   ```bash
   npm install
   ```

2. **Jalankan Server dalam Mode Development (dengan Nodemon)**:
   ```bash
   npm run dev
   ```

3. **Atau Jalankan Server dalam Mode Production**:
   ```bash
   npm start
   ```

4. **Akses Aplikasi Melalui Browser**:
   Buka alamat berikut pada peramban web pilihan Anda:
   ```
   http://localhost:3000
   ```

---

## Spesifikasi API Endpoint

### 1. Menampilkan Semua Produk
- **Endpoint**: `GET /api/products`
- **Respon Sukses (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Indomie Goreng Spesial",
      "price": 3500,
      "stock": 150,
      "category": "Makanan"
    }
  ]
  ```

### 2. Menambah Produk Baru
- **Endpoint**: `POST /api/products`
- **Body Request (JSON)**:
  ```json
  {
    "name": "Kopi Hitam Kapal Api",
    "price": 1500,
    "stock": 200,
    "category": "Minuman"
  }
  ```
- **Respon Sukses (211 Created)**:
  ```json
  {
    "id": 7,
    "name": "Kopi Hitam Kapal Api",
    "price": 1500,
    "stock": 200,
    "category": "Minuman"
  }
  ```

### 3. Mengupdate Produk
- **Endpoint**: `PUT /api/products/:id`
- **Body Request (JSON - Partial update diperbolehkan)**:
  ```json
  {
    "price": 1800,
    "stock": 180
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "id": 7,
    "name": "Kopi Hitam Kapal Api",
    "price": 1800,
    "stock": 180,
    "category": "Minuman"
  }
  ```

### 4. Menghapus Produk
- **Endpoint**: `DELETE /api/products/:id`
- **Respon Sukses (200 OK)**:
  ```json
  {
    "message": "Produk berhasil dihapus",
    "id": 7
  }
  ```
