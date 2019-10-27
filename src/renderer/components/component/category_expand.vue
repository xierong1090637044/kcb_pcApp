// table-expand.vue
<style scoped>
	.expand-row {
		margin-bottom: 16px;
	}
</style>
<template>
	<div style="position: relative;">
		<Spin size="large" fix v-if="loading"></Spin>
		<div v-if="all_secondclass.length >0">
			<Row class="expand-row" v-for="(item,index) in all_secondclass" :key="index">
				
				<Col span="5">
				<span class="expand-key">二级分类Id： </span>
				<span class="expand-value">{{ item.objectId }}</span>
				</Col>
				<Col span="5">
				<span class="expand-key">二级分类名字: </span>
				<span class="expand-value">{{ item.class_text }}</span>
				</Col>
				<Col span="5">
				<span class="expand-key">创建时间： </span>
				<span class="expand-value">{{ item.createdAt }}</span>
				</Col>
				
				<Col span="5">
				<Button type="primary" size="small" style="margin-right: 5px" @click="edit(item)">修改</Button>
				<Button type="error" size="small" @click="del(item)">删除</Button>
				</Col>
			</Row>
		</div>
		<div v-else>暂无二级分类</div>
		
		<Modal v-model="modal1" title="修改二级分类" @on-ok="modal_confrim">
			<Form :label-width="80">
				<FormItem label="名字">
					<Input v-model="class_text"></Input>
				</FormItem>
			</Form>
		</Modal>
		
		<Modal v-model="modal2" width="360">
			<p slot="header" style="color:#f60;text-align:center">
				<Icon type="ios-information-circle"></Icon>
				<span>确定删除此分类</span>
			</p>
			<div style="text-align:center">
				<p>删除后将无法恢复</p>
			</div>
			<div slot="footer">
				<Button type="error" size="large" long @click="delete_this">删除</Button>
			</div>
		</Modal>

	</div>
</template>
<script>
	import goods from '@/serve/goods.js';
	import manage from '@/serve/manage.js';
	
	export default {
		props: {
			
			row: Object,
		},

		data() {
			return {
				modal1:false,
				modal2:false,
				
				class_text:"",
				select_item:"",
				all_secondclass: [],
				loading: true,
			}
		},

		mounted() {
			//获得二级分类

			goods.get_secondclass(this.row.objectId).then(res => {
				//console.log(res)
				this.all_secondclass = res
				this.loading = false;
			})

		},
		
		methods:{
			//修改二级分类点击
			modal_confrim(){
				console.log(this.select_item)
				this.loading = true;
				manage.edit_secondclass(this.select_item.objectId, this.class_text).then(res => {
						goods.get_secondclass(this.row.objectId).then(res => {
							//console.log(res)
							this.all_secondclass = res
							this.loading = false;
							this.$Message.success('修改成功');
						})
						
				})
			},
			
			//删除此二级分类
			del(item){
				this.modal2 = true 
				this.select_item = item
			},
			
			//确定删除此二级分类
			delete_this(){
				console.log(this.select_item)
				this.loading = true
				this.modal2 = false 
				manage.delete_class("second_class",this.select_item.objectId).then(res => {
					goods.get_secondclass(this.row.objectId).then(res => {
						console.log(res)
						this.all_secondclass = res
						this.loading = false;
						this.$Message.success('删除成功');
					})
				})
			},
			
			edit(item){
				this.modal1 = true,
				this.class_text= item.class_text,
				this.select_item = item
			}
			
		}
	};
</script>
