import request from "./request"
const baseUrl = "https://api.grandeffect.cn" /* 基础地址 */

/* ———— 首页页面接口 ———— */
// 顶部 banner 轮播图
export const getScienceHomeTopImage = () => request({
	url: baseUrl + "/api/user/getScienceHomeTopImage",
})
// 精选推荐
export const getScienceHomeRecommendations = () => request({
	url: baseUrl + "/api/user/getScienceHomeRecommendations",
})
// 基地动态
export const getScienceHomeBaseDynamics = () => request({
	url: baseUrl + "/api/user/getScienceHomeBaseDynamics",
})

/* ———— 登录页面接口 ———— */
// 发送（登录/注册）手机验证码
export const sendCode = (params) => request({
	url: baseUrl + "/api/user/sendCode",
	data: params,
	method: "POST"
})
// 手机登录
export const scienceMuseumUserLogin = (params) => request({
	url: baseUrl + "/api/user/scienceMuseumUserLogin",
	data: params,
	method: "POST"
})
// 帐号登出
export const scienceMuseumUserLogOut = () => request({
	url: baseUrl + '/api/user/scienceMuseumUserLogOut',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 获取个人资料
export const getScienceMuseumUserInforMation = () => request({
	url: baseUrl + '/api/user/getScienceMuseumUserInforMation',
	auth: {
		needLogin: true
	}
})
/* 编辑个人资料 */
export const scienceMuseumUserUpdateNickName = (params) => request({
	url: baseUrl + '/api/user/scienceMuseumUserUpdateNickName',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 用户上传头像
export const scienceMuseumUserUploadAvatar = (params) => request({
	url: baseUrl + '/api/user/scienceMuseumUserUploadAvatar',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})



/* ———— 预约相关接口 ———— */
// 获取预约四个时间段时间数据
export const getReservationTimeSlot = () => request({
	url: baseUrl + '/api/user/getReservationTimeSlot',
})
// 查询当天已有需要讲解人数
export const getReservationWeekNumbers = (params) => request({
	url: baseUrl + '/api/user/getReservationWeekNumbers',
	data: params,
	auth: {
		needLogin: true
	},
})
// 查询某一时段已预约人数
export const getReservationTimeSlotNumbers = (params) => request({
	url: baseUrl + '/api/user/getReservationTimeSlotNumbers',
	data: params,
	auth: {
		needLogin: true
	},
})
// 提交个人预约
export const personalReservation = (params) => request({
	url: baseUrl + '/api/user/personalReservation',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	},
})
// 提交团队预约
export const teamReservation = (params) => request({
	url: baseUrl + '/api/user/teamReservation',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	},
})
// 活动中心进行中
export const getScienceActivityInProgress = () => request({
	url: baseUrl + '/api/user/getScienceActivityInProgress'
})
// 活动中心预告
export const getScienceActivityEvents = () => request({
	url: baseUrl + '/api/user/getScienceActivityEvents'
})
// 活动中心查询时间段预约人数
export const getActivityReservationTimeSlotNumbers = (params) => request({
	url: baseUrl + "/api/user/getActivityReservationTimeSlotNumbers",
	data: params,
	auth: {
		needLogin: true
	}
})
// 活动中心个人预约
export const personalActivityReservation = (params) => request({
	url: baseUrl + "/api/user/personalActivityReservation",
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询我的预约
export const myReservation = () => request({
	url: baseUrl + '/api/user/myReservation',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 取消预约
export const cancelReservation = (params) => request({
	url: baseUrl + '/api/user/cancelReservation',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 添加成员
export const addMember = (params) => request({
	url: baseUrl + '/api/user/addMember',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询已添加的成员
export const getMembers = () => request({
	url: baseUrl + '/api/user/getMembers',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 删除已添加的成员
export const deleteMember = (params) => request({
	url: baseUrl + '/api/user/deleteMember',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})


/* ———— category 相关接口 ———— */
// {{ 热门科普 }}
// 分类导航icon
export const getInnerPageIcon = (params) => request({
	url: baseUrl + "/api/user/getInnerPageIcon",
	data: params
})
// 筛选关键词
export const getOrbitopathyYearQuery = (params) => request({
	url: baseUrl + "/api/user/getOrbitopathyYearQuery",
	data: params
})
// 筛选数据
export const getOrbitopathyQueryReviewVideo = (params) => request({
	url: baseUrl + "/api/user/getOrbitopathyQueryReviewVideo",
	data: params
})
// 基地原创
export const getScienceOriginal = () => request({
	url: baseUrl + '/api/user/getScienceOriginal'
})
// 基地原创合集的视频列表的banner
export const getOrbitopathyDoctorTeamBanner = (params) => request({
	url: baseUrl + '/api/user/getOrbitopathyDoctorTeamBanner',
	data: params
})
// 基地原创合集的视频列表
export const getHotRecommendInpage = (params) => request({
	url: baseUrl + '/api/user/getHotRecommendInpage',
	data: params
})
// 热门推荐
export const getSciencePopularRecommendations = () => request({
	url: baseUrl + '/api/user/getSciencePopularRecommendations'
})
// {{ 基地概况 }}
// 基地概况轮播图
export const getScienceOverViewBanner = () => request({
	url: baseUrl + '/api/user/getScienceOverViewBanner'
})
// 基地概况菜单选项
export const getScienceOverView = () => request({
	url: baseUrl + '/api/user/getScienceOverView'
})


/* ———— 收藏相关接口 ———— */
// 点击收藏
export const scienceAddCollect = (params) => request({
	url: baseUrl + '/api/user/scienceAddCollect',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 我的收藏
export const scienceMyCollect = () => request({
	url: baseUrl + '/api/user/scienceMyCollect',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询当前文章收藏状态
export const collectStatus = (params) => request({
	url: baseUrl + '/api/user/collectStatus',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询多个文章收藏状态
export const collectListStatus = (params) => request({
	url: baseUrl + '/api/user/collectListStatus',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 浏览记录
export const scienceHistoryWatch = () => request({
	url: baseUrl + '/api/user/scienceHistoryWatch',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询用户积分
export const getMyPoints = () => request({
	url: baseUrl + '/api/user/getMyPoints',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询所有奖品
export const getSciencePrizes = () => request({
	url: baseUrl + '/api/user/getSciencePrizes'
})
// 兑换奖品
export const scienceExchangePrizes = (params) => request({
	url: baseUrl + '/api/user/scienceExchangePrizes',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询用户积分收入
export const getMyPointsIncome = () => request({
	url: baseUrl + '/api/user/getMyPointsIncome',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询用户积分支出
export const getMyPointsExpenses = () => request({
	url: baseUrl + '/api/user/getMyPointsExpenses',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 兑换记录
export const scienceMyExchange = () => request({
	url: baseUrl + '/api/user/scienceMyExchange',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询签到情况
export const getScienceSignIn = () => request({
	url: baseUrl + '/api/user/getScienceSignIn',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 签到领积分
export const scienceSignIn = (params) => request({
	url: baseUrl + '/api/user/scienceSignIn',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询在线咨询五个问题
export const getOnlineConsultation = () => request({
	url: baseUrl + "/api/user/getOnlineConsultation",
	auth: {
		needLogin: true
	}
})
// 在线咨询提问
export const scienceUserOnline = (params) => request({
	url: baseUrl + '/api/user/scienceUserOnline',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询在线咨询历史记录
export const scienceUserOnlineHistory = () => request({
	url: baseUrl + '/api/user/scienceUserOnlineHistory',
	method: 'POST',
	auth: {
		needLogin: true
	}
})

/* ———— 消息中心相关接口 ———— */
// 查询消息列表中心：messageType，1预约成功消息，2活动开始通知，3闭馆通知
export const getScienceMessageList = () => request({
	url: baseUrl + '/api/user/getScienceMessageList',
	method: 'POST',
	auth: {
		needLogin: true
	}
})
// 查询消息内页
export const getScienceMessageInsidePage = (params) => request({
	url: baseUrl + '/api/user/getScienceMessageInsidePage',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})

/* ———— 意见反馈相关接口 ———— */
// 查询在意见反馈的题目信息
export const getFeedbackTopic = () => request({
	url: baseUrl + '/api/user/getFeedbackTopic',
})
// 提交意见反馈
export const scienceFeedback = (params) => request({
	url: baseUrl + '/api/user/scienceFeedback',
	data: params,
	method: 'POST',
	auth: {
		needLogin: true
	}
})