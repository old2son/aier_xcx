<template>
	<view class="home-container">
		<LoadingAnimation v-if="showLoading || isError || !bannerImagesLoaded" :loadError="isError" :visible="showLoading && !isError" @retry="requestHomeData"></LoadingAnimation>
		
		<view class="home-content" :style="{ opacity: showLoading ? 0 : 1 }">
			<!-- 自定义导航栏 -->
			<CustomNav :opacity="opacity" title="爱尔眼健康科普教育基地" />

			<!-- 滚动内容 -->
			<view class="scroll-main">
				<Swiper
					class="banner-swiper"
					:receiveData="bannerSwiperList"
					:swiperHeight="'402px'"
					:dots="false"
					:needCheckLoaded="true"
					@allImagesLoaded="onBannerImagesLoaded"
				></Swiper>
				<image
					class="search-icon"
					:src="searchIcon"
					mode="scaleToFill"
					:style="{
						top: menuInfo.menuHeightFromTop + 'px',
						left: menuInfo.fromLeft + 'px',
						width: menuInfo.menuHeight + 'px',
						height: menuInfo.menuHeight + 'px'
					}"
					v-if="menuInfo.menuHeight && menuInfo.menuHeight"
					@click="toSubpackagePage('packageHomeDetail/search')"
				></image>

				<view class="relative-area">
					<view class="entrance-box">
						<view class="entrance-wrap" @click="toSubpackagePage('packageAppointment/appointmentEntrance')">
							<image :src="homeData.entranceLsit[0].imgUrl" mode="heightFix"></image>
						</view>
						<view class="entrance-wrap">
							<image :src="homeData.entranceLsit[1].imgUrl" mode="heightFix"></image>
							<text>{{ bannerSwiperList[1].sumVisits }}</text>
						</view>
					</view>
					<view class="category-list">
						<view class="category-item" v-for="(item, index) in homeData.categoryList" :key="item.id">
							<view class="image-wrapper">
								<image :src="item.imgUrl" mode="widthFix" @click="toSubpackagePage(item.toUrl, index)"></image>
							</view>
						</view>
					</view>
					<view class="title-box">
						<text>精选推荐</text>
						<text @click="toSubpackagePage('packageHomeDetail/recommendation')">查看更多 ></text>
					</view>
					<view class="recommendation-box" v-if="recommendationList.length">
						<view class="recommendation-item" v-for="(item, index) in recommendationList" :key="item.columnId">
							<view class="img-box">
								<image :src="item.h5FileUrl" mode="aspectFill"></image>
							</view>
							<view class="txt">{{ item.fileName }}</view>
						</view>
					</view>
					<view class="title-box">
						<text>基地动态</text>
						<text @click="toSubpackagePage('packageHomeDetail/baseUpdates')">查看更多 ></text>
					</view>
					<view class="base-updates-list">
						<view class="base-updates-item" v-for="(item, index) in formattedList" :key="item.specialId">
							<view class="title">{{ item.specialName }}</view>
							<view class="time">
								{{ item.formattedTime }}
							</view>
						</view>
					</view>

					<view class="bottom-part">
						<image :src="homeData.imagUrlMix[0].imgUrl01" mode="widthFix"></image>
						<image :src="homeData.imagUrlMix[0].imgUrl02" mode="widthFix"></image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import tabBarData from '@/data/tabBar.json';
import homeData from '@/data/home.json';

export default {
	data() {
		return {
			opacity: 0,
			searchIcon: tabBarData.searchIcon,
			homeData: homeData,
			showLoading: true,

			bannerImagesLoaded: false // 轮播图图片是否加载完成
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']), // 给搜索icon提供布局数据
		...mapGetters('moduleHome', ['bannerSwiperList', 'recommendationList', 'baseUpdatesList', 'isLoaded', 'isError']),
		formattedList() {
			return this.baseUpdatesList.map((item) => {
				const safeDateStr = item.createTime.replace(' ', 'T');
				const date = new Date(safeDateStr);
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				return {
					...item,
					formattedTime: `${year}-${month}-${day}`
				};
			});
		}
	},
	beforeCreate() {
		uni.hideTabBar();
	},
	onLoad() {
		this.requestHomeData();
	},
	onPageScroll(e) {
		const scrollY = e.scrollTop;
		let op = 0;
		if (scrollY == 0 || scrollY < 1) {
			op = 0;
		} else if (scrollY <= 20) {
			op = 0.1 + (scrollY / 20) * 0.2; // 从 0.1 ~ 0.3 渐显
		} else if (scrollY > 20 && scrollY <= 100) {
			// 正常渐显范围：从 0.3 ~ 1
			op = 0.3 + ((scrollY - 20) / 80) * 0.7;
		} else {
			op = 1;
		}
		this.opacity = op;
	},
	methods: {
		...mapActions('moduleHome', ['fetchHomeData']),
		// async requestHomeData () {
		//   // 如果已加载过数据，不再请求，也不显示 loading
		//   if (this.isLoaded) {
		//     this.showLoading = false
		//     uni.showTabBar()
		//     return
		//   }

		//   this.showLoading = true // 每次重新请求时，显示加载动画
		//   uni.hideTabBar() // 页面进来时隐藏

		//   try {
		//     const start = Date.now()
		//     await this.fetchHomeData()
		//     const duration = Date.now() - start
		//     const remain = 3500 - duration
		//     if (remain > 0) {
		//       await new Promise(resolve => setTimeout(resolve, remain))
		//     }

		//     if (!this.isError) { // 如果没有出错，再关闭加载动画
		//       this.showLoading = false
		//       uni.showTabBar()
		//     }
		//   } catch (e) {
		//     console.warn('首页请求失败', e)
		//     // showLoading 保持为 true，让错误状态展示
		//   }
		// },
		// onBannerImagesLoaded() {
		//   console.log("子组件轮播图加载完毕了！")
		//   this.bannerImagesLoaded = true
		// },

		async requestHomeData() {
			this.showLoading = true;
			uni.hideTabBar();
			try {
				const start = Date.now();
				await this.fetchHomeData();
				const duration = Date.now() - start;
				const remain = 3500 - duration;
				if (remain > 0) {
					await new Promise((resolve) => setTimeout(resolve, remain));
				}
				if (!this.isError) {
					this.homeDataLoaded = true;
					this.tryCloseLoading();
				}
			} catch (e) {
				console.warn('首页请求失败', e);
			}
		},
		onBannerImagesLoaded() {
			console.log('子组件轮播图加载完毕了！');
			this.bannerImagesLoaded = true;
			this.tryCloseLoading();
		},
		tryCloseLoading() {
			if (this.homeDataLoaded && this.bannerImagesLoaded) {
				this.showLoading = false;
				uni.showTabBar();
			}
		},

		toSubpackagePage(url, index) {
			if (index === 0) {
				uni.switchTab({ url: '/' + url });
				return;
			}
			uni.navigateTo({
				url: '/subpackages/' + url
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.home-container {
	width: 100%;
	height: 100vh;
}

.home-content {
	position: relative;
	width: 100%;
	height: 100vh;
	background-color: #f9f9f9;
}

.scroll-main {
	width: 100%;
	height: 100vh;
	background-color: #f9f9f9;
}

.search-icon {
	position: fixed;
	z-index: 999;
}

.banner-swiper {
	width: 100%;
	height: 402px;
	z-index: 100;
}

.relative-area {
	position: relative;
	top: -270rpx;
	width: 100%;
	background-color: #f9f9f9;
}

.entrance-box {
	width: 90%;
	margin: 0 auto;
	background-color: #fff;
	border-radius: 20rpx;
	display: flex;
	justify-content: space-between;
	padding: 40rpx;
	box-sizing: border-box;
	z-index: 999;
	.entrance-wrap {
		height: 230rpx;
		// 根据图实际宽高给定宽度
		&:first-child {
			width: 345rpx; // 左边
		}
		&:nth-child(2) {
			width: 230rpx; // 右边
			position: relative;
		}
		image {
			width: 100%;
			height: 100%;
			border-radius: 20rpx;
		}
		text {
			position: absolute;
			top: 36%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: #fff;
			font-size: 32rpx;
			font-weight: 550;
		}
	}
}

.category-list {
	width: 90%;
	margin: 60rpx auto 80rpx auto;
	display: flex;
	justify-content: space-between;
	.category-item {
		width: 18.5%;
		.image-wrapper {
			position: relative;
			width: 100%;
			padding-top: 132.2%; // ≈ 82 / 62 × 100%
			overflow: hidden;
			image {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}
		}
	}
}

.title-box {
	width: 90%;
	margin: 0 auto 20rpx auto;
	display: flex;
	justify-content: space-between;
	font-weight: 550;
	text:first-child {
		font-size: 36rpx;
		color: #333;
	}
	text:last-child {
		font-size: 32rpx;
		color: #808080;
	}
}

.recommendation-box {
	width: 90%;
	margin: 0 auto;
	display: flex;
	justify-content: space-between;
	overflow-x: auto; // 横向滚动
	scroll-behavior: smooth;
	padding-bottom: 24rpx;
	margin-bottom: 80rpx;
	.recommendation-item {
		width: 40.2%;
		margin-right: 4%;
		flex-shrink: 0;
		box-sizing: border-box;
		cursor: pointer;
		background-color: #fff;
		border-radius: 20rpx;
		border: 0.5px solid #d6d9db;
		.img-box {
			position: relative;
			width: 100%;
			padding-top: 100%; // 高度=宽度
			border-radius: 20rpx 20rpx 0 0;
			overflow: hidden;
			image {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				object-fit: cover; // 保证不拉伸
				display: block;
			}
		}
		.txt {
			width: 100%;
			font-size: 32rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			flex-shrink: 0;
			padding: 12rpx 20rpx 40rpx 20rpx;
			box-sizing: border-box;
		}
	}
	.recommendation-item:last-child {
		margin-right: 0;
	}
}

.base-updates-list {
	width: 90%;
	margin: 60rpx auto 0 auto;
	background-color: #fff;
	border-radius: 20rpx;
	.base-updates-item {
		padding: 44rpx 60rpx 0 30rpx;
		box-sizing: border-box;
		.title {
			display: -webkit-box;
			overflow: hidden;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
			text-overflow: ellipsis;
			color: #333;
			font-size: 32rpx;
			line-height: 1.2;
		}
		.time {
			font-size: 24rpx;
			color: #7c7e80;
			padding-bottom: 48rpx;
			border-bottom: 0.5px solid #cccccc;
			box-sizing: border-box;
			margin-top: 40rpx;
		}
	}
	.base-updates-item:last-child .time {
		border-bottom: 0;
	}
}

.bottom-part {
	width: 90%;
	margin: 48rpx auto 0 auto;
	padding-bottom: 80rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	image:first-child {
		display: inline-block;
		width: 45%;
		margin-top: 20rpx;
	}
	image:last-child {
		width: 64%;
		margin-top: 20rpx;
	}
}
</style>
