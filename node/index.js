const WebSocket = require('ws');
const express = require('express');

const app = express();

//WebSocket server port 為 8080
const server = new WebSocket.Server({ port: 8080 });

//啟動 app 的url /metric port為 9091
const monitorSocket = require('./monitor2.js');

function noop() {}

function heartbeat() {
  this.isAlive = true;
  console.log("heartbeat isAlive");
}

//初始化，接收到那一個 client 的連線名稱
var from = "";

// WebSocket server 連線
server.on('connection', function connection(ws) {
  //檢測 WebSocket server 狀態
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  //呼叫 wsCounters 計算 WebSocket 連線數
  monitorSocket.wsCounters();   
  //websocket 收到 message，目前用 '=' 隔開取得相關資訊內容
    ws.on('message', function incoming(data) {    
      try {
        var msg = JSON.parse(data);
      } catch (e) {
        var msgdata = {
          type: "web",
          from: "other",
          data: data
        };
        var msg = JSON.parse(JSON.stringify(msgdata));
      }
      console.log(msg);
      switch(msg.type) {
        case "message":
          monitorSocket.wsMessageCounters(msg.from);
          console.log('received: %s', msg);
          ws.send(msg.startTime);
        break;
        case "timeDiff":
          monitorSocket.wsResponseTime(msg.from,parseInt(msg.timeDiff));
        break;
        default:
          console.log(msg.from);
          monitorSocket.wsCounters(msg.from);    
          monitorSocket.wsMessageCounters(msg.from);
        break;
      }
    });
    
    //5秒呼叫一次 wsActivewebsocketsCounters 傳回目前線上人數
    setInterval(() => {
        monitorSocket.wsActivewebsocketsCounters(server.clients.size);
    }, 5000);

});

// 抓取 預設的 metrics 數值
app.use(monitorSocket.requestCounters);  
app.use(monitorSocket.responseCounters);

// Enable metrics endpoint
monitorSocket.injectMetricsRoute(app);

// Enable collection of default metrics
monitorSocket.startCollection();  

//30 秒判斷 client 是否有回應，沒有回應則關閉 該 WebSocket 連線
const interval = setInterval(function ping() {
  server.clients.forEach(function each(ws) {
    console.log(ws.isAlive);

    if (ws.isAlive === false){
      console.log("heartbeat false");
      return ws.terminate();
    } 
    
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

// WebSocket server 關閉
server.on('close', function close() {
  clearInterval(interval);
});