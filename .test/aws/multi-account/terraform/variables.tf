variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "resource_suffix" {
  description = "Suffix for resource names to ensure uniqueness"
  type        = string
  default     = "test"
}
