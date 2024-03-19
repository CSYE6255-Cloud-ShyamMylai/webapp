#!/bin/bash

curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install
sudo systemctl status google-cloud-ops-agent"*"   
sudo mkdir /var/log/webapp
sudo touch /var/log/webapp/webapplogs.log 
sudo chmod a+w /var/log/webapp/webapplogs.log

# sudo systemctl stop google-cloud-ops-agent
# ls -al /etc/google-cloud-ops-agent/
# ops_agent_file_path="/etc/google-cloud-ops-agent/config.yaml"

sudo cat <<EOF | sudo tee /etc/google-cloud-ops-agent/config.yaml
logging:
  receivers:
    my-app-receiver:
      type: files
      include_paths:
        - /var/log/webapp/webapplogs.log
      record_log_file_path: true
  processors:
    my-app-processor:
      type: parse_json
      time_key: time
      time_format: "%Y-%m-%dT%H:%M:%S.%L%Z"
    severity-processor:
      type: modify_fields
      fields:
        severity:
          move_from: jsonPayload.level
  service:
    pipelines:
      default_pipeline:
        receivers: [my-app-receiver]
        processors: [my-app-processor,severity-processor]
EOF



echo configure op agent 
sudo systemctl restart google-cloud-ops-agent
sudo systemctl status google-cloud-ops-agent
