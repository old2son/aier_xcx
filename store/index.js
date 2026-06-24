import Vue from 'vue';
import Vuex from 'vuex';
import moduleTab from '@/store/modules/moduleTab'; // 新增Tab模块
import moduleLayout from '@/store/modules/moduleLayout.js';
import moduleHome from '@/store/modules/moduleHome.js';
import moduleUser from '@/store/modules/moduleUser.js';
import moduleAppointment from '@/store/modules/moduleAppointment.js'; // 预约凭证
import moduleBooking from '@/store/modules/moduleBooking.js'; // 普通预约列表
import moduleActivity from '@/store/modules/moduleActivity.js'; // 活动预约列表
import moduleAsknScience from '@/store/modules/moduleAsknScience.js';
import moduleAudience from '@/store/modules/moduleAudience.js';

Vue.use(Vuex);

const store = new Vuex.Store({
	modules: {
		/* 使用的路径: 模块名 'moduleLayout': moduleLayout */
		moduleTab,
		moduleLayout,
		moduleHome,
		moduleUser,
		moduleAppointment,
		moduleBooking,
		moduleActivity,
		moduleAsknScience,
		moduleAudience
	}
});

export default store;
