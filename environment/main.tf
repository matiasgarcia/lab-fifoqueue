variable "endpoint" {
  type    = string
  default = "http://fifoqueue_localstack:4566"
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "foo"
  secret_key                  = "bar"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true
  skip_metadata_api_check     = true
  insecure                    = true
  endpoints {
    sqs = var.endpoint
    secretsmanager = var.endpoint
    s3 = var.endpoint
    ses = var.endpoint
  }
}

resource "aws_sqs_queue" "fifo-queue" {
  name                      = "fifo-queue.fifo"
  message_retention_seconds = 604800
  receive_wait_time_seconds = 5
  fifo_queue                = true
}