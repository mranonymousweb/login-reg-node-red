const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const app = express();
const port = 3000;

// تنظیمات session
app.use(session({
    secret: 'ritowierptoiskjfasdlcxvqwr1321657987987546',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(express.static('public')); // پوشه public را به عنوان فایل‌های استاتیک در دسترس قرار می‌دهد

// اتصال به پایگاه داده MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mtmdb',
    port: 987
});

db.connect((err) => {
    if (err) {
        console.error('خطا در اتصال به دیتابیس:', err);
    } else {
        console.log('اتصال به دیتابیس برقرار شد');
    }
});

// روت برای ورود کاربر
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: 'نام کاربری یا رمز عبور نمی‌تواند خالی باشد.' });
    }

    const query = `SELECT * FROM Users WHERE Username = ? AND Password = ?`;
    db.execute(query, [username, password], (err, result) => {
        if (err) {
            console.error('خطا در اجرای کوئری:', err);
            return res.json({ success: false });
        }

        if (result.length > 0) {
            req.session.username = username; // ذخیره نام کاربری در نشست
            req.session.ui_url = result[0].ui_url; // ذخیره ui_url در نشست
            res.json({ success: true, username: username });
        } else {
            res.json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }
    });
});

// روت برای خروج
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.json({ success: false, message: 'خطا در خروج از سیستم.' });
        }
        res.json({ success: true });
    });
});

// روت صفحه اصلی (ورود)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// روت داشبورد اختصاصی هر کاربر
app.get('/dashboard/:username', (req, res) => {
    const username = req.params.username;

    if (!req.session.username || req.session.username !== username) {
        return res.redirect('/'); // اگر وارد نشده بود، هدایت به صفحه ورود
    }

    // ارسال صفحه داشبورد کاربر
    res.sendFile(__dirname + '/dashboard.html');
});

// روت برای نمایش داشبورد اختصاصی هر کاربر
app.get('/ui/:username', (req, res) => {
    const username = req.params.username;

    // اطمینان از ورود کاربر
    if (!req.session.username || req.session.username !== username) {
        return res.redirect('/');  // هدایت به صفحه ورود اگر کاربر وارد نشده باشد
    }

    // دریافت آدرس `ui_url` از نشست
    const userDashboardUrl = req.session.ui_url;

    // بررسی اینکه آیا آدرس وجود دارد
    if (!userDashboardUrl) {
        return res.send('<h1>خطا: آدرس داشبورد برای این کاربر تعریف نشده است.</h1>');
    }

    // نمایش داشبورد داخل iframe
    res.send(`
        <h1>پنل اختصاصی برای ${username}</h1>
        <iframe src="${userDashboardUrl}" style="width:100%; height:600px; border:none;"></iframe>
    `);
});

// روت برای دریافت نام کاربر وارد شده
app.get('/get-username', (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.json({ username: null });
    }
});

app.listen(port, () => {
    console.log(`سرور در حال اجرا در http://localhost:${port}`);
});
