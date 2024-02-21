#!/bin/bash
sudo dnf update -y
sudo dnf install mysql-server -y

# Check the exit status of the last command
if [ $? -eq 0 ]; then
    # Commands to execute if the last command was successful
    echo "sql server installed successfully."
    
    sudo systemctl start mysqld.service
    if [ $? -eq 0 ]; then
        echo "System has set sql service to start"
        sudo systemctl enable mysqld.service
        sudo systemctl status mysqld.service
        
        
        # sudo mysql_secure_installation
        mysql_root_password="$DB_PASSWORD"
        mysql_username="$DB_USERNAME"
        # Run MySQL commands to achieve the same steps as mysql_secure_installation
        # changing root password
        mysql -u root -e "ALTER USER '$mysql_username'@'localhost' IDENTIFIED BY '$mysql_root_password';"

        #  Remove anonymous users
        mysql -u root -p"$mysql_root_password" -e "DELETE FROM mysql.user WHERE User='';"
        mysql -u root -p"$mysql_root_password" -e "FLUSH PRIVILEGES;" 

        # create database if not exists 
        mysql -u root -p"$mysql_root_password" -e "CREATE DATABASE IF NOT EXISTS testDB;"

        if [ $? -eq 0 ]; then 
            echo "System has managed to secure installation firing up mysql server"
            # mysqladmin -u root password "root@123"
            mysql --version

        else 
            echo "Some error occurred during the secure installation."
            exit
        fi
    else
        echo "Some error in starting the MySQL server occurred."
        exit
    fi
else
    # Commands to execute if the last command encountered an error
    echo "Failed to install mysql-server. Check for errors."
fi
