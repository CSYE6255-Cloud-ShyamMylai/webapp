#!/bin/bash

#install unzip 
sudo dnf install unzip -y

cd /tmp || exit
sudo mv /tmp/webapp-main.zip /tmp/webapp.zip
# sudo mkdir -p /opt/webapp
sudo unzip -o webapp.zip -d /opt/webapp-main/
# sudo unzip -o webapp.zip -d ~/

#renaming the folder to avoid confusion
sudo mv /opt/webapp-main /opt/webapp
cd /opt/webapp || exit
sudo npm install
sudo rm -rf /tmp/webapp.zip
# cd ~/webapp-main || exit
# create .env with port number ,db name and db password
# npm install
# file=".env"
# cat<<EOF >"$file"
# DB_USERNAME = root 
# DB_PASSWORD = root@123
# PORT = 3500
# EOF
# pwd 
# ls -al
# npm test
# rm -r /tmp/webapp
# node server.js
sudo chown -R csye6225:csye6225 /opt/webapp
