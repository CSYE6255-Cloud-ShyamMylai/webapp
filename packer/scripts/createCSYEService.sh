#!/bin/bash

#create csye6225 service file 
output_file=/tmp/csye6225.service
cat<<EOF >"$output_file"
[Unit]
Description=CSYE 6225 App
ConditionPathExists= /opt/webapp
After=network.target google-startup-scripts.service


[Service]
# Environment=PORT=$PORT
# Environment=DB_USERNAME=$DB_USERNAME
# Environment=DB_PASSWORD=$DB_PASSWORD
# Environment=DB_HOST=$DB_HOST
Type=simple
User=csye6225
Group=csye6225
WorkingDirectory= /opt/webapp
ExecStart=/usr/bin/node  /opt/webapp/server.js
Restart=always
RestartSec=3
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=csye6225

[Install]
WantedBy=multi-user.target
EOF

chmod +x $output_file
# cat $output_file
sudo mv /tmp/csye6225.service /etc/systemd/system/csye6225.service
