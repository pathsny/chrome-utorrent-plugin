function isset(variable)
{
    return (typeof variable != 'undefined');
}


function setupUtorrent(errorFn) {
    var server = {};
    $.each(["ip", "alt_ip", "port", "login", "password"], function(i, item){
        server[item] = localStorage["utorrent_" + item];
    })
    

    if (!(isset(server.ip)))
    {
        $notify.txt("Error!", "This extension has not been configured!")
        chrome.tabs.create({url:'chrome-extension://'+location.hostname+'/options.html'});        
        return {not_configured: true}
    }
    $.ajaxSetup({timeout: 500,username: server.login, password: server.password});
    var baseUrl = function(ip){return "http://" + server[ip]+":"+server.port+"/gui/";};
    var cur_data;

    var withToken = function(fn) {
        if (isset(cur_data)) {
            fn.apply(this, cur_data);
        } 
        else {
            var xhrs = [];
            var success = function(item){
                return function(data) {
                    if (!(isset(cur_data))) {
                        cur_data = [$(data).text(), baseUrl(item)];
                        $.each(xhrs, function(i,x){x.abort();})
                        fn.apply(this, cur_data);
                    }
                }
            };
            var times = 0;
            var error = function() {
                times += 1;
                if (times >= 2) { 
                    return errorFn.apply(this, arguments);
                }
            };
            xhrs = $.map(["ip", "alt_ip"], function(item) {
                    return $.ajax({url: baseUrl(item) + "token.html", success: success(item), error: error})
            })
        }
    }
    
    var get = function(data, fn) {
        withToken(function(token, url) {
            $.ajax({url: url, data: $.extend({token: token}, data), dataType: "json", success: fn, error: function() {
                cur_data = undefined;
                errorFn.apply(this, arguments);
            }});
        })
    }

    return {
        getTorrents: function(fn) { get({list: 1}, fn) },
        perform: function(action, hash, fn) { get({action: action, hash: hash}, fn) },
        upload: function(url, fn) {get({action: "add-url", s: url}, fn)}
    }
}
