/**
 * @typedef {object} MemberCreatedEventData
 * @prop {string} memberId
 * @prop {string} source
 * @prop {import('@tryghost/member-attribution/lib/attribution').Attribution} [attribution] Attribution
 */

module.exports = class MemberCreatedEvent {
    /**
     * @param {MemberCreatedEventData} data
     * @param {Date} timestamp
     */
    constructor(data, timestamp) {
        this.data = data;
        this.timestamp = timestamp;
    }

    /**
     * @param {MemberCreatedEventData} data
     * @param {Date} [timestamp]
     */
    static create(data, timestamp) {
        return new MemberCreatedEvent(data, timestamp ?? new Date);
    }
};
