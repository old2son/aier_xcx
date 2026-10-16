<template>
	<view class="search-container">
		<view class="search-wrapper">
			<image class="search-icon" :src="searchIcon" />

			<van-field
				placeholder="请输入关键词"
				border="false"
				class="search-input"
				clearable
				:confirm-type="'search'"
				@confirm="onSearch"
				@input="
					(val) => {
						keyword = val.detail;
						onInputChange(val);
					}
				"
			/>

			<view class="search-btn" @click="onSearch">搜索</view>

			<!-- 下拉建议 -->
			<view class="suggestion-list" v-if="showSuggestions && keyword">
				<view
					v-if="suggestions.length"
					v-for="(item, index) in suggestions"
					:key="index"
					class="suggestion-item"
					@click="selectSuggestion(item, true)"
				>
					{{ item.title }}
				</view>
				<view v-else class="suggestion-empty">没有更多了~</view>
			</view>
		</view>

		<!-- 历史搜索 -->
		<view class="history-title">历史搜索</view>
		<view class="history-list">
			<view
				class="history-item"
				v-for="(item, index) in historyList"
				:key="index"
				@click="selectSuggestion(item, false)"
			>
				{{ item.title }}
			</view>
		</view>

		<!-- 搜索结果为空 -->
		<view v-if="searchEmpty" class="empty-text">搜索内容为空~</view>
	</view>
</template>

<script>
import tabBarData from '@/data/tabBar.json';
import { getSearchSuggestions } from '@/api/index';
import dayjs from 'dayjs';
export default {
	data() {
		return {
			keyword: '',
			suggestions: [],
			theSuggestion: {},
			historyList: [],
			showSuggestions: false,
			searchEmpty: false,
			searchIcon: tabBarData.searchPageIcon
		};
	},
	mounted() {
		this.loadHistory();
	},
	methods: {
		loadHistory() {
			const cache = uni.getStorageSync('searchHistory') || [];
			this.historyList = cache.slice(0, 5);
		},
		saveHistory(keyword) {
			if (!keyword) return;
			let cache = uni.getStorageSync('searchHistory') || [];
			cache = cache.filter((k) => k !== keyword);
			cache.unshift(keyword);
			uni.setStorageSync('searchHistory', cache.slice(0, 10));
			this.loadHistory();
		},
		async onSearch() {
			this.showSuggestions = true;
			if (!this.keyword.trim()) {
				this.suggestions = [];
				return;
			}
			this.getData();
		},
		async onInputChange(e) {
			const val = e.detail || '';
			this.showSuggestions = true;
			if (!val.trim()) {
				this.suggestions = [];
				return;
			}

			this.getData();
		},
		async getData() {
		    const { data } = await getSearchSuggestions({
				keyword: this.keyword
			});

			const now = dayjs();
			this.suggestions = (data || []).filter((item) => {
				// sourceUrl 为空的一律展示
				if (!item.sourceType !== 'activity') return true;
				// 没有 endTime 或解析失败时，按展示处理
				const endTime = this.parseEndTime(item.activityTime);
				if (!endTime) return true;
				// sourceUrl 不为空且 endTime 小于当前时间 → 不展示
				return !endTime.isBefore(now);
			});
		},
		// 兼容 "2024-01-01 12:00:00" / "2024-01-01T12:00:00" / 毫秒时间戳，解析失败返回 null
		parseEndTime(endTime) {
			if (endTime === null || endTime === undefined || endTime === '') return null;
			const str = String(endTime).trim();
			if (!str) return null;
			// 纯数字按毫秒时间戳处理，避免 dayjs 把它当成 "1735-66-08..." 解析
			const time = /^\d+$/.test(str) ? dayjs(Number(str)) : dayjs(str);
			return time.isValid() ? time : null;
		},
		selectSuggestion(item, isSaveHistory) {
			this.theSuggestion = item || '';

			if (isSaveHistory) {
				if (!this.theSuggestion?.title?.trim()) {
					uni.showToast({
						title: '没有搜索内容',
						icon: 'none'
					});
					return;
				}
				this.saveHistory(this.theSuggestion);
				this.showSuggestions = false;
			}

			if (item.sourceType === 'special') {
				uni.navigateTo({
					url: `/subpackages/packageHomeDetail/imgDetail?articleId=${item.id}`
				});
				return;
			}

			if (item.sourceType === 'activity') {
				// 历史记录点击时，先校验活动是否已结束（解析失败按未过期处理）
				if (!isSaveHistory) {
					const endTime = this.parseEndTime(item.activityTime);
					if (endTime && endTime.isBefore(dayjs())) {
						uni.showToast({
							title: '活动已结束',
							icon: 'none'
						});
						this.removeHistoryItem(item);
						return;
					}
				}

				uni.navigateTo({
					url: `/subpackages/packageCategory/activityCenter/activityDetail?activityId=${item.id}`
				});
				return;
			}
		},
		// 删除本地历史记录中对应的数据（优先按 id 匹配，兼容只存标题的旧数据）
		removeHistoryItem(item) {
			if (!item) return;
			const targetId = item.id;
			const targetTitle = item.title;
			let cache = uni.getStorageSync('searchHistory') || [];
			cache = cache.filter((k) => {
				if (!k) return false;
				if (typeof k === 'string') return k !== targetTitle;
				if (targetId !== undefined && targetId !== null && k.id !== undefined && k.id !== null) {
					return String(k.id) !== String(targetId);
				}
				return k.title !== targetTitle;
			});
			uni.setStorageSync('searchHistory', cache);
			this.loadHistory();
		}
	}
};
</script>

<style lang="scss" scoped>
.search-container {
	width: 100%;
	height: 100vh;
	padding: 36rpx 40rpx 0 40rpx;
	background-color: #f9f9f9;
	box-sizing: border-box;
}

.search-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 80rpx;
	padding: 0 24rpx;
}

.search-icon {
	width: 46rpx;
	height: 46rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	padding: 0;
	background: transparent;

	::v-deep .van-field__control {
		background: transparent;
	}
}

.search-btn {
	background-color: #126dc4;
	color: #fff;
	font-size: 26rpx;
	padding: 10rpx 26rpx;
	border-radius: 30rpx;
	margin-left: 20rpx;
	white-space: nowrap;
}

.suggestion-list {
	position: absolute;
	top: 100%; /* 紧贴搜索框底部 */
	left: 0;
	right: 0;
	z-index: 10;

	background: #fff;
	border-radius: 16rpx;
	margin-top: 12rpx; /* 与搜索框之间的距离 */
	max-height: 640rpx;
	overflow-y: auto;
	box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.05);
}

.suggestion-item {
	width: 100%;
	max-height: 80rpx;
	box-sizing: border-box;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	display: block;
	padding: 24rpx;
	font-size: 28rpx;
	border-bottom: 1px solid #ebedf0;
	color: #333;
}

.suggestion-empty {
	padding: 40rpx 0;
	text-align: center;
	color: #999;
	font-size: 26rpx;
}

.history-title {
	font-weight: 600;
	margin-top: 40rpx;
	font-size: 30rpx;
	color: #333;
}

.history-list {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx 20rpx;
	margin-top: 20rpx;
}

.history-item {
	background: #f2f3f5;
	border-radius: 30rpx;
	padding: 12rpx 32rpx;
	font-size: 28rpx;
	color: #333;
	max-width: 50%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.empty-text {
	text-align: center;
	padding: 120rpx 0;
	font-size: 28rpx;
	color: #bbb;
}
</style>
