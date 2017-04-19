var getProjects = function (encodeString,myMap) {
    var res = {
        "filters": {
            "and": []
        },
        "paging": {
            "start": 0,
            "rows": 100
        },
        "fields": []
    };
    res = JSON.stringify(res);
    var path = encodeString;
    var propLink = `https://www.makaan.com/petra/app/v4/listing?selector=${res}&gep=${path}&sourceDomain=Makaan`;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", propLink, false);
    xhr.send();
    var response = JSON.parse(xhr.response);
    console.log(response);
    var projectList = response.data[0].facetedResponse.items;
    var totalCount = response.data[0].totalCount;
    var projectLatLng=[],finalProjectLatLng=[];
    for (var i = 0; i<projectList.length;i++){
        var project={};    
        project['lat'] = projectList[i].listing.listingLatitude;
        project['lng'] = projectList[i].listing.listingLongitude;
        project['desc']= projectList[i].listing.resaleURL;
        project['name']= projectList[i].listing.property.unitName+" "+projectList[i].listing.property.unitType; 
        projectLatLng.push(project);
    }
    console.log(projectLatLng);
    plotProjects(projectLatLng,myMap,totalCount);
    
}