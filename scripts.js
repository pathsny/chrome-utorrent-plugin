var $divs;
var $templates = {};

function displayError(xhr, error){
    console.log(error);
    $("#error").jqotesub($templates.error);
}

function loadTemplates(fn){
    ['action', 'error', 'torrents', 'no_torrents', 'speed'].reduce(function(acc_fn, template){
        return function() {
            $.get('templates/' + template + '.html.template', function(data){
                $templates[template] = $.jqotec(data);
                acc_fn();
            })
        }
    }, fn)();
}

function init()
{
    $utorrent = setupUtorrent(displayError);
    if ($utorrent.not_configured) {
        chrome.tabs.create({url:'chrome-extension://'+location.hostname+'/options.html'});
		$("#error").html("The extension is not configured.");
		return;
    }
    var render = function() {
        $utorrent.getTorrents(displayTorrents)
    } 

    $divs = {speed: $("#speed"), torrents: $("#torrents")};
	loadTemplates(function(){
	    render();
        setInterval(render, $utorrent.refresh);
	})
}


function perform(torrent, action) {
    var prfrm = function(a, fn) {
        $utorrent.perform(a, torrent.hash, fn);
    }
    if (action == 'recheck'){
        prfrm("stop", function(){
            prfrm("recheck");
        });
    } 
    prfrm(action);
}


// RECUPERER LES TORRENTS
////////////////////////

function displayTorrents(result) {
	var torrents = result.torrents.map(torrentInfo);

    torrents = torrents.map(function(torrent){
        return $.extend(torrent, {action_html: $.jqote($templates.action, torrent.actions)})
    })

	if (torrents.length > 0) {
	    $divs.torrents.jqotesub($templates.torrents, torrents);
        $divs.speed.jqotesub($templates.speed, getGlobalSpeeds(torrents));
    }		
	else {
	    $divs.torrents.jqotesub($templates.no_torrents, torrents);
	}

	torrents.forEach(attachClickHandlers)
}

function attachClickHandlers(torrent) {
    var torrent_div = $("#"+torrent.hash);
	var actions = ['start', 'stop'].filter(function(action){
	    return torrent.status.actions.indexOf(action) !== -1;
	})
	
	actions.forEach(function(action){
	    torrent_div.find("div.status_image > a, div.status > a").click(function(){
                perform(torrent, action)
        })
    }) 
    
    torrent_div.find("div.infos_actions").delegate('a', 'click', function(){
        perform(torrent, $(this).attr("class"))
    })
}

// CONVERSION DE L'HEURE
////////////////////////

function getProperties(token, hash)
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://"+login+":"+password+"@"+ip+":"+port+"/gui/?token="+token+"&action=getprops&hash="+hash, true);
	var requestTimer = setTimeout(function() {
	xhr.abort();
	}, refresh);
	xhr.send();
	xhr.onreadystatechange = function()
	{
		if (xhr.readyState == 4)
		{
			var result = "";
			result = xhr.responseText;
			
			var pos1 = result.indexOf("props");
			pos1 += 10;
			var pos2 = result.indexOf("]");
			pos2 -= 1;
			result = result.slice(pos1, pos2);
			
			var params = result.split(",");
			
			var hash2 = params[0].substr(9, params[0].length-11);
			var trackers = params[1].substr(13, params[1].length-15);
			var ulrate = params[2].substr(10, params[2].length);
			var dlrate = params[3].substr(10, params[3].length);
			var superspeed = params[4].substr(13, params[3].length);
			var dht = params[5].substr(7, params[5].length);
			var pex = params[5].substr(7, params[5].length);
			var seed_override = params[7].substr(17, params[7].length);
			var seed_ratio = params[8].substr(14, params[8].length);
			var seed_time = params[9].substr(13, params[9].length);
			var uslots = params[10].substr(11, params[10].length) ;
			
			result_info = "<div class='infos_titles'>";
			result_info += "up limit: <br/>";
			result_info += "dl limit: <br/>";
			result_info += "seed time: <br/>";
			result_info += "</div>";
			result_info += "<div class='infos_results'>" + ulrate + "<br/>" + dlrate + "<br/>" + seed_time + "<br/>";
			result_info += "</div>";
		}
	}
	return result_info;
}