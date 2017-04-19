function plotMap(path1,path2,fsource,ssource,myMap){
  var firstArea = new google.maps.Polygon({
    paths: path1,
    strokeColor: '#00FF00',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#00FF00',
    fillOpacity: 0.35
  });
  firstArea.setMap(myMap);
  var anotherArea = new google.maps.Polygon({
    paths: path2,
    strokeColor: '#0000FF',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#0000FF',
    fillOpacity: 0.35
  });
  anotherArea.setMap(myMap);
//calc polygons intersection
  var geometryFactory = new jsts.geom.GeometryFactory();
  var firstPolygon = createJstsPolygon(geometryFactory, firstArea);
  var anotherPolygon = createJstsPolygon(geometryFactory, anotherArea);
  var intersection = firstPolygon.intersection(anotherPolygon);
  drawIntersectionArea(myMap, intersection);
}

function drawIntersectionArea(myMap, polygon) {
  var coords = polygon.getCoordinates().map(function (coord) {
    return { lat: coord.x, lng: coord.y };
  });
  if(coords.length==0){
    alert(" No comon area . Refine your search");
  }
  else{
    var intersectionArea = new google.maps.Polygon({
      paths: coords,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });
    intersectionArea.setMap(myMap);
    var path = intersectionArea.getPath();
    var encodeString = google.maps.geometry.encoding.encodePath(path);
    getProjects(encodeString,myMap);
    var bounds = new google.maps.LatLngBounds();
    var i;
    for (i = 0; i < coords.length; i++) {
      bounds.extend(coords[i]);
    }
    myMap.fitBounds(bounds);
  }
}
function createJstsPolygon(geometryFactory, polygon) {
  var path = polygon.getPath();
  var coordinates = path.getArray().map(function name(coord) {
    return new jsts.geom.Coordinate(coord.lat(), coord.lng());
  });
  if(coordinates[0].compareTo(coordinates[coordinates.length-1]) != 0) 
      coordinates.push(coordinates[0]);
  var shell = geometryFactory.createLinearRing(coordinates);
  return geometryFactory.createPolygon(shell);
}
function plotProjects(finalProjectLatLng,myMap,totalCount){
  var icon = {
        url: "./house.png",
        scaledSize: new google.maps.Size(20, 20)
    };
    var markers = [];
    var infoWindows = [];
    for(var i=0;i<finalProjectLatLng.length;i++){
        var marker = new google.maps.Marker({
        position: {lat:finalProjectLatLng[i].lat,lng:finalProjectLatLng[i].lng},
        icon: icon,
        infoWindowIndex : i,
        animation : google.maps.Animation.DROP,
        map: myMap
      });

        var location = "https://www.makaan.com//"+finalProjectLatLng[i].desc;
        var name = finalProjectLatLng[i].name;
        var content = `<a href="#" onclick=window.open("${location}");> ${name}</a>`;
        var infoWindow = new google.maps.InfoWindow({
            content : content
        });
        google.maps.event.addListener(marker, 'click', function(event){
                infoWindows[this.infoWindowIndex].open(myMap, this);
            }
        );
        infoWindows.push(infoWindow);
        markers.push(marker);
    }
    alert(" Showing " +finalProjectLatLng.length+" projects out of "+ totalCount+" projects" )
}