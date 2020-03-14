function Star(ra, dec, mag, name) {
    this.ra = ra;
	this.dec = dec;
	this.mag = mag;
	this.name = name;
	if(mag<0) { this.size=4.5; }
	else if(mag < 1) { this.size=4; }
	else if(mag < 2) { this.size=3.5; }
	else if(mag < 3) { this.size=3; }
	else if(mag < 4) { this.size=2; }
	else if(mag < 5) { this.size=1.5; }
	else { this.size=1; };
    this.calcHourAngle = function(lst, ra){
	  this.HourAngle = lst - ra*15;
	  //Set to between 0 and 360
	  if(this.HourAngle < 0) {
	    this.HourAngle += 360;
	  } else if(this.HourAngle >360) {
	    this.HourAngle - 360;
	  }
	}
	this.calcAltitude = function(dec, lat) {
	  this.altitude = rad2Deg(Math.asin(Math.sin(deg2Rad(dec))*Math.sin(deg2Rad(lat)) + Math.cos(deg2Rad(dec)) * Math.cos(deg2Rad(lat)) * Math.cos(deg2Rad(this.HourAngle))));
	}
	this.calcAzimuth = function(alt, dec, lat) {
	  var a = rad2Deg(Math.acos((Math.sin(deg2Rad(dec)) - Math.sin(deg2Rad(alt))*Math.sin(deg2Rad(lat)))/(Math.cos(deg2Rad(alt))*Math.cos(deg2Rad(lat)))));
	  if(Math.sin(deg2Rad(this.HourAngle)) <0) {
	    this.Azimuth = a;
	  } else {
	    this.Azimuth = 360-a;
	  }
	}
	this.calcAltAz = function(lat,log,lst) {
	  this.calcHourAngle(lst, this.ra);
	  this.calcAltitude(this.dec, lat, this.hourAngle);
	  this.calcAzimuth(this.altitude, this.dec, lat, this.hourAngle);
	}
	this.calcXY = function(lat,log,lst,r) {
	  this.calcAltAz(lat,log,lst);
	  var polarDist = (90 - this.altitude)/90;
	  var polarAngle = 0;
	  if(-(this.Azimuth - 90) < 0) { polarAngle = -(this.Azimuth - 90) + 360; }
	  else { polarAngle = -(this.Azimuth - 90); }
	  
	  this.x = Math.cos(deg2Rad(polarAngle)) * polarDist * r;
	  this.y = Math.sin(deg2Rad(polarAngle)) * polarDist * r;
	}
  }