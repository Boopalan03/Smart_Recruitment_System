const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Ensure 'backend/uploads' folder exists
// We use path.join to ensure it works on Windows and Mac/Linux
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Storage (Where to save & What to name it)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save to the 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Create a unique filename: resume-TIMESTAMP-RANDOM.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. File Filter (Only allow PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
    // Regex to check file extension
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Only .pdf, .doc, and .docx files are allowed!'));
    }
};

// 4. Initialize Multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit size to 5MB
    fileFilter: fileFilter
});

module.exports = upload;