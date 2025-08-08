<template>
  <uni-popup 
    ref="popup" 
    :type="type"
    :is-mask-click="maskClick"
  >
    <!-- @change="popupChange" -->
    <view class="popup-content" :style="popupStyle">
      <slot></slot>
    </view>
  </uni-popup>
</template>

<script>
  import { mapActions } from 'vuex'
  export default {
    name: "Popup", /* 弹出层组件 */
    options: {
      styleIsolation: 'shared'
    },
    props: {
      type: {
        type: String,
        default: 'bottom'
      },
      popupStyle: {
        type: String
      },
      maskClick: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        popupType: this.type
      };
    },
    methods: {
      ...mapActions(['openPrivacyPopup']),
      /* 打开弹出层 */
      open () {
        this.$refs.popup.open(this.popupType)
      },
      /* 关闭弹出层 */
      close () {
        this.$refs.popup.close()
      },
      // /* 弹出层发生变化 */
      // popupChange (e) {
      //   console.log('弹出层变化', e)
      // },
      // opens() {
      //   console.log('调用open方法，popupType为', this.popupType)
      //   // 调用 vuex action
      //   this.queryWeChatAppletPrivacyAuth().then((needAuthorization) => {
      //     console.log('查询隐私接口授权结果：',needAuthorization)
      //     if (needAuthorization) {
      //       // 需要授权，打开弹出层
      //       this.open()
      //     } else {
      //       // 不需要授权，可以执行其他逻辑或直接关闭弹出层
      //       console.log('不需要授权，可以执行其他逻辑或直接关闭弹出层')
      //     }
      //   }).catch((error) => {
      //     console.error('获取隐私设置失败', error)
      //   })
      // }
    }
  }
</script>

<style lang="scss" scoped>
/deep/ .uni-popup{
  z-index: 9999;
}
.popup-content {
}
</style>