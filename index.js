'use strict'

import {socket} from './http-common.js';
import router from './router-client.js';
import {dataservice as KitDataService} from '../services/KitDataService.js'


const vm = new Vue({
    el: "#app",
    event: 'update',
    data: {
        update_msg: 'Waiting for server...',
        update_value: 0,
        properties:  {},
        layout: 'div',
        kit_data_service: KitDataService,
    },
    computed: {

    },// --- End of computed --- //
    methods: {
        
    }, // --- End of methods --- //
    watch: {
    },  // --- End of watch --- //
    // Available hooks: init,mounted,created,updated,destroyed
    created: function(){
        this.$on('update:properties', (data) => {
            this.properties = data;
          })
    },
    mounted: function(){

        console.log(this.$route.path)
        var vueApp = this
        var reconnectTimeout = 2000
        MQTTConnect()

        function MQTTConnect() {
            var options = {
                timeout: 3,
                onSuccess: onConnect,
                onFailure: onFailure,
                
            };
            socket.onMessageArrived = onMessageArrived
            socket.connect(options)
        }

        function onFailure(message) {
			console.log("Connection Attempt to Host Failed");
			setTimeout(MQTTConnect, reconnectTimeout);
        }
        function onConnect() {
            socket.subscribe("message");
            socket.subscribe("value");
            console.log("MQTT Connected");
        }
        function onMessageArrived(msg) {
            console.log(msg.destinationName + " : " + msg.payloadString)
            if (msg.destinationName === "message")
                vueApp.update_msg = msg.payloadString
            else if (msg.destinationName === "value")
                vueApp.update_value = msg.payloadString
            else if (msg.destinationName === "kit")
                vueApp.kit_name = msg.payloadString
        }

    }, // --- End of hooks --- //
    router: new VueRouter(router),
}) // --- End of vm --- //