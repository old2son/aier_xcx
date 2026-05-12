<template>
	<view class="my-appointmennt-container">
		<CustomNavInner title="我的预约" />
		<view class="tab-area" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<van-tabs swipeable :active="active" title-inactive-color="#7C7E80" title-active-color="#32579C" color="#32579C" line-width="80rpx" line-height="10rpx">
				<van-tab v-for="(item, index) in tabList" :title="item.title" :key="index">
					<view class="list-wrapper">
						<block v-if="index === 0">
							<!-- 渲染待使用项 -->
							<template v-if="unusedList.length === 0">
								<view class="empty-box">
									<image :src="empty" class="empty-image" mode="widthFix"></image>
									<view class="empty-text">暂无待使用预约</view>
								</view>
							</template>
							<template v-else>
								<view class="list-item" v-for="(item, i) in unusedList" :key="item.reId">
									<view class="col-1">
										<text>预约信息</text>
										<text @click="cancelReservationOperate(item.reId)">取消预约</text>
									</view>
									<view @click="toApppintmentDetail(item)">
										<view class="col-2">
											<text>游客信息</text>
											<text>{{ item.name }}</text>
										</view>
										<view class="col-3">
											<text>联系电话</text>
											<text>{{ formatPhone(item.phone) }}</text>
										</view>
										<view class="col-4">
											<text>同行人数</text>
											<text>{{ item.colleagues }}</text>
										</view>
										<view class="col-5">
											<text>团讲人数</text>
											<text>{{ item.numbers }}</text>
										</view>
										<view class="col-6">
											<view class="title-txt">参观日期</view>
											<view class="date">
												<text>{{ item.dateTime }}</text>
												<text>{{ item.week }}</text>
												<text>{{ item.timeSlot }}</text>
											</view>
										</view>
									</view>
									<view class="col-7">
										<view class="code-btn">
											<text @click="toCredentials(item)">入场凭证</text>
										</view>
									</view>
								</view>
							</template>
						</block>
						<block v-else-if="index === 1">
							<!-- 渲染已使用项 -->
							<template v-if="usedList.length === 0">
								<view class="empty-box">
									<image :src="empty" class="empty-image" mode="widthFix"></image>
									<view class="empty-text">暂无已使用预约</view>
								</view>
							</template>
							<template v-else>
								<view class="list-item" v-for="(item, i) in usedList" :key="item.reId">
									<view class="col-1">
										<text>预约信息</text>
										<text class="used-txt">已使用</text>
									</view>
									<view @click="toApppintmentDetail(item)">
										<view class="col-2">
											<text>游客信息</text>
											<text>{{ item.name }}</text>
										</view>
										<view class="col-3">
											<text>联系电话</text>
											<text>{{ formatPhone(item.phone) }}</text>
										</view>
										<view class="col-4">
											<text>同行人数</text>
											<text>{{ item.colleagues }}</text>
										</view>
										<view class="col-5">
											<text>团讲人数</text>
											<text>{{ item.numbers }}</text>
										</view>
										<view class="col-6">
											<view class="title-txt">参观日期</view>
											<view class="date">
												<text>{{ item.dateTime }}</text>
												<text>{{ item.week }}</text>
												<text>{{ item.timeSlot }}</text>
											</view>
										</view>
									</view>
								</view>
							</template>
						</block>
						<block v-else-if="index === 2">
							<!-- 渲染已过期项 -->
							<template v-if="expiredList.length === 0">
								<view class="empty-box">
									<image :src="empty" class="empty-image" mode="widthFix"></image>
									<view class="empty-text">暂无已过期预约</view>
								</view>
							</template>
							<template v-else>
								<view class="list-item" v-for="(item, i) in expiredList" :key="item.reId">
									<view class="col-1s">
										<text>预约信息</text>
										<text>已过期</text>
									</view>
									<view @click="toApppintmentDetail(item)">
										<view class="col-2">
											<text>游客信息</text>
											<text>{{ item.name }}</text>
										</view>
										<view class="col-3">
											<text>联系电话</text>
											<text>{{ formatPhone(item.phone) }}</text>
										</view>
										<view class="col-4">
											<text>同行人数</text>
											<text>{{ item.colleagues }}</text>
										</view>
										<view class="col-5">
											<text>团讲人数</text>
											<text>{{ item.numbers }}</text>
										</view>
										<view class="col-6">
											<view class="title-txt">参观日期</view>
											<view class="date">
												<text>{{ item.dateTime }}</text>
												<text>{{ item.week }}</text>
												<text>{{ item.timeSlot }}</text>
											</view>
										</view>
									</view>
								</view>
							</template>
						</block>
					</view>
				</van-tab>
			</van-tabs>
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
import { myReservation, cancelReservation } from '@/api';
import tabList from '@/data/category.json';
import categoryData from '@/data/category.json';
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
			cancelReason: '临时有事',
			reId: '',
			empty: categoryData.emptyImage,

			active: 0,
			tabList: tabList.myAppointmenntTabList,
			unusedList: [], // status === 0
			usedList: [], // status === 2
			expiredList: [] // status === 1
		};
	},
	mounted() {
		console.log('tabList：', tabList);
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
		this.getReservationRecord();
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		selectedReservation() {
			return this.$store.getters['moduleAppointment/selectedAppointment'];
		}
	},
	methods: {
		formatPhone(phone) {
			if (!phone || phone.length < 7) return phone;
			// 只保留前三位和后四位，中间用 **** 替代
			return phone.slice(0, 3) + '****' + phone.slice(-4);
		},
		getReservationRecord() {
			uni.showLoading({
				title: '加载中'
			});
			myReservation()
				.then((res) => {
					if (res.code === 200 && res.message === '查询成功') {
						const allList = res.data || [];
						this.unusedList = allList.filter((item) => item.status === 0); // 0 待使用
						this.usedList = allList.filter((item) => item.status === 2); // 2 已使用（目前没有，但是后期预留）
						this.expiredList = allList.filter((item) => item.status === 1); // 1 主动取消/过期
					}
				})
				.finally(() => {
					uni.hideLoading();
				});
		},
		toApppintmentDetail(item) {
			this.$store.commit('moduleAppointment/setSelectedAppointment', item);
			uni.navigateTo({
				url: '/subpackages/packageMine/appointment/appointmentDetail'
			});
		},
		toCredentials(item) {
			console.log('item', item);
			this.$store.commit('moduleAppointment/setSelectedAppointment', item);
			uni.navigateTo({ url: '/subpackages/packageMine/appointment/credentials' });
		},
		cancelReservationOperate(id) {
			this.reId = id;
			this.cancelReservationPopup = true;
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
			uni.showLoading();
			cancelReservation({
				cancel: this.cancelReason,
				reId: this.reId
			})
				.then((res) => {
					console.log(res);
					uni.showToast({
						title: res.message,
						duration: 3000,
						icon: 'none'
					});
					if (res.code === 200 && res.message == '您已成功取消预约') {
						this.getReservationRecord();
						this.cancelReservationPopup = false;
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
.my-appointmennt-container {
	width: 100%;
	height: 100vh;

	::v-deep .van-ellipsis {
		font-size: 36rpx;
	}
	::v-deep .van-tabs__scroll {
		background-color: transparent;
	}

	.tab-area {
		position: absolute;
		z-index: 99;
		width: 100%;
		.list-wrapper {
			width: 92%;
			margin: 52rpx auto 0 auto;
			padding-bottom: 40rpx;
			.list-item {
				width: 100%;
				background-color: #fff;
				border-radius: 30rpx;
				margin-bottom: 50rpx;
				padding: 25rpx 36rpx;
				box-sizing: border-box;
				box-shadow: 0 0 10rpx #d8d8d8;
				.col-1,
				.col-2,
				.col-3,
				.col-4,
				.col-5,
				.col-6 {
					display: flex;
					justify-content: space-between;
					color: #828282;
					font-size: 28rpx;
					margin-bottom: 30rpx;
				}
				.col-1 {
					font-size: 32rpx;
					text:nth-child(1) {
						color: #333;
					}
					text:nth-child(2) {
						color: #fd7d7d;
					}
					.used-txt {
						color: #32579c !important;
					}
				}
				.col-1s {
					display: flex;
					justify-content: space-between;
					color: #828282;
					font-size: 28rpx;
					margin-bottom: 30rpx;
					text:nth-child(1) {
						color: #333;
					}
					text:nth-child(2) {
						color: #cfcbcb;
					}
				}
				.col-6 {
					font-size: 24rpx;
					text:nth-child(2) {
						margin: 0 10rpx;
					}
				}
				.col-7 {
					margin-top: 54rpx;
					display: flex;
					justify-content: flex-end;
					font-size: 36rpx;
					.code-btn {
						background-color: #fb565a;
						color: #fff;
						width: fit-content;
						font-size: 28rpx;
						border-radius: 40rpx;
						padding: 16rpx 50rpx;
						box-sizing: border-box;
					}
				}
			}
		}
	}

	.cancel-title {
		text-align: center;
		font-size: 20px;
		margin: 12px 0;
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
}
</style>