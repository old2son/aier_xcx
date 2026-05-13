<template>
	<view
		class="custom-nav"
		:style="{
			background: `rgba(255,255,255,${opacity})`,
			height: menuInfo.menuHeight + menuInfo.menuHeightFromTop + 14 + 'px'
		}"
	>
		<view
			class="nav-title"
			:style="{
				width: menuInfo.barWidth + 'px',
				height: menuInfo.menuHeight + 'px',
				opacity: opacity,
				visibility: opacity > 0 ? 'visible' : 'hidden',
				pointerEvents: opacity > 0 ? 'auto' : 'none',
				marginTop: menuInfo.menuHeightFromTop + 'px',
				paddingLeft: menuInfo.blockedLayoutWidth + 'px'
			}"
		>
			<text>{{ title }}</text>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
export default {
	name: 'CustomNav',
	props: {
		title: {
			type: String,
			default: ''
		},
		opacity: {
			type: Number,
			default: 0
		}
	},
	computed: {
		...mapState('moduleLayout', ['menuInfo'])
	},
	mounted() {
		this.$store.dispatch('moduleLayout/getNavigationBarStyle');
	}
};
</script>

<style lang="scss" scoped>
.custom-nav {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 10;
	width: 100%;
	transition: background 0.3s;
}

.nav-title {
	color: #000;
	font-size: 26rpx;
	transition:
		opacity 0.3s,
		visibility 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;
	pointer-events: none;
	box-sizing: border-box;
}

.nav-title text {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
