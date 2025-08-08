<template>
  <swiper
    :autoplay="autoplay" 
    :interval="interval" 
    :duration="duration" 
    :circular="circular"
    :current="current"
    :vertical="vertical"
    :indicator-dots="dots ? receiveData.length > 1 : false"
    :indicator-active-color="dotsActiveColor"
    :style="{height: swiperHeight}"
    > 
    <swiper-item v-for="(item,index) in receiveData" :key="index">
      <view class="swiper-item" v-if="showType === 'swiper'">
        <image class="swiper-image" :src="item.h5FileUrl" mode="widthFix"></image>
      </view>
      <view class="noticebar-item" v-if="showType === 'noticeBar'">
        <image class="noticebar-image" src="https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/homePage/homepage-bar.png" mode="widthFix"></image>
        <text class="noticebar-text">{{ item.fileName }}</text>
        <uni-icons type="forward" size="15" color="#808080"></uni-icons>
      </view>
    </swiper-item>
  </swiper>
</template>

<script>
  export default {
    name: "Swiper", // 轮播图组件
    props: {
      // 接收数据(轮播图 || 通知栏)
      receiveData: {
        type: Array,
        required: true
      },
      // 展示类型
      showType: {
        type: String,
        default: 'swiper'
      },
      swiperHeight: {
        type: String,
      },
      // 自动播放
      autoplay: {
        type: Boolean,
        default: true
      },
      // 自动切换时间间隔
      interval: {
        type: Number,
        default: 5000
      },
      // 滑动动画时长
      duration: {
        type: Number,
        default: 1000
      },
      // 循环轮播
      circular: {
        type: Boolean,
        default: true
      },
      // 当前要显示的滑块的索引
      current: {
        type: Number,
        default: 0
      },
      // 轮播方向
      vertical: {
        type: Boolean,
        default: false
      },
      // 面板指示点
      dots: {
        type: Boolean,
        default: true
      },
      // 面板指示点颜色
      dotsActiveColor: {
        type: String,
        default: '#4a71fd'
      }
    },
    data(){
      return{
      }
    },
    methods: {
      
    }
  }
</script>

<!-- scoped -->
<style lang="scss">
  .swiper-item, .swiper-image {
    width: 100%;
    height: 100%;
  }
  
  .noticebar-item {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12rpx 0 24rpx;
    box-sizing: border-box;
    background-color: #fff;
    .noticebar-image {
      position: relative;
      width: 132rpx;
      padding-right: 16rpx;
    }
    .noticebar-image:after {
      position: absolute;
      content: "";
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 2rpx;
      height: 32rpx;
      background-color: #d5d3d1;
    }
    .noticebar-text {
      display: -webkit-box;  // 伸缩盒子模型
      -webkit-line-clamp: 1; // 显示的行数 
      overflow: hidden; // 超出隐藏
      word-break: break-all;  // 允许在单词内换行
      text-overflow: ellipsis;  // 省略号
      -webkit-box-orient: vertical; // 设置或检索伸缩盒对象的子元素的排列方式
      align-items: center;
      color: #666666;
      font-size: 24rpx;
      padding-left: 16rpx;
      box-sizing: border-box;
    }
  }
</style>