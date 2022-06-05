/*
  This file routes the request further to the service app using the httpResponseFetch method
  of the web service.
  The response returned from service is then sent back and in case of an error, the status code: 400
  is returned.
*/

import * as webService from "../services/webService.js";
import * as statsD from 'node-statsd';
import SDC from 'statsd-client';

//setting object of statsd-client
let sdc = new SDC(
  {
    host: 'localhost',
    prefix: 'csye6225webapplicationlog1'
  }
)

//incrementing sdc for each endpoint

export const httpResponse = async(request,response)=> {

  try{
    sdc.increment('GET/healthz');
    console.log("response from healthz");
    const responseNew = await webService.httpResponseFetch(request,response);

    return response.sendStatus(responseNew);
   
  }
  catch(e){ 
    console.log('bad request healthz')
    return response.sendStatus(400);
  }
  
}

export const createUser = async(request,response)=> {

  try{
    console.log("response from create user");
    sdc.increment('POST/v1/user');
    const responseNew = await webService.createUser(request,response)
    response.status(responseNew.statusCode);
    if(responseNew.statusCode==400){
    
      response.json({"message": "Bad Request"});
    }
    else{
     response.json(responseNew.message);

    } 
    
  }
  catch(e){ 
    throw e;
  }
  
}

export const updateUser = async(request,response)=> {

  try{
    sdc.increment('POST/v1/user/self');
    const newUser= request.body;
    const updateResponse = await webService.updateUser(request,response);
    //logger.info("updating user");
    response.sendStatus(updateResponse.statusCode); 
  }
  catch(e){ 
    throw e;
  }
  
}


export const getUser = async(request,response)=> {

  try{
    sdc.increment('GET/v1/user/self');
    console.log("get a particular user");
    const getAParticularUser = await webService.getUser(request,response);
    response.status(getAParticularUser.statusCode);
    response.json(getAParticularUser.message);  
  }
  catch(e){ 
    throw e;
  } 
}

export const verifyEmail = async(request,response)=> {

  try{
    sdc.increment('GET/v1/verifyEmailLink');
    console.log("verify email of a user in controller");
    const verifyAParticularEmail = await webService.verifyEmail(request,response);
    response.status(verifyAParticularEmail.statusCode);
    response.json(verifyAParticularEmail.message);  
  }
  catch(e){ 
    throw e;
  } 
}