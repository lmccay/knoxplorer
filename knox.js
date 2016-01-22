function listStatus()
{
  // restjs.useJSON();
  var req = new XMLHttpRequest()
  req.onerror=function() {
  }
  req.onreadystatechange=function() {
      // hide(document.getElementById('login'));
      if (req.readyState == 4 && req.status == 200) {
          // hide(document.getElementById('login'));
          myFunction(req.responseText);
      }
      else {
        if (req.readyState == 4 && req.status == 403) {
          hide(document.getElementById('login'));
          document.getElementById("path").innerHTML= getPathParameter() + "<br/>";
          document.getElementById("listing").innerHTML= '<p style="color:red">Forbidden</p><a href="?topology=' + getParameterByName("topology") + '&path=' + getParentDir() + '">..</a>\n' + "<br/>";
        }
        else {
          // alert(req.readyState + " " + req.status);
        }
      }
  }

  req.open("get", getWebHDFSURL() + "?op=LISTSTATUS", true, null, null)
  req.setRequestHeader('Content-Type', 'application/json');
  req.withCredentials = true;
  req.send(null)
}

function hide (elements, specifiedDisplay) {
  var computedDisplay, element, index;

  elements = elements.length ? elements : [elements];
  for (index = 0; index < elements.length; index++) {
    element = elements[index];
    element.style.display = '';
    element.style.display = 'none';
  }
}

function getWebHDFSURL() {
  return "https://" + getWebHDFSPath() + getParameterByName("path");
}

function getWebHDFSPath() {
  var webhdfs;
  var topo = getParameterByName("topology");
  if (topo === "") {
    webhdfs = "127.0.0.1:8443/gateway/sandbox/webhdfs/v1";
  }
  else {
    webhdfs = topo + "webhdfs/v1";
  }
  return webhdfs;
}

function myFunction(response) {
  var value = response;
  document.getElementById("path").innerHTML= getPathParameter() + "<br/>";
  document.getElementById("listing").innerHTML= '<a href="?topology=' + getParameterByName("topology") + '&path=' + getPathParameter() + '">..</a>\n' + "<br/>";

  var obj = JSON.parse(response);
  console.log();
  var link = "";
  var listing = "_";
  document.getElementById("listing").innerHTML= '<a href="?topology=' + getParameterByName("topology") + '&path=' + getPathParameter() + '">.</a>\n' + "<br/>";
  document.getElementById("listing").innerHTML += '<a href="?topology=' + getParameterByName("topology") + '&path=' + getParentDir() + '">..</a>\n' + "<br/>";
  for(var i=0; i < obj.FileStatuses.FileStatus.length; i++){
    listing = "_";
    if (obj.FileStatuses.FileStatus[i].type == "DIRECTORY" ) {
      listing = "d";
    }
    listing += toSymbolic(parseInt(obj.FileStatuses.FileStatus[i].permission)) + " " +
    obj.FileStatuses.FileStatus[i].permission + " " +
    obj.FileStatuses.FileStatus[i].owner + " " + 
    obj.FileStatuses.FileStatus[i].group + " " + 
    obj.FileStatuses.FileStatus[i].length + " " + 
    convertTime(parseInt(obj.FileStatuses.FileStatus[i].modificationTime)) + " " + 
    obj.FileStatuses.FileStatus[i].replication + " " +
    '<a href="?topology=' + getParameterByName("topology") + '&path=' + getPathParameter() + obj.FileStatuses.FileStatus[i].pathSuffix + '">' + obj.FileStatuses.FileStatus[i].pathSuffix + '</a>';
    document.getElementById("listing").innerHTML+="<br/>" + listing;
  }
  hide(document.getElementById('login', 'none'));
}

function getPathParameter() {
  var path = getParameterByName("path");
  if (!path.endsWith("/")) {
    path = path + "/";
  }
  return path;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getParentDir() {
  var wd = getPathParameter();
  var dirs = wd.split('/');
  next = "/";
  if (dirs.length > 1) {
    for (var i = 0; i < dirs.length-2; i++) {
      next = next + dirs[i];
      if (!next.endsWith("/")) {
        next += "/";
      }
    }
  }
  return next;
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function convertTime(timeMilliSecs) {
  var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(timeMilliSecs/1000);
  return d;
}

function toSymbolic ( octal, output ) {
	var digits, binary, block=[]
		, output = output || 'array';

	if (octal > 777) octal = new String(octal).substring(1, 4);	
	if ( !isOctalValid( octal ) ) {
		throw new Error( "Permission octal representation is not valid: " + octal );
  }

	digits = ( octal ).toString().split('');

	digits.forEach( function ( d, index ) {
		var symbole = '';
		binary = (parseInt(d)).toString(2);
		symbole += ( binary >= 100 ) ? 'r' : '-';
		symbole += ( (binary-100) >= 10 ) ? 'w' : '-';
		symbole += ((binary-100) == 1 || (binary-110) == 1 ) ? 'x' : '-';
		block[index] = symbole;
	});
	return ( 'string' == output.toLowerCase() ) ? block.join('') : block ;
}

function isOctalValid ( octal ) {
	if ( !octal ) return false;
	return !!( parseInt(octal) && octal > 100 && octal < 778 );	
}
