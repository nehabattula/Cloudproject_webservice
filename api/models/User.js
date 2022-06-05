

import Sequelize from 'sequelize';

import fs from 'fs';
import dotenv from 'dotenv';
const __dirname = null;
const rdsCa = fs.readFileSync(process.env.PWD+'/api/models/us-east-1-bundle.pem');
console.log("here",rdsCa);
dotenv.config(); 

//setting connection string, logging environment variables of env.

var connectionString = process.env.DB_CONNECTION;

function setConnectionString()
{
    connectionString = process.env.DB_CONNECTION;
    console.log(connectionString);
    console.log(process.env);
    console.log(process.env.DB_NAME);
    console.log(process.env.DB_USERNAME);
    console.log(process.env.DB_PASSWORD);
    console.log(process.env.S3_BUCKET_NAME);
}

setConnectionString();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD,
{
    dialect: 'postgres',
    ssl: {
            rejectUnauthorized: true,
            ca: [rdsCa] 
    },
    host: connectionString,
    port: 5432, 
    pool: {
     max: 10,idle: 30000
   },
})


const dbConnection = async()=> {
    
    try{

      sequelize.authenticate().then(()=>{
     console.log("Connected to DB successfully")
      })
     .catch(error=>{
        console.log("Connection to DB failed");
     })
    }
     catch(e){
      console.log("Exception has ocurred while connecting to DB:",e);
     }
  }
  
  dbConnection(); //to check if the Database connection was successful.

  //model class user 
const User = sequelize.define('user', {

    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
        allowNull:true
    },

    first_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    last_name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    },
    username:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    verifyuser:{
        type: Sequelize.BOOLEAN
    }
 },
 {
    freezeTableName: true
  }

);

//to prevent dropping the database
User.sync({force:true}) 

export default User;
