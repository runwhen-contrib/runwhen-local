import re


def split_camel_cased_name(name: str) -> list[str]:
    result = list()
    pending_part = ""
    for c in name:
        if c.isupper():
            if pending_part:
                result.append(pending_part)
                pending_part = ""
            c = c.lower()
        pending_part += c
    if pending_part:
        result.append(pending_part)
    return result


def remove_vowels(name: str, keep_first_letter: bool) -> str:
    kept_letters = [name[i] for i in range(len(name)) if ((i == 0) and keep_first_letter) or (name[i] not in "aeiou")]
    return ''.join(kept_letters)


def shorten_name(name: str, max_chars: int = 3, separator=None) -> str:
    if len(name) <= max_chars:
        return name
    # First split on the allowed punctuation characters
    # For now this is hard-coded to the allowed non-alphanumeric characters
    # in Kubernetes names.
    # TODO: Eventually would probably be nice to have an input argument
    # to customize the set of punctuation delimiters
    punctuated_parts = re.split(r"[_\-.]", name)
    parts = list()
    for punctuated_part in punctuated_parts:
        parts += split_camel_cased_name(punctuated_part)
    # If no explicit separator is given, then first try it with dashes and see if we
    # can use more than 1 character per part. If so, then use the dash. If not, then
    # set it to use spaces. The rationale is that if we can only fit 1 character per
    # part then it would look weird to hypenate all the single characters, and instead
    # it would look better to just one big initialism. Not completely sure this makes
    # the most sense, but we can iterate this based on real-world examples.
    parts = [remove_vowels(part, True) for part in parts]
    if separator is None:
        separator = '-'
        separator_count = len(parts) - 1
        chars_per_part = (max_chars - separator_count) // len(parts)
        if chars_per_part < 2:
            separator = ''
    separator_count = len(parts) - 1 if separator == '' else 0
    chars_per_part = (max_chars - separator_count) // len(parts)
    if chars_per_part == 0:
        chars_per_part = 1
    first_letters = [parts[i][0:chars_per_part] for i in range(min(max_chars, len(parts)))]
    tiny_name = separator.join(first_letters)
    return tiny_name


def make_slx_name(workspace_name: str, qualified_slx_name: str) -> str:
    return f"{workspace_name}--{qualified_slx_name}"


def make_qualified_slx_name(base_name: str, qualifiers: list[str], max_length=23) -> str:
    """
    This returns the qualified (shortened) SLX name but doesn't include
    the workspace name prefix. This would be used for the name of the SLX
    directory in the workspace.
    Note: the default value for the max_length is derived from the way we encode
    information into the resource name and the Kubernetes 64-character limit on
    length of the name. Hopefully in the future we'll handle this differently
    such that we don't need to do these name shortening tricks to fix into
    64 characters.
    :param base_name:
    :param qualifiers:
    :param max_length:
    :return:
    """
    if not max_length:
        max_length = 1000000
    arg_count = len(qualifiers)
    if arg_count == 0:
        return base_name

    # The minus 1 at the end is to account for the dash between the
    # qualifiers/args and the base name suffix.
    remaining_length = max_length - len(base_name) - 1
    chars_per_arg = (remaining_length - (arg_count - 1)) // arg_count
    shortened_args = [shorten_name(qualifiers[i].replace('_', '-'), chars_per_arg) for i in range(len(qualifiers))]
    args_string = '-'.join(shortened_args)
    qualified_slx_name = f"{args_string}-{base_name}"
    return qualified_slx_name
