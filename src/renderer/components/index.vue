<template>
	<div style="position: relative;">
		<Spin size="large" fix v-if="loading"></Spin>

		<div style="padding:20px;background: #FFFFFF;">
			<div style="padding:0 0 20px 0;font-size: 16px;font-weight: bold;">库存概况：</div>
			<Row>
				<Col span="5">
				<Card shadow style="background: #2db7f5;color: #fff;">
					<p slot="title" style="color:#fff">今日详情</p>
					<p>今日入库：{{get_reserve}}</p>
					<p>今日出库：{{out_reserve}}</p>
				</Card>
				</Col>
				<Col span="5" offset="2">
				<Card shadow style="background: #ed4014;color: #fff;">
					<p slot="title" style="color:#fff">库存详情</p>
					<p>库存总量：{{total_reserve}}</p>
					<p>库存成本：{{total_money}}</p>
					<p>库存种类：{{total_products}}</p>
				</Card>
				</Col>
			</Row>
		</div>


		<div style="padding:20px;background: #FFFFFF;margin-top: 20px;">
			<div style="font-size: 16px;font-weight: bold;">出入库统计：</div>
			<div style="display: flex;justify-content: space-between;align-items: center;">
				<div id="c1" style="width:50%"></div>
				<div id="c2" style="width:50%"></div>
			</div>
		</div>



	</div>
</template>
<script>
	import common from '@/utils/common.js';
	import mchart from '@/utils/chart.js';
	import G2 from '@antv/g2';

	let that;
	export default {
		data() {
			return {
				loading: true,
				get_reserve: 0,
				out_reserve: 0,
				total_reserve: 0,
				total_money: 0,
				total_products: 0,
				now_day: common.getDay(0),
				userid: JSON.parse(localStorage.getItem('bmob')).objectId || '',
			};
		},

		mounted() {
			that = this;
			window.onresize = () => {
				return (() => {
					that.screenHeight = window.innerHeight;
				})();
			};
			this.gettoday_detail();

			let year = that.now_day.split("-")[0]
			let month = that.now_day.split("-")[1]
			mchart.getLineChart(year, month).then(res => {
				console.log(res)
				var chart = new G2.Chart({
					container: 'c1',
					forceFit: true,
					height: 400,
					padding: [70, 70, 80, 50] // 上右下左
				});
				chart.source(res);
				chart.tooltip({
					crosshairs: {
						type: 'line'
					},
					useHtml: false
				});
				chart.areaStack().position('date*_sumNum').color('desc');
				chart.lineStack().position('date*_sumNum').color('desc').size(2);
				chart.render();

				var chart = new G2.Chart({
					container: 'c2',
					forceFit: true,
					height: 400,
					padding: [70, 70, 80, 50] // 上右下左
				});
				chart.source(res);
				chart.tooltip({
					crosshairs: {
						type: 'line'
					},
					useHtml: false
				});
				chart.areaStack().position('date*total_money').color('desc1');
				chart.lineStack().position('date*total_money').color('desc1').size(2);
				chart.render();
			})
		},

		methods: {

			//得到今日概况
			gettoday_detail: function() {
				let get_reserve = 0;
				let out_reserve = 0;
				let get_reserve_real_money = 0;
				let out_reserve_real_money = 0;
				let get_reserve_num = 0;
				let out_reserve_num = 0;

				const query = Bmob.Query('Bills');
				query.equalTo('userId', '==', that.userid);
				query.equalTo('createdAt', '>=', common.getDay(0, true));
				query.equalTo('createdAt', '<=', common.getDay(1, true));
				query.equalTo("status", "!=", false);
				query.include('goodsId');
				query.find().then(res => {
					for (var i = 0; i < res.length; i++) {
						if (res[i].type == 1) {
							get_reserve = get_reserve + res[i].num;
							get_reserve_real_money = get_reserve_real_money + res[i].num * res[i].goodsId.retailPrice;
							get_reserve_num = get_reserve_num + res[i].total_money;
						} else if (res[i].type == -1) {
							out_reserve = out_reserve + res[i].num;
							out_reserve_real_money = out_reserve_real_money + res[i].num * res[i].goodsId.costPrice;
							out_reserve_num = out_reserve_num + res[i].total_money;
						}
					}

					that.get_reserve = get_reserve.toFixed(2);
					that.out_reserve = out_reserve.toFixed(2);
					this.loadallGoods()
				});
			},

			//得到总库存数和总金额
			loadallGoods: function() {
				var total_reserve = 0;
				var total_money = 0;
				const query = Bmob.Query('Goods');
				query.equalTo('userId', '==', that.userid);
				query.limit(500);
				query.find().then(res => {
					for (var i = 0; i < res.length; i++) {
						total_reserve = total_reserve + res[i].reserve;
						total_money = total_money + res[i].reserve * res[i].costPrice;
						if (i == res.length - 1 && res.length == 500) {
							const query = Bmob.Query('Goods');
							query.equalTo('userId', '==', that.userid);
							query.skip(500);
							query.limit(500);
							query.find().then(res => {
								for (var i = 0; i < res.length; i++) {
									total_reserve = total_reserve + res[i].reserve;
									total_money = total_money + res[i].reserve * res[i].costPrice;
								}
							});
							(that.total_money = total_money.toFixed(2)), (that.total_reserve = total_reserve.toFixed(2)), (that
								.total_products =
								res.length);
						} else {
							(that.total_money = total_money.toFixed(2)), (that.total_reserve = total_reserve.toFixed(2)), (that
								.total_products =
								res.length);
						}
					}

					that.loading = false
				});
			}
		}
	};
</script>

<style>
	.custom-tooltip {
		width: 100% !important;
		height: 10% !important;
		position: absolute;
		top: 0px;
		left: 0px
	}

	.custom-tooltip-item {
		width: 150px;
		height: 50px;
		position: relative;
		float: left;
		margin-left: 20px;
		border-left-style: solid;
		border-left-width: 5px
	}

	.custom-tooltip-item:first-child {
		margin-left: 0
	}

	.custom-tooltip-item-name {
		width: 80%;
		height: 20px;
		position: absolute;
		top: 0px;
		left: 10px;
		color: rgba(0, 0, 0, 0.45);
		font-size: 14px
	}

	.custom-tooltip-item-value {
		width: 80%;
		height: 30px;
		position: absolute;
		bottom: 0px;
		left: 10px;
		color: #262626;
		font-size: 22px;
		/*font-weight: bold*/
	}
</style>
