/**
 * Service Worker for UTF-8 & Unicode Extension
 */

// Allow side panel to be opened programmatically or pinned
chrome.runtime.onInstalled.addListener(() => {
  console.log('UTF-8 Unicode extension installed/updated.');
});
