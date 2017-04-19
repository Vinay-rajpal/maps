function fetch (origin, destination){
  var originLatLng = new google.maps.LatLng(origin.latitude, origin.longitude);
  var destLatLng = new google.maps.LatLng(destination.latitude, destination.longitude);
  var response;
  var request = {
    origins: [originLatLng],
    destinations: [destLatLng],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  };
  return new Promise( function (resolve, reject) {
    var distanceMatrix = new google.maps.DistanceMatrixService(); 
    distanceMatrix.getDistanceMatrix(request, function(results, status) {
      if (status === google.maps.DistanceMatrixStatus.OK) {
        response = {
          status: 'OK',
            results: results
        };
        resolve(response);
      }else{
        response = {
          status: 'ERROR',
          msg: 'Error fetching results'
        }
        reject(response);
      }
    });
  })
};

