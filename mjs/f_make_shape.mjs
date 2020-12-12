//shapesを作る
//GTFS-JP初版対応。shapeごとに1つのroute_idがある場合
export function f_make_shape(a_data) {
	if (a_data["shapes"] === undefined) {
		a_data["shapes"] = [];
	} else {
		//整列されている場合に限り、連続する点が同じなら消去する
		const c_temp_shapes = [];
		for (let i1 = 1; i1 < a_data["shapes"].length; i1++) {
			if (!(a_data["shapes"][i1 - 1]["shape_pt_lat"] === a_data["shapes"][i1]["shape_pt_lat"] && a_data["shapes"][i1 - 1]["shape_pt_lon"] === a_data["shapes"][i1]["shape_pt_lon"] && a_data["shapes"][i1 - 1]["shape_id"] === a_data["shapes"][i1]["shape_id"] && a_data["shapes"][i1 - 1]["shape_pt_sequence"] < a_data["shapes"][i1]["shape_pt_sequence"])) {
				c_temp_shapes.push({"shape_id": a_data["shapes"][i1]["shape_id"], "shape_pt_lat": a_data["shapes"][i1]["shape_pt_lat"], "shape_pt_lon": a_data["shapes"][i1]["shape_pt_lon"], "shape_pt_sequence": a_data["shapes"][i1]["shape_pt_sequence"]});
			}
		}
		a_data["shapes"] = c_temp_shapes;
	}
	for (let i1 = 0; i1 < a_data["routes"].length; i1++) {
		let l_trip_id; //代表のtrip_id
		let l_shape_id = null;
		let l_exist = 0; //shapes_idがあれば+1
		let l_first = true; //最初のtrip
		
		//console.log(a_data["routes"]);
		
		for (let i2 = 0; i2 < a_data["trips"].length; i2++) {
			if (a_data["routes"][i1]["route_id"] === a_data["trips"][i2]["route_id"]) {
				l_trip_id = a_data["trips"][i2]["trip_id"];
				if (a_data["trips"][i2]["shape_id"] === undefined || a_data["trips"][i2]["shape_id"] === "") { //shape_idがない場合、補完する
					a_data["trips"][i2]["shape_id"] = "shape_id_" + a_data["routes"][i1]["route_id"];
				}
				if (l_shape_id === null) {
					l_shape_id = a_data["trips"][i2]["shape_id"];
				} else if (l_shape_id !== a_data["trips"][i2]["shape_id"]) {
					//document.getElementById("div_status").innerHTML +="このGTFSは非対応";
					console.log("このGTFSは非対応");
				}
				for (let i3 = 0; i3 < a_data["shapes"].length; i3++) {
					if (a_data["shapes"][i3]["shape_id"] === l_shape_id && l_first === true) { //shapesがすでにある
						l_exist += 1;
						if (l_exist >= 2) {
							break;
						}
					}
				}
				l_first = false;
			}
		}
		//すでにあるなら次へ
		if (l_exist >= 2) {
			continue;
		} else if (l_exist === 1) {
			console.log(l_shape_id + "を削除");
			for (let i2 = 0; i2 < a_data["shapes"].length; i2++) {
				if (a_data["shapes"][i2]["shape_id"] === l_shape_id) { //shapesがすでにある
					a_data["shapes"][i2]["shape_id"] = null;
				}
			}
		}
		const c_shape_temp = []; //仮にstop_timesと緯度経度を集める
		for (let i2 = 0; i2 < a_data["stop_times"].length; i2++) {
			if (a_data["stop_times"][i2]["trip_id"] === l_trip_id) {
				for (let i3 = 0; i3 < a_data["stops"].length; i3++) {
					if (a_data["stop_times"][i2]["stop_id"] === a_data["stops"][i3]["stop_id"]) {
						c_shape_temp.push({
							"shape_id": l_shape_id,
							"shape_pt_lat": a_data["stops"][i3]["stop_lat"],
							"shape_pt_lon": a_data["stops"][i3]["stop_lon"],
							"shape_pt_sequence": a_data["stop_times"][i2]["stop_sequence"]
						});
						break;
					}
				}
			}
		}
		c_shape_temp.sort(function(a1,a2) {
			if (a1["shape_pt_sequence"] < a2["shape_pt_sequence"]) {
				return -1;
			}
			if (a1["shape_pt_sequence"] > a2["shape_pt_sequence"]) {
				return 1;
			}
			return 0;
		});
		a_data["shapes"] = a_data["shapes"].concat(c_shape_temp);
	}
}