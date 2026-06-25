<template>
	<view class="history-container">
		<CustomNavInner title="浏览记录" />
		<view class="history-list" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view v-if="historyList.length === 0" class="empty-box">
				<image :src="empty" class="empty-image" mode="widthFix"></image>
				<view class="empty-text">浏览记录为空，快去浏览作品吧~</view>
			</view>
			<view class="collect-item" v-for="(item, index) in historyList" :key="item.specialId" v-else>
				<view class="poster">
					<image :src="item.coverUrl" mode="widthFix"></image>
				</view>
				<view class="right-box">
					<view class="top-title">
						<text>{{ item.specialName }}</text>
					</view>
					<view class="bottom-box">
						<view>{{ item.createTime.split(' ')[0] }}</view>
						<view class="collect-box" @click="toggleCollect(item)">
							<image
								class="collect-image"
								:src="
									item.status === 0
										? collectIconInit[1].collectedIcon
										: collectIconInit[0].collectedIcon
								"
								mode="aspectFill"
							></image>
							<view class="collect-num">
								{{ item.specialGood }}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { scienceHistoryWatch } from '@/api';
import categoryData from '@/data/category.json';
import { mapState } from 'vuex';
import { useCollect } from '@/utils/useCollect.js';
export default {
	data() {
		return {
			historyList: [],
			collectIconInit: categoryData.collectIconInit,
			empty: categoryData.emptyImage
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo'])
	},
	onLoad() {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
		// this.getRecommendList();
	},
	methods: {
		async getRecommendList() {
			const res = await scienceHistoryWatch();
			this.historyList = res.data || [];

			const { initCollectStatus, toggleCollect } = useCollect({
				list: this.historyList,
				idKey: 'specialId',
				collectKey: 'status',
				countKey: 'specialGood'
			});
			this.toggleCollect = toggleCollect;
			await initCollectStatus();
		}
	}
};
</script>

<style lang="scss" scoped>
.history-container {
	width: 100%;
	height: 100vh;
	overflow-y: auto;

	.history-list {
		position: absolute;
		margin-left: 50%;
		transform: translateX(-50%);
		z-index: 999;
		width: 90%;
		.collect-item {
			display: flex;
			justify-content: space-between;
			padding: 30rpx 0;
			.poster {
				width: 38%;
				image {
					width: 100%;
					border-radius: 20rpx;
				}
			}
			.right-box {
				width: 57%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				.top-title {
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2; /* 显示两行 */
					overflow: hidden;
					text-overflow: ellipsis;
					word-break: break-word;
					line-height: 1.1;
					text {
						color: #101010;
						font-size: 24rpx;
					}
				}
				.bottom-box {
					display: flex;
					justify-content: space-between;
					color: #7c7e80;
					font-size: 24rpx;
					padding-bottom: 10rpx;
					.collect-box {
						display: flex;
						align-items: center; /* 垂直居中 */
						flex-wrap: nowrap; /* 防止换行 */
						.collect-image {
							flex-shrink: 0; /* 防止图片被压缩 */
							margin-right: 4px;
							width: 28rpx;
							height: 28rpx;
							vertical-align: middle;
						}
						.collect-num {
							white-space: nowrap; /* 防止数字换行 */
							overflow: visible; /* 允许内容溢出 */
							line-height: 1; /* 消除行高影响 */
							display: inline-flex; /* 更好的垂直控制 */
							align-items: center; /* 内容居中 */
							vertical-align: middle; /* 关键：垂直居中对齐 */
							position: relative;
							top: 2rpx; /* 初始为0，然后微调 */
						}
					}
				}
			}
		}
		.collect-item {
			border-bottom: 1px solid #bbbbbb;
		}
		.collect-item:first-child {
			padding-top: 0;
		}
		.collect-item:last-child {
			padding-bottom: 0;
			border-bottom: 0;
		}
	}
}
</style>
