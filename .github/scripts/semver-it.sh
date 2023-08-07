#!/bin/bash
# ======================================================================================
# Synopsis: script for managing the semver tags in a repo by referencing a file's contents.
#           If a changelog filename is provided then it will be written to.

function semver_it_help (){
    echo "
semver-it help

Usage: ./semver-it.sh <path_to_version_file> <path_to_changelog_file>

Examples:
    semantic version for newest version and generate a new changelog entry containing all git log lines with 'Feat' or 'Add' since the previous tag
    ./semver-it.sh ../../VERSION ../../CHANGELOG '(Feat|Add|Doc|Fix)'
"
}

function main (){
    if [ $1 == "help" ]; then
        semver_it_help
        exit 0
    fi
    skip_changelog=1
    temp_file_path="/tmp/temp_changelog"
    if [ -z "$1" ]; then
        echo "Error: no version filename provided"
        exit 1
    fi
    if [ -z "$2" ]; then
        echo "Changelog filepath not provided - configured to not create changelog entry"
        skip_changelog=1
    fi
    if [ -z "$3" ]; then
        changelog_pattern="Add"
    else
        changelog_pattern=$3
    fi
    echo "changelog entry pattern set to: $changelog_pattern"
    version_filename=$1
    changelog_filename=$2
    # new_version="$(cat $version_filename)"
    new_version="$(cat src/VERSION | jq -r .version)"
    new_tag="v$new_version"
    # get the last tag value from a diff on the version file
    # we pull from the file so that we're not affected by devs pushing patch tags in between
    previous_version=$(git log -p -1 $version_filename | grep ^- | tail -n 1 | sed 's/\-//')
    previous_tag="v$previous_version"
    current_date=$(date +%Y-%m-%d)
    if [ -z "$previous_tag" ]; then
        echo "No previous tag found - skipping changelog generation"
        skip_changelog=1
    fi
    # TODO: add new_semver > last_semver check
    # TODO: handle edge case when tag is subset of another tag, eg: 1.0.1 =/= 1.0.10
    # tag_in_changelog=$(grep "$new_tag" $changelog_filename)
    # if [ -n "$tag_in_changelog" ]; then
    #     echo "Tag already in changelog - skipping"
    #     skip_changelog=1
    # fi
    if [ "$skip_changelog" -eq 0 ]; then
        last_tag_hash=$(git rev-list -n 1 "$previous_tag")
        if [ -z $last_tag_hash ]; then
            echo "Could not find a last tag hash with: git rev-list -n 1 "$previous_tag""
            exit 1
        else
            echo "found last tag hash: $last_tag_hash"
        fi
        # we format in the - for markdown
        commit_message_aggregate="$(git log --pretty=format:"- %s %h" --no-merges "${last_tag_hash}..HEAD" | grep -E "$changelog_pattern")"
        changelog_entry="## ${new_version} ${current_date}$(echo -e "\n${commit_message_aggregate}\n")"
        echo "changelog entry:"
        echo -e "${changelog_entry}"
        echo -e "${changelog_entry}\n" | cat - $changelog_filename > $temp_file_path && mv $temp_file_path $changelog_filename
    fi
    echo ""
    echo "Date: $current_date"
    echo "New tag: $new_tag"
    echo "Previous tag: $previous_tag"

    if [ "$skip_changelog" -eq 0 ]; then
        echo "A changelog entry was added, you may now commit the change and version control it"
    fi

    echo "Creating git tag $new_tag, you may now push it to remote"
    git tag $new_tag
    return $?
}
main "$@"