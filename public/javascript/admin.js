/* Importing dashboard.ejs with AJAX */

function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("dashboard").innerHTML =
        this.responseText;
      }
    };
    xhttp.open("GET", "dashboard", true);
    xhttp.send();
  };