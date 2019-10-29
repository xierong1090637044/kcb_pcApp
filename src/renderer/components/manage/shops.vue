// table.vue
<template>
	<div style="position: relative;">
		<Spin size="large" fix v-if="loading"></Spin>
		
		<div style="margin-bottom: 10px;">
			<Breadcrumb  separator="<b style='color: #999;'>/</b>">
				<BreadcrumbItem to="/">首页</BreadcrumbItem>
				<BreadcrumbItem  to="/home/goods">门店管理</BreadcrumbItem>
			</Breadcrumb>
		</div>
		
		<div style="margin-bottom: 10px;display: flex;align-items: center;justify-content: space-between;">
			<div style="display: flex;align-items: center;">
				<Button type="warning" @click="modal3 = true" icon="md-add" style="margin-right: 10px;background: #ed4014;">添加门店</Button>
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
				<span>确定删除此分类</span>
			</p>
			<div style="text-align:center">
				<p>删除后将无法恢复</p>
			</div>
			<div slot="footer">
				<Button type="error" size="large" long @click="del">删除</Button>
			</div>
		</Modal>

		<!--添加门店-->
		<Modal v-model="modal3" title="添加门店" @on-ok="add_shop" @on-cancel="shop= {}">
			<Form :label-width="80">
				<FormItem label="名字">
					<Input v-model="shop.name" placeholder="请输入门店的名字"></Input>
				</FormItem>
				<FormItem label="地址">
					<Input v-model="shop.address" placeholder="请输入门店的地址"></Input>
				</FormItem>
				<FormItem label="电话">
					<Input v-model="shop.phone" placeholder="请输入门店的电话"></Input>
				</FormItem>
				
				
				<FormItem label="备注">
					<Input v-model="shop.beizhu" placeholder="请输入备注"></Input>
				</FormItem>
				
				<FormItem label="启用">
					<i-switch v-model="shop.disabled" size="large">
						<span slot="open">启</span>
						<span slot="close">关</span>
					</i-switch>
				</FormItem>
			</Form>
		</Modal>


	</div>
</template>
<script>
	import shops from '@/serve/shops.js';

	let that;
	export default {
		components: {

		},
		data() {
			return {
				screenHeight: window.innerHeight,
				shop: {
					name: "",
					address:"",
					phone:"",
					beizhu: "",
					disabled: true,
					objectId:"",
				}, //添加门店的对象
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
						title: '门店Id',
						key: 'objectId',
					},
					{
						title: '门店名字',
						key: 'name',
					},
					{
						title: '门店地址',
						key: 'address',
					},
					{
						title: '门店电话',
						key: 'phone',
					},
					/*{
						title: '门店负责人',
						key: 'charge',
						render: (h, params) => {
							return h('div', [params.row.charge.nickName])
						}
					},*/
					{
						title: '是否已启用',
						key: 'disabled',
						render: (h, params) => {
							return h('div', [(params.row.disabled) ? "未启用" : "已启用"])
						}
					},
					{
						title: '备注',
						key: 'beizhu',
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
			shops.get_shopList().then(res=>{
				console.log(res)
				this.$Loading.finish();
				that.data = res;
			})
		},

		methods: {
			
			//添加门店点击确定
			add_shop(){
				
				if(that.shop.name){
					this.$Loading.start();
					shops.add_shop(that.shop).then(res=>{
						shops.get_shopList().then(res=>{
							this.$Message.success('成功');
							this.$Loading.finish();
							that.data = res;
						})
					});
				}else{
					this.$Message.error('请输入门店名字');
				}
				
			},
			
			//修改门店
			edit(row) {
				that.modal3 = true;
				that.shop.name = row.name
				that.shop.address = row.address
				that.shop.phone = row.phone
				that.shop.disabled = !row.disabled
				that.shop.beizhu = row.beizhu
				that.shop.objectId = row.objectId
			},

			//删除分类点击
			remove(row) {
				that.modal2 = true,
				that.shop.objectId = row.objectId
			},

			//确定删除
			del() {
				that.modal2 = false,
				this.$Loading.start();
				shops.delete_shop(that.shop.objectId).then(res => {
					shops.get_shopList().then(res=>{
						this.$Message.success('删除成功');
						this.$Loading.finish();
						that.data = res;
					})
				})
			},


		},
	}
</script>
