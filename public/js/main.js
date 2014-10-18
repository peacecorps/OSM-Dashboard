var osmStream = require('../../stream/osmstream.js');

osmStream.runFn(function(err, data) {
  console.log(data);
  if (err) document.getElementById('output').innerHTML += '\nError';
  document.getElementById('output').innerHTML += '\nData: ' + data.length;
});