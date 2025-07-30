/**
 * regex used by poetry.core.version.Version to parse union of SemVer
 * (with a subset of pre/post/dev tags) and PEP440
 * see: https://github.com/python-poetry/poetry-core/blob/01c0472d9cef3e1a4958364122dd10358a9bd719/poetry/core/version/version.py
 */
export declare const VERSION_PATTERN: RegExp;
export declare const RANGE_COMPARATOR_PATTERN: RegExp;
