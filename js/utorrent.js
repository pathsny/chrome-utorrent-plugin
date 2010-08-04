function isset(variable)
{
    return (typeof variable != 'undefined');
}

function Server() {
    var self = this;
    $.each(["ip", "alt_ip", "port", "login", "password"], function(i, item){
        self[item] = localStorage["utorrent_" + item];
    })
}

Server.prototype = {
    get pref_ip() {
        if (!isset(this._pref_ip)) {
            if (!isset(localStorage.utorrent_pref_ip)) {
                localStorage.utorrent_pref_ip = this.ip;
            }
            this._pref_ip = localStorage.utorrent_pref_ip; 
        }
        return this._pref_ip;
    },
    set pref_ip(val) {
      this._pref_ip = val;  
    },
    save_pref_ip: function() {
        localStorage.utorrent_pref_ip = this.pref_ip;
    },
    alt_ip_exists: function() {
        return this.pref_ip === localStorage.utorrent_pref_ip && isset(this.alt_ip) && this.alt_ip !== '';
    },
    toggle_pref: function() {
        return this.pref_ip = (this.ip === this.pref_ip) ? this.alt_ip : this.ip; 
    },
    restore_pref_ip: function() {
        this.pref_ip = localStorage.utorrent_pref_ip;
    },
    get baseUrl() { return "http://" + this.pref_ip+":"+this.port+"/gui/"; },
    get not_configured() { return !isset(this.ip)}
}

function setupUtorrent(errorFn) {
    var server = new Server();
    if (server.not_configured)
    {
        $notify.txt("Error!", "This extension has not been configured!")
        chrome.tabs.create({url:'chrome-extension://'+location.hostname+'/options.html'});        
        return {not_configured: true}
    }

    var token_val;

    $.ajaxSetup({timeout: 5000,username: server.login, password: server.password, error: function(){
        console.log('tbntebe')
        delete token_val;
        errorFn();
        }});

    var withToken = function(fn) {
        console.log('with token');
        console.log(fn);
        if (isset(token_val)) {
            console.log('if')
            fn(token_val);
        } 
        else {
            console.log('else')
            $.ajax({
                url: server.baseUrl + "token.html",
                success: function(data) {
                    console.log('suc')
                    console.log(arguments);
                    token_val = $(data).text();
                    server.save_pref_ip();
                    fn(token_val); 
                }
                    // ,
                    // error: function(){
                    //     console.log('error')
                    //     if (server.alt_ip_exists()) {
                    //         server.toggle_pref();
                    //         return withToken(fn);
                    //     }
                    //     server.restore_pref_ip();
                    //     errorFn();
                    // }   
            })
        }
    }

    var get = function(data, fn) {
        withToken(function(token) {
            console.log(token);
            $.getJSON(server.baseUrl, $.extend({token: token}, data), fn);
        })
    }

    return {
        getTorrents: function(fn) { get({list: 1}, fn) },
        perform: function(action, hash, fn) { get({action: action, hash: hash}, fn) },
        upload: function(url, fn) {get({action: "add-url", s: url}, fn)}
    }
}
