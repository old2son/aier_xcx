<template>
	<view class="my-container">
		<CustomNavInner title="我的" />
		<view class="my-main" :style="{ top: (menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20) + 'px' }">
			<view class="header-box">
				<!-- 头像区域 -->
				<view class="left-block">
					<!-- 未登录 -->
					<view class="not-logged-in-box" v-if="!hasValidUserInfo"
						@click="toSubpackagePage('/subpackages/packageLogin/login')">
						<view class="not-logged-avatar-wrap">
							<image :src="displayAvatar" mode="aspectFill"></image>
						</view>
						<view class="not-logged-text">登录/注册</view>
					</view>
					<!-- 已登录 -->
					<view class="logged-in-box" v-else>
						<view class="profile-pic">
							<image :src="displayAvatar" mode="aspectFill" @click="previewAvatar()"></image>
						</view>
						<view class="user-right-part">
							<view class="user-name">{{ userInfo.nickName }}</view>
							<view class="sign-in-btn"
								@click="toSubpackagePage('/subpackages/packageMine/points/index')">
								<image :src="tabBarData.signInBtn" mode="widthFix"></image>
							</view>
						</view>
					</view>
				</view>
				<view class="right-block" v-if="hasValidUserInfo">
					<image class="edit-icon" :src="tabBarData.rightArrowIcon" mode="heightFix"
						@touchstart="toSubpackagePage('/subpackages/packageMine/editProfile')"></image>
				</view>
			</view>

			<view class="appointment-and-Integral-box">
				<view class="left-wrap" @click="toSubpackagePage('/subpackages/packageMine/appointment/myAppointment')">
					<image :src="tabBarData.mineAppointmentImage"></image>
				</view>
				<view class="right-wrap" @click="toSubpackagePage('/subpackages/packageMine/points/index')">
					<image :src="tabBarData.mineIntegralImage"></image>
				</view>
			</view>

			<view class="category-box">
				<view class="title">我的内容</view>
				<view class="category-list">
					<view class="category-item" v-for="(item,index) in tabBarData.categoryList" :key="item.id">
						<view class="img-wrap" :style="{ backgroundImage: `url(${item.imgUrl})` }"
							@click="toSubpackagePage(item.tourl)"></view>
						<text>{{ item.title }}</text>
					</view>
				</view>
			</view>

			<view class="bottom-category-box">
				<view class="bottom-category-item" v-for="(item,index) in tabBarData.bottomCategoryList" :key="item.id"
					@click="toSubpackagePage(item.tourl)">
					<view class="left-content">
						<image :src="item.imgUrl" mode="heightFix"></image>
						<text>{{ item.title }}</text>
					</view>
					<image class="arrow-icon" :src="tabBarData.rightArrowIcon" mode="heightFix"></image>
				</view>
			</view>
		</view>

		<!-- 头像预览 -->
		<AvatarPreview :imgs="[displayAvatar]" v-if="showPreview" @close-preview="showPreview = false"></AvatarPreview>
	</view>
</template>

<script>
	import {
		mapState
	} from "vuex"
	import tabBarData from '@/data/tabBar.json'
	export default {
		data() {
			return {
				tabBarData: tabBarData,
				showPreview: false, // 是否显示预览头像
			};
		},
		computed: {
			...mapState("moduleLayout", ['menuInfo']),
			...mapState("moduleUser", [
				'isLogin',
				'userInfo',
			]),
			hasValidUserInfo() {
				return this.isLogin && this.userInfo
			},
			displayAvatar() {
				return this.hasValidUserInfo ? this.userInfo.userAvatarUrl : this.tabBarData.defaultAvatar
			},
		},
		beforeCreate() {
			uni.showTabBar()
		},
		onLoad(options) {
			this.$store.dispatch('moduleLayout/getNavigationBarStyle')
			this.$store.dispatch("moduleUser/getUserInfo")
		},
		// onShow() {
		//   // 通过getApp()获取全局实例
		//   const app = getApp()
		//   if (app.globalData) {
		//     app.globalData.currentTab = '/pages/tabBar/mine/mine'
		//   }
		//   // 同步到Vuex
		//   this.$store.commit('moduleTab/SET_CURRENT_TAB', '/pages/tabBar/mine/mine')
		// },
		methods: {
			toSubpackagePage(url) {
				console.log('点击登录', url)
				uni.navigateTo({
					url: url
				})
			},
			previewAvatar() {
				this.showPreview = !this.showPreview
			},
		}
	}
</script>

<style lang="scss" scoped>
	.my-container {
		width: 100%;
		height: 100vh;

		.my-main {
			position: absolute;
			z-index: 999;
			flex: 1;
			width: 100%;
			flex-shrink: 0;
			padding: 0 20rpx 80rpx 20rpx;
			box-sizing: border-box;

			.header-box {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding-right: 54rpx;
				box-sizing: border-box;
				width: 100%;

				.left-block {
					width: 90%;

					.not-logged-in-box {
						display: flex;
						align-items: center;

						.not-logged-avatar-wrap {
							width: 158rpx;
							height: 158rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							background-color: #fff;
							border-radius: 50%;

							image {
								width: 80%;
								height: 80%;
							}
						}

						.not-logged-text {
							color: #333;
							font-size: 38rpx;
							font-weight: 540;
							margin-left: 42rpx;
						}
					}

					.logged-in-box {
						display: flex;
						align-items: center;
						width: 100%;

						.profile-pic {
							width: 158rpx;
							height: 158rpx;

							image {
								width: 158rpx;
								height: 158rpx;
								border-radius: 50%;
							}
						}

						.user-right-part {
							width: calc(100% - 198rpx);
							margin-left: 40rpx;

							.user-name {
								width: 100%;
								color: #333;
								font-size: 32rpx;
								font-weight: 550;
								white-space: nowrap;
								overflow: hidden;
								text-overflow: ellipsis;
							}

							.sign-in-btn {
								margin-top: 10rpx;
								width: 160rpx;
								height: 47rpx;

								image {
									width: 100%;
									height: 100%;
								}
							}
						}
					}
				}

				.right-block {
					width: 38rpx;
					height: 38rpx;

					.edit-icon {
						width: 100%;
						height: 100%;
					}
				}
			}

			.appointment-and-Integral-box {
				display: flex;
				justify-content: space-between;
				margin-top: 5vh;

				.left-wrap,
				.right-wrap {
					width: 47.5%;

					image {
						width: 100%;
						height: calc(100vw * 0.475 / 2.15);
						object-fit: cover;
						border-radius: 20rpx;
					}
				}
			}

			.category-box {
				margin-top: 6vh;
				background-color: #fff;
				border-radius: 30rpx;
				padding: 26rpx 32rpx 52rpx 32rpx;
				box-sizing: border-box;

				.title {
					color: #333;
					font-size: 32rpx;
					font-weight: 550;
				}

				.category-list {
					margin-top: 3vh;
					display: flex;
					justify-content: space-between;

					.category-item {
						width: 16%;
						text-align: center;

						.img-wrap {
							width: 100%;
							padding-top: 100%;
							/* 宽高比 1:1 */
							border-radius: 20rpx;
							background-size: cover;
							background-position: center;
						}

						text {
							font-size: 24rpx;
							color: #333;
							font-weight: 550;
							margin-top: 14rpx;
							display: inline-block;
						}
					}
				}
			}

			.bottom-category-box {
				margin-top: 4vh;
				background-color: #fff;
				border-radius: 30rpx;
				padding: 0 54rpx 0 50rpx;
				box-sizing: border-box;

				.bottom-category-item {
					border-bottom: 1px solid #F0F0F0;
					display: flex;
					justify-content: space-between;
					padding: 50rpx 0;
					font-weight: 550;

					.left-content {
						display: flex;
						align-items: center;
						white-space: nowrap;

						image {
							width: 54rpx;
							height: 54rpx;
						}

						text {
							color: #333;
							font-size: 32rpx;
							display: inline-block;
							margin-left: 30rpx;
						}
					}

					.arrow-icon {
						width: 38rpx;
						height: 38rpx;
					}
				}

				.bottom-category-item:last-child {
					border: 0;
				}
			}
		}
	}
</style>