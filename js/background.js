$(init);

function init()
{
    chrome.contextMenus.create({
        title: 'upload to utorrent',
        contexts: ['link'],
        onclick: clicked
    })
}

function clicked(item) {
    if (!isset(item.linkUrl)) return;
    var utorrent = setupUtorrent(function(){ $notify.html('error.html'); });
    if (utorrent.not_configured) return;
    
    utorrent.upload(item.linkUrl, function(data) {
        $notify.txt("Success", "Your torrent was successfully added");
    });
}
