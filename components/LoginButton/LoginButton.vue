<template>
	<view @click="handleClick">
		<slot></slot>
	</view>
</template>

<script>
import store from '@/store';

export default {
	methods: {
		async handleClick() {
			const token = uni.getStorageSync('token');
            const pages = getCurrentPages();
			const currentPage = pages[pages.length - 1];
            const url = currentPage.route.split('/').pop();

			if (token) {
				store.dispatch('moduleUser/getUserInfo').then((resp) => {
					if (
						(resp.code === 0 && resp.message === '非法令牌！请携带正确的Token令牌！') ||
						(resp.code === 401 && resp.message === '登录验证已过期，请重新登录！')
					) {
						uni.navigateTo({
							url: `/subpackages/packageLogin/login?redirectUrl=${url}`
						});
					} else {
						this.$emit('successAuth');
					}
				});
			} else {
				uni.navigateTo({
                    url: `/subpackages/packageLogin/login?redirectUrl=${url}`
				});
			}
		}
	}
};
</script>
