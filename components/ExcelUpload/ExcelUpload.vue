<template>
	<view class="upload-card">
		<view class="upload-title"> 预约上传文件 </view>
		<view class="upload-desc"> 仅支持 Excel 文件（xls、xlsx） </view>
		<view class="upload-desc"> 文件大小不超过 20MB </view>
		<view v-if="!uploadedFileName" class="upload-btn" @click="chooseExcelFile"> 点击上传文件 </view>
		<view v-if="uploadedFileName" class="file-row">
			<view class="delete-btn" @click="removeExcelFile">删除</view>
			<view class="uploaded-file">已上传：{{ uploadedFileName }}</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'ExcelUpload',
	data() {
		return {
			uploadedFile: null,
			uploadedFileName: '',
		};
	},
	methods: {
		chooseExcelFile() {
			wx.chooseMessageFile({
				count: 1,
				type: 'file',
				extension: ['xls', 'xlsx'],

				success: (res) => {
					const file = res.tempFiles[0];

					const maxSize = 20 * 1024 * 1024;

					if (file.size > maxSize) {
						this.$toast({
							message: '文件不能超过20MB'
						});

						return;
					}

					const fileName = file.name.toLowerCase();

					const isExcel = fileName.endsWith('.xls') || fileName.endsWith('.xlsx');

					if (!isExcel) {
						this.$toast({
							message: '仅支持Excel文件'
						});

						return;
					}
					uni.showLoading({
						title: '处理中...',
						mask: true
					});
					const fs = wx.getFileSystemManager();
					fs.readFile({
						filePath: file.path,
						encoding: 'base64',
						success: (readRes) => {
							this.uploadedFile = file;
							this.uploadedFileName = file.name;
							const ext = file.name.split('.').pop().toLowerCase();

							// 非标准 MIME
							const base64File = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.${ext};base64,${readRes.data}`;
							this.$emit('getFile', base64File);

							this.$toast({
								message: '上传成功'
							});
						},
						fail: () => {
							this.uploadedFile = null;
							this.uploadedFileName = '';
							this.$emit('getFile', '');
							
							this.$toast({
								message: '文件处理失败，请重试'
							});
						},
						complete: () => {
							uni.hideLoading();
						}
					});
				},
				fail: (err) => {
					console.log(err);
				}
			});
		},
		removeExcelFile() {
			this.uploadedFile = null;
			this.uploadedFileName = '';
			this.$emit('getFile', '');

			this.$toast({
				message: '已删除上传文件'
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.upload-card {
	width: 94%;
	margin: 40rpx auto;
	padding: 28rpx;
	border-radius: 24rpx;
	box-sizing: border-box;
	background: #fafdff;
}

.upload-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #2a2a2a;
}

.upload-desc {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #888;
	line-height: 1.6;
}

.upload-btn {
	margin-top: 24rpx;
	height: 84rpx;
	line-height: 84rpx;
	text-align: center;
	border-radius: 999rpx;
	border: 2rpx dashed #7fa8ef;
	background: #eef5ff;
	color: #5b79ab;
	font-size: 28rpx;
}

.delete-btn {
	width: 96rpx;
	height: 56rpx;
	line-height: 56rpx;
	text-align: center;
	border-radius: 28rpx;
	background: #fbe9e9;
	color: #d85b5b;
	font-size: 24rpx;
	flex-shrink: 0;
}

.file-row {
	margin-top: 24rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.uploaded-file {
	flex: 1;
	min-width: 0;
	padding: 14rpx 20rpx;
	border-radius: 16rpx;
	background: #eef5ff;
	font-size: 24rpx;
	color: #32579c;
	word-break: break-all;
}
</style>
