variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "resource_suffix" {
  description = "Suffix to append to resource names for uniqueness"
  type        = string
  default     = "test"
}

variable "eks_version" {
  description = "EKS cluster version"
  type        = string
  default     = "1.31"
}

variable "k8s_namespace" {
  description = "Kubernetes namespace for RunWhen Local"
  type        = string
  default     = "runwhen-local"
}

variable "k8s_service_account" {
  description = "Kubernetes service account name"
  type        = string
  default     = "runwhen-local"
}
