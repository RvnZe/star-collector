# Star Collector

Game HTML5 sederhana dengan leaderboard global menggunakan [JSONBin.io](https://jsonbin.io).
Game ini dapat dijalankan langsung di browser, dan di-deploy otomatis ke GitHub Pages.

---

## 🎮 Cara Main Game

1. Buka game di browser:

```
https://USERNAME.github.io/REPO_NAME/
```

2. Masukkan nama pemain saat diminta.
3. Gunakan tombol panah kiri/kanan untuk menggerakkan kotak pemain.
4. Kumpulkan bintang hijau untuk menambah skor.
5. Hindari kotak merah (musuh), jika tertabrak → game over.
6. Skor dan level akan muncul di HUD (head-up display).
7. Leaderboard global menampilkan 10 skor tertinggi pemain dari seluruh dunia.

---

## 📊 Cara Update Leaderboard

Leaderboard tersimpan di JSONBin.io.

* Setiap skor baru otomatis disimpan ke leaderboard global.
* Untuk melihat leaderboard:

  1. Buka game dan mainkan.
  2. Skor akan tersimpan secara otomatis saat game over.
* Top 10 skor akan tampil di tabel leaderboard.

> ⚠️ Pastikan `JSONBIN_API_KEY` dan `JSONBIN_BIN_ID` sudah benar di GitHub Secrets agar leaderboard bisa tersinkronisasi.

---

## 🚀 Cara Deploy Otomatis ke GitHub Pages

1. Pastikan repo GitHub sudah siap dan branch utama = `main`.
2. Tambahkan **GitHub Secrets**:

   * `JSONBIN_API_KEY` → API key JSONBin
   * `JSONBIN_BIN_ID` → Bin ID JSONBin
3. Pastikan workflow sudah ada di:

```
.github/workflows/deploy.yml
```

4. Commit dan push kode terbaru:

```bash
git add .
git commit -m "Deploy game Star Collector via GitHub Actions"
git push origin main
```

5. GitHub Actions akan otomatis:

   * Build game
   * Menyuntikkan API key dan BIN ID dari Secrets
   * Deploy ke branch `gh-pages`
6. Aktifkan GitHub Pages di **Settings → Pages**

   * Source: branch `gh-pages`, folder `/ (root)`
7. Game live dalam 1–2 menit di:

```
https://USERNAME.github.io/REPO_NAME/
```

8. Update game → commit & push → workflow otomatis deploy versi baru.

---

## 🧰 Struktur Folder

```
star-collector/
│
├── index.html          ← file utama game
├── game.js             ← logika game + leaderboard
├── .gitignore          ← ignore .env, node_modules, dist/
├── package.json        ← dependencies dan skrip build
└── .github/
    └── workflows/
        └── deploy.yml ← GitHub Actions workflow
```

---

## ⚠️ Tips Keamanan

* Jangan commit `.env` ke repo publik.
* Simpan API key JSONBin hanya di GitHub Secrets.
* Gunakan `.env.example` jika ingin share struktur tanpa menampilkan key.

---

## 📌 Referensi

* [JSONBin.io API Documentation](https://jsonbin.io/docs/api/)
* [GitHub Pages](https://pages.github.com/)
* [GitHub Actions](https://docs.github.com/en/actions)
