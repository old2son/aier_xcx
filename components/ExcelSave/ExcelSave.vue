<template>
	<view class="excel-save">
		<view class="download-card">
			<view class="download-left">
				<view class="download-title"> 《爱尔眼健康科普教育基地团队预约填写模板》 </view>
			</view>

			<van-button size="small" round type="primary" color="#4794ff" @click="openDownload"> 下载 </van-button>
		</view>
		<van-popup :show="isShowFilePopup" round position="bottom" @close="isShowFilePopup = false">
			<view class="file-popup">
				<view class="popup-title"> 文件下载 </view>

				<view class="popup-tip"> 预览文件，发送到微信文件传输助手 </view>

				<van-button block round type="primary" color="#32579c" @click="previewFile"> 预览文件 </van-button>

				<!-- <van-button block round plain color="#32579c" @click="downloadFile"> 下载文件 </van-button> -->

				<van-button block round @click="isShowFilePopup = false"> 返回 </van-button>
			</view>
		</van-popup>
	</view>
</template>

<script>
export default {
	name: 'ExcelSave',
	data() {
		return {
			isShowFilePopup: false,
			templateUrl: 'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/template_regist_team.xlsx'
			// templateUrl: 'https://cseye-kpg.oss-cn-wuhan-lr.aliyuncs.com/aier-applet/template_regist_team.xlsx'
		};
	},
	methods: {
		previewFile() {
			uni.showLoading({
				title: '加载中'
			});

			const fileName = '爱尔眼健康科普教育基地团队预约填写模板.xlsx';

			uni.downloadFile({
				url: this.templateUrl,

				success: (res) => {
					if (res.statusCode === 200) {
						const fs = uni.getFileSystemManager();

						// 小程序本地路径
						const newPath = `${wx.env.USER_DATA_PATH}/${fileName}`;

						// 复制并重命名
						fs.copyFile({
							srcPath: res.tempFilePath,
							destPath: newPath,

							success: () => {
								uni.openDocument({
									filePath: newPath,
									showMenu: true
								});
							}
						});
					}
				},

				complete: () => {
					uni.hideLoading();
				}
			});
		},
		openDownload() {
			if (this.templateUrl === '') {
				this.$toast('模板文件不存在');
				return;
			}
			
			this.isShowFilePopup = true;
		}
	}
};
</script>

<style lang="scss" scoped>
.download-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	margin-top: 24rpx;
	border-radius: 100rpx;
	background: #fff;
	box-shadow: 0 12rpx 32rpx rgba(50, 87, 156, 0.12);
}

.download-left {
	flex: 1;
	margin-right: 20rpx;
}

.download-title {
	line-height: 1.5;
	color: #5b79ab;
	font-size: 24rpx;
	font-weight: 400;
}


.file-popup {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	padding: 40rpx 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
}

.popup-title {
	margin-bottom: 12rpx;
	color: #2a2a2a;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
}

.popup-tip {
	line-height: 1.7;
	margin: 12rpx 0 28rpx;
	color: #888;
	text-align: center;
	font-size: 24rpx;
}
</style>
