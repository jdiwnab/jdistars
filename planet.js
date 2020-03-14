  function Planet(iName, iColor, iHalfaxis, iEccentricy, iInclination, iNodes, iPNodes, iOrigin, iPeriLat, iPeriVariation, iMeanAnonomly, iMeanMotion) {

    this.name=iName;
    this.color=iColor
	this.halfAxis = iHalfaxis;
	this.eccentricy = iEccentricy;
	this.inclination = iInclination;
	this.nodes = iNodes;
	this.pnodes = iPNodes;
	this.origin = iOrigin;
	this.periLat = iPeriLat;
	this.periVariation = iPeriVariation;
	this.meanAnomaly = iMeanAnonomly;
	this.meanMotion = iMeanMotion;
	
    this.calcHourAngle = function(lst, ra){
	  this.HourAngle = (lst - ra*15) % 360;
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
	this.calcAltAz = function(lat,log,lst, D) {
	  this.calcRADec(D);
	  this.calcHourAngle(lst, this.ra);
	  this.calcAltitude(this.dec, lat, this.hourAngle);
	  this.calcAzimuth(this.altitude, this.dec, lat, this.hourAngle);
	}
	this.calcXY = function(lat,log,D,lst,r) {
	  this.calcAltAz(lat,log,lst,D);
	  var polarDist = (90 - this.altitude)/90;
	  var polarAngle = 0;
	  if(-(this.Azimuth - 90) < 0) { polarAngle = -(this.Azimuth - 90) + 360; }
	  else { polarAngle = -(this.Azimuth - 90); }
	  
	  this.x = Math.cos(deg2Rad(polarAngle)) * polarDist * r;
	  this.y = Math.sin(deg2Rad(polarAngle)) * polarDist * r;
	}	
	this.calcDate = function(D) {
	  //Get Julian Date
      var GGG = 1;
      if (D.getUTCFullYear() <= 1585) GGG = 0;
      //Julian Date
      this.JD = -1 * Math.floor(7 * (Math.floor(((D.getUTCMonth()+1) + 9) / 12) + D.getUTCFullYear()) / 4);
      var S = 1;
      if (((D.getUTCMonth()+1) - 9)<0) S=-1;
      var A = Math.abs((D.getUTCMonth()+1) - 9);
      var J1 = Math.floor(D.getUTCFullYear() + S * Math.floor(A / 7));
      J1 = -1 * Math.floor((Math.floor(J1 / 100) + 1) * 3 / 4);
      this.JD = this.JD + Math.floor(275 * (D.getUTCMonth()+1) / 9) + D.getUTCDate() + (GGG * J1);
      this.JD = this.JD + 1721027 + 2 * GGG + 367 * D.getUTCFullYear() - 0.5;
      this.JD = this.JD + ((D.getUTCHours() + D.getUTCMinutes()/60 + D.getUTCSeconds()/3600) / 24);
      this.J2=this.JD;
	}
	this.calcRADec = function(currDate) {
	  this.calcDate(currDate);
	  this.calcInitValues();
	  this.calcEarth();
	  this.calcPlanet();
	  this.calcGeocentric();
	  
	  //calculate right assention and declination
	  this.ra=Math.atan(this.Y/this.X);
	  this.ra=this.ra*12/Math.PI;
	  if (this.X<0) {
	    this.ra=this.ra+12;
      }
	  if (this.ra<0) {
	    this.ra=this.ra+24;
	  }
      
      this.dec=Math.atan(this.Z/Math.sqrt(this.X*this.X+this.Y*this.Y));
	  this.dec=rad2Deg(this.dec);

	}
	this.calcInitValues = function() {
	  //asignacion valores Tierra
	  this.PT=282.60402;
	  this.VPT=0.00471;
	  this.ET=0.016718;
	  this.NT=0.9856;
	  this.MT=155.9044;
	
	  //fechas julianas
	  this.J1=2444400.5;
	  this.F1=2415020.5;
	
      //obliquity to the ecleptic
	  this.U = (this.J2 - this.F1) / 365.2422;
	  this.OB=23.45229444-(0.46845*this.U+0.00000059*this.U*this.U)/3600;
	  this.OB=deg2Rad(this.OB);
    }
    this.calcEarth = function () {
      //Orbit of the earth
	  this.MT=this.MT+this.NT*(this.J2-this.J1);
	  this.MT=this.MT-Math.floor(this.MT/360)*360;
	  this.MT=deg2Rad(this.MT);
	  this.V2=this.MT+2*this.ET*Math.sin(this.MT)+1.25*this.ET*this.ET*Math.sin(2*this.MT);
	  this.V2=this.V2+(13*Math.sin(3*this.MT)-3*Math.sin(this.MT))*this.ET*this.ET*this.ET/12
	  this.R2=(1-this.ET*this.ET)/(1+this.ET*Math.cos(this.V2));


      //Coordinates of the earth
	  this.PT=deg2Rad(this.PT+this.VPT*(this.J2-this.J1)/100);
	  
	  this.X2=this.R2*Math.cos(this.PT+this.V2);
	  this.Y2=this.R2*Math.cos(this.OB)*Math.sin(this.PT+this.V2);
	  this.Z2=this.R2*Math.sin(this.OB)*Math.sin(this.PT+this.V2);
    }
    this.calcPlanet = function() {
      //Planatary data
      //P and Q
	  var nodes=this.nodes+this.pnodes*((this.J2 - this.J1)/100);
	  var periLat=this.periLat+this.periVariation*((this.J2 - this.J1)/100);
	  this.W=periLat-nodes;
	  nodes=deg2Rad(nodes);
	  this.W=deg2Rad(this.W);
	  var inclination=deg2Rad(this.inclination);
	
	  this.P1=Math.cos(nodes)*Math.cos(this.W)-Math.cos(inclination)*Math.sin(nodes)*Math.sin(this.W);
	  
	  this.P2=Math.sin(nodes)*Math.cos(this.W)*Math.cos(this.OB)+Math.cos(inclination)*Math.cos(nodes)*Math.sin(this.W)*Math.cos(this.OB);
	  this.P2=this.P2-Math.sin(inclination)*Math.sin(this.W) *Math.sin(this.OB);
	  
	  this.P3=Math.sin(nodes)*Math.cos(this.W)*Math.sin(this.OB)+Math.cos(inclination)*Math.cos(nodes)*Math.sin(this.W)*Math.sin(this.OB);
	  this.P3=this.P3+Math.sin(inclination)*Math.sin(this.W) *Math.cos(this.OB);
	  
	  this.Q1=-Math.cos(nodes)*Math.sin(this.W)-Math.cos(inclination)*Math.sin(nodes)*Math.cos(this.W);
	  
	  this.Q2=-Math.sin(nodes)*Math.sin(this.W)*Math.cos(this.OB)+Math.cos(inclination)*Math.cos(nodes)*Math.cos(this.W)*Math.cos(this.OB);
	  this.Q2=this.Q2-Math.sin(inclination)*Math.cos(this.W)*Math.sin(this.OB);
	  
	  this.Q3=Math.cos(nodes)*Math.cos(this.W)*Math.sin(this.OB)*Math.cos(inclination)-Math.sin(nodes)*Math.sin(this.W)*Math.sin(this.OB);
	  this.Q3=this.Q3+Math.sin(inclination)*Math.cos(this.W)*Math.cos(this.OB);
	  
	  
      //Orbit of the planet
	  var meanAnomaly=this.meanAnomaly+this.meanMotion*(this.J2-this.origin);
	  meanAnomaly=meanAnomaly-Math.floor(this.meanAnomaly/360)*360;
	  meanAnomaly=deg2Rad(meanAnomaly);
	  
	  this.V1=meanAnomaly+2*this.eccentricy*Math.sin(meanAnomaly)+1.25*this.eccentricy*this.eccentricy*Math.sin(2*meanAnomaly);
	  this.V1=this.V1+(13*Math.sin(3*meanAnomaly)-3*Math.sin(meanAnomaly))*this.eccentricy*this.eccentricy*this.eccentricy/12
	  this.R1=this.halfAxis*(1-this.eccentricy*this.eccentricy)/(1+this.eccentricy*Math.cos(this.V1));
	  
      //Coordinates of the planet
	  this.X1= this.P1 * this.R1 * Math.cos(this.V1) + this.Q1 * this.R1 * Math.sin(this.V1);
	  this.Y1= this.P2 * this.R1 * Math.cos(this.V1) + this.Q2 * this.R1 * Math.sin(this.V1);
      this.Z1= this.P3 * this.R1 * Math.cos(this.V1) + this.Q3 * this.R1 * Math.sin(this.V1);
    }
    this.calcGeocentric = function() {
      
      //geocentric coordinates
	  this.X= this.X1 + this.X2;
	  this.Y= this.Y1 + this.Y2;
	  this.Z= this.Z1 + this.Z2;
	  
      //geocentric distance
	  this.distance=Math.sqrt(this.X*this.X+this.Y*this.Y+this.Z*this.Z)	  
	}

	this.calcLongitude = function() {
    }
	this.calcLatitude = function () {
	}
	this.calcParalax = function () {
	}
  }