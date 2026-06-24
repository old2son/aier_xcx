<template>
	<view class="member-manage-container">
		<CustomNavInner title="常用观众" />
		<view class="member-manage-main" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<template v-if="memberList && memberList.length > 0">
				<view
					class="member-item"
					:class="{ 'member-item-selected': isSelected(item) }"
					v-for="(item, index) in memberList"
					:key="item.id"
					@click="toggleSelect(item)"
				>
					<view class="col-1">
						<text>成员</text>
						<view class="col-act">
							<text class="select-txt">{{ isSelected(item) ? '已选择' : '点击选择' }}</text>
							<text @click.stop="deleteMember(item.id)">删除成员</text>
						</view>
					</view>
					<view class="col-2">
						<text>姓名</text>
						<text>{{ item.userName || '--' }}</text>
					</view>
					<view class="col-2">
						<text>年龄</text>
						<text>{{ item.userAge || '--' }}</text>
					</view>
					<view class="col-2">
						<text>联系方式</text>
						<text>{{ maskPhone(item.userPhone) }}</text>
					</view>
					<view class="col-2">
						<text>证件类型</text>
						<text>{{ item.documentType || '--' }}</text>
					</view>
					<view class="col-2">
						<text>证件号码</text>
						<text>{{ maskCertificate(item.idNumber) }}</text>
					</view>
					<!-- <view class="col-2">
						<text>性别</text>
						<view class="gender-value">
							<image :src="getBoyImg(item.sex)" mode="widthFix"></image>
							<text class="boy-txt" :class="item.sex === 1 ? 'boy-color' : 'boy-default-color'">男</text>
							<image :src="getGirlImg(item.sex)" mode="widthFix"></image>
							<text :class="item.sex === 0 ? 'girl-color' : 'girl-default-color'">女</text>
						</view>
					</view>
					<view class="col-2">
						<text>生日</text>
						<text>{{ item.birthday }}</text>
					</view> -->
				</view>
			</template>
			<view class="member-btn">
				<button class="custom-button" :disabled="memberList && memberList.length >= 5" @click="toAddmember()">
					+ 添加成员
				</button>

				<button class="back-button" @click="back()">确认导入所选成员</button>
			</view>
		</view>
	</view>
</template>

<script>
import myData from '@/data/mine.json';
import { mapState, mapMutations } from 'vuex';
import { getMembers, deleteMember } from '@/api/index';
import { normalizeAudienceList } from '@/store/modules/moduleAudience';

export default {
	data() {
		return {
			memberList: []
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		...mapState('moduleAudience', ['selectedAudienceList'])
	},
	methods: {
		...mapMutations('moduleAudience', ['setSelectedAudienceList']),
		back() {
			uni.navigateBack({
				delta: 1
			});
		},
		getBoyImg(sex) {
			return sex === 0 ? myData.editGenderIcon[0].boyIcon[0].url : myData.editGenderIcon[0].boyIcon[1].url;
		},
		getGirlImg(sex) {
			return sex === 1 ? myData.editGenderIcon[1].girlIcon[0].url : myData.editGenderIcon[1].girlIcon[1].url;
		},
		maskPhone(value) {
			if (!value) {
				return '--';
			}

			const phone = String(value);
			if (phone.length <= 7) {
				return phone;
			}

			return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
		},
		maskCertificate(value) {
			if (!value) {
				return '--';
			}

			const text = String(value);
			if (text.length <= 4) {
				return text;
			}
			if (text.length <= 8) {
				return `${text.slice(0, 2)}***${text.slice(-2)}`;
			}

			return `${text.slice(0, 3)}********${text.slice(-4)}`;
		},
		isSelected(item) {
			return this.selectedAudienceList.some((selectedItem) => selectedItem.id === item.id);
		},
		toggleSelect(item) {
			const nextList = [...this.selectedAudienceList];
			const currentIndex = nextList.findIndex((selectedItem) => selectedItem.id === item.id);
			if (currentIndex > -1) {
				nextList.splice(currentIndex, 1);
			} else {
				nextList.push({ ...item });
			}
			this.setSelectedAudienceList(nextList);
		},
		getMemberInfo() {
			uni.showLoading({
				title: '加载中'
			});
			getMembers()
				.then((res) => {
					this.memberList = normalizeAudienceList(res.data);
					const nextSelectedList = this.selectedAudienceList
						.map((selectedItem) => this.memberList.find((item) => item.id === selectedItem.id))
						.filter(Boolean);
					this.setSelectedAudienceList(nextSelectedList);
				})
				.finally(() => {
					setTimeout(() => {
						uni.hideLoading();
					}, 800);
				});
		},
		deleteMember(id) {
			uni.showModal({
				title: '温馨提示',
				content: '您是否确定删除该成员信息',
				confirmText: '确定',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.showLoading({
							title: '删除中'
						});
						deleteMember({
							id: id
						}).then((res) => {
							if (res.code === 200 && res.message === '删除成功') {
								const nextSelectedList = this.selectedAudienceList.filter((item) => item.id !== id);
								this.setSelectedAudienceList(nextSelectedList);
								this.getMemberInfo();
								uni.showToast({
									title: '删除成功',
									duration: 3000,
									icon: 'none'
								});
							}
						});
					}
				}
			});
		},
		toAddmember() {
			if (this.memberList.length >= 5) {
				uni.showToast({
					title: '最多添加5个成员',
					duration: 3000,
					icon: 'none'
				});
			}

			uni.navigateTo({
				url: '/subpackages/packageMine/audience/addAudience'
			});
		}
	},
	onLoad() {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
	},
	onShow() {
		this.getMemberInfo();
	},
};
</script>

<style lang="scss" scoped>
.member-manage-container {
	width: 100%;
	height: 100vh;
	overflow-y: auto;
	padding-bottom: 20px;
	box-sizing: border-box;
}

.member-manage-main {
	position: absolute;
	width: 92%;
	margin-left: 50%;
	transform: translateX(-50%);
	z-index: 999;
	padding-bottom: 20px;
	box-sizing: border-box;
}

.member-item {
	background: #fff;
	border-radius: 12px;
	font-size: 14px;
	padding: 0 24px;
	box-sizing: border-box;
	margin: 30px auto;
	border: 2rpx solid transparent;
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease;
}

.member-item-selected {
	border-color: #8fb8ff;
	box-shadow: 0 10rpx 24rpx rgba(50, 87, 156, 0.08);
}

.member-item .col-1 {
	display: flex;
	justify-content: space-between;
	padding-top: 22px;
	box-sizing: border-box;
	font-weight: 550;
}

.member-item .col-1 text:nth-child(1) {
	color: #32579c;
}

.member-item .col-1 text:nth-child(2) {
	color: #fd7d7d;
}

.col-act {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.select-txt {
	color: #32579c !important;
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

.member-item .col-2 {
	padding: 22px 0;
	box-sizing: border-box;
	border-bottom: 1px solid #bbbbbb;
	color: #333;
	font-weight: 550;
	display: flex;
	align-items: center;
}

.member-item .col-2 text:nth-child(1) {
	margin-right: 30px;
}

.member-item .col-2 .gender-value {
	display: flex;
	align-items: center;
}

.member-item .col-2 .gender-value .boy-txt {
	margin-right: 25px;
}

.member-item .col-2 .gender-value image {
	display: inline-block;
	margin-right: 10px;
	width: 13px;
	height: 13px;
}

.member-item .col-2:last-child {
	border: none;
}

.member-btn {
	margin-top: 30px;
	box-sizing: border-box;
	text-align: center;
	font-weight: 550;
}
button::after {
	display: none;
}

.custom-button {
	width: 100%;
	overflow: hidden;
	border-radius: 12px;
	color: #32579c;
	background-color: #fff;
}

.back-button {
	width: 100%;
	margin: 30rpx 0;
	overflow: hidden;
	border-radius: 12px;
	color: #fff;
	background-color: #32579c;
}

.delete-dialog {
	font-size: 14px;
}
</style>
