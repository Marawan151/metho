const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('../backend/routes/auth');
const userRoutes = require('../backend/routes/users');
const eventRoutes = require('../backend/routes/events');
const registrationRoutes = require('../backend/routes/registrations');
const notificationRoutes = require('../backend/routes/notifications');
const adminRoutes = require('../backend/routes/admin');

const app = express();

app.use(cors());
app.use(express.json({ limit: '128kb' }));

app.use(
  '/frontend',
  express.static(path.join(__dirname, '..', 'frontend'), { index: false })
);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'event-registration-api',
    routes: ['auth', 'users', 'events', 'registrations', 'notifications', 'admin'],
  });
});

app.get('/', (req, res) => {
  res.redirect(302, '/frontend/pages/index.html');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

const port = Number(process.env.PORT) || 5001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
