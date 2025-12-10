const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tentukan lokasi penyimpanan file yang di-upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'upload');

        // Pastikan direktori tujuan ada
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, fileName);
    }
});

// Buat upload instance dengan aturan file
const uploadMulter = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        // Debugging: Log nama file dan tipe file
        console.log('File received:', file.originalname);
        console.log('File type:', file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

module.exports = uploadMulter;
