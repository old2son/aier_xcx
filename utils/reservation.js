import Dialog from '@/wxcomponents/vant/dialog/dialog';
import store from '@/store';

const APPOINTMENT_SUBSCRIBE_TEMPLATE_ID = 'ILxi2vJKudqia5NL-RGhi8vBAM4P_g-OOV25tAPjvF0';

function getSubscribeSetting() {
	return new Promise((resolve) => {
		wx.getSetting({
			withSubscriptions: true,
			success: (res) => {
				resolve(res);
			},
			fail: (err) => {
				console.log('获取订阅设置失败', err);
				resolve({});
			}
		});
	});
}

async function getSubscribeStatus(templateId) {
	const settingRes = await getSubscribeSetting();
	const itemSettings =
		(settingRes &&
			settingRes.subscriptionsSetting &&
			settingRes.subscriptionsSetting.itemSettings) ||
		{};

	return itemSettings[templateId] || '';
}

function requestSubscribeMessage(templateId) {
	return new Promise((resolve, reject) => {
		wx.requestSubscribeMessage({
			tmplIds: [templateId],
			success: resolve,
			fail: reject
		});
	});
}

function openSubscribeSetting() {
	return new Promise((resolve) => {
		wx.openSetting({
			withSubscriptions: true,
			success: (settingRes) => {
				console.log('打开订阅设置成功', settingRes);
				resolve(settingRes);
			},
			fail: (err) => {
				console.log('打开订阅设置失败', err);
				resolve(err);
			}
		});
	});
}

async function openSubscribeSettingGuide(templateId) {
	return new Promise((resolve) => {
		uni.showModal({
			title: '订阅提醒',
			content: '您已关闭预约通知订阅，微信后续可能不再弹出授权窗口，请前往设置手动开启预约通知。',
			confirmText: '去开启',
			cancelText: '暂不',
			success: async (modalRes) => {
				console.log('modalRes', modalRes);
				if (!modalRes.confirm) {
					store.commit('moduleUser/setSubscribeGuideDismissed', true);
					resolve({
						type: 'manual-guide-cancel'
					});
					return;
				}

				store.commit('moduleUser/setSubscribeGuideDismissed', false);
				const settingRes = await openSubscribeSetting();
				const itemSettings =
					(settingRes &&
						settingRes.subscriptionsSetting &&
						settingRes.subscriptionsSetting.itemSettings) ||
					{};
				const subscribeStatus = itemSettings[templateId];

				if (subscribeStatus === 'accept') {
					store.commit('moduleUser/setSubscribeGuideDismissed', false);
					uni.showToast({
						title: '已开启预约通知',
						icon: 'success'
					});
				}

				resolve({
					type: 'manual-guide-confirm',
					subscribeStatus,
					detail: settingRes
				});
			},
			fail: () =>
				resolve({
					type: 'manual-guide-fail'
				})
		});
	});
}

// 订阅通知
export async function requestSubscribe() {
	const templateId = APPOINTMENT_SUBSCRIBE_TEMPLATE_ID;
	const currentSubscribeStatus = await getSubscribeStatus(templateId);
	const isGuideDismissed = store.state.moduleUser.subscribeGuideDismissed;

	if (currentSubscribeStatus === 'reject' || currentSubscribeStatus === 'ban') {
		if (isGuideDismissed) {
			return {
				type: 'manual-guide-skipped',
				subscribeStatus: currentSubscribeStatus
			};
		}
		return await openSubscribeSettingGuide(templateId);
	}

	store.commit('moduleUser/setSubscribeGuideDismissed', false);

	try {
		const res = await requestSubscribeMessage(templateId);
		console.log('订阅结果', res);

		const subscribeStatus = res[templateId];
		if (subscribeStatus === 'accept') {
			store.commit('moduleUser/setSubscribeGuideDismissed', false);
			wx.showToast({
				title: '订阅成功',
				icon: 'success'
			});
		}

		if (subscribeStatus === 'reject' || subscribeStatus === 'ban') {
			const guideResult = await openSubscribeSettingGuide(templateId);
			return {
				type: 'request-subscribe',
				subscribeStatus,
				detail: res,
				guideResult
			};
		}

		return {
			type: 'request-subscribe',
			subscribeStatus,
			currentSubscribeStatus,
			detail: res
		};
	} catch (err) {
		console.log('订阅失败', err);

		const errMsg = (err && err.errMsg) || '';
		if (err.errCode === 20004 || errMsg.includes('main switch')) {
			const guideResult = await openSubscribeSettingGuide(templateId);
			return {
				type: 'request-subscribe-fail',
				detail: err,
				guideResult
			};
		}

		return {
			type: 'request-subscribe-fail',
			detail: err
		};
	}
}

export function handleReservationResult(vm, res) {
	if (res.code === 200 && res.message === '您已成功预约') {
		Dialog.alert({
			message: '您已成功预约',
			theme: 'round-button',
			confirmButtonText: '我知道了',
			beforeClose: (action) =>
				new Promise((resolve) => {
					if (action === 'confirm') {
						uni.reLaunch({
							url: '/subpackages/packageMine/appointment/myAppointment'
						});
					}
					resolve(true);
				})
		});
	} else {
		uni.hideLoading();

		setTimeout(() => {
			vm.$toast({
				duration: 3000,
				message: res.message
			});
		}, 50);
	}
}
