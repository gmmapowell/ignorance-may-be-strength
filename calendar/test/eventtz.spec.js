import { expect } from 'chai';
import { CalDateTime } from '../web/js/events.js';
import { Ics } from '../web/js/ics.js';

describe('eventtz', () => {
	it('can process TZ on VEVENT', () => {
		var input = "TZID=Europe/London:20240922T150000";
		var time = CalDateTime.icsDate(null, input);
		expect(time.jsd.getTime()).to.equal(Date.parse("2024-09-22T14:00:00.000Z"));
	});
	it('can process a ; as a field separator', () => {
		var input = "DTSTART;TZID=Europe/London:20240922T150000";
		var kv = Ics.split(input);
		expect(kv[0]).to.equal("DTSTART");
		expect(kv[1]).to.equals("TZID=Europe/London:20240922T150000");
	});
});