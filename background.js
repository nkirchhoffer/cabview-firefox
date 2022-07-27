const ytHandler = (tabId) => {
    browser.tabs.get(tabId).then(tab => {
        if (tab.url.match(/https:\/\/www\.youtube\.com\/watch\?v=(.*)/g)) {
            console.log('icone');
            browser.browserAction.setIcon({
                path: {
                    16: "icons/train-16.png",
                    32: "icons/train-32.png",
                    64: "icons/train-64.png"
                }
            });
        } else {
            browser.browserAction.setIcon({
                path: {
                    16: "icons/train-gray-16.png",
                    32: "icons/train-gray-32.png",
                    64: "icons/train-gray-64.png"
                }
            });
        }
    });
}

browser.tabs.onActivated.addListener((activeInfo) => {
    ytHandler(activeInfo.tabId);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    ytHandler(tabId);
}, { windowId: browser.windows.WINDOW_ID_CURRENT });

browser.browserAction.onClicked.addListener(tab => {
    if (tab.url.match(/https:\/\/www\.youtube\.com\/watch\?v=(.*)/g)) {
        const url = new URL(tab.url);
        
        if (url.searchParams.has('t')) {
            url.searchParams.delete('t');
        }

        const request = new XMLHttpRequest();
        request.open('POST', 'https://cabview.nkir.ch/api/videos');
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({ video: url }));
        request.onload = () => {
            if (request.status === 200) {
                browser.notifications.create('video-sent', {
                    type: 'basic',
                    iconUrl: browser.runtime.getURL('icons/train-64.png'),
                    title: 'CabView',
                    message: 'Vidéo envoyée avec succès !'
                });
            }

            if (request.status === 400) {
                browser.notifications.create('video-already-exists', {
                    type: 'basic',
                    iconUrl: browser.runtime.getURL('icons/train-gray-64.png'),
                    title: 'CabView',
                    message: JSON.parse(request.response).message
                });
            }
        }
    }
});