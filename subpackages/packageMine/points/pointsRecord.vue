<template>
  <view class="points-record-container">
    <CustomNavInner
      title="积分记录" 
    />
    <view 
      class="tab-area"
      :style="{ top: (menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20) + 'px' }">
      <van-tabs
        swipeable
        v-model="active"
        title-inactive-color="#7C7E80"
        title-active-color="#32579C"
        color="#32579C"
        line-width="80rpx"
        line-height="10rpx"
      >
        <van-tab
          v-for="(item, index) in tabList"
          :title="item.title"
          :key="item.id"
        >
          <view v-if="index === 0">
            <view 
              v-for="record in pointsIncomeRecords" 
              :key="record.pointsId"
              class="record-item"
            >
              <view class="record-left">
                <view class="task-name">{{ record.pointsIncome }}</view>
                <view class="task-time">{{ formatDate(record.createTime) }}</view>
              </view>
              <view class="task-init">
                <text>+{{ record.points}}</text>
                <text>积分</text>
              </view>
            </view>
            <view class="empty-box" v-if="pointsIncomeRecords.length === 0">
              <image :src="empty" class="empty-image" mode="widthFix"></image>
              <view class="empty-text">暂无收入记录</view>
            </view>
          </view>
      
          <view v-else>
            <view 
              v-for="record in pointsExpenditureRecords" 
              :key="record.pointsId"
              class="record-item"
            >
              <view class="record-left">
                <view class="task-name">{{ record.pointsIncome }}</view>
                <view class="task-time">{{ formatDate(record.createTime) }}</view>
              </view>
              <view class="task-init">
                <text>-{{ record.points}}</text>
                <text>积分</text>
              </view>
            </view>
            <view class="empty-box" v-if="pointsExpenditureRecords.length === 0">
              <image :src="empty" class="empty-image" mode="widthFix"></image>
              <view class="empty-text">暂无待支出记录</view>
            </view>
          </view>
        </van-tab>
      </van-tabs>
    </view>
  </view>
</template>

<script>
  import dayjs from 'dayjs'
  import { mapState } from "vuex"
  import pointsRecordData from '@/data/category.json'
  import { 
    getMyPointsIncome, 
    getMyPointsExpenses
  } from '@/api'
  export default {
    data() {
      return {
        active: 0, 
        tabList: pointsRecordData.pointsTitleTabList,
        empty: pointsRecordData.emptyImage,
        pointsIncomeRecords: [],
        pointsExpenditureRecords: []
      };
    },
    mounted () {
      console.log("tabList：", this.tabList)
      this.$store.dispatch('moduleLayout/getNavigationBarStyle')
      this.getData()
    },
    computed: {
      ...mapState("moduleLayout", ['menuInfo']),
    },
    methods: {
      async getData () {
        const { data: pointsIncomeRecords } = await getMyPointsIncome()
        const { data: pointsExpenditureRecords } = await getMyPointsExpenses()
        this.pointsIncomeRecords = pointsIncomeRecords
        this.pointsExpenditureRecords = pointsExpenditureRecords
        console.log('pointsIncomeRecords', pointsIncomeRecords)
        console.log('pointsExpenditureRecords', pointsExpenditureRecords)
      },
      formatDate(dateStr) {
        return dayjs(dateStr).format('YYYY.M.D H:mm')
      }
    }
  }
</script>
<style lang="scss" scoped>
  .points-record-container {
    width: 100%;
    height: 100vh;
 
    ::v-deep .van-ellipsis {
      font-size: 36rpx;
    }
    ::v-deep .van-tabs__scroll {
      background-color: transparent;
    }
    
    .tab-area {
      position: absolute;
      z-index: 99;
      width: 85%;
      margin-left: 50%;
      transform: translateX(-50%);
      padding-bottom: 50rpx;
      .record-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 60rpx 0 24rpx 0;
        box-sizing: border-box;
        border-bottom: 1px solid #BBBBBB;
        .record-left {
          font-size: 28rpx;
          .task-name {
            font-weight: 550;
            color: #646464;
          }
          .task-time {
            color: #BBBBBB;
            margin-top: 16rpx;
          }
        }
        .task-init {
          font-size: 36rpx;
          color: #646464;
          font-weight: 550;
          text:nth-child(2) {
            display: inline-block;
            margin-left: 10rpx;
          }
        }
      }
      .record-item:last-child {
        border: 0;
      }
    }
  }
</style>