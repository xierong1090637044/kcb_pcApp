<template>
	<div style="position: relative;">
    <div style="text-align: center;margin-top: 100px;">
      <img src="@/assets/download.png" style="height: 500px;width: 500px;" />
      <div style="font-size: 18px;margin-top: 30px;color: #333;font-style: oblique;font-weight: bold;">扫码关注"库存表"服务号，体验最新功能！</div>
    </div>


	</div>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		mounted() {

		},
		methods: {
			download(type) {
				if (type == "androind") {
					window.open("/static/android.apk");
				}

				if (type == "ios") {
					window.open("/static/ios.ipa");
				}

			}
		}
	}
</script>


<style>
	.button_ele {
		position: absolute;
		bottom: 19%;
		left: 16.5%;
	}

	.button_class {
		width: 160%;
		padding: 10% 10%;
		border-radius: 40px;
		margin-bottom: 30%;
		background: #fff;
		font-weight: bold;
	}

	.qq_qunstyle {
		position: absolute;
		bottom: 30%;
		right: 17%;
		width: 14%;
		height: 33%;
	}
</style>
