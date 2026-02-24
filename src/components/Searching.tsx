import React, { useState } from "react";
import {
    assertUnreachable,
    getCurrentPageUnfollowers,
    getMaxPage,
    getUsersForDisplay,
    fetchFollowerCount,
    sleep,
} from "../utils/utils";
import { State } from "../model/state";
import { UserNode } from "../model/user";
import { WHITELISTED_RESULTS_STORAGE_KEY, TIME_BETWEEN_PROFILE_FETCHES } from "../constants/constants";
import { PrivateFilterOption } from "../model/scanning-filter";

export interface SearchingProps {
    state: State;
    setState: (state: State) => void;
    scanningPaused: boolean;
    pauseScan: () => void;
    handleScanFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleUser: (checked: boolean, user: UserNode) => void;
    UserCheckIcon: React.FC;
    UserUncheckIcon: React.FC;
}

export const Searching = ({
    state,
    setState,
    scanningPaused,
    pauseScan,
    handleScanFilter,
    toggleUser,
    UserCheckIcon,
    UserUncheckIcon,
}: SearchingProps) => {
    // State for follower count checking
    const [isCheckingFollowers, setIsCheckingFollowers] = useState(false);
    const [checkedCount, setCheckedCount] = useState(0);
    const [totalToCheck, setTotalToCheck] = useState(0);

    if (state.status !== "scanning") {
        return null;
    }

    const usersForDisplay = getUsersForDisplay(
        state.results,
        state.whitelistedResults,
        state.currentTab,
        state.searchTerm,
        state.filter,
    );

    // Handler for checking follower counts
    const handleCheckFollowers = async () => {
        if (state.status !== "scanning") return;

        const usersOnPage = getCurrentPageUnfollowers(usersForDisplay, state.page);

        // Only check users that haven't been checked yet
        const usersToCheck = usersOnPage.filter(u => u.follower_count === undefined);

        if (usersToCheck.length === 0) {
            alert("All users on this page already have follower count data.");
            return;
        }

        setIsCheckingFollowers(true);
        setCheckedCount(0);
        setTotalToCheck(usersToCheck.length);

        const updatedResults = [...state.results];

        for (let i = 0; i < usersToCheck.length; i++) {
            const user = usersToCheck[i];
            const count = await fetchFollowerCount(user.username);

            if (count !== null) {
                const idx = updatedResults.findIndex(r => r.id === user.id);
                if (idx !== -1) {
                    updatedResults[idx] = { ...updatedResults[idx], follower_count: count };
                }
            }

            setCheckedCount(i + 1);

            // Delay between requests to avoid rate limiting
            if (i < usersToCheck.length - 1) {
                await sleep(TIME_BETWEEN_PROFILE_FETCHES);
            }
        }

        // Update global state with enriched results
        setState({
            ...state,
            results: updatedResults,
        });

        setIsCheckingFollowers(false);
    };

    // Handler for numeric filter inputs (follower count)
    const handleFollowerFilterChange = (field: "minFollowers" | "maxFollowers", value: string) => {
        if (state.status !== "scanning") return;
        const numValue = Math.max(0, Number(value) || 0);
        setState({
            ...state,
            filter: {
                ...state.filter,
                [field]: numValue,
            },
        });
    };

    // ADDED: Handler for private filter select change
    const handlePrivateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (state.status !== "scanning") return;

        if (state.selectedResults.length > 0) {
            if (!confirm("Changing filter options will clear selected users")) {
                return;
            }
        }

        setState({
            ...state,
            selectedResults: [],
            filter: {
                ...state.filter,
                privateFilter: e.currentTarget.value as PrivateFilterOption,
            },
        });
    };

    let currentLetter = "";

    const onNewLetter = (firstLetter: string) => {
        currentLetter = firstLetter;
        return <div className="alphabet-character">{currentLetter}</div>;
    };

    return (
        <section className="flex">
            <aside className="app-sidebar">
                <menu className="flex column m-clear p-clear">
                    <p>Filter</p>
                    <label className="badge m-small">
                        <input
                            type="checkbox"
                            name="showNonFollowers"
                            checked={state.filter.showNonFollowers}
                            onChange={handleScanFilter}
                        />
                        &nbsp;Non-Followers
                    </label>
                    <label className="badge m-small">
                        <input
                            type="checkbox"
                            name="showFollowers"
                            checked={state.filter.showFollowers}
                            onChange={handleScanFilter}
                        />
                        &nbsp;Followers
                    </label>
                    <label className="badge m-small">
                        <input
                            type="checkbox"
                            name="showVerified"
                            checked={state.filter.showVerified}
                            onChange={handleScanFilter}
                        />
                        &nbsp;Verified
                    </label>

                    {/* CHANGED: Private filter - now a select with 3 options instead of checkbox */}
                    <label className="badge m-small" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        Private:
                        <select
                            value={state.filter.privateFilter}
                            onChange={handlePrivateFilterChange}
                            style={{
                                padding: "0.25rem 0.4rem",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "6px",
                                background: "#1c1c1e",
                                color: "#fff",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                            }}
                        >
                            <option value="all">All</option>
                            <option value="only_private">Only Private</option>
                            <option value="only_public">Only Public</option>
                        </select>
                    </label>
                    {/* END CHANGED */}

                    <label className="badge m-small">
                        <input
                            type="checkbox"
                            name="showWithOutProfilePicture"
                            checked={state.filter.showWithOutProfilePicture}
                            onChange={handleScanFilter}
                        />
                        &nbsp;Without Profile Picture
                    </label>
                </menu>

                {/* Follower Count Filter Section */}
                <menu className="flex column m-clear p-clear" style={{ marginTop: "0.5rem" }}>
                    <p>Follower Count</p>
                    <label className="badge m-small" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        Min:
                        <input
                            type="number"
                            min={0}
                            value={state.filter.minFollowers || ""}
                            placeholder="0"
                            onChange={e => handleFollowerFilterChange("minFollowers", e.currentTarget.value)}
                            style={{
                                width: "80px",
                                padding: "0.3rem 0.5rem",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "6px",
                                background: "#1c1c1e",
                                color: "#fff",
                                fontSize: "0.85rem",
                            }}
                        />
                    </label>
                    <label className="badge m-small" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        Max:
                        <input
                            type="number"
                            min={0}
                            value={state.filter.maxFollowers || ""}
                            placeholder="0 (no limit)"
                            onChange={e => handleFollowerFilterChange("maxFollowers", e.currentTarget.value)}
                            style={{
                                width: "80px",
                                padding: "0.3rem 0.5rem",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "6px",
                                background: "#1c1c1e",
                                color: "#fff",
                                fontSize: "0.85rem",
                            }}
                        />
                    </label>
                </menu>

                <div className="sidebar-stats">
                    <p>Displayed: {usersForDisplay.length}</p>
                    <p>Total: {state.results.length}</p>
                    <p className="whitelist-counter">
                        <span className="whitelist-badge">★</span> Whitelisted: {state.whitelistedResults.length}
                    </p>
                </div>

                {/* Scan controls */}
                <div className="controls">
                    <button
                        className="button-control button-pause"
                        onClick={pauseScan}
                    >
                        {scanningPaused ? "Resume" : "Pause"}
                    </button>
                </div>

                {/* Check Follower Count button */}
                <div className="controls">
                    <button
                        className="button-control"
                        disabled={state.percentage < 100 || isCheckingFollowers}
                        onClick={handleCheckFollowers}
                        style={{ width: "100%" }}
                        title={state.percentage < 100 ? "Wait for scan to complete" : "Fetch follower count for users on current page"}
                    >
                        {isCheckingFollowers
                            ? `Checking... (${checkedCount}/${totalToCheck})`
                            : "🔍 Check Followers (this page)"}
                    </button>
                </div>

                <div className="sidebar-pagination">
                    <p>Pages</p>
                    <div className="pagination-controls">
                        <a
                            onClick={() => {
                                if (state.page - 1 > 0) {
                                    setState({
                                        ...state,
                                        page: state.page - 1,
                                    });
                                }
                            }}
                            className="p-medium"
                        >
                            ❮
                        </a>
                        <span>
                            {state.page}&nbsp;/&nbsp;{getMaxPage(usersForDisplay)}
                        </span>
                        <a
                            onClick={() => {
                                if (state.page < getMaxPage(usersForDisplay)) {
                                    setState({
                                        ...state,
                                        page: state.page + 1,
                                    });
                                }
                            }}
                            className="p-medium"
                        >
                            ❯
                        </a>
                    </div>
                </div>

                <button
                    className="unfollow"
                    onClick={() => {
                        if (!confirm("Are you sure?")) {
                            return;
                        }

                        //TODO TEMP until types are properly fixed
                        // @ts-ignore
                        setState(prevState => {
                            if (prevState.status !== "scanning") {
                                return prevState;
                            }

                            if (prevState.selectedResults.length === 0) {
                                alert("Must select at least a single user to unfollow");
                                return prevState;
                            }

                            const newState: State = {
                                ...prevState,
                                status: "unfollowing",
                                percentage: 0,
                                unfollowLog: [],
                                filter: {
                                    showSucceeded: true,
                                    showFailed: true,
                                },
                            };
                            return newState;
                        });
                    }}
                >
                    UNFOLLOW ({state.selectedResults.length})
                </button>
            </aside>

            <article className="results-container">
                <nav className="tabs-container">
                    <div
                        className={`tab ${state.currentTab === "non_whitelisted" ? "tab-active" : ""}`}
                        onClick={() => {
                            if (state.currentTab === "non_whitelisted") {
                                return;
                            }
                            setState({
                                ...state,
                                currentTab: "non_whitelisted",
                                selectedResults: [],
                            });
                        }}
                    >
                        Non-Whitelisted
                    </div>
                    <div
                        className={`tab ${state.currentTab === "whitelisted" ? "tab-active" : ""}`}
                        onClick={() => {
                            if (state.currentTab === "whitelisted") {
                                return;
                            }
                            setState({
                                ...state,
                                currentTab: "whitelisted",
                                selectedResults: [],
                            });
                        }}
                    >
                        Whitelisted
                    </div>
                </nav>

                {getCurrentPageUnfollowers(usersForDisplay, state.page).map(user => {
                    const firstLetter = user.username.substring(0, 1).toUpperCase();
                    return (
                        <>
                            {firstLetter !== currentLetter && onNewLetter(firstLetter)}
                            <label className="result-item">
                                <div className="flex grow align-center">
                                    <div
                                        className="avatar-container"
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            let whitelistedResults: readonly UserNode[] = [];

                                            switch (state.currentTab) {
                                                case "non_whitelisted":
                                                    whitelistedResults = [...state.whitelistedResults, user];
                                                    break;
                                                case "whitelisted":
                                                    whitelistedResults = state.whitelistedResults.filter(
                                                        result => result.id !== user.id,
                                                    );
                                                    break;
                                                default:
                                                    assertUnreachable(state.currentTab);
                                            }

                                            localStorage.setItem(
                                                WHITELISTED_RESULTS_STORAGE_KEY,
                                                JSON.stringify(whitelistedResults),
                                            );

                                            setState({ ...state, whitelistedResults });
                                        }}
                                    >
                                        <img
                                            className="avatar"
                                            alt={user.username}
                                            src={user.profile_pic_url}
                                        />
                                        <span className="avatar-icon-overlay-container">
                                            {state.currentTab === "non_whitelisted" ? (
                                                <UserCheckIcon />
                                            ) : (
                                                <UserUncheckIcon />
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex column m-medium">
                                        <a
                                            className="fs-xlarge"
                                            target="_blank"
                                            href={`/${user.username}`}
                                            rel="noreferrer"
                                        >
                                            {user.username}
                                        </a>
                                        <span className="fs-medium">{user.full_name}</span>
                                        {/* Show follower count if available */}
                                        {user.follower_count !== undefined && (
                                            <span style={{
                                                fontSize: "0.8rem",
                                                color: "#8e8e93",
                                                marginTop: "0.15rem",
                                            }}>
                                                {user.follower_count.toLocaleString()} followers
                                            </span>
                                        )}
                                    </div>
                                    {user.is_verified && <div className="verified-badge">✔</div>}
                                    {user.is_private && (
                                        <div className="flex justify-center w-100">
                                            <span className="private-indicator">Private</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    className="account-checkbox"
                                    type="checkbox"
                                    checked={state.selectedResults.indexOf(user) !== -1}
                                    onChange={e => toggleUser(e.currentTarget.checked, user)}
                                />
                            </label>
                        </>
                    );
                })}
            </article>
        </section>
    );
};                {/* --- ADDED: Follower Count Filter Section --- */}
                <menu className="flex column m-clear p-clear" style={{ marginTop: "0.5rem" }}>
                    <p>Follower Count</p>
                    <label className="badge m-small" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        Min:
                        <input
                            type="number"
                            min={0}
                            value={state.filter.minFollowers || ""}
                            placeholder="0"
                            onChange={e => handleFollowerFilterChange("minFollowers", e.currentTarget.value)}
                            style={{
                                width: "80px",
                                padding: "0.3rem 0.5rem",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "6px",
                                background: "#1c1c1e",
                                color: "#fff",
                                fontSize: "0.85rem",
                            }}
                        />
                    </label>
                    <label className="badge m-small" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        Max:
                        <input
                            type="number"
                            min={0}
                            value={state.filter.maxFollowers || ""}
                            placeholder="0 (no limit)"
                            onChange={e => handleFollowerFilterChange("maxFollowers", e.currentTarget.value)}
                            style={{
                                width: "80px",
                                padding: "0.3rem 0.5rem",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "6px",
                                background: "#1c1c1e",
                                color: "#fff",
                                fontSize: "0.85rem",
                            }}
                        />
                    </label>
                </menu>
                {/* --- END ADDED --- */}

                <div className="sidebar-stats">
                    <p>Displayed: {usersForDisplay.length}</p>
                    <p>Total: {state.results.length}</p>
                    <p className="whitelist-counter">
                        <span className="whitelist-badge">★</span> Whitelisted: {state.whitelistedResults.length}
                    </p>
                </div>

                {/* Scan controls */}
                <div className="controls">
                    <button
                        className="button-control button-pause"
                        onClick={pauseScan}
                    >
                        {scanningPaused ? "Resume" : "Pause"}
                    </button>
                </div>

                {/* --- ADDED: Check Follower Count button --- */}
                <div className="controls">
                    <button
                        className="button-control"
                        disabled={state.percentage < 100 || isCheckingFollowers}
                        onClick={handleCheckFollowers}
                        style={{ width: "100%" }}
                        title={state.percentage < 100 ? "Wait for scan to complete" : "Fetch follower count for users on current page"}
                    >
                        {isCheckingFollowers
                            ? `Checking... (${checkedCount}/${totalToCheck})`
                            : "🔍 Check Followers (this page)"}
                    </button>
                </div>
                {/* --- END ADDED --- */}

                <div className="sidebar-pagination">
                    <p>Pages</p>
                    <div className="pagination-controls">
                        <a
                            onClick={() => {
                                if (state.page - 1 > 0) {
                                    setState({
                                        ...state,
                                        page: state.page - 1,
                                    });
                                }
                            }}
                            className="p-medium"
                        >
                            ❮
                        </a>
                        <span>
                            {state.page}&nbsp;/&nbsp;{getMaxPage(usersForDisplay)}
                        </span>
                        <a
                            onClick={() => {
                                if (state.page < getMaxPage(usersForDisplay)) {
                                    setState({
                                        ...state,
                                        page: state.page + 1,
                                    });
                                }
                            }}
                            className="p-medium"
                        >
                            ❯
                        </a>
                    </div>
                </div>

                <button
                    className="unfollow"
                    onClick={() => {
                        if (!confirm("Are you sure?")) {
                            return;
                        }

                        //TODO TEMP until types are properly fixed
                        // @ts-ignore
                        setState(prevState => {
                            if (prevState.status !== "scanning") {
                                return prevState;
                            }

                            if (prevState.selectedResults.length === 0) {
                                alert("Must select at least a single user to unfollow");
                                return prevState;
                            }

                            const newState: State = {
                                ...prevState,
                                status: "unfollowing",
                                percentage: 0,
                                unfollowLog: [],
                                filter: {
                                    showSucceeded: true,
                                    showFailed: true,
                                },
                            };
                            return newState;
                        });
                    }}
                >
                    UNFOLLOW ({state.selectedResults.length})
                </button>
            </aside>

            <article className="results-container">
                <nav className="tabs-container">
                    <div
                        className={`tab ${state.currentTab === "non_whitelisted" ? "tab-active" : ""}`}
                        onClick={() => {
                            if (state.currentTab === "non_whitelisted") {
                                return;
                            }
                            setState({
                                ...state,
                                currentTab: "non_whitelisted",
                                selectedResults: [],
                            });
                        }}
                    >
                        Non-Whitelisted
                    </div>
                    <div
                        className={`tab ${state.currentTab === "whitelisted" ? "tab-active" : ""}`}
                        onClick={() => {
                            if (state.currentTab === "whitelisted") {
                                return;
                            }
                            setState({
                                ...state,
                                currentTab: "whitelisted",
                                selectedResults: [],
                            });
                        }}
                    >
                        Whitelisted
                    </div>
                </nav>

                {getCurrentPageUnfollowers(usersForDisplay, state.page).map(user => {
                    const firstLetter = user.username.substring(0, 1).toUpperCase();
                    return (
                        <>
                            {firstLetter !== currentLetter && onNewLetter(firstLetter)}
                            <label className="result-item">
                                <div className="flex grow align-center">
                                    <div
                                        className="avatar-container"
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            let whitelistedResults: readonly UserNode[] = [];

                                            switch (state.currentTab) {
                                                case "non_whitelisted":
                                                    whitelistedResults = [...state.whitelistedResults, user];
                                                    break;
                                                case "whitelisted":
                                                    whitelistedResults = state.whitelistedResults.filter(
                                                        result => result.id !== user.id,
                                                    );
                                                    break;
                                                default:
                                                    assertUnreachable(state.currentTab);
                                            }

                                            localStorage.setItem(
                                                WHITELISTED_RESULTS_STORAGE_KEY,
                                                JSON.stringify(whitelistedResults),
                                            );

                                            setState({ ...state, whitelistedResults });
                                        }}
                                    >
                                        <img
                                            className="avatar"
                                            alt={user.username}
                                            src={user.profile_pic_url}
                                        />
                                        <span className="avatar-icon-overlay-container">
                                            {state.currentTab === "non_whitelisted" ? (
                                                <UserCheckIcon />
                                            ) : (
                                                <UserUncheckIcon />
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex column m-medium">
                                        <a
                                            className="fs-xlarge"
                                            target="_blank"
                                            href={`/${user.username}`}
                                            rel="noreferrer"
                                        >
                                            {user.username}
                                        </a>
                                        <span className="fs-medium">{user.full_name}</span>
                                        {/* --- ADDED: show follower count if available --- */}
                                        {user.follower_count !== undefined && (
                                            <span style={{
                                                fontSize: "0.8rem",
                                                color: "#8e8e93",
                                                marginTop: "0.15rem",
                                            }}>
                                                {user.follower_count.toLocaleString()} followers
                                            </span>
                                        )}
                                        {/* --- END ADDED --- */}
                                    </div>
                                    {user.is_verified && <div className="verified-badge">✔</div>}
                                    {user.is_private && (
                                        <div className="flex justify-center w-100">
                                            <span className="private-indicator">Private</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    className="account-checkbox"
                                    type="checkbox"
                                    checked={state.selectedResults.indexOf(user) !== -1}
                                    onChange={e => toggleUser(e.currentTarget.checked, user)}
                                />
                            </label>
                        </>
                    );
                })}
            </article>
        </section>
    );
};
