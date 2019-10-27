<template>
	<div>

		<Card style="width:100%;margin-bottom: 0.625rem;" v-for="(item,index) in thanks" :key="index">
			<div class="display_flex_bet">
				<div class="display_flex">
					<Avatar :src="item.user.avatarUrl" />
					<div style="margin-left: 0.625rem;font-size: 0.875rem;font-weight: bold;">{{item.user.nickName}}</div>
				</div>

				<div>{{item.createdAt}}</div>
			</div>
			<div style="text-align:left;margin-top: 0.625rem;" class="display_flex">
				<div style="width: 2.7rem;"></div>
				<h3 :style="{color:item.color}">{{item.thanks}}</h3>
			</div>
			<div class="display_flex" style="justify-content: flex-end;margin-top: 0.625rem;">
				<div class="display_flex" @click="add_star(item.objectId)">
					<Icon type="ios-thumbs-up" />
					<div style="margin-left: 0.3125rem;">{{item.star}}</div>
				</div>
			</div>
		</Card>

		<button class="add_xuqiu" @click="modal = true">提需求</button>

		<Modal v-model="modal" title="我也要提需求" @on-ok="modal_confrim" cancel-text="重置">
			<Form :label-width="80">
				<FormItem label="需求">
					<Input v-model="content" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入您的需求"></Input>
					
				</FormItem>
				
				<FormItem label="色值">
					<Col span="12">
					有默认值
					<ColorPicker v-model="color1" />
					</Col>
				</FormItem>

			</Form>
		</Modal>

	</div>

</template>
<script>
	import mine from '@/serve/mine.js';

	let that;
	export default {
		data() {
			return {
				color1: '#19be6b',
				thanks: [],
				modal: false,
				content: ''
			}
		},

		mounted() {
			that = this;

			mine.get_thanks().then(res => {
				console.log(res)
				that.thanks = res
			})
		},

		methods: {
			
			//确认输入的需求
			modal_confrim(){
				console.log(that.content,that.color1)
				if(that.content){
					mine.upload_xuqiu(that.content,that.color1).then(res=>{
						mine.get_thanks().then(res => {
							console.log(res)
							that.thanks = res
						})
					})
				}else{
					 this.$Message.error('请输入内容');
				}
			},

			//点击
			add_star(id) {
				console.log(id)
				const query = Bmob.Query('thanks')
				query.get(id).then(res => {
					res.increment("star")
					res.save()
					mine.get_thanks().then(res => {
						console.log(res)
						that.thanks = res
					})
				}).catch(err => {
					console.log(err)
				})
			}
		},
	}
</script>
<style>
	.display_flex_bet {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.display_flex {
		display: flex;
		align-items: center;
	}

	.add_xuqiu {
		border: unset;
		position: fixed;
		bottom: 6.25rem;
		right: 6.25rem;
		width: 4.375rem;
		height: 4.375rem;
		line-height: 4.375rem;
		text-align: center;
		color: #FFFFFF;
		border-radius: 50%;
		font-size: 1rem;
		font-weight: bold;
		animation: glow 800ms ease-out infinite alternate;
	}

	@keyframes glow {
		0% {
			background: #CD853F
		}

		100% {
			background: #3d3d3d
		}
	}
</style>
