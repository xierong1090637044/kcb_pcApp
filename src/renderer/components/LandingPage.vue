<template>
	<div class="homepage-hero-module">
		<div class="index_content">

			<Card dis-hover :padding="padding_size" style="width: 30%;margin:10% 35% 0;margin-top: 15%;">
				<div slot="title">
					<p style="font-size: 18px;color:#333"> 库存管理系统</p>
					<div style="color: #b3424a;font-size: 12px;margin-top: 10px;">总有人会给你遮风挡雨</div>
				</div>
				<Form ref="formInline" :model="formInline" :rules="ruleInline">
					<Alert type="error" show-icon v-if='alter_type =="phone_landing_error"'>账号或者密码不正确</Alert>
					<FormItem prop="phone">
						<Input type="text" v-model="formInline.phone" placeholder="请输入账号" autofocus>
						<Icon type="md-phone-portrait" slot="prepend" size="18" />
						</Input>
					</FormItem>

					<FormItem prop="code">
						<Row>
							<Input type="text" v-model="formInline.code" placeholder="请输入密码">
							<Icon type="ios-mail" slot="prepend" size="18" />
							</Input>
						</Row>
					</FormItem>

					<FormItem>
						<Button @click="phone_login(formInline.phone,formInline.code)" style="background:#b3424a;color: #fff ;" :loading="button_login">登录</Button>
					</FormItem>
				</Form>
			</Card>
		</div>
	</div>
</template>

<script>
	let that;
	export default {
		name: 'login',
		data() {
			return {
				button_login: false, //控制button的加载状态
				padding_size: 30,
				code_button: false,
				code_text: "发送验证码",
				alter_type: '',
				landing_type: "landing",
				formInline: {
					user: '',
					password: '',
					phone: '',
					code: ''
				},
				ruleInline: {
					user: [{
						required: true,
						message: '请输入账号',
						trigger: 'blur'
					}],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							type: 'string',
							min: 6,
							message: '密码不能少于6位',
							trigger: 'blur'
						}
					],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							type: 'string',
							min: 6,
							message: '密码不能少于6位',
							trigger: 'blur'
						}
					],
					phone: [{
							required: true,
							message: '请输入账号',
							trigger: 'blur'
						}
					]
				},
				vedioCanPlay: false,
				fixStyle: ''
			}
		},
		methods: {

			//手机登录点击
			phone_login(phone, code) {
				that.button_login = true
				//console.log(phone, code)
				Bmob.User.login(phone, code).then(res => {
					console.log(res)
					that.button_login = false
					localStorage.setItem("bmob", JSON.stringify(res))
					this.$router.push({
						path: '/home/index'
					})
				}).catch(err => {
					that.button_login = false
					that.alter_type = "phone_landing_error"
				});
			},

			canplay() {
				this.vedioCanPlay = true
			},
		},
		mounted: function() {
			that = this;
			window.onresize = () => {
				const windowWidth = document.body.clientWidth
				const windowHeight = document.body.clientHeight
				const windowAspectRatio = windowHeight / windowWidth
				let videoWidth
				let videoHeight
				if (windowAspectRatio < 0.5625) {
					videoWidth = windowWidth
					videoHeight = videoWidth * 0.5625
					this.fixStyle = {
						height: windowWidth * 0.5625 + 'px',
						width: windowWidth + 'px',
						'margin-bottom': (windowHeight - videoHeight) / 2 + 'px',
						'margin-left': 'initial'
					}
				} else {
					videoHeight = windowHeight
					videoWidth = videoHeight / 0.5625
					this.fixStyle = {
						height: windowHeight + 'px',
						width: windowHeight / 0.5625 + 'px',
						'margin-left': (windowWidth - videoWidth) / 2 + 'px',
						'margin-bottom': 'initial'
					}
				}
			}
			window.onresize()

			let current = Bmob.User.current()
			if (current) {
				this.$router.push({
					path: '/home/index'
				})
			}
		}
	}
</script>

<style scoped>
	.index_content {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 100;
		width: 100%;
		height: 100%;
		text-align: center;
	}

	.homepage-hero-module,
	.video-container {
		position: relative;
		height: 100vh;
		overflow: hidden;
	}

	.video-container .poster img,
	.video-container video {
		z-index: 0;
		position: absolute;
	}

	.video-container .filter {
		z-index: 1;
		position: absolute;
		background: rgba(0, 0, 0, 0.4);
	}
</style>
