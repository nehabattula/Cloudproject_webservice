#!/bin/bash
cd /home/ec2-user/webservice
sudo pm2 kill
sudo npm i
sudo pm2 start logconfig.json
sudo pm2 save
sudo pm2 startup systemd --service-name myapp

# sudo pm2 startup systemd --service-name myapp
# cd /home/ec2-user/webservice
# sudo pm2 save
# sudo pm2 list
# sudo npm install --production
# sudo pm2 reload all --update-envs