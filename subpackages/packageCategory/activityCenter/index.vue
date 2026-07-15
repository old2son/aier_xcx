<template>
	<view class="activity-center-container">
		<van-tabs
			swipeable
			:active="active"
			:animated="true"
			title-inactive-color="#7C7E80"
			title-active-color="#32579C"
			color="#32579C"
			line-width="80rpx"
			line-height="10rpx"
		>
			<van-tab v-for="(item, tabIdx) in tabList" :title="item.title" :key="tabIdx">
				<template v-if="item.data && item.data.length">
					<view
						v-for="(inner, innerIdx) in item.data"
						:key="innerIdx"
						class="tab-item"
						@click="toSubpackagePage(inner, tabIdx)"
					>
						<image :src="inner.activityBannerUrl" mode="widthFix"></image>
						<view class="txt">
							{{ inner.activityName }}
						</view>
						<view class="date">
							{{ inner.activityTime }}
						</view>
					</view>
				</template>
				<view v-else class="empty-box">
					<view class="empty-txt">暂无数据</view>
				</view>
			</van-tab>
		</van-tabs>
	</view>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
export default {
	data() {
		return {
			active: 0,
			tabList: []
		};
	},
	computed: {
		...mapState('moduleActivity', ['starting', 'future', 'selectedActivity'])
	},
	methods: {
		...mapMutations('moduleActivity', ['setSelectedActivity']),
		...mapActions('moduleActivity', ['fetchActivities']),
		async getActivityData() {
			try {
				await this.fetchActivities();

				// this.tabList = [
				// 	{
				// 		title: '进行中',
				// 		data: this.starting
				// 	},
				// 	{
				// 		title: '即将开始',
				// 		data: this.future
				// 	}
				// ];

				this.tabList = [
					{
						title: '报名中',
						data: this.starting
					}
				];
			} catch (e) {
				console.error('接口获取失败', e);
			}
		},
		toSubpackagePage(inner) {
			this.setSelectedActivity(inner);
			uni.navigateTo({
				url: '/subpackages/packageCategory/activityCenter/activityDetail'
			});
		}
	},
	mounted() {
		this.getActivityData();
	}
};
</script>

<style lang="scss" scoped>
.activity-center-container {
	width: 100%;
	height: 100vh;
	background-color: #f9f9f9;

	::v-deep .van-ellipsis {
		font-weight: 550;
	}
	::v-deep .van-tabs__scroll {
		background-color: transparent;
	}

	.tab-item {
		width: 92%;
		margin: 36rpx auto 0 auto;
		padding: 24rpx;
		border-radius: 20rpx;
		box-sizing: border-box;
		background-color: #fff;
		image {
			border-radius: 20rpx;
		}
		.txt {
			font-size: 28rpx;
			color: #2d2d2d;
			margin: 8rpx 0;
		}
		.date {
			font-size: 28rpx;
			color: #bfc0c0;
		}
	}

	.empty-box {
		width: 92%;
		margin: 40rpx auto 0;
		padding: 80rpx 24rpx;
		border-radius: 20rpx;
		box-sizing: border-box;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.empty-txt {
		color: #bfc0c0;
		font-size: 28rpx;
	}
}
</style>
