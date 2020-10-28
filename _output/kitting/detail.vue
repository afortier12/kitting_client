<template>
	<div>
		<div class="btn-toolbar">
			<button type="button" class="btn btn-primary mb-3 mr-5">Pick Kit</button>
			<button type="button" class="btn btn-primary mb-3">Put Kit</button>
		</div>
		<integrity-table v-if="kit_list.length" :name="getTitle" :collection="kit_list" :columns="columns">
		</integrity-table>
	</div>
</template>

<script>
// While the browser ES6 modules use `export default`, for http-vue-loader to work `module.exports = ...` has to be used
module.exports = {
    props:{
			kit_data_service: {type: Object},
			kit_name: {type: String, default: ''},
		},
    data() {
        return {
			pageName: 'Kitting Inventory',	  
			columns: ["Detail", "Part Number", "Description", "Material", " Quantity"],
			kit_list: [],
        };
    },
    computed: {
		getTitle: function() {
            var title = "Kit#: " + this.kit_name + " " + this.pageName
 			return title
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
			async retrieveItems(){
				try{
					console.log(this.kit_name)
					console.log(this.kit_data_service)
					let response = await this.kit_data_service.get(this.kit_name)
					this.kit_list = response.data.kit_detail
				} catch(err) {
					console.log(err);
				}

			},
		}, // --- End of methods --- //
        watch: {

		},  // --- End of watch --- //
        // Available hooks: init,mounted,created,updated,destroyed
		mounted: function(){
			this.retrieveItems();
        } // --- End of mounted hook --- //
}
</script>