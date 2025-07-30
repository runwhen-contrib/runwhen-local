export declare type ParentPackages = Array<{
    name: string;
    version: string;
}>;
export interface MissingPeerDependencyIssue {
    parents: ParentPackages;
    optional: boolean;
    wantedRange: string;
}
export declare type MissingPeerIssuesByPeerName = Record<string, MissingPeerDependencyIssue[]>;
export interface BadPeerDependencyIssue extends MissingPeerDependencyIssue {
    foundVersion: string;
    resolvedFrom: ParentPackages;
}
export declare type BadPeerIssuesByPeerName = Record<string, BadPeerDependencyIssue[]>;
export declare type PeerDependencyIssuesByProjects = Record<string, PeerDependencyIssues>;
export interface PeerDependencyIssues {
    bad: BadPeerIssuesByPeerName;
    missing: MissingPeerIssuesByPeerName;
    conflicts: string[];
    intersections: Record<string, string>;
}
