import Dialog from '@/wxcomponents/vant/dialog/dialog';

// 订阅通知
function requestSubscribe() {
    const templateId = 'ILxi2vJKudqia5NL-RGhi8vBAM4P_g-OOV25tAPjvF0';
	wx.requestSubscribeMessage({
		tmplIds: [templateId],
		success(res) {
			console.log('订阅结果', res);

			if (res[templateId] === 'accept') {
                const isSubscribe = uni.getStorageSync('appointmentSubscribe');

                if (isSubscribe) {
                    return;
                }

                uni.setStorageSync('appointmentSubscribe', true);
				wx.showToast({
					title: '订阅成功',
					icon: 'success'
				});
			}
		},
		fail(err) {
            uni.removeStorageSync('appointmentSubscribe');
			console.log('订阅失败', err);
		}
	});
}

export function handleReservationResult(vm, res, isPersonal) {
	if (res.code === 200 && res.message === '您已成功预约') {
        
		Dialog.alert({
			message: '您已成功预约',
			theme: 'round-button',
			confirmButtonText: '我知道了',
			beforeClose: (action) =>
				new Promise((resolve) => {
					if (action === 'confirm') {

                        isPersonal && requestSubscribe();

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
