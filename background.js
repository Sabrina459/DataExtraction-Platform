chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getHTMLDescription') {
        fetch("https://supplier-description-api-697776775791.northamerica-northeast2.run.app/api/description/html", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({url:message.url, host:message.host})
        }).then(response => response.json()).then(
            data => {
                sendResponse({status: true, description: data.description})}
        ).catch(error => sendResponse({status: false, error: error.message}));
    
    }
    if (message.action === 'getTextDescription') {
        fetch("https://supplier-description-api-697776775791.northamerica-northeast2.run.app/api/description/text", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({url:message.url, host:message.host})
        }).then(response => response.json()).then(
            data => {
                sendResponse({status: true, description: data.description})}
        ).catch(error => sendResponse({status: false, error: error.message}));
    
    }
    return true;
});
