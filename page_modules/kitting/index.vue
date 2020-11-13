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
            <integrity-table
                v-if="hasList"
                :name="pageName"
                :collection="mainCollection"
                :columns="columns"
                @select="onSelect"
            >
            </integrity-table>
            <div v-else class="d-flex justify-content-center">
                <div class="container-fluid">
                    <div class="row justify-content-center">
                        <div class="spinner-border" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                    <div class="row justify-content-center">
                        <strong>{{ updateMsg }}</strong>
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
        const refreshListTimeout = 900000; //15min in ms

        const vm = new Vue({
            el: "#app",
            data: {
                updateMsg: "Waiting for server...",
                updateValue: 0,
                pageName: "Kitting Inventory",
                columns: ["Kit", "In-stock", "Required", " Status"],
                mainCollection: [],
                kitName: "",
            },
            computed: {
                hasList: function () {
                    return this.mainCollection.length > 0;
                },
                getMessages() {
                    if (
                        this.$mqtt !== null &&
                        typeof this.$mqtt !== "undefined"
                    ) {
                        return this.$mqtt.getMessage();
                    }
                },
            }, // --- End of computed --- //
            methods: {
                // This allows a page to set integrity-table cell styles by field and value conditionally
                cellStyleClass(item, field) {
                    if (field == "column5" && item.column5 > "2020-01-01") {
                        return "int-table-cell-pink";
                    }
                    return "";
                },
                // This allows a page to set integrity-table column widths and visibility
                colWidthClass(field) {
                    if (field == "column1") {
                        return "int-table-width-5";
                    } else if (field == "column10") {
                        return "int-table-width-3";
                    } else if (
                        ["column3", "column7", "column8", "column9"].indexOf(
                            field
                        ) > -1
                    ) {
                        return "int-table-width-none";
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
                retrieveKits() {
                    var baseUrl =
                        this.config.API_PROTOCOL +
                        "://" +
                        this.config.API_HOST +
                        "/" +
                        this.config.API_PATH;
                    Integrity.get(baseUrl + "/kits")
                        .done(function (response) {
                            if (response === null){
                                vm.mainCollection = [
                                    {
                                        kit: "No kits found",
                                        "in-stock": 0,
                                        total: 0,
                                        percent: "0%",
                                    },
                                ];
                            } else {
                                vm.mainCollection = response;
                                Integrity.setState(
                                    "main",
                                    JSON.stringify(vm.mainCollection)
                                );
                                Integrity.setState("date", Date.now());
                            }
                        })
                        .fail(function (err) {
                            vm.mainCollection = [
                                {
                                    kit: "Err",
                                    "in-stock": -1,
                                    total: -1,
                                    percent: "Err",
                                },
                            ];
                            console.log(err);
                        });
                },
                onSelect(item) {
                    try {
                        this.kitName = item.kit;
                        var url = window.location.pathname;
                        var path = url.substring(0, url.lastIndexOf("/"));
                        window.location.href =
                            path + `/detail.html?name=${this.kitName}`;
                    } catch (err) {
                        console.log(err);
                    }
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
								if (mode == "single") {
									this.updateMsg = message.message;
									this.updateValue = null;
								} 
							}
						}
                    }
                },
                config: function (newValue) {
                    if (
                        this.config !== null &&
                        typeof this.config !== "undefined" &&
                        newValue !== null &&
                        typeof newValue !== "undefined" &&
                        this.mainCollection.length === 0
                    ) {
                        this.retrieveKits();
                        this.$mqtt.connect();
                    }
                },
            }, // --- End of watch --- //
            // Available hooks: init,mounted,created,updated,destroyed
            created: function () {
                const storedList = JSON.parse(localStorage.getItem("main"));
                const storedDate = JSON.parse(localStorage.getItem("date"));
                if (storedList && storedDate) {
                    if (Date.now() - storedDate <= refreshListTimeout){
                        this.mainCollection = storedList;
                    }
                }
            },
            mounted: function () {},
            updated() {
                console.log("updated");
            },
            destroyed() {
                console.log("destroyed");
            },
            // --- End of hooks --- //
        }); // --- End of vm --- //
    </script>
</body>
</html>	
