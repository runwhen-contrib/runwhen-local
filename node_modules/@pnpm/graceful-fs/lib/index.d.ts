/// <reference types="node" />
import gfs from 'graceful-fs';
declare const _default: {
    createReadStream: typeof gfs.createReadStream;
    readFile: typeof gfs.readFile.__promisify__;
    writeFile: typeof gfs.writeFile.__promisify__;
};
export default _default;
