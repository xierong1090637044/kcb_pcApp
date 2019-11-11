<template>
	<div>
		<div style="margin-bottom: 10px;">
			<Breadcrumb separator="<b style='color: #999;'>/</b>">
				<BreadcrumbItem to="/">首页</BreadcrumbItem>
				<BreadcrumbItem to="/home/goods">产品管理</BreadcrumbItem>
			</Breadcrumb>
		</div>

		<div style="margin-bottom: 10px;display: flex;align-items: center;justify-content: space-between;">

			<div style="display: flex;align-items: center;">
				<Dropdown style="margin-right: 10px" @on-click="selected_options" trigger="click" >
					<Button type="primary">
						打印操作
						<Icon type="ios-arrow-down"></Icon>
					</Button>
					<DropdownMenu slot="list">
						<DropdownItem name="打印">
							<Button type="primary" long v-print="'#print_selectedqr'"> 打印选中商品的二维码</Button>
						</DropdownItem>
						<DropdownItem name="批量打印当前页面二维码">
							<Button type="primary" long v-print="'#print_allqr'"> 批量打印当前页面二维码</Button>
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown style="margin-right: 10px" trigger="click" >
					<Button type="primary">
						产品操作
						<Icon type="ios-arrow-down"></Icon>
					</Button>
					<DropdownMenu slot="list">
						<DropdownItem name="添加产品">
							<Button type="primary" long style="margin-right: 10px;" @click="addProduct">添加产品</Button>
						</DropdownItem>
						<DropdownItem name="删除">
							<Button type="primary" long @click="delete_good()" style="margin-right: 10px;">删除</Button>
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown style="margin-right: 10px" trigger="click" >
					<Button type="primary">
						导入导出操作
						<Icon type="ios-arrow-down"></Icon>
					</Button>
					<DropdownMenu slot="list">
						<DropdownItem name="下载导入产品数据样本">
							<Button type="primary" @click="download_demo()" long> 下载导入产品数据样本</Button>
						</DropdownItem>
						<DropdownItem name="导出产品数据">
							<Button type="primary" @click="exportData()" long> 导出产品数据</Button>
						</DropdownItem>
						<DropdownItem name="上传Excel表格数据">
							<input class="input-file" type="file" @change="importfile" accept=".csv,.excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
							 style="display: none;" />
							<Button type="primary" @click="btnClick" long>上传Excel表格数据(一次最多50条数据)</Button>
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Button type="error" @click="modal1=true" icon="ios-funnel-outline">筛选</Button>
			</div>
		</div>

		<Table :columns="columns" :data="goods" :loading="loading" ref="table" border size="small" :height="screenHeight - 240"
		 @on-select="get_select" @on-select-cancel="cancle_select" @on-select-all-cancel="cancle_select" id="print_table">
			<template slot-scope="{ row, index }" slot="action">
				<Button type="primary" size="small" v-print="'#printMe'" @click="Print(row)">打印二维码</Button>
			</template>
		</Table>

		<div style="margin: 10px;overflow: hidden">
			<div style="float: right;">
				<Page :total="100" :current="pege_number" @on-change="changePage"></Page>
			</div>
		</div>

		<Modal v-model="modal1" title="筛选" @on-ok="modal_confrim" @on-cancel="cancel" cancel-text="重置" :closable=false>
			<Form :label-width="80">
				<FormItem label="产品名字">
					<Input v-model="search_goodMame" placeholder="请输入产品名字"></Input>
				</FormItem>

				<FormItem label="产品分类">
					<Row>
						<Col span="6">
						<Select v-model="selected_goodsClass" placeholder="请选择一级分类" @on-change="get_secondclass">
							<Option v-for="(value,index) in all_fristclass" :value="value.objectId" :key="index">{{value.class_text}}</Option>
						</Select>
						</Col>
						<Col span="6" style="margin-left: 20px;">
						<Select v-model="selected_second_class" placeholder="请选择二级分类">
							<Option v-for="(value,index) in all_secondclass" :value="value.objectId" :key="index">{{value.class_text}}</Option>
						</Select>
						</Col>
					</Row>
				</FormItem>

				<FormItem label="存放仓库">
					<Row>
						<Col span="6">
						<Select v-model="selected_stocks" placeholder="请选择存放仓库">
							<Option v-for="(value,index) in all_stocks" :value="value.objectId" :key="index">{{value.stock_name}}</Option>
						</Select>
						</Col>
					</Row>
				</FormItem>
			</Form>
		</Modal>

		<!--出库、入库、退货时的弹窗-->
		<Drawer :title="option_title" v-model="value1" width="720" :mask-closable="false" :styles="styles">
			<Scroll :height="screenHeight - 160">
				<Card bordered shadow v-for="(item,index) in select_goods" :key="index">
					<div slot="title" class="display_flex_bet">
						<div>{{item.goodsName}}</div>
						<div>库存:{{item.reserve}}</div>
					</div>
					<div>产品规格：{{item.packageContent}}/{{item.packingUnit}}</div>
					<div class="display_flex">实际入库价（可修改）：<Input placeholder="请输入实际入库价" clearable style="width: 200px" @on-change="modify_price($event,index)" /></div>
					<div class="display_flex">数量：<InputNumber @on-change="modify_num($event,index)"></InputNumber>
					</div>
				</Card>
			</Scroll>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="value1 = false">取消</Button>
				<Button type="primary" @click="value1 = false,value2=true">确定</Button>
			</div>
		</Drawer>

		<!--出库、入库、退货时的弹窗-->
		<Drawer :title="option_title" v-model="value2" width="720" :mask-closable="false" :styles="styles">
			<div style='line-height:70rpx;padding: 20rpx 20rpx 0;'>已选产品</div>
			<div style='max-height:25vh;overflow-x:scroll'>
				<div v-for="(item,index) in select_goods" :key="index" class='pro_listitem'>
					<div class='pro_list' style='color:#3D3D3D'>
						<div>产品：{{item.goodsName}}</div>
						<div>期初进货价：￥{{item.costPrice}}</div>
					</div>
					<div class='pro_list'>
						<div>实际进货价：￥{{item.modify_retailPrice}}（X{{item.num}}）</div>
						<div>合计：￥{{item.total_money}}</div>
					</div>
				</div>
			</div>
			<div class='pro_allmoney'>总计：￥{{modal2.all_money}}</div>


		</Drawer>

		<div id="printMe" style="text-align: center;" v-if="now_product" class="print">
			<img :src="now_product.qrcodeImg" />
			<div style="color: #333;margin-top: 20px;"><text style="font-size: 32px;">{{now_product.goodsName}}</text></div>
		</div>

		<div id="print_allqr" style="text-align: center;width: 100%;" class="print">
			<div v-for="(item,index) in goods" :key="index" style="width: 33.33%; display: inline-block;">
				<img :src="item.qrcodeImg" style="width: 160px;" />
				<div style="color: #333;margin-top: 10px;"><text style="font-size: 10px;">{{item.goodsName}}</text></div>
			</div>

		</div>

		<div id="print_selectedqr" style="text-align: center;width: 100%;" class="print">
			<div v-for="(item,index) in select_goods" :key="index" style="width: 25%; display: inline-block;">
				<img :src="item.qrcodeImg" style="width: 80px;" />
				<div style="color: #333;margin-top: 10px;"><text style="font-size: 10px;">{{item.goodsName}}</text></div>
			</div>
		</div>

		<Modal title="产品图片" v-model="GoodImg.show" class-name="vertical-center-modal">
			<img :src="GoodImg.attr" style="height: 800px;margin: 0 auto;width: 100%;" />
		</Modal>

	</div>
</template>
<script>
	//import barcode from '@xkeshi/vue-barcode'
	import jrQrcode from "jr-qrcode";
	import common from '@/serve/common.js';
	import goods from '@/serve/goods.js';
	import XLSX from 'xlsx';
	import Print from 'vue-print-nb';

	//let userid = JSON.parse(localStorage.getItem('bmob')).objectId;
	let that;
	export default {
		components: {},
		data() {
			return {
				GoodImg: {
					show: false,
					attr: ''
				},
				modal2: {
					all_money: 0,
					real_money: 0,
				},
				retailPrice: '',
				now_product: '',
				option_title: '',
				value1: false,
				value2: false,
				styles: {
					height: 'calc(100% - 55px)',
					overflow: 'auto',
					paddingBottom: '53px',
					position: 'static',
					background: '#eee'
				},
				search_goodMame: '',
				selected_stocks: null,
				selected_goodsClass: null,
				selected_second_class: null,
				all_fristclass: [], //所有的一级分类
				all_secondclass: [], //所有的二级分类
				padding_size: 30,
				modal1: false,
				userid: JSON.parse(localStorage.getItem('bmob')).objectId || '',
				user: JSON.parse(localStorage.getItem('bmob')),
				all_stocks: [],
				page_size: 50,
				pege_number: 1,
				screenHeight: window.innerHeight,
				loading: true,
				columns: [{
						width: 60,
						type: 'selection',
						align: 'center',
					},
					{
						width: 180,
						title: '产品名字',
						key: 'goodsName',
						sortable: true,
						align: 'center',
					},
					{
						title: '产品图片',
						key: 'goodsIcon',
						width: 100,
						render: (h, params) => {
							return h('div', {
								style: {
									"text-align": "center"
								},
							}, [
								h('img', {
									style: {
										width: '60px',
										padding: "4px 0",
									},
									attrs: {
										src: params.row.goodsIcon
									},
									on: {
										'click': function() {
											that.GoodImg.show = true
											that.GoodImg.attr = params.row.goodsIcon
										}
									}
								})
							]);
						}
					},
					{
						width: 100,
						align: 'center',
						sortable: true,
						title: '成本价',
						key: 'costPrice',
					},
					{
						width: 100,
						align: 'center',
						title: '零售价',
						key: 'retailPrice',
						sortable: true,
					},
					{
						width: 100,
						align: 'center',
						title: '所属分类',
						key: 'class',
					},
					{
						width: 100,
						align: 'center',
						title: '所属仓库',
						key: 'stocks',
					},
					{
						width: 100,
						align: 'center',
						title: '存放位置',
						key: 'position',
					},
					{
						width: 120,
						align: 'center',
						title: '库存',
						key: 'reserve',
						sortable: true,
					},
					{
						width: 100,
						align: 'center',
						title: '规格',
						key: 'packageContent',
					},
					{
						width: 100,
						align: 'center',
						title: '单位',
						key: 'packingUnit',
					},
					{
						width: 120,
						align: 'center',
						title: '登记编号',
						key: 'regNumber',
					},
					{
						width: 160,
						align: 'center',
						title: '产品简介',
						key: 'product_info',
					},
					{
						width: 100,
						align: 'center',
						title: '生产厂家',
						key: 'producer',
					},
					{
						width: 160,
						align: 'center',
						title: '产品条码',
						key: 'productCode',
					},
					{
						title: '产品二维码',
						width: 100,
						key: 'qrcodeImg',
						render: (h, params) => {
							return h('div', {
								style: {
									"text-align": "center"
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

					/*{
					  title: '产品条形码',
					  width: 200,
					  type: 'barcode',
					  render: (h, params) => {
					    return h(barcode, {
					      style: {
					        width: "170px",
					        height: "80px",
					        margin: "10px 0",
					      },
					      attrs: {
					        value: (params.row.productCode) ? params.row.productCode : params.row.objectId + '-' + false
					      }
					    })
					  }
					},*/
					{
						width: 160,
						align: 'center',
						title: '创建时间',
						key: 'createdAt',
						sortable: true,
					},
					{
						width: 160,
						title: '操作',
						slot: 'action',
						align: 'center',
						fixed: 'right',
					}
				],
				goods: [],
				select_goods: [] //选择模式下选择的产品数据
			};
		},

		mounted() {
			that = this;
			window.onresize = () => {
				return (() => {
					that.screenHeight = window.innerHeight;
				})();
			};
			this.get_productList();

			goods.getstock_list().then(res => {
				console.log(res)
				that.all_stocks = res
			});


			goods.get_fristclass().then(res => {
				console.log(res)
				that.all_fristclass = res
			});
		},

		methods: {

			//添加产品
			addProduct() {
				if (that.user.is_vip) {
					this.$router.push({
						path: '/home/add_good'
					})
				} else {
					if (that.goods.length >= 30) {
						this.$Message['error']({
							background: true,
							content: '非会员只能上传30条'
						});
					} else {
						this.$router.push({
							path: 'goods/addgood'
						})
					}
				}
			},

			//输入实际的出入库的价格
			modify_price($event, index) {
				//console.log($event, index)

				that.select_goods[index].modify_retailPrice = $event.target.value
				that.select_goods[index].total_money = that.select_goods[index].num * Number($event.target.value)
			},

			//输入数量时触发
			modify_num($event, index) {
				//console.log($event, index)

				that.select_goods[index].num = Number($event)
				that.select_goods[index].total_money = Number($event) * Number(that.select_goods[index].modify_retailPrice)
			},

			//打印点击
			Print(row) {
				that.now_product = row
			},

			//选择操作是触发
			selected_options(name) {
				console.log(that.select_goods)
				if (that.select_goods.length == 0) {
					this.$Message.error('当前没有选择产品');
				} else {
					that.option_title = name;
					if (name == "入库" || name == "出库") {
						that.value1 = true;
						let index = 0;
						for (let item of that.select_goods) {
							that.select_goods[index].num = 1;
							that.select_goods[index].total_money = 1 * that.select_goods[index].retailPrice;
							that.select_goods[index].modify_retailPrice = that.select_goods[index].retailPrice;
							index += 1;
						}
					}

				}
			},

			//点击下载导入模板
			download_demo() {
				window.open("/static/demo.xlsx");
			},

			//重置点击
			cancel() {
				that.loading = true,
					that.search_goodMame = '',
					that.selected_stocks = null,
					that.selected_goodsClass = null,
					that.selected_second_class = null,
					that.get_productList()
			},

			//modal 确定点击
			modal_confrim() {
				that.loading = true,
					that.get_productList()
			},

			//获得二级分类
			get_secondclass(value) {
				console.log(value)
				goods.get_secondclass(value).then(res => {
					//console.log(res)
					this.all_secondclass = res
				})
			},

			//选择某一项时事件
			get_select(selection) {
				console.log(selection)
				that.select_goods = selection
			},

			//取消某一项时的事件
			cancle_select(selection) {
				that.select_goods = selection
			},

			delete_good() {

				if (that.select_goods.length == 0) {
					this.$Message.error('当前没有选择产品');
				} else {
					goods.delete_goods(that.select_goods).then(res => {
						this.$Message.success('删除成功');
						that.get_productList();
					});

				}
			},

			btnClick() {
				console.log(that.user);
				if (that.user.is_vip) {
					document.querySelector('.input-file').click();
				} else {
					return
				}

			},

			importfile(event) {
				if (!event.currentTarget.files.length) {
					return;
				}
				const that = this;
				// 拿取文件对象
				var f = event.currentTarget.files[0];
				// 用FileReader来读取
				var reader = new FileReader();
				// 重写FileReader上的readAsBinaryString方法
				FileReader.prototype.readAsBinaryString = function(f) {
					var binary = '';
					var wb; // 读取完成的数据
					var outdata; // 你需要的数据
					var reader = new FileReader();
					reader.onload = function(e) {
						// 读取成Uint8Array，再转换为Unicode编码（Unicode占两个字节）
						var bytes = new Uint8Array(reader.result);
						var length = bytes.byteLength;
						for (var i = 0; i < length; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						// 接下来就是xlsx了，具体可看api
						wb = XLSX.read(binary, {
							type: 'binary'
						});
						outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
						// 自定义方法向父组件传递数据
						that.add_all(outdata)
					};
					reader.readAsArrayBuffer(f);
				};
				reader.readAsBinaryString(f);
			},

			//导出数据表格点击
			exportData(type) {
				this.$refs.table.exportCsv({
					filename: '产品数据',
				});
			},

			//改变页数
			changePage(pege_number) {
				that.pege_number = pege_number;

				that.get_productList();
			},

			//批量增加
			add_all(goods) {
				const queryArray = new Array();
				const pointer = Bmob.Pointer('_User')
				const poiID = pointer.set(that.userid)
				// 构造含有50个对象的数组
				for (let good of goods) {
					var queryObj = Bmob.Query('Goods');
					queryObj.set('goodsName', "" + good.商品名字);
					queryObj.set('costPrice', "" + good.成本价);
					queryObj.set('retailPrice', "" + good.零售价);
					queryObj.set('packingUnit', good.单位);
					queryObj.set('reserve', Number("" + good.库存));
					queryObj.set('userId', poiID);
					queryArray.push(queryObj);
				}

				// 传入刚刚构造的数组
				Bmob.Query('Goods')
					.saveAll(queryArray)
					.then(result => {
						console.log(result);
						this.$Message.success('导入成功');
						that.get_productList()
					})
					.catch(err => {
						console.log(err);
					});
			},

			//查询产品列表
			get_productList() {
				console.log(that.selected_stocks, that.selected_second_class)
				const query = Bmob.Query('Goods');
				query.equalTo('userId', '==', that.userid);
				query.include('second_class', 'goodsClass', 'stocks')

				if (that.selected_stocks) {
					query.equalTo("stocks", "==", that.selected_stocks);
				}
				if (that.selected_second_class) {
					query.equalTo("second_class", "==", that.selected_second_class);
				}
				query.equalTo("goodsName", "==", {
					"$regex": "" + that.search_goodMame + ".*"
				});
				query.limit(that.page_size);
				query.skip(that.page_size * (that.pege_number - 1));
				query.order("-createdAt"); //按照条件降序
				query.find().then(res => {
					console.log(res);
					for (let item of res) {
						item.class = (item.goodsClass ? (item.goodsClass.class_text || "") : "") + "    " + (item.second_class ? (item.second_class
							.class_text || "") : "")
						item.stocks = (item.stocks) ? item.stocks.stock_name : ""

						item.qrcodeImg = jrQrcode.getQrBase64((item.productCode) ? item.productCode : item.objectId + '-' + false)
						item.productCode = (item.productCode) ? item.productCode : item.objectId + '-' + false
					}
					this.goods = res;
					this.loading = false;
				});
			},

		}
	};
</script>

<style>
	@media only screen {
		.print {
			display: none
		}
	}

	.display_flex {
		display: flex;
		align-items: center;
	}

	.display_flex_bet {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.vertical-center-modal {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;

		.ivu-modal {
			top: 0;
		}
	}
</style>
