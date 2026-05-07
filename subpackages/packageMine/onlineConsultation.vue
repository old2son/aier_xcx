<template>
  <view class="online-consultation-container">
    <CustomNavInner title="在线咨询（非诊疗）" />
    <!-- :refresher-enabled="true" 启用自定义下拉刷新 -->
    <!-- :refresher-triggered="refreshing" 绑定刷新状态 -->
    <!-- :refresher-threshold="80" 下拉阈值 -->
    <!-- refresher-background="#f8f8f8" 刷新背景色 -->
    <!-- @refresherrefresh="onScrollViewRefresh" 刷新事件 -->
    <scroll-view
      scroll-y
      class="chat-list"
      scroll-with-animation
      :scroll-into-view="scrollTo"
      :style="scrollViewStyle"
      :refresher-enabled="true"  
      :refresher-triggered="refreshing" 
      :refresher-threshold="80"
      refresher-background="transparent"
      @refresherrefresh="onScrollViewRefresh"
    >
    
      <!-- 历史消息提示和折叠按钮 -->
      <view class="history-tip">
        {{ hasHistory ? '下拉获取旧消息' : '无更多历史消息' }}
      </view>
      <view 
        v-if="historyMessageList.length > 0 && !historyFolded" 
        class="fold-btn"
        @click="toggleHistoryFold"
      >
        折叠历史消息
      </view>
      
      <!-- 历史消息列表（可折叠） -->
      <template v-if="!historyFolded">
        <view v-for="(msg, index) in historyMessageList" :key="index" class="chat-item">
          <view class="question-box">
            <text>{{ msg.question }}</text>
          </view>
          <view class="answer-box">
            <view class="robot-name-box">EYE眼管家（机器人）&nbsp;&nbsp;{{ robotEnterTime }}</view>
            <view class="answer">
              <text>{{ msg.answer }}</text>
            </view>
          </view>
        </view>
      </template>
      
      
      <view class="robot-greetings">
        <view class="robot-pic">
          <image :src="onlineMsg.robotPic" mode="widthFix"></image>
        </view>
        <view class="robot-txt">EYE眼管家(机器人) 为您服务</view>
      </view>
      <view class="robot-name-box">EYE眼管家（机器人）&nbsp;&nbsp;&nbsp;{{ robotEnterTime }}</view>
      <view class="robot-introduction">{{ onlineMsg.robotIntroduction }}</view>
      
      <!-- 固定问题列表 -->
      <view class="robot-name-box">EYE眼管家（机器人）&nbsp;&nbsp;&nbsp;{{ robotEnterTime }}</view>
      <view class="fixed-questions-box">
        <view class="tips">猜你想问</view>
        <view class="fixed-questions-wrap">
          <view
            class="question-item-btn"
            v-for="(item,index) in fixedQuestions"
            :key="item.id"
            @click="handleSelectQuestion(item)"
          >
            <text>{{ index + 1 }}、</text>
            <text>{{ item.topicName }}</text>
          </view>
        </view>
      </view>

      <!-- 聊天消息列表 -->
      <view v-for="(msg, index) in messageList" :key="index" class="chat-item">
        <view class="question-box">
          <text>{{ msg.question }}</text>
        </view>
        <view class="answer-box">
          <view class="robot-name-box">EYE眼管家（机器人）&nbsp;&nbsp;{{ robotEnterTime }}</view>
          <view class="answer">
            <text>{{ msg.answer }}</text>
          </view>
        </view>
      </view>

      <!-- 流式输出的答案 -->
      <!-- ？？？ -->
      <view v-if="isStreaming" class="chat-item streaming">
        <text class="question">{{ selectedQuestions }}</text>
        <text class="answer">{{ answerStreaming }}</text>
      </view>
      <!-- 滚动锚点 -->
      <view :id="scrollAnchorBaseId + scrollAnchorUniqueId" style="height: 1px;"></view>
    </scroll-view>

    <!-- 自定义输入 -->
    <view class="input-box" v-if="showInputBox">
      <input
        v-model="selectedQuestions"
        placeholder="很高兴为您服务，请描述您的问题"
        @confirm="askQuestion"
      />
      <button @click="askQuestion">发&nbsp;送</button>
    </view>
  </view>
</template>

<script>
import { mapState } from "vuex"
import {
  getOnlineConsultation,
  scienceUserOnline,
  scienceUserOnlineHistory
} from "@/api"
import onlineMsg from '@/data/tabBar.json'
import dayjs from 'dayjs'

export default {
  data() {
    return {
      onlineMsg: onlineMsg,
      fixedQuestions: [],            // 固定 5 个问题
      selectedQuestions: '',         // 当前输入的问题
      messageList: [],               // 聊天消息列表
      historyMessageList: [],        // 历史聊天消息列表
      hasHistory: false,             // 是否有历史消息
      hasPulledHistoryOnce: false,   // 用户是否做过下拉刷新
      isStreaming: false,            // 是否正在流式输出
      answerStreaming: '',            // 当前流式输出内容
      robotEnterTime: '', // 页面进入时间
      
      scrollTo: '', // 初始值
      scrollAnchorBaseId: 'scroll-bottom-',
      scrollAnchorUniqueId: 0, // 每次 +1，可以触发重新滚动
      refreshing: false, // 控制刷新状态
      historyFolded: false, // 历史消息是否折叠
      
      showInputBox: false,
    };
  },
  computed: {
    ...mapState("moduleLayout", ['menuInfo']),
    scrollViewStyle() {
      const total = this.menuInfo.menuHeight + this.menuInfo.menuHeightFromTop + 14
      return `margin-top: calc(-28.43vh + ${total}px); height: calc(100vh - ${total + 80}px)`
    }
  },
  onLoad() {
    this.$store.dispatch('moduleLayout/getNavigationBarStyle')
    this.getData()
    // 使用 dayjs 格式化当前时间：2025/7/10  23:42:10
    this.robotEnterTime = dayjs().format('YYYY/M/D  HH:mm:ss')
  },
  methods: {
    // 初始化加载固定问题和历史消息
    async getData() {
      try {
        const { data: fixedProblemResult } = await getOnlineConsultation()
        this.fixedQuestions = fixedProblemResult || []
        console.log( this.fixedQuestions )

        // 检查是否有历史消息
        const { data: historyMsg } = await scienceUserOnlineHistory()
        this.hasHistory = historyMsg?.length > 0
        
        // 等页面内容加载好，再显示输入框
        this.showInputBox = true
      } catch (e) {
        this.hasHistory = false
        console.error(e)
        
        // 即使失败，也保证输入框能显示
        this.showInputBox = true
      }
    },
    // 切换历史消息折叠状态
    toggleHistoryFold() {
      this.historyFolded = !this.historyFolded
      
      // 如果折叠后，并且之前下拉刷新过（hasPulledHistoryOnce 为 true）且历史消息还在，
      // 就把 hasHistory 设置回 true
      if (this.historyFolded && this.historyMessageList.length > 0 && this.hasPulledHistoryOnce) {
        this.hasHistory = true
      }
      
      // 折叠后重置滚动位置
      setTimeout(() => {
        this.scrollToTop()
      }, 100)
    },
    // 滚动到顶部
    scrollToTop() {
      this.scrollTo = 'top-anchor'
      this.scrollAnchorUniqueId += 1
    },
    // 滚动到底部
    scrollToBottom() {
      this.scrollAnchorUniqueId += 1
      this.scrollTo = this.scrollAnchorBaseId + this.scrollAnchorUniqueId
    },
    async sendQuestion(question, defaultAnswer) {
      // 问题先 push 到 messageList，并记录 index
      const msg = { question, answer: '正在思考中...' }
      this.messageList.push(msg)
      this.scrollToBottom()
      let answer = defaultAnswer
      if (!answer) {
        try {
          const result = await scienceUserOnline({ problem: question })
          console.log('结果：', result)
          answer = result?.data?.answerName || result?.message || '暂无答案'
          this.selectedQuestions = ''
        } catch (e) {
          answer = '请求失败，请稍后再试'
        }
      }
      // 开始流式输出
      this.showStreamingAnswer(answer, msg)
    },
    // 点击固定问题发送消息
    async handleSelectQuestion(item) {
      await this.sendQuestion(item.topicName, item.answerName)
    },
    // 输入框输入内容发送消息
    async askQuestion() {
      if (!this.selectedQuestions.trim()) {
        uni.showToast({ title: '问题不能为空', icon: 'none' })
        return
      }
      await this.sendQuestion(this.selectedQuestions)
    },
    // 公共：流式输出答案
    showStreamingAnswer(answer, msgRef) {
      this.isStreaming = true
      this.answerStreaming = ''
      let index = 0
      // 在第一个字符开始流式输出前，先清空占位
      msgRef.answer = ''
      const timer = setInterval(() => {
        msgRef.answer += answer[index]
        index++
        this.scrollToBottom()
        if (index >= answer.length) {
          clearInterval(timer)
          this.isStreaming = false
          this.scrollToBottom()
        }
      }, 30)
    },
    // 修改历史加载方法
    async loadMoreHistory() {
      try {
        const { data: historyMsg } = await scienceUserOnlineHistory()
        if (historyMsg?.length) {
          const moreMessages = historyMsg.map(item => ({
            question: item.question,
            answer: item.reply
          }))
          this.historyMessageList = [...moreMessages, ...this.historyMessageList]
        } else {
          uni.showToast({ title: '没有更多历史消息了', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '加载历史失败', icon: 'none' })
        throw e // 抛出错误以便外层捕获
      }
    },
    // 自定义下拉刷新处理
    async onScrollViewRefresh() {
      this.refreshing = true
      console.log('自定义下拉刷新触发')
      try {
        const { data: historyMsg } = await scienceUserOnlineHistory()
        console.log("加载历史消息", historyMsg)

        // ✅ 第一次做下拉动作时，直接设置 hasPulledHistoryOnce 为 true
        this.hasPulledHistoryOnce = true

        if (historyMsg?.length) {
          this.historyMessageList = historyMsg.map(item => ({
            question: item.question,
            answer: item.reply,
            time: item.time ? dayjs(item.time).format('YYYY/M/D HH:mm:ss') : this.robotEnterTime
          }))
          this.historyFolded = false
        } else {
          uni.showToast({ title: '没有更多历史消息了', icon: 'none' })
        }

        // ✅ 无论返回结果是否为空，只要下拉刷新过，就设置 hasHistory 为 false
        this.hasHistory = false

      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setTimeout(() => {
          this.refreshing = false
        }, 500)
      }
    },
    // 第一次加载历史消息
    async loadHistoryFirstTime() {
      try {
        const { data: historyMsg } = await scienceUserOnlineHistory()
        console.log("首次加载历史消息", historyMsg)
        if (historyMsg?.length) {
          this.hasHistory = true
          this.historyMessageList = historyMsg.map(item => ({
            question: item.question,
            answer: item.reply,
            time: item.time ? dayjs(item.time).format('YYYY/M/D HH:mm:ss') : this.robotEnterTime
          }))
        } else {
          this.hasHistory = false
          uni.showToast({ title: '暂无历史消息', icon: 'none' })
        }
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    // 加载更多历史消息
    async loadMoreHistory() {
      // 这里实现加载更多历史消息的逻辑
      // 例如：根据当前最后一条消息的ID请求更早的消息
      // 由于没有提供具体接口参数，这里简化处理
      try {
        const { data: moreHistoryMsg } = await scienceUserOnlineHistory()
        if (moreHistoryMsg?.length) {
          const newMessages = moreHistoryMsg.map(item => ({
            question: item.question,
            answer: item.reply,
            time: item.time ? dayjs(item.time).format('YYYY/M/D HH:mm:ss') : this.robotEnterTime
          }))
          
          // 将新消息添加到历史消息列表前面
          this.historyMessageList = [...newMessages, ...this.historyMessageList]
          this.hasHistory = true
        } else {
          uni.showToast({ title: '没有更多历史消息了', icon: 'none' })
        }
      } catch (e) {
        console.error(e)
        throw e
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.online-consultation-container {
  width: 100%;
  height: 100vh;

  .history-tip {
    width: 92%;
    color: #999;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    text-align: center;
    margin-bottom: 15px;
  }
  .fold-btn {
    width: 92%;
    color: #4f93ff;
    height: 3px;
    line-height: 3px;
    font-size: 12px;
    text-align: center;
    text-decoration: underline;
    margin-bottom: 40rpx;
  }

  .chat-list {
    overflow-y: auto;
    z-index: 99;
    width: 100%;
    flex: 1;
    flex-shrink: 0;
    padding-left: 4%;
    box-sizing: border-box;
    .robot-greetings, .robot-introduction {
      width: fit-content;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx;
      box-sizing: border-box;
      border-radius: 0 30rpx 30rpx 30rpx;
      background-color: #fff;
    }
    .robot-greetings , .robot-introduction{
      margin-bottom: 88rpx;
    }
    .robot-name-box {
      white-space: nowrap;
      font-size: 12px;
      color: #BBBBBB;
      margin-bottom: 20rpx;
    }
    .robot-pic {
      width: 90rpx;
      height: 90rpx;
      image {
        width: 100%;
        height: 100%;
      }
    }
    .robot-txt {
      margin-left: 20rpx;
      white-space: nowrap;
      font-size: 16px;
      color: #595757;
      text-align: justify;
    }
    .robot-introduction {
      max-width: 85%;
      font-size: 15px;
      color: #595757;
      line-height: 1.5;
      text-align: justify;
    }
    .fixed-questions-box {
      width: 80%;
      padding: 32rpx;
      box-sizing: border-box;
      border-radius: 0 30rpx 30rpx 30rpx;
      background-color: #fff;
      margin-bottom: 40px;
      text-align: justify;
      .tips {
        font-size: 20px;
        color: #408AF5;
        padding-bottom: 20rpx;
        border-bottom: 0.8px solid #BBBBBB;
      }
      .question-item-btn {
        width: 100%;
        padding: 16rpx 0;
        border-bottom: 0.5px solid #EAEAEA;
        display: flex;
        align-items: center;
        font-size: 14px;
        text:first-child {
          color: #408AF5;
        }
        text:nth-child(2) {
          color: #595757;
        }
      }
      .question-item-btn:last-child {
        border: 0;
        padding-bottom: 0;
      }
    }
  }

  .chat-item {
    padding-right: 30rpx;
    padding-bottom: 80px;
    box-sizing: border-box;
    .question-box {
      display: flex;
      justify-content: flex-end;
      text {
        color: #fff;
        padding: 24rpx;
        line-height: 1.5;
        width: fit-content;
        max-width: 85%;
        text-align: justify;
        box-sizing: border-box;
        background-color: #408af5;
        border-radius: 30rpx 0 30rpx 30rpx;
      }
    }
    .answer-box {
      margin-top: 27px;
      .robot-name-box {
        white-space: nowrap;
        font-size: 12px;
        color: #BBBBBB;
        margin-bottom: 20rpx;
      }
      .answer {
        padding: 24rpx;
        width: fit-content;
        max-width: 85%;
        box-sizing: border-box;
        line-height: 1.5;
        background-color: #fff;
        border-radius: 0 30rpx 30rpx 30rpx;
        text {
          color: #595757;
          font-size: 14px;
          text-align: justify;
        }
      }
    }
  }

  .fixed-questions {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    .question-btn {
      background: #f0f0f0;
      margin: 5px;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 14px;
    }
  }

  .input-box {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 9999;
    width: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 20px 20px 20rpx 15px;
    background-color: #fff;
    input {
      height: 42px;
      flex: 1;
      border-radius: 12px;
      padding: 4px 8px;
      background-color: #eaeaea;
      font-size: 14px;
    }
    button {
      width: 20%;
      height: 85rpx;
      color: #fff;
      font-size: 38rpx;
      margin-left: 8px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 85rpx;
      background-color: #408af5;
    }
  }
}
</style>
