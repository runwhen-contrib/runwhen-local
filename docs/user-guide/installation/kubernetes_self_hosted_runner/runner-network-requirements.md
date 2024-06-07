# Runner Network Requirements

The self-hosted runner essentially operates as an operator, establishing a connection to the RunWhen Platform and coordinating activities such as starting and stopping pods that perform troubleshooting or SLI tasks.

In order for the self-hosted runner to function properly, it must access the following Internet URLs:

<table><thead><tr><th width="304">URL</th><th width="250">Purpose</th><th>Used By</th></tr></thead><tbody><tr><td>https://runner.beta.runwhen.com</td><td>All control signals</td><td>runner</td></tr><tr><td>https://runner-cortex-tenant.beta.runwhen.com</td><td>Metrics from SLI and Troubleshooting Pods</td><td>grafana-agent</td></tr><tr><td>https://vault.beta.runwhen.com</td><td>Secure secret storage/retrieval</td><td>runner, sli, and troubleshooting pods</td></tr><tr><td>us-docker.pkg.dev</td><td>Google Artifact Registry</td><td>runner, sli, and troubleshooting pods</td></tr><tr><td>ghcr.io</td><td>GitHub Container Registry</td><td>runwhen-local</td></tr><tr><td>github.com</td><td>CodeCollection repositories for discovery and configuration building</td><td>runwhen-local</td></tr><tr><td>docker.io</td><td>Docker container registry</td><td>Grafana Agent and Prometheus Pushgateway</td></tr></tbody></table>

Please also see [proxy-configuration-and-outbound-connections.md](../../user\_guide-advanced\_configuration/proxy-configuration-and-outbound-connections.md "mention") for additional details if scanning public cloud environments such as AWS, GCP, or Microsoft Azure
