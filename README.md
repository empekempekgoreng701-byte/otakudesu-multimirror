# OtakuDesu Multi-Mirror Resolver (uji awal)

## Fungsi
- Menerima URL halaman episode OtakuDesu.
- Mengambil halaman dan mengekstrak tautan unduhan yang berada dalam item `Mp4 720p`, `Mp4 480p`, dan `Mp4 360p`.
- Mengembalikan tiap resolusi sebagai playback road dan tiap host sebagai episode/source terpisah.
- Menyertakan tautan mirror player yang ditemukan sebagai grup pemeriksaan kompatibilitas.

## Deploy ke Vercel
1. Buat repository GitHub baru dan upload seluruh isi folder ini.
2. Import repository itu di Vercel.
3. Deploy.
4. Tes endpoint:
   `https://NAMA-PROYEK.vercel.app/api/resolve?episode=https%3A%2F%2Fotakudesu.blog%2Fepisode%2Fanh-s2-episode-1-sub-indo%2F`
5. Endpoint harus mengembalikan JSON dengan properti `roads`.

## Batasan
Ini prototipe ekstraksi link, bukan jaminan semua host dapat diputar.
Link Pdrain/GoFile/Acefile/Mega/VikingFile bisa berupa halaman unduhan, bukan MP4 langsung.
Kazumi mungkin dapat mendeteksi sebagian host, sebagian lain memerlukan resolver host tersendiri.
Mega embed bukan MP4 langsung.
Belum ada auto-fallback saat pemutaran gagal. Kazumi akan menampilkan jalur yang tersedia untuk dipilih manual.
