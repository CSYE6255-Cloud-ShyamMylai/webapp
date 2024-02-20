#!/bin/bash

# Install firewalld
sudo dnf install -y firewalld
# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "Firewalld installed successfully."

    # Start and enable the firewalld service
    sudo systemctl start firewalld
    # sudo systemctl enable firewalld

    echo "Firewalld service started and enabled."

    # Add the http service to the firewall rules
    sudo firewall-cmd --permanent --add-service=http

    # Reload the firewall rules
    sudo firewall-cmd --reload

    echo "Added http service to firewall and reloaded firewall rules."
else
    echo "Failed to install firewalld. Check for errors."
fi
