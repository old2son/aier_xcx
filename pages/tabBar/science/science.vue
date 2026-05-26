<template>
	<view class="hot-science-container">
		<!-- 自定义导航栏 -->
		<CustomNav :opacity="opacity" title="爱尔眼健康科普教育基地" />
		<image class="banner" :src="bannerImage"></image>
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
		<view class="scroll-main">
			<view class="category-nav">
				<view class="title">分类导航</view>
				<view class="category-nav-box">
					<view
						class="category-nav-item"
						v-for="(item, index) in categoryList"
						:key="item.columnId"
						@click="
							toSubpackagePage(
								`packageCategory/hotScience/categoryIconInner?categoryId=${item.columnId}&titleActiveColor=${item.introduce}`
							)
						"
					>
						<view class="img-box">
							<image :src="item.h5FileUrl" mode="aspectFill"></image>
						</view>
					</view>
				</view>
			</view>
			<view class="duplex-title">
				<text>基地原创</text>
				<text @click="toSubpackagePage(`packageCategory/hotScience/originalCollection`)">查看更多 ></text>
			</view>
			<view class="original-list">
				<view
					class="original-item"
					v-for="(item, index) in originalList"
					:key="item.columnId"
					@click="
						toSubpackagePage(
							`packageCategory/hotScience/originalCollectionDetail?collectId=${item.specialId}`
						)
					"
				>
					<view class="img-box">
						<image :src="item.specialFile" mode="aspectFill"></image>
					</view>
					<view class="txt">{{ item.specialName }}</view>
				</view>
			</view>

			<view class="duplex-title">
				<text>热门推荐</text>
				<text @click="toRedirectPage(`packageCategory/hotScience/recommendation`)">查看更多 ></text>
			</view>
			<view class="recommendation-list">
				<view class="recommendation-item" v-for="(item, index) in recommendationList" :key="item.specialId">
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
									:src="
										item.status === 0
											? collectIconInit[1].collectedIcon
											: collectIconInit[0].collectedIcon
									"
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
		</view>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import tabBarData from '@/data/tabBar.json';
import categoryData from '@/data/category.json';
import { useCollect } from '@/utils/useCollect.js';
import { getInnerPageIcon, getScienceOriginal, getSciencePopularRecommendations } from '@/api';
export default {
	data() {
		return {
			opacity: 0,
			searchIcon: tabBarData.searchIcon,
			bannerImage: categoryData.hotScienceIndexBanner,
			categoryList: [],
			originalList: [],
			recommendationList: [],
			collectIconInit: categoryData.collectIconInit
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']) // 给搜索icon提供布局数据
	},
	onPageScroll(e) {
		const scrollY = e.scrollTop;
		console.log(scrollY);
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
	beforeCreate() {
		uni.showTabBar();
	},
	mounted() {
		this.requestData();
		this.getRecommendList();
	},
	methods: {
		...mapActions('moduleHome', ['fetchHomeData']),
		async requestData() {
			await this.fetchHomeData();
			const { data: categoryList } = await getInnerPageIcon({ type: 100 });
			this.categoryList = categoryList;
			const { data: originalList } = await getScienceOriginal();
			this.originalList = originalList;
		},
		async getRecommendList() {
			const res = await getSciencePopularRecommendations();
			this.recommendationList = res.data || [];

			const { initCollectStatus, toggleCollect } = useCollect({
				list: this.recommendationList,
				idKey: 'specialId',
				collectKey: 'status',
				countKey: 'specialGood'
			});
			this.toggleCollect = toggleCollect;
			await initCollectStatus();
		},
		toSubpackagePage(url) {
			uni.navigateTo({
				url: '/subpackages/' + url
			});
		},
		toRedirectPage(url) {
			uni.redirectTo({
				url: '/subpackages/' + url
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.hot-science-container {
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	overflow-y: auto;
	padding-bottom: 80rpx;
	background-color: #fff;

	.banner {
		width: 100%;
		height: 402px;
		z-index: 100;
	}
	.search-icon {
		position: fixed;
		z-index: 999;
	}

	.scroll-main {
		position: relative;
		top: -270rpx;
		width: 90%;
		margin: 0 auto -270rpx auto;
		.category-nav {
			background-color: #fff;
			padding: 26rpx 40rpx 100rpx 40rpx;
			box-sizing: border-box;
			border-radius: 40rpx 40rpx 0 0;
		}

		.title {
			width: 100%;
			font-size: 36rpx;
			color: #333;
			font-weight: 550;
		}

		.duplex-title {
			width: 100%;
			display: flex;
			justify-content: space-between;
			font-weight: 550;
			margin-bottom: 40rpx;
			text:first-child {
				font-size: 36rpx;
				color: #333;
			}
			text:last-child {
				font-size: 32rpx;
				color: #808080;
			}
		}

		.category-nav-box {
			margin-top: 40rpx;
			width: 100%;
			display: flex;
			justify-content: space-between;
			.category-nav-item {
				width: 16.5%;
				.img-box {
					width: 100%;
					padding-top: 130.6%; // 64/49≈1.306，保持原始比例
					position: relative;
					overflow: hidden;
				}
				image {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					object-fit: cover;
					display: block;
				}
			}
		}

		.original-list {
			width: 100%;
			display: flex;
			// justify-content: space-between;
			overflow-x: auto; // 允许横向滚动
			scroll-behavior: smooth; // 滚动顺滑
			padding-bottom: 24rpx;
			margin-bottom: 54rpx;
			.original-item {
				width: 40.2%;
				margin-right: 4%;
				box-sizing: border-box;
				flex-shrink: 0;
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
			.original-item::last-child {
				margin-right: 0;
			}
		}

		.recommendation-list {
			width: 100%;
			.recommendation-item {
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
						color: #7c7e80;
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
			.recommendation-item {
				border-bottom: 1px solid #bbbbbb;
			}
			.recommendation-item:first-child {
				padding-top: 0;
			}
			.recommendation-item:last-child {
				padding-bottom: 0;
				border-bottom: 0;
			}
		}
	}
}
</style>
