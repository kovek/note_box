chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
      console.log(response.farewell);
    });
  });
});
