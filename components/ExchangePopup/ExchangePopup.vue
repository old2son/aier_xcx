<template>
  <van-popup 
    :show="show" 
    @close="onClose" 
    position="center"
    :close-on-click-overlay="false"
  >    <view 
      class="popup-content"
      :class="{ wobble: type === 'success' }"
      :key="show">      <image :src="image" mode="widthFix" class="bg-image"></image>
      <view class="inner-content">
        <view class="tips-message" v-if="needPoints >= 0">兑换该礼品需要 {{ needPoints }} 积分</view>
        <button class="goto-btn" @click="goToPage">{{ tips }}</button>
      </view>    </view>    <view class="close-circle" @click="onClose">
      <view class="close-line close-line1"></view>
      <view class="close-line close-line2"></view>
    </view>  </van-popup>
</template>

<script>
export default {  name: "ExchangePopup",
  options: {
    styleIsolation: 'shared'
  },  props: {    show: { type: Boolean, default: false },    image: { type: String, required: true },    tips: { type: String, required: true },
    type: { type: String, required: true },
    needPoints: { type: Number, default: -1 }  },  methods: {    onClose() {      this.$emit('update:show', false)    },    goToPage() {
      if(this.type === 'success'){
        uni.navigateTo({ url: '/subpackages/packageMine/points/exchangeRecord' })
      } else {
        this.onClose()
      }    }  }}</script><style lang="scss" scoped>
::v-deep .van-popup {
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  overflow-x: hidden;
}
.popup-content {  position: relative;  display: flex;  align-items: center;  flex-direction: column;
  width: 85%;}
.wobble {
  animation-name: wobble;
  animation-duration: 0.85s;
  animation-fill-mode: both;
}
@keyframes wobble {
  0% {
    transform: none;
  }
  15% {
    transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
  }
  30% {
    transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
  }
  45% {
    transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
  }
  60% {
    transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
  }
  75% {
    transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
  }
  100% {
    transform: none;
  }
}
.bg-image {  width: 100%;
  height: 210px;}
.inner-content {
  position: absolute;
  top: 21%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.tips-message {
  margin-bottom: 25rpx;
  color: #101010;
  font-size: 12px;
  font-weight: 550;
}
.goto-btn {  width: 85%;
  height: 40px;
  line-height: 40px;
  color: #fff;
  font-size: 14px;  text-align: center;  border-radius: 60rpx;  background-color: #ffa100;}
.close-circle {  margin: 20rpx auto 0 auto;  width: 60rpx;  height: 60rpx;  background: #ccc;  border-radius: 50%;  text-align: center;  line-height: 60rpx;  font-size: 30rpx;  color: #fff;}

.close-circle {
  position: relative;
  margin-top: 20rpx;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #d6d6d5;
  background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
}
.close-line {
  position: absolute;
  width: 62rpx;
  height: 1rpx;
  background: #d6d6d5;
  border-radius: 2rpx;
}
.close-line1 {
  transform: rotate(45deg);
}
.close-line2 {
  transform: rotate(-45deg);
}

::v-deep .van-overlay {
  background-color: var(--overlay-background-color,rgba(0,0,0,0.4));
}
</style>