"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReservationsMap = buildReservationsMap;
/**
 * Builds a map of reservations by line item id.
 *
 * @param reservations - The reservations to build the map from.
 * @returns A map of reservations by line item id.
 */
function buildReservationsMap(reservations) {
    const map = new Map();
    for (const reservation of reservations) {
        if (map.has(reservation.line_item_id)) {
            map.get(reservation.line_item_id).push(reservation);
        }
        else {
            map.set(reservation.line_item_id, [reservation]);
        }
    }
    return map;
}
//# sourceMappingURL=build-reservations-map.js.map