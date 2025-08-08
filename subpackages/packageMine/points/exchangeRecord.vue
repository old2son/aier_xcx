<template>
  <view class="exchange-record-container">
    <CustomNavInner
      title="兑换记录" 
    />
    <view
      class="exchange-record-list"
      :style="{ top: (menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20) + 'px' }">
      <view class="exchange-record-item" v-for="(item, index) in exchangeRecord" :key="item.ID">
        <view class="top">
          <image :src="item.prizeUrl" mode="widthFix"></image>
        </view>
        <view class="bottom">
          <view class="prize-name">{{ item.prizeName }}</view>
          <view class="exchange-time">兑换时间：{{ formatDate(item.createTime) }}</view>
          <view class="writeoff-btn">
            <text v-if="true">核销码</text>
            <text v-else>已核销</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { scienceMyExchange } from '@/api'
  import { mapState } from "vuex"
  import dayjs from 'dayjs'
  export default {
    data () {
       return {
        exchangeRecord: []
       }
    },
    computed: {
      ...mapState("moduleLayout", ['menuInfo']),
    },
    onLoad() {
      this.$store.dispatch('moduleLayout/getNavigationBarStyle')
      this.getData()
    },
    methods: {
      async getData() {
        const { data: exchangeRecord } = await scienceMyExchange()
        this.exchangeRecord = exchangeRecord
        console.log('兑换记录：', exchangeRecord)
      },
      formatDate(dateStr) {
        return dayjs(dateStr).format('YYYY年M月D日 H:mm')
      }
    }
  }
</script>

<style lang="scss" scoped>
.exchange-record-container {
  width: 100%;
  height: 100vh;
  .exchange-record-list {
    position: absolute;
    z-index: 99;
    width: 85%;
    margin-left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding-bottom: 60rpx;
    overflow-y: auto;
    .exchange-record-item {
      width: 46.5%;
      background-color: #fff;
      border-radius: 40rpx;
      overflow: hidden;
      box-shadow: 0 0 6px #dfdfdf;
      margin-bottom: 40rpx;
      .top {
        width: 100%;
        image {
          width: 100%;
        }
      }
      .bottom {
        padding: 30rpx 20rpx;
        box-sizing: border-box;
        .prize-name {
          font-size: 28rpx;
          color: #101010;
        }
        .exchange-time {
          margin-top: 6rpx;
          font-size: 16rpx;
          color: #BBBBBB;
        }
        .writeoff-btn {
          width: 100%;
          text-align: center;
          color: #fff;
          margin-top: 24rpx;
          border-radius: 80rpx;
          background-color: #02c6a2;
          padding: 8rpx 0;
          box-sizing: border-box;
          font-size: 12px;
        }
      }
    }
    .exchange-record-item:nth-last-child(2), .exchange-record-item:last-child {
      margin-bottom: 0;
    }
  }
}
</style>