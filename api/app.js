import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';

import axios from 'axios';
import Sequelize from 'sequelize';


/*
  Importing functions to run the application.
  The routes folder imports index.js file that routes to further endpoints.
*/

const app = express();

app.use(express.json());                           
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
routes(app);
export default app;  