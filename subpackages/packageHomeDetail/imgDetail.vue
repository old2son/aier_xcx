<template>
	<view class="img-detail-container">
		<CustomNavInner :title="pageTitle" />
		<view class="detail-wrap" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view v-if="imageUrl" class="image-box">
				<image :src="imageUrl" mode="widthFix" class="detail-image" @click="previewImage"></image>
			</view>
			<view v-else class="empty-box">
				<text class="empty-text">暂无图片内容</text>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { scienceArticleInformation } from '@/api';

export default {
	data() {
		return {
			articleId: '',
			pageTitle: '详情',
			imageUrl: ''
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo'])
	},
	methods: {
		initDetail() {
            scienceArticleInformation({ specialId: this.articleId }).then(res => {
                this.imageUrl = res.data.videoUrl
                this.pageTitle = res.data.specialName
            })
		},
		previewImage() {
			if (!this.imageUrl) {
				return;
			}
			wx.previewImage({
				current: this.imageUrl,
				urls: [this.imageUrl]
			});
		}
	},
	onLoad(options) {
		this.articleId = options.articleId || '';
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
		this.initDetail();
	}
};
</script>

<style lang="scss" scoped>
.img-detail-container {
	width: 100%;
	min-height: 100vh;
	background-color: #fff;
}

.detail-wrap {
	position: absolute;
	left: 50%;
	z-index: 9;
	width: 100%;
	transform: translateX(-50%);
	padding-bottom: 40rpx;
	box-sizing: border-box;
}

.image-box {
	width: 100%;
}

.detail-image {
	width: 100%;
	display: block;
}

.empty-box {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 400rpx;
}

.empty-text {
	color: #999;
	font-size: 28rpx;
}
</style>
