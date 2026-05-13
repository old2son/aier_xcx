<template>
	<view class="base-overview-container">
		<Swiper class="banner-swiper" :receiveData="carouselList" :swiperHeight="'281px'"></Swiper>

		<view class="nav-bar-container">
			<!-- 左侧菜单栏 -->
			<view class="nav-bar">
				<view class="nav-item" v-for="(item, index) in navList" :key="index">
					<view
						:class="[
							'nav-wrap',
							{
								active: activeMainIndex === index,
								'child-style': activeMainIndex === index && item.children
							}
						]"
						@click="onMainNavClick(index)"
					>
						{{ item.name }}
					</view>
					<!-- 子导航：依旧是点击显示点击项的菜单 && 判断是否有子菜单，有则渲染所有子菜单 -->
					<view class="sub-nav" v-if="index === activeMainIndex && item.children">
						<view
							class="sub-item"
							v-for="(sub, subIndex) in item.children"
							:key="subIndex"
							:class="{ 'sub-item-active': activeSubIndex === subIndex }"
							@click.stop="onSubNavClick(subIndex)"
						>
							{{ sub.name }}
						</view>
					</view>
				</view>
			</view>
			<!-- 右侧展示区 -->
			<view class="selected-content">
				<image v-if="currentImage" :src="currentImage" mode="widthFix" class="content-image" />
			</view>
		</view>
	</view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import categoryData from '@/data/category.json';
import { getScienceOverViewBanner, getScienceOverView } from '@/api';
export default {
	data() {
		return {
			carouselList: [],
			navList: [],
			activeMainIndex: 0,
			activeSubIndex: 0
		};
	},
	computed: {
		...mapGetters('moduleHome', ['bannerSwiperList']),
		currentImage() {
			const active = this.navList[this.activeMainIndex];
			if (!active) return ''; // 防止 active 为 undefined
			if (active.children) {
				return active.children[this.activeSubIndex]?.image || '';
			}
			return active.image || '';
		}
	},
	methods: {
		...mapActions('moduleHome', ['fetchHomeData']),
		async requestData() {
			const { data: carouselList } = await getScienceOverViewBanner();
			this.carouselList = carouselList;
			const { data: backNavList } = await getScienceOverView();
			this.navList = this.adaptData(backNavList);
		},
		adaptData(rawData) {
			return rawData.map((item) => {
				if (item.list.length === 1) {
					// 普通模块：介绍、路线、交通
					return {
						name: item.text,
						image: item.list[0].h5FileUrl
					};
				} else {
					// 多个子项：展馆
					return {
						name: item.text,
						children: item.list.map((child) => ({
							name: child.fileName,
							image: child.h5FileUrl
						}))
					};
				}
			});
		},
		onMainNavClick(index) {
			if (this.activeMainIndex !== index) {
				this.activeMainIndex = index;
				this.activeSubIndex = 0;
			}
		},
		onSubNavClick(subIndex) {
			this.activeSubIndex = subIndex;
		}
	},
	mounted() {
		this.requestData();
	}
};
</script>

<style lang="scss" scoped>
.base-overview-container {
	position: absolute;
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	width: 100%;
	height: 100vh;
	overflow-y: hidden;
	background-color: #fff;
	.banner-swiper {
		width: 100%;
		height: 281px;
		z-index: 100;
	}

	.nav-bar-container {
		width: 100%;
		height: calc(100vh - 281px);
		display: flex;
		overflow-y: auto;
		.nav-bar {
			width: 28%;
			height: 100%;
			overflow-y: auto;
			padding: 0 6rpx;
			box-sizing: border-box;
			.nav-item {
				text-align: center;
				white-space: nowrap;
				background-color: #f5f2f2;
				color: #333;
				font-size: 40rpx;
			}
			.nav-wrap {
				padding: 40rpx 8rpx;
				box-sizing: border-box;
				font-weight: 550;
			}
			.child-style {
				padding-bottom: 0;
			}
			.active {
				width: 100%;
				background-color: #fff;
				font-weight: 550;
			}
			.sub-nav {
				width: 100%;
				font-size: 24rpx;
				color: #5e5e5e;
				background-color: #fff;
				.sub-item {
					white-space: nowrap;
					padding: 0 8rpx;
					padding-top: 20rpx;
					box-sizing: border-box;
				}
				.sub-item:last-child {
					padding-bottom: 20rpx;
				}
			}
			.sub-item-active {
				font-weight: 550;
			}
		}

		.selected-content {
			width: 72%;
			height: 100%;
			overflow-y: auto;
			box-sizing: border-box;
			padding: 40rpx 24rpx 160rpx 0;
			background: #fff;
			.content-image {
				max-width: 100%;
				border-radius: 12rpx;
			}
		}
	}
}
</style>
