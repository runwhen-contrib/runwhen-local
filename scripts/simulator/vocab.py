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

# ~220 realistic namespace/team/domain names: business-domain namespaces
# (natural overlap with SERVICES), real-world platform/infra namespaces, and
# team/squad namespaces, as you'd actually see listed in a real cluster.
NAMESPACES: list[str] = [
    # Business-domain namespaces (some overlap with SERVICES is expected).
    "payments", "checkout", "cart", "orders", "catalog", "search",
    "recommendations", "user-profile", "auth", "billing", "invoicing",
    "notifications", "email", "sms", "fulfillment", "shipping", "inventory",
    "pricing", "promotions", "reviews", "analytics", "reporting", "ingest",
    "accounts", "subscriptions", "licenses", "usage", "quotas", "customers",
    "tenants", "workspaces", "teams", "organizations", "roles", "permissions",
    "access-control", "identity", "sso", "secrets", "certificates",
    "compliance", "audit", "risk", "fraud", "loyalty", "rewards",
    "referral", "membership", "content", "media", "feed", "geo",
    "routing", "dispatch", "tracking", "webhooks", "connectors", "treasury",
    "ledger", "wallet", "settlement", "reconciliation", "refunds", "disputes",
    "chargebacks", "taxation", "procurement", "vendor-management", "warehouse", "logistics",
    "delivery", "returns", "claims", "underwriting", "policy-admin", "market-data",
    "trading", "custody", "portfolio", "forecasting",
    # Platform / infra namespaces (real-world names you'd see in a cluster).
    "platform-ops", "observability", "logging", "metrics", "tracing",
    "monitoring", "alerting", "dashboards", "istio-system", "istio-ingress",
    "cert-manager", "ingress-nginx", "ingress-controller", "argocd", "flux-system",
    "prometheus", "grafana", "loki", "jaeger", "fluentd",
    "fluent-bit", "elastic-system", "kibana", "vault-system", "external-secrets",
    "sealed-secrets", "external-dns", "cluster-autoscaler", "karpenter", "node-exporter",
    "kube-state-metrics", "opentelemetry", "otel-collector", "linkerd", "consul",
    "spire", "cilium", "calico", "metallb", "traefik",
    "kong", "ambassador", "envoy", "cockroachdb", "postgres-operator",
    "mysql-operator", "redis-operator", "kafka", "kafka-connect", "zookeeper",
    "elasticsearch", "opensearch", "minio", "velero", "chaos-mesh",
    "litmus", "falco", "gatekeeper", "opa", "kyverno",
    "network-policy", "cost-management", "kubecost", "spinnaker", "tekton",
    "jenkins", "gitlab-runner", "github-actions-runner", "argo-workflows", "argo-events",
    "knative", "keda", "harbor", "quay", "nexus",
    "artifactory", "cluster-monitoring", "node-problem-detector", "descheduler", "vertical-pod-autoscaler",
    "admission-webhooks", "policy-engine", "service-mesh-control", "api-gateway", "rate-limiter",
    # Team / squad namespaces.
    "team-checkout", "team-payments", "team-platform", "team-identity", "team-search",
    "team-catalog", "team-fulfillment", "team-growth", "team-data", "team-ml",
    "team-mobile", "team-web", "team-infra", "team-security", "team-billing",
    "team-notifications", "team-analytics", "team-recommendations", "squad-payments", "squad-checkout",
    "squad-orders", "squad-inventory", "squad-shipping", "squad-search", "squad-catalog",
    "squad-identity", "squad-platform", "squad-data-eng", "squad-ml-platform", "squad-observability",
    "squad-growth", "squad-mobile", "squad-web", "squad-security", "squad-billing",
    # Additional platform/org namespaces.
    "sre", "release-engineering", "developer-platform", "internal-tools", "data-platform",
    "ml-platform", "edge-platform", "core-services", "shared-services", "platform-shared",
    "infra-shared", "billing-ops", "payments-ops", "security-ops", "compliance-ops",
    "data-governance", "privacy", "gdpr-compliance", "incident-response", "capacity-planning",
]

# ~165 realistic service/domain concept tokens that read naturally as
# `{service}-{component}` (e.g. `orders-api`, `fraud-worker`, `custody-db`).
SERVICES: list[str] = [
    "orders", "payments", "checkout", "cart", "catalog", "auth", "identity", "billing", "invoicing", "pricing",
    "inventory", "shipping", "fulfillment", "search", "recommendation", "notification", "wallet", "ledger", "subscription", "session",
    "profile", "messaging", "telemetry", "gateway", "ingest", "scheduler", "analytics", "reporting", "settlement", "risk",
    "fraud", "loyalty", "content", "media", "feed", "geo", "routing", "dispatch", "tracking", "webhook",
    "connector", "accounts", "tenants", "workspace", "onboarding", "kyc", "compliance", "audit", "reconciliation", "treasury",
    "escrow", "refunds", "chargebacks", "disputes", "taxation", "customs", "procurement", "sourcing", "vendor", "supplier",
    "warehouse", "logistics", "delivery", "courier", "returns", "exchange", "promotions", "coupons", "discounts", "gift-cards",
    "rewards", "referral", "membership", "entitlements", "provisioning", "licensing", "metering", "usage", "quota", "throttling",
    "orchestration", "workflow", "pipeline", "event-stream", "pubsub", "streaming", "replication", "indexing", "caching", "storage",
    "archive", "backup", "disaster-recovery", "cdn", "edge", "load-balancing", "service-mesh", "dns", "certificate", "secrets",
    "vault", "encryption", "tokenization", "authentication", "authorization", "sso", "mfa", "device", "presence", "chat",
    "voice", "video", "calendar", "booking", "reservation", "ticketing", "seating", "quoting", "underwriting", "claims",
    "policy", "actuarial", "market-data", "trading", "custody", "portfolio", "valuation", "benchmarking", "forecasting", "demand-planning",
    "supply-chain", "asset", "maintenance", "fleet", "telematics", "geofencing", "mapping", "navigation", "weather", "energy",
    "payroll", "expense", "reimbursement", "budgeting", "campaign", "segmentation", "personalization", "targeting", "attribution", "experimentation",
    "config", "directory", "lifecycle", "renewal", "churn", "retention", "engagement", "alerting", "incident", "escalation",
    "oncall", "runbook", "remediation", "healthcheck", "uptime", "capacity-planning",
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
