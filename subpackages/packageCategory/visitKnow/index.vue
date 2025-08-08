<template>
  <view class="visit-know-container">
    <CustomNavInner
      title="参观须知" 
    />
    <view 
      class="title-image"
      :style="{ paddingTop: `calc(${menuInfo.menuHeight + menuInfo.menuHeightFromTop}px + 5%)`}"
    >
       <image :src="titleImage" mode="heightFix"></image>
     </view>
    <view class="tab-container">
      <van-tabs
        swipeable
        :active="active"
        :animated="true"
        title-inactive-color="#7C7E80"
        title-active-color="#32579C"
        color="#32579C"
        line-width="120rpx"
        line-height="10rpx"
        @change="selectTab"
      >
        <van-tab
          v-for="(item, index) in visitKnowTabList" 
          :title="item.title" 
          :key="item.id"
        >
          <view class="tab-content">
            <image :src="item.initPic" mode="widthFix" class="tab-image"></image>
          </view>
        </van-tab>
      </van-tabs>
    </view>
  </view>
</template>

<script>
  import categoryData from '@/data/category.json'
  import { mapState } from "vuex"
  export default {
    data() {
      return {
        active: 0,
        titleImage: categoryData.visitKnowTitleImage,
        visitKnowTabList: categoryData.visitKnowTabList,
      };
    },
    computed: {
      ...mapState("moduleLayout", ['menuInfo'])
    },
    onLoad (options) {
      this.active = Number(options.active) || 0
      this.$store.dispatch('moduleLayout/getNavigationBarStyle')
    },
    methods: {
      selectTab(e) {
        console.log(this.titleImage)
        console.log(categoryData)
        this.active = e.detail.name
      },
    }
  }
</script>

<style lang="scss" scoped>
.visit-know-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  
  .title-image {
    position: fixed;
    width: 100%;
    height: 28.43vh;
    padding-left: 6%;
    box-sizing: border-box;
    image {
      height: 30%;
    }
  }
  
  .tab-container {
    position: relative;
    top: -6.5vh;
    width: 100%;
    z-index: 9999;
    height: calc(100vh - (28.43vh +  -3.5vh));
    background-color: #fff;
    border-radius: 40rpx 40rpx 0 0;
    ::v-deep .van-tabs__scroll {
      border-radius: 40rpx 40rpx 0 0;
    }
    ::v-deep .van-ellipsis {
      font-size: 32rpx;
      font-weight: 550;
    }
    .tab-content {
      text-align: center;
      height: calc(100vh - 58px - 40rpx - 100rpx);
      overflow-y: auto;
    }
  }
}
</style>