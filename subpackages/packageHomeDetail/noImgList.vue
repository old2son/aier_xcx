<template>
	<view class="no-img-list-container">
		<CustomNavInner :title="pageTitle" />
		<view class="list-wrap" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view v-if="list.length" class="list-box">
				<view v-for="item in list" :key="item.specialId" class="list-item" @click="toDetail(item.specialId)">
					<text class="list-title">{{ item.specialName }}</text>
				</view>
			</view>
			<view v-else class="empty-box">
				<text class="empty-text">暂无内容</text>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';

export default {
	data() {
		return {
			cId: '',
			pageTitle: '列表',
			list: []
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo']),
		...mapState('moduleAsknScience', ['asknScienceList'])
	},
	methods: {
		initList() {
			this.list = this.asknScienceList || [];
			if (this.list.length) {
				this.pageTitle = this.cId === '478' ? 'EYE百科' : this.cId === '479' ? 'EYE问答' : '列表';
			}
		},
		toDetail(id) {
			uni.navigateTo({
				url: '/subpackages/packageHomeDetail/imgDetail?articleId=' + id
			});
		}
	},
	async onLoad(options) {
		this.cId = options.cId || '';
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
		await this.$store.dispatch('moduleAsknScience/getScienceArticleList', { specialId: this.cId });
		this.initList();
	}
};
</script>

<style lang="scss" scoped>
.no-img-list-container {
	width: 100%;
	min-height: 100vh;
	background-color: #f8f9ff;
}

.list-wrap {
	position: absolute;
	left: 50%;
	z-index: 9;
	width: 92%;
	transform: translateX(-50%);
	padding-bottom: 40rpx;
	box-sizing: border-box;
}

.list-box {
	display: flex;
	flex-direction: column;
	gap: 28rpx;
}

.list-item {
	padding: 30rpx;
	border-radius: 24rpx;
	background-color: #fff;
	box-shadow: 0 0 12rpx rgba(211, 214, 217, 0.9);
}

.list-title {
	line-height: 1.5;
	color: #101010;
	font-size: 32rpx;
}

.empty-box {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 300rpx;
}

.empty-text {
	color: #999;
	font-size: 28rpx;
}
</style>
