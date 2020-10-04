//trips.txtのshape_idを埋める。
//GTFS-JP初版対応。shapeごとに1つのroute_idがある場合
export function f_set_temp_shape_id(a_data) {
	for (let i1 = 0; i1 < a_data["trips"].length; i1++) {
		const c_trip = a_data["trips"][i1];
		if ((c_trip["shape_id"] === "") || (c_trip["shape_id"] === null) || (c_trip["shape_id"] === undefined)) {
			c_trip["shape_id"] = "shape_id_" + c_trip["route_id"];
		}
	}
}