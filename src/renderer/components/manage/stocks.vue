// table.vue
<template>
	<div style="position: relative;">
		<Spin size="large" fix v-if="loading"></Spin>
		
		<div style="margin-bottom: 10px;">
			<Breadcrumb  separator="<b style='color: #999;'>/</b>">
				<BreadcrumbItem to="/">首页</BreadcrumbItem>
				<BreadcrumbItem  to="/home/goods">仓库管理</BreadcrumbItem>
			</Breadcrumb>
		</div>
		
		<div style="margin-bottom: 10px;display: flex;align-items: center;justify-content: space-between;">

			<div style="display: flex;align-items: center;">
				<Button type="warning" @click="modal3 = true" icon="md-add" style="margin-right: 10px;background: #ed4014;">添加仓库</Button>
			</div>

		</div>
		<Table :columns="columns" :data="data" stripe border :height="screenHeight - 250">
			<template slot-scope="{ row, index }" slot="action">
				<Button type="primary" size="small" style="margin-right: 5px" @click="edit(row)">修改</Button>
				<Button type="error" size="small" @click="remove(row)">删除</Button>
			</template>
		</Table>

		<!--<Modal v-model="modal" title="修改一级分类" @on-ok="modal_confrim">
			<Form :label-width="80">
				<FormItem label="名字">
					<Input v-model="class_text"></Input>
				</FormItem>
			</Form>
		</Modal>-->

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

		<!--添加仓库-->
		<Modal v-model="modal3" title="添加仓库" @on-ok="add_stock" @on-cancel="stock= {}">
			<Form :label-width="80">
				<FormItem label="名字">
					<Input v-model="stock.name" placeholder="请输入仓库的名字"></Input>
				</FormItem>
				
				
				<FormItem label="负责人">
					<Select v-model="stock.charge" placeholder="请选择仓库负责人">
						<Option v-for="(item,index) in charge" :value="item.objectId" :key="index">{{item.username}}</Option>
					</Select>
				</FormItem>
				
				<FormItem label="备注">
					<Input v-model="stock.beizhu" placeholder="请输入备注"></Input>
				</FormItem>
				
				<FormItem label="启用">
					<i-switch v-model="stock.disabled" size="large">
						<span slot="open">启</span>
						<span slot="close">关</span>
					</i-switch>
				</FormItem>
			</Form>
		</Modal>


	</div>
</template>
<script>
	import manage from '@/serve/manage.js';
	import jrQrcode from "jr-qrcode";
	
	let that;
	export default {
		components: {
			
		},
		data() {
			return {
				screenHeight: window.innerHeight,
				charge:"",
				stock: {
					name: "",
					disabled: true,
					charge:"",
					shop:"",
					beizhu: "",
					objectId:"",
				}, //添加仓库的对象
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
						title: '仓库Id',
						key: 'objectId',
					},
					{
						title: '仓库名字',
						key: 'stock_name',
					},
					{
						title: '仓库负责人',
						key: 'charge',
						render: (h, params) => {
							return h('div', [params.row.charge?params.row.charge.nickName:''])
						}
					},
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
						title: '仓库二维码',
						width: 100,
						key: 'qrcodeImg',
						render: (h, params) => {
							return h('div', {
								style: {
									"text-align": "center",
									"padding":"10px 0"
								},
							}, [
								h('img', {
									style: {
										width: "65px",
									},
									attrs: {
										src: params.row.qrcodeImg
									}
								})
							]);
						}
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
			manage.getstock_list().then(res=>{
				for(let item of res){
					item.qrcodeImg = jrQrcode.getQrBase64((item.objectId + '-stock'))
				}
				that.data = res
				manage.get_chargeList().then(res=>{
					
					this.$Loading.finish();
					that.charge = res;
				})
			})
			
		},

		methods: {
			
			//添加仓库点击确定
			add_stock(){
				this.$Loading.start();
				manage.add_stock(that.stock).then(res=>{
					manage.getstock_list().then(res=>{
						this.$Message.success('成功');
						this.$Loading.finish();
						that.data = res;
					})
				});
			},
			
			//修改仓库
			edit(row) {
				that.modal3 = true;
				that.stock.name = row.stock_name
				that.stock.disabled = !row.disabled
				that.stock.beizhu = row.beizhu
				that.stock.objectId = row.objectId
			},

			//删除分类点击
			remove(row) {
				that.modal2 = true,
				that.stock.objectId = row.objectId
			},

			//确定删除
			del() {
				that.modal2 = false,
				this.$Loading.start();
				manage.delete_stock(that.stock.objectId).then(res => {
					manage.getstock_list().then(res=>{
						this.$Message.success('删除成功');
						this.$Loading.finish();
						that.data = res;
					})
				})
			},


		},
	}
</script>
