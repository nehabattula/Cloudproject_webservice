import webRouter from './webRoute.js';  //importing webRoute.js from routes to endpoints further

export default (app) =>{
  
    app.use('/',webRouter);

};