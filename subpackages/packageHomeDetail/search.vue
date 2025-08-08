<template>
  <view class="search-container">
    <view class="search-wrapper">
      <image class="search-icon" :src="searchIcon" />

      <van-field
        v-model="keyword"
        placeholder="请输入关键词"
        border="false"
        class="search-input"
        clearable
        :confirm-type="'search'"
        @confirm="onSearch"
        @input="val => { keyword = val.detail; onInputChange(val); }"
      />

      <view class="search-btn" @click="onSearch">搜索</view>
      
      
      
      <!-- 下拉建议 -->
      <view class="suggestion-list" v-if="showSuggestions && keyword">
        <view
          v-if="suggestions.length"
          v-for="(item, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(item)"
        >
          {{ item }}
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
        @click="selectSuggestion(item)"
      >
        {{ item }}
      </view>
    </view>

    <!-- 搜索结果为空 -->
    <view v-if="searchEmpty" class="empty-text">搜索内容为空~</view>
  </view>
</template>

<script>
  import tabBarData from '@/data/tabBar.json'
  export default {
    data() {
      return {
        keyword: '',
        suggestions: [],
        historyList: [],
        showSuggestions: false,
        searchEmpty: false,
        searchIcon: tabBarData.searchPageIcon,
      }
    },
    mounted() {
      this.loadHistory()
    },
    methods: {
      loadHistory() {
        const cache = uni.getStorageSync('searchHistory') || []
        this.historyList = cache.slice(0, 5)
      },
      saveHistory(keyword) {
        if (!keyword) return
        let cache = uni.getStorageSync('searchHistory') || []
        cache = cache.filter(k => k !== keyword)
        cache.unshift(keyword)
        uni.setStorageSync('searchHistory', cache.slice(0, 10))
        this.loadHistory()
      },
      async onSearch() {
        if (!this.keyword.trim()) return
        this.saveHistory(this.keyword)
        this.showSuggestions = false

        // const result = await getSearchResult(this.keyword) // 后端接口
        const result = [] // 后端接口
        this.searchEmpty = !result || result.length === 0
      },
      async onInputChange(e) {
        console.log(e,"???")
        const val = e.detail || ''
        this.showSuggestions = true
        if (!val.trim()) {
          this.suggestions = []
          return
        }
        // const res = await getSearchSuggestions(val) // 后端接口
        const res = [
          "一富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "二富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "三富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "四富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "五富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "六富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "七富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "八富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "九富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善",
          "十富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善"
        ] // 后端接口
        this.suggestions = res || []
      },
      selectSuggestion(item) {
        this.keyword = item
        this.onSearch()
      },
    }
  }
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

  background: #f9f9f9;
  border-radius: 16rpx;
  margin-top: 12rpx; /* 与搜索框之间的距离 */
  max-height: 640rpx;
  overflow-y: auto;
  // box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.05);
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
