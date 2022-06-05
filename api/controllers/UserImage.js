
/*
  Using statsd-client for counting the number of hits to each endpoint.
  As and whenever there is a hit on the application, it will increment the counter
*/
import { request, response } from "express";
import * as UserImage from "../services/UserImage.js";
import * as webService from "../services/webService.js";

import SDC from 'statsd-client';

//setting object of statsd-client

let sdc = new SDC(
  {
    host: 'localhost',
    prefix: 'csye6225webapplicationlog1'
  }
)

// to create and update a picture

export const createOrUpdatePicture = async(request,response)=> {

    try{
      sdc.increment('POST/v1/user/self/pic');
      console.log("response from uploading/ updating a picture");

      //to get authenticated user before creating and updating the picture.
      const getAuthUser = await webService.authenticatedUser(request,response);

      //returning 401 if not authorized
      if(getAuthUser.statusCode==401)
      {
       //if response is not authorized return 401
        let response1 = { statusCode: 401, message: "Unauthorized Access.." };
        response.status(response1.statusCode);
        response.json(response1.message);
        console.log(response);
        return response;
      }


     //setting the name of the file
      await UserImage.toSetFileName(request,response,getAuthUser)

      //got uploading the image

      const UploadAFile=UserImage.upload.single('userimage'); 

      //Once uploaded, it is checked for errors
      UploadAFile(request, response, async function (error)
       {
        
        //sending error code 422 if there is an error while creating the bucket
        if (error) {
           
            return response.status(422).send({ errors: [{ title: 'Error while creating bucket', detail: error.message }] });
         }
         
        console.log(getAuthUser);
        //saving the image to the database
        const result = await  UserImage.toDatabase(request, response, getAuthUser);
          
         response.status(200);
         response.json(result.message);
         return response;
  
      }
      
     );
 
   }
   catch(e){ 
      throw e;
   }
    
  }
  
//to delete a picture from S3 and database

export const deletePicture = async(request,response)=>{

  try{

   //to get the authenticated user from auth function
   sdc.increment('POST/v1/user/self/pic/delete');
   console.log("deleting a picture");

    const getAuthUser = await webService.authenticatedUser(request,response);
    console.log("get auth in delete",getAuthUser);
    console.log("get auth status code",getAuthUser.statusCode);
    if(getAuthUser.statusCode==401){
      let response1 = { statusCode: 401, message: "Unauthorized Access" };
      
       console.log(response);
        response.status(response1.statusCode);
        response.json(response1.message);
        return response; 
    }

    console.log(getAuthUser);

    //deleting the picture from the UserImage database and S3 as well
    var res=await UserImage.deletePicture(request,response,getAuthUser)
    response.status(res.statusCode);
    response.json(res.message);
    console.log("response after delete in controller",response);
    return response;

  }
  catch(e){
    throw e;
  }
}

//to get a particular picture 

export const getPicture = async(request,response)=>{
  try{

    sdc.increment('GET/v1/user/self/pic');
    console.log("get a picture");

    const getAuthUser = await webService.authenticatedUser(request,response);
    if(getAuthUser.statusCode==401){
      let response1 = { statusCode: 401, message: "Unauthorized Access" }; 
      response.status(response1.statusCode);
      response.json(response1.message);
      console.log(response1);
      return response; 

    }

    const result = await UserImage.getPicture(request,response,getAuthUser);
   // console.log(result);
    response.status(200);
    response.json(result.message);
    return response;

  }
  catch(e){
    throw e;
  }
}