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
  client.send('from='+wsclient+"="+startTime);
  // console.log("start timestamp = %s",startTime);
}

console.log(wsclient+ " ready to go");

client.on('open', heartbeat);

client.on('ping', heartbeat);

client.on('message', function incoming(data) {
    startTime = data;
    endTime = Date.now();
    timeDiff = endTime - startTime;
    // console.log(data);
    // console.log("end timestamp = %s",endTime);
    // console.log("timeDiff = %s ms",timeDiff);
    
    client.send(wsclient+"=timeDiff="+timeDiff);
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