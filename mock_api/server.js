const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');

const server = express();

// CORS
server.use(cors());
server.use(express.json());

// Gmail SMTP Transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'sait1223ari@gmail.com',
    pass: 'dpok bjgk yiom qkjt'
  }
});

// Email gönderme endpoint'i (JSON Server route'larından ÖNCE)
server.post('/send-email', async (req, res) => {
  try {
    const { to, subject, code, userName } = req.body;
    
    console.log('📧 Email gönderiliyor:', to);
    
    const mailOptions = {
      from: 'Proje Yöneticisi <sait1223ari@gmail.com>',
      to: to,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2563EB; text-align: center;">🔐 Proje Yöneticisi</h1>
            <h2 style="color: #1F2937;">Merhaba ${userName},</h2>
            <p style="font-size: 16px; color: #374151;">Şifre sıfırlama kodunuz:</p>
            <div style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</div>
            </div>
            <p style="color: #DC2626; font-weight: 600;">⏰ Bu kod 10 dakika geçerlidir.</p>
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                <strong>⚠️ Güvenlik:</strong> Bu işlemi siz yapmadıysanız, bu emaili görmezden gelin.
              </p>
            </div>
            <p style="text-align: center; color: #6B7280; font-size: 14px;">
              Saygılarımızla,<br>
              <strong style="color: #2563EB;">Proje Yöneticisi Ekibi</strong>
            </p>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email gönderildi:', info.messageId);
    
    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email başarıyla gönderildi'
    });
    
  } catch (error) {
    console.error('❌ Email hatası:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint
server.get('/test-email', (req, res) => {
  res.json({ 
    message: '📧 Email servisi çalışıyor!',
    timestamp: new Date().toISOString()
  });
});

// Database helper fonksiyonları
const readDB = () => {
  const data = fs.readFileSync('db.json', 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
};

// Users endpoints
server.get('/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

server.get('/users/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

server.post('/users', (req, res) => {
  const db = readDB();
  const newUser = req.body;
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

server.put('/users/:id', (req, res) => {
  const db = readDB();
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...req.body };
    writeDB(db);
    res.json(db.users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Tasks endpoints
server.get('/tasks', (req, res) => {
  const db = readDB();
  res.json(db.tasks);
});

server.post('/tasks', (req, res) => {
  const db = readDB();
  const newTask = req.body;
  db.tasks.push(newTask);
  writeDB(db);
  res.status(201).json(newTask);
});

server.put('/tasks/:id', (req, res) => {
  const db = readDB();
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    db.tasks[index] = { ...db.tasks[index], ...req.body };
    writeDB(db);
    res.json(db.tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

server.delete('/tasks/:id', (req, res) => {
  const db = readDB();
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Task deleted' });
});

// Domains endpoints
server.get('/domains', (req, res) => {
  const db = readDB();
  res.json(db.domains);
});

server.post('/domains', (req, res) => {
  const db = readDB();
  const newDomain = req.body;
  db.domains.push(newDomain);
  writeDB(db);
  res.status(201).json(newDomain);
});

server.delete('/domains/:id', (req, res) => {
  const db = readDB();
  db.domains = db.domains.filter(d => d.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Domain deleted' });
});

// Passwords endpoints
server.get('/passwords', (req, res) => {
  const db = readDB();
  res.json(db.passwords);
});

server.post('/passwords', (req, res) => {
  const db = readDB();
  const newPassword = req.body;
  db.passwords.push(newPassword);
  writeDB(db);
  res.status(201).json(newPassword);
});

server.delete('/passwords/:id', (req, res) => {
  const db = readDB();
  db.passwords = db.passwords.filter(p => p.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Password deleted' });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log('🚀 Server çalışıyor: http://localhost:' + PORT);
  console.log('📊 Database: http://localhost:' + PORT + '/users');
  console.log('📧 Email: http://localhost:' + PORT + '/send-email');
});