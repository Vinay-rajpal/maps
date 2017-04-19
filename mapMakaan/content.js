var directions = [
  {
    direction: 'EAST',
    lat: +0.5,
    lng: 0
  }, {
    direction: 'WEST',
    lat: -0.5,
    lng: 0
  }, {
    direction: 'NORTH',
    lat: 0,
    lng: +0.5
  }, {
    direction:  'SOUTH',
    lat: 0,
    lng: -0.5
  }
];
var  timeSequence =  [];
var myMap,timeFound = "yes",oldDestination={};
var  faddress,saddress,fsource={},ssource={};  
var path1=[],path2=[];          
var travelTimeFlag;
Math.log2 = Math.log2 || function (num) {
  return (Math.log(num) / Math.log(2));
}
var timeLimits={};
function initMap() {
var india = {lat: 21.0000, lng: 78.0000};
myMap = new google.maps.Map(document.getElementById('map'), {
  zoom: 4,
  center: india
});
var marker = new google.maps.Marker({
  position: india,
  map: myMap
});
var options = {
  componentRestrictions: {country:['IN']},
};
 var finput = document.getElementById('faddress');
 var sinput = document.getElementById('saddress');
 var fautocomplete = new google.maps.places.Autocomplete(finput,options);
 var sautocomplete = new google.maps.places.Autocomplete(sinput,options);
}
function getStarted(){
  faddress = document.getElementById( 'faddress' ).value;
  saddress = document.getElementById( 'saddress' ).value;
  findLatLong(0,faddress)
  timeSequence=[{
    time: parseInt(document.getElementById('fTimeHr').value*60) + parseInt(document.getElementById('fTimeMin').value),
    degree: Math.PI /12 
    },{
    time:parseInt(document.getElementById('sTimeHr').value*60)+parseInt(document.getElementById('sTimeMin').value),
    degree:Math.PI /12
    }
  ];
 }
function findLatLong(index,address){
  geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address' : address }, function( results, status ) {
    if( status == google.maps.GeocoderStatus.OK ) {
      var lat =results[0].geometry.location.lat();
      var long = results[0].geometry.location.lng();
      alert("Lat: " + lat +"  long: "+ long ); 
      var source = {
        latitude : lat,
        longitude : long
      };
      if(index==0)
        fsource = source;
      else
        ssource = source;
       preProcessResults(index,source);;  
    }else {
      alert('Geocode was not successful for the following reason: ' + status );
      return{};
    }
  });
}
function preProcessResults(index,source){
  var mPromises=[];
  for(i=0, len=directions.length; i<len; i++) {
  var destination = {
      latitude : source.latitude + directions[i].lat,
      longitude : source.longitude + directions[i].lng
    }
    mPromises.push(fetch(source, destination));
  }
  
  Promise.all(mPromises).then(function(responses){
      processResults(index,responses,source);
  },function(error){
      console.log("Unable to comment due to "+error);
  });
}  
function processResults(index,responses,source){
  var m = 0;
  var inverseSum = 0;
  var result;
  var time=0;
  var responsesCount = 0;
  travelTimeFlag = true;
  for (j = 0, len = responses.length; j < len; j++) {
    if (responses[j].status === 'OK') {
        //Take all the times values and add their inverse time 
        //to get the distance covered in one time minunte.
      if (responses[j].results.rows[0].elements[0].duration) {
        result = responses[j].results.rows[0].elements[0].duration.text.split(" ");
        if (result.length === 4) {
          time = parseInt(result[0]) * 60 + parseInt(result[2]);
        }else {
          time = parseInt(result[0]);
        }
        if (time) {
        inverseSum = inverseSum + 1 / time;
        }
        responsesCount = responsesCount + 1;
      }
    }
  }
  if (!responsesCount) {
  return;
  }
  m = 0.5* inverseSum / responsesCount;
  processTimeHeatMapTime(index, source, m);
}

function processTimeHeatMapTime(configIndex, source, m,map) {
  var angInc=0;
  var timeLimit;
  angInc = timeSequence[configIndex].degree;
  timeLimit = timeSequence[configIndex].time; 
  console.log(timeLimit);
  oldDestination.latitude = source.latitude;
  oldDestination.longitude= source.longitude; 
  initPts(source, timeLimit, 0, angInc, m, configIndex); //Intial angle is 0 radians.
}
function initPts(source, timeLimit, ang, angInc, m, configIndex) {
  var l;
  var destination;
  var coordArr;
  var coord;
  var timeLimitValue;
  if (ang < 2 * Math.PI) {
    l = timeLimit * m * 0.8;
    destination = {
      latitude: source.latitude + l * Math.cos(ang),
      longitude: source.longitude + l * Math.sin(ang)
    };
    calculateDistanceDrive(source, destination, timeLimit, ang, angInc, m, configIndex, 0);
  }else {
    
    if(configIndex==0){
      for(var j in timeLimits[0]){
        var newobj={};    
        newobj['lat'] = timeLimits[0][j].latitude;
        newobj['lng'] = timeLimits[0][j].longitude;
        path1.push(newobj);
      }
      findLatLong(1,saddress);
    }
    else{
      for(var j in timeLimits[1]){
        var newobj={};    
        newobj['lat'] = timeLimits[1][j].latitude;
        newobj['lng'] = timeLimits[1][j].longitude;
        path2.push(newobj);
      }
      plotMap(path1,path2,fsource,ssource,myMap);
    }
  }
}



function calculateDistanceDrive(source, destination, timeLimit, ang, angInc, m, configIndex, repeatCount) {
  console.log(destination);
  console.log(oldDestination);
  fetch(source, destination).then(function (response) {
    if (response.status === 'ERROR') {
    //travelTimeDefer.reject(response);
    return;
    }else if (!response.results.rows[0].elements[0].duration) {
      console.log("No time duration found")
          destination = {
          latitude: (destination.latitude + oldDestination.latitude) / 2,
          longitude: (destination.longitude +oldDestination.longitude) / 2
          }
          if(timeFound == "yes"){
            timeFound  = "no";
            calculateDistanceDrive(source, destination, timeLimit, ang, angInc, m, configIndex,0);
          }
          else{
            calculateDistanceDrive(source, destination, timeLimit, ang, angInc, m, configIndex, repeatCount+1);
          }
      }else {
        var result;
        var time;
        result = response.results.rows[0].elements[0].duration.text.split(" ");
        if (result.length === 4) {
          time = parseInt(result[0]) * 60 + parseInt(result[2]);
        }else {
          time = parseInt(result[0]);
        }
        
        calculateEndPoints(time, timeLimit, source, destination, ang, angInc, m, configIndex, repeatCount);
    }
  });
}
function calculateEndPoints(time, timeLimit, source, destination, ang, angInc, m, configIndex, repeatCount) {
  var factor = Math.log2(time - timeLimit);
  var l;
  console.log(time);
  var timeDiff = time - timeLimit;
  var absTimeDiff = Math.abs(timeDiff);
  if (travelTimeFlag) {
  if (timeDiff > 2) {
    if(timeLimit <= 15) {
      factor = 1;
    }else {
      factor = Math.log2(time - timeLimit);
    }
    l = m * factor;
    destination.latitude = destination.latitude - l * Math.cos(ang);
    destination.longitude = destination.longitude - l * Math.sin(ang);
    setTimeout(function () {
      calculateDistanceDrive(source, destination, timeLimit, ang, angInc, m, configIndex, repeatCount);
    }, 100);
  }else {
    if(absTimeDiff > 2){
      console.log("Changing oldDestination")
      oldDestination.latitude = destination.latitude;
      oldDestination.longitude=destination.longitude;
      if(repeatCount <= 4) {
        factor = Math.log2(absTimeDiff);
          l = m * factor;
            destination.latitude = destination.latitude + l* Math.cos(ang);
            destination.longitude = destination.longitude + l*Math.sin(ang);
            setTimeout(function(){
              calculateDistanceDrive(source, destination, timeLimit, ang, angInc, m, configIndex, repeatCount+1);
            }, 100);
        return;
      }else{
        destination.latitude = destination.latitude + 2*m*Math.cos(ang);
        destination.longitude = destination.longitude + 2*m*Math.sin(ang);
      }
    }

  timeLimits[configIndex] = timeLimits[configIndex] || [];
  console.log("Push");
  console.log(destination);
  timeLimits[configIndex].push(destination);
  ang += angInc;
  if(timeFound=="no"){timeFound = "yes";}
  oldDestination.latitude = source.latitude;
  oldDestination.longitude= source.longitude;  
  initPts(source, timeLimit, ang, angInc, m, configIndex);
  }
}
}
