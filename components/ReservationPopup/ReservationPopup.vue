<template>
	<van-popup
		round
		position="center"
		:show="showPopup"
		:close-on-click-overlay="false"
		custom-style="width:85%;height:90%"
	>
		<view class="personal" v-if="type === 0">
			<view class="tips-title">温馨提示</view>
			<view class="tips-content">
				<view class="h2-tl">（一）开放时间</view>
				<text class="overview"
					>预约须知中的开放时间修改为上午 08:30-12:00 下午 14:30-17:00（17:00后停止入馆）</text
				>
				<view class="h2-tl">（二）个人预约规则</view>
				<view class="tips-img">
					<image
						mode="widthFix"
						src="https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/personal_tips.png"
					></image>
				</view>

				<!-- <view class="h3-tl">1.预约对象</view>
				<view class="ul">
					<view class="li">·所有社会公众个人及家庭（14岁以下未成年人需由成人陪同）</view>
					<view class="li">·个人预约每单最多可预约5人（含预约者本人）</view>
				</view>

				<view class="h3-tl">2.预约方式与时间</view>
				<view class="ul">
					<view class="li">·通过本微信公众号预约平台进行实名预约</view>
					<view class="li">·可预约未来15日内参观名额（含当日）</view>
					<view class="li">·活动预约与参观预约共享名额，请勿在统一时段重复预约</view>
					<view class="li">·节假日预约请关注平台特殊公告</view>
				</view>

				<view class="h3-tl">3.预约流程</view>
				<view class="ul">
					<view class="li"
						>·微信授权登录→选择参观日期与时段→填写所有参观者实名信息→提交预约→获得闸机二维码</view
					>
				</view>

				<view class="h3-tl">4.入场核验</view>
				<view class="ul">
					<view class="li">·凭闸机二维码扫入口处描闸机入场</view>
					<view class="li">·预约信息与证件信息必须一致</view>
					<view class="li">·按预约时段提前10分钟到达，逾期未到视为爽约</view>
				</view>

				<view class="h3-tl">5.取消与修改</view>
				<view class="ul">
					<view class="li">·如需修改或取消，请于参观前24小时在平台操作</view>
					<view class="li">·每人每月限取消3次，超过将影响后续预约</view>
				</view> -->

				<van-checkbox :value="checked" shape="square" @change="toggleCheckbox"
					>我已阅读并同意温馨提示内容</van-checkbox
				>
				<van-button
					round
					color="#32579c"
					size="large"
					:disabled="!checked"
					@click="confirmPopup"
					custom-style="margin-top: 40rpx"
					>我知道了</van-button
				>
			</view>
		</view>
		<view class="team" v-if="type === 1">
			<view class="tips-title">温馨提示</view>
			<view class="tips-content">
				<view class="h2-tl">（一）开放时间</view>
				<text class="overview"
					>预约须知中的开放时间修改为上午 08:30-12:00 下午14:30-17:00（17:00后停止入馆）</text
				>
				<view class="h2-tl">（二）团队预约规则</view>
				<view class="tips-img">
					<image
						mode="widthFix"
						src="https://geducloud0617.oss-cn-shenzhen.aliyuncs.com/aier-applet/team_tips.png"
					></image>
				</view>

				<!-- <view class="h3-tl">1.预约对象与人数要求</view>
				<view class="ul">
					<view class="li">·学校、企事业单位、社区组织、旅行社等团体组织</view>
					<view class="li"
						>·<view class="bold">最低成团人数：15人，最高不超过50人</view>（特殊安排需提前联系）</view
					>
				</view>

				<view class="h3-tl">2.注册与预约流程</view>
				<view class="ul">
					<view class="li">·<view class="bg-blue">步骤一</view>：微信授权登录</view>
					<view class="li">·<view class="bg-blue">步骤二</view>：领队信息填写</view>
					<view class="li"
						>·<view class="bg-blue">步骤三</view>：下载报名表模板
						<view class="li-sub">下载本平台提供的《团队参观报名表》Excel模板</view>
					</view>
					<view class="li"
						>·<view class="bg-blue">步骤四</view>：上传报名表
						<view class="li-sub">严格按照模板填写所有成员信息（信息不符将导致审核不通过）</view>
					</view>
					<view class="li"
						>·<view class="bg-blue">步骤五</view>：提交预约
						<view class="li-sub">选择参观日期、时段</view>
						<view class="li-sub">提交预约申请</view>
					</view>
					<view class="li"
						>·<view class="bg-blue">步骤六</view>：领队确认
						<view class="li-sub">领队将收到确认短信及团队二维码</view>
						<view class="li-sub">参观当日，领队凭团队二维码及团队成员名单入场</view>
						<view class="li-sub">工作人员将核验实际人数</view>
					</view>
				</view>

				<view class="h3-tl">3.取消与爽约规则</view>
				<view class="ul">
					<view class="li"
						>·<view class="bg-blue">信息真实性</view>：请务必如实填写所有信息，信息不符会导致预约无效
					</view>
					<view class="li"
						>·<view class="bg-blue">取消预约</view>：如需取消，需至少在参观前3个自然日通过系统操作
					</view>
					<view class="li"
						>·<view class="bg-blue">爽约处理</view>：
						<view class="li-sub">未按时到达且未提前取消，视为爽约</view>
						<view class="li-sub">遇极端天气等特殊情况，请及时联系客服处理</view>
					</view>
				</view>

				<view class="h3-tl">4.团队参观特别提示</view>
				<view class="ul">
					<view class="li">·团队需提前10分钟到达，进行签到准备和注意事项讲解</view>
					<view class="li">·团队参观期间请保持秩序，服从场馆工作人员引导</view>
					<view class="li">·活动预约与参观预约共享名额，请勿在统一时段重复预约</view>
				</view> -->

				<van-checkbox :value="checked" shape="square" @change="toggleCheckbox"
					>我已阅读并同意温馨提示内容</van-checkbox
				>
				<van-button
					round
					color="#32579c"
					size="large"
					:disabled="!checked"
					@click="confirmPopup"
					custom-style="margin-top: 40rpx"
					>我知道了</van-button
				>
			</view>
		</view>
	</van-popup>
</template>

<script>
export default {
	name: 'ReservationPopup',
	options: {
		styleIsolation: 'shared'
	},
	props: {
		show: {
			type: Boolean,
			default: true
		},
		type: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			showPopup: this.show, // 内部控制弹出层显示状态
			checked: false // 默认未勾选
		};
	},
	watch: {
		show(val) {
			this.showPopup = val; // 父组件状态变化时更新内部状态
		}
	},
	methods: {
		toggleCheckbox() {
			this.checked = !this.checked;
		},
		confirmPopup() {
			// 通知父组件关闭弹出层
			this.$emit('close');
			this.innerShow = false;
		}
	}
};
</script>

<style lang="scss" scoped>
.popup-content {
	width: 85%;
	max-width: 870rpx;
	height: 90%;
	border-radius: 24rpx;
	background-color: #fff;
	display: flex;
	flex-direction: column;
}

.tips-title {
	position: sticky;
	top: 0;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30rpx 0;
	letter-spacing: 6rpx;
	border-radius: 24rpx 24rpx 0 0;
	text-align: center;
	color: #fff;
	font-size: 40rpx;
	background-color: #004ea2;
}

.tips-content {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 90%;
	padding: 0 48rpx 5%;
	overflow-y: auto;
	box-sizing: border-box;
	color: #333;

	.tips-img {
		margin: 0 -24rpx;

		image {
			width: 100%;
			max-width: 100%;
			height: auto;
		}
	}
}

.personal {
	.h1-tl,
	.h2-tl,
	.h3-tl {
		color: #ff9400;
	}
}

.team {
	.bold {
		display: inline;
		font-weight: 600;
	}

	.bg-blue {
		display: inline;
		background-color: #eef5ff;
	}

	.li-sub {
		position: relative;
		margin-left: 24rpx;
		padding-left: 24rpx;
		line-height: 1.8;
		color: #5f6f85;
		font-size: 26rpx;
	}

	.li-sub::before {
		position: absolute;
		left: 0;
		top: 24rpx;
		width: 6rpx;
		height: 6rpx;
		content: '';
		transform: translateY(-50%) rotate(45deg);
		background-color: #5f6f85;
	}
}

.team {
	.h1-tl,
	.h2-tl,
	.h3-tl {
		color: #4794ff;
	}
}

.h1-tl {
	padding: 8% 0 4%;
	font-size: 36rpx;
	text-align: center;
	color: #004ea2;
}

.h2-tl {
	text-align: center;
	font-weight: 600;
	margin-top: 40rpx;
}

.h3-tl {
	font-weight: 600;
	margin-top: 32rpx;
}

.overview {
	display: block;
	line-height: 1.6;
	margin-top: 16rpx;
	color: #555;
	font-weight: 400;
	font-size: 26rpx;
	font-family:
		-apple-system, 'PingFang SC', 'Heiti SC', 'Microsoft YaHei', '微软雅黑', 'Noto Sans CJK SC',
		'Source Han Sans CN', sans-serif;
}

.txt {
	text-align: justify;
	font-size: 30rpx;
	line-height: 2;
}

.ul {
	margin-top: 16rpx;
	font-size: 26rpx;
	line-height: 1.8;
}

.li {
	width: 100%;
	white-space: normal;
}

.ul + .h3-tl,
.ul + .h2-tl {
	margin-top: 44rpx;
}

.overview + .h3-tl,
.overview + .h2-tl {
	margin-top: 44rpx;
}

.tips-content > .h2-tl:first-child,
.tips-content > .small-title:first-child {
	margin-top: 24rpx;
}

.small-title {
	margin-top: 40rpx;
	font-weight: 600;
}

.first-txt,
.second-txt {
	display: block;
	margin-top: 16rpx;
	line-height: 1.8;
	font-size: 30rpx;
}

.first-txt + .small-title,
.second-txt + .small-title {
	margin-top: 44rpx;
}

.checkbox-container {
	display: flex;
	align-items: center;
	margin-top: 30rpx;
}

.checkbox-label {
	color: #b1b1b1;
	font-size: 30rpx;
	margin-left: 10rpx;
}

.confirm-btn {
	margin-top: 30rpx;
	border-radius: 12rpx;
	font-size: 36rpx;
	padding: 40rpx 0;
	box-sizing: border-box;
	background-color: #32579c;
	color: #fff;
}

.confirm-btn[disabled] {
	background-color: #cccccc;
	color: #999999;
}

::v-deep .van-checkbox__icon {
	font-size: 36rpx;
}

::v-deep .van-checkbox {
	margin-top: 36rpx;
}
</style>
