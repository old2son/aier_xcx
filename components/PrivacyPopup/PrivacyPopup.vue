<template>
	<view class="privacy-popup">
		<view class="privacy-popup__header">个人信息保护指引</view>
		<view class="privacy-popup__container">
			<text>感谢您使用爱尔眼健康科普教育基地！我们非常重视您的个人信息和隐私保护，请仔细阅读</text>
			<text class="privacy-popup__container-protocol" @click="openPrivacyContract">
				《爱尔眼健康科普教育基地小程序隐私保护指引》
			</text>
			<text class="privacy-popup__container-protocol" @click="openPolicyFile(miniAppPolicy, '用户隐私政策')">
				《用户隐私政策》
			</text>
			<text class="privacy-popup__container-protocol" @click="openPolicyFile(childPolicy, '儿童隐私政策')">
				《儿童隐私政策》
			</text>
			<text>。如你同意，即表示已理解并同意该指引内容。如你拒绝，将无法使用相应服务。</text>
		</view>
		<view class="privacy-popup__footer">
			<button class="is-disagree" @click="handleDisagree">不同意</button>
			<button class="is-agree" open-type="agreePrivacyAuthorization" @agreeprivacyauthorization="handleAgree">
				同意并继续
			</button>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
	name: 'PrivacyPopup',
	data() {
		return {
			// 爱尔眼科儿童隐私政策.docx
			childPolicy:
				'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/%E7%88%B1%E5%B0%94%E7%9C%BC%E7%A7%91%E5%84%BF%E7%AB%A5%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96.docx',

			// 爱尔眼健康科普馆微信小程序.docx
			miniAppPolicy:
				'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/%E7%88%B1%E5%B0%94%E7%9C%BC%E5%81%A5%E5%BA%B7%E7%A7%91%E6%99%AE%E9%A6%86%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F.docx'
		};
	},
	computed: {
		...mapState('moduleUser', ['showPrivacyPopup'])
	},
	methods: {
		...mapMutations('moduleUser', ['openPrivacyPopup']),
		openPolicyFile(fileUrl, fileName) {
			if (!fileUrl) {
				uni.showToast({
					title: '文件地址不存在',
					icon: 'none'
				});
				return;
			}

			uni.showLoading({
				title: '打开中...'
			});

			uni.downloadFile({
				url: fileUrl,
				success: ({ statusCode, tempFilePath }) => {
					if (statusCode !== 200 || !tempFilePath) {
						uni.showToast({
							title: '文件下载失败',
							icon: 'none'
						});
						return;
					}

					uni.openDocument({
						filePath: tempFilePath,
						showMenu: true,
						fileType: 'docx',
						success: () => {},
						fail: () => {
							uni.showToast({
								title: `打开${fileName}失败`,
								icon: 'none'
							});
						}
					});
				},
				fail: () => {
					uni.showToast({
						title: '文件下载失败',
						icon: 'none'
					});
				},
				complete: () => {
					uni.hideLoading();
				}
			});
		},
		// 打开隐私协议
		openPrivacyContract() {
			wx.openPrivacyContract({
				success: (res) => {
					// console.log('打开隐私协议成功',res)
				},
				fail: (error) => {
					uni.showToast({
						title: '打开失败，稍后重试',
						icon: 'none'
					});
					console.error('打开隐私协议失败', error);
				}
			});
		},
		// 拒绝
		handleDisagree() {
			this.openPrivacyPopup(true);
			this.closePopup();
		},
		// 同意
		handleAgree() {
			this.openPrivacyPopup(false);
			this.closePopup();
			// 告知平台用户已经同意，参数传同意按钮的id
		},
		// 兄弟组件共享方法
		closePopup() {
			this.$emit('closePopup');
		}
	}
};
</script>

<style lang="scss" scoped>
.privacy-popup {
	width: 85%;
	margin: 0 auto;
	padding: 40rpx;
	border-radius: 24rpx;
	box-sizing: border-box;
	overflow: hidden;
	background: #fff;

	&__header {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 52rpx;
		font-size: 32rpx;
		color: #201d16;
		margin-bottom: 38rpx;
	}

	&__container {
		width: 100%;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #160500;
		line-height: 48rpx;
		margin-bottom: 48rpx;
		text-align: justify;
		letter-spacing: -0.05px;

		&-protocol {
			color: #32579c;
		}
	}

	&__footer {
		display: flex;
		flex-direction: column;

		.is-disagree,
		.is-agree {
			width: 100%;
			height: 88rpx;
			background: #ffffff;
			border-radius: 44rpx;
			font-size: 32rpx;
			font-family:
				PingFangSC-Regular,
				PingFang SC;
			font-weight: 400;
			color: #666666;
		}
		.is-disagree {
			background: #f6f6f6;
			margin-bottom: 30rpx;
		}
		.is-agree {
			background: #32579c;
			color: #ffffff;
		}

		button {
			border: none;
			outline: none;

			&::after {
				border: none;
			}
		}
	}
}
</style>
