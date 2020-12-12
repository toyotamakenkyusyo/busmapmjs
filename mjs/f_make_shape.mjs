//shapesを作る
export function f_make_shape(a_data) {
	
	//目次作成
	const c_index = {"stops": {}, "trips": {}};
	for (const c_stop of a_data["stops"]) {
		c_index["stops"][c_stop["stop_id"]] = c_stop;
	}
	for (const c_trip of a_data["trips"]) {
		c_index["trips"][c_trip["trip_id"]] = c_trip;
	}
	
	//仮データを作成
	const c_temp_data = {"trips": {}, "stop_orders": {}, "routes": {}, "shapes": {}};
	//route一覧を作成
	for (const c_route of a_data["routes"]) {
		c_temp_data["routes"][c_route["route_id"]] = {"stop_order_ids": {}};
	}
	//shapesをshape_id毎に分ける
	for (const c_trip of a_data["trips"]) {
		if (c_trip["shape_id"] !== undefined && c_trip["shape_id"] !== "") {
			c_temp_data["shapes"][c_trip["shape_id"]] = {"stop_order_ids": {}, "shape_pt_order": []};
		}
	}
	if (a_data["shapes"] !== undefined) {
		for (const c_shape of a_data["shapes"]) {
			if (c_temp_data["shapes"][c_shape["shape_id"]] === undefined) {
				c_temp_data["shapes"][c_shape["shape_id"]] = {"stop_order_ids": {}, "shape_pt_order": []};
			}
			c_temp_data["shapes"][c_shape["shape_id"]]["shape_pt_order"].push({
				"lat": c_shape["shape_pt_lat"], 
				"lon": c_shape["shape_pt_lon"], 
				"sequence": c_shape["shape_pt_sequence"]
			});
		}
	}
	//sequence順に整列
	for (const i1 in c_temp_data["shapes"]) {
		c_temp_data["shapes"][i1]["shape_pt_order"].sort(f_sort_sequence);
	}
	function f_sort_sequence(a1,a2) {
		if (a1["sequence"] < a2["sequence"]) {
			return -1;
		}
		if (a1["sequence"] > a2["sequence"]) {
			return 1;
		}
		return 0;
	};
	
	//stop_timesをtrip毎に分けて整列する
	for (const c_trip of a_data["trips"]) {
		c_temp_data["trips"][c_trip["trip_id"]] = {"stop_order": [], "stop_order_id": null, "shape_id": null};
	}
	for (const c_stop_time of a_data["stop_times"]) {
		c_temp_data["trips"][c_stop_time["trip_id"]]["stop_order"].push({
			"lat": c_index["stops"][c_stop_time["stop_id"]]["stop_lat"],
			"lon": c_index["stops"][c_stop_time["stop_id"]]["stop_lon"],
			"sequence": c_stop_time["stop_sequence"]
		});
	}
	for (const i1 in c_temp_data["trips"]) {
		c_temp_data["trips"][i1]["stop_order"].sort(f_sort_sequence);
	}
	//stop_order_idを作成
	let l_count = 0;
	for (let i1 in c_temp_data["trips"]) {
		let l_stop_order_id = "";
		for (let i2 = 0; i2 < c_temp_data["trips"][i1]["stop_order"].length; i2++) {
			if (i2 !== 0) {
				l_stop_order_id += "_";
			}
			l_stop_order_id += String(c_temp_data["trips"][i1]["stop_order"][i2]["lat"]) + "," + String(c_temp_data["trips"][i1]["stop_order"][i2]["lon"]);
		}
		c_temp_data["trips"][i1]["stop_order_id"] = l_stop_order_id;
		if (c_temp_data["stop_orders"][l_stop_order_id] === undefined) {
			c_temp_data["stop_orders"][l_stop_order_id] = {
				"stop_order": c_temp_data["trips"][i1]["stop_order"], 
				"shape_id": "shape_id_stop_order_" + String(l_count),
				"route_ids": {},
				"shape_ids": {}
			};
			l_count += 1;
		}
		c_temp_data["stop_orders"][l_stop_order_id]["route_ids"][c_index["trips"][i1]["route_id"]] = true;
		c_temp_data["routes"][c_index["trips"][i1]["route_id"]]["stop_order_ids"][l_stop_order_id] = true;
		if (c_index["trips"][i1]["shape_id"] !== undefined && c_index["trips"][i1]["shape_id"] !== "") {
			c_temp_data["stop_orders"][l_stop_order_id]["route_ids"][c_index["trips"][i1]["shape_id"]] = true;
			c_temp_data["shapes"][c_index["trips"][i1]["shape_id"]]["stop_order_ids"][l_stop_order_id] = true;
		}
	}
	//以下、次の順序でshape_idを定める
	// 1 shape_idと中身がある場合、そのまま
	// 2 shape_idだけがある場合、
	// 2.1 shape_idに対応するstop_orderがどれも一意ならそのまま
	// 2.2 そうでなければroute_idに対応するstop_orderがどれも一意なら、shape_id_[route_id]
	// 2.3 そうでなければ通し番号
	// 3 shape_idがない場合
	// 3.1 route_idに対応するstop_orderがどれも一意なら、shape_id_[route_id]
	// 3.2 そうでなければ通し番号
	let l_all_route_ids_relate_one_stop_order = true;
	let l_all_shape_ids_relate_one_stop_order = true;
	for (const i1 in c_temp_data["shapes"]) {
		if (c_temp_data["shapes"][i1]["shape_pt_order"].length === 0 && c_temp_data["shapes"][i1]["stop_order_ids"].length > 1) {
			l_all_shape_ids_relate_one_stop_order = false;
		}
	}
	for (const i1 in c_temp_data["routes"]) {
		if (c_temp_data["routes"][i1]["stop_order_ids"].length > 1) {
			l_all_route_ids_relate_one_stop_order = false;
		}
	}
	//shape_idを振り直す
	for (const c_trip of a_data["trips"]) {
		let l_shape_id;
		if (c_trip["shape_id"] !== undefined && c_trip["shape_id"] !== "") { // 1 or 2
			if (c_temp_data["shapes"][c_trip["shape_id"]]["shape_pt_order"].length === 0) { // 2
				if (l_all_shape_ids_relate_one_stop_order === true) { // 2.1
					l_shape_id = c_trip["shape_id"];
					c_temp_data["shapes"][c_trip["shape_id"]]["shape_pt_order"] = c_temp_data["stop_orders"][c_temp_data["trips"][c_trip["trip_id"]]["stop_order_id"]]["stop_order"];
				} else if (l_all_route_ids_relate_one_stop_order === true) { // 2.2
					l_shape_id =  "shape_id_" + c_trip["route_id"];
				} else { // 2.3
					l_shape_id = c_temp_data["stop_orders"][c_temp_data["trips"][c_trip["trip_id"]]["stop_order_id"]]["shape_id"];
				}
			} else { // 1
				l_shape_id = c_trip["shape_id"];
			}
		} else { // 3
			if (l_all_route_ids_relate_one_stop_order === true) { // 3.1
				l_shape_id = "shape_id_" + c_trip["route_id"];
			} else { // 3.2
				l_shape_id = c_temp_data["stop_orders"][c_temp_data["trips"][c_trip["trip_id"]]["stop_order_id"]]["shape_id"];
			}
			
		}
		c_temp_data["trips"][c_trip["trip_id"]]["shape_id"] = l_shape_id;
		if (c_temp_data["shapes"][l_shape_id] === undefined) {
			const c_stop_order_id = c_temp_data["trips"][c_trip["trip_id"]]["stop_order_id"];
			c_temp_data["shapes"][l_shape_id] = {"stop_order_ids": {}, "shape_pt_order": []};
			c_temp_data["shapes"][l_shape_id]["stop_order_ids"][c_stop_order_id] = true;
			c_temp_data["shapes"][l_shape_id]["shape_pt_order"] = c_temp_data["stop_orders"][c_stop_order_id]["stop_order"];
		}
	}
	
	//肝心のshapesを作成する
	for (const c_trip of a_data["trips"]) {
		c_trip["shape_id"] = c_temp_data["trips"][c_trip["trip_id"]]["shape_id"];
	}
	const c_new_shapes = [];
	for (const i1 in c_temp_data["shapes"]) {
		if (c_temp_data["shapes"][i1]["shape_pt_order"].length === 0) {
			continue;
		}
		for (let i2 = 0; i2 < c_temp_data["shapes"][i1]["shape_pt_order"].length; i2++) {
			c_new_shapes.push({
				"shape_id":i1,
				"shape_pt_lat": c_temp_data["shapes"][i1]["shape_pt_order"][i2]["lat"],
				"shape_pt_lon": c_temp_data["shapes"][i1]["shape_pt_order"][i2]["lon"],
				"shape_pt_sequence": c_temp_data["shapes"][i1]["shape_pt_order"][i2]["sequence"]
			});
		}
	}
	a_data["shapes"] = c_new_shapes;
}