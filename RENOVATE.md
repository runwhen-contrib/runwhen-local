# Renovate Configuration

This repository uses [Renovate](https://docs.renovatebot.com/) to automatically update dependencies and keep the project secure and up-to-date.

## What Renovate Manages

Renovate automatically detects and updates:

### Python Dependencies
- **Poetry packages** in `src/pyproject.toml`
- **Pip packages** in any `requirements.txt` files

### Container Images
- **Docker base images** in `src/Dockerfile`

### Tools and CLI
- **Terraform** version in Dockerfile
- **Kubectl** (latest stable)
- **Poetry** version
- **Kubelogin** for Azure authentication
- **Google Cloud CLI** version

### GitHub Actions
- **Action versions** in `.github/workflows/`

## Configuration

The Renovate configuration is in `renovate.json` and includes:

- **Scheduled runs**: Every Monday at 6:00 AM UTC
- **Manual trigger**: Available via GitHub Actions workflow
- **Grouping**: Related dependencies are grouped together
- **Auto-merge**: Safe updates (patches, digests) are auto-merged
- **Review required**: Major updates require manual review
- **Vulnerability alerts**: Security issues are flagged immediately

## Workflow

1. **Scheduled**: Renovate runs automatically every Monday
2. **Manual**: You can trigger Renovate manually via GitHub Actions
3. **Dashboard**: View all updates in the Dependency Dashboard issue
4. **PRs**: Updates are submitted as pull requests
5. **Review**: Major updates require review, patches auto-merge

## Running Renovate

### Automatic (Recommended)
Renovate runs automatically via GitHub Actions every Monday.

### Manual Trigger
1. Go to **Actions** → **Renovate**
2. Click **Run workflow**
3. Optionally set log level or override schedule
4. Click **Run workflow**

### Local Development
```bash
# Install Renovate CLI
npm install -g renovate

# Run locally
renovate --token $GITHUB_TOKEN --platform github --log-level debug
```

## Customization

### Adding New Dependencies
To add Renovate support for new dependency types:

1. **Docker images**: Add `# renovate: datasource=docker depName=image-name` above the FROM line
2. **GitHub releases**: Add `# renovate: datasource=github-releases depName=owner/repo` above version lines
3. **Custom regex**: Add patterns to the `regexManagers` section in `renovate.json`

### Package Rules
Modify `packageRules` in `renovate.json` to:
- Change auto-merge behavior
- Adjust grouping strategies
- Set different schedules for specific packages
- Configure reviewers and assignees

### Excluding Dependencies
Add `# renovate: ignore` comments above dependencies you want to exclude from updates.

## Troubleshooting

### Common Issues

1. **Rate limiting**: Renovate respects GitHub API limits
2. **Authentication**: Ensure `RENOVATE_TOKEN` has appropriate permissions
3. **Conflicts**: Resolve merge conflicts in PRs manually
4. **Build failures**: Check CI/CD logs for dependency compatibility issues

### Logs
- **GitHub Actions**: Check the Renovate workflow logs
- **Local**: Use `--log-level debug` for detailed output
- **Dashboard**: View update history in the Dependency Dashboard

### Support
- [Renovate Documentation](https://docs.renovatebot.com/)
- [GitHub Issues](https://github.com/renovatebot/renovate/issues)
- [Community Discussions](https://github.com/renovatebot/renovate/discussions)

## Security

Renovate helps maintain security by:
- **Vulnerability scanning**: Detecting known CVEs in dependencies
- **Automatic updates**: Patching security issues quickly
- **Dependency monitoring**: Tracking all project dependencies
- **Compliance**: Maintaining up-to-date dependency lists

## Best Practices

1. **Review major updates**: Always review breaking changes
2. **Test updates**: Ensure updates don't break functionality
3. **Monitor dashboard**: Regularly check the Dependency Dashboard
4. **Configure notifications**: Set up alerts for security updates
5. **Document changes**: Update changelog for significant updates
