# This is a tool to handle the transition from storing the generation rules
# and associated templates centrally in the workspace builder code base. The
# new model is to decentralize things and put the gen rules and templates
# in the code bundles with which they're associated. Since we have a bunch
# of existing content it would be tedious to move everything around manually,
# so this tool scans through the gen rules and templates to extract the info
# about the associated code collection and code bundle and does all the
# copying. To be extra careful, it doesn't actually delete the files from
# the worksapce builder code base, so that must be done manually.
# This is essentially a one shot tool, so it's not intended to be super
# robust and error-proof. Presumably once we've done the initial
# conversion of the existing structure, we won't need it after that.

import os
import shutil
import yaml

git_repo_root = os.getenv("WB_GIT_REPO_ROOT")
if not git_repo_root:
    print("The WB_GIT_REPO_ROOT environment variable must be set to directory where the "
          "code collection repos are cloned.")

# Map from the git repo URL to the local directory where it's been cloned
code_collection_map = {
    "https://github.com/runwhen-contrib/rw-public-codecollection.git":
        os.path.join(git_repo_root, "rw-public-codecollection"),
    "https://github.com/runwhen-contrib/rw-cli-codecollection.git":
        os.path.join(git_repo_root, "rw-cli-codecollection"),
}


class GenerationRuleInfo:
    """
    This gathers together the information that we extract from scanning the
    generation rules and templates that's needed to copy things over to the
    code bundles.
    """
    def __init__(self, gen_rule_file_name, repo_url, code_bundle_name, template_names):
        self.gen_rule_file_name = gen_rule_file_name
        self.repo_url = repo_url
        self.code_bundle_name = code_bundle_name
        self.template_names = template_names

def main():
    # We accumulate the info about all the gen rules for which we're able to
    # extract info about the associated code bundle. So in the first pass
    # we do all the scanning and populate gen_rule_infos, then we do
    # another pass to do all the copying.
    gen_rule_infos = list()
    gen_rules_file_names = os.listdir("generation-rules")
    for gen_rules_file_name in gen_rules_file_names:
        gen_rules_file_path = os.path.join("generation-rules", gen_rules_file_name)
        with open(gen_rules_file_path, "r") as f:
            gen_rules_config_str = f.read()
        gen_rules_config = yaml.safe_load(gen_rules_config_str)
        gen_rule_config_list = gen_rules_config.get("spec", dict()).get("generationRules", list())
        repo_url = path_in_repo = None
        template_names = []
        for gen_rule_config in gen_rule_config_list:
            slx_list = gen_rule_config.get("slxs", list())
            for slx in slx_list:
                base_template_name = slx.get("baseTemplateName")
                if not base_template_name:
                    base_template_name = slx.get("baseName")
                if not base_template_name:
                    print(f"Unable to resolve base template name: gen-rule={gen_rules_file_name}.")
                    continue
                # Look through the output items to find one that specifies the repo URL and
                # the path into the code bundle
                output_item_list = slx.get("outputItems", list())
                # It seems like some of the types are commented out in the gen rules files,
                # I'm guessing to not activate too much stuff that would put a bigger load on the platform
                # when the workspace is uploaded. But in some cases, it's the disabled type that's the
                # one that has the template that has the repo/codebundle info specified. So we hack it
                # by adding all the types and then sd
                output_item_list.append({'type': 'sli', "dummy": True})
                output_item_list.append({'type': 'slo', "dummy": True})
                output_item_list.append({'type': 'taskset', "dummy": True})
                for output_item in output_item_list:
                    type = output_item.get("type")
                    if not type:
                        print("Unexpected SLX output item with no type: gen-rule={gen_rules_file_name}")
                    template_name = output_item.get("templateName")
                    if not template_name:
                        template_name = f"{base_template_name}-{type}.yaml"
                    template_path = os.path.join("templates", template_name)
                    try:
                        with open(template_path, "r") as f:
                            template_text = f.read()
                    except FileNotFoundError:
                        # Don't emit an error message if it's one of the dummy output items
                        if "dummy" not in output_item:
                            print(f"Template associated with gen rule output item not found: {template_path}")
                        continue

                    template_names.append(template_name)

                    if not repo_url or not path_in_repo:
                        repo_url = path_in_repo = None
                        for line in template_text.splitlines():
                            repo_url_tag = "repoUrl:"
                            repo_url_index = line.find(repo_url_tag)
                            if repo_url_index >= 0:
                                repo_url = line[repo_url_index+len(repo_url_tag):].strip()
                            for path_in_repo_tag in ("pathToYaml:", "pathToRobot:"):
                                path_in_repo_index = line.find(path_in_repo_tag)
                                if path_in_repo_index >= 0:
                                    path_in_repo = line[path_in_repo_index+len(path_in_repo_tag):].strip()
                                    break
                            if repo_url and path_in_repo:
                                break

        if not repo_url or not path_in_repo:
            print(f"Couldn't determine code collection repo: gen-rule={gen_rules_file_name}")
            continue
        # Do a minimal sanity check on the repo URL
        if not repo_url.startswith("https://"):
            print(f"Repo URL is unexpected format: {repo_url}")
            continue
        # The templates are inconsistent about including the ".git" extension
        # We always add it, so it matches the key in the code collection map.
        if  not repo_url.endswith(".git"):
            repo_url = repo_url + ".git"

        # Extract the bundle name from the pathTo* value
        code_bundles_name = "codebundles/"
        code_bundles_index = path_in_repo.find(code_bundles_name)
        if code_bundles_index < 0:
            print(f"Unexpected path in repo: {path_in_repo}")
            continue
        code_bundle_start = code_bundles_index + len(code_bundles_name)
        code_bundle_end = path_in_repo.find('/', code_bundle_start)
        if code_bundle_end < 0:
            print(f"Unexpected path in repo: {path_in_repo}")
            continue
        code_bundle_name = path_in_repo[code_bundle_start:code_bundle_end]

        gen_rule_info = GenerationRuleInfo(gen_rules_file_name, repo_url, code_bundle_name, template_names)
        gen_rule_infos.append(gen_rule_info)

    test_run_mode = False

    for gen_rule_info in gen_rule_infos:
        repo_url = gen_rule_info.repo_url
        repo_dir = code_collection_map.get(repo_url)
        if not repo_dir:
            print(f"Couldn't map code collection repo URL to a local dir: {repo_url}")
            continue
        code_bundle_name = gen_rule_info.code_bundle_name
        code_bundle_dir = os.path.join(repo_dir, "codebundles", code_bundle_name)
        runwhen_dir = os.path.join(code_bundle_dir, ".runwhen")
        gen_rules_dst_dir = os.path.join(runwhen_dir, "generation-rules")
        os.makedirs(gen_rules_dst_dir, exist_ok=True)
        templates_dst_dir = os.path.join(runwhen_dir, "templates")
        os.makedirs(templates_dst_dir, exist_ok=True)

        # Copy the gen rule file to the code bundle
        gen_rules_file_name = gen_rule_info.gen_rule_file_name
        gen_rule_src_path = os.path.join("generation-rules", gen_rules_file_name)
        gen_rule_dst_path = os.path.join(gen_rules_dst_dir, gen_rules_file_name)
        if test_run_mode:
            print(f'Copy GR: "{gen_rule_src_path}" to "{gen_rule_dst_path}"')
        else:
            shutil.copy(gen_rule_src_path, gen_rule_dst_path)

        # Copy the templates to the code bundle
        template_names = gen_rule_info.template_names
        for template_name in template_names:
            template_src_path = os.path.join("templates", template_name)
            template_dst_path = os.path.join(templates_dst_dir, template_name)
            if test_run_mode:
                print(f'Copy GR: "{template_src_path}" to "{template_dst_path}"')
            else:
                shutil.copy(template_src_path, template_dst_path)

if __name__ == "__main__":
    main()
