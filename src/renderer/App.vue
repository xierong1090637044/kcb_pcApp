<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script>
	const { ipcRenderer } = require('electron');
	export default {
		name: 'kcb',
		mounted() {
			//用来监听是否更新
			ipcRenderer.on('message', (event, {
				message,
				data
			}) => {
				if (message === 'isUpdateNow') {
					if (confirm('是否现在更新？')) {
						ipcRenderer.send('updateNow');
					}
				}
			});
			this.autoUpdate();
		},
		methods: {
			autoUpdate() { //用来触发更新函数
				ipcRenderer.send('update');
			}
		}
	}
</script>

<style>
	/* CSS */
</style>
