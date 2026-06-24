<template>
	<view class="avatar-preview-container">
		<swiper class="swiper-img" :current="currentImg" :duration="300" @change="changeSwiper">
			<swiper-item class="swiper-item" v-for="(item, index) in imgs" :key="index">
				<view class="img-page" @click="closePreview()">
					<movable-area class="movable-area" scale-area>
						<movable-view class="movable-view" direction="all" scale="true" scale-min="1" scale-max="6">
							<image class="pic" :src="item" mode="widthFix" />
						</movable-view>
					</movable-area>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
export default {
	name: 'AvatarPreview' /* 预览单图组件 */,
	props: {
		/* 状态栏高度 */
		imgs: {
			type: Array,
			required: true
		},
		currentImg: {
			type: Number,
			default: 0
		}
	},
	methods: {
		changeSwiper(e) {
			this.currentImg = e.detail.current;
		},
		closePreview() {
			this.$emit('close-preview');
		}
	}
};
</script>

<style lang="scss" scoped>
.avatar-preview-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	z-index: 9999999;
}

.movable-area {
	position: fixed;
	overflow: hidden;
	height: 100%;
	width: 100%;
}

.movable-view {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.pic {
	width: 100%;
}

.swiper-img {
	width: 100vw;
	height: 100vh;
	background-color: #000000;
	& > .swiper-item {
		width: 100vw;
		height: 100vh;
		.img-page {
			height: 100vh;
			display: flex;
			align-items: center;
		}
	}
}
</style>
