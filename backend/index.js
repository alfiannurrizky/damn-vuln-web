const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config(); // Load .env from backend root

const app = express();
const port = 3000;

app.set('etag', false); // Disable caching for easier pentesting in BurpSuite

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static files from 'public' directory
// VULNERABLE: Sensitive Data Exposure (Exposes .env)
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
let db;

function connectDatabase() {
    db = mysql.createConnection({
        host: process.env.DB_HOST || 'mysql',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_NAME || 'vuln_db',
        multipleStatements: true // Enable multiple statements for SQLi
    });

    db.connect((err) => {
        if (err) {
            console.error('Database connection failed: ' + err.message + '. Retrying in 3 seconds...');
            setTimeout(connectDatabase, 3000);
        } else {
            console.log('Connected to database.');
        }
    });

    db.on('error', (err) => {
        console.error('Database error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectDatabase();
        }
    });
}

connectDatabase();

// Setup multer for file upload
// VULNERABLE: File Upload Vulnerability (No extension or MIME check)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        // Keeps original filename, allowing upload of .php, .html, etc.
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });

// Middleware to verify JWT (basic check)
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, process.env.JWT_SECRET || 'supersecretjwtkey', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.authData = authData;
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
};

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

// 1. LOGIN
// VULNERABLE: SQL Injection
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // Raw query using string concatenation
    const query = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        
        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ user: { id: user.id, role: user.role } }, process.env.JWT_SECRET || 'supersecretjwtkey');
            res.json({ success: true, token, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// 2. OTP VERIFICATION
// VULNERABLE: OTP Bypass via Response Manipulation
app.post('/api/verify-otp', (req, res) => {
    const { otp } = req.body;
    
    // Hardcoded OTP for demonstration
    if (otp === '123456') {
        res.json({ success: true, message: 'OTP verified' });
    } else {
        res.json({ success: false, message: 'Invalid OTP' });
    }
});

// 3. GET USER LIST
app.get('/api/users', verifyToken, (req, res) => {
    const userRole = req.authData.user.role;
    const userId = req.authData.user.id;
    
    let query = 'SELECT id, username, email, role, phone, avatar FROM users';
    
    if (userRole !== 'admin') {
        query += ` WHERE id = ${userId}`;
    }
    
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json({ success: true, data: results });
    });
});

// 4. GET USER DETAIL
// VULNERABLE: Broken Access Control (IDOR)
// Does not check if the requested ID matches the token's ID
app.get('/api/users/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    db.query(`SELECT * FROM users WHERE id = ${id}`, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json({ success: true, data: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

// 5. UPDATE USER PROFILE
// VULNERABLE: Broken Access Control (IDOR)
app.put('/api/users/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    const { username, phone, address } = req.body;
    
    const query = `UPDATE users SET username='${username}', phone='${phone}', address='${address}' WHERE id=${id}`;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error updating profile' });
        }
        res.json({ success: true, message: 'Profile updated successfully' });
    });
});

// 6. UPLOAD AVATAR
// VULNERABLE: File Upload (No validation)
app.post('/api/upload', verifyToken, upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Construct file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Optional: update the user's avatar in db
    if (req.body.userId) {
        db.query(`UPDATE users SET avatar='${fileUrl}' WHERE id=${req.body.userId}`);
    }

    res.json({ 
        success: true, 
        message: 'File uploaded',
        url: fileUrl
    });
});

// 7. SEARCH EMPLOYEES
// VULNERABLE: SQL Injection (UNION based)
app.get('/api/search', (req, res) => {
    const q = req.query.q || '';
    
    // Vulnerable raw query
    let query = `SELECT id, username, email, role FROM users WHERE username LIKE '%${q}%'`;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        res.json({ success: true, data: results });
    });
});

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});
