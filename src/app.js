const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swaggerConfig');

const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = app;
