import { RouterMount, createRouter } from 'uni-simple-router'
import guard from './index'

const router = createRouter({
  platform: process.env.VUE_APP_PLATFORM,
  routes: [
    {
      path: '/pages/tabBar/home/home',
      aliasPath: '/',
      name: '首页',
      beforeEnter: (to, from, next) => {
        console.log('首页')
        uni.hideTabBar()
        next()
      }
    },
    {
      path: '/pages/tabBar/science/science',
      name: '科普'
    },
    {
      path: '/pages/tabBar/guide/guide',
      name: '导览'
    },
    {
      path: '/pages/tabBar/mine/mine',
      name: '我的'
    },
    {
    	path: '/subpackages/packageLogin/login',
    	name: '登录'
    },
    {
    	path: '/subpackages/packageLogin/appletPrivacyPolicy',
    	name: '爱尔眼健康科普教育基地隐私政策'
    },
    {
    	path: '/subpackages/packageHomeDetail/recommendation',
    	name: '热门推荐'
    },
    {
    	path: '/subpackages/packageHomeDetail/baseUpdates',
    	name: '基地动态'
    },
    {
      path: '/subpackages/packageHomeDetail/search',
      name: '搜索'
    },
    {
    	path: '/subpackages/packageCategory/hotScience/categoryIconInner',
    	name: 'categoryInit'
    },
    {
    	path: '/subpackages/packageCategory/hotScience/originalCollection',
    	name: '基地原创'
    },
    {
    	path: '/subpackages/packageCategory/hotScience/originalCollectionDetail',
    	name: '基地原创视频'
    },
    {
    	path: '/subpackages/packageCategory/hotScience/recommendation',
    	name: '热门推荐'
    },
    {
    	path: '/subpackages/packageCategory/activityCenter/index',
    	name: '活动中心'
    },
    {
    	path: '/subpackages/packageCategory/activityCenter/activityDetail',
    	name: '活动详情'
    },
    {
    	path: '/subpackages/packageCategory/baseOverview/index',
    	name: '基地概况'
    },
    {
    	path: '/subpackages/packageCategory/visitKnow/index',
    	name: '参观须知'
    },
    {
    	path: '/subpackages/packageAppointment/appointmentEntrance',
    	name: '预约',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageAppointment/personalAppointment',
    	name: '个人预约',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageAppointment/teamAppointment',
    	name: '团队预约',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/editProfile',
    	name: '个人资料',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/appointment/myAppointment',
    	name: '我的预约',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/appointment/appointmentDetail',
    	name: '预约详情',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/audience/audienceManage',
    	name: '常用观众',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/audience/addAudience',
    	name: '添加成员',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/feedback',
    	name: '意见反馈',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/onlineConsultation',
    	name: '在线咨询',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/collect',
    	name: '我的收藏',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/browsingHistory',
    	name: '浏览记录',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageCategory/activityCenter/activityEnroll',
    	name: '活动报名',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/points/index',
    	name: 'EYE积分',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/points/pointsRecord',
    	name: '积分记录',
       meta: {
         needLogin: true,
       }
    },
    {
      "path": "/subpackages/packageMine//points/exchangeRecord",
      "style": {
        "navigationBarTitleText": "兑换记录",
        "navigationStyle": "custom"
      }
    },
    {
    	path: '/subpackages/packageMine/messageCenter/index',
    	name: '消息中心',
       meta: {
         needLogin: true,
       }
    },
    {
    	path: '/subpackages/packageMine/messageCenter/messageDetail',
    	name: '消息详情',
       meta: {
         needLogin: true,
       }
    },
    ...ROUTES
  ]
})

router.beforeEach(guard.beforeEach)
// router.afterEach(guard.afterEach)

export {
  router,
  RouterMount
}