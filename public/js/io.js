var socket = io();
/*$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});*/
var entries = [];
var used_ids = [];
socket.on('data', function(data){
  var add = true;
  for (var i = 0; i < used_ids.length; i++) {
    if (used_ids[i]==data.id) {
      add = false;
    }
  }
  if (add) {
    entries.push(data);
    used_ids.push(data.id);
  }
});

shapes = [];

var run = setInterval(function() {
  if (entries.length > 0) {
    entry = entries.pop();
    try {
      var p1 = new L.LatLng(entry.min_lat, entry.min_lon);
      var p2 = new L.LatLng(entry.max_lat, entry.max_lon);
      var bounds = [p1, p2];
      map.fitBounds(bounds);

      var rect = L.rectangle(bounds, {color: 'red', weight: 1}).addTo(map);
      shapes.push(rect);
    } catch(e) {
      console.log(e);
    }
  } else {
    //used_ids = [];
    shapes.forEach(function(shape){
      map.removeLayer(shape);
    });
  }
}, 500);