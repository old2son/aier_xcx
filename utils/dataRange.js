import dayjs from 'dayjs';

/**
 * 判断日期是否在活动区间内
 * @param {Dayjs} date
 * @param {Array} list
 */
export function isInActivityRange(date, list = []) {
	return list.some((item) => {
		if (!item.startDate || !item.endDate) {
			return false;
		}

		const start = dayjs(item.startDate);
		const end = dayjs(item.endDate);

		return (
			date.isSame(start, 'day') ||
			date.isSame(end, 'day') ||
			(date.isAfter(start, 'day') && date.isBefore(end, 'day'))
		);
	});
}

/**
 * 判断日期是否存在预约配置
 * @param {Dayjs} date
 * @param {Array} list
 */
export function isReservationConfigRange(date, list = []) {
	return list.some((item) => {
		return item.dateTime && date.isSame(dayjs(item.dateTime), 'day');
	});
}
