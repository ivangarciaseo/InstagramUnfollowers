export interface ScanningFilter {
    readonly showNonFollowers: boolean;
    readonly showFollowers: boolean;
    readonly showVerified: boolean;
    readonly showPrivate: boolean;
    readonly showWithOutProfilePicture: boolean;
    // --- ADDED: follower count filter ---
    readonly minFollowers: number; // 0 = no minimum filter
    readonly maxFollowers: number; // 0 = no maximum filter
}
