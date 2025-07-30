"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceFetcher = void 0;
const fslib_1 = require("@yarnpkg/fslib");
const WorkspaceResolver_1 = require("./WorkspaceResolver");
class WorkspaceFetcher {
    supports(locator) {
        if (!locator.reference.startsWith(WorkspaceResolver_1.WorkspaceResolver.protocol))
            return false;
        return true;
    }
    getLocalPath(locator, opts) {
        return this.getWorkspace(locator, opts).cwd;
    }
    async fetch(locator, opts) {
        const sourcePath = this.getWorkspace(locator, opts).cwd;
        return { packageFs: new fslib_1.CwdFS(sourcePath), prefixPath: fslib_1.PortablePath.dot, localPath: sourcePath };
    }
    getWorkspace(locator, opts) {
        return opts.project.getWorkspaceByCwd(locator.reference.slice(WorkspaceResolver_1.WorkspaceResolver.protocol.length));
    }
}
exports.WorkspaceFetcher = WorkspaceFetcher;
