<template>
  <view class="original-collection-detail-container">
    <view class="banner">
      <image :src="banner" mode="widthFix"></image>
    </view>
    <view class="collection-list">
      <view class="collection-item" v-for="(item, index) in collectionList" :key="index">
        <image :src="item.specialFile" mode="widthFix"></image>
       <view class="explain-box">
          {{ item.specialName}}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { getOrbitopathyDoctorTeamBanner, getHotRecommendInpage } from '@/api'
  export default {
    data () {
      return {
        banner: '',
        collectionList: []
      }
    },
    onLoad (options) {
      console.log(options)
      this.getData(options.collectId)
    },
    methods: {
      async getData (collectId) {
        const { data: banner } = await getOrbitopathyDoctorTeamBanner({ columnId: collectId})
        const { data: collectionList } = await getHotRecommendInpage({ specialId: collectId})
        this.banner = banner[0].h5FileUrl
        this.collectionList = collectionList
        console.log(banner)
        console.log(collectionList)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .original-collection-detail-container {
    width: 100%;
    height: 100vh;
    background-color: #fff;
    overflow-y: auto;
    padding-bottom: 60rpx;
    box-sizing: border-box;
    
    .banner {
      width: 100%;
      image {
        width: 100%;
      }
    }
    
    .collection-list {
      width: 90%;
      margin: 60rpx auto 0 auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .collection-item {
        width: 48.5%;
        margin-bottom: 36rpx;
        image {
          border-radius: 20rpx;
          width: 100%;
        }
        .explain-box {
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 24rpx;
          color: #333;
          margin-top: 20rpx;
        }
      }
    }
  }
</style>