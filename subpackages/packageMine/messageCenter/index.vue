<template>
	<view class="message-center-container">
		<CustomNavInner title="消息中心" />
		<view class="message-list" :style="scrollViewStyle">
			<view
				class="message-item"
				v-for="(item, index) in messageList"
				:key="item.messageId"
			>
				<view class="title">
					<text>{{ getTitle(item.messageType) }}</text>
					<text v-if="shouldShowRedDot(item)" class="red-dot"></text>
				</view>
				<view class="content-box">
					<template v-if="item.messageType === 1">
						<view class="content-title">您已成功预约：</view>
						<view class="content-init">🔍 项目：{{ item.activityName }}</view>
						<view class="content-init">🕒 时间：{{ item.activityTime }}</view>
						<view class="content-init">🏠 地点：{{ item.activityLocation }}</view>
					</template>
					<template v-else-if="item.messageType === 2">
						<view class="content-title">尊敬的访客：</view>
						<view class="content-init">您预约参加的 [{{ item.activityName }}] 即将开始！</view>
					</template>
					<template v-else-if="item.messageType === 3">
						<view class="content-title">调整期间安排</view>
						<view class="content-init">{{ formatDate(item.activityTime) }}：**正常开放** 🎉</view>
						<view class="content-init">{{ formatDate(item.closeTime) }}：**全天闭馆** 🔒</view>
					</template>
				</view>

				<!-- <view class="go-detail">
					<text>查看详情</text>
					<image class="edit-icon" :src="tabBarData.rightArrowIcon" mode="heightFix"></image>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script>
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { mapState } from 'vuex';
import tabBarData from '@/data/tabBar.json';
import { getScienceMessageList } from '@/api';
export default {
	data() {
		return {
			messageList: [],
			tabBarData: tabBarData
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		scrollViewStyle() {
			const total = this.menuInfo.menuHeight + this.menuInfo.menuHeightFromTop + 14;
			return `margin-top: calc(-28.43vh + ${total}px); height: calc(100vh - ${total}px)`;
		}
	},
	onLoad() {
		this.getData();
	},
	methods: {
		async getData() {
			const { data: res } = await getScienceMessageList();
			console.log('res：', res);
			// res.forEach(item => item.messageType = 3)
			this.messageList = res;
		},
		formatDate(dateStr) {
			console.log('时间：：：', dateStr);
			const date = dayjs(dateStr, 'YYYY年MM月DD日');
			console.log('解析结果：', date.format()); // 看一下是不是 Invalid Date
			const month = date.month() + 1;
			const day = date.date();
			const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.day()];
			return `${month}月${day}日（星期${weekDay}）`;
		},
		getTitle(type) {
			switch (type) {
				case 1:
					return '参观预约成功';
				case 2:
					return '活动即将开始！';
				case 3:
					return '闭馆通知';
				default:
					return '';
			}
		},
		shouldShowRedDot(item) {
			return (item.messageType === 2 || item.messageType === 3) && item.status === 0;
		},
		toDetail(id) {
			uni.navigateTo({
				url: `/subpackages/packageMine/messageCenter/messageDetail?msgId=${id}`
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.message-center-container {
	width: 100%;
	height: 100vh;
	.message-list {
		width: 100%;
		padding: 0 5% 40rpx 5%;
		box-sizing: border-box;
		overflow-y: auto;
		.message-item {
			width: 100%;
			color: #333;
			padding: 20rpx 40rpx 32rpx 40rpx;
			box-sizing: border-box;
			background-color: #fff;
			border-radius: 10px;
			box-shadow: 0 0 6px #eaeaea;
			margin-bottom: 60rpx;
			.title {
				font-size: 36rpx;
				font-weight: 550;
				padding-bottom: 20rpx;
				box-sizing: border-box;
				border-bottom: 0.5px solid #f0f0f0;
				display: flex;
				align-items: center;
				.red-dot {
					width: 8px;
					height: 8px;
					background-color: red;
					border-radius: 50%;
					margin-left: 6px;
				}
			}

			.content-box {
				padding: 16rpx 0;
				box-sizing: border-box;
				// border-bottom: 0.5px solid #f0f0f0;
				font-size: 28rpx;
				.content-init {
					display: flex;
					align-items: center;
					margin: 10rpx 0 20rpx;

					&:last-child {
						margin-bottom: 0;
					}
				}
			}
			.go-detail {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding-top: 16rpx;
				box-sizing: border-box;
				font-size: 28rpx;
				height: 46rpx;
				image {
					width: 26rpx;
					height: 26rpx;
				}
			}
		}
		.message-item:last-child {
			// margin-bottom: 0;
		}
	}
}
</style>
