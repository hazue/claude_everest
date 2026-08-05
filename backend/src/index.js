require('dotenv').config();
const express = require('express');
const logger = require('./logger');

const authRoutes = require('./routes/auth');
const passengerRoutes = require('./routes/passenger');
const crewleadRoutes = require('./routes/crewlead');
const hardwareRoutes = require('./routes/hardware');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/passenger', passengerRoutes);
app.use('/api/crewlead', crewleadRoutes);
app.use('/api/hardware', hardwareRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.originalUrl });
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  logger.info('Server started', { port });
  console.log(`Passenger Resource Management API listening on :${port}`);
});
