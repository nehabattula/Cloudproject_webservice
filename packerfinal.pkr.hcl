packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.2"
      source  = "github.com/hashicorp/amazon"
    }
  }
}


variable "aws_access_key" {
  type    = string
  default = env("AWS_ACCESS_KEY_ID")
}


variable "sshusername" {
  type    = string
  default = "ec2-user"
}



variable "aws_secret_key" {
  type    = string
  default = env("AWS_SECRET_ACCESS_KEY")
}

variable "destination_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_acct_list" {
  type    = list(string)
  default = []
}

variable "ami-description" {
  type    = string
  default = "Neha image testing dev"
}

source "amazon-ebs" "ami-image" {
ami_name = "testami_{{timestamp}}"
instance_type = "t2.micro"
region = "${var.destination_region}"
ami_users="${var.aws_acct_list}"
source_ami_filter {
    filters = {
      virtualization-type = "hvm"
      name                = "amzn2-ami-kernel-5.10-hvm-2.0.20220207.1-x86_64-gp2"
      root-device-type    = "ebs"
    }
    owners      = ["amazon"]
    most_recent = true
}

access_key = "${var.aws_access_key}"
secret_key = "${var.aws_secret_key}"
ssh_username = "${var.sshusername}"
ami_description = "${var.ami-description}"

}

build {
sources = [ "source.amazon-ebs.ami-image" ]

provisioner "file" {
    source = "webservice.zip"
    destination= "~/"
}

provisioner "shell" {
    script = "apprunner.sh"
}

}