variable "repository_prefix" {
  description = "Prefix for ECR repository names to avoid conflicts"
  type        = string
  default     = "test-rwl-"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.repository_prefix))
    error_message = "Repository prefix must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "region" {
  description = "AWS region for ECR repositories"
  type        = string
  default     = "us-west-2"
  
  validation {
    condition = can(regex("^[a-z0-9-]+$", var.region))
    error_message = "Region must be a valid AWS region name."
  }
}

variable "enable_image_scanning" {
  description = "Enable image scanning on push for ECR repositories"
  type        = bool
  default     = false
}

variable "image_tag_mutability" {
  description = "Image tag mutability setting for ECR repositories"
  type        = string
  default     = "MUTABLE"
  
  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.image_tag_mutability)
    error_message = "Image tag mutability must be either MUTABLE or IMMUTABLE."
  }
}

variable "lifecycle_policy_enabled" {
  description = "Enable lifecycle policy for ECR repositories"
  type        = bool
  default     = true
}

variable "max_image_count" {
  description = "Maximum number of images to keep in each repository"
  type        = number
  default     = 5
  
  validation {
    condition     = var.max_image_count > 0 && var.max_image_count <= 100
    error_message = "Max image count must be between 1 and 100."
  }
}

variable "untagged_image_retention_days" {
  description = "Number of days to keep untagged images"
  type        = number
  default     = 1
  
  validation {
    condition     = var.untagged_image_retention_days > 0 && var.untagged_image_retention_days <= 365
    error_message = "Untagged image retention must be between 1 and 365 days."
  }
}

variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
} 