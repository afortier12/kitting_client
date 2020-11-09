
const Mqtt = {
    install (Vue, options) {
        const MQTT_CLIENT_ID = "integrity_web_"+Math.floor((1 + Math.random()) * 0x10000000000).toString(16);
        const reconnectTimeout = 2000

        var socket = null

        const message = Vue.observable({
            value: "",
            destination: "",
        })

        const actions = {
            connect(){
                var host = vm.config.WS_HOST
                var port = vm.config.WS_PORT
                socket = new Paho.Client(host, Number(port), MQTT_CLIENT_ID)
                socket.onMessageArrived = onMessageArrived
                socket.connect({
                    timeout: 3,
                    onSuccess: onConnect,
                    onFailure: onFailure,
                })
            },
            setValue(value) {
                message.value = value
            },
            setDestination(destination){
                message.destination = destination
            },
            getMessage() {
                let msg = {}
                msg["message"] = message.value
                msg["destination"] = message.destination
                return msg
            },
        }
        
        const onFailure = (message) => {
            console.log("Connection Attempt to Host Failed");
            setTimeout(actions.connect(), reconnectTimeout);
        }	

       const onConnect = () => {
            socket.subscribe("message");
            socket.subscribe("value");
            console.log("MQTT Connected");
        }

        const onMessageArrived = (msg) => {
            message.value = msg.payloadString
            message.destination = msg.destinationName
        }

        Vue.prototype.$mqtt = actions
    }
}
