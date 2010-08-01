$hacky_bgpage_check = (this == chrome.extension.getBackgroundPage());

var $notify = {
    txt: function(title, msg){
        if (!$hacky_bgpage_check) chrome.extension.sendRequest({notify: [title, msg]});
        else {
            var n = webkitNotifications.createNotification('images/icon48.png', title, msg);
            this.show(n, 2000);
        }
    },
    html: function(url) {
        this.show(webkitNotifications.createHTMLNotification(url), 5000);
    },
    show: function(n, time) {
        n.show();
        setTimeout(function() {n.cancel();}, time);
    } 
}


chrome.extension.onRequest.addListener(
  function(request, sender) {
      var msg = request.notify;
      if (isset(msg)) $notify.txt(msg[0], msg[1]);
 });


