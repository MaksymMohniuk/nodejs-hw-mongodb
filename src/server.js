import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { env } from './utils/env.js';
import contactsRouter from './routers/contacts.js';

import { HttpError } from 'http-errors';

const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use(contactsRouter);

  const notFoundHandler = (err, req, res) => {
    res.status(404).json({
      status: 404,
      message: 'Route not found',
    });
  };

  app.use(notFoundHandler);

  const errorHandler = (err, req, res, next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({
        status: err.status,
        message: err.name,
        data: err,
      });
      return;
    }
    res.status(500).json({
      status: 500,
      message: 'Something went wrong',
      data: err,
    });
  };

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
