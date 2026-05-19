<template>
	<view class="team-reservation-container">
		<view class="txt-1">{{ requestResult.activityName }}</view>
		<view class="txt-2">
			<text class="txt-2-1">进行中</text>
			<text class="txt-2-2">{{ requestResult.endTime }} 结束</text>
		</view>

		<view class="tip-title-1">
			<view>预约说明：</view>
			<view>研学合作仅供学校、团队组织等填写，以便在线提前申请参观时间。</view>
		</view>

		<!-- https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/template_regist_team.xlsx -->
		<!-- debug -->
		<view class="download-card">
			<view class="download-left">
				<view class="download-title"> 《爱尔眼健康科普教育基地团队预约填写模板》 </view>
			</view>

			<van-button size="small" round type="primary" color="#32579c" @click="isShowFilePopup = true">
				下载
			</van-button>
		</view>
		<van-popup :show="isShowFilePopup" round position="bottom" @close="isShowFilePopup = false">
			<view class="file-popup">
				<view class="popup-title"> 文件下载 </view>

				<view class="popup-tip"> 预览文件，发送到微信文件传输助手 </view>

				<van-button block round type="primary" color="#32579c" @click="previewFile"> 预览文件 </van-button>

				<!-- <van-button block round plain color="#32579c" @click="downloadFile"> 下载文件 </van-button> -->

				<van-button block round @click="isShowFilePopup = false"> 返回 </van-button>
			</view>
		</van-popup>

		<view class="divider" />
		<view class="date-picker-title">日期选择</view>

		<view class="date-picker-wrap">
			<!-- debug -->
			<DatePicker :disabled-weekdays="[1]" :selected-cal="selectedCal" @date-selected="handleDateSelected" />
			<view class="calendar-trigger" @click="isShowCal = true">
				<van-icon name="calendar-o" />
				<van-icon name="arrow-down" />
			</view>
		</view>
		<CalendarPick
			:show-popup="isShowCal"
			:what-a-day="date"
			@closePopup="handleCalendarClose"
			@selectCal="handleSelectCal"
		/>

		<view class="divider" />
		<view class="time-slot-title">时段选择</view>
		<view class="tip-title-2">每时段报名满15人将自动成团，我馆提供科普讲解服务。</view>
		<view class="morning-title">上午时段</view>

		<!-- debug -->
		<TimeSlotPicker
			:timeSlotList="timeSlotList"
			:selectedTimeSlotIndex="selectedTimeSlotIndex"
			:needTimeSlotRequest="false"
			:select-day="date"
			@timeSlotSelected="handleTimeSlotSelected"
		/>

		<view class="team-submits-info-box">
			<van-field
				label="领队姓名"
				type="text"
				maxlength="8"
				placeholder="请输入领队者姓名"
				:value="leaderName"
				:error-message="leaderNameError"
				@input="validateInput('leaderName', $event)"
			/>
			<van-field
				label="手机号码"
				type="tel"
				maxlength="11"
				placeholder="请输入联系手机号码"
				:value="phoneNumber"
				:error-message="phoneNumberError"
				@input="phoneNumber = $event.detail"
			/>
			<van-field
				label="单位名称"
				type="text"
				maxlength="20"
				placeholder="请输入单位名称"
				:value="unitName"
				:error-message="unitNameError"
				@input="validateInput('unitName', $event)"
			/>
			<van-field
				label="参观人数"
				type="digit"
				maxlength="5"
				placeholder="参观人数宜在15-50之间"
				:value="visitorsNumber"
				:error-message="visitorsNumberError"
				@input="visitorsNumber = $event.detail"
			/>
		</view>

		<view class="upload-card">
			<view class="upload-title"> 预约上传文件 </view>
			<view class="upload-desc"> 仅支持 Excel 文件（xls、xlsx） </view>
			<view class="upload-desc"> 文件大小不超过 20MB </view>
			<view class="upload-btn" @click="chooseExcelFile"> 点击上传文件 </view>
			<view v-if="uploadedFileName" class="uploaded-file"> 已上传：{{ uploadedFileName }} </view>
		</view>

		<OnlineAsk :askInfo="askInfo" />

		<view class="submit-btn">
			<button class="custom-button" @click="submit()">确认提交</button>
		</view>

		<!-- debug -->
		<!-- <ReservationPopup :show="showReservationPopup" @close="handlePopupClose" /> -->

		<van-dialog id="van-dialog" />
	</view>
</template>

<script>
import { mapState } from 'vuex';
import myData from '@/data/appointment.json';
import Dialog from '@/wxcomponents/vant/dialog/dialog';
import {
	getReservationTimeSlot,
	getReservationWeekNumbers,
	personalActivityReservation,
	teamReservation
} from '@/api/index';

export default {
	data() {
		return {
			title: '',
			requestResult: {},

			showReservationPopup: true,
			date: null,
			week: null,
			timeSlotList: [],
			selectedTimeSlot: null,
			selectedTimeSlotIndex: 0,
			leaderName: null,
			phoneNumber: null,
			unitName: null,
			visitorsNumber: null,
			askInfo: myData[1],

			isShowCal: false,
			isShowFilePopup: false,

			// 错误提示字段
			leaderNameError: '',
			phoneNumberError: '',
			unitNameError: '',
			visitorsNumberError: '',

			selectedCal: null,

			uploadedFile: null,
			uploadedFileName: '',
			templateUrl: 'https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/template_regist_team.xlsx'
		};
	},
	computed: {
		...mapState('moduleActivity', ['selectedActivity'])
	},
	methods: {
		async getDetailData() {
			console.log('报名详情数据', this.selectedActivity);
			this.requestResult = this.selectedActivity;
		},
		handlePopupClose() {
			this.showReservationPopup = false;
		},
		handleDateSelected({ date, week }) {
			this.date = date;
			this.week = week;
		},
		handleTimeSlotSelected(slot, index) {
			this.selectedTimeSlot = slot;
			this.selectedTimeSlotIndex = index;
		},
		handleCalendarClose() {
			this.isShowCal = false;
		},
		handleSelectCal(res) {
			this.selectedCal = res;
		},
		previewFile() {
			uni.showLoading({
				title: '加载中'
			});

			const fileName = '爱尔眼健康科普教育基地团队预约填写模板.xlsx';

			uni.downloadFile({
				url: this.templateUrl,

				success: (res) => {
					if (res.statusCode === 200) {
						const fs = uni.getFileSystemManager();

						// 小程序本地路径
						const newPath = `${wx.env.USER_DATA_PATH}/${fileName}`;

						// 复制并重命名
						fs.copyFile({
							srcPath: res.tempFilePath,
							destPath: newPath,

							success: () => {
								uni.openDocument({
									filePath: newPath,
									showMenu: true
								});
							}
						});
					}
				},

				complete: () => {
					uni.hideLoading();
				}
			});
		},
		chooseExcelFile() {
			console.log('chooseExcelFile');

			wx.chooseMessageFile({
				count: 1,
				type: 'file',
				extension: ['xls', 'xlsx'],

				success: (res) => {
					const file = res.tempFiles[0];

					const maxSize = 20 * 1024 * 1024;

					if (file.size > maxSize) {
						this.$toast({
							message: '文件不能超过20MB'
						});

						return;
					}

					const fileName = file.name.toLowerCase();

					const isExcel = fileName.endsWith('.xls') || fileName.endsWith('.xlsx');

					if (!isExcel) {
						this.$toast({
							message: '仅支持Excel文件'
						});

						return;
					}

					this.uploadedFile = file;

					this.uploadedFileName = file.name;

					this.$toast({
						message: '上传成功'
					});
				},
				fail: (err) => {
					console.log(err);
				}
			});
		},
		getReservationTimeSlotData() {
			getReservationTimeSlot().then((res) => {
				this.timeSlotList = res.data;
				console.log('四个时间段的时间数据', this.timeSlotList);
			});
		},
		validateInput(fieldName, event) {
			const value = event.detail;
			const allowedRegex = /^[a-zA-Z\u4e00-\u9fa5\s]*$/;
			if (!allowedRegex.test(value)) {
				this[fieldName] = value.replace(/[^a-zA-Z\u4e00-\u9fa5\s]/g, '');
				uni.showToast({
					title: '只能输入英文或中文，不允许特殊符号或数字',
					icon: 'none',
					duration: 3000
				});
			} else {
				this[fieldName] = value;
			}
		},
		// todo: 修改成团队活动的提交
		submit() {
			this.leaderNameError = '';
			this.phoneNumberError = '';
			this.unitNameError = '';
			this.visitorsNumberError = '';

			const nameRegex = /^[a-zA-Z\u4e00-\u9fa5\s]{1,20}$/;
			const phoneRegex = /^1[3-9]\d{9}$/;
			const visitors = Number(this.visitorsNumber);

			if (!this.leaderName) {
				this.leaderNameError = '领队者姓名不能为空';
				return;
			} else if (!nameRegex.test(this.leaderName)) {
				this.leaderNameError = '姓名只能包含中文或英文';
				return;
			}

			if (!this.phoneNumber) {
				this.phoneNumberError = '手机号不能为空';
				return;
			} else if (!phoneRegex.test(this.phoneNumber)) {
				this.phoneNumberError = '手机号格式错误';
				return;
			}

			if (!this.unitName) {
				this.unitNameError = '单位名称不能为空';
				return;
			} else if (!nameRegex.test(this.unitName)) {
				this.unitNameError = '单位名称只能包含中文或英文';
				return;
			}

			if (!this.visitorsNumber) {
				this.visitorsNumberError = '参观人数不能为空';
				return;
			} else if (isNaN(visitors) || visitors < 15 || visitors > 50) {
				this.visitorsNumberError = '参观人数需在15-50之间';
				return;
			}

			uni.showLoading({
				title: '提交中...',
				mask: true
			});

			const delayPromise = new Promise((resolve) => {
				setTimeout(resolve, 1500);
			});

			Promise.all([
				teamReservation({
					name: this.leaderName,
					phone: this.phoneNumber,
					unitName: this.unitName,
					colleagues: this.visitorsNumber,
					dateTime: this.date,
					week: this.week,
					timeSlot: this.selectedTimeSlot
				}),
				delayPromise
			])
				.then(([res]) => {
					if (res.code === 200 && res.message == '您已成功预约') {
						Dialog.alert({
							message: '您已成功预约',
							theme: 'round-button',
							confirmButtonText: '我知道了'
						}).then(() => {
							const pages = getCurrentPages();
							if (pages.length > 1) {
								uni.navigateBack({
									delta: 1
								});
							} else {
								uni.reLaunch({
									url: '/pages/tabBar/home/home'
								});
							}
						});
					} else {
						this.$toast({
							duration: 3000,
							message: res.message
						});
					}
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	},
	onLoad() {
		this.getDetailData();
		this.getReservationTimeSlotData();
	}
};
</script>

<style lang="scss">
.team-reservation-container {
	width: 100%;
	height: 100%;
	overflow-y: auto;
	box-sizing: border-box;
	background-color: #f8f9ff;
	padding: 40rpx 4% 100rpx 4%;

	.txt-1 {
		color: #333;
		font-size: 32rpx;
		font-weight: 550;
		margin-top: 20rpx;
	}
	.txt-2 {
		display: flex;
		align-items: center;
		white-space: nowrap;
		font-size: 20rpx;
		margin-top: 8rpx;
		.txt-2-1 {
			color: #02c6a2;
		}
		.txt-2-2 {
			color: #7c7e80;
			margin-left: 16rpx;
			display: inline-block;
		}
	}
}

.date-picker-title {
	width: 100%;
	margin: 40rpx auto;
	color: #2a2a2a;
	font-size: 36rpx;
}

.tip-title-1 {
	width: 94%;
	margin: 30rpx 0 0 0;
	box-sizing: border-box;
	color: #7f7f7f;
	font-size: 28rpx;

	view:first-child {
		margin-bottom: 20rpx;
	}
	view:nth-child(2) {
		line-height: 1.5;
	}
}

.tip-title-2 {

	width: 94%;
	line-height: 1.5;
	margin: 0 ;
	color: #32579c;
	font-size: 28rpx;
}

.divider {
	height: 1px;
	background-color: #eaeaea;
	margin: 30rpx 0;
}

.download-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 0;
	margin-top: 24rpx;
	border-radius: 24rpx;
	background: #f5f7fb;
}

.download-left {
	flex: 1;
	margin-right: 20rpx;
}

.download-title {
	line-height: 1.5;
	color: #2a2a2a;
	font-size: 28rpx;
	font-weight: bold;
}

.file-popup {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	padding: 40rpx 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
}

.popup-title {
	margin-bottom: 12rpx;
	color: #2a2a2a;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
}

.popup-tip {
	line-height: 1.7;
	margin: 12rpx 0 28rpx;
	color: #888;
	text-align: center;
	font-size: 24rpx;
}

.upload-card {
	padding: 28rpx 0;
	margin: 24rpx 0;
	border-radius: 24rpx;
	background: #f5f7fb;
}

.upload-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #2a2a2a;
}

.upload-desc {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #888;
	line-height: 1.6;
}

.upload-btn {
	margin-top: 24rpx;

	height: 84rpx;
	line-height: 84rpx;

	text-align: center;

	border-radius: 999rpx;

	background: #32579c;
	color: #fff;

	font-size: 28rpx;
}

.uploaded-file {
	margin-top: 20rpx;

	font-size: 24rpx;
	color: #32579c;

	word-break: break-all;
}

.date-picker-wrap {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	gap: 20rpx;
}

.calendar-trigger {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.time-slot-title {
	width: 94%;
	margin: 40rpx 0 16rpx;
	color: #2a2a2a;
	font-size: 36rpx;
}

.morning-title {
	width: 94%;
	margin: 40rpx 0;
	color: #2a2a2a;
	font-size: 36rpx;
}

.team-submits-info-box {
	width: 100%;
	padding: 30rpx;
	margin: 40rpx 0;
	overflow: hidden;
	border-radius: 24rpx;
	box-sizing: border-box;
	background-color: #fff;

	.uni-forms-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.uni-forms-item__label {
			color: #2a2a2a;
			font-size: 28rpx;
			width: 160rpx !important;
		}
	}
}

.submit-btn {
	width: 100%;
	margin: 60rpx auto 0 auto;
	padding-bottom: 60rpx;
	box-sizing: border-box;

	.custom-button {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 40rpx;
		border-radius: 50rpx;
		color: #fff;
		background-color: #32579c;
	}
}

::v-deep .van-dialog {
	top: 83% !important;
	color: #434343;
	font-size: 56rpx;
}
::v-deep .van-dialog__message-text {
	color: #434343;
	font-size: 45rpx;
}
::v-deep .van-dialog__message {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 90rpx;
	padding: 40rpx 0;
}
::v-deep .van-button--danger {
	background: #32579c !important;
	height: 90rpx;
	font-size: 18px;
	color: #fff !important;
}
</style>
