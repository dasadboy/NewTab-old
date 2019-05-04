chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({newsfeeds: [], proxy: "", fav_ids: []}, () => {
    console.log("newsFeeds set to [], proxy set to '', fav_ids set to []");
  });
});
