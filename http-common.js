var host = "localhost"
var ws_port = 8201
var port = 1880
var mqtt_path = "/mqtt"

export const server = axios.create({
  baseURL: "http://" + host + ":" + port + "/kitting",
  headers: {
    "Content-type": "application/json"
  },
  timeout: 20000,
})


var MQTT_CLIENT_ID = "iot_web_"+Math.floor((1 + Math.random()) * 0x10000000000).toString(16);
export const socket = new Paho.Client(host, ws_port, MQTT_CLIENT_ID)
