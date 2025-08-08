<template>
  <view class="recommendation-container">
    <view class="banner">
      <image :src="banner" mode="widthFix"></image>
    </view>
    <view class="recommendation-list">
      <view class="recommendation-item" v-for="(item,index) in recommendationList" :key="item.columnId">
        <image :src="item.h5FileUrl" mode="widthFix"></image>
        <view class="txt">{{ item.fileName }}</view>
      </view>
    </view>
  </view>
</template>

<script>
  import homeData from '@/data/home.json'
  import { getScienceHomeRecommendations } from '@/api'
  export default {
    data () {
      return {
        banner: homeData.recommendationBanner,
        recommendationList: []
      }
    },
    onLoad () {
      this.getData()
    },
    methods: {
      async getData () {
        const { data: recommendationList } = await getScienceHomeRecommendations()
        this.recommendationList = recommendationList
      }
    }
  }
</script>

<style lang="scss" scoped>
.recommendation-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  .banner {
    width: 100%;
    height: 403px;
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  .recommendation-list {
    position: relative;
    top: -142px;
    width: 100%;
    padding: 52rpx 4% 0 4%;
    box-sizing: border-box;
    background-color: #fff;
    border-radius: 40rpx 40rpx 0 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .recommendation-item {
      background-color: #fff;
      border-radius: 20rpx;
      overflow: hidden;
      box-shadow: 0 0 3px #d3d3d3;
      width: 47%;
      color: #333;
      font-size: 32rpx;
      margin-bottom: 50rpx;
      image {
        width: 100%;
      }
      .txt{
        padding: 30rpx 20rpx 50rpx 20rpx;
        box-sizing: border-box;
        color: #333;
        font-size: 32rpx
      }
    }
  }
}
</style>