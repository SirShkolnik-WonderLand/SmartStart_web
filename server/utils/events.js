const EventEmitter = require('events');
class HubEmitter extends EventEmitter {}

const hubEmitter = new HubEmitter();

function emitEvent(name, payload) {
    try {
        hubEmitter.emit(name, { name, at: new Date().toISOString(), payload });
    } catch (e) {
        // best-effort
        console.error('Event emit error:', e.message);
    }
}

module.exports = { hubEmitter, emitEvent };