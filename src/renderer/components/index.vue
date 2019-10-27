<template>
	<div style="position: relative;">
		<Spin size="large" fix v-if="loading"></Spin>
		<Row style="background:#eee;padding:20px">
			<Col span="5">
			<Card shadow style="background: #2db7f5;color: #fff;">
				<p slot="title">今日详情</p>
				<p>今日入库：{{get_reserve}}</p>
				<p>今日出库：{{out_reserve}}</p>
			</Card>
			</Col>
			<Col span="5" offset="2">
			<Card shadow style="background: #ed4014;color: #fff;">
				<p slot="title">库存详情</p>
				<p>库存总量：{{total_reserve}}</p>
				<p>库存成本：{{total_money}}</p>
				<p>库存种类：{{total_products}}</p>
			</Card>
			</Col>
		</Row>

		<div id="c1"></div>
	</div>
</template>
<script>
	import common from '@/serve/common.js';
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
							(that.total_money = total_money.toFixed(2)), (that.total_reserve = total_reserve.toFixed(2)), (that.total_products =
								res.length);
						} else {
							(that.total_money = total_money.toFixed(2)), (that.total_reserve = total_reserve.toFixed(2)), (that.total_products =
								res.length);
						}
					}

					that.loading = false
				});
			}
		}
	};
</script>
