<template>
  <view class="time-slot-picker">
    <view 
      class="time-slot-item" 
      v-for="(item, index) in combinedTimeSlotList" 
      :key="index"
    >
      <view
        class="time-slot-wrap"
        :class="{ disabled: item.status === 0, 'time-slot-selected': selectedTimeSlotIndex === index }"
        @tap="selectTimeSlot(item.name, index)"
      >
        <view class="time-slot-part">{{ item.name }}</view>
        <view class="reservation-num" v-if="needTimeSlotRequest">已报名：{{ item.reservationNumber }}人</view>
      </view>
      <view 
        :style="weight ? 'font-weight: bold; font-size: 32rpx;' : ''"
        class="afternoon-title" 
        v-if="index === 1"
      >下午时段</view>
    </view>
  </view>
</template>

<script>
import dayjs from 'dayjs'
export default {
  name: 'TimeSlotPicker',
  props: {
    timeSlotList: {
      type: Array,
      require: true,
    },
    timeSlotNumbers: {
      type: Object,
      default: () => ({}), // 默认空对象
    },
    selectedTimeSlotIndex: {
      type: Number,
      require: true,
    },
    needTimeSlotRequest: {
      type: Boolean,
      require: true,
    },
    weight: {
      type: Boolean,
      require: false,
    }
  },
  // computed: {
  //   // 合并时段数据和预约人数
  //   combinedTimeSlotList() {
  //     return this.timeSlotList.map((slot, index) => {
  //       console.log('slot：', slot)
  //       return {
  //         ...slot,
  //         numbers: this.timeSlotNumbers[`numbers${index + 1}`] || 0,
  //       }
  //     })
  //   },
  // },
  computed: {
    combinedTimeSlotList() {
      const now = dayjs() // 当前时间
      return this.timeSlotList.map((slot, index) => {
        const numbers = this.timeSlotNumbers[`numbers${index + 1}`] || 0
        // 提取该时间段的结束时间（如 "09:00-10:00" -> "10:00"）
        const timeRange = slot.name.split('-')
        const endTime = timeRange[1]
        // 拼接完整日期时间，假设 slot 属于今天
        const endDateTime = dayjs(`${now.format('YYYY-MM-DD')} ${endTime}`)
        // 判断是否禁用：已过结束时间或人数 ≥ 40
        const isDisabled = now.isAfter(endDateTime) || numbers >= 40
        console.log('slot>>>>>：', slot)
        return {
          ...slot,
          numbers,
          disableStatus: isDisabled ? 0 : 1, // 0 表示禁用
        }
      })
        console.log('✅ 最终处理好的 combinedTimeSlotList：', result)
        return result
    },
  },
  computed: {
    combinedTimeSlotList() {
      const now = dayjs() // 当前时间
  
      return this.timeSlotList.map((slot, index) => {
        const reservationNumber = this.timeSlotNumbers[`numbers${index + 1}`] || 0
  
        // 提取该时间段的结束时间（如 "09:00-10:00" -> "10:00"）
        const timeRange = slot.name.split('-')
        const endTime = timeRange[1]
  
        // 拼接完整日期时间，假设 slot 属于今天
        const endDateTime = dayjs(`${now.format('YYYY-MM-DD')} ${endTime}`)
  
        // 判断是否禁用：已过结束时间或人数 ≥ 40
        const isDisabled = now.isAfter(endDateTime) || reservationNumber >= 40
  
        return {
          ...slot,
          reservationNumber,
          status: isDisabled ? 0 : 1, // 0 表示禁用
        }
      })
    },
  },

  watch: {
    timeSlotList(newVal) {
      if (newVal && newVal.length > 0) {
        const defaultIndex = newVal.findIndex((slot) => Number(slot.status) !== 0)
        if (defaultIndex !== -1) {
          this.selectTimeSlot(newVal[defaultIndex].name, defaultIndex)
        }
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.timeSlotList && this.timeSlotList.length > 0) {
        const defaultIndex = this.timeSlotList.findIndex((slot) => Number(slot.status) !== 0)
        if (defaultIndex !== -1) {
          this.selectTimeSlot(this.timeSlotList[defaultIndex].name, defaultIndex)
        }
      }
    })
  },
  methods: {
    selectTimeSlot(name, index) {
      if (this.timeSlotList[index].status !== 0) {
        this.$emit('timeSlotSelected', name, index) // 发出选择事件
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.time-slot-picker {
  position: relative;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin: 42rpx auto 0 auto;

  .time-slot-item {
    width: 40%;
    border-radius: 25rpx;
    text-align: center;
    margin: 0 32rpx 140rpx 0;
  }
  .time-slot-item:nth-last-child(1),
  .time-slot-item:nth-last-child(2) {
    margin-bottom: 0;
  }

  .time-slot-wrap {
    width: 100%;
    color: #2a2a2a;
    font-size: 34rpx;
    padding: 32rpx 0;
    box-sizing: border-box;
    border-radius: 25rpx;
    background-color: #ebf1ff;
    .time-slot-part {
      white-space: nowrap;
    }
    .reservation-num {
      margin-top: 21rpx; 
      font-size: 30rpx;
    }
  }

  .time-slot-selected {
    background-color: #32579c;
    color: #fff;
    .reservation-num {
      color: #fff;
    }
  }
  .time-slot-wrap.disabled {
    background-color: #e7e7e7;
    color: #7f7f7f;
    .reservation-num {
      color: #7f7f7f;
    }
  }
  .afternoon-title {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    font-size: 38rpx;
    color: #2a2a2a;
  }
}
</style>