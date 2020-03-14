  function Sun() {
    /*
	N = longitude of the ascending node
    i = inclination to the ecliptic (plane of the Earth's orbit)
    w = argument of perihelion: computed in 2 parts, one fixed, one dependent on time
    a = semi-major axis, or mean distance from Sun
    e = eccentricity (0=circle, 0-1=ellipse, 1=parabola): computed in 2 parts, one fixed, one dependent on time
    M = mean anomaly (0 at perihelion; increases uniformly with time): computed in 2 parts, one fixed, one dependent on time
	E = eccentric anomaly
	w0 = N + w   = longitude of perihelion
    L  = M + w0  = mean longitude
    q  = a*(1-e) = perihelion distance
    Q  = a*(1+e) = aphelion distance
    P  = a ^ 1.5 = orbital period (years if a is in AU, astronomical units)
    T  = Epoch_of_M - (M(deg)/360_deg) / P  = time of perihelion
    v  = true anomaly (angle between position and perihelion)
    E  = eccentric anomaly
    */
	/*this.T = Math.floor((2000-1900)*365.25)/36525;
	//this.T = 1; //J2000.0 Epoch
	//Mean eliptical longitude at epoch
	this.e_g = (279.6966778 + 36000.76892*this.T + .0003025*this.T*this.T) %360;
	//longitude of the sun at perigee
	this.w_g = 281.2208444 + 1.719175*this.T + .000452778*this.T*this.T;
	//eccentricity
	this.e = .01675104 - .0004818*this.T + .000000126*this.T*this.T;
	//mean obliquity of the ecliptic
	this.epsolon = 23.3893 - .013004167*this.T - .00000016666667*this.T*this.T + .0000005027777778*this.T*this.T*this.T;*/

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
      var GGG = 1;
      if (D.getUTCFullYear() <= 1585) GGG = 0;
      //Julian Date
      var JD = -1 * Math.floor(7 * (Math.floor(((D.getUTCMonth()+1) + 9) / 12) + D.getUTCFullYear()) / 4);
      var S = 1;
      if (((D.getUTCMonth()+1) - 9)<0) S=-1;
      var A = Math.abs((D.getUTCMonth()+1) - 9);
      var J1 = Math.floor(D.getUTCFullYear() + S * Math.floor(A / 7));
      J1 = -1 * Math.floor((Math.floor(J1 / 100) + 1) * 3 / 4);
      JD = JD + Math.floor(275 * (D.getUTCMonth()+1) / 9) + D.getUTCDate() + (GGG * J1);
      JD = JD + 1721027 + 2 * GGG + 367 * D.getUTCFullYear() - 0.5;
      JD = JD + ((D.getUTCHours() + D.getUTCMinutes()/60 + D.getUTCSeconds()/3600) / 24);
      this.J2=JD;
	}
	this.calcRADec = function(D) {
	  this.calcDate(D)	  

	  //Set some constants
      var ET=0.016718;
      var VP=8.22E-5;
      var P=4.93204;
      var M0=2.12344;
      var MN=1.72019E-2;
      var T0=2444000.5;
	  var S=2415020.5;
	  P=P+(this.J2-T0)*VP/100;
	  var AM=M0+MN*(this.J2-T0);
	  AM=AM-2*Math.PI*Math.floor(AM/(2 * Math.PI));
      //Ecentrictiy of the earth
	  var V=AM+2*ET*Math.sin(AM)+1.25*ET*ET*Math.sin(2*AM);
	  var R=(1-ET*ET)/(1+ET*Math.cos(V));
	  if (V<0) {
	    V=2*Math.PI+V;
	  }
	  this.L=P+V;
	  this.L=this.L-2*Math.PI*Math.floor(this.L/(2*Math.PI)) ;
      //calculate the right assention and declination
	  var Z=(this.J2-2415020.5)/365.2422;
	  this.OB=23.452294-(0.46845*Z+0.00000059*Z*Z)/3600;
	  this.OB = deg2Rad(this.OB);
	  this.dec=Math.asin(Math.sin(this.OB)*Math.sin(this.L))
	  this.ra=Math.acos(Math.cos(this.L)/Math.cos(this.dec))
	  if (this.L>Math.PI) {
		this.ra=2*Math.PI-this.ra
	  }
	  X=R*Math.cos(this.L);
	  Y=R*Math.cos(this.OB)*Math.sin(this.L);
	  Z=R*Math.sin(this.OB)*Math.sin(this.L);
	  this.OB=rad2Deg(this.OB);
      this.L=rad2Deg(this.L);
	
      this.ra = this.ra * 12 / Math.PI;
	  this.dec = rad2Deg(this.dec);
	}
  }