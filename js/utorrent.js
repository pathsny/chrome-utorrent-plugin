function isset(variable)
{
    return (typeof variable != 'undefined');
}


function setupUtorrent(errorFn) {
    var ip = localStorage["utorrent_ip"];
    var port = localStorage["utorrent_port"];
    var login = localStorage["utorrent_login"];
    var password = localStorage["utorrent_password"];
    var refresh = localStorage["utorrent_refresh"];
    var token_val;

    if (!isset(refresh))
    {
        localStorage["utorrent_refresh"] = 2000;
        refresh = 2000;
    }

    if (!(isset(ip) && isset(port) && isset(login) && isset(password) && isset(refresh)))
    {
        $notify.txt("Error!", "This extension has not been configured!")
        chrome.tabs.create({url:'chrome-extension://'+location.hostname+'/options.html'});        
        return {not_configured: true}
    }
    $.ajaxSetup({timeout: 5000,username: login, password: password, error: errorFn});
    var baseUrl = "http://" + ip+":"+port+"/gui/";

    var withToken = function(fn) {
        if (isset(token_val)) {
            fn(token_val);
        } 
        else {
            $.get(baseUrl + "token.html", function(data) {
                token_val = $(data).text();
                fn(token_val); 
            });   
        }
    }
    
    var get = function(data, fn) {
        withToken(function(token) {
            $.getJSON(baseUrl, $.extend({token: token}, data), fn);
        })
    }

    return {
        refresh: refresh,
        getTorrents: function(fn) { get({list: 1}, fn) },
        perform: function(action, hash, fn) { get({action: action, hash: hash}, fn) },
        upload: function(url, fn) {get({action: "add-url", s: url}, fn)}
    }
}
