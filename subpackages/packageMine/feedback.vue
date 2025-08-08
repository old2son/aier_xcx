<template>
  <view class="feedback-container">
    <CustomNavInner title="意见反馈" />
    <view class="question-content" :style="scrollViewStyle">
      <view class="question-title">
        我们希望通过您的宝贵意见，进一步提升【爱尔眼健康科普教育基地】的科普教育质量。
        本问卷仅需1-3分钟，所有数据将严格保密。您的反馈对我们非常重要，感谢您的支持。
      </view>
      <view v-for="(item, index) in queueList" :key="index" class="question-item">
        <view class="title">
          <text class="star">*</text>
          <text class="question">{{ item.text }}</text>
        </view>
        <!-- 单选题 -->
        <!-- :value="answers[item.value]" -->
        <van-radio-group
          v-if="isSingleChoice(item)"
          :value="answers[index]"
          @change="e => onSingleChoiceChange(index, e.detail)"
        >
          <view v-if="isSatisfaction(item)" class="satisfaction-wrap">
            <view class="ea-text">
              <text>很不满意</text>
              <text>很满意</text>
            </view>
            <view class="line"></view>
          </view>
          <view class="options" :class="{ 'horizontal': isSatisfaction(item) }">
            <van-radio
              v-for="(opt, sub) in item.list"
              :key="opt.id"
              :name="opt.topicName"
              :use-icon-slot="isSatisfaction(item)"
              :class="[ !isSatisfaction(item) ? 'single-radio' : '' ]"
            >
              <!-- 满意度：用 slot="icon" 放数字 -->
              <!-- :class="['custom-number-icon', answers[item.value] === opt.topicName ? 'active' : '']" -->
              <template v-if="isSatisfaction(item)">
                <view 
                  slot="icon" 
                  :class="['custom-number-icon', answers[index] === opt.topicName ? 'active' : '']"
                >
                  {{ opt.topicName }}
                </view>
              </template>
              <!-- 非满意度：用普通 label -->
              <template v-else >
                <text :class="{ 'nowrap-label': hasOtherOption(item) && sub === item.list.length - 1 }">
                  {{ opt.topicName }}
                </text>
              </template>
              <van-field
                class="flex-content"
                placeholder="请输入其他内容"
                :value="otherInputs[item.value]"
                @input="otherInputs[item.value] = $event.detail"
                v-if="hasOtherOption(item) && sub === item.list.length - 1"
              />
            </van-radio>
            <!-- 如果有其他选项且选中了，就显示输入框 -->
            <!-- && selectedOther[item.value] -->
          </view>
        </van-radio-group>
        
        <!-- 多选题 -->
        <van-checkbox-group
          v-else-if="isMultiChoice(item)"
          :value="answers[index] || []"
          @change="e => onMultiChoiceChange(item, e.detail,index)"
        >
          <view class="options">
            <van-checkbox
              shape="square"
              v-for="(opt, sub) in item.list"
              :key="opt.id"
              :name="opt.topicName"
            >
              <view class="option-content" :class="{ 'nowrap-label': hasOtherOption(item) && sub === item.list.length - 1 }">
                {{ opt.topicName }}
              </view>
              <van-field
                class="flex-content"
                placeholder="请输入您的建议"
                :value="otherInputs[item.value]"
                @input="otherInputs[item.value] = $event.detail"
                v-if="hasOtherOption(item) && sub === item.list.length - 1"
              />
            </van-checkbox>
          </view>
        </van-checkbox-group>
      </view>
      
      <template v-if="listRendered">
        <!-- 填空题 -->
        <view class="last-q">
          <text class="star">*</text>
          <text class="txt">请输入您的宝贵意见[填空题]</text>
          <van-field 
            :value="lastTextAnswer" 
            @input="lastTextAnswer = $event.detail"
          />
        </view>
        <button class="submit-button" @click="onSubmit">确认提交</button>
      </template>
      <van-dialog id="van-dialog" />
    </view>
  </view>
</template>

<script>
import { mapState } from "vuex"
import { getFeedbackTopic, scienceFeedback } from '@/api'
import Dialog from '@/wxcomponents/vant/dialog/dialog'

export default {
  data () {
    return {
      queueList: [],
      answers: {},              // 存储每题的答案
      otherInputs: {},          // “其他”选项的输入值
      lastTextAnswer: '',      // 最后一题的输入值
      selectedOther: {},       // 记录每题是否选中了「其他」选项
      listRendered: false
    }
  },
  computed: {
    ...mapState("moduleLayout", ['menuInfo']),
    scrollViewStyle() {
      const total = this.menuInfo.menuHeight + this.menuInfo.menuHeightFromTop + 36
      return `margin-top: calc(-28.43vh + ${total}px); height: calc(100vh - ${total}px)`
    }
  },
  watch: {
    queueList(newVal) {
      if (newVal && newVal.length > 0) {
        this.$nextTick(() => {
          this.listRendered = true
        });
      }
    }
  },
  async onLoad() {
    await this.getFeedbackQuestion()
    // 等待 DOM 渲染
    this.$nextTick(() => {
      this.listRendered = true
    })
  },
  // ✅ 【整体页面思路】
  // 用一个 v-for 遍历所有题目（包括你手动加的最后一题）
  // 每个题目根据 text 判断是单选、多选还是最后的填空题
  // 选项中如果包含“其他”，就额外渲染输入框
  // 满意度题目（选项是 1,2,3,4,5）渲染为特殊横向排列
  // 提交时做校验：选中“其他”必须输入文字，最后一道题必须输入
  methods: {
    async getFeedbackQuestion () {
      const { data: res } = await getFeedbackTopic()
      this.queueList = res
      console.log("1",res)
      // 初始化多选题答案为 []
      res.forEach((item,index) => {
        if (this.isMultiChoice(item)) {
          // this.$set(this.answers, item.value, [])
          this.$set(this.answers, index, [])
          console.log("2",this.answers)
        } else {
          // this.$set(this.answers, item.value, '')
          this.$set(this.answers, index, '')
          console.log("3",this.answers)
        }
      })
      console.log("获取意见反馈题目：", res)
    },
    isSingleChoice(item) {
      return item.text.includes('[单选题]')
    },
    isMultiChoice(item) {
      return item.text.includes('[多选题]')
    },
    isSatisfaction(item) {
      return item.list.length === 5 && item.list.every(i => ['1','2','3','4','5'].includes(i.topicName))
    },
    hasOtherOption(item) {
      return item.list.some(i => i.topicName.includes('其他'))
    },
    isLastTextQuestion(item) {
      return item.text.includes('[填空题]')
    },
    // onSingleChoiceChange(itemValue, val) {
    //   console.log('单选题::当前选中的', itemValue,val)
    //   this.answers[itemValue] = val
    //   console.log("存储每题的答案", this.answers)
    //   const hasOther = this.queueList.find(i => i.value === itemValue)?.list.find(opt => opt.topicName.includes('其他'))
    //   if (hasOther) {
    //     this.selectedOther[itemValue] = (val === hasOther.topicName)
    //   }
    // },
    // 选中单选题
    onSingleChoiceChange(index, val) {
      console.log('单选题::当前选中的', index,val)
      this.answers[index] = val
      console.log("存储每题的答案", this.answers)
      const hasOther = this.queueList.find(i => i.value === index)?.list.find(opt => opt.topicName.includes('其他'))
      if (hasOther) {
        this.selectedOther[index] = (val === hasOther.topicName)
      }
    },
    // 选中多选题
    onMultiChoiceChange(item, val,index) {
      if (!Array.isArray(val)) {
        console.warn('onMultiChoiceChange 收到的不是数组:', val)
        val = []
      }
      // this.answers[item.value] = val
      this.answers[index] = val
      console.log("多选题", val)
      // console.log("多选题存储的答案：", this.answers[item.value])
      console.log("下标", index)
      console.log("多选题存储答案的对象：", this.answers)
      const hasOther = item.list.find(opt => opt.topicName.includes('其他'))
      if (hasOther) {
        // this.selectedOther[item.value] = val.includes(hasOther.topicName)
        this.selectedOther[index] = val.includes(hasOther.topicName)
      }
      console.log('多选题::当前选中的', val)
    },
    // 提交
    onSubmit() {
      console.log('提交 answers:', this.answers)
      console.log('输入框内容:', this.otherInputs)
      console.log('最后一题:', this.lastTextAnswer)
    
      // 校验：每道题都必须有答案
      for (let i = 0; i < this.queueList.length; i++) {
        const item = this.queueList[i]
        const answer = this.answers[i]
    
        if (this.isSingleChoice(item) && !answer) {
          this.$toast({
            duration: 3000,
            message: `请您完成第${i+1}道的意见反馈`
          })
          return
        }
    
        if (this.isMultiChoice(item) && (!Array.isArray(answer) || answer.length === 0)) {
          this.$toast({
            duration: 3000,
            message: `请您完成第${i+1}道的意见反馈`
          })
          return
        }
    
        // 校验选了“其他”就必须输入
        if (this.hasOtherOption(item)) {
          const otherText = item.list[item.list.length - 1].topicName // 最后一项是“其他”
          const isSelectedOther = this.isSingleChoice(item)
            ? (answer === otherText)
            : (Array.isArray(answer) && answer.includes(otherText))
    
          if (isSelectedOther) {
            const inputVal = this.otherInputs[item.value]
            if (!inputVal || inputVal.trim() === '') {
              this.$toast({
                duration: 3000,
                message: `请您完成第${i+1}道的意见反馈`
              })
              return
            }
          }
        }
      }
    
      // 最后一题（填空题）必须填
      if (!this.lastTextAnswer || this.lastTextAnswer.trim() === '') {
        this.$toast({
          duration: 3000,
          message: `最后一道意见反馈未填写`
        });
        return
      }
    
      // 拼接需要带“其他内容”的三道题（第三题 identity、第九题 knowledge、第十题 optimize）
      let identity = ''
      let knowledge = []
      let optimize = []
    
      // 遍历
      this.queueList.forEach((item, idx) => {
        const answer = this.answers[idx]
        const otherText = item.list[item.list.length - 1].topicName // 最后一项是“其他”
    
        if (idx === 2) { // 第三题 identity
          if (answer === otherText) {
            identity = otherText + this.otherInputs[item.value]
          } else {
            identity = answer
          }
        }
    
        if (idx === 8) { // 第九题 knowledge（多选）
          if (Array.isArray(answer)) {
            answer.forEach(opt => {
              if (opt === otherText) {
                const content = otherText + this.otherInputs[item.value]
                knowledge.push(content)
              } else {
                knowledge.push(opt)
              }
            })
          }
        }
    
        if (idx === 9) { // 第十题 optimize（多选）
          if (Array.isArray(answer)) {
            answer.forEach(opt => {
              if (opt === otherText) {
                const content = otherText + this.otherInputs[item.value]
                optimize.push(content)
              } else {
                optimize.push(opt)
              }
            });
          }
        }
      });
    
      console.log('identity:', identity)
      console.log('knowledge:', knowledge)
      console.log('optimize:', optimize)
    
      //最终组装提交参数
      const params = {
        userSex: this.answers[0],              // 第1道 性别
        userAge: this.answers[1],              // 第2道 年龄
        identity: identity,                    // ✅ 用拼接后的 identity
        userSource: this.answers[3],           // 第4道 途径来源
        resSatisfied: this.answers[4],         // 第5道 线上预约满意度
        facSatisfied: this.answers[5],         // 第6道 场馆设施满意度
        activitySatisfied: this.answers[6],    // 第7道 活动满意度
        courseSatisfied: this.answers[7],      // 第8道 课程内容满意度
        knowledge: knowledge,                  // ✅ 用拼接后的 knowledge
        optimize: optimize,                    // ✅ 用拼接后的 optimize
        recommend: this.answers[10],           // 第11道 是否愿意推荐
        overSatisfied: this.answers[11],       // 第12道 总体满意度
        other: this.lastTextAnswer             // 最后一道 填空
      }
    
      console.log('最终提交参数:', params)
      // 发请求
      scienceFeedback(params).then(res => {
        if(res.code === 200 && res.message === '您已提交成功'){
          Dialog.alert({
            message: '您已成功提交',
            theme: 'round-button',
            confirmButtonText: '我知道了',
            beforeClose: (action) => new Promise((resolve) => {
              if (action === 'confirm') {
                uni.switchTab({
                  url: '/pages/tabBar/mine/mine'
                })
              }
              resolve(true); // 无论是否跳转都允许关闭
            })
          })
          console.log('提交成功：', res)
        } else {
          this.$toast({
            message: res.message,
            duration: 3000
          })
        }
        // 可选：重置 answers/otherInputs/lastTextAnswer
      }).catch(err => {
        console.error('提交失败：', err)
        this.$toast({
          message: '提交失败，请稍后再试',
          duration: 3000
        })
      })
    }
    // userSex: "性别",
    // userAge: "年龄",
    // identity: "身份来源",
          
    // userSource: "途径来源",
    // resSatisfied: "线上预约满意度",
    // facSatisfied: "场馆设施满意度",
    // activitySatisfied: "活动满意度",
    // courseSatisfied: "课程内容满意度",
          
    // knowledge: [ '眼科知识' ],              // 多选题
    // optimize: [ '增加的体验形式' ],         // 多选题
    // recommend: "是否愿意推荐",
          
    // overSatisfied: "总体满意度",
    // other: '请留下您宝贵的意见的内容'
  }
}
</script>

<style lang="scss" scoped>
.feedback-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    #f9f9f9 0%,
    #f9f9f9 35%,
    #fff 50%,
    #fff 100%
  );
  overflow-y: auto;
  
  .question-content {
    width: 100%;
    padding: 0 5% 80rpx 5%;
    box-sizing: border-box;
    overflow-y: auto;
    color: #101010;
    .question-title {
      text-indent: 2em;
      font-size: 28rpx;
      line-height: 1.5;
      text-align: justify;
      margin-bottom: 60rpx;
    }
    .question-item {
      margin: 60rpx 0;
      font-size: 28rpx;
      display: flex;
      flex-direction: column;
      .title {
        .star {
          color: #fb676a;
          vertical-align: middle;
        }
        .question {
          line-height: 1.2;
          vertical-align: middle;
        }
      }
    }
    .options.horizontal {
      padding: 0 10%;
      box-sizing: border-box;
    }
    .satisfaction-wrap {
      .ea-text {
        align-items: center;
        display: flex;
        justify-content: space-between;
        padding: 0 6%;
        box-sizing: border-box;
        margin: 30rpx 0 10rpx 0;
        text:nth-child(2) {
          letter-spacing: 3px;
        }
      }
      .line {
        height: 1px;
        background: #ccc;
        flex: 1;
        margin: 0 8px;
      }
    }
    .nowrap-label {
      white-space: nowrap;
    }
    .options.horizontal {
      display: flex;
      justify-content: space-between;
    }
    .question {
      margin-bottom: 20rpx;
    }
  }
  
  .flex-content {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #101010;
    ::v-deep .van-cell {
      padding-top: 0;
      padding-bottom: 0;
      background-color: transparent;
    }
  }
}
::v-deep .van-radio  {
  margin: 10rpx 0;
}
::v-deep .van-radio:first-child {
  margin-top: 20rpx;
}
::v-deep .van-radio:last-child {
  margin-bottom: 0;
}
::v-deep .van-icon-success {
  display: flex!important;
  align-items: center;
}
::v-deep .single-radio .van-icon-success:before {
  content: " ";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
  background-color: #fff !important;
}
::v-deep .custom-number-icon {
  width: 15px;
  height: 15px;
  line-height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 50%;
  color: #ccc;
  border: 1px solid #ccc;
  text-align: center;
}
::v-deep .custom-number-icon.active {
  color: #fff;
  border: none;
  background: #1989fa; /* 选中时蓝色 */
}
::v-deep .van-radio__icon--round {
  font-size: 14px!important;
}
::v-deep .van-radio__label {
  display: flex;
  align-items: center;
}
::v-deep .van-checkbox__label--right {
  display: flex;
  align-items: center;
}
::v-deep .van-checkbox {
  display: flex;
  align-items: center!important;
}
::v-deep .van-checkbox__icon {
  font-size: 12px!important;
}
::v-deep .van-checkbox {
  margin: 20rpx 0;
}

.last-q {
  .star {
    color: #fb676a;
    vertical-align: middle;
  }
  .txt {
    line-height: 1.2;
    vertical-align: middle;
  }
  ::v-deep .van-cell {
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
  }
  ::v-deep .van-field__control {
    border-bottom: 1px solid #101010;
  }
  ::v-deep .van-cell:after {
    border-bottom: none;
  }
}

.submit-button {
  margin-top: 60rpx;
  border: none;
  border-radius: 30px;
  color: #fff;
  font-size: 16px;
  font-weight: 550;
  letter-spacing: 10px;
  background-color: #32579c;
}

::v-deep .van-dialog {
  top: 83%!important;
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
</style>
