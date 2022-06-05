#!/usr/bin/env bash

sudo chmod +rwx /opt/aws/amazon-cloudwatch-agent/doc/amazon-cloudwatch-agent-schema.json
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ec2-user/webservice/amazon-cloudwatch-agent-schema.json -s
# cd /home/ec2-user/webservice

# #stopping the cloud watch agent
# sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a stop