//(function () {
function DRAW() {

  var canvas = document.getElementById("defaultEnemy");
  canvas.width  = 200;
  canvas.height = 200;

  var context = canvas.getContext("2d");
  var img = new Image();
  //var img = defaultEnemy;
  var clearCanvas = function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
  };

  img.addEventListener("load", function () {
    clearCanvas();
    context.drawImage(img, 0, 0);
    defaultEnemy = img;
  }, false);

  canvas.addEventListener("dragover", function (evt) {
    evt.preventDefault();
  }, false);

  canvas.addEventListener("drop", function (evt) {
    var files = evt.dataTransfer.files;
    if (files.length > 0) {
      var file = files[0];
      if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
        var reader = new FileReader();
        reader.onload = function (evt) {
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
    evt.preventDefault();
  }, false);
};
