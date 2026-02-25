# 📱 Instagram Unfollowers (Enhanced Fork)

[![Maintenance](https://img.shields.io/maintenance/yes/2026)](https://github.com/ivangarciaseo/InstagramUnfollowers)
[![GitHub](https://img.shields.io/badge/Fork%20by-ivangarciaseo-blue)](https://github.com/ivangarciaseo)

A nifty tool that lets you see who doesn't follow you back on Instagram.
<u>Browser-based and requires no downloads or installations!</u>

> 🔀 Enhanced fork of [davidarroyo1234/InstagramUnfollowers](https://github.com/davidarroyo1234/InstagramUnfollowers) with additional filtering and sorting features.

## ✨ New Features (Fork)

- 🔒 **Private/Public Account Filter** — Filter results by account type: show All, Only Private, or Only Public accounts
- 📊 **Follower Count Checker** — Fetch and display the follower count for users on the current page, with Min/Max filter inputs
- 🔃 **Sort Order Selector** — Sort results Alphabetically (A→Z), by Most Recent follows first, or Oldest follows first

## ⚠️ WARNING

This version utilizes the Instagram API for better performance.

## 🖥️ Desktop Usage

1. Copy the code from: [InstagramUnfollowers Tool](https://ivangarciaseo.github.io/InstagramUnfollowers/public/)
2. Press the COPY button to copy the code.

<img src="./assets/copy_code.png" alt="Copy code button" />

3. Go to Instagram website and log in to your account
4. Open the developer console:
   - Windows: `Ctrl + Shift + J`
   - Mac OS: `⌘ + ⌥ + I`
5. Paste the code and you'll see this interface:

<img src="./assets/initial.png" alt="Initial screen" />

6. Click "RUN" to start scanning
7. After scanning completes, you'll see the results:

<img src="./assets/results.png" alt="Results screen" />

8. 🤍 Whitelist users by clicking their profile image
9. 💾 Manage your whitelist via Settings:
   - Export: Save your whitelist as a JSON backup file
   - Import: Restore or merge whitelisted users from a file
   - Clear: Remove all users from whitelist

Your whitelist persists between sessions automatically!

<img src="./assets/settings_whitelist.png" alt="Settings screen" />

10. ✅ Select users to unfollow using the checkboxes
11. ⚙️ Customize script timings via the "Settings" button:

<img src="./assets/settings.png" alt="Settings screen" />

## 🔒 Private/Public Filter

Use the **Private** dropdown in the sidebar to filter results:

- **All** — Show both private and public accounts (default)
- **Only Private** — Show only private accounts (useful for mass-unfollowing private accounts that don't follow you back)
- **Only Public** — Show only public accounts

## 📊 Follower Count Checker

After the scan reaches 100%, click **"🔍 Check Followers (this page)"** to fetch the follower count for each user on the current page. Once loaded:

- Each user will display their follower count below their name
- Use the **Min** and **Max** inputs in the sidebar to filter by follower count
- Example: Set `Max: 500` to only show users with ≤500 followers

> ⚠️ This feature makes one API request per user with a 1.5s delay between requests to avoid rate limiting.

## 🔃 Sort Order

Use the **Sort Order** dropdown to change how results are displayed:

- **A → Z** — Alphabetical order (default)
- **Recent first** — Users you followed most recently appear first (based on API order)
- **Oldest first** — Users you followed longest ago appear first

> Note: Instagram doesn't provide an exact follow date. The order is based on how the API returns results, which approximately reflects the follow order.

## 📱 Mobile Usage

For Android users who want to use it on mobile:

1. Download the latest version of [Eruda Android Browser](https://github.com/liriliri/eruda-android/releases/)
2. Open Instagram web through the Eruda browser
3. Follow the same steps as desktop (the console will be automatically available when clicking the eruda icon)

## ⚡ Performance Notes

- Processing time increases with the number of users to check
- Script works on both Chromium and Firefox-based browsers
- The script takes a few more seconds to load on mobile
- Whitelist data is stored locally in your browser (localStorage)

## ✨ All Features

- 🔍 Scan and identify users who don't follow you back
- 🔒 Filter by private/public accounts (3 options)
- 📊 On-demand follower count fetching with Min/Max filter
- 🔃 Sort by alphabetical, recent first, or oldest first
- 🤍 Whitelist system to protect specific accounts from unfollowing
- 💾 Export/Import whitelist functionality for backup and transfer
- ⚙️ Customizable timing settings to avoid rate limits
- 🎨 Clean, minimalist interface inspired by Apple design
- 📱 Fully responsive - works on desktop and mobile
- 🔒 All data stored locally - no external servers

## 🛠️ Development

- Node version: 16.14.0 (If using nvm, run `nvm use`)
- After modifying `main.tsx`, run the "build" command to format, compress, and convert your code
- Automatic re-building can be done using nodemon build-dev

## 🙏 Credits

- Original project by [davidarroyo1234](https://github.com/davidarroyo1234/InstagramUnfollowers)
- Enhanced fork by [ivangarciaseo](https://github.com/ivangarciaseo/InstagramUnfollowers)

## ⚖️ Legal & License

**Disclaimer:** This tool is not affiliated, associated, authorized, endorsed by, or officially connected with Instagram. ⚠️ Use at your own risk!

📜 Licensed under the [MIT License](LICENSE)
- ✅ Free to use, copy, and modify
- 🤝 Open source and community-friendly
- 📋 See [LICENSE](LICENSE) file for full terms
