#!/bin/bash
curl --silent --location https://rpm.nodesource.com/setup_17.x | sudo bash -
sudo yum install -y nodejs
sudo node -v
sudo unzip webservice.zip -d webservice  
sudo ls -al
cd ~/webservice

sudo npm install pm2@latest -g
sudo pm2 kill
#sudo pm2 start server.js
sudo pm2 start logconfig.json
sudo pm2 save
sudo pm2 startup systemd --service-name myapp

sudo yum update
sudo yum install wget ruby -y

CODEDEPLOY_BIN="/opt/codedeploy-agent/bin/codedeploy-agent"
$CODEDEPLOY_BIN stop
yum erase codedeploy-agent -y
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo service codedeploy-agent status
sudo service codedeploy-agent start
sudo service codedeploy-agent status

#installing CloudWatch agent
sudo yum install amazon-cloudwatch-agent -y


#Start the CloudWatch agent using the command line
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/home/ec2-user/webservice/amazon-cloudwatch-agent-schema.json
sudo service codedeploy-agent stop