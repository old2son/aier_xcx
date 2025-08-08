<template>
  <view class="login-container">
    <view class="login-logo">
      <image :src="loginLogo" mode="heightFix" />
    </view>

    <view class="login-panel">
      <view class="title-text">欢迎登录</view>
      <van-cell-group>
        <van-field
          clearable
          type="tel"
          maxlength="11"
          :adjust-position="false"
          placeholder="请输入手机号"
          :left-icon="loginPanelIcon[0].imgUrl"
          :value="verificationCodeLoginParams.phone"
          @input="updatePhone"
        />
        <van-field
          clearable
          type="number"
          maxlength="6"
          :adjust-position="false"
          placeholder="验证码"
          custom-class="second-field"
          :left-icon="loginPanelIcon[1].imgUrl"
          :value="verificationCodeLoginParams.code"
          @input="updateVerCode"
        >
          <van-button
            slot="button"
            size="small"
            type="primary"
            color="transparent"
            custom-class="send-btn"
            :disabled="!isPhoneValid || countDown !== 0"
            @click="getVerificationCode"
          >
            <text class="prepare-sending" v-if="countDown === 0">获取验证码</text>
            <text class="is-sending" v-else>已发送({{ countDown }}s)</text>
          </van-button>
        </van-field>
      </van-cell-group>

      <view class="tip-text">首次登录将自动注册</view>
      <van-button
        round
        color="#32579c"
        size="large"
        class="login-btn"
        custom-style="height: 88rpx"
        @click="verificationCodeLogin"
      >
        立即登录
      </van-button>

      <view class="privacy-policy-wrap">
        <view class="policy-point-block">
          <van-checkbox
            :value="checked"
            checked-color="#32579c"
            icon-size="28rpx"
            @change="toggleCheckbox()"
          />
          <text>已阅读并同意</text>
          <text class="link-text" @click="toAppletPrivacyPolicy">《爱尔眼健康科普教育基地隐私政策》</text>
        </view>
      </view>
    </view>
    <Popup ref="privacyPopup" :type="'center'" :maskClick="false">
      <PrivacyPopup @closePopup="closePopup"></PrivacyPopup>
    </Popup>
  </view>
</template>

<script>
import loginData from '@/data/login.json'
import { mapState } from "vuex"

import { sendCode } from '@/api'

export default {
  data() {
    return {
      loginLogo: loginData.loginLogo.imgUrl,
      loginPanelIcon: loginData.loginPanelIcon,
      verificationCodeLoginParams: {
        phone: null,
        code: null,
      },
      checked: false,
      timer: null,
      countDown: 0,
      
      
      checkClause: false, // 是否勾选隐私条款
      stopRun: false // 是否阻止继续进行
    }
  },
  computed: {
    ...mapState("moduleUser", [
      'showPrivacyPopup'
    ]),
    isPhoneValid() {
      console.log("？？？？？",/^[1][2-9][0-9]{9}$/.test(
        this.verificationCodeLoginParams.phone
      ))
      return /^[1][2-9][0-9]{9}$/.test(
        this.verificationCodeLoginParams.phone
      )
    }
  },
  onLoad() {
    this.checkPrivacy()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    updatePhone (event) {
      this.verificationCodeLoginParams.phone = event.detail
    },
    updateVerCode (event) {
      this.verificationCodeLoginParams.code = event.detail
    },
    // 发送手机验证码
    async getVerificationCode() {
      await this.checkPrivacy() // 获取验证码查询是否同意《小程序用户隐私保护指引》
      if (this.stopRun) return // 若为真，阻止向下执行
      if (!this.validatePhoneForm()) return
      uni.showLoading()
      this.startCountdown('已发送验证码')
      sendCode({ phone: this.verificationCodeLoginParams.phone, type: 7 })
        .then(res => {
          if (
            res.code === 200 &&
            res.message.includes('验证码已成功发送')
          ) {
            this.startCountdown('已发送验证码')
          } else {
            this.$toast({ message: res.message })
          }
        })
        .finally(() => uni.hideLoading())
    },
    validatePhoneForm() {
      const t = this.verificationCodeLoginParams
      console.log('t',t)
      if (!t.phone) {
        this.$toast({ message: '请输入您的手机号码' })
        return false
      }
      if (!this.isPhoneValid) {
        this.$toast({ message: '请输入正确手机号码' })
        return false
      }
      if (!this.checked) {
        this.$toast({ message: '请同意协议和隐私政策' })
        return false
      }
      return true
    },
    // 检查用户是否同意过隐私协议
    async checkPrivacy() {
      try {
        uni.showLoading({
          title: '加载中'
        })
        await this.$store.dispatch('moduleUser/queryWeChatAppletPrivacyAuth')
        if (this.$store.state.moduleUser.showPrivacyPopup) {
          this.$refs.privacyPopup.open()
          this.stopRun = true // 未同意隐私授权，开启停止运行
        } else {
          this.stopRun = false // 已同意隐私授权，取消停止运行
        }
      } catch (error) {
        console.error('查询用户是否同意隐私设置失败', error)
      } finally {
        uni.hideLoading()
      }
    },
    closePopup() {
      this.$refs.privacyPopup.close()
    },
    toggleCheckbox(){
      this.checked = !this.checked
    },
    startCountdown(text) {
      this.$toast({ message: text })
      // 清理旧定时器
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.countDown = 60
      this.timer = setInterval(() => {
        this.countDown--
        if (this.countDown <= 0) {
          clearInterval(this.timer)
          this.timer = null
          this.countDown = 0 // 保证不会跌破 0
        }
      }, 1000)
    },
    verificationCodeLogin() {
      if (!this.validatePhoneForm()) return
      uni.showLoading()
      this.$store.dispatch('moduleUser/verificationCodeLogin', this.verificationCodeLoginParams)
        .then(resp => {
          if (resp.code === 200) {
            uni.switchTab({
              url: '/pages/tabBar/mine/mine'
            })
          }
        }).finally(() => {
          uni.hideLoading()
        })
    },
    toAppletPrivacyPolicy(){
      uni.navigateTo({
        url: '/subpackages/packageLogin/appletPrivacyPolicy'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background: url('https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/h5-mobile-reservation/login/login-bg.webp') center/cover no-repeat;
  overflow-y: auto;
  user-select: none;
  display: flex;
  flex-direction: column;
  
  .login-logo {
    height: 32vh;
    padding: 48rpx 0 40rpx;
    display: flex;
    justify-content: center;
  }
  .login-logo image {
    width: 141px;
    height: 116px;
  }
  
  .login-panel {
    width: 90%;
    height: 70vh;
    margin: 0 auto;
    background-color: #fff;
    padding: 6% 5% 12% 5%;
    box-sizing: border-box;
    border-radius: 48rpx 48rpx 0 0;
    .title-text {
      color: #32579c;
      font-size: 48rpx;
      text-align: center;
      margin-bottom: 8%;
    }
    .tip-text {
      margin: 3% auto 20% auto;
      font-size: 24rpx;
      color: #9b8e8e;
      text-align: right;
    }
    .login-btn .van-button__text {
      margin-top: 80rpx;
      color: #fff;
      font-size: 36rpx;
    }
    ::v-deep .van-cell{
      display:flex;
      align-items:center;
    }
    ::v-deep .second-field .van-field__body {
      position: relative;
      justify-content: space-between;
    }
    ::v-deep .second-field .van-field__body::after {
      content: "";
      display: inline-block;
      position: absolute;
      top: 50%;
      right: 36%;
      transform: translate(-50%, -50%);
      width: 0.5px;
      height: 50rpx;
      background: #32579c;
    }
    ::v-deep .second-field .van-field__control {
      width: 40%;
    }
    ::v-deep .send-btn {
      min-width: 60%;
      white-space: nowrap;
    }
    .prepare-sending {
      color: #32579c;
    }
    .is-sending {
      color: #bbbbbb;
    }
    .privacy-policy-wrap {
      margin-top: 10%;
      padding-bottom: 10%;
      .policy-point-block {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        font-size: 23rpx;
        line-height: 1.5;
        text-align: justify;
        .link-text {
          color: #32579c;
          text-decoration: underline;
        }
      }
    }
  }
  
  ::v-deep .van-field__control {
    padding-left: 20rpx;
    font-size: 36rpx;
  }
}
</style>