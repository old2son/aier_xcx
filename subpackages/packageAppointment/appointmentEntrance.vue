<template>
	<view class="appointment-entrance-container">
		<view class="logo-box">
			<image :src="appointmentData" mode="widthFix"></image>
		</view>
		<view class="appintment-card">
			<view class="back">
				<image class="back-image" :src="appintCardBack" />
				<view class="appintment-entrance-wrap">
					<view class="per-appt" @click="toSubpackagePage('/subpackages/packageAppointment/personalAppointment')">
						<image :src="perImage" mode="widthFix"></image>
					</view>
					<view class="team-appt" @click="toSubpackagePage('/subpackages/packageAppointment/teamAppointment')">
						<image :src="teamImage" mode="widthFix"></image>
					</view>
					<view class="act-appt" @click="toSubpackagePage('/subpackages/packageCategory/activityCenter/index')">
						<image :src="actImage" mode="widthFix"></image>
					</view>
				</view>
				<view class="appintment-guide">
					<text>
						温馨提示：预约前请先阅读
						<text class="link-guide" @click="toSubpackagePage('/subpackages/packageCategory/visitKnow/index?active=1')">《参观须知》</text>
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import appointmentData from '@/data/appointment.json';

export default {
	data() {
		return {
			appointmentData: appointmentData[0].appointmentLogo,
			appintCardBack: appointmentData[0].appintCardBack,
			perImage: appointmentData[0].perImage,
			teamImage: appointmentData[0].teamImage,
			actImage: appointmentData[0].actImage
		};
	},
	onLoad() {
		// this.loadH5Url()
		console.log('...', this.appointmentData);
	},
	methods: {
		toSubpackagePage(url) {
			uni.navigateTo({
				url: url
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.appointment-entrance-container {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 100%;
	height: 100vh;
	background-image: url(https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/%E9%A2%84%E7%BA%A6%E5%85%A5%E5%8F%A3%E8%83%8C%E6%99%AF%E5%9B%BE.png);
	background-size: cover;

	.logo-box {
		width: 100%;
		height: 35vh;
		display: flex;
		align-items: center;
		justify-content: center;
		image {
			width: 188px;
			height: 125px;
		}
	}

	.appintment-card {
		width: 80%;
		height: 65vh;
		margin: 0 auto;
		.back {
			position: relative;
			width: 100%;
			height: 100%;
			.back-image {
				position: absolute;
				top: 0;
				width: 100%;
				height: 75%;
			}
			.appintment-entrance-wrap {
				position: absolute;
				width: 100%;
				height: 75%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				.per-appt,
				.team-appt,
				.act-appt {
					width: 80%;
					text-align: center;
					image {
						width: 220px;
						height: 78px;
					}
				}
				.per-appt {
					margin-top: 5vh;
				}
				.team-appt {
					margin-top: 2vh;
				}
				.act-appt {
					margin-top: 2vh;
				}
			}
		}
	}

	.appintment-guide {
		position: absolute;
		bottom: 15%;
		left: 50%;
		transform: translateX(-50%);
		background-color: #0766ff;
		border-radius: 40rpx;
		color: #fff;
		font-size: 24rpx;
		padding: 12rpx 24rpx;
		box-sizing: border-box;
		text-align: center;
		display: flex;
		justify-content: center;
		white-space: nowrap;
		.link-guide {
			text-decoration: underline;
			color: #fff; /* 可选：像链接颜色 */
		}
	}
}
</style>