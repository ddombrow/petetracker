var albumData = {
	userId: 'peterhufford',
	albumId: '5734644165704968193',
	albumName: 'PeteSATThruHike2012'
};

function AlbumTracker(info) {
	var request = require('request');
	var xml2js = require('xml2js');
	var fs = require('fs');
	var albumInfo = info;
	var albumXml = "";
	var photos = new Array();

	this.run = function() {
		getAlbumXml();
	};

	var getAlbumUrl = function() {
		var urlBuilder = new Array();
		urlBuilder.push("http://picasaweb.google.com");
		urlBuilder.push("/data/feed/api/user/");
		urlBuilder.push(albumInfo.userId);
		urlBuilder.push("/albumid/");
		urlBuilder.push(albumInfo.albumId);
		return urlBuilder.join('');
	};

	var getPicasaLink = function(photoId) {
		var urlBuilder = new Array();
		urlBuilder.push("https://picasaweb.google.com");
		urlBuilder.push("/");
		urlBuilder.push(albumInfo.userId);
		urlBuilder.push("/");
		urlBuilder.push(albumInfo.albumName);
		urlBuilder.push("#");
		urlBuilder.push(photoId);
		return urlBuilder.join('');
	};

	var getAlbumXml = function() {
		var processRequest = function(error, response, body) {
			if (!error && response.statusCode == 200) {
				albumXml = body;
				processAlbumXml();
			}
		};
		request(getAlbumUrl(), processRequest);
	};

	var processAlbumXml = function() {
		//console.log(albumXml);
		var xmlParser = new xml2js.Parser();

		var afterParsing = function(err, result) {
			//console.dir(result.entry);

			var getPhotoObj = function(photo) {
				//console.dir(photo);
				var point = [0,0];
				if (photo['georss:where']) {
					point = photo['georss:where']['gml:Point']['gml:pos'].split(' ');
				}
				
				var src = photo.content['@'].src;
				var caption  = photo['media:group']['media:description']['#'];

				var photoObj = {
					id: photo['gphoto:id'],
					timestamp: photo['gphoto:timestamp'],
					src: src,
					link: getPicasaLink(photo['gphoto:id']),
					fileName: src.substr(src.lastIndexOf("/") + 1).replace("%25", ' '),
					point: { lat: point[0], lon: point[1] }
				}

				var thumbs = photo['media:group']['media:thumbnail'];
				for (var t = 0; t < thumbs.length; t++) {
					var thumb = thumbs[t]['@'].url;
					photoObj['thumb' + (t+1) + 'src'] = thumb;
				}
				if (caption) {
					photoObj.caption = caption;
				}
				else {
					photoObj.caption = "";
				}
				
				return photoObj;				
			};

			var photoArray = result.entry;
			//console.dir(result.entry);
			if (photoArray.length) {
				for (var i = 0; i < photoArray.length; i++) {
					var photoObj = getPhotoObj(photoArray[i]);
					photos.push(photoObj);
				}
			}
			else {
				var p = getPhotoObj(result.entry);
				photos.push(p);
			}

			photos.sort(function(a,b) {
				return b.timestamp - a.timestamp;
			});
			writeScriptFile();
		};

		xmlParser.parseString(albumXml, afterParsing);
	};

	var writeScriptFile = function() {
		var fileBuilder = new Array();
		fileBuilder.push("var g_albumData = ");
		fileBuilder.push(JSON.stringify(photos));
		fileBuilder.push(";");
		fs.writeFile('../albumData.js', fileBuilder.join(''), function(err) {
				if (err) {
					console.log(err);
				}
			}
		);
	}
}

var albumTracker = new AlbumTracker(albumData);
albumTracker.run();

