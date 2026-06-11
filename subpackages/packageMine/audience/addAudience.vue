<template>
	<view class="add-members-container">
		<CustomNavInner title="常用观众" />
		<view class="member-box" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view class="col-1">
				<text>成员</text>
			</view>
			<view class="col-2">
				<text>姓名</text>
				<input
					v-model="memberName"
					type="text"
					placeholder="请输入添加成员姓名"
					maxlength="10"
					class="name-input"
				/>
			</view>
			<view class="col-2">
				<text>性别</text>
				<view class="gender-value">
					<view class="boy-box" @click="chooseGender(1)">
						<image :src="boyImg" mode="widthFix"></image>
						<text class="boy-txt" :class="gender === 1 ? 'boy-color' : 'boy-default-color'">男</text>
					</view>
					<view class="girl-box" @click="chooseGender(0)">
						<image :src="girlImg" mode="widthFix"></image>
						<text :class="gender === 0 ? 'girl-color' : 'girl-default-color'">女</text>
					</view>
				</view>
			</view>
			<view class="col-2" @click="showbirthdayPopup = true">
				<text>生日</text>
				<text>{{ birthday }}</text>
			</view>
			<view class="btn-wrap">
				<button type="default" class="cancel-btn" @click="back()">返回</button>
				<button type="primary" class="confirm-btn" @click="confirm()">确认</button>
			</view>
		</view>
		<van-popup :show="showbirthdayPopup" round @close="showbirthdayPopup = false">
			<van-datetime-picker
				:value="currentDate"
				type="date"
				title="生日"
				:min-date="minDate"
				:max-date="maxDate"
				@confirm="confirmBirthday"
				@cancel="showbirthdayPopup = false"
			/>
		</van-popup>
	</view>
</template>

<script>
import myData from '@/data/mine.json';
import { mapState } from 'vuex';
import { addMember } from '@/api';

export default {
	data() {
		const now = new Date();
		return {
			memberName: null,
			birthday: '',
			gender: 0,
			showbirthdayPopup: false,
			minDate: new Date(1945, 0, 1).getTime(),
			maxDate: now.getTime(),
			currentDate: now.getTime()
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		boyImg() {
			return this.gender === 0
				? myData.editGenderIcon[0].boyIcon[0].url
				: myData.editGenderIcon[0].boyIcon[1].url;
		},
		girlImg() {
			return this.gender === 1
				? myData.editGenderIcon[1].girlIcon[0].url
				: myData.editGenderIcon[1].girlIcon[1].url;
		}
	},
	onLoad() {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
	},
	methods: {
		back() {
			const pages = getCurrentPages(); // 获取页面栈
			if (pages.length > 1) {
				// 有上一页，返回
				uni.navigateBack({
					delta: 1
				});
			} else {
				// 没有上一页，跳转到首页
				uni.reLaunch({
					url: '/pages/tabBar/home/home' // 根据你的首页路径修改
				});
			}
		},
		confirm() {
			if (!this.memberName) {
				uni.showToast({
					title: '成员姓名不能为空',
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			if (!this.birthday) {
				uni.showToast({
					title: '请提交您的生日',
					duration: 3000,
					icon: 'none'
				});
				return;
			}
			addMember({
				name: this.memberName,
				birthday: this.birthday,
				sex: this.gender
			}).then((res) => {
				if (res.code === 200 && res.message == '添加成功') {
					uni.redirectTo({
						url: '/subpackages/packageMine/audience/audienceManage'
					});
				}
			});
		},
		chooseGender(type) {
			this.gender = type;
		},
		confirmBirthday(event) {
			const date = new Date(event.detail);
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			const day = date.getDate();
			const formattedDate = `${year}年${month}月${day}日`;
			this.birthday = formattedDate;
			this.showbirthdayPopup = false;
		},
		validateInput(fieldName, value) {
			const allowedRegex = /^[a-zA-Z\u4e00-\u9fa5\s]*$/;
			if (!allowedRegex.test(value)) {
				this[fieldName] = value.replace(/[^a-zA-Z\u4e00-\u9fa5\s]/g, '');
				uni.showToast({
					title: '只能输入英文或中文，不允许特殊符号或数字',
					duration: 3000,
					icon: 'none'
				});
			} else {
				this[fieldName] = value;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.add-members-container {
	position: absolute;
	width: 100%;
	height: 100vh;
	overflow-y: auto;
	padding-bottom: 20px;
	box-sizing: border-box;
}

.member-box {
	position: absolute;
	width: 92%;
	margin-left: 50%;
	transform: translateX(-50%);
	background: #fff;
	border-radius: 12px;
	padding: 0 24px 15px 24px;
	box-sizing: border-box;
	font-size: 28rpx;
}

.member-box .col-1 {
	padding-top: 22px;
	box-sizing: border-box;
	font-weight: 550;
}

.member-box .col-1 text {
	color: #32579c;
}

.boy-color {
	color: #4395ff;
}

.girl-color {
	color: #ff3ec9;
}

.boy-default-color,
.girl-default-color {
	color: #595757;
}

.member-box .col-2 {
	padding: 22px 0;
	box-sizing: border-box;
	border-bottom: 1px solid #bbbbbb;
	color: #333;
	font-weight: 550;
	display: flex;
	align-items: center;
}

.member-box .col-2 text:nth-child(1) {
	white-space: nowrap;
	margin-right: 30px;
}

.member-box .col-2 .gender-value {
	display: flex;
	align-items: center;
}

.member-box .col-2 .gender-value .boy-box,
.member-box .col-2 .gender-value .girl-box {
	display: flex;
	align-items: center;
}

.member-box .col-2 .gender-value .boy-txt {
	margin-right: 25px;
}

.member-box .col-2 .gender-value image {
	display: inline-block;
	margin-right: 10px;
	width: 13px;
	height: 13px;
}

.name-input {
	flex: 1;
	font-size: 14px;
	padding: 0;
}

.btn-wrap {
	margin-top: 24px;
	display: flex;
	justify-content: space-between;
}

.btn-wrap button {
	width: 46%;
	font-size: 18px;
	border-radius: 50rpx;
}

.cancel-btn {
	background-color: #fff;
	color: #bbbbbb;
	border: 1px solid #bbbbbb;
}

.confirm-btn {
	background-color: #32579c;
	color: #fff;
}

/deep/ .van-popup {
	position: fixed;
	width: 70%;
}
</style>
