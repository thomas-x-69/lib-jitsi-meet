import { getLogger } from '@jitsi/logger';

import JitsiConference from '../../JitsiConference';
import * as JitsiConferenceEvents from '../../JitsiConferenceEvents';

const logger = getLogger('modules/event/Jvb121EventGenerator');

/**
 * Emits {@link JitsiConferenceEvents.JVB121_STATUS} events based on the current
 * P2P status and the conference participants count. See the event description
 * for more info.
 */
export default class Jvb121EventGenerator {
    private _conference: JitsiConference;
    private _jvb121: boolean;

    /**
     * Creates new <tt>Jvb121EventGenerator</tt> for the given conference.
     * @param {JitsiConference} conference
     */
    constructor(conference: JitsiConference) {
        this._conference = conference;

        /**
         * Indicates whether it's a one to one JVB conference (<tt>true</tt>)
         * or a multiparty (<tt>false</tt>). Will be also <tt>false</tt> if
         * the conference is currently in the P2P mode.
         * @type {boolean}
         * @private
         */
        this._jvb121 = true;

        this._conference.addEventListener(
            JitsiConferenceEvents.USER_JOINED, () => this.evaluateStatus());
        this._conference.addEventListener(
            JitsiConferenceEvents.USER_LEFT, () => this.evaluateStatus());
        this._conference.addEventListener(
            JitsiConferenceEvents.P2P_STATUS, () => this.evaluateStatus());
    }

    /**
     * Checks whether the JVB121 value should be updated and a new event
     * emitted.
     */
    evaluateStatus() {
        const oldStatus = this._jvb121;
        const newStatus
            = !this._conference.isP2PActive()
                && this._conference.getParticipantCount() <= 2;

        if (oldStatus !== newStatus) {
            this._jvb121 = newStatus;
            logger.debug(`JVB121 status ${oldStatus} => ${newStatus}`);
            this._conference.eventEmitter.emit(
                JitsiConferenceEvents.JVB121_STATUS, oldStatus, newStatus);
        }
    }
}
