<template>
	<div>
		<div class="form-group">
			<label class="control-label">上传产品图</label>
			<div class="control-form">
				<ul class="upload-imgs">
					<li v-if="imgLen>=1 ? false : true">
						<input type="file" class="upload" @change="addImg" ref="inputer" multiple accept="image/png,image/jpeg,image/gif,image/jpg"
						 v-show="false" />
						<a class="add" @click="upload"><i class="iconfont icon-plus"></i>
							<p>点击上传</p>
						</a>
					</li>
					<li v-for='(value, key) in imgs' :key="key">
						<p class="img"><img :src="getObjectURL(value)" style="width: 100%;"><a class="close" @click="delImg(key)">×</a></p>
					</li>
				</ul>
			</div>
		</div>

		<Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
			<FormItem label="产品名字" prop="goodsName">
				<Input v-model="formValidate.goodsName" placeholder="请输入产品名字"></Input>
			</FormItem>
			<FormItem label="成本价" prop="costPrice">
				<Input v-model="formValidate.costPrice" placeholder="请输入成本价"></Input>
			</FormItem>
			<FormItem label="零售价格" prop="retailPrice">
				<Input v-model="formValidate.retailPrice" placeholder="请输入零售价格"></Input>
			</FormItem>
			<FormItem label="包装含量" prop="packageContent">
				<Input v-model="formValidate.packageContent" placeholder="请输入包装含量"></Input>
			</FormItem>
			<FormItem label="包装单位" prop="packingUnit">
				<Input v-model="formValidate.packingUnit" placeholder="请输入包装单位"></Input>
			</FormItem>
			<FormItem label="产品条码" prop="productCode">
				<Input v-model="formValidate.productCode" placeholder="请输入与产品条码"></Input>
			</FormItem>
			<FormItem label="产品分类">
				<Row>
					<Col span="6">
					<Select v-model="formValidate.goodsClass" placeholder="请选择一级分类" @on-change="get_secondclass">
						<Option v-for="(value,index) in all_fristclass" :value="value.objectId" :key="index">{{value.class_text}}</Option>
					</Select>
					</Col>
					<Col span="6" style="margin-left: 20px;">
					<Select v-model="formValidate.second_class" placeholder="请选择二级分类">
						<Option v-for="(value,index) in all_secondclass" :value="value.objectId" :key="index">{{value.class_text}}</Option>
					</Select>
					</Col>
				</Row>
			</FormItem>
			<FormItem label="存放仓库">
				<Row>
					<Col span="6">
					<Select v-model="formValidate.stocks" placeholder="请选择存放仓库">
						<Option v-for="(value,index) in all_stocks" :value="value.objectId" :key="index">{{value.stock_name}}</Option>
					</Select>
					</Col>
					<Col span="6" style="margin-left: 20px;">
					<Input v-model="formValidate.reserve" placeholder="对应的库存" type="number"></Input>
					</Col>
					<Col span="6" style="margin-left: 20px;">
					<Input v-model="formValidate.warning_num" placeholder="预警库存" type="number"></Input>
					</Col>
				</Row>

			</FormItem>
			<FormItem label="登记编号" prop="regNumber">
				<Input v-model="formValidate.regNumber" placeholder="请输入登记编号"></Input>
			</FormItem>
			<FormItem label="生产厂家" prop="producer">
				<Input v-model="formValidate.producer" placeholder="请输入生产厂家"></Input>
			</FormItem>
			<FormItem label="货架编号" prop="position">
				<Input v-model="formValidate.position" placeholder="请输入货架编号"></Input>
			</FormItem>
			<!--<FormItem label="生产日期">
				<FormItem prop="producttime">
					<DatePicker type="date" placeholder="请选择生产日期" v-model="formValidate.producttime" format="yyyy-MM-dd HH:mm:ss"></DatePicker>
				</FormItem>
			</FormItem>
			<FormItem label="失效日期">
				<FormItem prop="nousetime">
					<DatePicker type="date" placeholder="请选择失效日期" v-model="formValidate.nousetime" format="yyyy-MM-dd HH:mm:ss"></DatePicker>
				</FormItem>
			</FormItem>-->
			<FormItem label="产品简介" prop="product_info">
				<Input v-model="formValidate.product_info" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入产品简介"></Input>
			</FormItem>
			<FormItem>
				<Button type="primary" @click="handleSubmit(formValidate)">确定</Button>
				<Button @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>
			</FormItem>
		</Form>
	</div>

</template>
<script>
	import goods from '@/serve/goods.js';
	export default {
		name: 'addgood',
		data() {
			return {
				all_fristclass: [], //所有的一级分类
				all_secondclass: [], //所有的二级分类
				all_stocks: [], //所有的仓库
				formData: new FormData(),
				imgs: {},
				imgLen: 0,
				formValidate: {
					goodsName: '', //产品名字
					productCode: '', //条形码
					costPrice: "0", //进货价格
					retailPrice: '0', //零售价
					position: '', //货架位置
					goodsClass: '', //一级分类
					second_class: '', //二级分类
					reserve: '', //库存数量
					packingUnit: '', //包装单位
					packageContent: '', //包装含量
					goodsIcon: '', //产品图片
					product_info: '', //产品简介
					stocks: "", // 存放仓库
					regNumber: '',
					producer: '', //生产厂家
					warning_num: '', //预警库存
				},
				ruleValidate: {
					goodsName: [{
						required: true,
						message: '产品名字必填',
						trigger: 'blur'
					}],
				}
			}
		},
		mounted() {
			let that = this
			//获得一级分类
			goods.get_fristclass().then(res => {
				//console.log(res)
				that.all_fristclass = res
			});

			//得到仓库列表
			goods.getstock_list().then(res => {
				console.log(res)
				that.all_stocks = res
				//that.all_fristclass = res
			});
		},

		methods: {

			//获得二级分类
			get_secondclass(value) {
				console.log(value)
				goods.get_secondclass(value).then(res => {
					//console.log(res)
					this.all_secondclass = res
				})
			},

			//上传产品
			handleSubmit(formValidate) {
				console.log(formValidate)
				if (formValidate.goodsName) {
					goods.upload_good(formValidate).then(res => {
						if (res[0]) {
							this.$Message.success('上传成功');
						} else {
							this.$Message.error('已存在产品');
						}
					})
				} else {
					this.$Message.error('请填写产品名字');
				}

			},

			upload() {
				document.querySelector('.upload').click();
			},
			addImg(event) {
				let inputDOM = this.$refs.inputer;
				// 通过DOM取文件数据
				this.fil = inputDOM.files;

				console.log(this.fil)

				this.formValidate.goodsIcon = this.fil

				if (this.fil) {
					let file
					for (let item of this.fil) {
						file = Bmob.File(item.name, item);
					}
					file.save().then(res => {
						console.log(res[0].url);
						this.formValidate.goodsIcon = res[0].url
					})
				}

				let oldLen = this.imgLen;
				let len = this.fil.length + oldLen;
				if (len > 1) {
					return false;
				}
				for (let i = 0; i < this.fil.length; i++) {
					let size = Math.floor(this.fil[i].size / 1024);
					if (size > 5 * 1024 * 1024) {
						alert('请选择5M以内的图片！');
						return false
					}
					this.imgLen++;
					this.$set(this.imgs, this.fil[i].name + '?' + new Date().getTime() + i, this.fil[i]);
				}
			},

			getObjectURL(file) {
				var url = null;
				if (window.createObjectURL != undefined) { // basic
					url = window.createObjectURL(file);
				} else if (window.URL != undefined) { // mozilla(firefox)
					url = window.URL.createObjectURL(file);
				} else if (window.webkitURL != undefined) { // webkit or chrome
					url = window.webkitURL.createObjectURL(file);
				}


				return url;
			},

			delImg(key) {
				this.$delete(this.imgs, key);
				this.imgLen--;
			},

			handleReset(name) {
				this.$refs[name].resetFields();
			}
		}
	}
</script>

<style scoped>
	.form-group {
		margin-left: 20px;
	}

	.upload-imgs {
		margin: 10px 0 30px 0;
		overflow: hidden;
		font-size: 0;
	}

	.upload-imgs li {
		position: relative;
		width: 118px;
		height: 118px;
		font-size: 14px;
		display: inline-block;
		padding: 10px;
		margin-left: 60px;
		border: 2px dashed #ccc;
		text-align: center;
		vertical-align: middle;
	}

	.upload-imgs li:hover {
		border-color: $them-color;
	}

	.upload-imgs .add {
		display: block;
		background-color: #ccc;
		color: #ffffff;
		height: 94px;
		padding: 8px 0;
	}

	.upload-imgs .add .iconfont {
		padding: 10px 0;
		font-size: 40px;
	}

	.upload-imgs li:hover .add {
		background-color: $them-color;
	}

	.upload-imgs li .upload {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 118px;
		height: 118px;
	}

	.upload-imgs .img {
		position: relative;
		width: 94px;
		height: 94px;
		line-height: 94px;
	}

	.upload-imgs .img img {
		vertical-align: middle;
	}

	.upload-imgs .img .close {
		display: none;
	}

	.upload-imgs li:hover .img .close {
		display: block;
		position: absolute;
		right: -6px;
		top: -10px;
		line-height: 1;
		font-size: 22px;
		color: #aaa;
	}
</style>
