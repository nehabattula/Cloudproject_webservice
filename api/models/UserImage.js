
//importing sequelize
//importing config
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
const __dirname = null;
const rdsCa = fs.readFileSync(process.env.PWD+'/api/models/us-east-1-bundle.pem');
console.log("here",rdsCa);
dotenv.config();

//trim connection sting as rds parameter is not taking a space in DB_CONNECTION...

var connectionString = process.env.DB_CONNECTION;

function setConnectionString() 
{
  connectionString = process.env.DB_CONNECTION;
    console.log(connectionString);
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

//connectivity with database.

  const dbConnection = async()=> {
    
    try{

      sequelize.authenticate().then(()=>{
          console.log("Connected to Database successfully")
      })
     .catch(error=>{
        console.log("Connection to database failed");
     })
    }
     catch(e){
      console.log("Exception ocurred:",e);
     }
  }

  dbConnection(); //to check if the Database connection was successful.

//User image mode class
//Having all the parameters of id, file_name, url, user_id


  const UserImage = sequelize.define('userimage', {

    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true,
        allowNull:true
    },

    file_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    url:{
        type: Sequelize.STRING,
        allowNull: false
    },
    upload_date:{
        type: Sequelize.DATE,
        allowNull: false
    },
    user_id:{
        type: Sequelize.UUID,
        allowNull: false
    }

 },
 {
    freezeTableName: true
  }

);

//to prevent dropping the database
UserImage.sync({force:true})  

export default UserImage; 


