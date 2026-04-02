variable "region" {
  type    = string
  default = "us-east-1"
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "db_name" {
  type    = string
  default = "arisrifas"
}

variable "db_username" {
  type    = string
  default = "arisuser"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4.micro"
}
