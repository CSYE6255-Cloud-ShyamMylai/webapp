variable "DB_USERNAME" {
  type        = string
  description = "The username for the database"
  default     = env("DB_USERNAME")
}

variable "DB_PASSWORD" {
  type        = string
  description = "The password for the database"
  default     = env("DB_PASSWORD")
}

variable "DB_DATABASE" {
  type        = string
  description = "The name of the database"
  default     = env("DB_DATABASE")
}

variable "NODE_PORT" {
  type        = string
  description = "The port for the database"
  default     = env("NODE_PORT")
}

variable "DB_HOST" {
  type        = string
  description = "The host for the database"
  default     = env("DB_HOST")
}
variable "AUTH_CREDS" {
  type        = string
  description = "The JSON credentials for the service account"
  default     = env("GOOGLE_AUTH_SERVICE")
}

variable "machine_image_details" {
  type = object({
    project_id              = string
    source_image_family     = string
    zone                    = string
    image_name              = string
    image_family            = string
    image_storage_locations = string
    image_description       = string
    communicator            = string
    ssh_username            = string
    disk_type               = string
  })

  /*
      project_id              = env("GOOGLE_PROJECT_ID")
    source_image_family     = "centos-stream-8"
    zone                    = "us-east1-b"
    image_name              = "csye6255packer-dev-{{timestamp}}"
    image_family            = "csye6255packer-dev"
    image_storage_locations = "us-east1"
    image_description       = "This is a custom image for CSYE6255 Cloud Computing"
    communicator            = "ssh"
    ssh_username            = "centos-communicator"
    disk_type               = "pd-standard"*/
  default = {
    project_id              = env("GOOGLE_PROJECT_ID")
    source_image_family     = "centos-stream-8"
    zone                    = "us-east1-b"
    image_name              = env("IMAGE_NAME")
    image_family            = env("IMAGE_FAMILY")
    image_storage_locations = env("IMAGE_STORAGE_LOCATIONS")
    image_description       = "This is a custom image for CSYE6255 Cloud Computing"
    communicator            = "ssh"
    ssh_username            = "centos-communicator"
    disk_type               = env("DISK_TYPE")
  }
}

variable "webapp_source" {
  type    = string
  default = "./webapp-main.zip"
}

variable "webapp_destination" {
  type    = string
  default = "/tmp/webapp-main.zip"
}

variable "preproject_scripts" {
  type = list(string)
  default = [
    "packer/scripts/installnodejs.sh",
    // "packer/scripts/installmysql.sh",
    "packer/scripts/installfirewall.sh",
    "packer/scripts/createCSYE.sh"
  ]
}

variable "postproject_scripts" {
  type = list(string)
  default = [
    "packer/scripts/installproject.sh",
    "packer/scripts/createCSYEService.sh",
    "packer/scripts/startCSYEService.sh"
  ]
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
  project_id              = var.machine_image_details["project_id"]
  source_image_family     = var.machine_image_details["source_image_family"]
  credentials_json        = "${var.AUTH_CREDS}"
  zone                    = var.machine_image_details["zone"]
  image_name              = var.machine_image_details["image_name"]
  image_family            = var.machine_image_details["image_family"]
  image_storage_locations = [var.machine_image_details["image_storage_locations"]]
  image_description       = var.machine_image_details["image_description"]
  communicator            = var.machine_image_details["communicator"]
  ssh_username            = var.machine_image_details["ssh_username"]
  disk_type               = var.machine_image_details["disk_type"]

}

build {
  sources = ["source.googlecompute.machineimage"]
  provisioner "shell" {
    scripts = var.preproject_scripts
    environment_vars = [
      "DB_PASSWORD=${var.DB_PASSWORD}",
      "DB_USERNAME=${var.DB_USERNAME}",
      "DB_DATABASE=${var.DB_DATABASE}",
      "DB_HOST=${var.DB_HOST}",
      "PORT=${var.NODE_PORT}"
    ]
  }

  provisioner "file" {
    source      = var.webapp_source
    destination = var.webapp_destination

  }

  provisioner "shell" {
    scripts = var.postproject_scripts

    environment_vars = [
      "PORT=${var.NODE_PORT}",
      "DB_PASSWORD=${var.DB_PASSWORD}",
      "DB_USERNAME=${var.DB_USERNAME}",
      "DB_DATABASE=${var.DB_DATABASE}",
      "DB_HOST=${var.DB_HOST}",
    ]
  }
}
