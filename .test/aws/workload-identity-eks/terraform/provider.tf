terraform {
  required_version = ">= 1.0.0"

  # Uncomment for remote state storage
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "runwhen-local/aws-workload-identity-eks/terraform.tfstate"
  #   region = "us-east-1"
  # }
}
