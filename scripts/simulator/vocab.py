"""Curated real-infra vocabularies for the simulator scale generator.

Names are composed from these banks so generated inventory reads like a real
cluster estate (never `resource-00042`). All tokens are lowercase DNS-safe.
"""
from __future__ import annotations

# ~50+ realistic cluster names (env + region/purpose).
CLUSTERS: list[str] = [
    "prod-us-east-1", "prod-us-east-2", "prod-us-west-2", "prod-eu-west-1",
    "prod-eu-central-1", "prod-ap-south-1", "prod-ap-southeast-2",
    "staging-us-east-1", "staging-eu-west-1", "staging-us-central",
    "dev-sandbox", "dev-us-east-1", "qa-us-east-1", "gke-platform-prod",
    "gke-platform-staging", "eks-data-prod", "aks-edge-eu",
    "prod-ca-central-1", "prod-sa-east-1", "prod-me-south-1",
    "staging-ap-south-1", "staging-ap-northeast-1", "dev-eu-central-1",
    "qa-eu-west-1", "qa-us-west-2", "gke-data-prod", "gke-data-staging",
    "eks-ml-prod", "eks-ml-staging", "aks-web-prod", "aks-web-staging",
    "prod-us-south-1", "prod-us-central-1", "staging-us-south-1",
    "dev-ap-southeast-1", "qa-ap-northeast-2", "gke-network-prod",
    "eks-database-prod", "eks-cache-prod", "aks-storage-prod",
    "prod-global-edge-1", "prod-global-edge-2", "staging-global-edge-1",
    "dev-internal-1", "qa-internal-1", "disaster-recovery-1",
    "disaster-recovery-2", "test-cluster-1", "test-cluster-2",
    "perf-test-cluster", "canary-prod-us-east-1",
]

# ~200+ realistic namespace/domain names.
NAMESPACES: list[str] = [
    "payments", "checkout", "cart", "orders", "catalog", "search",
    "recommendations", "user-profile", "auth", "billing", "invoicing",
    "notifications", "email", "sms", "fulfillment", "shipping", "inventory",
    "pricing", "promotions", "reviews", "analytics", "reporting", "ingest",
    "observability", "platform-ops", "logging", "metrics", "tracing",
    "monitoring", "alerting", "dashboards", "infrastructure", "networking",
    "security", "secrets", "keys", "certificates", "compliance",
    "audit", "telemetry", "events", "streaming", "queues",
    "cache", "database", "storage", "blob", "documents",
    "configuration", "feature-flags", "experiments", "api-gateway", "rate-limiter",
    "auth-service", "token-service", "session-management", "oauth", "saml",
    "accounts", "subscriptions", "licenses", "usage", "quotas",
    "teams", "organizations", "roles", "permissions", "access-control",
    "customers", "tenants", "workspaces", "environments", "regions",
    "zones", "availability", "disaster-recovery", "backup", "restore",
    "migration", "onboarding", "offboarding", "provisioning", "deprovisioning",
    "deployment", "releases", "versions", "rollback", "canary",
    "testing", "staging", "development", "sandbox", "integration-tests",
    "performance", "load-testing", "stress-testing", "chaos", "resilience",
    "quality-assurance", "quality-gates", "code-review", "security-scan", "linting",
    "build", "ci-cd", "pipelines", "workflows", "jobs",
    "tasks", "workers", "executors", "runners", "agents",
    "webhooks", "callbacks", "hooks", "plugins", "extensions",
    "templates", "blueprints", "schemas", "validation", "normalization",
    "enrichment", "transformation", "aggregation", "deduplication", "deidentification",
    "encryption", "decryption", "hashing", "signing", "verification",
    "compression", "decompression", "serialization", "deserialization", "formatting",
    "parsing", "encoding", "decoding", "translation", "localization",
    "internationalization", "timezone", "datetime", "scheduling", "forecasting",
    "optimization", "tuning", "profiling", "debugging", "troubleshooting",
    "documentation", "wiki", "knowledge-base", "faq", "help",
    "support", "tickets", "incidents", "problems", "solutions",
    "feedback", "surveys", "insights", "trends", "predictions",
    "recommendations-engine", "machine-learning", "ai", "nlp", "computer-vision",
    "data-science", "analytics-engine", "bi", "reporting-engine", "visualization",
    "charts", "graphs", "maps", "geolocation", "navigation",
    "routing", "pathfinding", "optimization-engine", "solver", "algorithm-service",
    "financial", "accounting", "ledger", "journal", "reconciliation",
    "tax", "customs", "compliance-engine", "legal", "contracts",
    "partners", "vendors", "suppliers", "distributors", "resellers",
    "marketplace", "catalog-service", "product-service", "inventory-service", "stock",
    "sku", "variants", "attributes", "tags", "categories",
    "taxonomy", "classification", "recommendation-service", "social", "messaging",
    "feed", "timeline", "activity", "notifications-service", "presence",
    "real-time", "websocket", "pubsub", "message-broker", "event-bus",
    "service-mesh", "load-balancer", "dns", "cdn", "proxy",
    "firewall", "intrusion-detection", "anomaly-detection", "threat", "vulnerability",
    "patch-management", "update-service", "version-control", "artifact-registry", "package-manager",
    "container-registry", "image-builder", "scanner", "registry-service", "helm",
    "kubernetes", "orchestration", "cluster-admin", "cluster-ops", "node-management",
    "pod-management", "resource-quota", "limit-range", "network-policy", "ingress",
    "egress", "service-discovery", "load-balancing", "traffic-management", "circuit-breaker",
    "retry", "timeout", "rate-limit", "bulkhead", "fallback",
]

# ~100+ service concept tokens.
SERVICES: list[str] = [
    "orders", "payments", "auth", "cart", "catalog", "pricing", "shipping",
    "inventory", "billing", "invoicing", "search", "reco", "profile",
    "session", "notification", "email", "sms", "webhook", "ledger", "wallet",
    "accounts", "subscriptions", "licenses", "usage", "quota",
    "teams", "organizations", "roles", "permissions", "access",
    "customers", "tenants", "workspaces", "environments", "regions",
    "zones", "availability", "disaster-recovery", "backup", "restore",
    "migration", "provisioning", "deprovisioning", "deployment", "releases",
    "rollback", "canary", "testing", "staging", "sandbox",
    "performance", "load-testing", "stress-testing", "chaos", "resilience",
    "quality-assurance", "code-review", "security-scan", "linting", "build",
    "ci-cd", "pipelines", "workflows", "jobs", "tasks",
    "workers", "executors", "runners", "agents", "webhooks",
    "callbacks", "hooks", "plugins", "extensions", "templates",
    "blueprints", "schemas", "validation", "normalization", "enrichment",
    "transformation", "aggregation", "deduplication", "encryption", "compression",
    "serialization", "formatting", "parsing", "encoding", "translation",
    "localization", "internationalization", "timezone", "scheduling", "forecasting",
    "optimization", "profiling", "debugging", "troubleshooting", "documentation",
    "support", "tickets", "incidents", "feedback", "surveys",
    "insights", "trends", "predictions", "machine-learning", "data-science",
    "analytics", "reporting", "visualization", "financial", "accounting",
    "tax", "legal", "partners", "vendors", "suppliers",
    "marketplace", "product", "stock", "variants", "attributes",
    "taxonomy", "classification", "recommendation", "social", "messaging",
    "feed", "activity", "presence", "real-time", "pubsub",
    "message-broker", "event-bus", "service-mesh", "load-balancer", "dns",
    "cdn", "proxy", "firewall", "intrusion-detection", "anomaly-detection",
    "threat", "vulnerability", "patch-management", "update", "version-control",
]

# ~40+ component tokens.
COMPONENTS: list[str] = [
    "api", "web", "worker", "scheduler", "cache", "db", "gateway", "consumer",
    "producer", "indexer", "sync", "cron", "migrator", "proxy", "router",
    "aggregator", "processor", "dispatcher", "listener", "poller",
    "transformer", "validator", "normalizer", "enricher", "filter",
    "mapper", "reducer", "sorter", "partitioner", "balancer",
    "scaler", "autoscaler", "orchestrator", "controller", "manager",
    "monitor", "alerter", "collector", "exporter", "visualizer",
    "builder", "compiler", "optimizer", "bundler", "linter",
    "formatter", "analyzer", "profiler", "debugger", "tracer",
    "appender", "logger", "buffer", "encoder", "decoder",
]

# Organic disambiguators, used only when a per-cluster name collision occurs.
VARIANTS: list[str] = [
    "canary", "blue", "green", "v2", "v3", "edge", "internal", "primary",
    "replica", "shadow",
]

# Weighted Kubernetes kinds (weight is relative frequency).
KIND_WEIGHTS: list[tuple[str, int]] = [
    ("Deployment", 70),
    ("StatefulSet", 12),
    ("Service", 8),
    ("Ingress", 5),
    ("CronJob", 3),
    ("DaemonSet", 2),
]
