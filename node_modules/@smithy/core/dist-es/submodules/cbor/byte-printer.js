export function printBytes(bytes) {
    return [...bytes].map((n) => ("0".repeat(8) + n.toString(2)).slice(-8) + ` (${n})`);
}
