<template>
  <view class="guide-container">
    <van-dialog id="van-dialog" />
  </view>
</template>

<script>
  import Dialog from '@/wxcomponents/vant/dialog/dialog'
  export default {
    data() {
      return {
        
      };
    },
    beforeCreate(){
      uni.showTabBar()
    },
    onLoad() {
      Dialog.alert({
        message: '导览暂未开放',
        theme: 'round-button',
        confirmButtonText: '我知道了',
      }).then(() => {
        const pages = getCurrentPages() // 获取页面栈
        if (pages.length > 1) {
          // 有上一页，返回
          uni.navigateBack({
            delta: 1
          });
        } else {
          // 没有上一页，跳转到首页
          uni.reLaunch({
            url: '/pages/tabBar/home/home' // 根据你的首页路径修改
          })
        }
      })
    }
    // onShow() {
    //   // 通过getApp()获取全局实例
    //   const app = getApp()
    //   if (app.globalData) {
    //     app.globalData.currentTab = '/pages/tabBar/guide/guide'
    //   }
    //   // 同步到Vuex
    //   this.$store.commit('moduleTab/SET_CURRENT_TAB', '/pages/tabBar/guide/guide')
    // }
  }
</script>

<style lang="scss" scoped>
.guide-container {
  width: 100%;
  height: 100%;
  ::v-deep .van-dialog {
    color: #434343;
    font-size: 56rpx;
  }
  ::v-deep .van-dialog__message-text {
    color: #434343;
    font-size: 45rpx;
  }
  ::v-deep .van-dialog__message  {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 90rpx;
    padding: 40rpx 0;
  }
  ::v-deep .van-button--danger {
    background: #32579c;
    height: 90rpx;
    font-size: 18px;
    color: #fff!important;
  }
}
</style>
