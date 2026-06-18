export function formatReservationConfig(list) {
	const map = new Map();

	list.forEach((item) => {
		const { configId, dateTime, expound, startTime, endTime, surplusNumber } = item;

		if (!map.has(dateTime)) {
			map.set(dateTime, {
				dateTime,
				timeSlots: []
			});
		}

		map.get(dateTime).timeSlots.push({
			configId,
			label: `${startTime}-${endTime}`,
			startTime,
			endTime,
			expound,
			surplusNumber
		});
	});

	return Array.from(map.values()).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
}
