import {f_lonlat_xy} from "./f_lonlat_xy.mjs";
export function f_simplify_shapes(a_shapes) {
	console.time("f_simplify_shapes");
	//shape_idごとに分ける
	//EPSG:3857に変換する
	const c_shape_pt_orders = {};
	for (const c_shape of a_shapes) {
		if (c_shape_pt_orders[c_shape["shape_id"]] === undefined) {
			c_shape_pt_orders[c_shape["shape_id"]] = [];
		}
		c_shape_pt_orders[c_shape["shape_id"]].push({
			"shape_pt_id": String(c_shape["shape_pt_lon"]) + "_" + String(c_shape["shape_pt_lat"]),
			"shape_pt_sequence": Number(c_shape["shape_pt_sequence"])
		});
	}
	//整列する
	for (const c_shape_id in c_shape_pt_orders) {
		c_shape_pt_orders[c_shape_id] = f_sort(c_shape_pt_orders[c_shape_id], "shape_pt_sequence");
	}
	//同じ点の重複を除去する
	for (const c_shape_id in c_shape_pt_orders) {
		const c_new_order = [];
		for (let i1 = 0; i1 < c_shape_pt_orders[c_shape_id].length; i1++) {
			const c_shape_pt_id = c_shape_pt_orders[c_shape_id][i1]["shape_pt_id"];
			if (c_new_order[c_new_order.length - 1] === c_shape_pt_id) { //前と同じ点は除く
				continue;
			}
			c_new_order.push(c_shape_pt_id);
		}
		c_shape_pt_orders[c_shape_id] = c_new_order;
	}
	
	//点を集める
	const c_shape_points = {};
	for (const c_shape_id in c_shape_pt_orders) {
		for (let i1 = 0; i1 < c_shape_pt_orders[c_shape_id].length; i1++) {
			const c_shape_pt_id = c_shape_pt_orders[c_shape_id][i1];
			if (c_shape_points[c_shape_pt_id] === undefined) {
				c_shape_points[c_shape_pt_id] = {"next_shape_pt_ids": {}, "end": false};
			}
			if (i1 === 0) {
				c_shape_points[c_shape_pt_id]["end"] = true;
				c_shape_points[c_shape_pt_id]["next_shape_pt_ids"][c_shape_pt_orders[c_shape_id][i1 + 1]] = true;
			} else if (i1 === c_shape_pt_orders[c_shape_id].length - 1) {
				c_shape_points[c_shape_pt_id]["end"] = true;
				c_shape_points[c_shape_pt_id]["next_shape_pt_ids"][c_shape_pt_orders[c_shape_id][i1 - 1]] = true;
			} else {
				c_shape_points[c_shape_pt_id]["next_shape_pt_ids"][c_shape_pt_orders[c_shape_id][i1 + 1]] = true;
				c_shape_points[c_shape_pt_id]["next_shape_pt_ids"][c_shape_pt_orders[c_shape_id][i1 - 1]] = true;
			}
		}
	}
	//分岐点もendをtrueにしておく
	for (const c_shape_pt_id in c_shape_points) {
		if (Object.keys(c_shape_points[c_shape_pt_id]["next_shape_pt_ids"]).length > 2) {
			c_shape_points[c_shape_pt_id]["end"] = true;
		}
	}
	//分岐点と端点で区切ったリンクを集める
	//置き換えたshape_pt_arrayを作成
	const c_links = {};
	const c_new_shape_pt_orders = {};
	for (const c_shape_id in c_shape_pt_orders) {
		//最初の点をあらかじめ追加
		const c_shape_pt_id_0 = c_shape_pt_orders[c_shape_id][0];
		c_new_shape_pt_orders[c_shape_id] = [c_shape_pt_id_0];
		let l_link_1 = c_shape_pt_id_0;
		let l_link_2 = c_shape_pt_id_0;
		//2点目から
		for (let i1 = 1; i1 < c_shape_pt_orders[c_shape_id].length; i1++) {
			const c_shape_pt_id = c_shape_pt_orders[c_shape_id][i1];
			l_link_1 = l_link_1 + "__" + c_shape_pt_id;
			l_link_2 = c_shape_pt_id + "__" + l_link_2;
			if (i1 !== 0 && c_shape_points[c_shape_pt_id]["end"] === true) {
				if (c_links[l_link_1] === undefined && c_links[l_link_2] === undefined) { //ない場合は簡素化を追加
					console.log("簡素化確認");
					console.log(l_link_1.split("__").length);
					c_links[l_link_1] = f_simplify_polyline(l_link_1.split("__"));
					console.log(c_links[l_link_1].length);
				}
				if (c_links[l_link_1] !== undefined) {
					for (let i2 = 1; i2 < c_links[l_link_1].length; i2++) { //最初は重複するので除く
						c_new_shape_pt_orders[c_shape_id].push(c_links[l_link_1][i2]);
					}
				} else if (c_links[l_link_2] !== undefined) {
					for (let i2 = c_links[l_link_2].length - 2; i2 >= 0; i2--) { //最初は重複するので除く
						c_new_shape_pt_orders[c_shape_id].push(c_links[l_link_2][i2]);
					}
				}
				//次の最初
				l_link_1 =  c_shape_pt_id;
				l_link_2 =  c_shape_pt_id;
			}
		}
	}
	
	
	//shapesの形に変換
	const c_new_shapes = [];
	for (const c_shape_id in c_new_shape_pt_orders) {
		for (let i1 = 0; i1 < c_new_shape_pt_orders[c_shape_id].length; i1++) {
			c_new_shapes.push({
				"shape_id": c_shape_id,
				"shape_pt_lon": Number(c_new_shape_pt_orders[c_shape_id][i1].split("_")[0]),
				"shape_pt_lat": Number(c_new_shape_pt_orders[c_shape_id][i1].split("_")[1]),
				"shape_pt_sequence": i1,
			});
		}
	}
	console.timeEnd("f_simplify_shapes");
	return c_new_shapes;
}


function f_sort(a_array, a_key) {
	function f_sort_2(a1, a2) {
		if (a1[a_key] < a2[a_key]) {
			return -1;
		}
		if (a1[a_key] > a2[a_key]) {
			return 1;
		}
		return 0;
	}
	return a_array.sort(f_sort_2);
}


function f_simplify_polyline(a_array) {
	//整理
	const c_polyline = [];
	for (let i1 = 0; i1 < a_array.length; i1++) {
		c_polyline.push({
			"x": f_lonlat_xy(Number(a_array[i1].split("_")[0]), "lon_to_x", "m"),
			"y": f_lonlat_xy(Number(a_array[i1].split("_")[1]), "lat_to_y", "m"),
			"id": a_array[i1],
			"exist": true, //残っていればtrue
		});
	}
	//1点ずつ除去し、元との距離（点と直線の距離）が上限以内にとどめる
	//残っている点Pを消すとき、Pの前後で残っている点の間のすべての点が影響を受ける。影響が最大のものを基準にする
	//高速化は、様子見であとで考え、完全に逐次1点ずつではじめてみるか
	let l_exist = true;
	while (l_exist === true) { //除去した点があれば繰り返す
		//もっとも消す影響が少ない点を探す
		let l_min = Number.MAX_SAFE_INTEGER; //適当に大きい数
		let l_arg_min;
		let l_pre_index;
		let l_index = 0; // 最初用（ずれるので注意）
		let l_post_index;
		//最初の途中点を予め見つけておく
		for (let i1 = 1; i1 < c_polyline.length; i1++) {
			if (c_polyline[i1]["exist"] === true) {
				l_post_index = i1;
				break;
			}
		}
		const c_start = l_post_index + 1;
		for (let i1 = c_start; i1 < c_polyline.length; i1++) {
			if (c_polyline[i1]["exist"] === false) {
				continue;
			} else if (c_polyline[i1]["exist"] === true) {
				l_pre_index = l_index;
				l_index = l_post_index;
				l_post_index = i1;
				//l_indexを消した時の影響を求める
				let l_max_distance = 0;
				const c_1x = c_polyline[l_pre_index]["x"];
				const c_1y = c_polyline[l_pre_index]["y"];
				const c_3x = c_polyline[l_post_index]["x"];
				const c_3y = c_polyline[l_post_index]["y"];
				for (let i2 = l_pre_index + 1; i2 < l_post_index; i2++) { //最初と最後は除く
					//各途中点と直線の距離を求める（最大のみ記録）
					const c_2x = c_polyline[i2]["x"];
					const c_2y = c_polyline[i2]["y"];
					const c_distance = f_distance(c_1x, c_1y, c_2x, c_2y, c_3x, c_3y);
					if (l_max_distance < c_distance) {
						l_max_distance = c_distance;
					}
				}
				if (l_min > l_max_distance) {
					l_min = l_max_distance;
					l_arg_min = l_index;
				}
			}
		}
		//最小の点が基準以内なら消す
		l_exist = false;
		if (l_min < 4) { //仮に40m以内（単位はメートル）
			c_polyline[l_arg_min]["exist"] = false;
			l_exist = true;
		}
	}
	//残った点のみを返す
	const c_new_array = [];
	for (let i1 = 0; i1 < c_polyline.length; i1++) {
		if (c_polyline[i1]["exist"] === true) {
			c_new_array.push(c_polyline[i1]["id"]);
		}
	}
	return c_new_array;
}


function f_distance(a1x, a1y, a2x, a2y, a3x, a3y) { //1と3を通る直線と点2の距離
	if (a1x === a3x && a1y === a3y) {
		console.log("同じ点で直線にならない"); //折り返す場合など？
		return Number.MAX_SAFE_INTEGER; //適当に大きい数、除去できない扱いとする
	} else if (a1x === a3x) {
		return Math.abs(a2x - a1x);
	} else if (a1y === a3y) {
		return Math.abs(a2y - a1y);
	} else {
		const c_a = 1 / (a3x - a1x);
		const c_b = -1 / (a3y - a1y);
		return Math.abs(c_a * (a2x - a1x) + c_b * (a2y - a1y)) / ((c_a ** 2 + c_b ** 2) ** 0.5);
	}
}



