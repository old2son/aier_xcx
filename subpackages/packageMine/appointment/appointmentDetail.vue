<template>
	<view class="trip-details-container">
		<CustomNavInner title="预约详情" />
		<view class="details-main" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view class="details-content">
				<view class="col-1">
					<text>预约信息</text>
					<image
						mode="heightFix"
						src="https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/h5-mobile-reservation/mine/%E5%B7%B2%E5%8F%96%E6%B6%88.svg"
						alt=""
						v-if="selectedReservation.status === 1"
					/>
				</view>
				<view class="col-2">
					<text>游客信息</text>

					<text>{{ !selectedReservation.members.length ? selectedReservation.name : getMember(item).userName }}</text>
				</view>
				<view class="col-2">
					<text>联系电话</text>
					<text>{{ !selectedReservation.members.length ? selectedReservation.phone : getMember(selectedReservation).userPhone }}</text>
				</view>
				<view class="col-2">
					<text>同行人数</text>
					<text>{{ selectedReservation.colleagues }}</text>
				</view>
				<view class="col-2">
					<text>团讲人数</text>
					<text>{{ selectedReservation.numbers }}</text>
				</view>
				<view class="col-3">
					<view class="title-txt">参观日期</view>
					<view class="date">
						<text>{{ selectedReservation.dateTime }}</text>
						<text>{{ selectedReservation.week }}</text>
						<text>{{ selectedReservation.timeSlot }}</text>
					</view>
				</view>
			</view>
			<view class="details-tips">
				<view class="tips-txt">预约须知</view>
				<view class="article">
					1.入馆请自觉接受安检，请勿将各类禁限带物品(包含但不限于食物、饮料，管制刀具、利器，易燃易爆有毒有害等危险物品等)及宠物带入场馆。2.为保证展品、人员安全和良好的参观体验，请文明观展按馆内指示参观，禁止任何不安全行为。3.如有需要，请提前了解展馆的导览和讲解服务安排;参观时请留意馆内安全设施和出口，突发事件服从工作人员指挥。祝您在本馆参观愉快!如有疑惑或需其他帮助，请随时联系工作人员。
				</view>
			</view>
			<view class="cancel-app-btn" v-if="selectedReservation.status === 0">
				<button type="default" class="van-button" @click="cancelReservationPopup = true">取消预约</button>
			</view>
		</view>

		<van-popup :show="cancelReservationPopup" round position="bottom" custom-style="height: 45%">
			<view class="cancel-title">取消原因</view>
			<van-radio-group :value="radio" @change="handleRadioChange">
				<van-radio :name="item.value" v-for="(item, index) in options" :key="index">
					{{ item.title }}
				</van-radio>
			</van-radio-group>
			<view class="btn-wrap">
				<button class="cancel-btn" @click="cancelReservationPopup = false">取消</button>
				<button class="confirm-btn" @click="confirm()">确认</button>
			</view>
		</van-popup>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { cancelReservation } from '@/api';

export default {
	data() {
		return {
			cancelReservationPopup: false,
			radio: '1',
			options: [
				{ title: '临时有事', value: '1' },
				{ title: '更改日期/时段', value: '2' },
				{ title: '天气原因', value: '3' },
				{ title: '未能成团，没有科普讲解服务', value: '4' }
			],
			cancelReason: '临时有事'
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		selectedReservation() {
			return this.$store.getters['moduleAppointment/selectedAppointment'];
		}
	},
	onLoad(options) {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
	},
	methods: {
		getMember(item) {
			return item.members?.find((v) => v.idNumber) || item.members?.[0] || {};
		},
		handleRadioChange(e) {
			const value = e.detail;
			// 根据选择的 radio 值获取对应的文本内容
			const selectedOption = this.options.find((option) => option.value === value);
			if (selectedOption) {
				this.cancelReason = selectedOption.title;
			}
		},
		confirm() {
			this.cancelReservationOperate();
		},
		cancelReservationOperate() {
			uni.showLoading();
			cancelReservation({
				cancel: this.cancelReason,
				reId: this.selectedReservation.reId
			})
				.then((res) => {
					uni.showToast({
						title: res.message,
						duration: 3000,
						icon: 'none'
					});
					if (res.code === 200 && res.message == '您已成功取消预约') {
						uni.navigateTo({
							url: '/subpackages/packageMine/appointment/myAppointment'
						});
					}
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	}
};
</script>
<style lang="scss" scoped>
.trip-details-container {
	width: 100%;
	height: 100%;
	overflow-y: auto;
	padding-bottom: 82.5px;
	box-sizing: border-box;
}

.details-main {
	position: absolute;
	padding: 18px 20px;
	box-sizing: border-box;
}

.details-content {
	background-color: #fff;
	border-radius: 12px;
	margin-bottom: 20px;
	padding: 18px 20px;
	box-sizing: border-box;
	box-shadow: 0 0 10rpx #d8d8d8;
}

.col-1 {
	position: relative;
	color: #333333;
	font-size: 16px;
	margin-bottom: 15px;
}

.col-1 image {
	position: absolute;
	top: 0;
	right: 0;
	width: 88px;
	height: 58px;
}

.col-2 {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: #666;
	margin-bottom: 15px;
}

.col-3 {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	margin-bottom: 0;
	color: #666;
}

.col-3 .date text:nth-child(2) {
	margin: 0 10px;
}

.details-tips {
	background-color: #fff;
	border-radius: 12px;
	padding: 18px 20px;
	box-sizing: border-box;
	box-shadow: 0 0 10rpx #d8d8d8;
}

.tips-txt {
	color: #333333;
	font-size: 16px;
	margin-bottom: 15px;
}

.article {
	color: #444444;
	text-align: justify;
	font-size: 12px;
	line-height: 2;
}

.cancel-title {
	text-align: center;
	font-size: 20px;
	margin: 12px 0;
}

.cancel-app-btn button {
	width: 100%;
	color: #fff;
	margin-top: 40rpx;
	border-radius: 50rpx;
	background: rgb(50, 87, 156);
}

.btn-wrap {
	margin-top: 30px;
	display: flex;
	justify-content: space-between;
	.cancel-btn {
		width: 42%;
		color: #bbb;
		border-radius: 50rpx;
		background-color: transparent;
		border: 1px solid #bbb;
	}
	.confirm-btn {
		width: 42%;
		color: #fff;
		border-radius: 50rpx;
		background-color: #32579c;
	}
	button::after {
		display: none;
	}
}

::v-deep .van-radio {
	width: 80%;
	margin: 0 auto 40rpx auto;
	display: flex;
	justify-content: space-between;
	flex-direction: row-reverse;
}
/* 适配vant组件样式 */
::v-deep .van-radio__icon--checked {
	border-color: #d3d4d7;
	color: transparent;
	background-color: #32579c;
}
::v-deep .van-radio__icon--checked .van-icon:before {
	display: none;
}
::v-deep .van-icon,
.van-icon:before {
	display: none;
}
</style>
