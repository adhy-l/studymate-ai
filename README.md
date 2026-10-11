# StudyMate AI

StudyMate AI adalah aplikasi chatbot belajar berbasis AI. Pengguna dapat bertanya kepada tutor, mengunggah materi PDF atau TXT untuk ditanyakan, dan memperoleh jawaban berdasarkan isi dokumen. Aplikasi terdiri dari frontend React/Vite dan backend Node.js/Express yang dapat dijalankan bersamaan dari direktori root.

## Persyaratan

- Node.js dan npm terpasang.
- API key Google Gemini untuk mendapatkan jawaban AI. Tanpa API key, backend berjalan dalam mode fallback lokal.

## Menyiapkan proyek

Clone repositori, lalu masuk ke direktori proyek:

```bash
git clone <URL-REPOSITORY>
cd studymate-ai
```

Jika repositori sudah diunduh, jalankan perintah berikut dari direktori root proyek.

Pasang dependensi untuk root, frontend, dan backend:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

Dependensi root memasang `concurrently`, sedangkan dependensi aplikasi dipasang terpisah di setiap folder.

## Konfigurasi environment

**PowerShell:**

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

**macOS/Linux:**

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Isi `GEMINI_API_KEY` di `backend/.env` dengan API key Gemini Anda. Jangan commit atau membagikan file `.env`. File `.env.example` hanya berisi contoh konfigurasi dan aman untuk disimpan di repositori.

`frontend/.env` menggunakan `VITE_API_BASE_URL=/api`. Dalam mode development, Vite meneruskan permintaan `/api` ke backend di `http://localhost:5000`.

## Menjalankan frontend dan backend

Dari direktori root, jalankan:

```bash
npm run dev
```

Alamat lokal:

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:5000>
- Pemeriksaan backend: <http://localhost:5000/api/health>

Kedua server tampil di terminal yang sama. Tekan `Ctrl+C` untuk menghentikannya.

Untuk menjalankan hanya satu bagian, gunakan terminal terpisah:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

## Build frontend

Untuk membuat build frontend:

```bash
npm --prefix frontend run build
```

Hasil build dibuat di `frontend/dist/`. Folder ini dihasilkan ulang oleh proses build dan tidak perlu dimasukkan ke Git. Untuk melihat hasil build secara lokal, jalankan:

```bash
npm --prefix frontend run preview
```

## Jenis dokumen

Upload dokumen mendukung file PDF dan TXT. File PDF harus memiliki teks yang dapat diekstrak; PDF hasil scan gambar tanpa OCR mungkin tidak terbaca. Ukuran maksimum upload diatur oleh `MAX_FILE_SIZE_MB` pada `backend/.env` (default: 5 MB).
