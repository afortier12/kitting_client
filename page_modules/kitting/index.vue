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
<body href="/">
	<div id="app" v-cloak>
		<!-- APP-TEMPLATE -->
		<div class="app-container">
			<keep-alive>
				<router-view :kit_data_service="kit_data_service" v-bind="properties"/>
			</keep-alive>
		</div>
	</div>

<script>
	/* APP-SCRIPT */
</script>
</body>
</html>	
