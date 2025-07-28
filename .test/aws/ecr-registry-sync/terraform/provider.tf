terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
  
  default_tags {
    tags = merge({
      Project     = "runwhen-local"
      Environment = "test"
      Purpose     = "ecr-registry-sync-testing"
      ManagedBy   = "terraform"
    }, var.additional_tags)
  }
} 