export type PrivateFilterOption = "all" | "only_private" | "only_public";

export type SortOrder = "alphabetical" | "recent_first" | "oldest_first";

export interface ScanningFilter {
    readonly showNonFollowers: boolean;
    readonly showFollowers: boolean;
    readonly showVerified: boolean;
    readonly privateFilter: PrivateFilterOption;
    readonly showWithOutProfilePicture: boolean;
    // follower count filter
    readonly minFollowers: number;
    readonly maxFollowers: number;
    // sort order
    readonly sortOrder: SortOrder;
}
