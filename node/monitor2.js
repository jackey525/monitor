var Register = require('prom-client').register;  
var Counter = require('prom-client').Counter;  
var Histogram = require('prom-client').Histogram;  
var Summary = require('prom-client').Summary;  
var Gauge = require('prom-client').Gauge;  
var ResponseTime = require('response-time');  


module.exports.numOfwebsockets = numOfwebsockets = new Counter({  
    name: 'numOfwebsocket',
    help: 'Number of websocket connection'
});


module.exports.numOfMessagewebsockets = numOfMessagewebsockets = new Counter({  
    name: 'numOfMessagewebsockets',
    help: 'Number of websocket Message',
    labelNames: ['messages']
});


module.exports.numOfActivewebsockets = numOfActivewebsockets = new Gauge({  
    name: 'numOfActivewebsockets',
    help: 'Number of websocket Active Connection',
    labelNames: ['connection']
});


module.exports.wsResponseTime = wsResponseTime = new Gauge({  
    name: 'wsResponseTime',
    help: 'ResponseTime of websocket Message',
    labelNames: ['connection']
});


module.exports.numOfRequests = numOfRequests = new Counter({  
    name: 'numOfRequests',
    help: 'Number of requests made',
    labelNames: ['method']
});


module.exports.pathsTaken = pathsTaken = new Counter({  
    name: 'pathsTaken',
    help: 'Paths taken in the app',
    labelNames: ['path']
});


module.exports.responses = responses = new Summary({  
    name: 'responses',
    help: 'Response time in millis',
    labelNames: ['method', 'path', 'status']
});


module.exports.startCollection = function () {  
    //Logger.log(Logger.LOG_INFO, `Starting the collection of metrics, the metrics are available on /metrics`);
    require('prom-client').collectDefaultMetrics();
};


module.exports.wsCounters = function () {  
    numOfwebsockets.inc();
}


module.exports.wsMessageCounters = function (msg) {  
    numOfMessagewebsockets.inc({ messages: msg });
}


module.exports.wsActivewebsocketsCounters = function (count) {  
    numOfActivewebsockets.set({ connection: "socket" }, count);
}


module.exports.wsResponseTime = function (msg,count) {  
    wsResponseTime.set({ connection: msg }, count);
}


module.exports.requestCounters = function (req, res, next) {  
    if (req.path != '/metrics') {
        numOfRequests.inc({ method: req.method });
        pathsTaken.inc({ path: req.path });
    }
    next();
}


module.exports.responseCounters = ResponseTime(function (req, res, time) {  
    if(req.url != '/metrics') {
        responses.labels(req.method, req.url, res.statusCode).observe(time);
    }
})

// Route /metrics 服務啟用 9091 port   
module.exports.injectMetricsRoute = function (App) {  
    
    App.get('/metrics', (req, res) => {
        res.set('Content-Type', Register.contentType);
        res.end(Register.metrics());
    });
    App.listen(9091);
};
