import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/error.js';
import mapRoutes from './routes/map.js';
import userRoutes from './routes/user.js';

dotenv.config();
connectDB();
const app = express();

if (process.env.NODE_ENV === 'development') {
  // log HTTP requests and errors
  app.use(morgan('dev'));
}

// Allow accessing json body data from request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoints
app.use('/api/map', mapRoutes);
app.use('/api/user', userRoutes);

// For deployment
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Middlewares
app.use(cors());
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
