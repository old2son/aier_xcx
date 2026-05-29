<template>
	<view class="edit-profile-container">
		<view class="edit-profile-wrap">
			<CustomNavInner title="个人资料" />
			<view class="edit-main" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
				<view class="header-box">
					<view class="profile-pic">
						<image :src="userInfo.userAvatarUrl" mode="aspectFill" @click="previewAvatar()"></image>
					</view>
					<button class="change-avatar" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
						点击更换头像
					</button>
				</view>

				<view class="edit-user-info-box">
					<view class="title">基本信息</view>
					<view class="nickname">
						<view class="title">昵称</view>
						<view class="init-info" @click="showPopup">{{ userInfo.nickName }}</view>
					</view>
					<view class="phone">
						<view class="title">手机号码</view>
						<view class="init-info">{{ formatPhone(userInfo.phone) }}</view>
					</view>
					<view class="gender">
						<view class="title">性别</view>
						<view class="init-info" @click="showGeneralPopup('gender')">{{
							userInfo.gender === 1 ? '男' : '女'
						}}</view>
					</view>
					<view class="birthday">
						<view class="title">生日</view>
						<view class="init-info" @click="showGeneralPopup('birthday')">{{
							userInfo.birthday || '请选择生日'
						}}</view>
					</view>
					<view class="address">
						<view class="title">地区</view>
						<view class="init-info" @click="showGeneralPopup('area')">{{
							userInfo.address || '请选择地区'
						}}</view>
					</view>
				</view>
				<view class="logout" @click="logOut()">退出登录</view>
			</view>
		</view>
		<van-popup :show="popupShow" position="bottom" custom-style="height: 35%;">
			<view class="btn-box">
				<view class="btn-content">
					<text @click="handleClose">取消</text>
					<text @click="editUserNameConfirm">确认</text>
				</view>
			</view>
			<van-field
				type="text"
				:value="userName"
				placeholder="请输入您更改的用户名"
				@input="userName = $event.detail"
			/>
			<view class="tips">限制最多10个中文、英文或数字</view>
		</van-popup>
		<!-- 通用弹出层 -->
		<Popup class="general-popup" ref="generalPopup" :type="'bottom'">
			<!-- 性别选择 -->
			<van-picker
				v-if="popupType === 'gender'"
				:columns="genderOptions"
				show-toolbar
				title="选择性别"
				@cancel="onCancel"
				@confirm="onConfirmGender"
			/>
			<!-- 生日选择 -->
			<van-datetime-picker
				v-if="popupType === 'birthday'"
				type="date"
				title="选择生日"
				:min-date="minDate"
				:max-date="maxDate"
				show-toolbar
				@cancel="onCancel"
				@confirm="onConfirmBirthday"
			/>
			<!-- 地区选择 -->
			<van-area
				v-if="popupType === 'area'"
				:area-list="areaList"
				:columns-num="3"
				title="选择地区"
				@cancel="onCancel"
				@confirm="onConfirmArea"
			/>
		</Popup>
		<!-- 头像预览 -->
		<AvatarPreview
			:imgs="[userInfo.userAvatarUrl]"
			v-if="showPreview"
			@close-preview="showPreview = false"
		></AvatarPreview>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { areaList } from '@vant/area-data';
import { scienceMuseumUserUpdateNickName } from '@/api';
export default {
	data() {
		return {
			popupShow: false,
			userName: null,
			avatarUrl: '',
			showPreview: false, // 是否显示预览头像
			popupType: '', // 当前弹出类型：'gender' | 'birthday' | 'area'
			genderOptions: ['男', '女'],
			minDate: new Date(1950, 0, 1).getTime(),
			maxDate: new Date().getTime(),
			areaList
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		...mapState('moduleUser', ['isLogin', 'userInfo'])
	},
	onLoad(options) {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
		this.$store.dispatch('moduleUser/getUserInfo');
	},
	methods: {
		showGeneralPopup(type) {
			this.popupType = type;
			this.$refs.generalPopup.open();
		},
		onCancel() {
			this.$refs.generalPopup.close();
		},
		// 性别选择确认
		async onConfirmGender(value) {
			console.log(value.detail.value);
			const selectedGender = value.detail.value === '男' ? 1 : 0;
			await this.updateUserInfo({ gender: selectedGender }, '性别');
			this.$refs.generalPopup.close();
		},
		// 生日选择确认
		async onConfirmBirthday(event) {
			// 小程序的日期选择事件结构为：event.detail 是时间戳
			const timestamp = event?.detail;
			const date = new Date(timestamp);
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, '0');
			const d = String(date.getDate()).padStart(2, '0');
			const birthday = `${y}-${m}-${d}`;
			await this.updateUserInfo({ birthday }, '生日');
			this.$refs.generalPopup.close();
		},
		// 地区选择确认
		async onConfirmArea({ detail }) {
			const { values } = detail;
			const address = values.map((v) => v.name).join('');
			await this.updateUserInfo({ address }, '地址');
			this.$refs.generalPopup.close();
		},
		async updateUserInfo(patch, fieldName = '信息') {
			try {
				const params = { ...this.userInfo, ...patch };
				const res = await scienceMuseumUserUpdateNickName(params);
				console.log('params', params);
				console.log('res', res);
				// 请求成功后才更新 userInfo
				Object.assign(this.userInfo, patch);
				this.$store.dispatch('moduleUser/getUserInfo');
				this.tipToast(`${fieldName}更新成功`);
				console.log(`${fieldName}更新成功`);
			} catch (err) {
				this.tipToast(`${fieldName}更新失败`);
				console.error(`${fieldName}更新失败`, err);
			}
		},
		previewAvatar() {
			this.showPreview = !this.showPreview;
		},
		// 微信头像选择
		onChooseAvatar(e) {
			const { avatarUrl } = e.detail;
			if (avatarUrl) {
				// 更新前端的头像显示
				this.avatarUrl = avatarUrl;
				// 上传头像到后端
				this.uploadAvatar(avatarUrl);
			}
		},
		// 上传头像至后端
		async uploadAvatar(imgUrl) {
			const token = uni.getStorageSync('token');
			if (!token) return this.tipToast('请先完成登录');

			uni.showLoading({
				title: '正在为您上传',
				mask: true
			});

			try {
				const res = await uni.uploadFile({
					// url: 'https://applet.ecloudeffect.com/api/user/scienceMuseumUserUploadAvatar',
					url: 'https://api.aierkepu.com/api/user/scienceMuseumUserUploadAvatar',
					header: {
						token
					},
					filePath: imgUrl,
					name: 'file'
				});

				const data = JSON.parse(res.data);
				if (data.code === 200) {
					this.$store.dispatch('moduleUser/getUserInfo');
					this.tipToast('头像上传成功');
				} else {
					this.tipToast('头像上传失败，请重试');
				}
			} catch (error) {
				console.log('上传头像出错', error);
				this.tipToast('上传头像出错');
			} finally {
				uni.hideLoading();
			}
		},
		// 提示框
		tipToast(message) {
			uni.showToast({
				title: message,
				icon: 'none',
				duration: 2000
			});
		},
		showPopup() {
			this.popupShow = true;
		},
		formatPhone(phone) {
			if (!phone || phone.length < 7) return phone;
			// 只保留前三位和后四位，中间用 **** 替代
			return phone.slice(0, 3) + '****' + phone.slice(-4);
		},
		async editUserNameConfirm() {
			const regex = /^[A-Za-z0-9\u4e00-\u9fa5]{1,10}$/; // 正则表达式
			// 判断输入是否为空
			if (!this.userName || !this.userName.trim()) {
				uni.showToast({
					title: '用户名不能为空',
					icon: 'none'
				});
				return;
			}
			// 校验用户名
			if (!regex.test(this.userName)) {
				uni.showToast({
					title: '用户名无效，请输入1到10个字母、数字或中文字符',
					icon: 'none'
				});
				return;
			}
			// 校验通过后，调用 updateUserInfo 方法
			try {
				await this.updateUserInfo({ nickName: this.userName }, '昵称');
				this.popupShow = false; // 关闭弹窗
			} catch (err) {
				// 如果 updateUserInfo 里有错误提示，这里不用再提示
				console.error('昵称更新失败', err);
			}
		},
		handleClose() {
			this.userName = null;
			this.popupShow = false;
		},
		logOut() {
			uni.showLoading({
				title: '正在为您退出'
			});
			const logOutInfo = this.$store.dispatch('moduleUser/logOut');
			logOutInfo
				.then(() => {
					uni.switchTab({
						url: '/pages/tabBar/mine/mine'
					});
				})
				.catch((error) => {
					console.error(error);
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	}
};
</script>

<style lang="scss" scoped>
.edit-profile-container {
	width: 100%;
	height: 100vh;
	.edit-profile-wrap {
		width: 100%;
		height: 100vh;
	}
	.edit-main {
		position: absolute;
		margin-left: 50%;
		transform: translateX(-50%);
		z-index: 999;
		width: 85%;
		background-color: transparent;
		.header-box {
			display: flex;
			flex-direction: column;
			align-items: center;
			.profile-pic {
				width: 158rpx;
				height: 158rpx;
				border-radius: 50%;
				overflow: hidden;
				image {
					width: 100%;
					height: 100%;
				}
			}
			.change-avatar {
				margin-top: 32rpx;
				background-color: transparent;
				border: none;
				padding: 0;
				margin: 0;
				color: #bbbbbb;
				font-size: 28rpx;
				cursor: pointer;
			}
			.change-avatar::after {
				border: none !important; /* 强制去除伪元素的边框 */
				content: none; /* 强制去除伪元素 */
			}
		}

		.edit-user-info-box {
			margin-top: 60rpx;
			.title {
				font-size: 34rpx;
				color: #333;
			}
			.init-info {
				font-size: 32rpx;
				color: #7c7e80;
			}
			.nickname,
			.phone,
			.gender,
			.birthday,
			.address {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 40rpx 0 26rpx 0;
				box-sizing: border-box;
				border-bottom: 0.5px solid #f0f0f0;
			}
			.address {
				border: 0;
			}
		}
		.logout {
			width: 85%;
			margin: 60rpx auto 0 auto;
			height: 90rpx;
			line-height: 90rpx;
			color: #fff;
			border-radius: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #32579c;
		}
	}
}

::v-deep .van-overlay {
	display: none;
}
::v-deep .van-popup {
	z-index: 99999 !important;
}
::v-deep .van-cell {
	padding: 0 40rpx;
	box-sizing: border-box;
	position: static;
	input {
		border: none;
	}
}
::v-deep .van-field__body {
	margin-top: 5%;
}

.btn-box {
	font-size: 40rpx;
	padding: 24rpx 40rpx;
	box-sizing: border-box;
	.btn-content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding-bottom: 20rpx;
		box-sizing: border-box;
		text:first-child {
			color: #bbbbbb;
		}
		text:nth-child(2) {
			color: #02c6a2;
		}
	}
}
.tips {
	position: absolute;
	bottom: 60rpx;
	left: 40rpx;
	color: #bbbbbb;
	font-size: 24rpx;
}
</style>
