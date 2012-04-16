function PeteTracker() {

	var createMap = function() {
		var bingKey = 'Aq03O-RX8OEt8gmmJ1UOTg-QommONN2pzIMLtQ4pM6pve9HRJ6MGG9QTRls6okci';

		var map = new OpenLayers.Map({
		    div: "map",
		    layers: [
		        new OpenLayers.Layer.Bing({ key: bingKey, type: 'Road', name: 'Road Map'}),
		        new OpenLayers.Layer.Bing({ key: bingKey, type: 'AerialWithLabels', name: "Aerial View w/ Labels"}),
		        new OpenLayers.Layer.Bing({ key: bingKey, type: 'Aerial', name: 'Aerial View'})
		    ],
		    controls: [
		        new OpenLayers.Control.Navigation({
		            dragPanOptions: {
		                enableKinetic: true
		            }
		        }),
		        new OpenLayers.Control.PanZoom(),
		        new OpenLayers.Control.LayerSwitcher(),
		        new OpenLayers.Control.Attribution()
		    ],
		    center: [0, 0],
		    zoom: 3
		});
		map.setCenter(
			new OpenLayers.LonLat(-77.73, 39.32).transform(
				new OpenLayers.Projection("EPSG:4326"),
				map.getProjectionObject()
			), 6
		);

		var atgpx = new OpenLayers.Layer.GML("The Appalachian Trail", "AT500.gpx", {
					format: OpenLayers.Format.GPX,
					style: {strokeColor: "yellow", strokeWidth: 4, strokeOpacity: 0.5},
					projection: new OpenLayers.Projection("EPSG:4326")
				});
		map.addLayer(atgpx);

		markers = new OpenLayers.Layer.Markers( "Pete's photos" );
		map.addLayer(markers);
		
		var size = new OpenLayers.Size(32,55);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		var peteIcon = new OpenLayers.Icon('img/petemarker1.png',size,offset);

		var addPhotoFeatures = function() {
			for(var i = 0; i < g_albumData.length; i++) {
				var photo = g_albumData[i];
				if (photo.point.lon != 0 || photo.point.lat != 0) {
					var lonlat = new OpenLayers.LonLat(photo.point.lon,photo.point.lat).transform(
				        new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				        map.getProjectionObject() // to Spherical Mercator Projection
				      );
					//console.log(lonlat);
					var peteMarker = new OpenLayers.Marker(lonlat,peteIcon.clone());
					peteMarker.photoId = photo.id;
					peteMarker.events.register('mousedown', peteMarker, 
						function(evt) 
						{ 
							$('#' + this.photoId).click(); 
							OpenLayers.Event.stop(evt); 
						}
					);
					peteMarker.events.register('mouseover', peteMarker,
						function(e) {
							var getScrollTop = function(id) {
								var st = $('#info_' + id).position().top;
								//console.log(test);
								return st;
							}
							$('#' + this.photoId).css({border: 'solid #000000 1px'});
							$('#sidebar').animate({scrollTop: getScrollTop(this.photoId) },'ease');
							$('#info_' + this.photoId).css({'background-color': '#FFF000'});
						}
					);
					peteMarker.events.register('mouseout', peteMarker,
						function(e) {
							$('#' + this.photoId).css({border: 'solid #CCCCCC 1px'});
							$('#info_' + this.photoId).css({'background-color': ''});
						}
					);
					markers.addMarker(peteMarker);
				}
			}
		};
		
		addPhotoFeatures();
	};
	
	var createSideBar = function() {
		$('#sidebar').append("<h1>The Pete Tracker</h1>");

		for(var i = 0; i < g_albumData.length; i++) {
			var photo = g_albumData[i];
			var formattedDate = new Date(parseInt(photo.timestamp,10)).toString();
			var title;
			if (photo.caption) {
				title = photo.caption;
			}
			else {
				title = "Picture taken on " + formattedDate + ".";
			}

			var html = new Array();
			html.push("<a class='fancybox' rel='group' href='" + photo.src + "' title='" + title + "'>")
			html.push("<img class='photo' id='" + photo.id + "' src ='" + photo.thumb1src + "' />");
			html.push("</a>");
			html.push("<div id='info_" + photo.id + "' class='photobox'>");
			if (photo.caption) {
				html.push("\"" + photo.caption + "\"<br/>");
			}
			html.push("File: " + photo.fileName + "<br/>");

			if (photo.point.lon != 0 || photo.point.lat != 0) {
				html.push(" LatLon: " + photo.point.lat + ", " + photo.point.lon + "<br/>");
			}
			else {
				html.push(" Location not available. <br/>");
			}
			html.push(formattedDate + "<br/>");
			html.push(" <a href=" + photo.link + ">View in Picasa</a>")
			html.push("</div>");


			$('#sidebar').append(html.join(''));
		}
		$('.photo').hover(
			function(e) {
				var target = e.target;
				target.style.border = 'solid #000000 1px';
				for (var c = 0; c < markers.markers.length; c++) {
					var m = markers.markers[c];
					if (m.photoId == target.id) {
						//m.icon.imageDiv.style.border = 'solid #000000 1px';
						m.inflate(1.05);
					}
				}
			},
			function(e) {
				var target = e.target;
				target.style.border = 'solid #CCCCCC 1px';
				for (var c = 0; c < markers.markers.length; c++) {
					var m = markers.markers[c];
					if (m.photoId == target.id) {
						//m.icon.imageDiv.style.border = '';
						m.inflate(1/1.05);
					}
				}
			}
		);
		$(".fancybox").fancybox();
		$('#handle').click(
			function(e) {
				var target = e.target;
				var handleState = $('#handle').attr("src");

				if (handleState.indexOf("in") > 0) {
					$('#handle').attr("src", "img/out.png");
					$('#sidebar').hide();
				}
				else {
					$('#handle').attr("src", "img/in.png");
					$('#sidebar').show();
				}

				
			}
		);
	};

	createMap();
	createSideBar();
}