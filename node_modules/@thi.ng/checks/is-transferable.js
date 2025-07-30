export const isTransferable = (x) => x instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer !== "undefined" &&
        x instanceof SharedArrayBuffer) ||
    (typeof MessagePort !== "undefined" && x instanceof MessagePort);
