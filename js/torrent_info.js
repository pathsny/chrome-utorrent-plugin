function torrentInfo(torrent) {
    var percent = torrent[4]/10;
    var status = getStatus(torrent[1], percent);
    return {
    hash: torrent[0],
    percent: percent,
    status: status,
    name: getName(torrent[2]),
    size: getSize(torrent[3]),
    downloaded: getSize(torrent[5]),
    uploaded: getSize(torrent[6]),
    ratio: torrent[7]/1000,
    upload_speed_in_bytes: parseInt(torrent[8]),
    upload_speed: getSpeed(torrent[8]),
    download_speed_in_bytes: parseInt(torrent[9]),
    download_speed: getSpeed(torrent[9]),
    eta: (percent == 100) ? "-" : dateHMS(torrent[10]),
    label: torrent[11],
	peers_connected: torrent[12],
	peers_swarm: torrent[13],
	seeds_connected: torrent[14],
	seeds_swarm: torrent[15],
	availability: torrent[16],
	torrent_queue_order: torrent[17],
	remaining: torrent[18],
	actions: getActionWithTitle(status.actions)
   }
}

function getGlobalSpeeds(torrents){
    var speeds = ['download', 'upload'].map(function(type){
	    return getSpeed(torrents.reduce(function(speed, torrent){
            return speed + torrent[type + '_speed_in_bytes'];
            },0))
        })
    return {dl: speeds[0], ul: speeds[1]};  	
}


function getStatus(status, percent) {
	switch (status)
	{
		case 128 : 
		    return { status_text: "check required",
			status_image: "arrow_yellow.png",
			status_bar: "bar_yellow.jpg",
			actions: ["recheck"]}
			
		case 130 : 
			return { status_text: "force checking",
			status_image: "arrow_yellow.png",
			status_bar: "bar_yellow.jpg",
			actions: []}
			
		case 134 :
			return { status_text: "[F]force check'",
			status_image: "arrow_yellow.png",
			status_bar: "bar_yellow.jpg",
			actions: []}
			
		case 136 :
			if (percent == 100)
			{
				return { status_text: "finished",
				status_image: "bar_done.png",
				status_bar: "bar_green.jpg",
				actions: ['forcestart', 'start', 'recheck']}
			}
			else
			{
				return { status_text: "stopped",
				status_image: "arrow_red.png",
				status_bar: "bar_red.jpg",
				actions: ['forcestart', 'start', 'recheck']}
			}
		case 137 :
			if (percent == 100)
			{
				return { status_text: "[F]seeding",
				status_image: "arrow_blueF.png",
				status_bar: "bar_blue.jpg",
				actions: ['stop', 'recheck']}
			}
			else
			{
				return { status_text: "[F]downloading",
				status_image: "arrow_greenF.png",
				status_bar: "bar_green.jpg",
				actions: ['stop', 'recheck']}
			}
			
		case 152 :
			return { status_text: "space missing",
			status_image: "arrow_red.png",
			status_bar: "bar_red.jpg",
			actions: ['recheck']}
    		
		case 162 :
			return { status_text: "checking paused",
			status_image: "arrow_yellow.png",
			status_bar: "bar_yellow.jpg",
			actions: ['unpause']}
    		
		case 194 :
			return { status_text: "checking",
			status_image: "arrow_yellow.png",
			status_bar: "bar_yellow.jpg",
			actions: ['pause']}
			
		case 200 :
			return { status_text: "queued",
			status_image: "arrow_yellow.png",
			status_bar: "bar_yellow.jpg",
			actions: ['forcestart']}
			
		case 201 :
			if (percent == 100)
			{
				return { status_text: "seeding",
				status_image: "arrow_blue.png",
				status_bar: "bar_blue.jpg",
				actions: ['forcestart', 'stop', 'pause', 'recheck']}
			}
			else
			{
				return { status_text: "downloading",
				status_image: "arrow_green.png",
				status_bar: "bar_green.jpg",
				actions: ['forcestart', 'stop', 'pause', 'recheck']}
			}
			
		case 226 :
			return { status_text: "??",
			status_image: "arrow_yellow.png",
			status_bar: "bar_yellow.jpg",
			actions: ['stop', 'recheck']}
			
		case 233 :
			return { status_text: "paused",
			status_image: "arrow_yellow.png",
			status_bar: "bar_yellow.jpg",
			actions: ['forcestart', 'stop', 'unpause', 'recheck']}
			
		default:
			return { status_text: "N/A",
			status_image: "arrow_green.png",
			status_bar: "bar_green.jpg",
			actions: []}
	}
}

function getName(name) {
	return (name.length > 40) ? name.substr(0,37) + "..." : name;
}

function humanFriendlySize(size, types) {
    if (size === 0) return "-";
    var last = types[types.length-1];
    return types.reduce(function(size, type){
        if (isNaN(size)) return size;
        if ((size < 1024) || type == last) return ((size === parseInt(size,10)) ? size : size.toFixed(2)) + type;
        return size/1024;
    },parseInt(size));
}

function getSize(size) {
    return humanFriendlySize(size, [" o", " Ko", " Mo", " Go"]);
}

function getSpeed(size) {
    return humanFriendlySize(size, [" o/s"," Ko/s"," Mo/s"," Go/s"]);
}

function getActionWithTitle(actions) {
    return [['forcestart', 'Force start'], ['start', 'Start'], ['stop', 'Stop'], ['pause', 'Pause'], 
	['unpause', 'Unpause'], ['recheck', 'Force recheck']].filter(function(actionInfo){
		return actions.indexOf(actionInfo[0]) !== -1;
	}).map(function(actionInfo){
	    return {action: actionInfo[0], title: actionInfo[1]}
	})
}

function dateHMS(time)
{
	if (time == 0)
		return "-";
	var addZero = function(v) { return v<10 ? '0' + v : v; };
	var d = new Date(time * 1000); // js fonctionne en milisecondes
	var t = [];
	t.push(addZero(d.getHours())-1);
	t.push(addZero(d.getMinutes()));
	t.push(addZero(d.getSeconds()));
	return t.join(':');
}

