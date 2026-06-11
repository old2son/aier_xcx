<template>
	<view class="base-updates-container">
		<CustomNavInner title="基地动态" />
		<view class="base-updates-list" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view
				class="base-updates-item"
				v-for="(item, index) in formattedList"
				:key="item.specialId"
				@click="toDetail(item.specialId)"
			>
				<view class="title">{{ item.specialName }}</view>
				<view class="time">
					{{ item.formattedTime }}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getScienceHomeBaseDynamics } from '@/api';
import { mapState } from 'vuex';
export default {
	data() {
		return {
			baseUpdatesList: []
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		formattedList() {
			return this.baseUpdatesList.map((item) => {
				const safeDateStr = item.createTime.replace(' ', 'T');
				const date = new Date(safeDateStr);
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				return {
					...item,
					formattedTime: `${year}-${month}-${day}`
				};
			});
		}
	},
	methods: {
		async requestData() {
			const { data: baseUpdatesList } = await getScienceHomeBaseDynamics();
			this.baseUpdatesList = baseUpdatesList;
		},
		toDetail(id) {
			uni.navigateTo({
				url: '/subpackages/packageHomeDetail/imgDetail?articleId=' + id
			});
		}
	},
	onLoad() {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
		this.requestData();
	}
};
</script>

<style lang="scss" scoped>
.base-updates-container {
	width: 100%;
	height: 100vh;
	overflow-y: auto;

	.base-updates-list {
		position: absolute;
		margin-left: 50%;
		transform: translateX(-50%);
		z-index: 999;
		width: 90%;
		border-radius: 20rpx;
		.base-updates-item {
			padding: 44rpx 60rpx 0 30rpx;
			box-sizing: border-box;
			box-shadow: 0 0 6px #d3d6d9;
			margin-bottom: 40rpx;
			background-color: #fff;
			.title {
				display: -webkit-box;
				overflow: hidden;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 3;
				text-overflow: ellipsis;
				color: #101010;
				font-size: 32rpx;
				line-height: 1.2;
			}
			.time {
				font-size: 24rpx;
				color: #7c7e80;
				padding-bottom: 48rpx;
				box-sizing: border-box;
				margin-top: 40rpx;
			}
		}
	}
}
</style>
