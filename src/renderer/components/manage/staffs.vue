// table.vue
<template>
	<div style="position: relative;">
		<Spin size="large" fix v-if="loading"></Spin>

		<div style="margin-bottom: 10px;display: flex;align-items: center;justify-content: space-between;">

			<div style="display: flex;align-items: center;">
				<Button type="warning" @click="modal3 = true" icon="md-add" style="margin-right: 10px;background: #ed4014;">添加员工</Button>
			</div>

		</div>
		<Table :columns="columns" :data="data" stripe border>
			<template slot-scope="{ row, index }" slot="action">
				<Button type="primary" size="small" style="margin-right: 5px" @click="edit(row)">修改</Button>
				<Button type="error" size="small" @click="remove(row)">删除</Button>
			</template>
		</Table>

		<Modal v-model="modal2" width="360">
			<p slot="header" style="color:#f60;text-align:center">
				<Icon type="ios-information-circle"></Icon>
				<span>确定删除此员工</span>
			</p>
			<div style="text-align:center">
				<p>删除后将无法恢复</p>
			</div>
			<div slot="footer">
				<Button type="error" size="large" long @click="del">删除</Button>
			</div>
		</Modal>

		<!--添加员工-->
		<Modal v-model="modal3" title="添加员工" @on-ok="add_staff" @on-cancel="staff= {}">
			<Form :label-width="80">
				<FormItem label="名字">
					<Input v-model="staff.name" placeholder="请输入员工的名字"></Input>
				</FormItem>

				<FormItem label="账号">
					<Input v-model="staff.mobilePhoneNumber" placeholder="请输入员工的登陆"></Input>
				</FormItem>
				<FormItem label="密码">
					<Input v-model="staff.password" placeholder="请输入员工的登陆密码"></Input>
				</FormItem>

				<FormItem label="负责门店">
					<Select v-model="staff.shop" placeholder="请选择负责的门店">
						<Option v-for="(item,index) in shops" :value="item.objectId" :key="index">{{item.name}}</Option>
					</Select>
				</FormItem>

				<FormItem label="地址">
					<Input v-model="staff.address" placeholder="请输入员工的联系地址"></Input>
				</FormItem>

				<FormItem label="启用">
					<i-switch v-model="staff.disabled" size="large">
						<span slot="open">启</span>
						<span slot="close">关</span>
					</i-switch>
				</FormItem>

				<FormItem label="管理权限">
					<CheckboxGroup v-model="staff.rights.current">
						<Checkbox v-for="(item,index) in frist_rights" :label="index" :key="index">
							<span>{{item}}</span>
						</Checkbox>
					</CheckboxGroup>
				</FormItem>

				<FormItem label="查看权限">
					<CheckboxGroup v-model="staff.rights.recodecurrent">
						<Checkbox v-for="(item,index) in second_rights" :label="index" :key="index">
							<span>{{item}}</span>
						</Checkbox>
					</CheckboxGroup>
				</FormItem>
			</Form>
		</Modal>


	</div>
</template>
<script>
	import staffs from '@/serve/staffs.js';
	import shops from '@/serve/shops.js';
	import expandRights from '@/components/component/expandRights.vue';

	let that;
	export default {
		components: {
			expandRights
		},
		data() {
			return {
				shops: [],
				frist_rights: ["产品管理", "员工管理", "仓库管理", "门店管理", "客户管理", "产品类别管理"],
				second_rights: ["入库记录", "出库记录", "客户退货记录", "盘点记录", "经营状况"],
				staff: {
					name: "",
					mobilePhoneNumber: "",
					password: "",
					shop: '',
					address: "",
					disabled: true,
					rights: {
						current: [],
						recodecurrent: []
					},
					objectId: "",
				}, //添加员工的对象
				loading: false,
				modal: false,
				modal2: false,
				modal3: false,
				data: [],
				columns: [{
						type: 'expand',
						width: 50,
						render: (h, params) => {
							return h(expandRights, {
								props: {
									row: params.row.rights
								}
							})
						}
					}, {
						type: 'index',
						width: 60,
						align: 'center'
					},
					{
						title: '员工Id',
						key: 'objectId',
					},
					{
						title: '员工名字',
						key: 'username',
					},
					{
						title: '联系地址',
						key: 'address',
					},
					{
						title: '登录账号',
						key: 'mobilePhoneNumber',
					},
					{
						title: '登录密码',
						key: 'password',
					},
					{
						title: '负责门店',
						key: 'shop',
						render: (h, params) => {
							return h('div', [params.row.shop?params.row.shop.name:"无"])
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
			staffs.get_stafflist().then(res => {
				console.log(res)
				this.$Loading.finish();
				that.data = res;
			})

			shops.get_shopList().then(res => {
				console.log(res)
				that.shops = res;
			})
		},

		methods: {

			//添加员工点击确定
			add_staff() {
				console.log(that.staff)
				if (that.staff.name) {
					this.$Loading.start();
					staffs.add_staff(that.staff).then(res => {
						staffs.get_stafflist().then(res => {
							this.$Message.success('成功');
							this.$Loading.finish();
							that.data = res;
						})
					});
				} else {
					this.$Message.error('请输入员工名字');
				}

			},

			//修改员工
			edit(row) {
				that.modal3 = true;
				that.staff.name = row.username
				that.staff.mobilePhoneNumber = row.mobilePhoneNumber
				that.staff.password = row.password
				that.staff.shop = (row.shop.name) ? (row.shop.name) : ""
				that.staff.address = row.address
				that.staff.objectId = row.objectId
				that.staff.disabled = !row.disabled
			},

			//删除分类点击
			remove(row) {
				that.modal2 = true,
					that.staff.objectId = row.objectId
			},

			//确定删除
			del() {
				that.modal2 = false,
					this.$Loading.start();
				staffs.delete_staff(that.staff.objectId).then(res => {
					staffs.get_stafflist().then(res => {
						this.$Message.success('删除成功');
						this.$Loading.finish();
						that.data = res;
					})
				})
			},


		},
	}
</script>
