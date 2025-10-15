### 📱 REIMBURSERB – MOBILE REIMBURSEMENT APPLICATION

**ReimburseRB** adalah aplikasi mobile berbasis **Flutter** yang dikembangkan menggunakan arsitektur **MVVM** serta menerapkan **state management Provider**.
Aplikasi ini dibuat untuk perusahaan **RB Group** sebagai solusi digital terhadap proses reimbursement yang sebelumnya masih melibatkan berkas fisik.

---

### ✨ FITUR UTAMA

* **Registrasi dan autentikasi pengguna** sebagai **Karyawan** atau **HRD**.
* **Karyawan** dapat mengajukan reimbursement dan melihat riwayat pengajuan yang telah dilakukan.
* **HRD** dapat memproses permintaan reimbursement dari karyawan serta mencetak rekapitulasi data berdasarkan periode tertentu dalam format **PDF** atau **Excel**.
* **Keamanan data pengguna** diterapkan menggunakan algoritma kriptografi:

  * **Bcrypt** untuk hashing password.
  * **AES (Advanced Encryption Standard)** untuk enkripsi data pribadi lainnya.
* Penerapan keamanan data ini mengikuti **Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi**.

---

### 🧱 TECH STACK

| Layer / Komponen          | Teknologi yang Digunakan                            |
| ------------------------- | --------------------------------------------------- |
| **Frontend (Mobile App)** | Flutter                                             |
| **Arsitektur Aplikasi**   | MVVM (Model–View–ViewModel)                         |
| **State Management**      | Provider                                            |
| **Backend API**           | Node.js, Express.js                                 |
| **Database**              | PostgreSQL                                          |
| **Keamanan Data**         | Bcrypt (hash password), AES (enkripsi data pribadi) |
| **Metode Pengembangan**   | Extreme Programming (XP)                            |

---

### 🧪 PENGUJIAN

Aplikasi **ReimburseRB** telah diuji menggunakan **metode Black Box Testing** oleh pengguna internal dari **RB Group**, dan dinyatakan berfungsi sesuai dengan kebutuhan serta spesifikasi yang telah ditetapkan.

---

### 📄 DOKUMENTASI

Dokumentasi lengkap mengenai desain antarmuka, struktur proyek, alur aplikasi, serta implementasi teknis dapat dilihat pada tautan berikut:
- Figma UI Design: https://www.figma.com/design/kC5O2HK2xr3A6L4vJn9jcQ/ReimburseRB?node-id=145-120&t=qSo4z067p9SU87Xj-1

---

## 🧭 Daftar Halaman Aplikasi

### 🔹 GENERAL (USER & ADMIN)

✅ **Splash Screen Page**
✅ **Onboarding Page**
✅ **Sign In Page**
✅ **Sign Up Page**
✅ **Ubah Password Page**

---

### 👤 USER (KARYAWAN)

#### 💯 Beranda Tab

* ✅ Akses **Informasi Persyaratan Page**
* ✅ Akses **Form Reimbursement Page**
* ✅ **List Reimbursement Aktif**

#### 📋 Pengajuan Tab

* ✅ **Data Statistik** (Reimbursement berhasil, ditolak, diproses, total reimbursement tahun ini)
* ✅ Akses **Rekapitulasi dan Limit Tahunan Page**
* ✅ Akses **Form Reimbursement Page**
* ✅ **List Reimbursement Aktif**
* ✅ **List History Reimbursement**
* ✅ Akses **Detail Reimbursement Status Page**

#### 🔔 Notification Tab

* ✅ **List Notification Status Page**
* ✅ Akses **Detail Reimbursement Status Page**

#### 👤 Profile Tab

* ✅ **Data Profil**
* ✅ Akses **Full Profile & Edit Profile Page**
* ✅ **Logout**

---

### 🧑‍💼 ADMIN (STAFF SDM / HRD)

#### 💯 Beranda Tab

* ✅ Akses **Editable Informasi Persyaratan Page**
* ✅ Akses **Rekapitulasi Reimbursement Page**
* ✅ Akses **Permintaan Pendaftaran Akun Page**
* ✅ Akses **Permintaan Pengubahan Data Karyawan Page**

#### 📋 Permintaan Tab

* ✅ **Data Permintaan Aktif Saat Ini** (Total belum diproses, total permintaan bulan ini)
* ✅ Akses **Rekapitulasi Reimbursement Page**
* ✅ **List Reimbursement Request**
* ✅ Akses **Detail Reimbursement Request Page**

#### 🔔 Notification Tab

* ✅ **List Notification Reimbursement Request**
* ✅ **List Notification Sign Up Request**
* ✅ **List Notification Perubahan Data Karyawan**
* ✅ Akses **Detail Reimbursement Request Page**
* ✅ Akses **Detail Sign Up Request Page**
* ✅ Akses **Detail Perubahan Data Karyawan Page**

#### 👤 Profile Tab

* ✅ **Profile Page**
* ✅ Akses **Full Profile & Edit Profile Page**
* ✅ **Logout**

---
