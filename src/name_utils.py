import re
import hashlib

def split_camel_cased_name(name: str) -> list[str]:
    """
    Splits a camel-cased name into its constituent parts.
    :param name: The camel-cased name.
    :return: A list of name parts.
    """
    result = []
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

def sanitize_name(name: str) -> str:
    """
    Remove or replace characters that are unsuitable for file names.
    Also strips leading and trailing dashes to ensure RFC 1123 compliance.
    :param name: The name to sanitize.
    :return: The sanitized name.
    """
    return name.replace(':', '-').replace('/', '-').strip('-')

def remove_vowels(name: str, keep_first_letter: bool) -> str:
    """
    Remove vowels from a name, optionally keeping the first letter.
    :param name: The name to process.
    :param keep_first_letter: Whether to keep the first letter.
    :return: The name with vowels removed.
    """
    kept_letters = [name[i] for i in range(len(name)) if ((i == 0) and keep_first_letter) or (name[i] not in "aeiou")]
    return ''.join(kept_letters)

def shorten_name(name: str, max_chars: int = 3, separator=None) -> str:
    """
    Shorten a name to a specified maximum number of characters.
    :param name: The name to shorten.
    :param max_chars: The maximum number of characters.
    :param separator: Optional separator to use between parts.
    :return: The shortened name.
    """
    if len(name) <= max_chars:
        return name
    punctuated_parts = re.split(r"[_\-.]", name)
    parts = []
    for punctuated_part in punctuated_parts:
        parts += split_camel_cased_name(punctuated_part)
    parts = [remove_vowels(part, True) for part in parts]
    if separator is None:
        separator = '-' if len(parts) * 2 < max_chars else ''
    chars_per_part = (max_chars - len(parts) + 1) // len(parts) if separator else 1
    first_letters = [part[0:chars_per_part] for part in parts]
    tiny_name = separator.join(first_letters)
    return tiny_name

def generate_hash(qualifiers: list[str]) -> str:
    """
    Generate a consistent hash for the qualifiers.
    :param qualifiers: The list of qualifiers.
    :return: The first 8 characters of the SHA-1 hash of the combined qualifiers.
    """
    combined_qualifiers = '-'.join(qualifiers)
    hash_object = hashlib.sha1(combined_qualifiers.encode())
    return hash_object.hexdigest()[:8]  # Use the first 8 characters of the hash for brevity

def _truncate_qualified_name(qualified_slx_name: str, excess_length: int) -> str:
    """
    Internal helper to truncate a qualified SLX name while preserving the hash suffix.
    :param qualified_slx_name: The qualified SLX name to truncate.
    :param excess_length: Number of characters to remove.
    :return: The truncated qualified name with hash suffix preserved.
    """
    # The hash suffix is 8 characters preceded by a dash (9 chars total)
    # We must preserve this to maintain uniqueness across SLXs
    hash_suffix_length = 9  # "-" + 8 hash characters
    if len(qualified_slx_name) > hash_suffix_length + excess_length:
        # Split off the hash suffix, truncate the prefix, then recombine
        hash_suffix = qualified_slx_name[-hash_suffix_length:]
        prefix = qualified_slx_name[:-hash_suffix_length]
        truncated_prefix = prefix[:-excess_length].rstrip('-')
        return truncated_prefix + hash_suffix
    else:
        # If we can't preserve the hash, fall back to truncating from end
        return qualified_slx_name[:-excess_length]


def make_slx_name_and_qualified(workspace_name: str, qualified_slx_name: str) -> tuple[str, str]:
    """
    Create an SLX name and return both the full name and the (possibly truncated) qualified name.
    This ensures the directory name and SLX name stay in sync.
    :param workspace_name: The workspace name.
    :param qualified_slx_name: The qualified SLX name.
    :return: A tuple of (full_slx_name, truncated_qualified_name) where:
             - full_slx_name is the combined and sanitized SLX name (workspace--qualified)
             - truncated_qualified_name is the (possibly truncated) qualified name for directory use
    """
    max_k8s_name_length = 63
    combined_length = len(workspace_name) + 2 + len(qualified_slx_name)  # 2 for the "--" separator
    if combined_length > max_k8s_name_length:
        excess_length = combined_length - max_k8s_name_length
        qualified_slx_name = _truncate_qualified_name(qualified_slx_name, excess_length)
    safe_qualified_slx_name = sanitize_name(qualified_slx_name)
    full_slx_name = f"{workspace_name}--{safe_qualified_slx_name}"
    return (full_slx_name, safe_qualified_slx_name)


def make_slx_name(workspace_name: str, qualified_slx_name: str) -> str:
    """
    Ensure the SLX name is safe for file naming and fits within the Kubernetes name limit.
    :param workspace_name: The workspace name.
    :param qualified_slx_name: The qualified SLX name.
    :return: The combined and sanitized SLX name.
    
    Note: This function is kept for backward compatibility (used in templates).
    For internal use where you need both the full name and directory name,
    use make_slx_name_and_qualified() instead.
    """
    full_name, _ = make_slx_name_and_qualified(workspace_name, qualified_slx_name)
    return full_name

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
    :param base_name: The base name of the SLX.
    :param qualifiers: The list of qualifiers.
    :param max_length: The maximum length of the qualified SLX name.
    :return: The sanitized and shortened qualified SLX name.
    """
    if not max_length:
        max_length = 1000000
    arg_count = len(qualifiers)
    if arg_count == 0:
        return sanitize_name(base_name)

    remaining_length = max_length - len(base_name) - 1 - 9  # Reserve 9 characters for hash and separator
    chars_per_arg = (remaining_length - (arg_count - 1)) // arg_count
    shortened_args = [shorten_name(qualifiers[i].replace('_', '-'), chars_per_arg) for i in range(len(qualifiers))]
    args_string = '-'.join(shortened_args)
    hash_suffix = generate_hash(qualifiers)
    qualified_slx_name = f"{args_string}-{base_name}-{hash_suffix}"
    return sanitize_name(qualified_slx_name)