    import axios from 'axios';
    import User from '../models/User.js';
    import Sequelize from 'sequelize';
    import emailValidator from 'email-validator';
    import bcrypt from 'bcrypt';

    import AWS from 'aws-sdk';
    import multer from 'multer';

    import multerS3 from 'multer-s3';
    import UserImagesProfile from "../models/UserImage.js";
    import { request, response } from 'express';
    import dotenv from 'dotenv';

    dotenv.config();

   //initializing the filname
    var fileNameGlobal="";

    var bucketName=process.env.S3_BUCKET_NAME;

    console.log("bucket name from env", process.env.S3_BUCKET_NAME);
    
    AWS.config.update({
        secretAccessKey: process.env.AWS_SECRET_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY
    });
    

    const s3 = new AWS.S3(); 

//to check the file format is jpg or png using mimeType

    const fileMatch= (request,file,cb)=>{
        if(file.mimetype==='image/jpeg'|| file.mimetype==='image/jpg'){
         bucketName=process.env.S3_BUCKET_NAME;   
        cb(null,true)
        }
        else{
            cb(new Error("Invalid File type"),false)
        }
    }

    //setting the file name and bucket name 
    //filename is set by taking the authenticated user's values

    export const toSetFileName = async(request,response,user)=>{
    
        fileNameGlobal=user.dataValues.id;
        bucketName= process.env.S3_BUCKET_NAME;
        console.log("s3 bucket name",bucketName);
    }

    //upload the file using multer S3
    
    export const upload = multer({
            fileMatch,
            storage: multerS3({
            s3,
            bucket: bucketName,
        
                key: function (req, file, cb) {
                cb(null, fileNameGlobal)
                },
            
            })
    })
        

    //checking with the database to check if the user exists and accordingly saves to the database

        export const toDatabase = async(request,response,user)=>{
            try{
            
                console.log("user's dataValues",user.dataValues.id);
                let  location = "s3://e8f1f1f0-dev.nehabattula.me"+user.dataValues.id
                const ifExists= await UserImagesProfile.findAll({where: {user_id:user.dataValues.id}});
                if(ifExists!=""){
                    console.log(ifExists);
                    //to update in the database
                    await UserImagesProfile.update({
                        file_name:user.dataValues.id,

                        url:location,
                        upload_date: new Date(),
                    },{where: {
                        user_id:user.dataValues.id
                    }});
                }
                
         //if it exists then create the new umage and replace it with the response

            const createuserimage1 = 
            {
                file_name: user.dataValues.id,
                url: location,
                upload_date: new Date(),
                user_id: user.dataValues.id
           }
               
            const createuserimage = new UserImagesProfile(createuserimage1);
            
                console.log("here create", createuserimage);
                await createuserimage.save();
                console.log("saved image successfully")
                let response={statusCode:200, message:createuserimage};
                return response;
        
            }

          //in case of an exception while saving to the database

            catch(e){
                let response = { statusCode: 400, message:e}
                return response;
            }
        }


    //to delete the picture
    export const deletePicture = async (request,response,user)=>{

        try{
        const deleteProfile = await UserImagesProfile.findAll({ where: { user_id: user.dataValues.id } }); 
       
        
        const s3 = new AWS.S3();
        if(deleteProfile==""){
            let response={statusCode:404, message: "Profile picture does not exist"};
            return response;
        }
        console.log("before destroying the bucket",user.dataValues.id);

        await UserImagesProfile.destroy({where:{user_id:user.dataValues.id}})

        //deleting an object from s3 bucket
         //the key is taken from the authenticated user
        s3.deleteObject({
            Bucket: bucketName,
            Key: user.dataValues.id
        }, function(err,data){})


        let res = {statusCode:204, message: "Picture Deleted Successfully"};
        console.log("res in delete ",res);
        return res;

        }
        catch(e){
            console.log("error while deleting",e);
            throw e;
        }

    }

    //for getting a picture form the user's profile

    export const getPicture = async (request,response,user)=>{
        
        const getProfile = await  UserImagesProfile.findAll({ where: { user_id: user.dataValues.id } });
        
        console.log("here in get profile", getProfile);

        //if image is not found then returns no image exists

        if(getProfile==""){
            let response={statusCode:400, message:"Image does not exist"};
            return response;
        }

        //incase the image is found, returns success response

        let re= {statusCode:200, message:getProfile}
        return re;
    }

