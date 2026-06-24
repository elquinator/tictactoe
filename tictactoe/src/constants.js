export const NS_DEBUG_NAMES = {
    "MOVE_RECORDER": false,
    "MOVE_CLICK": false,
    "MOVER_DEBUG": false,
    "SPEC_COMPARE": false,
    "SHIFT_DEBUG": true,
    "ERROR": true,
};

export const debugLog = (namespace, message, obj = null) => {
    if (NS_DEBUG_NAMES[namespace]) {
        console.log(`[${namespace}] ${message}`, obj);
    }
};

export const PLAYERS = ['X', 'O'];
export const HOSTNAME = window.location.host.split(':')[0];
export const PORT = 3030;
export const PATH = "games";
export const URL = `http://${HOSTNAME}:${PORT}/${PATH}`;