# NutriCount

NutriCount adalah aplikasi analisis gizi akademis yang dikembangkan dengan inspirasi dari NutriSurvey. Phase 1 menyiapkan Food Composition Database menggunakan PostgreSQL 17 dan Docker Compose, dengan TKPI sebagai sumber utama dan USDA FoodData Central sebagai sumber alternatif.

Saat ini implementasi mencakup infrastruktur database, schema, reference seeds, dan constraint tests. Backend, frontend, food matching engine, nutrition calculation engine, dan importer TKPI belum diimplementasikan.

## Prasyarat

- Docker Engine dan Docker Compose plugin.
- Git.
- Terminal Bash pada Ubuntu/Linux.
- Port localhost 5432 tersedia, atau gunakan `POSTGRES_PORT` lain.

Tidak perlu menginstal PostgreSQL atau `psql` di host. Commands di bawah menggunakan tools dalam container. Jalankan commands dari root repository.

## Struktur project

```text
nutriCount/
├── database/
│   ├── migrations/
│   │   └── 001_phase1_food_composition.sql
│   ├── seeds/
│   │   ├── 001_data_sources.sql
│   │   └── 002_nutrient_definitions.sql
│   └── tests/
│       └── 001_constraints.sql
├── backups/                         # Lokal; tidak di-commit
├── compose.yaml
├── .env                             # Lokal; tidak di-commit
├── .env.example
├── .gitignore
└── README.md
```

## 1. Konfigurasi environment

Untuk clone baru, salin template jika `.env` belum tersedia:

```bash
cp -n .env.example .env
```

Edit `.env`:

```dotenv
POSTGRES_DB=nutricount
POSTGRES_USER=nutricount
POSTGRES_PASSWORD=
POSTGRES_PORT=5432
```

Isi `POSTGRES_PASSWORD` dengan password baru untuk user PostgreSQL lokal. Jangan biarkan kosong atau menggunakan password contoh. Compose akan menolak start jika password kosong.

| Variable | Fungsi |
|---|---|
| `POSTGRES_DB` | Nama database awal |
| `POSTGRES_USER` | User PostgreSQL untuk development |
| `POSTGRES_PASSWORD` | Password user PostgreSQL |
| `POSTGRES_PORT` | Port PostgreSQL pada host |

Pastikan `.gitignore` memuat:

```gitignore
.env
.env.*
!.env.example
backups/
```

Periksa bahwa `.env` di-ignore:

```bash
git check-ignore .env
```

Environment inisialisasi user, password, dan database berlaku saat volume masih kosong. Mengedit `.env` setelah database terbentuk tidak otomatis mengganti user, password, atau nama database existing. Role dari `POSTGRES_USER` pada official image memiliki privileges administrator; konfigurasi ini ditujukan untuk development lokal, bukan pengaturan production.

## 2. Jalankan PostgreSQL

```bash
docker compose up -d --wait postgres
docker compose ps
```

Expected: service `postgres` berstatus `healthy`. Periksa logs jika startup gagal:

```bash
docker compose logs --tail=100 postgres
```

Compose menggunakan image `postgres:17`, named volume `postgres_data`, dan default network project. Port database di-bind ke `127.0.0.1`, sehingga tidak diekspos pada seluruh network interfaces host.

Tag `postgres:17` mengikuti patch releases PostgreSQL 17; nomor patch dapat berubah setelah image diperbarui.

## 3. Jalankan migration satu kali

**Lewati langkah ini jika migration 001 sudah berhasil dijalankan pada database tersebut.**

```bash
docker compose exec -T postgres sh -c \
  'psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 --single-transaction -f -' \
  < database/migrations/001_phase1_food_composition.sql
```

`--single-transaction` menjalankan seluruh migration sebagai satu paket. `ON_ERROR_STOP=1` menghentikan eksekusi saat error sehingga perubahan transaction dibatalkan. Redirection `<` membaca file dari host; file tidak perlu disalin ke container.

Migration dijalankan secara eksplisit melalui `psql`; tidak ada mekanisme init-directory kedua yang menjalankan SQL yang sama.

Workflow saat ini belum memiliki migration ledger atau checksum tracking otomatis. Migration 001 menggunakan `CREATE TABLE` dan tidak boleh dijalankan ulang setelah berhasil. Jangan mengedit migration yang sudah diterapkan untuk mengubah database existing. Buat migration berikutnya, misalnya `002_...sql`, dan catat penerapannya. Jangan drop database/volume untuk sekadar mengulang migration.

## 4. Isi reference data

```bash
docker compose exec -T postgres sh -c \
  'psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 --single-transaction -f -' \
  < database/seeds/001_data_sources.sql

docker compose exec -T postgres sh -c \
  'psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 --single-transaction -f -' \
  < database/seeds/002_nutrient_definitions.sql
```

Seeds mengisi TKPI dengan priority `1`, USDA dengan priority `2`, dan 21 nutrient definitions. Keduanya memakai `ON CONFLICT (code) DO NOTHING`, sehingga eksekusi ulang melewati kode existing tanpa memperbarui isinya.

Tidak ada dataset release resmi atau nutrient values rekaan yang di-seed.

## 5. Connect dan inspect

Buka interactive PostgreSQL client:

```bash
docker compose exec postgres sh -c \
  'psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Di dalam `psql`:

```sql
\pset pager off
SELECT current_database(), current_user, version();
\dt
\d food_composition
SELECT code, priority_rank FROM data_source ORDER BY priority_rank;
SELECT count(*) AS nutrient_count FROM nutrient_definition;
\q
```

`\dt` menampilkan enam tabel. Expected nutrient count setelah seed adalah `21`.

### Koneksi backend atau database client

| Lokasi client | Host | Port |
|---|---|---|
| Langsung pada laptop | `localhost` | Nilai `POSTGRES_PORT`, default `5432` |
| Service pada Compose network yang sama | `postgres` | `5432` |

Gunakan database, username, dan password sesuai `.env`. Service Compose lain perlu terhubung ke network yang sama. Di dalam container backend, `localhost` merujuk container backend sendiri.

Untuk menguji koneksi TCP dari host jika `psql` terinstal, gunakan default berikut dan sesuaikan jika environment berbeda:

```bash
psql -h localhost -p 5432 -U nutricount -d nutricount -W
```

## Schema dan aturan data

| Table | Tanggung jawab |
|---|---|
| `food` | Identitas makanan aplikasi, nama, kategori, dan nullable `food_state` |
| `data_source` | Identitas provider dan default source priority |
| `dataset_release` | Release dataset, provenance, basis berat, dan status aktif |
| `food_composition` | Wide Table nutrient values, BDD, original source identity, dan original row |
| `nutrient_definition` | Dictionary kode nutrient, nama tampilan, unit, scientific definition, dan mapping kolom |
| `food_match` | Hubungan terarah target–donor beserta review dan nutrient eligibility |

- `food_name` adalah nama aplikasi; `source_food_name` mempertahankan nama source record.
- Nutrient values menggunakan nullable `NUMERIC(18,6)`. Missing values berbeda dari reported zero dan tidak diganti menjadi nol.
- Basis berat disimpan pada `dataset_release`; semua composition records dalam release mengikuti basis yang sama. Unit nutrient mengikuti nama kolom dan dictionary.
- `edible_portion_percent` menyimpan BDD per composition, boleh `NULL`, tanpa default 100; nilai terisi dibatasi 0–100.
- `fiber_g` memakai label umum Serat. Kolom ini tidak otomatis menjamin kesetaraan definisi serat antar-source records.
- `original_record` mempertahankan original row sebagai JSON object. `nutrient_flags` menyimpan metadata per nutrient dan default `{}`.
- `source_food_state` dan `normalization_status` tidak dipakai. Cleaning, validasi unit/definisi, dan pemeriksaan basis dilakukan sebelum import.
- Source code unik. Source–version dan release–food code masing-masing unik.
- Maksimal satu active release per source. Release lama tetap disimpan; immutability historical data dijaga melalui workflow import, belum melalui trigger/permissions khusus.
- Target match tidak boleh sama dengan donor, dan pasangan target–donor unik.
- `food_match` boleh kosong. Candidate tidak memberi izin borrowing. Array eligibility kosong tidak mengizinkan borrowing.
- Kode di JSON array `eligible_nutrient_codes` belum memiliki foreign key ke dictionary; backend/importer harus memvalidasinya nanti.
- Borrowed values tidak ditulis kembali ke original composition. Matching dan calculation engine berada di luar Phase 1.

## 6. Jalankan constraint tests

```bash
docker compose exec -T postgres sh -c \
  'psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -f -' \
  < database/tests/001_constraints.sql
```

Expected output memuat:

```text
NOTICE: PASS: all checks in 001_constraints.sql
DO
ROLLBACK
```

Tests membuat synthetic fixtures dalam transaction dan mengakhirinya dengan `ROLLBACK`. Kegagalan tak terduga menghentikan `psql`; transaction yang belum commit dibatalkan ketika koneksi ditutup.

Coverage script saat ini: source priorities, jumlah nutrient definitions, multiple releases, duplicate source/version/food codes, satu active release per source, invalid foreign key, decimal/NULL/zero preservation, negative nutrient, BDD di atas batas, valid match, self-match, dan invalid match status. Ini bukan pengujian menyeluruh atas seluruh constraints atau scientific validity dataset.

## 7. Restart, stop, dan persistence

```bash
docker compose restart postgres
docker compose up -d --wait postgres
```

Periksa data setelah restart:

```bash
docker compose exec postgres sh -c \
  'psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -P pager=off -c "SELECT code, priority_rank FROM data_source ORDER BY priority_rank; SELECT count(*) AS nutrient_count FROM nutrient_definition;"'
```

Expected: TKPI `1`, USDA `2`, dan nutrient count `21`.

| Command | Efek |
|---|---|
| `docker compose stop` | Menghentikan containers; containers dan volume tetap ada |
| `docker compose down` | Menghapus containers dan network project; named volume tetap ada |
| `docker compose down -v` | Juga menghapus named volume database |

**Jangan gunakan `docker compose down -v` jika ingin mempertahankan data. Penghapusan volume dapat menghilangkan seluruh database lokal secara permanen.** Named volume merupakan persistence, bukan pengganti backup.

## 8. Backup

```bash
mkdir -p backups

docker compose exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > backups/nutricount_before_import.dump
```

Pastikan command berhasil. Redirection dapat membuat file kosong/parsial jika `pg_dump` gagal. Nama file di atas akan menimpa backup dengan nama sama; gunakan filename baru untuk checkpoint berikutnya.

Periksa archive bisa dibaca:

```bash
docker compose exec -T postgres pg_restore --list \
  < backups/nutricount_before_import.dump
```

Backup berisi schema dan data database, bukan `.env`, role passwords, atau seluruh konfigurasi cluster PostgreSQL. Simpan salinan backup di lokasi terpisah jika membutuhkan perlindungan dari kerusakan disk laptop.

## 9. Uji restore pada database terpisah

Buat database baru yang kosong. Jika namanya sudah ada, berhenti dan periksa database tersebut; jangan menimpa isinya.

```bash
docker compose exec postgres sh -c \
  'createdb -U "$POSTGRES_USER" nutricount_restore_test'
```

Restore:

```bash
docker compose exec -T postgres sh -c \
  'pg_restore -U "$POSTGRES_USER" -d nutricount_restore_test --exit-on-error --single-transaction' \
  < backups/nutricount_before_import.dump
```

Periksa tabel dan seeds:

```bash
docker compose exec postgres sh -c \
  'psql -X -U "$POSTGRES_USER" -d nutricount_restore_test -P pager=off -c "\dt" -c "SELECT code, priority_rank FROM data_source ORDER BY priority_rank; SELECT count(*) AS nutrient_count FROM nutrient_definition;"'
```

Setelah pemeriksaan selesai, hapus **hanya database percobaan**:

```bash
docker compose exec postgres sh -c \
  'dropdb -U "$POSTGRES_USER" nutricount_restore_test'
```

Workflow ini tidak menimpa `nutricount`. Untuk memulihkan development database dari backup, restore ke nama database baru, verifikasi hasilnya, lalu arahkan koneksi client ke database tersebut. Jangan menjalankan migration 001 dan seeds sebelum restore backup lengkap karena archive sudah membawa schema dan data.

## Hasil verifikasi development

Berdasarkan eksekusi lokal yang dikonfirmasi pada 26 Oktober 2026:

| Pemeriksaan | Hasil |
|---|---|
| PostgreSQL melalui Compose | Healthy; PostgreSQL 17.11 |
| Database connection dalam container | Berhasil ke `nutricount` sebagai `nutricount` |
| Migration schema | Enam tabel terlihat melalui `\dt` |
| Reference seeds | TKPI priority 1, USDA priority 2, 21 definitions |
| Constraint script | Dikonfirmasi berhasil oleh developer |
| Normal restart | Reference data tetap tersedia |
| Backup archive | Custom-format archive berhasil dibaca |
| Restore ke database percobaan | Berhasil; enam tabel dan reference seeds terverifikasi |

Host TCP authentication belum diuji secara terpisah. Pengujian restart belum mencakup container recreation. Tracking migration otomatis dan enforcement scientific matching belum diimplementasikan.

## Tahap berikutnya

1. Bersihkan dan validasi file TKPI sebelum import; pertahankan original values serta missing-value markers.
2. Pastikan identitas release, provenance, basis berat, unit, dan definisi nutrient.
3. Bangun importer tanpa mengubah historical releases.
4. Verifikasi jumlah records, unique source codes, dan hasil mapping sebelum mengaktifkan release.

Recipe management, dietary recall, FFQ, individual/population analysis, borrowed-value calculations, dan research snapshots masuk fase berikutnya.
