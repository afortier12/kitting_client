<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Demo - List</title>
		<!-- APP-LINKS -->
	</head>
	<body>
		<style>
			/* APP-STYLE */
		</style>
		<!-- XTEMPLATES -->
		<div id="app" v-cloak>
			<!-- APP-TEMPLATE -->
			<div class="app-container">
				<div v-if="hasList">
					<div
						class="d-flex align-items-start bd-highlight mb-3 justify-content-start"
					>
						<div
							class="d-flex align-items-start bd-highlight mb-3 justify-content-start"
						>
							<button
								type="button"
								v-on:click="pick"
								class="btn btn-primary mb-3 mr-5 align-self-center"
							>
								Pick Kit
							</button>
						</div>
						<div
							class="d-flex align-items-start bd-highlight mb-3 justify-content-start"
						>
							<button
								type="button"
								v-on:click="put"
								class="btn btn-primary mb-3 mr-5 align-self-center"
							>
								Put Kit
							</button>
							<div :class="getClass" :role="alert">
								{{ statusMessage }}
							</div>
						</div>
					</div>

					<h1>{{ pageName }}</h1>
				</div>

				<integrity-table
					v-if="hasList"
					:name="getTitle"
					:collection="kitList"
					:columns="columns"
				>
				</integrity-table>

				<div v-else class="d-flex justify-content-center">
					<div class="container-fluid">
						<div class="row justify-content-center">
							<div class="spinner-border" role="status">
								<span class="sr-only">Loading...</span>``
							</div>
						</div>
						<div class="row justify-content-center">
							<strong>{{ updateMsg }}</strong>
						</div>
					</div>
				</div>
			</div>
		</div>

		<script>
			/* APP-SCRIPT */

			const vm = new Vue({
				el: "#app",
				data: {
					pageName: "Kitting Inventory",
					columns: [
						"Detail",
						"Part Number",
						"Description",
						"Material",
						" Required Quantity",
						"In-stock Quantity",
					],
					kitList: [],
					kitName: "",
					updateMsg: "Waiting for server...",
					updateValue: 0,
					statusKey: -1,
					statusValue: {0:"alert alert-dark align-self-center  ml-auto p-2",	 //gray - not ready
									1:"alert alert-primary align-self-center  ml-auto p-2", //blue -  ready to pick
									2:"alert alert-warning align-self-center  ml-auto p-2", //yellow - picked being assembled
									3:"alert alert-success align-self-center  ml-auto p-2", //green - returned to Kardex
									4:"alert alert-danger align-self-center  ml-auto p-2", //red - Kit delivered
									'-1':"alert alert-light align-self-center"},
					statusMessage: "Kit ready for assembly",
					alert: "alert",
				},
				computed: {
					getTitle: function () {
						var title = this.kitName;
						return title;
					},
					hasList: function () {
						return this.kitList.length > 0;
					},
					getMessages() {
						if (
							this.$mqtt !== null &&
							typeof this.$mqtt !== "undefined"
						) {
							return this.$mqtt.getMessage();
						}
					},
					getClass: function () {
						var key = this.statusKey;
						return this.statusValue[key]	
					},
				}, // --- End of computed --- //
				methods: {
					cellStyleClass(item, field) {
						if (field == "column2" && item.column2 % 2 == 0) {
							return "int-table-cell-pink";
						}
						return "";
					},
					colWidthClass(field) {
						if (field == "column1") {
							return "int-table-width-2";
						}
						return "int-table-width-1";
					},
					successClicked() {
						toastr.success("Success");
					},
					primaryClicked() {
						toastr.info("Primary");
					},
					openDrawer() {
						this.drawerShow = true;
					},
					put(event) {
						var baseUrl = `${this.config.API_PROTOCOL}://${this.config.API_HOST}/${this.config.API_PATH}`;
						Integrity.get(baseUrl + `/kit/put${query}`);
					},
					pick(event) {
						var baseUrl = `${this.config.API_PROTOCOL}://${this.config.API_HOST}/${this.config.API_PATH}`;
						var query = "?name=" + this.kitName;
						console.log(JSON.stringify(this.kitList));
						Integrity.post(
							baseUrl + `/kit/pick${query}`,
							this.kitList
						);
					},
					retrieveKits(query) {
						var baseUrl = `${this.config.API_PROTOCOL}://${this.config.API_HOST}/${this.config.API_PATH}`;
						var query = "?name=" + this.kitName;
						Integrity.get(baseUrl + `/kit${query}`)
							.done(function (response) {
								if (response === null) {
									vm.kitList = [
										{
											name: "No items found",
											detail: "N/A",
											description: "N/A",
											type: "N/A",
											requested_quantity: 0,
											stock_quantity: 0,
										},
									];
								} else {
									vm.kitList = response.data;
								}
							})
							.fail(function (err) {
								vm.kitList = [
									{
										name: "Err",
										detail: "Err",
										description: "Err",
										type: "Err",
										requested_quantity: -1,
										stock_quantity: -1,
									},
								];
								console.log(err);
							});
					},
				}, // --- End of methods --- //
				watch: {
					getMessages: function (newValue, oldValue) {
						if (
							newValue.hasOwnProperty("message") &&
							newValue.hasOwnProperty("destination")
						) {
							let destination = newValue.destination;
							let message = JSON.parse(newValue.message);
							console.log(destination + " : " + message);

							if (destination === "message") {
								if (
									message.hasOwnProperty("message") &&
									message.hasOwnProperty("mode") &&
									message.hasOwnProperty("value")
								) {
									var mode = message.mode;
									if (mode == "pick") {
										this.statusKey = message.value;
										this.statusMessage = message.message;
									} else if (mode == "put") {
										this.statusKey = message.value;
										this.statusMessage = message.message;
									} else {
										this.updateValue = message.value;
										this.updateMsg = message.message;
									}
								}
							} else if (destination === "kit") {
								this.kitName = message;
							}
						}
					},
					config: function (newValue) {
						if (
							this.config !== null &&
							typeof this.config !== "undefined" &&
							newValue !== null &&
							typeof newValue !== "undefined" &&
							this.kitList.length === 0
						) {
							this.statusKey = 1;
							var query = decodeURIComponent(location.search);
							const params = new URLSearchParams(query);
							this.kitName = params.get("name");
							this.kitName = this.kitName.replace(/%20/g, " ");
							query = query.replace(/%20/g, " ");
							this.retrieveKits(query);
							this.$mqtt.connect();
						}
					},
				}, // --- End of watch --- //
				created: function () {},
				// Available hooks: init,mounted,created,updated,destroyed
				mounted: function () {}, // --- End of mounted hook --- //
			});
		</script>
	</body>
</html>
