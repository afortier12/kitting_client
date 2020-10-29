<template>
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

</template>

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

module.exports = {
	props:{
		'update_msg': {type: String, default: 'Waiting for server...'},
		'update_value': {type: Number, default: 0},
		'kit_data_service': {type: Object},
	},
    data() {
        return {
			pageName: 'Kitting Inventory',
			columns: ["Kit", "In-stock", "Required", " Status"],
			main_collection: [],
        };
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
				try{
					let response = await this.kit_data_service.getAll()
					if (response === null)
						this.main_collection.push({kit: "No kits found", 'in-stock':0, total:0, percent:"0%"})
					else
						this.main_collection = response.data
				} catch(err) {
					console.log(err);
				}

			},
        	async onSelect(item) {
            	try{
					//let response = await this.kit_data_service.get(item.kit)
					var kit_name = item.kit
					//this.kit_collection = response.data.kit_detail
					this.$router.push({ name:'kit_details', path: 'kit', params: {kit_name: kit_name} })// , query: { kit_list: this.kit_collection } })
				} catch(err) {
					console.log(err);
				}
      	  	},
        
		}, // --- End of methods --- //
        watch: {
			kit_data_service: function(val){
				if (val !== null)
					this.retrieveKits();
			},
		},  // --- End of watch --- //
		// Available hooks: init,mounted,created,updated,destroyed
		created: function(){
			var key;
			var properties = {}
			for(key in this.$props){
				// using Object.hasOwnProperty to find if a property is directly on an object
				if(this.$props.hasOwnProperty(key)){
					properties[key]= key
				}
			}
			this.$parent.$emit('update:properties',properties);
		},
		mounted: function(){

        } // --- End of mounted hook --- //
}
</script>
