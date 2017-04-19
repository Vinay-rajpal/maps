var getProjects = function (lat, lon, minDistance, maxDistance,coords,myMap) {
    if(maxDistance > 50000){
        maxDistance = 50000;
    }
    var res = {
        "filters": {
            "and": [
                {
                    "geoDistance": {
                        "geo": {
                            "distance": parseFloat(maxDistance/1000),
                            "lat": lat,
                            "lon": lon,
                            "minDistance": parseFloat(minDistance)
                        }
                    }
            }]
        },
        "paging": {
            "start": 0,
            "rows": 200
        },
        "fields": []
    };
    var selectorObj = JSON.stringify(res);
    var propLink = "https://www.proptiger.com/app/v2/project-listing?selector=";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", propLink + selectorObj, false);
    xhr.send();
    var response = JSON.parse(xhr.response);
    console.log(response);
    var projectList = response.data.items;
    var totalCount = response.totalCount;
    var count = 200;
    var projectCount = 0;
    var projectLatLng=[],finalProjectLatLng=[];
    for (var i = 0; i<projectList.length;i++){
        var project={};    
        project['lat'] = projectList[i].latitude;
        project['lng'] = projectList[i].longitude;
        project['desc']= projectList[i].URL;
        project['name']= projectList[i].name; 
        projectLatLng.push(project);
    }
    console.log(projectLatLng);
    
    for(var i=0;i<projectLatLng.length;i++){
        var inPoly = inside(projectLatLng[i],coords);
        if(inPoly)
            finalProjectLatLng.push(projectLatLng[i]);
    }
    projectCount = finalProjectLatLng.length;
    console.log(finalProjectLatLng);
    while(projectCount<=20 && count<totalCount){
        res.paging.start = count;
        var selectorObj = JSON.stringify(res);
        xhr.open("GET", propLink + selectorObj, false);
        xhr.send();
        var response = JSON.parse(xhr.response);
        console.log(response);
        var projectList = response.data.items;
        count = count +200;
        projectLatLng  = [];
    for (var i = 0; i<projectList.length;i++){
        var project={};    
        project['lat'] = projectList[i].latitude;
        project['lng'] = projectList[i].longitude;
        project['desc']= projectList[i].URL;
        project['name']= projectList[i].name; 
        projectLatLng.push(project);
    }
    console.log(projectLatLng);
    
    for(var i=0;i<projectLatLng.length;i++){
        var inPoly = inside(projectLatLng[i],coords);
        if(inPoly)
            finalProjectLatLng.push(projectLatLng[i]);
    }
    projectCount = finalProjectLatLng.length;
}
plotProjects(finalProjectLatLng,myMap,totalCount);
    
}
function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point.lat, y = point.lng;

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].lat, yi = vs[i].lng;
        var xj = vs[j].lat, yj = vs[j].lng;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};
