# 🛡️ Mirroring Vault Pro

**Mirroring Vault Pro** adalah engine sinkronisasi file otomatis berbasis **Google Apps Script** yang dirancang untuk memindahkan file dari berbagai sumber web (Archive.org, Open Directories, hingga Direct Links) langsung ke Google Drive. Alat ini diciptakan untuk menembus batasan *execution timeout* server Google menggunakan sistem antrean (*Queue*) yang cerdas dan asinkron.

![Mirroring Vault Pro Preview](https://raw.githubusercontent.com/Cerminsiji/Mirroring-Vault-Pro/refs/heads/master/contoh.jpg)
![Mirroring Vault Pro Preview 2](https://raw.githubusercontent.com/Cerminsiji/Mirroring-Vault-Pro/refs/heads/master/contoh-2.jpg)

## 🚀 Fitur Unggulan

* **Hybrid Sync Logic**: Mendukung pengunduhan massal dalam satu folder (Scraping Mode) maupun pengunduhan file tunggal secara instan (Direct Link Mode).
* **Anti-Timeout Engine**: Secara otomatis memutus proses pada menit ke-5 dan menjadwalkan pemicu (*trigger*) baru untuk melanjutkan sisa antrean hingga tuntas.
* **Asynchronous UI**: Antarmuka berbasis web yang responsif. Anda bisa memantau progres secara *real-time* tanpa risiko browser membeku (*freeze*).
* **Archive.org Raw Fix**: Logika khusus untuk membedah URL Wayback Machine dan mengambil file asli (*raw data*), bukan halaman HTML pratinjaunya.
* **Smart Manual Controls**: Dilengkapi tombol *Pause*, *Resume*, *Cancel*, dan fitur **Force Kickstart** untuk memacu ulang engine jika pemicu otomatis mengalami delay.
* **Live Activity Log**: Monitor detail setiap file yang berhasil, gagal (HTTP Error), atau dilewati langsung dari konsol monitor.

## 🧠 Alur Logika Operasional (Workflow)

Engine ini bekerja dengan siklus **"Pecah, Simpan, Picu"** untuk menghindari pembatasan sistem Google:

1.  **Tahap Inisialisasi (Handshake)**:
    * Script menerima URL dan Filter Ekstensi dari UI.
    * **Hybrid Check**: Jika URL adalah link file langsung, ia masuk antrean. Jika URL folder, Scraper akan menyisir semua link `<a>` dan memfilternya.
2.  **Tahap Database Sementara (State Management)**:
    * Daftar link yang ditemukan disimpan ke dalam `PropertiesService` (bukan variabel RAM) agar data tidak hilang saat script mati/timeout.
3.  **Tahap Eksekusi Berantai (Recursive Trigger)**:
    * Script menjalankan fungsi `runBatch()` yang mendownload file satu per satu.
    * **Watchdog Timer**: Script terus memantau waktu eksekusi. Jika sudah berjalan 5 menit (limit Google 6 menit), script akan berhenti secara sukarela, menyimpan sisa antrean, dan membuat *Time-Based Trigger* untuk berjalan otomatis 1 menit kemudian.
4.  **Tahap Finalisasi**:
    * Setelah antrean di `PropertiesService` bernilai 0, script menghapus semua trigger dan mengubah status menjadi `FINISHED`.

## 🛠️ Persyaratan & Instalasi

1.  Buka [Google Apps Script](https://script.google.com).
2.  Buat proyek baru dengan nama **Mirroring Vault Pro**.
3.  Salin isi file `Code.gs` dari repositori ini ke editor script.
4.  Buat file HTML baru dengan nama `Index.html` dan salin kodenya ke sana.
5.  Klik **Deploy** > **New Deployment**.
6.  Pilih **Web App**, setel akses ke **Anyone**, lalu klik **Deploy**.
7.  Berikan izin (*Authorize Access*) pada akun Google Drive Anda saat diminta.

## ⚙️ Cara Penggunaan

1.  **Target URL**: Masukkan URL halaman direktori (misal: Archive.org download page) atau langsung masukkan link file tujuan.
2.  **Folder Name**: Tentukan nama folder di Google Drive tempat penyimpanan file.
3.  **File Extensions**: Masukkan format file yang diinginkan (contoh: `pdf, mp3, iso, img`).
4.  **Action**: Klik tombol **DOWNLOAD**.
5.  **Monitoring**: Jika log berhenti bergerak namun status masih `RUNNING`, gunakan tombol **FORCE KICKSTART**.

## 🔬 Catatan Teknis

* **Mekanisme Antrean**: Memanfaatkan `PropertiesService` untuk menjaga integritas data antrean meskipun sesi script berakhir secara paksa oleh sistem.
* **User-Agent Mimicry**: Engine mengirimkan header yang menyerupai browser modern untuk meminimalisir pemblokiran (HTTP 403) oleh server target.
* **Persistent Logic**: Setiap file yang sukses diunduh otomatis dihapus dari antrean, mencegah terjadinya duplikasi file jika proses dimulai kembali.

## ❓ FAQ & Troubleshooting

| Masalah | Solusi |
| :--- | :--- |
| **Status RUNNING tapi log diam** | Klik **FORCE KICKSTART** untuk memacu engine secara manual dari sisi server. |
| **Error HTTP 403 (Forbidden)** | Server target memblokir akses otomatis. Coba gunakan link dari sumber lain seperti Archive.org. |
| **Banyak file yang Skip** | Pastikan ekstensi yang diinput sesuai dengan file yang ada di URL target (cek besar-kecil huruf). |
| **Error "Quota Exceeded"** | Batas unduhan harian Google Drive tercapai. Tunggu 24 jam untuk melanjutkan proses. |

## ⚠️ Disclaimer

Aplikasi ini dikembangkan untuk tujuan efisiensi pengarsipan data digital secara legal. Pengembang tidak bertanggung jawab atas penyalahgunaan alat ini untuk mengunduh konten yang melanggar hak cipta atau kebijakan privasi pihak ketiga. Gunakan secara bijak dan patuhi aturan penyedia layanan.

---
Dibuat oleh **Cerminsiji Dev** | © 2026 Mirroring Vault Pro.
