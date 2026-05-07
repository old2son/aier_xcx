<template>
	<view class="meteor-loading">
		<!-- 流星动画始终运行 -->
		<view class="stars">
			<view class="star" v-for="n in 50" :key="n"></view>
		</view>
		<!-- 可见区域（文字等）根据 visible 控制显示）-->
		<view class="center-text">
			<view class="text-main">EYE&nbsp;&nbsp;HEALTH</view>
			<view class="text-sub">SCIENCE&nbsp;&nbsp;MUSEUM</view>
		</view>
		<!-- <view class="footer" v-if="visible">爱尔眼健康科普教育基地</view> -->
		<view v-if="loadError" class="retry-btn" @click="onRetry">加载失败，点击重试</view>
	</view>
</template>


<script>
	export default {
		name: 'LoadingAnimation',
		props: {
			// 控制流星/文字显示
			visible: {
				type: Boolean,
				default: true
			},
			// 控制是否显示错误按钮
			loadError: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			onRetry() {
				this.$emit('retry')
			}
		}
	}
</script>

<style lang="scss" scoped>
	@font-face {
		font-family: "阿里妈妈灵动体 VF Thin";
		src: url("//at.alicdn.com/wf/webfont/4vlF4edl5bDm/uLLo6f1127AR.woff2") format("woff2"),
			url("//at.alicdn.com/wf/webfont/4vlF4edl5bDm/ZVxJJ4aiNnW3.woff") format("woff");
		font-variation-settings: "SRIF" 0.87, "slnt" 12, "wdth" 81.39, "wght" 700;
		font-display: swap;
	}

	.meteor-loading {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
		z-index: 9999;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.hide {
		visibility: hidden; // 替代 opacity: 0
	}

	.stars {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 120%;
		transform: rotate(-45deg);
	}

	.star {
		--star-color: hsl(196, 78%, 61%);
		--star-tail-length: 6em;
		--star-tail-height: 2px;
		--star-width: calc(var(--star-tail-length) / 12);
		--fall-duration: 9s;
		--tail-fade-duration: var(--fall-duration);
		will-change: transform, opacity;
		position: absolute;
		top: var(--top-offset);
		left: 0;
		width: var(--star-tail-length);
		height: var(--star-tail-height);
		color: var(--star-color);
		background: linear-gradient(45deg, currentColor, transparent);
		border-radius: 50%;
		filter: drop-shadow(0 0 6px currentColor);
		transform: translate3d(104em, 0, 0);
		animation: fall var(--fall-duration) var(--fall-delay) linear infinite, tail-fade var(--tail-fade-duration) var(--fall-delay) ease-out infinite;

		&::before,
		&::after {
			position: absolute;
			content: '';
			top: 0;
			left: calc(var(--star-width) / -2);
			width: var(--star-width);
			height: 100%;
			background: linear-gradient(45deg, transparent, currentColor, transparent);
			border-radius: inherit;
			animation:
				blink 2s linear infinite,
				cross-fade var(--tail-fade-duration) var(--fall-delay) ease-out infinite;
			opacity: 1;
		}

		&::before {
			transform: rotate(45deg);
		}

		&::after {
			transform: rotate(-45deg);
		}
	}

	// 自动生成不同流星参数
	@for $i from 1 through 50 {
		.star:nth-child(#{$i}) {
			--star-tail-length: #{random(25) + 25}em;
			--top-offset: #{random(100)}vh;
			--fall-duration: #{5 + random(4)}s; // 流星下落一次需要的时间（控制速度）： 6~10 秒

			@if $i <=20 {
				--fall-delay: -#{random(3)}s; // 前20颗负延迟，第一次加载就有更多星星直接在滑落
			}

			@else {
				--fall-delay: #{random(6)}s; // 后面的随机延迟时间也可以更短
			}
		}
	}




	@keyframes fall {
		to {
			transform: translate3d(-30em, 0, 0);
		}
	}

	@keyframes tail-fade {

		0%,
		50% {
			width: var(--star-tail-length);
			opacity: 1;
		}

		70%,
		80% {
			width: 0;
			opacity: 0.4;
		}

		100% {
			width: 0;
			opacity: 0;
		}
	}

	@keyframes cross-fade {

		0%,
		60% {
			opacity: 1;
		}

		65% {
			opacity: 0.5;
		}

		65%,
		70% {
			opacity: 0.45;
		}

		70%,
		80% {
			opacity: 0.15;
		}

		80%,
		100% {
			opacity: 0;
		}
	}


	@keyframes blink {
		50% {
			opacity: 0.6;
		}
	}

	.center-text {
		position: relative;
		z-index: 2;
		text-align: center;
		font-family: "阿里妈妈灵动体 VF Thin";
		font-variation-settings: "SRIF" 0.87, "slnt" 12, "wdth" 81.39, "wght" 700;
		/* Chrome 140 以下版本需要 */
		// animation: scaleText 2.5s ease-in-out infinite alternate;
		color: #fff;
		text-shadow: 0 0 10px #fff;

	}

	.text-main {
		animation: tracking-in-contract 0.8s cubic-bezier(0.215, 0.61, 0.355, 1.000) both;
		// animation-delay: 0.5s;
	}

	.text-sub {
		animation: tracking-in-contract 0.8s cubic-bezier(0.215, 0.61, 0.355, 1.000) both;
		animation-delay: 0.5s;
	}

	@keyframes tracking-in-contract {
		0% {
			letter-spacing: 1em;
			opacity: 0;
		}

		40% {
			opacity: 0.6;
		}

		100% {
			letter-spacing: normal;
			opacity: 1;
		}
	}

	.text-main {
		font-size: 42rpx;
		font-weight: bold;
	}

	.text-sub {
		font-size: 30rpx;
		margin-top: 8rpx;
	}

	@keyframes scaleText {
		0% {
			transform: scale(1);
		}

		100% {
			transform: scale(1.08);
		}
	}

	.retry-btn {
		margin-top: 40rpx;
		padding: 16rpx 32rpx;
		background: rgba(255, 255, 255, 0.2);
		color: #fff;
		border: 1px solid #fff;
		border-radius: 10rpx;
		font-size: 28rpx;
		z-index: 3;
	}

	.footer {
		position: absolute;
		bottom: 60rpx;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		color: #fff;
		white-space: nowrap;
		text-shadow: 0 0 6px rgba(255, 255, 255, 0.5);

		&::before,
		&::after {
			content: '';
			width: 60px;
			height: 1px;
			background: linear-gradient(to right, transparent, #fff, transparent); // 渐变效果
			margin: 0 10rpx;
		}
	}
</style>