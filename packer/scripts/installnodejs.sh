#!/bin/bash
sudo dnf update -y
sudo dnf module enable nodejs:20 -y
sudo dnf install nodejs -y

if [ $? -eq 0 ]; then
   echo installed nodejs
else
    echo installation failed
    exit

node -version
npm --version
fi
