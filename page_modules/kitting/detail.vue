<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
			<div v-if="hasList">
				<div
					class="d-flex align-items-start bd-highlight mb-3 justify-content-between"
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
						<div :class="pickClass" :role="alert">
							{{ pick_message }}
						</div>
					</div>
					<div
						class="d-flex align-items-start bd-highlight mb-3 justify-content-end"
					>
						<button
							type="button"
							v-on:click="put"
							class="btn btn-primary mb-3 mr-5 align-self-center"
						>
							Put Kit
						</button>
						<div :class="putClass" :role="alert">
							{{ put_message }}
						</div>
					</div>
				</div>

				<h1>{{ pageName }}</h1>
			</div>

			<integrity-table
				v-if="hasList"
				:name="getTitle"
				:collection="kit_list"
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
				kit_list: [],
				kit_name: "",
				update_msg: "Waiting for server...",
				update_value: 0,
				pick_status: 1,
				put_status: 0,
				pick_message: "Kit ready for assembly",
				put_message: "Waiting for kit to be assembled",
				alert: "alert",
			},
			computed: {
				getTitle: function () {
					var title = this.kit_name;
					return title;
				},
				hasList: function () {
					return this.kit_list.length > 0;
				},
				getMessages() {
					if (
						this.$mqtt !== null &&
						typeof this.$mqtt !== "undefined"
					) {
						return this.$mqtt.getMessage();
					}
				},
				pickClass: function () {
					var status = this.pick_status;
					var pick_class = "";
					switch (status) {
						case 0:
							pick_class = "alert alert-dark align-self-center"; //gray - not ready
							break;
						case 1:
							pick_class =
								"alert alert-primary align-self-center"; //blue -  ready to pick
							break;
						case 2:
							pick_class =
								"alert alert-warning align-self-center"; //yellow - picked being assembled
							break;
						case 3:
							pick_class =
								"alert alert-success align-self-center"; //green - returned to Kardex
							break;
						case 4:
							pick_class = "alert alert-danger align-self-center"; //red - Kit delivered
							break;
						default:
							put_class = "alert alert-light align-self-center";
					}
					return pick_class;
				},
				putClass: function () {
					var status = this.put_status;
					var put_class = "";
					switch (status) {
						case 0:
							put_class = "alert alert-dark align-self-center"; //gray - waiting for pick
							break;
						case 1:
							put_class = "alert alert-primary align-self-center"; //blue -  ready to put
							break;
						case 2:
							put_class = "alert alert-danger align-self-center"; //red - delivered
							break;
						case 3:
							put_class = "alert alert-success align-self-center"; //green - returned to Kardex
							break;
						default:
							put_class = "alert alert-light align-self-center";
					}
					return put_class;
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
					var query = "?name=" + this.kit_name;
					console.log(JSON.stringify(this.kit_list));
					Integrity.post(
						baseUrl + `/kit/pick${query}`,
						this.kit_list
					);
				},
				retrieveKits(query) {
					var baseUrl = `${this.config.API_PROTOCOL}://${this.config.API_HOST}/${this.config.API_PATH}`;
					var query = "?name=" + this.kit_name;
					Integrity.get(baseUrl + `/kit${query}`)
						.done(function (response) {
							if (response === null) {
								vm.kit_list = [
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
								vm.kit_list = response.data;
							}
						})
						.fail(function (err) {
							vm.kit_list = [
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
						let message = newValue.message;
						console.log(destination + " : " + message);

						if (destination === "message") {
							if (
								message.hasOwnProperty("message") &&
								message.hasOwnProperty("mode") &&
								message.hasOwnProperty("value")
							) {
								var mode = message.mode;
								if (mode == "pick") {
									this.pick_status = message.value;
									this.pick_message = message.message;
								} else if (mode == "put") {
									this.put_status = message.value;
									this.put_message = message.message;
								} else {
									this.update_msg = message.message;
									this.update_value = message.value;
								}
							}
						} else if (destination === "kit") {
							this.kit_name = message;
						}
					}
				},
				config: function (newValue) {
					if (
						this.config !== null &&
						typeof this.config !== "undefined" &&
						newValue !== null &&
						typeof newValue !== "undefined" &&
						this.kit_list.length === 0
					) {
						this.put_status = 1;
						var query = decodeURIComponent(location.search);
						const params = new URLSearchParams(query);
						this.kit_name = params.get("name");
						this.kit_name = this.kit_name.replace(/%20/g, " ");
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
