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
        return {not_configured: true}
    }
    $.ajaxSetup({timeout: 5000,username: login, password: password, error: displayError});

    var withToken = function(fn) {
        if (isset(token_val)) {
            fn(token_val);
        } 
        else {
            $.get("http://" + ip+":"+port+"/gui/token.html", function(data) {
                token_val = $(data).text();
                fn(token_val); 
            });   
        }
    }

    return {
        refresh: refresh,
        getTorrents: function(fn) {
            withToken(function(token) {
                $.getJSON("http://" + ip+":"+port+"/gui/", {token: token, list: 1}, fn)
            })
        },
        perform: function(action, hash, fn) {
            fn = isset(fn) ? fn : function(){};
            withToken(function(token) {
                $.get("http://"+ip+":"+port+"/gui/",{token: token, action: action, hash: hash}, fn)
            })
        }
    }
}
