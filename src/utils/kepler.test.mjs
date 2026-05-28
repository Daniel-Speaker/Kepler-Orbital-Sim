// Standalone numeric checks (no three.js dep needed for the formulas).
const MU = 3.986e14, R = 6371, DEG = Math.PI/180;
const radius = (a,e,nu)=> a*(1-e*e)/(1+e*Math.cos(nu*DEG));
const period = a => 2*Math.PI*Math.sqrt((a*1000)**3/MU);
const visviva = (a,e,nu)=>{const r=radius(a,e,nu)*1000,A=a*1000;return Math.sqrt(MU*(2/r-1/A))/1000;};

function trueToMean(nuDeg,e){const nu=nuDeg*DEG;const E=Math.atan2(Math.sqrt(1-e*e)*Math.sin(nu),e+Math.cos(nu));let M=E-e*Math.sin(E);M%=2*Math.PI;if(M<0)M+=2*Math.PI;return M;}
function meanToTrue(M,e){M%=2*Math.PI;if(M<0)M+=2*Math.PI;let E=e<0.8?M:Math.PI;for(let k=0;k<50;k++){const dE=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=dE;if(Math.abs(dE)<1e-12)break;}let nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));let d=(nu/DEG)%360;if(d<0)d+=360;return d;}

let pass=0, fail=0;
function ok(name,cond,detail){ if(cond){pass++;console.log("PASS",name, detail??"");} else {fail++;console.log("FAIL",name, detail??"");}}
const near=(x,y,tol)=>Math.abs(x-y)<=tol;

// ISS: a=6778 km -> period ~92.6 min, v ~7.66 km/s
const issT = period(6778)/60;
ok("ISS period ~92.6min", near(issT,92.6,0.5), issT.toFixed(2)+" min");
const issV = visviva(6778,0.0007,0);
ok("ISS speed ~7.66km/s", near(issV,7.66,0.05), issV.toFixed(3)+" km/s");

// GEO: a=42164 -> period ~1436 min (sidereal day), v ~3.07 km/s
const geoT = period(42164)/60;
ok("GEO period ~1436min", near(geoT,1436,3), geoT.toFixed(1)+" min");
const geoV = visviva(42164,0,0);
ok("GEO speed ~3.07km/s", near(geoV,3.07,0.03), geoV.toFixed(3)+" km/s");

// Molniya: a=26560,e=0.74. Perigee speed > apogee speed; vis-viva sanity
const vp = visviva(26560,0.74,0), va = visviva(26560,0.74,180);
ok("Molniya perigee faster than apogee", vp>va, `vp=${vp.toFixed(2)} va=${va.toFixed(2)}`);
// Conservation: r_p*v_p ~ r_a*v_a (angular momentum at apsides, velocity purely tangential)
const rp=radius(26560,0.74,0), ra=radius(26560,0.74,180);
ok("Ang. momentum conserved at apsides", near(rp*vp, ra*va, (rp*vp)*0.001), `${(rp*vp).toFixed(0)} vs ${(ra*va).toFixed(0)}`);

// Anomaly round-trips
let maxErr=0;
for(const e of [0,0.01,0.3,0.74,0.9]){
  for(let nu=0;nu<360;nu+=7){
    const back = meanToTrue(trueToMean(nu,e),e);
    let d=Math.abs(back-nu); if(d>180)d=360-d;
    maxErr=Math.max(maxErr,d);
  }
}
ok("true<->mean round trip < 1e-6 deg", maxErr<1e-6, "maxErr="+maxErr.toExponential(2)+" deg");

// Kepler 2nd law: equal area => slower at apogee. Compare dNu for equal dM near peri vs apo.
const e=0.74, dM=0.001;
const nuPeriA=meanToTrue(0,e), nuPeriB=meanToTrue(dM,e);
const nuApoA=meanToTrue(Math.PI,e), nuApoB=meanToTrue(Math.PI+dM,e);
const dNuPeri=Math.abs(nuPeriB-nuPeriA), dNuApo=Math.abs(nuApoB-nuApoA);
ok("2nd law: faster sweep near perigee", dNuPeri>dNuApo, `peri dν=${dNuPeri.toFixed(4)} apo dν=${dNuApo.toFixed(4)}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
