export type PrivateFilterOption = "all" | "only_private" | "only_public";

export interface ScanningFilter {
    readonly showNonFollowers: boolean;
    readonly showFollowers: boolean;
    readonly showVerified: boolean;
    readonly privateFilter: PrivateFilterOption; // CHANGED: was showPrivate: boolean
    readonly showWithOutProfilePicture: boolean;
    // follower count filter
    readonly minFollowers: number;
    readonly maxFollowers: number;
}
