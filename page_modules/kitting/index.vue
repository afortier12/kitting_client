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
		<div class="app-container">
			<integrity-table  v-if="hasList" :name="pageName" :collection="main_collection" :columns="columns" @select="onSelect">
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

	var host = "10.0.15.70"
	var ws_port = 8201
	var port = 1891

	var baseUrl = "http://" + host + ":" + port + "/flows-1/api/kitting";

	const vm = new Vue({
    el: "#app",
    data: {
        update_msg: 'Waiting for server...',
        update_value: 0,
        pageName: 'Kitting Inventory',
		columns: ["Kit", "In-stock", "Required", " Status"],
		main_collection: [],
		kit_name: '',
    },
    computed: {
		hasList: function() {
            return this.main_collection.length > 0;
	    },

    },// --- End of computed --- //
    methods: {
					// This allows a page to set integrity-table cell styles by field and value conditionally
			cellStyleClass(item, field){
				if(field == "column5" && item.column5 > '2020-01-01'){
					return 'int-table-cell-pink'
				}
				return ""
			},
			// This allows a page to set integrity-table column widths and visibility
			colWidthClass(field){
				if(field == "column1"){
					return 'int-table-width-5'
				} else if (field == "column10") {
					return 'int-table-width-3'
				} else if (["column3", "column7", "column8", "column9"].indexOf(field) > -1) {
					return 'int-table-width-none'
				}
				return "int-table-width-1"
			},
			successClicked(){
				toastr.success("Success")
			},
			primaryClicked(){
				toastr.info("Primary")
			},
			openDrawer(){
				this.drawerShow = true
			},
			async retrieveKits(){
				Integrity.get(baseUrl +'/kits')
				.done(function(response){
					if (response === null)
						vm.main_collection = [{kit: "No kits found", 'in-stock':0, total:0, percent:"0%"}]
					else
						vm.main_collection = response
				})
				.fail(function(err) {
					vm.main_collection = [{kit: "Err", 'in-stock':-1, total:-1, percent:"Err"}]
					console.log(err);
				});

			},
        	async onSelect(item) {
            	try{
					this.kit_name = item.kit
					var url = window.location.pathname;
					var path = url.substring(0, url.lastIndexOf("/"))
					window.location.href = path + `/detail.html?name=${this.kit_name}`;

				} catch(err) {
					console.log(err);
				}
      	  	},
        
    }, // --- End of methods --- //
    watch: {
    },  // --- End of watch --- //
    // Available hooks: init,mounted,created,updated,destroyed
    created: function(){
        this.retrieveKits()
    },
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

    }, // --- End of hooks --- //
}) // --- End of vm --- //
</script>
</body>
</html>	
