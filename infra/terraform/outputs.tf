output "db_endpoint" {
  value = aws_db_instance.arisrifas_db.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.arisrifas_redis.configuration_endpoint_address
  # For single-node cluster the configuration endpoint is the node address
}
