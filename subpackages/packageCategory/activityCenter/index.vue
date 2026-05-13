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
			<van-tab v-for="(item, index) in tabList" :title="item.title" :key="index">
				<view v-for="(inner, idx) in item.data" :key="idx" class="tab-item" @click="toSubpackagePage(item)">
					<image :src="inner.activityBannerUrl" mode="widthFix"></image>
					<view class="txt">
						{{ inner.activityName }}
					</view>
					<view class="date">
						{{ inner.endTime }}
					</view>
				</view>
			</van-tab>
		</van-tabs>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
	data() {
		return {
			active: 0,
			tabList: []
		};
	},
	computed: {
		...mapState('moduleActivity', ['starting', 'future']),
	},
	methods: {
		...mapActions('moduleActivity', ['fetchActivities']),
		async getActivityData() {
			try {
				await this.fetchActivities();

				const formatData = (list) => {
					return (list || {}).map((item) => ({
						activityBannerUrl: item.activityBannerUrl,
						activityName: item.activityName,
						endTime: item.endTime
					}));
				};
				this.tabList = [
					{
						title: '进行中',
						data: formatData(this.starting)
					},
					{
						title: '即将开始',
						data: formatData(this.future)
					}
				];
			} catch (e) {
				console.error('接口获取失败', e);
			}
		},
		toSubpackagePage(item) {
			const title = item.title;
			uni.navigateTo({
				url: '/subpackages/packageCategory/activityCenter/activityDetail' + `?title=${title}`
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
}
</style>
