<template>
	<view class="hall-details-container">
		<view class="video-wrap">
			<t-video
				id="tvd"
				tstyle="position: absolute;left: 0;top: 0;width: 100%;height: 100%;"
				:src="hallInfo.videoUrl"
				:poster="hallInfo.coverUrl"
				:title="hallInfo.companyName"
				:loop="true"
				:controls="true"
				:page_gesture="true"
				:enable_play_gesture="false"
				:show_center_play_btn="false"
			/>
		</view>
		<view class="poster-image">
			<image :src="hallInfo.imageUrl" mode="widthFix" @click="previewPicture(hallInfo.imageUrl)"></image>
		</view>
	</view>
</template>

<script>
// import { getCompanyById } from '@/api';
export default {
	data() {
		return {
			hallId: '',
			hallInfo: {}
		};
	},
	onLoad(options) {
		this.hallId = options.hallId;
		this.getHallDetails();
	},
	methods: {
		async getHallDetails() {
			const { data: res } = await getCompanyById({ companyId: this.hallId });
			console.log('视频', res);
			this.hallInfo = res;
		},
		previewPicture(url) {
			const options = {
				current: 0,
				urls: [url]
			};
            wx.previewImage(options)
		}
	}
};
</script>

<style lang="scss" scoped>
.hall-details-container {
	width: 100%;
	height: 100%;
	.video-wrap {
		position: relative;
		width: 100%;
		height: 0;
		padding-bottom: 56.25%;
	}
	#tvd {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 3000;
	}

	.poster-image {
		width: 100%;
		font-size: 0;
		image {
			width: 100%;
		}
	}
}
</style>
