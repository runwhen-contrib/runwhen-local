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

variable "external_id" {
  description = "External ID for assume role"
  type        = string
  default     = "runwhen-test-external-id"
}

variable "session_duration_seconds" {
  description = "Duration in seconds for assumed role session"
  type        = number
  default     = 3600
}
