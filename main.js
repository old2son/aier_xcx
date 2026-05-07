// #ifndef VUE3
import Vue from 'vue'
import App from './App'
import store from '@/store'
import {
	router,
	RouterMount
} from '@/router/pageRouter'
Vue.use(router)
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
// toast轻提示
Vue.prototype.$toast = function(options) {
	if (typeof options === 'string') {
		options = {
			message: options
		}
	}
	wx.showToast({
		title: options.message || '',
		icon: options.icon || 'none',
		duration: options.duration || 2000,
		mask: options.mask || false
	})
}

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App,
	router,
	store
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import App from './App.vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif