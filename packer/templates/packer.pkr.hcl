variable "DB_USERNAME"{
    type=string
    description = "The username for the database"
    default = env("DB_USERNAME")
}

variable "DB_PASSWORD"{
    type=string
    description = "The password for the database"
    default = env("DB_PASSWORD")
}

variable "DB_DATABASE"{
    type=string
    description = "The name of the database"
    default = env("DB_DATABASE")
}

variable "NODE_PORT"{
    type=string
    description = "The port for the database"
    default = env("NODE_PORT")
}

variable "DB_HOST"{
    type=string
    description = "The host for the database"
    default = env("DB_HOST")
}
variable "AUTH_CREDS"{
    type=string 
    description = "The JSON credentials for the service account"
    default = env("GOOGLE_AUTH_SERVICE")
}
packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">=1.0.0"
    }
  }
}

source "googlecompute" "machineimage" {
  project_id              = "csye6255-cloudcomp-packer-dev"
  source_image_family     = "centos-stream-8"
  credentials_json        = "${var.AUTH_CREDS}"
  zone                    = "us-east1-b"
  image_name              = "csye6255packer-dev-{{timestamp}}"
  image_family            = "csye6255packer-dev"
  image_storage_locations = ["us-east1"]
  image_description       = "This is a custom image for CSYE6255 Cloud Computing"
  communicator            = "ssh"
  ssh_username            = "centos-communicator"
  disk_type               = "pd-standard"

}

build {
  sources = ["source.googlecompute.machineimage"]
  provisioner "shell" {
    scripts = [
      "packer/scripts/installnodejs.sh",
      "packer/scripts/installmysql.sh",
      "packer/scripts/installfirewall.sh",
      "packer/scripts/createCSYE.sh"
    ]
    environment_vars = [
      "DB_PASSWORD=${var.DB_PASSWORD}",
      "DB_USERNAME=${var.DB_USERNAME}",
      "DB_DATABASE=${var.DB_DATABASE}",
      "DB_HOST=${var.DB_HOST}",
      "PORT=${var.NODE_PORT}"
    ]
  }

  provisioner "file" {
    source      = "./webapp-main.zip"
    destination = "/tmp/webapp-main.zip"

  }

  provisioner "shell" {
    scripts = [
      "packer/scripts/installproject.sh",
      "packer/scripts/createCSYEService.sh",
    "packer/scripts/startCSYEService.sh" ]

    environment_vars = [
      "PORT=${var.NODE_PORT}",
      "DB_PASSWORD=${var.DB_PASSWORD}",
      "DB_USERNAME=${var.DB_USERNAME}",
      "DB_DATABASE=${var.DB_DATABASE}",
      "DB_HOST=${var.DB_HOST}",
    ]
  }
}