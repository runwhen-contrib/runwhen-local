# This is a tool that takes an existing workspace and extracts the group
# information from it and translates that to workspace builder customizations
# that preserve those groupings. The idea is that you'd run the workspace
# builder initially, upload the workspace info to the platform, and then edit
# the groupings in the workspace/map GUI. Then if you wanted to rerun the
# workspace builder you could run this tool to create the customizations
# for the subsequent runs of the workspace builder so that you wouldn't
# need to redo all the groupings in the GUI. This approach is a bit
# inconvenient, though, and has been de-emphasized in favor of just making
# the workspace upload code smarter about merging with previously
# uploaded (and possibly edited) workspace content. So I'm not sure how
# necessary this tool is now and may get rid of it eventually.

from argparse import ArgumentParser
from jinja2.sandbox import SandboxedEnvironment
import sys
import datetime
import yaml

CUSTOMIZATION_RULE_TEMPLATE = """\
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
metadata:
  annotations:
  - crgen-info: "Generated from crgen from input '{{input_info}}' on {{creation_date}}"
spec:
  groupRules:
  {% for rule_info in rule_infos %}
  - match:
      matchType: slx-name
      matchMode: exact
      pattern: {{rule_info.slx_name}}
    group: {{rule_info.group}}
  {% endfor %}
"""


def fatal(message: str):
    print(message, file=sys.stderr)
    sys.exit(1)


def main():
    # Set up the argument parsing
    parser = ArgumentParser(prog="crgen",
                            description="Generate map customization rules for groups and dependencies "
                                        "from an existing workspace file")
    parser.add_argument('input_file', nargs='?',
                        help="Path to the workspace.yaml file to use to generate the map customization rules. "
                             "If it is omitted, the input is read from stdin.")
    parser.add_argument('-o', '--output', action='store', dest="output_file",
                        help="Path to the generated map customization rules file. "
                             "If it is omitted, the output is written to stdout.")
    args = parser.parse_args()

    # Read the workspace text from the specified file or stdin
    if args.input_file:
        try:
            with open(args.input_file, "r") as f:
                input_text = f.read()
        except Exception:
            fatal(f"Input file not found: {args.input_file}")
        input_info = args.input_file
    else:
        input_text = sys.stdin.read()
        input_info = 'stdin'

    # Parse the workspace
    try:
        input_data = yaml.safe_load(input_text)
    except yaml.YAMLError as e:
        fatal(f"Error: error parsing input workspace file; {e}")
        return

    if not input_data:
        fatal(f"Error: Invalid/empty input workspace: {input_info}")

    # Convert the group info from the workspace (organized by group) to the
    # format used for the customization rules (organized by SLX name).
    rule_infos = []
    ws_group_info_list = input_data.get('spec', dict()).get('slxGroups', [])
    for ws_group_info in ws_group_info_list:
        group_name = ws_group_info.get('name')
        if not group_name:
            fatal("Error: Invalid empty group name")
        for slx_name in ws_group_info.get('slxs', []):
            if not slx_name:
                fatal("Error: Invalid empty SLX name")
            rule_infos.append({'slx_name': slx_name, 'group': group_name})

    # Use jinja to render the map customization rules text
    env = SandboxedEnvironment(trim_blocks=True, lstrip_blocks=True)
    template_variables = {
        'input_info': input_info,
        'creation_date': datetime.datetime.now().isoformat(),
        'rule_infos': rule_infos,
    }
    output_text = env.from_string(CUSTOMIZATION_RULE_TEMPLATE).render(**template_variables)

    # Write it to the specified file or stdout
    if args.output_file:
        with open(args.output_file, "w") as f:
            f.write(output_text)
    else:
        sys.stdout.write(output_text)


if __name__ == "__main__":
    main()
