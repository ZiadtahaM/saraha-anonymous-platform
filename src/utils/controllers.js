import connectiondb from "../db/models/connectiondb.js";
import userRouter from "../modules/user/user.routes.js"; // Verify correct path
import express from 'express';

const bootstrap = async (app, express) => {
  try {
    // 1. Database Connection
    await connectiondb();
    
    // 2. Middleware Setup
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/users', userRouter); 
    // 4. 404 Handler
    app.use("*", (req, res) => {
      res.status(404).json({ 
        status: 'fail',
        message: `Invalid URL: ${req.originalUrl}` 
      });
    });

    // 5. Error Handling
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    });

    return app;

  } catch (error) {
    console.error('Bootstrap failed:', error);
    throw error;
  }
}

export default bootstrap;