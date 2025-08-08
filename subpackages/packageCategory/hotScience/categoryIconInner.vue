<template>
  <view class="category-icon-inner-container">
    <CustomNavInner       title="爱尔眼健康科普教育基地"     />
    <view 
      class="screen-wrap"
      :style="{ top: (menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20) + 'px' }">
      <van-tabs 
        v-model="active" 
        :color="titleActiveColor"
        title-active-color="#242424"
        title-inactive-color="#7C7E80"
        :ellipsis="false"
        line-width="80rpx"
        line-height="20rpx"
        @change="handleTabChange($event)">
        <van-tab
          v-for="(item, index) in filterList" 
          :title="item.pcExtensionUrl" 
          :key="item.companyId"
        >
          <view class="filter-result">
            <view class="filter-item" v-for="(item,index) in filterResult" :key="item.specialId">
              <view class="poster">
                <image :src="item.specialFile" mode="widthFix"></image>
              </view>
              <view class="right-box">
                <view class="top-title">
                  <text>{{ item.specialName }}</text>
                </view>
                <view class="bottom-box">
                  <view>{{ item.createTime.split(' ')[0] }}</view>
                  <view class="collect-box" @click="toggleCollect(item)">
                    <image
                      class="collect-image"
                      :src="item.status === 0 ? collectIconInit[1].collectedIcon : collectIconInit[0].collectedIcon"
                      mode="aspectFill"
                    ></image>
                    <view class="collect-num">
                      {{ item.specialGood }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </van-tab>
      </van-tabs>
    </view>
  </view>
</template>

<script>
  import {
    getOrbitopathyYearQuery,    getOrbitopathyQueryReviewVideo } from "@/api"
  import { mapState } from "vuex"
  import categoryData from '@/data/category.json'
  import { useCollect } from '@/utils/useCollect'
  
  export default {
    data() {
      return {
        filterList: [],        active: 0,
        categoryId: '',        titleActiveColor: null,        filterResult: [], // 收藏操作会作用在这里
        collectIconInit: categoryData.collectIconInit,
        toggleCollect: null
      };
    },
    computed: {
      ...mapState("moduleLayout", ['menuInfo'])
    },
    onLoad(options) {
      this.$store.dispatch('moduleLayout/getNavigationBarStyle')      this.getData(options.categoryId)
      this.categoryId = options.categoryId      this.titleActiveColor = decodeURIComponent(options.titleActiveColor)
      console.log('options',options)    },
    methods: {
      async getData(categoryId){        const { data: filterList } = await getOrbitopathyYearQuery({ columnId: categoryId })        console.log('filterList',filterList)        this.filterList = filterList
        
        // 默认触发第一个Tab的数据加载
        if (filterList.length > 0) {
          await this.handleTabChange({ 
            detail: { 
              title: filterList[0].pcExtensionUrl,
              index: 0 
            } 
          })
        }      },
      async handleTabChange(event) {
        const filterKeyword = event.detail.title
        const res = await getOrbitopathyQueryReviewVideo({
          time: filterKeyword,
          columnId: this.categoryId 
        })
        this.filterResult = res.data || []

        // 使用 useCollect 初始化收藏状态和方法
        const { initCollectStatus, toggleCollect } = useCollect({
          list: this.filterResult,
          idKey: 'specialId',
          collectKey: 'status',
          countKey: 'specialGood'
        })

        this.toggleCollect = toggleCollect
        await initCollectStatus()
      },
    }
  }
</script>

<style lang="scss" scoped>
.category-icon-inner-container {
  width: 100%;  height: 100vh;}
.screen-wrap {
  position: absolute;
  z-index: 999;
  flex: 1;
  width: 100%;
  height: 100%;  min-height: 100vh;  width: 100%;
  /deep/ .van-tabs__scroll {
    background: transparent;
  }
  /deep/ .van-tab {
    font-size: 40rpx;
    line-height: 1;
  }
  /deep/ .van-tabs__line {
    bottom: -30rpx;
  }
  /deep/ .van-tabs__wrap--scrollable .van-tab--complete {
    width: fit-content;
    flex: initial!important;
    flex-shrink: 0!important;
  }
  /deep/ .van-tabs__nav--card .van-tab.van-tab--active, .video-screen-wrap .van-tabs__nav--card .van-tab.van-tab--active {
    width: fit-content;
    flex: initial!important;
    flex-shrink: 0!important;
  }
  
    .filter-result {
      width: 90%;
      margin: 40rpx auto 0 auto;
      padding-bottom: 80rpx;
      .filter-item {
        display: flex;
        justify-content: space-between;
        padding: 30rpx 0;
        .poster {
          width: 38%;
          image {
            width: 100%;
            border-radius: 20rpx;
          }
        }
        .right-box {
          width: 57%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          .top-title {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2; /* 显示两行 */
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-word;
            line-height: 1.1;
            text {
              color: #101010;
              font-size: 24rpx;
            }
          }
          .bottom-box {
            display: flex;
            justify-content: space-between;
            color: #7C7E80;
            font-size: 24rpx;
            padding-bottom: 10rpx;
            .collect-box {
              display: flex;
              align-items: center; /* 垂直居中 */
              flex-wrap: nowrap; /* 防止换行 */
              .collect-image {
                flex-shrink: 0; /* 防止图片被压缩 */
                margin-right: 4px;
                width: 28rpx;
                height: 28rpx;
                vertical-align: middle;
              }
              .collect-num {
                white-space: nowrap; /* 防止数字换行 */
                overflow: visible; /* 允许内容溢出 */
                line-height: 1; /* 消除行高影响 */
                display: inline-flex; /* 更好的垂直控制 */
                align-items: center; /* 内容居中 */
                vertical-align: middle; /* 关键：垂直居中对齐 */
                position: relative;
                top: 2rpx; /* 初始为0，然后微调 */
              }
            }
          }
        }
      }
      .filter-item {
        border-bottom: 1px solid #BBBBBB;
      }
      .filter-item:first-child {
        padding-top: 0;
      }
      .filter-item:last-child {
        padding-bottom: 0;
        border-bottom: 0;
      }
    }
}
</style>
