const WebSocket = require('ws');

const client = new WebSocket('ws://localhost:8080');

var startTime;

//Todo 上 AWS 後，修改 client 名稱，不能重複
var wsclient = "client"+ between(1, 200);

function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

function str2json(msg) {
  return JSON.stringify(msg)
}

function heartbeat() {
  clearTimeout(this.pingTimeout);
  
  this.pingTimeout = setTimeout(() => {
    client.terminate();
  }, 30000 + 1000);

  this.messageTimeout = setTimeout(() => {
    sendToServer();
  }, 10000); 
}

function sendToServer() {
  startTime = Date.now();
  var msg = {
    type: "message",
    startTime: startTime,
    from: wsclient,
    date: Date.now()
  };
  client.send(str2json(msg));
}

console.log(wsclient+ " ready to go");

client.on('open', heartbeat);

client.on('ping', heartbeat);

client.on('message', function incoming(data) {
    startTime = data;
    endTime = Date.now();
    timeDiff = endTime - startTime;
    
    var msg = {
      type: "timeDiff",
      timeDiff: timeDiff,
      from: wsclient,
      date: Date.now()
    };
    client.send(str2json(msg));

});

client.on('close', function clear() {
  // console.log("Server closed");
  clearTimeout(this.pingTimeout);
  clearTimeout(this.messageTimeout);
});

client.on('error', function onError(evt){
  console.log("Sorry , Server Error");
  console.log(evt)
});