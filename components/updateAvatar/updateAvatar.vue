<template>
  <view>
    <!-- 头像展示区域 -->
    <image 
      class="avatar" 
      :src="avatarUrl || defaultAvatar" 
      @click="handleAvatarClick"
      :style="{ width: size + 'px', height: size + 'px' }"
    ></image>

    <!-- 微信原生按钮（隐藏） -->
    <button 
      v-if="isWeixin"
      id="hidden-avatar-button"
      open-type="chooseAvatar"
      @chooseavatar="onChooseAvatar"
      style="display: none;"
    ></button>
  </view>
</template>

<script>
export default {
  name: "updateAvatar",
  props: {
    // 默认头像URL
    defaultAvatar: {
      type: String,
      default: 'https://默认头像.png'
    },
    // 头像尺寸（单位px）
    size: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      avatarUrl: '',
      isWeixin: false
    };
  },
  mounted() {
    // 自动检测是否在微信小程序环境
    this.isWeixin = uni.getSystemInfoSync().platform === 'mp-weixin'
  },
  methods: {
    // 点击头像事件
    handleAvatarClick() {
      if (this.isWeixin) {
        // 微信小程序：触发隐藏的原生按钮
        const button = document.getElementById('hidden-avatar-button')
        button?.click()
      } else {
        // 其他平台：调用uni.chooseImage
        this.chooseImage()
      }
    },
    // 微信原生头像选择回调
    onChooseAvatar(e) {
      this.avatarUrl = e.detail.avatarUrl
      this.$emit('change', this.avatarUrl) // 通知父组件
    },
    // 其他平台选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.avatarUrl = res.tempFilePaths[0]
          this.$emit('change', this.avatarUrl) // 通知父组件
        }
      })
    },
    // 手动设置头像（供父组件调用）
    setAvatar(url) {
      this.avatarUrl = url
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  border-radius: 50%;
  display: block;
  border: 1px solid #eee;
}
</style>