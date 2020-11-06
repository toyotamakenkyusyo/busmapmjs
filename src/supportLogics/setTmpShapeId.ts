import { Trip } from "@come25136/gtfs";

/**
 * @method setTmpShapeId tripsのshapeIdがない場合、仮の名前をとりあえず埋めるだけのメソッド
 * @param {Array<Trip>} trips 検証対象のtrips
 * @returns {Array<Trip>} 仮のshapeIdを埋めた後のtrips配列
 * @description f_set_temp_shape_id相当
 */
const setTmpShapeId = (trips: Array<Trip>): Array<Trip> => {
    // for (let i1 = 0; i1 < a_data["trips"].length; i1++) {
    // 	const c_trip = a_data["trips"][i1];
    // 	if ((c_trip["shape_id"] === "") || (c_trip["shape_id"] === null) || (c_trip["shape_id"] === undefined)) {
    // 		c_trip["shape_id"] = "shape_id_" + c_trip["route_id"];
    // 	}
    // }

    // tripsを1つずつ調べる
    return trips.map(trip => {
        // shapeIdの好ましくないパターン集
        const isBadShapeId = trip.shapeId === ""
            || trip.shapeId === null
            || trip.shapeId === undefined;

        // 好ましくないなら仮の名前を埋めて戻す
        if (isBadShapeId) {
            trip.shapeId = `shape_id_${trip.routeId}`
        }

        // 検証終了
        return trip;
    });
}

export {
    setTmpShapeId
}