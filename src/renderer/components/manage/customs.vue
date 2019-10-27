// table.vue
<template>
	<div style="position: relative;">
		<Spin size="large" fix v-if="loading"></Spin>

		<div style="margin-bottom: 10px;display: flex;align-items: center;justify-content: space-between;">

			<div style="display: flex;align-items: center;">
				<Button type="warning" @click="modal3 = true" icon="md-add" style="margin-right: 10px;background: #ed4014;">添加客户</Button>
			</div>

		</div>
		<Table :columns="columns" :data="data" stripe border>
			<template slot-scope="{ row, index }" slot="action">
				<div  v-if="state == 'choose'">
					<Button type="primary" size="small" style="margin-right: 5px" @click="choose(row)">选择</Button>
				</div>
				<div v-else>
					<Button type="primary" size="small" style="margin-right: 5px" @click="edit(row)">修改</Button>
					<Button type="error" size="small" @click="remove(row)">删除</Button>
				</div>
			</template>
		</Table>

		<Modal v-model="modal2" width="360">
			<p slot="header" style="color:#f60;text-align:center">
				<Icon type="ios-information-circle"></Icon>
				<span>确定删除此客户</span>
			</p>
			<div style="text-align:center">
				<p>删除后将无法恢复</p>
			</div>
			<div slot="footer">
				<Button type="error" size="large" long @click="del">删除</Button>
			</div>
		</Modal>

		<!--添加客户-->
		<Modal v-model="modal3" title="添加客户" @on-ok="add_custom"  @on-cancel="custom= {}">>
			<Form :label-width="80">
				<FormItem label="名字">
					<Input v-model="custom.custom_name" placeholder="请输入客户的名字"></Input>
				</FormItem>
				<FormItem label="地址">
					<Input v-model="custom.custom_address" placeholder="请输入客户的地址"></Input>
				</FormItem>
				<FormItem label="电话">
					<Input v-model="custom.custom_phone" placeholder="请输入客户的电话"></Input>
				</FormItem>
				
				
				<FormItem label="欠款金额">
					<Input v-model="custom.debt" placeholder="请输入备注"></Input>
				</FormItem>
				
				<FormItem label="启用">
					<i-switch v-model="custom.disabled" size="large">
						<span slot="open">启</span>
						<span slot="close">关</span>
					</i-switch>
				</FormItem>
			</Form>
		</Modal>


	</div>
</template>
<script>
	import customs from '@/serve/customs.js';

	let that;
	export default {
		components: {

		},
		data() {
			return {
				state:'normal',//当前客户的模式   choose 选择模式
				custom: {
					custom_name: "",
					custom_address:"",
					custom_phone:"",
					debt: 0,
					disabled: true,
					objectId:"",
				}, //添加客户的对象
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
						title: '客户Id',
						key: 'objectId',
					},
					{
						title: '客户名字',
						key: 'custom_name',
					},
					{
						title: '客户地址',
						key: 'custom_address',
					},
					{
						title: '客户电话',
						key: 'custom_phone',
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
			//console.log(this.$route.query.type)
			that = this;
			that.state = this.$route.query.type?this.$route.query.type:'normal'
			//console.log(that.state)
			this.$Loading.start();
			customs.get_customList().then(res=>{
				console.log(res)
				this.$Loading.finish();
				that.data = res;
			})
		},

		methods: {
			
			//选择当前客户
			choose(row){
				console.log(row)
				localStorage.setItem("select_custom",JSON.stringify(row))
				this.$router.push({ path: '/home/operations' })
			},
			
			//添加客户点击确定
			add_custom(){
				
				if(that.custom.custom_name){
					this.$Loading.start();
					customs.add_custom(that.custom).then(res=>{
						customs.get_customList().then(res=>{
							this.$Message.success('成功');
							this.$Loading.finish();
							that.data = res;
						})
					});
				}else{
					this.$Message.error('请输入客户名字');
				}
				
			},
			
			//修改客户
			edit(row) {
				that.modal3 = true;
				that.custom.custom_name = row.custom_name
				that.custom.custom_address = row.custom_address
				that.custom.custom_phone = row.custom_phone
				that.custom.disabled = !row.disabled
				that.custom.debt = row.debt
				that.custom.objectId = row.objectId
			},

			//删除分类点击
			remove(row) {
				that.modal2 = true,
				that.custom.objectId = row.objectId
			},

			//确定删除
			del() {
				that.modal2 = false,
				this.$Loading.start();
				customs.delete_custom(that.custom.objectId).then(res => {
					customs.get_customList().then(res=>{
						this.$Message.success('删除成功');
						this.$Loading.finish();
						that.data = res;
					})
				})
			},


		},
	}
</script>
