<template>
	<view class="message-detail-container">
		<CustomNavInner title="消息详情" />
		<view class="message-detail" :style="scrollViewStyle">
			<view class="details-content">
				<view class="title">
					<text>{{ getTitle(msgDetail.messageType) }}</text>
				</view>

				<view class="content-box">
					<view class="content-title weight">尊敬的访客</view>
					<template v-if="msgDetail.messageType === 1">
						<view class="content-title title-1"
							>感谢您预约{{ msgDetail.activityLocation }}的参观游览。</view
						>
						<view class="content-title">您已成功预约：</view>
						<view class="content-init margin-title">
							🔍 项目：
							<text class="color-txt">{{ msgDetail.activityName }}</text>
						</view>
						<view class="content-init margin-title">
							🕒 时间：
							<text class="color-txt">{{ msgDetail.activityTime }}</text>
						</view>
						<view class="content-init margin-title">
							🏠 地点：
							<text class="color-txt">{{ msgDetail.activityLocation }}</text>
						</view>
						<view class="content-title margin-title">预约凭证已保存至“我的预约”。</view>
						<view class="content-title margin-title">如需修改或取消，请提前 1天操作。</view>
						<view class="content-title margin-title">期待与您共度科普时光！</view>
					</template>
					<template v-else-if="msgDetail.messageType === 2">
						<view class="content-init title-2">您预约参加的 [{{ msgDetail.activityName }}] 即将开始！</view>
						<view class="content-init margin-title"> ⏰ 时间：{{ msgDetail.activityTime }} </view>
						<view class="content-init margin-title"> 📍 地点：{{ msgDetail.activityLocation }} </view>
						<view class="content-init margin-title">请预留充足时间，准时到场。</view>
						<view class="content-init margin-title">一起学习护眼知识，点亮清晰视界！</view>
					</template>

					<template v-else-if="msgDetail.messageType === 3">
						<view class="content-init title-2 explain">
							根据国家法定节假日安排，为方便大家参观，本基地原定于{{
								formatDate(msgDetail.closeTime)
							}}的例行闭馆日，将顺延至{{ msgDetail.adjustTime }}。
						</view>
						<view class="content-init margin-title"
							>{{ formatDate(msgDetail.activityTime) }}：**正常开放** 🎉</view
						>
						<view class="content-init margin-title"
							>{{ formatDate(msgDetail.closeTime) }}：**全天闭馆** 🔒</view
						>
						<view class="content-init explain">
							*
							其他日期开馆安排不变，欢迎预约参观。请计划于上述日期来访的用户留意此调整，合理安排您的行程。由此带来的不便，敬请谅解。
						</view>
					</template>
					<view class="bottom-box">
						<span>{{ msgDetail.activityLocation }}</span>
						<span>{{ msgDetail.activityTime }}</span>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { getScienceMessageInsidePage } from '@/api';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
export default {
	data() {
		return {
			msgDetail: {}
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		scrollViewStyle() {
			const total = this.menuInfo.menuHeight + this.menuInfo.menuHeightFromTop + 20;
			return `margin-top: calc(-28.43vh + ${total}px); height: calc(100vh - ${total}px)`;
		}
	},
	onLoad(options) {
		console.log('参数', options);
		this.getDetail(options.msgId);
	},
	methods: {
		async getDetail(id) {
			const { data: res } = await getScienceMessageInsidePage({ messageId: Number(id) });
			res.messageType = 3;
			this.msgDetail = res;
			console.log('消息详情', this.msgDetail);
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
		formatDate(dateStr) {
			if (!dateStr) return null;
			console.log('时间：：：', dateStr);
			const date = dayjs(dateStr, 'YYYY年MM月DD日');
			console.log('解析结果：', date.format()); // 看一下是不是 Invalid Date
			const month = date.month() + 1;
			const day = date.date();
			const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.day()];
			return `${month}月${day}日（星期${weekDay}）`;
		}
	}
};
</script>

<style lang="scss">
.message-detail-container {
	width: 100%;
	height: 100vh;
	.message-detail {
		width: 100%;
		color: #333;
		.details-content {
			width: 90%;
			margin: 0 auto;
			box-sizing: border-box;
			padding: 20rpx 40rpx 32rpx 40rpx;
			background-color: #fff;
			box-shadow: 0 0 6px #eaeaea;
			border-radius: 10px;
			text-align: justify;
		}
		.title {
			font-size: 36rpx;
			font-weight: 550;
			padding-bottom: 20rpx;
			box-sizing: border-box;
			border-bottom: 0.5px solid #f0f0f0;
			display: flex;
			align-items: center;
		}
		.weight {
			font-weight: 550;
		}
		.content-box {
			padding: 16rpx 0;
			box-sizing: border-box;
			font-size: 28rpx;
			.title-1 {
				margin: 30rpx 0;
			}
			.title-2 {
				margin-top: 30rpx;
			}
			.explain {
				line-height: 1.5;
			}
			.content-init {
				display: flex;
				align-items: center;
				.color-txt {
					color: #02c6a2;
					font-weight: 550;
				}
			}
			.margin-title {
				margin: 12rpx 0;
			}
		}
		.bottom-box {
			display: flex;
			flex-direction: column;
			margin-top: 50rpx;
			span {
				display: flex;
				justify-content: flex-end;
			}
			span:first-child {
				margin-bottom: 2px;
			}
		}
	}
}
</style>
