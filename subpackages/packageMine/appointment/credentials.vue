<template>
	<view class="credentials">
		<CustomNavInner title="入场凭证" />

		<view class="details-main" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view class="details-content" :class="cardClass">
				<view class="details-tl">{{ reservationType.replace(/（个人）|（团队）/g, '') }}成功</view>

				<view class="qrcode-box">
					<view class="qrcode" :style="{ width: image ? 'auto' : '300rpx' }">
						<view v-if="!image" class="qrcode-loading">
							<view class="loading-ring"></view>
							<text class="loading-text">二维码生成中...</text>
						</view>
						<image v-if="image" :src="image" style="width: 380rpx" mode="widthFix"></image>
					</view>
				</view>
				<view class="row" v-if="selectedReservation.activityName">
					<text class="row-title">活动名称：</text>
					<text class="row-cont">{{ selectedReservation.activityName }}</text>
				</view>
				<view class="row">
					<text class="row-title">活动日期：</text>
					<text class="row-cont">{{ selectedReservation.dateTime }}</text>
				</view>
				<view class="row">
					<text class="row-title">活动时段：</text>
					<text class="row-cont">{{ selectedReservation.timeSlot }}</text>
				</view>
				<view class="row">
					<text class="row-title">活动类型：</text>
					<text class="row-cont">{{ reservationType }}</text>
				</view>
				<view class="row">
					<text class="row-title">预约人：</text>
					<text class="row-cont">{{
						!selectedReservation.members || !selectedReservation.members.length
							? selectedReservation.name
							: getMember(selectedReservation).userName
					}}</text>
				</view>
				<view
					class="save-btn"
					@touchstart="startSavePress"
					@touchend="endSavePress"
					@touchcancel="cancelSavePress"
					@click="tapSaveHint"
				>
					长按保存图片
				</view>
			</view>
		</view>
		<l-qrcode
			style="display: none"
			v-if="!!qrcodeData"
			ref="qrcodeRef"
			useCanvasToTempFilePath
			@success="success"
			:value="`https://www.example.com?data=${qrcodeData}`"
		/>
		<canvas
			canvas-id="credentialCanvas"
			class="save-canvas"
			:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
		></canvas>
	</view>
</template>

<script>
import { mapState } from 'vuex';

export default {
	data() {
		return {
			qrcodeData: '',
			canvasWidth: 335,
			canvasHeight: 560,
			isSaving: false,
			image: '',
			savePressTimer: null,
			hasTriggeredLongPress: false
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		selectedReservation() {
			return this.$store.getters['moduleAppointment/selectedAppointment'];
		},
		reservationType() {
			const item = this.selectedReservation || {};

			const isActivity = Number(item.activityId) !== 0;

			const isPersonal = Array.isArray(item.members) && item.members.length > 0;

			if (isActivity && isPersonal) {
				return '活动预约（个人）';
			}

			if (isActivity && !isPersonal) {
				return '活动预约（团队）';
			}

			if (!isActivity && isPersonal) {
				return '个人预约';
			}

			return '团队预约';
		},
		cardClass() {
			const type = this.reservationType;

			if (type.includes('活动')) {
				return 'activity-card';
			}

			if (type.includes('团队')) {
				return 'team-card';
			}

			return 'personal-card';
		}
	},
	methods: {
		getMember(item) {
			return item.members?.find((v) => v.idNumber) || item.members?.[0] || {};
		},
		getCardTheme() {
			const type = this.reservationType;

			if (type.includes('活动')) {
				return {
					start: '#fed3d4',
					end: '#ffffff',
					title: '#ff5959',
					content: '#ff5959'
				};
			}

			if (type.includes('团队')) {
				return {
					start: '#e7f2fe',
					end: '#ffffff',
					title: '#60a2fe',
					content: '#60a2fe'
				};
			}

			return {
				start: '#fceabf',
				end: '#ffffff',
				title: '#ff9400',
				content: '#ff9400'
			};
		},
		drawRoundRect(ctx, x, y, width, height, radius) {
			const r = Math.min(radius, width / 2, height / 2);
			ctx.beginPath();
			ctx.moveTo(x + r, y);
			ctx.arcTo(x + width, y, x + width, y + height, r);
			ctx.arcTo(x + width, y + height, x, y + height, r);
			ctx.arcTo(x, y + height, x, y, r);
			ctx.arcTo(x, y, x + width, y, r);
			ctx.closePath();
		},
		getDisplayName() {
			const reservation = this.selectedReservation || {};
			return !reservation.members?.length ? reservation.name || '' : this.getMember(reservation).userName || '';
		},
		clearSavePressTimer() {
			if (this.savePressTimer) {
				clearTimeout(this.savePressTimer);
				this.savePressTimer = null;
			}
		},
		startSavePress() {
			this.clearSavePressTimer();
			this.hasTriggeredLongPress = false;
			this.savePressTimer = setTimeout(() => {
				this.hasTriggeredLongPress = true;
				this.saveCredentialImage();
			}, 600);
		},
		endSavePress() {
			this.clearSavePressTimer();
		},
		cancelSavePress() {
			this.clearSavePressTimer();
		},
		tapSaveHint() {
			if (this.hasTriggeredLongPress) {
				this.hasTriggeredLongPress = false;
				return;
			}

			uni.showToast({
				title: '请长按按钮保存图片',
				icon: 'none'
			});
		},
		trimCanvasText(ctx, text, maxWidth) {
			const value = String(text || '');
			if (!value) return '';
			if (ctx.measureText(value).width <= maxWidth) return value;

			let result = value;
			while (result.length > 0 && ctx.measureText(`${result}...`).width > maxWidth) {
				result = result.slice(0, -1);
			}
			return `${result}...`;
		},
		exportQrcodeTempFile() {
			return new Promise((resolve, reject) => {
				const qrcodeRef = this.$refs.qrcodeRef;
				if (!qrcodeRef || !qrcodeRef.canvasToTempFilePath) {
					reject(new Error('二维码未生成'));
					return;
				}

				qrcodeRef.canvasToTempFilePath({
					success: (res) => resolve(res.tempFilePath),
					fail: reject
				});
			});
		},
		async drawCredentialCanvas(qrcodePath) {
			const { windowWidth } = uni.getSystemInfoSync();

			if (String(qrcodePath).startsWith('data:')) {
				qrcodePath = await this.base64ToLocalPath(qrcodePath);
			}

			const canvasWidth = windowWidth - 40;
			const canvasHeight = 620;
			this.canvasWidth = canvasWidth;
			this.canvasHeight = canvasHeight;

			return new Promise((resolve, reject) => {
				this.$nextTick(() => {
					const ctx = uni.createCanvasContext('credentialCanvas', this);
					const theme = this.getCardTheme();
					const cardX = 10;
					const cardY = 10;
					const cardWidth = canvasWidth - 20;
					const cardHeight = canvasHeight - 20;
					const left = cardX + 24;
					const titleY = cardY + 42;
					const qrSize = 170;
					const qrX = (canvasWidth - qrSize) / 2;
					const qrY = titleY + 26;
					const rows = [];

					if (this.selectedReservation.activityName) {
						rows.push(['活动名称：', this.selectedReservation.activityName]);
					}
					rows.push(['活动日期：', this.selectedReservation.dateTime || '']);
					rows.push(['活动时段：', this.selectedReservation.timeSlot || '']);
					rows.push(['活动类型：', this.reservationType]);
					rows.push(['预约人：', this.getDisplayName()]);

					ctx.clearRect(0, 0, canvasWidth, canvasHeight);

					const gradient = ctx.createLinearGradient(0, cardY, 0, cardY + cardHeight);
					gradient.addColorStop(0, theme.start);
					gradient.addColorStop(0.35, theme.end);
					gradient.addColorStop(1, '#ffffff');

					this.drawRoundRect(ctx, cardX, cardY, cardWidth, cardHeight, 16);
					ctx.setFillStyle(gradient);
					ctx.fill();

					ctx.setFillStyle(theme.title);
					ctx.setFontSize(20);
					ctx.fillText('活动预约成功', left, titleY);

					ctx.setFillStyle('#ffffff');
					this.drawRoundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
					ctx.fill();
					ctx.drawImage(qrcodePath, qrX, qrY, qrSize, qrSize);

					let currentY = qrY + qrSize + 44;
					rows.forEach(([label, value]) => {
						ctx.setFontSize(15);
						ctx.setFillStyle('#333333');
						ctx.fillText(label, left, currentY);
						ctx.setFillStyle(theme.content);
						const drawValue = this.trimCanvasText(ctx, value, cardWidth - 120);
						ctx.fillText(drawValue, left + 82, currentY);
						currentY += 34;
					});

					ctx.setFontSize(13);
					ctx.setFillStyle('#999999');
					ctx.fillText('请向工作人员出示此入场凭证', left, cardY + cardHeight - 26);

					ctx.draw(false, () => {
						// 定时器等待绘制完成
						setTimeout(() => {
							uni.canvasToTempFilePath(
								{
									canvasId: 'credentialCanvas',
									destWidth: canvasWidth * 2,
									destHeight: canvasHeight * 2,
									success: (res) => resolve(res.tempFilePath),
									fail: reject
								},
								this
							);
						}, 200);
					});
				});
			});
		},
		base64ToLocalPath(base64) {
			return new Promise((resolve, reject) => {
				try {
					const filePath = `${wx.env.USER_DATA_PATH}/qrcode_${Date.now()}.png`;

					const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

					const fsm = uni.getFileSystemManager();

					fsm.writeFile({
						filePath,
						data: base64Data,
						encoding: 'base64',

						success: () => {
							resolve(filePath);
						},

						fail: (err) => {
							// base64转文件失败
							reject(err);
						}
					});
				} catch (e) {
					reject(e);
				}
			});
		},
		saveImageToAlbum(filePath) {
			return new Promise((resolve, reject) => {
				uni.saveImageToPhotosAlbum({
					filePath,
					success: resolve,
					fail: (err) => {
						if (err && err.errMsg && err.errMsg.includes('auth deny')) {
							uni.showModal({
								title: '提示',
								content: '需要开启保存到相册权限后才能保存图片',
								success: (modalRes) => {
									if (modalRes.confirm) {
										uni.openSetting();
									}
									reject(err);
								}
							});
							return;
						}
						reject(err);
					}
				});
			});
		},
		async saveCredentialImage() {
			if (this.isSaving) {
				return;
			}

			this.isSaving = true;
			uni.showLoading({
				title: '保存中...',
				mask: true
			});

			try {
				const qrcodePath = await this.exportQrcodeTempFile();
				const tempFilePath = await this.drawCredentialCanvas(qrcodePath);
				await this.saveImageToAlbum(tempFilePath);
				uni.showToast({
					title: '已保存到相册',
					icon: 'success'
				});
			} catch (error) {
				if (!(error && error.errMsg && error.errMsg.includes('auth deny'))) {
					uni.showToast({
						title: '保存失败，请重试',
						icon: 'none'
					});
				}
			} finally {
				this.isSaving = false;
				uni.hideLoading();
			}
		},
		success(res) {
			this.image = res;
		}
	},
	mounted() {
		this.qrcodeData = JSON.stringify(this.selectedReservation.members || []);
	},
	beforeDestroy() {
		this.clearSavePressTimer();
	}
};
</script>
<style lang="scss" scoped>
.credentials {
	width: 100%;
	height: 100%;
	padding-bottom: 82.5px;
	overflow-y: auto;
	box-sizing: border-box;
}

.qrcode-box {
	display: flex;
	justify-content: center;

	.qrcode {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 300rpx;
		padding: 16rpx;
		margin: 0 auto 30rpx;
		border-radius: 24rpx;
		background-color: #fff;
	}
}

.qrcode-loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
	width: 100%;
	height: 300rpx;
}

.loading-ring {
	width: 56rpx;
	height: 56rpx;
	border: 6rpx solid #d9e5f8;
	border-top-color: #60a2fe;
	border-radius: 50%;
	animation: qrcode-spin 0.9s linear infinite;
}

.loading-text {
	font-size: 24rpx;
	color: #8aa3c9;
}

.details-tl {
	color: #333333;
	font-size: 36rpx;
	font-weight: 550;
	margin-bottom: 30rpx;
}

.details-main {
	position: absolute;
	width: 100%;
	padding: 18px 20px;
	box-sizing: border-box;
}

.details-content {
	padding: 18px 20px;
	margin-bottom: 20px;
	box-sizing: border-box;
	border-radius: 24rpx;
	box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.08);
	background-color: #fff;
	position: relative;
	overflow: hidden;
}

.save-btn {
	margin-top: 36rpx;
	height: 84rpx;
	line-height: 84rpx;
	border-radius: 999rpx;
	text-align: center;
	font-size: 28rpx;
}

.personal-card {
	background: linear-gradient(to bottom, #fceabf 0%, #ffffff 35%);

	.details-tl {
		color: #ff9400;
	}

	.row-cont {
		color: #ff9400;
	}

	.save-btn {
		color: #fff;
		background-color: #ff9400;
	}
}

.team-card {
	background: linear-gradient(to bottom, #e7f2fe 0%, #ffffff 35%);

	.details-tl {
		color: #60a2fe;
	}

	.row-cont {
		color: #60a2fe;
	}

	.save-btn {
		color: #fff;
		background-color: #60a2fe;
	}
}

.activity-card {
	background: linear-gradient(to bottom, #fed3d4 0%, #ffffff 60%);

	.details-tl {
		color: #ff5959;
	}

	.row-cont {
		color: #ff5959;
	}

	.save-btn {
		color: #fff;
		background-color: #ff5959;
	}
}

.row {
	display: flex;
	gap: 0 20rpx;
	margin-bottom: 30rpx;
	color: #828282;
	font-size: 28rpx;
}

.row-title {
	color: #333333;
}

.save-canvas {
	position: fixed;
	left: -9999px;
	top: -9999px;
	pointer-events: none;
}

@keyframes qrcode-spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
