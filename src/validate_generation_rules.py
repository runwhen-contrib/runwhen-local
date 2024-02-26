#!/usr/bin/env python3

from argparse import ArgumentParser
import tempfile
from git import Repo
import json
import jsonschema
import os
from fnmatch import fnmatch
from typing import Any, Optional
import yaml

from utils import read_file, Style

verbose = False

def validate_code_collection(code_collection_dir: str,
                             code_collection_name: str,
                             json_schema_data: Any,
                             selected_code_bundles: Optional[list[str]]):
    if verbose:
        print(f'Validating code bundles in code collection "{code_collection_name}".')

    code_bundles_dir = os.path.join(code_collection_dir, "codebundles")
    code_bundle_names = os.listdir(code_bundles_dir)
    validation_error_count = 0
    for code_bundle_name in code_bundle_names:
        if selected_code_bundles:
            for selected_code_bundle in selected_code_bundles:
                if fnmatch(code_bundle_name, selected_code_bundle):
                    selected = True
                    break
            else:
                selected = False
        else:
            selected = True

        if selected:
            generation_rules_dir = os.path.join(code_bundles_dir, code_bundle_name, ".runwhen", "generation-rules")
            if not os.path.exists(generation_rules_dir):
                continue

            generation_rule_file_names = os.listdir(generation_rules_dir)
            for generation_rule_file_name in generation_rule_file_names:
                generation_rule_file_path = os.path.join(generation_rules_dir, generation_rule_file_name)
                generation_rules_text = read_file(generation_rule_file_path, "r")
                generation_rules_data = yaml.safe_load(generation_rules_text)
                try:
                    jsonschema.validate(generation_rules_data, json_schema_data)
                    if verbose:
                        print(f'Validation succeeded for "{generation_rule_file_name}" '
                              f'in code bundle {code_bundle_name} '
                              f'in code collection "{code_collection_name}')
                except jsonschema.exceptions.ValidationError as e:
                    message = str(e) if verbose else e.message
                    print(f'{Style.RED}'
                          f'Validation failed for "{generation_rule_file_name}" '
                          f'in code bundle {code_bundle_name} '
                          f'in code collection "{code_collection_name}; {message}.'
                          f'{Style.RESET}')
                    validation_error_count += 1
        else:
            if verbose:
                print(f'Skipping unselected code bundle "{code_bundle_name}".')
    return validation_error_count

def main():
    parser = ArgumentParser(description="Tool to validate generation rules files in code collections.")
    parser.add_argument("code_collections", nargs='*',
                         help="One or more code collections to validate. The code collection spec "
                              "can be either a path to the root of a previously cloned code "
                              "collection repo or the URL of the repo. A git repo URL can be "
                              "appended with an optional branch name, separated by a '#'.")
    parser.add_argument('-v', '--verbose', action='store_true', dest="verbose", default=False,
                        help="Print more detailed output.")
    parser.add_argument('-c', '--code-bundles', dest="code_bundles",
                        help="List of code bundles to validate. The argument is a comma-separated "
                             "list of code bundle specifiers where the specifiers are interpreted as "
                             "a file glob pattern. If this flag is omitted, then all code bundles "
                             "are validated.")
    args = parser.parse_args()

    global verbose
    verbose = args.verbose
    validation_error_count = 0
    # Load the JSON schema file for the generation rules file
    # This assumes that the JSON schema file is in the same directory as the tool, i.e. as this file
    parent_dir, this_file_name = os.path.split(__file__)
    json_schema_path = os.path.join(parent_dir, "generation-rule-schema.json")
    json_schema_text = read_file(json_schema_path)
    json_schema_data = json.loads(json_schema_text)

    code_bundles_str = args.code_bundles
    selected_code_bundles = [cb.strip() for cb in code_bundles_str.split(',')] if code_bundles_str else None
    code_collections = args.code_collections
    for code_collection in code_collections:
        if "://" in code_collection:
            branch_separator = code_collection.rfind('#')
            if branch_separator > 0:
                code_collection_url = code_collection[:branch_separator]
                branch = code_collection[branch_separator+1:]
            else:
                code_collection_url = code_collection
                branch = "main"

            # Parse the leaf name of the code collection from the git repo URL
            code_collection_name_start = code_collection_url.rfind('/')
            if not code_collection_name_start:
                raise Exception("Expected git repo URL to contain a slash.")
            code_collection_name = code_collection_url[code_collection_name_start:]
            if code_collection_name.endswith(".git"):
                code_collection_name = code_collection_name[:-4]

            with tempfile.TemporaryDirectory() as repo_dir:
                Repo.clone_from(code_collection_url, repo_dir, branch=branch)
                error_count = validate_code_collection(repo_dir,
                                                       code_collection_name,
                                                       json_schema_data,
                                                       selected_code_bundles)
        else:
            _, code_collection_name = os.path.split(code_collection)
            error_count = validate_code_collection(code_collection,
                                                   code_collection_name,
                                                   json_schema_data,
                                                   selected_code_bundles)

        validation_error_count += error_count

    if validation_error_count == 0:
        print("No validation errors found.")

if __name__ == "__main__":
    main()
