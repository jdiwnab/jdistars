function calcXY(ra, dec, lat, log, lst, r) {
  //Calc the Hour Angle
  var HourAngle = lst - ra*15;
  //Set to between 0 and 360
  if(HourAngle < 0) {
  HourAngle += 360;
  } else if(HourAngle >360) {
    HourAngle - 360;
  }
  //Calc altitude
  var altitude = rad2Deg(Math.asin(Math.sin(deg2Rad(dec))*Math.sin(deg2Rad(lat)) + Math.cos(deg2Rad(dec)) * Math.cos(deg2Rad(lat)) * Math.cos(deg2Rad(HourAngle))));
  //Calc Azimuth
  var a = rad2Deg(Math.acos((Math.sin(deg2Rad(dec)) - Math.sin(deg2Rad(altitude))*Math.sin(deg2Rad(lat)))/(Math.cos(deg2Rad(altitude))*Math.cos(deg2Rad(lat)))));
  if(Math.sin(deg2Rad(HourAngle)) <0) {
    var Azimuth = a;
  } else {
    var Azimuth = 360-a;
  }
  var polarDist = (90 - altitude)/90;
  var polarAngle = 0;
  if(-(Azimuth - 90) < 0) { polarAngle = -(Azimuth - 90) + 360; }
  else { polarAngle = -(Azimuth - 90); }
	
  var x = Math.cos(deg2Rad(polarAngle)) * polarDist * r;
  var y = Math.sin(deg2Rad(polarAngle)) * polarDist * r;
  return {"x": x, "y": y};
}