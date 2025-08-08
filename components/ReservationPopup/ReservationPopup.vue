<template>
  <van-popup round position="center" :show="showPopup" :close-on-click-overlay="false" custom-style="width:85%;height:90%">
    <view class="tips-title">温馨提示</view>
    <view class="filler"></view>
    <view class="tips-content">
      <view class="small-title">（一）开放时间</view>
      <text class="first-txt">开放时间为每周二至周日9:00--17:00 (16:30后停止入馆)，每周一闭馆。</text>
      <view class="small-title">（二）讲解预约规则</view>
      <text class="second-txt">
        在预约流程中，若通过个人预约渠道选择需要讲解服务的选项，当预约人数达到或超过15人时，本馆将自动为您组织成一个参观团，并提供专业的讲解服务。有关讲解服务人数的具体详情，您可点击“行程”-“预约详情”-“团讲人数”进行查看。需注意的是，若预约人数未达到15人，则本馆将不提供讲解服务，不便之处敬请谅解。
      </text>

      <van-checkbox :value="checked" shape="square" @change="toggleCheckbox">我已阅读并同意温馨提示内容</van-checkbox>
      <van-button round color="#32579c" size="large" :disabled="!checked" @click="confirmPopup" custom-style="margin-top: 40rpx">我知道了</van-button>
    </view>
  </van-popup>
</template>

<script>
export default {
  name: 'ReservationPopup',
  options: {
    styleIsolation: 'shared'
  },
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      showPopup: this.show, // 内部控制弹出层显示状态
      checked: false, // 默认未勾选
    }
  },
  watch: {
    show(val) {
      this.showPopup = val // 父组件状态变化时更新内部状态
    },
  },
  methods: {
    toggleCheckbox(){
      this.checked = !this.checked
    },
    confirmPopup() {
      // 通知父组件关闭弹出层
      this.$emit('close')
      this.innerShow = false
    },
  },
}
</script>

<style lang="scss" scoped>
.popup-content {
  width: 85%;
  max-width: 435px;
  height: 90%;
  border-radius: 12px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.tips-title {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 10%;
  background-color: #004ea2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  letter-spacing: 3px;
  border-radius: 12px 12px 0 0;
}

.filler {
  width: 100%;
  height: 10%;
}

.tips-content {
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
  color: #333;
  padding: 0 24px 5% 24px;
  box-sizing: border-box;
  overflow-y: auto;
}

.small-title {
  padding: 8% 0 4%;
  font-size: 18px;
  text-align: center;
  color: #004ea2;
}

.first-txt,
.second-txt {
  text-align: justify;
  font-size: 15px;
  line-height: 2;
}

.second-txt {
  margin-bottom: 18%;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-top: 15px;
}

.checkbox-label {
  color: #b1b1b1;
  font-size: 15px;
  margin-left: 5px;
}

.confirm-btn {
  margin-top: 15px;
  border-radius: 6px;
  font-size: 18px;
  padding: 20px 0;
  box-sizing: border-box;
  background-color: #32579c;
  color: #fff;
}

.confirm-btn[disabled] {
  background-color: #cccccc;
  color: #999999;
}

::v-deep .van-checkbox__icon {
  font-size: 18px;
}
</style>