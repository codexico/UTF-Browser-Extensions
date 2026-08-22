/**
 * Background Service Worker / Script for UTF-8 & Unicode Extension
 */

const sp = (typeof chrome !== 'undefined') ? chrome['sidePanel'] : null;
if (sp && typeof sp['setPanelBehavior'] === 'function') {
  try {
    sp['setPanelBehavior']({ openPanelOnActionClick: false }).catch(() => {});
  } catch (e) {}
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('UTF-8 Unicode extension installed/updated.');
});
