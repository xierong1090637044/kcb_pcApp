// table.vue
<template>
	<div style="position: relative;">
		<Spin size="large" fix v-if="loading"></Spin>
		
		<div style="margin-bottom: 10px;">
			<Breadcrumb  separator="<b style='color: #999;'>/</b>">
				<BreadcrumbItem to="/">首页</BreadcrumbItem>
				<BreadcrumbItem  to="/home/goods">供应商管理</BreadcrumbItem>
			</Breadcrumb>
		</div>
		
		<div style="margin-bottom: 10px;display: flex;align-items: center;justify-content: space-between;">
			<div style="display: flex;align-items: center;">
				<Button type="warning" @click="modal3 = true" icon="md-add" style="margin-right: 10px;background: #ed4014;">添加供货商</Button>
			</div>
		</div>
		
		<Table :columns="columns" :data="data" stripe border :height="screenHeight - 250">
			<template slot-scope="{ row, index }" slot="action">
				<Button type="primary" size="small" style="margin-right: 5px" @click="edit(row)">修改</Button>
				<Button type="error" size="small" @click="remove(row)">删除</Button>
			</template>
		</Table>

		<Modal v-model="modal2" width="360">
			<p slot="header" style="color:#f60;text-align:center">
				<Icon type="ios-information-circle"></Icon>
				<span>确定删除此供货商</span>
			</p>
			<div style="text-align:center">
				<p>删除后将无法恢复</p>
			</div>
			<div slot="footer">
				<Button type="error" size="large" long @click="del">删除</Button>
			</div>
		</Modal>

		<!--添加供货商-->
		<Modal v-model="modal3" title="添加供货商" @on-ok="add_producer" @on-cancel="producer= {}">
			<Form :label-width="80">
				<FormItem label="名字">
					<Input v-model="producer.producer_name" placeholder="请输入供货商的名字"></Input>
				</FormItem>
				<FormItem label="地址">
					<Input v-model="producer.producer_address" placeholder="请输入供货商的地址"></Input>
				</FormItem>
				<FormItem label="电话">
					<Input v-model="producer.producer_phone" placeholder="请输入供货商的电话"></Input>
				</FormItem>
				
				
				<FormItem label="欠款金额">
					<Input v-model="producer.debt" placeholder="请输入备注"></Input>
				</FormItem>
				
				<FormItem label="启用">
					<i-switch v-model="producer.disabled" size="large">
						<span slot="open">启</span>
						<span slot="close">关</span>
					</i-switch>
				</FormItem>
			</Form>
		</Modal>


	</div>
</template>
<script>
	import producers from '@/serve/producers.js';

	let that;
	export default {
		components: {

		},
		data() {
			return {
				screenHeight: window.innerHeight,
				producer: {
					producer_name: "",
					producer_address:"",
					producer_phone:"",
					debt: 0,
					disabled: true,
					objectId:"",
				}, //添加供货商的对象
				loading: false,
				modal: false,
				modal2: false,
				modal3: false,
				data: [],
				columns: [{
						type: 'index',
						width: 60,
						align: 'center'
					},
					{
						title: '供货商Id',
						key: 'objectId',
					},
					{
						title: '供货商名字',
						key: 'producer_name',
					},
					{
						title: '供货商地址',
						key: 'producer_address',
					},
					{
						title: '供货商电话',
						key: 'producer_phone',
					},
					{
						title: '是否已启用',
						key: 'disabled',
						render: (h, params) => {
							return h('div', [(params.row.disabled) ? "未启用" : "已启用"])
						}
					},
					{
						title: '欠款金额',
						key: 'debt',
					},
					{
						title: '创建时间',
						key: 'createdAt',
						sortable: true
					},
					{
						title: '操作',
						slot: 'action',
						align: 'center'
					}
				]
			}
		},

		mounted() {
			that = this;
			this.$Loading.start();
			producers.get_producerList().then(res=>{
				console.log(res)
				this.$Loading.finish();
				that.data = res;
			})
		},

		methods: {
			
			//添加供货商点击确定
			add_producer(){
				
				if(that.producer.producer_name){
					this.$Loading.start();
					producers.add_producer(that.producer).then(res=>{
						producers.get_producerList().then(res=>{
							this.$Message.success('成功');
							this.$Loading.finish();
							that.data = res;
						})
					});
				}else{
					this.$Message.error('请输入供货商名字');
				}
				
			},
			
			//修改供货商
			edit(row) {
				that.modal3 = true;
				that.producer.producer_name = row.producer_name
				that.producer.producer_address = row.producer_address
				that.producer.producer_phone = row.producer_phone
				that.producer.disabled = !row.disabled
				that.producer.debt = row.debt
				that.producer.objectId = row.objectId
			},

			//删除点击
			remove(row) {
				that.modal2 = true,
				that.producer.objectId = row.objectId
			},

			//确定删除
			del() {
				that.modal2 = false,
				this.$Loading.start();
				producers.delete_producer(that.producer.objectId).then(res => {
					producers.get_producerList().then(res=>{
						this.$Message.success('删除成功');
						this.$Loading.finish();
						that.data = res;
					})
				})
			},


		},
	}
</script>
