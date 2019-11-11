// table-expand.vue
<style scoped>
	.expand-row {
		margin-bottom: 16px;
	}
</style>
<template>
	<div style="position: relative;">
		<Row class="expand-row" v-for="(item,index) in details" :key="index">
			<Col span="5">
			<span class="expand-key">操作商品： </span>
			<span class="expand-value">{{ item.goodsName }}</span>
			</Col>
			<Col span="5">
			<span class="expand-key">数量: </span>
			<span class="expand-value">X {{ item.num }}</span>
			</Col>
			<Col span="5">
			<span class="expand-key">实际应收: </span>
			<span class="expand-value">{{ item.total_money }}</span>
			</Col>
			<Col span="5">
			<span class="expand-key">实际收款: </span>
			<span class="expand-value">{{ item.retailPrice }}</span>
			</Col>
		</Row>
	</div>
</template>
<script>
	export default {
		props: {
			row: Object,
		},

		data() {
			return {
				details: this.row.detail,
			}
		},

		mounted() {
			console.log(this.row.detail)
			/*const query = Bmob.Query('order_opreations');
			query.include("goodsId");
			query.field('relations', this.row.objectId);
			query.relation('Bills').then(res => {
				console.log(res);
				this.details = res.results;
				this.loading = false;
			})*/

		},
	};
</script>
