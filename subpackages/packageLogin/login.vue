<template>
	<view class="login-container">
		<view>
			<view class="login-logo">
				<image :src="loginLogo" mode="heightFix" />
			</view>

			<view class="login-panel">
				<view class="login-mode-tabs">
					<view
						class="mode-item"
						:class="{ 'mode-active': loginMode === 'quick' }"
						@click="switchLoginMode('quick')"
					>
						手机号快捷登录
					</view>
					<view
						class="mode-item"
						:class="{ 'mode-active': loginMode === 'code' }"
						@click="switchLoginMode('code')"
					>
						手机验证码登录
					</view>
				</view>
				<view class="title-text">欢迎登录</view>
				<van-cell-group v-if="loginMode === 'code'">
					<van-field
						clearable
						type="tel"
						maxlength="11"
						:adjust-position="false"
						placeholder="请输入手机号"
						:left-icon="loginPanelIcon[0].imgUrl"
						:value="verificationCodeLoginParams.phone || ''"
						@input="updatePhone"
					/>
					<van-field
						clearable
						type="number"
						maxlength="6"
						:adjust-position="false"
						placeholder="验证码"
						custom-class="second-field"
						:left-icon="loginPanelIcon[1].imgUrl"
						:value="verificationCodeLoginParams.code || ''"
						@input="updateVerCode"
					>
						<van-button
							slot="button"
							size="small"
							type="primary"
							color="transparent"
							custom-class="send-btn"
							:disabled="!isPhoneValid || countDown !== 0"
							@click="getVerificationCode"
						>
							<text class="prepare-sending" v-if="countDown === 0">获取验证码</text>
							<text class="is-sending" v-else>已发送({{ countDown }}s)</text>
						</van-button>
					</van-field>
				</van-cell-group>
				<view v-else class="quick-login-wrap">
					<button
						v-if="checked"
						class="quick-login-btn"
						open-type="getPhoneNumber"
						@getphonenumber="handleQuickPhoneLogin"
					>
						手机号快捷登录
					</button>
					<button v-else class="quick-login-btn" @click="handleQuickPhoneLogin">手机号快捷登录</button>
				</view>

				<van-button
					v-if="loginMode === 'code'"
					round
					color="#32579c"
					size="large"
					class="login-btn"
					custom-style="height: 88rpx"
					@click="verificationCodeLogin"
				>
					立即登录
				</van-button>

				<view class="privacy-policy-wrap">
					<view class="policy-point-block">
						<van-checkbox
							:value="checked"
							checked-color="#32579c"
							icon-size="28rpx"
							@change="toggleCheckbox()"
						/>
						<text>已阅读并同意</text>
						<text class="link-text" @click="toAppletPrivacyPolicy">《爱尔眼健康科普教育基地隐私政策》</text>
					</view>
				</view>
			</view>
			<Popup ref="privacyPopup" :type="'center'" :maskClick="false">
				<PrivacyPopup @closePopup="closePopup"></PrivacyPopup>
			</Popup>
		</view>
	</view>
</template>

<script>
import loginData from '@/data/login.json';
import { mapState } from 'vuex';
import { sendCode } from '@/api/index.js';

export default {
	data() {
		return {
			loginLogo: loginData.loginLogo.imgUrl,
			loginPanelIcon: loginData.loginPanelIcon,
			verificationCodeLoginParams: {
				phone: null,
				code: null
			},
			checked: false,
			timer: null,
			countDown: 0,

			checkClause: false, // 是否勾选隐私条款
			stopRun: false, // 是否阻止继续进行
			loginMode: 'quick'
		};
	},
	computed: {
		...mapState('moduleUser', ['showPrivacyPopup']),
		isPhoneValid() {
			return /^[1][2-9][0-9]{9}$/.test(this.verificationCodeLoginParams.phone);
		}
	},
	onLoad() {
		this.checkPrivacy();
	},
	beforeDestroy() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	},
	methods: {
		switchLoginMode(mode) {
			this.loginMode = mode;
		},
		updatePhone(event) {
			this.verificationCodeLoginParams.phone = event.detail;
		},
		updateVerCode(event) {
			this.verificationCodeLoginParams.code = event.detail;
		},
		getWxCode() {
			return new Promise((resolve, reject) => {
				wx.login({
					success(res) {
						if (res.code) {
							resolve(res.code);
						} else {
							reject(new Error('获取登录凭证失败'));
						}
					},
					fail(err) {
						reject(err);
					}
				});
			});
		},
		// 发送手机验证码
		async getVerificationCode() {
			await this.checkPrivacy(); // 获取验证码查询是否同意《小程序用户隐私保护指引》
			if (this.stopRun) return; // 若为真，阻止向下执行
			if (!this.validatePhoneForm()) return;
			uni.showLoading();
			this.startCountdown('已发送验证码');
			sendCode({
				phone: this.verificationCodeLoginParams.phone,
				type: 7
			})
				.then((res) => {
					if (res.code === 200 && res.message.includes('验证码已成功发送')) {
						this.startCountdown('已发送验证码');
					} else {
						uni.hideLoading();
						setTimeout(() => {
							this.$toast({
								message: res.message
							});
						}, 50);
					}
				})
				.finally(() => uni.hideLoading());
		},
		validatePhoneForm() {
			const t = this.verificationCodeLoginParams;
			if (!t.phone) {
				this.$toast({
					message: '请输入您的手机号码'
				});
				return false;
			}
			if (!this.isPhoneValid) {
				this.$toast({
					message: '请输入正确手机号码'
				});
				return false;
			}
			if (!this.checked) {
				this.$toast({
					message: '请同意协议和隐私政策'
				});
				return false;
			}
			return true;
		},
		// 检查用户是否同意过隐私协议
		async checkPrivacy() {
			try {
				uni.showLoading({
					title: '加载中'
				});
				await this.$store.dispatch('moduleUser/queryWeChatAppletPrivacyAuth');
				if (this.$store.state.moduleUser.showPrivacyPopup) {
					this.$refs.privacyPopup.open();
					this.stopRun = true; // 未同意隐私授权，开启停止运行
				} else {
					this.stopRun = false; // 已同意隐私授权，取消停止运行
				}
			} catch (error) {
				console.error('查询用户是否同意隐私设置失败', error);
			} finally {
				uni.hideLoading();
			}
		},
		closePopup() {
			this.$refs.privacyPopup.close();
		},
		toggleCheckbox() {
			this.checked = !this.checked;
		},
		startCountdown(text) {
			this.$toast({
				message: text
			});
			// 清理旧定时器
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
			this.countDown = 60;
			this.timer = setInterval(() => {
				this.countDown--;
				if (this.countDown <= 0) {
					clearInterval(this.timer);
					this.timer = null;
					this.countDown = 0; // 保证不会跌破 0
				}
			}, 1000);
		},
		async handleQuickPhoneLogin(event) {
			if (!this.checked) {
				this.$toast({
					message: '请同意协议和隐私政策'
				});
				return;
			}

			await this.checkPrivacy();
			if (this.stopRun) return;

			const detail = event.detail || {};

			if (!detail.code) {
				this.$toast({
					message: '未授权手机号，无法快捷登录'
				});
				return;
			}

			uni.showLoading();

			try {
				const wxCode = await this.getWxCode();

				const resp = await this.$store.dispatch('moduleUser/phoneQuickLogin', {
					wxCode,
					phone: detail.code
				});

				if (resp.code === 200 && resp.data) {
					uni.switchTab({
						url: '/pages/tabBar/mine/mine'
					});
				} else {
					uni.hideLoading();
					setTimeout(() => {
						this.$toast({
							message: resp.message || '登录失败'
						});
					}, 50);
				}
			} catch (e) {
				uni.hideLoading();
				setTimeout(() => {
					this.$toast({
						message: '获取登录凭证失败'
					});
				}, 50);
			} finally {
				uni.hideLoading();
			}
		},
		async verificationCodeLogin() {
			if (!this.validatePhoneForm()) return;

			uni.showLoading();

			try {
				const wxCode = await this.getWxCode();

				const resp = await this.$store.dispatch('moduleUser/verificationCodeLogin', {
					...this.verificationCodeLoginParams,
					wxCode
				});

				if (resp.code === 200 && resp.data) {
					uni.switchTab({
						url: '/pages/tabBar/mine/mine'
					});
				} else {
					uni.hideLoading();
					setTimeout(() => {
						this.$toast({
							message: resp.message || '登录失败'
						});
					}, 50);
				}
			} catch (e) {
				uni.hideLoading();
				setTimeout(() => {
					this.$toast({
						message: '获取登录凭证失败'
					});
				}, 50);
			} finally {
				uni.hideLoading();
			}
		},
		toAppletPrivacyPolicy() {
			uni.navigateTo({
				url: '/subpackages/packageLogin/appletPrivacyPolicy'
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.login-container {
	width: 100%;
	height: 100vh;
	background: url('https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/h5-mobile-reservation/login/login-bg.webp')
		center/cover no-repeat;
	overflow-y: auto;
	user-select: none;
	display: flex;
	flex-direction: column;

	.login-logo {
		height: 32vh;
		padding: 48rpx 0 40rpx;
		display: flex;
		justify-content: center;
	}

	.login-logo image {
		width: 141px;
		height: 116px;
	}

	.login-panel {
		width: 90%;
		height: 70vh;
		margin: 0 auto;
		background-color: #fff;
		padding: 6% 5% 12% 5%;
		box-sizing: border-box;
		border-radius: 48rpx 48rpx 0 0;

		.title-text {
			color: #32579c;
			font-size: 48rpx;
			text-align: center;
			margin-bottom: 8%;
		}

		.login-mode-tabs {
			display: flex;
			align-items: center;
			margin-bottom: 56rpx;
			padding: 8rpx;
			border-radius: 999rpx;
			background: #eef3fb;
		}

		.mode-item {
			flex: 1;
			height: 72rpx;
			line-height: 72rpx;
			border-radius: 999rpx;
			text-align: center;
			color: #7c7e80;
			font-size: 28rpx;
		}

		.mode-active {
			color: #32579c;
			font-weight: 600;
			background: #fff;
			box-shadow: 0 4rpx 16rpx rgba(50, 87, 156, 0.12);
		}

		.tip-text {
			margin: 3% auto 20% auto;
			font-size: 24rpx;
			color: #9b8e8e;
			text-align: right;
		}

		.login-btn .van-button__text {
			margin-top: 80rpx;
			color: #fff;
			font-size: 36rpx;
		}

		.quick-login-wrap {
			padding: 20rpx 0;
		}

		.quick-login-btn {
			height: 88rpx;
			line-height: 88rpx;
			border-radius: 999rpx;
			color: #fff;
			font-size: 36rpx;
			background-color: #32579c;
		}

		.quick-login-btn::after {
			display: none;
		}

		::v-deep .van-cell {
			display: flex;
			align-items: center;
		}

		::v-deep .second-field {
			margin-bottom: 50rpx;
		}

		::v-deep .second-field .van-field__body {
			position: relative;
			justify-content: space-between;
		}

		::v-deep .second-field .van-field__body::after {
			content: '';
			display: inline-block;
			position: absolute;
			top: 50%;
			right: 36%;
			transform: translate(-50%, -50%);
			width: 0.5px;
			height: 50rpx;
			background: #32579c;
		}

		::v-deep .second-field .van-field__control {
			width: 40%;
		}

		::v-deep .send-btn {
			min-width: 60%;
			white-space: nowrap;
		}

		.prepare-sending {
			color: #32579c;
		}

		.is-sending {
			color: #bbbbbb;
		}

		.privacy-policy-wrap {
			margin-top: 10%;
			padding-bottom: 10%;

			.policy-point-block {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				font-size: 23rpx;
				line-height: 1.5;
				text-align: justify;

				.link-text {
					color: #32579c;
					text-decoration: underline;
				}
			}
		}
	}

	::v-deep .van-field__control {
		padding-left: 20rpx;
		font-size: 36rpx;
	}
}
</style>
