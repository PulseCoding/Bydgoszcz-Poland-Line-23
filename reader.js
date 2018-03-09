var modbus = require('jsmodbus');
var client = modbus.client.tcp.complete({
    'host': "127.0.0.1",
    'port': 502,
    'autoReconnect': true,
    'timeout': 60000,
    'logEnabled'    : false,
    'reconnectTimeout': 30000,
    'unitId':1
}).connect();

client.on('connect', function(err) {
	client.readHoldingRegisters(0,10).then(function(resp){
		console.log(resp)
	})
})
