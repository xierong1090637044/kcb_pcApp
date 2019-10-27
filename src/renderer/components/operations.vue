<template>
	<div>
		<div style="display: flex;align-items: center;margin-bottom: 20px;">
			<Dropdown style="margin-right: 10px" @on-click="selected_options">
				<Button type="primary">
					选择操作类型
					<Icon type="ios-arrow-down"></Icon>
				</Button>
				<DropdownMenu slot="list">
					<DropdownItem name="0">全部</DropdownItem>
					<DropdownItem name="-1">出库</DropdownItem>
					<DropdownItem name="1">入库</DropdownItem>
					<DropdownItem name="2">退货</DropdownItem>
					<DropdownItem name="3">盘点</DropdownItem>
				</DropdownMenu>
			</Dropdown>

			<Button type="error" @click="modal1=true" icon="ios-funnel-outline" style="margin-right: 10px;">筛选</Button>

			<Button type="primary" @click="exportData()" icon="ios-download-outline"> 导出操作数据</Button>

		</div>

		<Table :columns="columns" :data="order_opreations" :loading="loading" ref="table" border size="small" :height="screenHeight - 200"
		 v-if="type == 0"></Table>
		<Table :columns="pandian_columns" :data="order_bills" :loading="loading" ref="table" border size="small" :height="screenHeight - 200"
		 v-else-if="type == 3"></Table>
		<Table :columns="bills_columns" :data="order_bills" ref="table" border size="small" :height="screenHeight - 200"
		 v-else></Table>


		<Modal v-model="modal1" title="筛选" @on-ok="modal_confrim" @on-cancel="cancel" cancel-text="重置">
			<Form :label-width="80">
				
				<FormItem label="请选择时间">
					<DatePicker type="date" placeholder="选择起始时间" style="width: 200px" @on-change="change_startdata" v-model="start_time"></DatePicker>
					<DatePicker type="date" placeholder=" 选择结束时间" style="width: 200px" @on-change="change_enddata" v-model="end_time"></DatePicker>
				</FormItem>
				

				<FormItem label="请选择客户" v-if="type == -1" style="margin-top: 10px;">
					<router-link to="/home/manage/customs?type=choose">
						<Input v-model="select_custom.custom_name" placeholder="请选择客户"></Input>
					</router-link>
				</FormItem>

			</Form>
		</Modal>

		<div style="margin: 10px;overflow: hidden">
			<div style="float: right;">
				<Page :total="100" :current="pege_number" @on-change="changePage"></Page>
			</div>
		</div>

	</div>
</template>
<script>
	import common from '@/serve/common.js';
	import customs from '@/serve/customs.js';

	import expandRow from '@/components/component/expandRow.vue';
	let that;

	export default {
		components: {
			expandRow
		},
		data() {
			return {
				select_custom: '',
				start_time: '',
				end_time: '',
				type: 0, //操作类型
				order_opreations: [],
				order_bills: [],
				padding_size: 30,
				modal1: false,
				userid: JSON.parse(localStorage.getItem('bmob')).objectId || '',
				page_size: 100,
				pege_number: 1,
				screenHeight: window.innerHeight,
				loading: true,
				pandian_columns: [{
					title: '操作产品',
					key: 'goodsName',
					sortable: true,
				}, {
					title: '操作类型',
					key: 'type',
					render: (h, params) => {
						return h('div', ["盘点"]);
					}
				}, {
					title: '盘点前库存',
					key: 'reserve',
				}, {
					title: '盘点后库存',
					key: 'now_reserve',
				}, {
					title: '操作者',
					key: 'opreater',
					render: (h, params) => {
						return h('div', [params.row.operater ? params.row.operater.nickName : "无"]);
					}
				}, {
					title: '创建时间',
					key: 'createdAt',
					sortable: true
				}],
				bills_columns: [{
					title: '操作产品',
					key: 'goodsName',
					sortable: true,
				}, {
					title: '操作类型',
					key: 'type',
					render: (h, params) => {
						if (params.row.type == 1) {
							return h('div', ["入库"]);
						} else if (params.row.type == -1) {
							return h('div', ["出库"]);
						} else if (params.row.type == 2) {
							return h('div', ["退货"]);
						} else if (params.row.type == 3) {
							return h('div', ["盘点"]);
						}

					}
				}, {
					title: '数量',
					key: 'num',
				}, {
					title: '实际单价',
					key: 'retailPrice',
				}, {
					title: '总计',
					key: 'total_money',
				}, {
					title: '操作者',
					key: 'createdAt',
					key: 'opreater',
					render: (h, params) => {
						return h('div', [params.row.operater ? params.row.operater.nickName : "无"]);
					}
				}, {
					title: '创建时间',
					key: 'createdAt',
					sortable: true
				}],
				columns: [{
						type: 'expand',
						width: 50,
						render: (h, params) => {
							return h(expandRow, {
								props: {
									row: params.row
								}
							})
						}
					},
					{
						type: 'index',
						width: 60,
						align: 'center'
					},
					{
						title: '操作产品',
						key: 'goodsName',
						sortable: true,
						render: (h, params) => {
							return h('div', [params.row.goodsName + " 等"]);
						}
					},
					{
						title: '实际应付（实际应收）',
						key: 'all_money',
						sortable: true
					},
					{
						title: '欠款',
						key: 'debt',
						sortable: true
					},
					{
						title: '操作类型',
						key: 'type',
						render: (h, params) => {
							if (params.row.type == 1) {
								return h('div', ["入库"]);
							} else if (params.row.type == -1) {
								return h('div', ["出库"]);
							} else if (params.row.type == 2) {
								return h('div', ["退货"]);
							} else if (params.row.type == 3) {
								return h('div', ["盘点"]);
							}

						}
					},
					{
						title: '操作者',
						key: 'opreater',
						render: (h, params) => {
							return h('div', [params.row.opreater.nickName]);
						}
					},
					{
						title: '创建时间',
						key: 'createdAt',
						sortable: true
					}
				],
			};
		},

		mounted() {
			that = this;
			window.onresize = () => {
				return (() => {
					that.screenHeight = window.innerHeight;
				})();
			};

			if (localStorage.getItem("select_custom")) {
				that.type = -1;
				that.modal1 = true;
				that.select_custom = JSON.parse(localStorage.getItem("select_custom"));

				that.get_bills()
			} else {
				this.get_operations();
			}
		},

		destroyed() {
			localStorage.removeItem("select_custom")
		},

		methods: {

			//选择起始时间
			change_startdata(e) {
				if(e){
					that.start_time = e+" 00:00:00"
				}
				
			},

			//选择结束时间
			change_enddata(e) {
				if(e){
					that.end_time = e+" 00:00:00"
				}
			},

			//筛选确定
			modal_confrim() {
				if (that.type == 0) {
					that.get_operations();
				} else {
					that.get_bills()
				}
			},

			//筛选取消
			cancel() {
				that.select_custom = ''
				localStorage.removeItem("select_custom")
				that.start_time =''
				that.end_time = ''
				if (that.type == 0) {
					that.get_operations();
				} else {
					that.get_bills()
				}
			},

			//导出数据表格点击
			exportData(type) {
				if (that.type == 0) {
					this.$Message.warning('请选择操作类型');
				} else if (that.type == -1) {
					this.$refs.table.exportCsv({
						filename: '出库记录',
					});
				} else if (that.type == 1) {
					this.$refs.table.exportCsv({
						filename: '入库记录',
					});
				} else if (that.type == 2) {
					this.$refs.table.exportCsv({
						filename: '退货记录',
					});
				} else if (that.type == 3) {
					this.$refs.table.exportCsv({
						filename: '盘点记录',
					});
				}

			},

			//选择操作是触发
			selected_options(name) {
				console.log(name)
				that.type = Number(name)
				if (that.type == 0) {
					that.get_operations();
				} else {
					that.get_bills()
				}
			},

			//改变页数
			changePage(pege_number) {
				that.pege_number = pege_number;

				if (that.type == 0) {
					that.get_operations();
				} else {
					that.get_bills()
				}
			},

			//查询操作列表
			get_operations() {
				const query = Bmob.Query('order_opreations');
				query.equalTo('master', '==', that.userid);
				if(that.start_time){
					query.equalTo("createdAt", ">",that.start_time);
				}
				if(that.end_time){
					query.equalTo("createdAt", "<" ,that.end_time);
				}
				query.include("opreater", "custom", "producer");
				query.limit(that.page_size);
				query.skip(that.page_size * (that.pege_number - 1));
				query.order("-createdAt"); //按照条件降序
				query.find().then(res => {
					console.log(res);
					this.order_opreations = res;
					this.loading = false;
				});
			},

			//查询所有的单个操作列表
			get_bills() {
				const query = Bmob.Query('Bills');
				query.equalTo('userId', '==', that.userid);
				query.equalTo('type', '==', that.type);
				if(that.start_time){
					query.equalTo("createdAt", ">",that.start_time);
				}
				if(that.end_time){
					query.equalTo("createdAt", "<" ,that.end_time);
				}
				if (that.type == -1 && that.select_custom && that.modal1 == false) {
					query.equalTo('custom', '==', that.select_custom.objectId);
				}
				query.limit(that.page_size);
				query.skip(that.page_size * (that.pege_number - 1));
				query.order("-createdAt"); //按照条件降序
				query.include("operater", "custom", "producer");
				query.find().then(res => {
					console.log(res);
					that.order_bills = res
				});
			}
		}
	};
</script>
