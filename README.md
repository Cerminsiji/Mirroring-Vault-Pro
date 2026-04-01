# 🛡️ Mirroring Vault Pro

**Mirroring Vault Pro** adalah engine sinkronisasi file otomatis berbasis **Google Apps Script** yang dirancang untuk memindahkan file dari web (Archive.org, Open Directories, atau Direct Links) langsung ke Google Drive. Alat ini diciptakan untuk mengatasi batasan *execution timeout* pada server Google dengan sistem antrean (Queue) yang cerdas.

![Mirroring Vault Pro Preview](https://raw.githubusercontent.com/Cerminsiji/Mirroring-Vault-Pro/refs/heads/master/contoh.jpg))

## 🚀 Fitur Unggulan

* **Anti-Timeout Engine**: Secara otomatis memutus proses pada menit ke-5 dan menjadwalkan pemicu (*trigger*) baru untuk melanjutkan sisa antrean hingga selesai.
* **Asynchronous UI**: Antarmuka tetap responsif. Anda bisa memantau progres tanpa membuat tab browser membeku (*freeze*).
* **Archive.org Raw Fix**: Logika khusus untuk mendeteksi dan mengambil file asli (*raw*) dari Wayback Machine, bukan halaman HTML pembungkusnya.
* **Manual Kickstart & Controls**: Dilengkapi tombol *Pause*, *Resume*, *Cancel*, dan *Force Kickstart* jika pemicu otomatis dari server Google mengalami delay.
* **Real-time Activity Log**: Memantau setiap file yang berhasil, gagal, atau dilewati secara langsung di layar.

## 🛠️ Persyaratan & Instalasi

1.  Buka [Google Apps Script](https://script.google.com).
2.  Buat proyek baru dengan nama **Mirroring Vault Pro**.
3.  Salin isi file `Code.gs` dari repositori ini ke editor script Google.
4.  Buat file HTML baru di dalam editor tersebut dengan nama `Index.html` dan salin kodenya.
5.  Klik **Deploy** > **New Deployment**.
6.  Pilih jenis **Web App**, setel akses ke **Anyone**, lalu klik **Deploy**.
7.  Berikan izin (*Authorize Access*) saat muncul pop-up permintaan akses Google Drive.

## ⚙️ Cara Penggunaan

1.  **Target URL**: Masukkan URL halaman yang berisi daftar file (misal: halaman Archive.org).
2.  **Folder Name**: Tentukan nama folder baru yang akan dibuat di Google Drive Anda.
3.  **File Extensions**: Masukkan format file yang ingin diambil, pisahkan dengan koma (contoh: `pdf, mp3, zip`).
4.  **Action**: Klik **DOWNLOAD**. 
5.  **Monitoring**: Progres akan muncul dalam hitungan detik. Jika log berhenti bergerak, gunakan tombol **FORCE KICKSTART**.

## 🔬 Catatan Teknis

* **Mekanisme Antrean**: Menggunakan `PropertiesService` sebagai database sementara untuk menjaga integritas data antrean meskipun sesi script berakhir.
* **User-Agent Mimicry**: Engine mengirimkan header yang menyerupai browser modern untuk meminimalisir pemblokiran oleh server target.
* **Persistent Logic**: Setiap file yang berhasil di-download akan langsung dihapus dari antrean, memastikan tidak ada file ganda jika proses dimulai ulang.

## ❓ FAQ & Troubleshooting

| Masalah | Solusi |
| :--- | :--- |
| **Status RUNNING tapi log diam** | Gunakan tombol **FORCE KICKSTART** untuk memicu engine secara manual. |
| **Banyak file yang Skip** | Pastikan URL target bersifat publik dan ekstensinya sudah benar. |
| **Error "Quota Exceeded"** | Google membatasi unduhan harian (URL Fetch). Tunggu 24 jam untuk melanjutkan. |

## ⚠️ Disclaimer

Aplikasi ini dikembangkan untuk tujuan efisiensi pengarsipan data digital secara legal. Pengembang tidak bertanggung jawab atas penyalahgunaan alat ini untuk mengunduh konten yang melanggar hak cipta atau kebijakan privasi pihak ketiga. Gunakan dengan bijak.

---
Dibuat oleh **Cerminsiji Dev** | © 2026 Mirroring Vault Pro.
