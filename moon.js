  function Moon() {

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
	  this.calcPhase(D);
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
	  this.calcLongitude();
	  this.calcLatitude();
	  this.W1 = .0004664*Math.cos(deg2Rad(this.OM));
      this.W2 = .0000754*Math.cos(deg2Rad(this.OM + 275.05 - 2.3*this.T));
      this.BT = this.B*(1 - this.W1 - this.W2);
      this.calcParalax();
      
      this.B = deg2Rad(this.BT);
	  this.LM = deg2Rad(this.L);

      this.SEM = 10800*Math.asin(deg2Rad(.272488*this.P))/Math.PI;
	  this.R=10800/(Math.PI*this.P1);

      this.Z = (this.JD - 2415020.5) / 365.2422
      this.OB=23.452294 -(.46845*this.Z+ 5.9E-07*this.Z*this.Z)/3600;
	  this.OB = deg2Rad(this.OB);
	  this.dec = Math.asin(Math.sin(this.B)*Math.cos(this.OB) + Math.cos(this.B)*Math.sin(this.OB)*Math.sin(this.LM));
      this.ra  = Math.acos(Math.cos(this.B)*Math.cos(this.LM)/Math.cos(this.dec));
	  if (this.LM > Math.PI) {
		this.ra = 2*Math.PI - this.ra
	  }
	  
	  this.B=rad2Deg(this.B);
	  this.LM=rad2Deg(this.LM);
	  
	  this.ra = this.ra*12 / Math.PI;
      this.dec=rad2Deg(this.dec);

	}
	this.calcInitValues = function() {
	  this.T = (this.JD- 2415020) / 36525;
	  this.L1 = 270.434164 + 481267.8831 * this.T - .001133 * this.T*this.T + .0000019 * this.T*this.T*this.T;
	  this.M  = 358.475833 + 35999.0498  * this.T - .00015  * this.T*this.T - .0000033 * this.T*this.T*this.T;
	  this.M1 = 296.104608 + 477198.8491 * this.T + .009192 * this.T*this.T + .0000144 * this.T*this.T*this.T;
	  this.D = 350.737486  + 445267.1142 * this.T - .001436 * this.T*this.T + .0000019 * this.T*this.T*this.T;
	  this.F = 11.250889   + 483202.0251 * this.T - .003211 * this.T*this.T - .0000003 * this.T*this.T*this.T;
	  this.OM = 259.183275 - 1934.142    * this.T + .002078 * this.T*this.T + .0000022 * this.T*this.T*this.T;
	  this.OM = deg2Rad(this.OM);

	  this.L1 = this.L1 + .000233 * Math.sin(deg2Rad(51.2 + 20.2 * this.T));
	  this.S = .003964 * Math.sin(deg2Rad(346.56 + 132.87 * this.T - .0091731 * this.T*this.T));
	  this.L1 = this.L1 + this.S + .001964 * Math.sin(this.OM);
	  this.M = this.M - .001778 * Math.sin(deg2Rad(51.2 + 20.2 * this.T));
	  this.M1 = this.M1 + .000817 * Math.sin(deg2Rad(51.2 + 20.2 * this.T));
	  this.M1 = this.M1 + this.S + .002541 * Math.sin(this.OM);
	  this.D = this.D + .002011 * Math.sin(deg2Rad(51.2 + 20.2 * this.T));
	  this.D = this.D + this.S + .001964 * Math.sin(this.OM);
	  this.F = this.F + this.S - .024691 * Math.sin(this.OM);
	  this.F = this.F - .004328 * Math.sin(this.OM + deg2Rad(275.05 - 2.3 * this.T));
	  this.EX = 1 - .002495 * this.T - .00000752 * this.T*this.T;
	  this.OM = rad2Deg(this.OM);
	  this.L1 = this.PrimerGiro(this.L1);
	  this.M = this.PrimerGiro(this.M);
	  this.M1 = this.PrimerGiro(this.M1);
	  this.D = this.PrimerGiro(this.D);
	  this.F = this.PrimerGiro(this.F);
	  this.OM = this.PrimerGiro(this.OM);
	  this.M = deg2Rad(this.M);
	  this.M1 = deg2Rad(this.M1);
	  this.D = deg2Rad(this.D);
	  this.F = deg2Rad(this.F);
	}
	this.calcLongitude = function() {
	  this.L=this.L1+ 6.28875*Math.sin(this.M1) + 1.274018*Math.sin(2*this.D - this.M1) + .658309*Math.sin(2*this.D);
	  this.L= this.L + .213616*Math.sin(2*this.M1) - this.EX*.185596*Math.sin(this.M) - .114336*Math.sin(2*this.F);
	  this.L= this.L + .058793*Math.sin(2*this.D - 2*this.M1) + this.EX*.057212*Math.sin(2*this.D - this.M - this.M1) + .05332*Math.sin(2*this.D + this.M1);
	  this.L= this.L + this.EX*.045874*Math.sin(2*this.D - this.M) + this.EX*.041024*Math.sin(this.M1 - this.M) - .034718*Math.sin(this.D);
	  this.L= this.L - this.EX*.030465*Math.sin(this.M + this.M1) + .015326*Math.sin(2*this.D - 2*this.F) - .012528*Math.sin(2*this.F + this.M1);
	  this.L= this.L - .01098*Math.sin(2*this.F - this.M1) + .010674*Math.sin(4*this.D - this.M1) + .010034*Math.sin(3*this.M1);
	  this.L= this.L + .008548*Math.sin(4*this.D - 2*this.M1) - this.EX*.00791*Math.sin(this.M - this.M1 + 2*this.D) - this.EX*.006783*Math.sin(2*this.D + this.M);
	  this.L= this.L + .005162*Math.sin(this.M1 - this.D) + this.EX*.005*Math.sin(this.M + this.D) + this.EX*.004049*Math.sin(this.M1 - this.M + 2*this.D);
	  this.L= this.L + .003996*Math.sin(2*this.M1 + 2*this.D) + .003862*Math.sin(4*this.D) + .003665*Math.sin(2*this.D - 3*this.M1);
	  this.L= this.L + this.EX*.002695*Math.sin(2*this.M1 - this.M) + .002602*Math.sin(this.M1 - 2*this.F - 2*this.D) + this.EX*.002396*Math.sin(2*this.D - this.M - 2*this.M1);
	  this.L= this.L - .002349*Math.sin(this.M1 + this.D) + this.EX*this.EX*.002249*Math.sin(2*this.D - 2*this.M) - this.EX*.002125*Math.sin(2*this.M1 + this.M);
	  this.L= this.L - this.EX*this.EX*.002079*Math.sin(2*this.M) + this.EX*this.EX*.002059 * Math.sin(2*this.D - this.M1 - 2*this.M) - .001773*Math.sin(this.M1 + 2*this.D - 2*this.F);
	  this.L= this.L + this.EX*.00122*Math.sin(4*this.D - this.M - this.M1) - .00111*Math.sin(2*this.M1 + 2*this.F) + .000892 * Math.sin(this.M1 - 3*this.D);
	  this.L= this.L - this.EX*.000811*Math.sin(this.M + this.M1 + 2*this.D) + this.EX*.000761*Math.sin(4*this.D - this.M - 2*this.M1) + this.EX*this.EX*.000717*Math.sin(this.M1 - 2*this.M);
	  this.L= this.L + this.EX*this.EX*.000704*Math.sin(this.M1 - 2*this.M - 2*this.D) + this.EX*.000693*Math.sin(this.M - 2*this.M1 + 2*this.D) + this.EX*.000598*Math.sin(2*this.D - this.M - 2*this.F) + .00055*Math.sin(this.M1 + 4*this.D);
	  this.L= this.L + .000538*Math.sin(4*this.M1) + this.EX*.000521*Math.sin(4*this.D - this.M) + .000486*Math.sin(2*this.M1 - this.D);
	  this.L= this.L - .001595*Math.sin(2*this.F + 2*this.D);
    }
	this.calcLatitude = function () {
      this.B = 5.128189*Math.sin(this.F) + .280606*Math.sin(this.M1 + this.F) + .277693*Math.sin(this.M1 - this.F) + .173238*Math.sin(2*this.D - this.F);
      this.B = this.B + .055413*Math.sin(2*this.D + this.F - this.M1) + .046272*Math.sin(2*this.D - this.F - this.M1) + .032573*Math.sin(2*this.D + this.F);
      this.B = this.B + .017198*Math.sin(2*this.M1 + this.F) + 9.266999E-03*Math.sin(2*this.D + this.M1 - this.F) + .008823*Math.sin(2*this.M1 - this.F);
      this.B = this.B + this.EX*.008247*Math.sin(2*this.D - this.M - this.F) + .004323*Math.sin(2*this.D - this.F - 2*this.M1) + .0042*Math.sin(2*this.D + this.F + this.M1);
      this.B = this.B + this.EX*.003372*Math.sin(this.F - this.M - 2*this.D) + this.EX*.002472*Math.sin(2*this.D + this.F - this.M - this.M1) + this.EX*.002222*Math.sin(2*this.D + this.F - this.M);
      this.B = this.B + .002072*Math.sin(2*this.D - this.F - this.M - this.M1) + this.EX*.001877*Math.sin(this.F - this.M + this.M1) + .001828*Math.sin(4*this.D - this.F - this.M1);
      this.B = this.B - this.EX*.001803*Math.sin(this.F + this.M) - .00175*Math.sin(3*this.F) + this.EX*.00157*Math.sin(this.M1 - this.M - this.F) - .001487*Math.sin(this.F + this.D) - this.EX*.001481*Math.sin(this.F + this.M + this.M1) + this.EX*.001417*Math.sin(this.F - this.M - this.M1) + this.EX*.00135*Math.sin(this.F - this.M) + .00133*Math.sin(this.F - this.D);
      this.B = this.B + .001106*Math.sin(this.F + 3*this.M1) + .00102*Math.sin(4*this.D - this.F) + .000833*Math.sin(this.F + 4*this.D - this.M1);
      this.B = this.B + .000781*Math.sin(this.M1 - 3*this.F) + .00067*Math.sin(this.F + 4*this.D - 2*this.M1) + .000606*Math.sin(2*this.D - 3*this.F);
      this.B = this.B + .000597*Math.sin(2*this.D + 2*this.M1 - this.F) + this.EX*.000492*Math.sin(2*this.D + this.M1 - this.M - this.F) + .00045*Math.sin(2*this.M1 - this.F - 2*this.D);
      this.B = this.B + .000439*Math.sin(3*this.M1 - this.F) + .000423*Math.sin(this.F + 2*this.D + 2*this.M1) + .000422*Math.sin(2*this.D - this.F - 3*this.M1);
      this.B = this.B - this.EX*.000367*Math.sin(this.M + this.F + 2*this.D - this.M1) - this.EX*.000353*Math.sin(this.M + this.F + 2*this.D) + .000331*Math.sin(this.F + 4*this.D);
      this.B = this.B + this.EX*.000317*Math.sin(2*this.D + this.F - this.M + this.M1) + this.EX*this.EX*.000306*Math.sin(2*this.D - 2*this.M - this.F) - .000283*Math.sin(this.M1 + 3*this.F);

	}
	this.calcParalax = function () {
      this.P = .950724 + .051818*Math.cos(this.M1) + .009531*Math.cos(2*this.D - this.M1) + .007843*Math.cos(2*this.D) + .002824*Math.cos(2*this.M1) + .000857*Math.cos(2*this.D + this.M1) + this.EX*.000533*Math.cos(2*this.D - this.M) + this.EX*.000401*Math.cos(2*this.D - this.M - this.M1);
      this.P = this.P + .000173*Math.cos(3*this.M1) + .000167*Math.cos(4*this.D - this.M1) - this.EX*.000111*Math.cos(this.M) + .000103*Math.cos(4*this.D - 2*this.M1) - .000084*Math.cos(2 * this.M1 - 2*this.D) - this.EX*.000083*Math.cos(2*this.D + this.M) + .000079*Math.cos(2*this.D + 2*this.M1);
      this.P = this.P + .000072*Math.cos(4*this.D) + this.EX*.000064*Math.cos(2*this.D - this.M + this.M1) - this.EX*.000063*Math.cos(2*this.D + this.M - this.M1);
      this.P = this.P + this.EX*.000041*Math.cos(this.M + this.D) + this.EX*.000035*Math.cos(2*this.M1 - this.M) - .000033*Math.cos(3*this.M1 - 2*this.D);
      this.P = this.P - .00003*Math.cos(this.M1 + this.D) - .000029*Math.cos(2*this.F - 2*this.D) - this.EX*.000029*Math.cos(2*this.M1 + this.M);
      this.P = this.P + this.EX*this.EX*.000026*Math.cos(2*this.D - 2*this.M) - .000023*Math.cos(2*this.F - 2*this.D + this.M1) + this.EX*.000019*Math.cos(4*this.D - this.M - this.M1);
	  this.P1 = this.P * 60;
	}
	this.PrimerGiro = function(x) {
	  x= x- 360 * Math.floor ( x / 360);
	  return x;
	}	
	this.calcPhase = function (currDate) {
	  var blueMoonDate = new Date(2007, 0, 3, 13, 58, 30);
      var lunarPeriod = 29.012*(24*3600*1000) + 12*(3600*1000) + 44.05*(60*1000);
      var moonPhaseTime = (currDate.getTime() - blueMoonDate.getTime()) % lunarPeriod;
      var percentRaw = (moonPhaseTime / lunarPeriod);
      var percent = Math.round(100*percentRaw) / 100;
	  this.phase = percent;
      //1/0 = full, .25 = last quater, .5 = new, .75 = first quarter
	}
  }