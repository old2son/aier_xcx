<template>
	<view class="original-collection-container">
		<CustomNavInner title="基地原创" />
		<view class="collection-list" :style="{ top: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 20 + 'px' }">
			<view
				class="collection-item"
				v-for="(item, index) in originalList"
				:key="item.columnId"
				@click="
					toSubpackagePage(`packageCategory/hotScience/originalCollectionDetail?collectId=${item.specialId}`)
				"
			>
				<image :src="item.specialFile" mode="widthFix"></image>
				<view class="txt">
					<rich-text :nodes="item.richTextNodes"></rich-text>
				</view>
			</view>
			<view
				class="collection-item"
				v-for="(item, index) in originalList"
				:key="item.columnId"
				@click="
					toSubpackagePage(`packageCategory/hotScience/originalCollectionDetail?collectId=${item.specialId}`)
				"
			>
				<image :src="item.specialFile" mode="widthFix"></image>
				<view class="txt">
					<rich-text :nodes="item.richTextNodes"></rich-text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getScienceOriginal } from '@/api';
import { mapState } from 'vuex';
export default {
	data() {
		return {
			originalList: []
		};
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo'])
	},
	onLoad() {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
		this.requestData();
	},
	methods: {
		async requestData() {
			const { data: originalList } = await getScienceOriginal();
			// 在请求数据后构造 richTextNodes
			this.originalList = originalList.map((item) => {
				return {
					...item,
					richTextNodes: [
						{
							name: 'div',
							attrs: {
								style: `display:-webkit-box;
                    text-overflow:ellipsis;
                    overflow:hidden;
                    -webkit-line-clamp:2;
                    -webkit-box-orient:vertical;
                    word-break:break-all;
                    line-height: 1.2;`
							},
							children: [
								{
									type: 'text',
									text: item.specialName
								}
							]
						}
					]
				};
			});
		},
		toSubpackagePage(url) {
			uni.navigateTo({
				url: '/subpackages/' + url
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.original-collection-container {
	width: 100%;
	height: 100vh;
	overflow-y: auto;
	padding-bottom: 60rpx;
	box-sizing: border-box;

	.collection-list {
		position: absolute;
		margin-left: 50%;
		transform: translateX(-50%);
		z-index: 999;
		width: 90%;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		.collection-item {
			background-color: #fff;
			border-radius: 20rpx;
			overflow: hidden;
			box-shadow: 0 0 3px #d3d3d3;
			width: 47%;
			color: #333;
			font-size: 32rpx;
			margin-bottom: 50rpx;
			image {
				width: 100%;
			}
			.txt {
				padding: 30rpx 20rpx 50rpx 20rpx;
				box-sizing: border-box;
				color: #333;
				font-size: 32rpx;
			}
		}
	}
}
</style>
