import express from 'express';
import bootstrap from './src/utils/controllers.js';
import dotenv from 'dotenv';
import path from 'path';
import './src/config/passport.js';
dotenv.config(path.resolve(".env"));
const app = express(); 

bootstrap(app, express);
const port = 3000;


// Initialize passport
app.use(passport.initialize());
app.listen(port, () => console.log(`Server is running on port ${port}`));