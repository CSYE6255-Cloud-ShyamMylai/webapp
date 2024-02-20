#!/bin/bash

# creaating a user with nologin shell
sudo adduser csye6225 --shell /sbin/nologin
# creating a group 
sudo groupadd csye6225

# appending the user specified to the group
sudo usermod -aG csye6225 csye6225
