terraform {
  required_providers {
    azuredevops = {
      source  = "microsoft/azuredevops"
      version = "~> 1.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

provider "azuredevops" {
  org_service_url       = var.ado_org_url
  personal_access_token = var.ado_token
}

# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------
resource "azuredevops_project" "test" {
  for_each = var.projects

  name               = "${var.project_prefix}-${each.key}"
  description        = each.value.description
  visibility         = "private"
  version_control    = "Git"
  work_item_template = "Agile"

  features = {
    "boards"       = "enabled"
    "repositories" = "enabled"
    "pipelines"    = "enabled"
    "testplans"    = "disabled"
    "artifacts"    = "disabled"
  }
}

# ---------------------------------------------------------------------------
# Git Repositories (one per project, using the default repo)
# ---------------------------------------------------------------------------
resource "azuredevops_git_repository" "app" {
  for_each = var.projects

  project_id = azuredevops_project.test[each.key].id
  name       = "sample-app"

  initialization {
    init_type = "Clean"
  }
}

# ---------------------------------------------------------------------------
# Bootstrap the main branch (Clean init creates an empty repo with no refs)
# ---------------------------------------------------------------------------
resource "null_resource" "bootstrap_branch" {
  for_each = var.projects

  triggers = {
    repo_id = azuredevops_git_repository.app[each.key].id
  }

  provisioner "local-exec" {
    command = <<-EOT
      curl -sf -u ":${var.ado_token}" \
        -X POST \
        -H "Content-Type: application/json" \
        "${var.ado_org_url}/${azuredevops_project.test[each.key].name}/_apis/git/repositories/${azuredevops_git_repository.app[each.key].id}/pushes?api-version=7.0" \
        -d '{
          "refUpdates": [{"name": "refs/heads/main", "oldObjectId": "0000000000000000000000000000000000000000"}],
          "commits": [{"comment": "Initial commit", "changes": [{"changeType": "add", "item": {"path": "/.gitkeep"}, "newContent": {"content": " ", "contentType": "rawtext"}}]}]
        }'
    EOT
  }
}

# ---------------------------------------------------------------------------
# Sample source files pushed into each repo
# ---------------------------------------------------------------------------
resource "azuredevops_git_repository_file" "readme" {
  for_each = var.projects

  repository_id       = azuredevops_git_repository.app[each.key].id
  file                = "README.md"
  content             = <<-MD
    # ${var.project_prefix}-${each.key} / sample-app

    Sample application repository created by Terraform for RunWhen Local
    Azure DevOps indexer testing.

    ## Structure
    - `app/main.py` – tiny Flask hello-world
    - `azure-pipelines.yml` – CI pipeline definition
  MD
  branch              = "refs/heads/main"
  commit_message      = "Add README"
  overwrite_on_create = true

  depends_on = [null_resource.bootstrap_branch]
}

resource "azuredevops_git_repository_file" "app_code" {
  for_each = var.projects

  repository_id       = azuredevops_git_repository.app[each.key].id
  file                = "app/main.py"
  content             = <<-PY
    """Minimal Flask application for ADO pipeline testing."""
    from flask import Flask

    app = Flask(__name__)

    @app.route("/")
    def hello():
        return {"status": "ok", "project": "${var.project_prefix}-${each.key}"}

    if __name__ == "__main__":
        app.run(host="0.0.0.0", port=8080)
  PY
  branch              = "refs/heads/main"
  commit_message      = "Add sample app code"
  overwrite_on_create = true

  depends_on = [azuredevops_git_repository_file.readme]
}

resource "azuredevops_git_repository_file" "requirements" {
  for_each = var.projects

  repository_id       = azuredevops_git_repository.app[each.key].id
  file                = "requirements.txt"
  content             = <<-TXT
    flask>=3.0,<4.0
    gunicorn>=22.0,<23.0
  TXT
  branch              = "refs/heads/main"
  commit_message      = "Add requirements.txt"
  overwrite_on_create = true

  depends_on = [azuredevops_git_repository_file.app_code]
}

resource "azuredevops_git_repository_file" "pipeline_yaml" {
  for_each = var.projects

  repository_id       = azuredevops_git_repository.app[each.key].id
  file                = "azure-pipelines.yml"
  content             = <<-YAML
    trigger:
      branches:
        include:
          - main

    pool:
      vmImage: "ubuntu-latest"

    steps:
      - task: UsePythonVersion@0
        inputs:
          versionSpec: "3.12"

      - script: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
        displayName: "Install dependencies"

      - script: |
          python -m py_compile app/main.py
        displayName: "Syntax check"
  YAML
  branch              = "refs/heads/main"
  commit_message      = "Add CI pipeline definition"
  overwrite_on_create = true

  depends_on = [azuredevops_git_repository_file.requirements]
}

# ---------------------------------------------------------------------------
# Build Pipeline definitions
# ---------------------------------------------------------------------------
resource "azuredevops_build_definition" "ci" {
  for_each = var.projects

  project_id = azuredevops_project.test[each.key].id
  name       = "sample-app-ci"

  ci_trigger {
    use_yaml = true
  }

  repository {
    repo_type   = "TfsGit"
    repo_id     = azuredevops_git_repository.app[each.key].id
    branch_name = "refs/heads/main"
    yml_path    = "azure-pipelines.yml"
  }

  depends_on = [azuredevops_git_repository_file.pipeline_yaml]
}
