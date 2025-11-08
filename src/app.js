const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const serviceRoutes = require('./routes/service');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
app.use(bodyParser.json());

connectDB();

app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', serviceRoutes);

app.get('/', (req, res) => res.send('Category-Service API running with MongoDB'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
