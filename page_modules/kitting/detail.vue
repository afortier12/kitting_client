<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Demo - List</title>
	<!-- APP-LINKS -->
</head>
<style>
/* APP-STYLE */

</style>
<!-- XTEMPLATES -->
<div id="app" v-cloak>
	<!-- APP-TEMPLATE -->
	<div class="app-container" v-if="hasList">
		<button type="button" class="btn btn-primary mb-3 mr-5">Pick Kit</button>
		<button type="button" class="btn btn-primary mb-3">Put Kit</button>
	</div>
	<integrity-table v-if="hasList" :name="getTitle" :collection="kit_list" :columns="columns">
	</integrity-table>
	<div v-else class="d-flex justify-content-center">
		<div class="container-fluid">
			<div class="row justify-content-center">
				<div class="spinner-border" role="status">
					<span class="sr-only">Loading...</span>
				</div>
			</div>
			<div class="row justify-content-center">
				<strong>{{ update_msg }}</strong>
			</div>
		</div>
	</div>
</div>

<style scoped>
.custom-loading-text {
    transform: rotate(-90deg);
    position: absolute;
    top: -1.5rem;
    left: -1rem;
    white-space: nowrap;
}
</style>


<script>
	/* APP-SCRIPT */

	var host = "localhost"
	var ws_port = 8201
	var port = 1880

	var baseUrl = "http://" + host + ":" + port + "/kitting";

	const vm = new Vue({
    el: "#app",
    data() {
        return {
			pageName: 'Kitting Inventory',	  
			columns: ["Detail", "Part Number", "Description", "Material", " Quantity"],
			kit_list: [],
			kit_name: '',
			update_msg: 'Waiting for server...',
        	update_value: 0,
        };
    },
    computed: {
		getTitle: function() {
            var title = "Kit#: " + this.kit_name + " " + this.pageName
 			return title
		},
		hasList: function() {
            return this.kit_list.length > 0;
	    },
    },// --- End of computed --- //
		methods: {
			cellStyleClass(item, field){
				if(field == "column2" && item.column2 % 2 == 0){
					return 'int-table-cell-pink'
				}
				return ""
			},
			colWidthClass(field){

				if(field == "column1"){
					return 'int-table-width-2'
				}
				return "int-table-width-1"
			},
			successClicked(){
				toastr.success("Success")
			},
			primaryClicked(){
				toastr.info("Primary")
			},
			async retrieveItems(query){
				Integrity.get(baseUrl +`/kit${query}`)
				.done(function(response){
					if (response === null)
						vm.kit_list = [{name: "No items found", detail:"N/A", description:"N/A", type:"N/A", requested_quantity:0, stock_quantity:0}]
					else
						vm.kit_list = response
				})
				.fail(function(err) {
					vm.kit_list = [{name: "Err", detail:"Err", description:"Err", type:"Err", requested_quantity:-1, stock_quantity:-1}]
					console.log(err);
				});

			},
		}, // --- End of methods --- //
        watch: {

		},  // --- End of watch --- //
		created: function(){
			var query = location.search
			this.retrieveItems(query)
		},
        // Available hooks: init,mounted,created,updated,destroyed
		mounted: function(){
			
			$.ajaxSetup({
			headers: {
				"Content-type": "application/json"
			},
			timeout: 5000 //Time in milliseconds
			});

			var MQTT_CLIENT_ID = "iot_web_"+Math.floor((1 + Math.random()) * 0x10000000000).toString(16);
			var socket = new Paho.Client(host, ws_port, MQTT_CLIENT_ID)

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

        } // --- End of mounted hook --- //
})
</script>
</body>
</html>	