import axios from 'axios';
import User from '../models/User.js';
import Sequelize from 'sequelize';
import emailValidator from 'email-validator';
import bcrypt from 'bcrypt';
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import * as logger from "../logging.js";
import { nanoid } from 'nanoid';

//import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

export const s3var = new AWS.S3({
  // accessKeyId: "AKIA3YSWQDGASOTNPEXQ",
  // secretAccessKey: "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",
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  Bucket: "testbucket1"
})


/**
 * Uses axios library to make http requests from browser.
 * The response received from the endpoint is returned to the controller.
 * It will return the success or error response based on the response received from the url.
 */

//authenticating the user

export const authenticatedUser= async(request,response,next)=>{

 //to check if headers are present
  if(!request.headers.authorization){
    let response = { statusCode: 401, message: "Authorization header missing" };
    return response;
  }
  const base64Creds =  request.headers.authorization.split(' ')[1];
  const authCreds = Buffer.from(base64Creds, 'base64').toString('ascii');
  const [authUsername,authPassword] = authCreds.split(':'); 

  let userToBeUpdated = await User.findOne({
    where: {
      username:authUsername
    }
  })


  if(userToBeUpdated == null)
  {
    let response = { statusCode: 401, message: "Unauthorized Access" };
    return response;
  }


  let validAuthUser=await bcrypt.compare(authPassword,userToBeUpdated.dataValues.password);

  if(!validAuthUser)
  {
    let response = { statusCode: 401, message: "Unauthorized Access" };
    return response;
    
  }

  return userToBeUpdated;

  //const  authenticUser = await 
}

//fetching response from healthz endpoint


export const httpResponseFetch = async (request,response)=>{
    try{
    
      let healthendpoint = `https://virtserver.swaggerhub.com/spring2022-csye6225/app/1.0.0/healthz`;
        var responseNew =  await axios.get(healthendpoint);
        return responseNew.status;
      }
      
      catch(e){
        throw e;
      }
}

//create a user
export const createUser = async (request,response)=>{
  try{

    if(!request.body||!request.body.username||!request.body.first_name||!request.body.last_name||!request.body.password){
      
      let response = { statusCode: 400, message: "Bad Request" };
      return response;
    }

    if(request.body.password){
      const encryptedPass = bcrypt.hashSync(request.body.password,10);
      request.body.password=encryptedPass;
    }
  
    const newUser1 = new User(request.body);
    if(!emailValidator.validate(request.body.username)){
        const profileResponse = {statusCode:400, message:"Bad Request"};
        return profileResponse;
     }
     
        let profileExists = await User.findOne({
            where: {
            username:request.body.username
          }        
        })

        if(profileExists){

          const profileResponse = {
             statusCode:400,
             message:"Bad Request"
          };
          return profileResponse;
        }
        
        //in case of a new user
        else
        {
          const response= await newUser1.save();  
          //To send message to Dynamo DB
          var dynamoDatabase = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' });
          const elapsedTime= 5*60;
          const initialTime = Math.round(Date.now() / 1000);
          const expiryTime = initialTime+elapsedTime;
          const randomnanoID = nanoid(10);
          
          // Create the Service interface for dynamoDB
          var parameter={
              Item: {
                'TokenName': { S: randomnanoID },
                'TimeToLive': { N: expiryTime.toString()}
              },
              TableName: 'myDynamoTokenTable'
          };
  
          //saving the token onto the dynamo DB
          await dynamoDatabase.putItem(parameter).promise();

          //To send message onto SNS
          //var sns = new AWS.SNS({apiVersion: '2010-03-31'});

          // Create publish parameters
          var params = {
            Message: response.username,
            Subject: randomnanoID,
            TopicArn: 'arn:aws:sns:us-east-1:172869529067:VerifyingEmail'

          };

          //var topicARN= 'arn:aws:sns:us-east-1:172869529067:VerifyingEmail';

          var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31', region: 'us-east-1'});

          await publishTextPromise.publish(params).promise();
          
          //returning response of the creating user.
          const returnProfile={
            statusCode:200,
            message:{
              id:response.id,  
              first_name:response.first_name,
              last_name: response.last_name,
              username: response.username,
              account_created:response.createdAt,
              account_updated:response.updatedAt
            }
          };
          return returnProfile;
      }
    }
    catch(e){     
      let response1 = { statusCode: 500, message: e.message };
      return response1;
    }
}

//update a user

export const updateUser = async (request,response)=>{
  try{    

    //const authUser = await authenticatedUser(request,response,next);
    
    if(!request.headers.authorization){
      let response = { statusCode: 401, message: "Authorization header missing" };
      return response;
    }

    const base64Creds =  request.headers.authorization.split(' ')[1];
    const authCreds = Buffer.from(base64Creds, 'base64').toString('ascii');
    const [authUsername,authPassword] = authCreds.split(':'); 
    let userToBeUpdated = await User.findOne({
      where: {
        username:authUsername
      }
    })

    if(userToBeUpdated == null)
    {
      let response = { statusCode: 401, message: "Unauthorized Access" };
      return response;
    }

    let validAuthUser=await bcrypt.compare(authPassword,userToBeUpdated.dataValues.password);
    if(!validAuthUser)
    {
      let response = { statusCode: 401, message: "Unauthorized Access" };
      return response;
    }

    
    if(!request.body.first_name || !request.body.last_name || !request.body.password){
      let response = { statusCode: 400, message: "Bad Request" };
      return response;
    }

    if(request.body.account_created || request.body.account_updated || request.body.id||request.body.username){
      let response = { statusCode: 400, message: "Bad Request" };
      return response;
    }
    let encryptedPass ="";
    if(request.body.password)
    {
       encryptedPass = bcrypt.hashSync(request.body.password,10);
    }
    else{
      encryptedPass=userToBeUpdated.dataValues.password;
    }
    
    await User.update({first_name:!request.body.first_name?userToBeUpdated.dataValues.first_name:request.body.first_name,
          last_name:!request.body.last_name?userToBeUpdated.dataValues.last_name:request.body.last_name,
          password:!request.body.password?userToBeUpdated.dataValues.password:encryptedPass},
          {
            where:{
              username:authUsername
            }
          }

        )
        let response = { statusCode: 204, message: "" };
        return response;
    }
    catch(e){     
      response = { statusCode: 500, message: e.message };
      return response;
    }
}

//get a particular user 

export const getUser = async (request,response)=>{
  try{     
    
    if(!request.headers.authorization){
      let response = { statusCode: 401, message: "Authorization header missing" };
      return response;
    }
    const base64Creds =  request.headers.authorization.split(' ')[1];
    const authCreds = Buffer.from(base64Creds, 'base64').toString('ascii');
    const [authUsername,authPassword] = authCreds.split(':'); 
   
    let userToBeUpdated = await User.findOne({
      where: {
        username:authUsername
      }
    })
    console.log(userToBeUpdated);
    if(userToBeUpdated == null){
      let response = { statusCode: 401, message: "Unauthorized Access" };
      return response;
    }

    let validAuthUser=await bcrypt.compare(authPassword,userToBeUpdated.dataValues.password);
    
    if(!validAuthUser)
    {
      let response = { statusCode: 401, message: "Unauthorized Access" };
      return response;
    }

    if(!authPassword){
      let response = { statusCode: 401, message: "Unauthorized Access" };
      return response;
    }
    const returnProfile={
          statusCode:200,
          message:{
            id:userToBeUpdated.dataValues.id,
            first_name:userToBeUpdated.dataValues.first_name,
            last_name: userToBeUpdated.dataValues.last_name,
            username: userToBeUpdated.dataValues.username,
            account_created:userToBeUpdated.dataValues.createdAt,
            account_updated:userToBeUpdated.dataValues.updatedAt
          }
    }; 
    return returnProfile;
   
  }
  catch(e){     
      response = { statusCode: 500, message: e.message };
      return response;
  }
}

//To verify Email of a particular user

export const verifyEmail = async(request,response)=>{

    try{

        const email = request.query.email;
        const token = request.query.token;

        AWS.config.update({
            region : "us-east-1",
            accessKeyId : process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY        
          }
        );

        var dynamoDatabase = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' });

        let userName = await User.findAll({ where: { username: email }
        })

        if(userName==""||userName==null)
        {
          console.log(userName);
          let response = { statusCode: 401, message: "Unauthorized Access" };
          return response;
        }

        if(userName[0].dataValues.verifyuser){
          let response = { statusCode: 400, message: "Your email is already verified" };
          return response;
        }

        // Create the Service interface for dynamoDB
        var parameter={        
            Key: {
              'TokenName': { S: token }
             },
            TableName: 'myDynamoTokenTable',
            ProjectionExpression: 'TimeToLive'
        };
  
        //getting the token onto the dynamo DB
        const dynamoResponse = await dynamoDatabase.getItem(parameter).promise();
        console.log("Response from dynamo",dynamoResponse);
        
        //computing current timestamp to check if token is expired
        const currentTime= Math.round(Date.now()/1000);
        console.log("TTL time",dynamoResponse.Item.TimeToLive.N);
        console.log("current time", Math.round(Date.now()/1000));
        //console.log("Item response here",dynamoResponse.Item);
        
        if ((dynamoResponse.Item.TimeToLive.N)< currentTime||dynamoResponse.Item==undefined)
        {
          let response = {
            statusCode: 400,
            message: "Token has already expired"
          };
          return response;
        }
        //if the token is successfully verified, the verifyuser flag is updated to true
        await User.update({verifyuser: true},
          {where:{username: email}});

        let response = {statusCode:200, message:"Token successfully updated"}
        return response;
    }      
    catch(e){    
      console.log(e); 
      response = { statusCode: 500, message: e.message };
      return response;
    }
}