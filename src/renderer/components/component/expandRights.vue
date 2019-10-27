// table-expand.vue
<style scoped>
	.expand-row {
		margin-bottom: 16px;
	}
</style>
<template>
	<div style="position: relative;">
		
		<Row style="margin-bottom: 6px;"><span class="expand-key" style="color:#f30;font-weight: bold;">管理权限 </span></Row>
		<Row class="expand-row">
			<Col span="3" v-for="(item,index) in frist_rights" :key="index">
			<span class="expand-key" v-if="item == '0'">产品管理 </span>
			<span class="expand-key" v-if="item == '1'">员工管理 </span>
			<span class="expand-key" v-if="item == '2'">仓库管理 </span>
			<span class="expand-key" v-if="item == '3'">门店管理 </span>
			<span class="expand-key" v-if="item == '4'">客户管理 </span>
			<span class="expand-key" v-if="item == '5'">产品类别管理 </span>
			</Col>
		</Row>
		
		<Row style="margin-bottom: 6px;"><span class="expand-key" style="color:#f30;font-weight: bold;">查看权限 </span></Row>
		<Row class="expand-row">
			<Col span="3" v-for="(item,index) in second_rights" :key="index">
			<span class="expand-key" v-if="item == '0'">入库记录 </span>
			<span class="expand-key" v-if="item == '1'">出库记录 </span>
			<span class="expand-key" v-if="item == '2'">客户退货记录 </span>
			<span class="expand-key" v-if="item == '3'">盘点记录 </span>
			<span class="expand-key" v-if="item == '4'">经营状况 </span>
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
				frist_rights:[],
				second_rights:[]
			}
		},

		mounted() {
			console.log(this.row)
			
			this.frist_rights = this.row.current
			this.second_rights = this.row.recodecurrent
		},
	};
</script>
