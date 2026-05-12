export default {
	namespaced: true,
	state: {
		menuInfo: {}
	},
	getters: {},
	mutations: {
		setNavigationBarStyle(state, menuInfo) {
			state.menuInfo = menuInfo;
		}
	},
	actions: {
		getNavigationBarStyle({ commit }) {
			return new Promise((resolve, reject) => {
				uni.getSystemInfo({
					success: (res) => {
						const screenWidth = res.screenWidth; /* 设备屏幕宽度 */
						// console.log('设备总宽度',screenWidth)
						const menu = uni.getMenuButtonBoundingClientRect();
						console.log('胶囊', menu);
						const barWidth = menu.left;
						// console.log('导航栏宽度', barWidth)
						const fromLeft = screenWidth - menu.right;
						const menuInfo = {
							barWidth, // 导航栏宽度
							blockedLayoutWidth: menu.width + fromLeft, // 遮挡布局宽度
							menuHeight: menu.height, // 胶囊高度（用作导航栏高度）
							fromLeft, // 搜索icon距左间距
							menuHeightFromTop: menu.top // 胶囊距顶高度
						};
						commit('setNavigationBarStyle', menuInfo);
						resolve(menuInfo);
					},
					fail: (err) => {
						reject('获取设备信息失败', err);
					}
				});
			});
		}
	}
};
