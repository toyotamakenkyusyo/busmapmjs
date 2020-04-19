export async function f_main(a_settings) {

	console.time("T");
	console.time("t0");
	a_settings = f_input_settings(a_settings); //初期設定
	document.getElementById(a_settings["div_id"]).innerHTML = f_html(a_settings); //HTMLの初期設定
	
	//設定変更
	if (a_settings["change"] === true) {
		window.busmapjs[a_settings["busmapjs_id"]] = {};
		window.busmapjs[a_settings["busmapjs_id"]].settings = a_settings;
		window.busmapjs.f_change_setting = function f_change_setting(a_busmapjs_id, a_key, a_value) {
			window.busmapjs[a_busmapjs_id].settings[a_key] = a_value;
			console.log("td_" + a_busmapjs_id + "_" + a_key);
			document.getElementById("td_" + a_busmapjs_id + "_" + a_key).innerHTML = a_value;
		}
	}
	
	//leafletの初期設定
	if (a_settings["leaflet"] === true) {
		window.busmapjs[a_settings["busmapjs_id"]].leaflet_map = L.map("div_leaflet"); //leafletの読み込み。
		const c_leaflet_map = window.busmapjs[a_settings["busmapjs_id"]].leaflet_map;
		if (a_settings["background_map"] === true) {
			for (let i1 = 0; i1 < a_settings["background_layers"].length; i1++) {
				L.tileLayer(a_settings["background_layers"][i1][0], a_settings["background_layers"][i1][1]).addTo(c_leaflet_map); //背景地図（地理院地図等）を表示する。
			}
		}
		L.svg().addTo(c_leaflet_map); //svg地図を入れる。
		if (a_settings["set_view_latlon"] !== null && a_settings["set_view_zoom"] !== null) {
			c_leaflet_map.setView(a_settings["set_view_latlon"], a_settings["set_view_zoom"]); //初期表示位置（仮）
		}
	}
	console.timeEnd("t0");
	//a_settings["data"] = "https://toyotamakenkyusyo.github.io/gtfs/3270001000564/next/GTFS-JP.zip"; //仮
	//a_settings["data"] = "test.geojson"; //仮
	//a_settings["data_type"] = "geojson"; //仮
	
	//データの読み込みと前処理
	let l_data = {};
	if (a_settings["data_type"] === "gtfs") {
		console.time("t11");
		const c_csvs = f_zip_to_text(await f_xhr_get(a_settings["data"], "arraybuffer"), Zlib); //Zlibはhttps://cdn.jsdelivr.net/npm/zlibjs@0.3.1/bin/unzip.min.jsにある
		for (let i1 in c_csvs) {
			l_data[i1.replace(".txt", "")] = f_csv_to_json(c_csvs[i1]);
		}
		console.timeEnd("t11");
		console.time("t12");
		f_set_stop_type(l_data); //pickup_typeとdrop_off_typeを補う（ur_routesを作るため）
		f_set_route_sort_order(l_data); //route_sort_orderを補う（ur_routesを作るため）
		f_number_gtfs(l_data); //緯度、経度、順番の型を数に変換
		console.timeEnd("t12");
		console.time("t13");
		f_make_ur_routes(l_data); //ur_routesを作る
		console.timeEnd("t13");
	} else if (a_settings["data_type"] === "json" || a_settings["data_type"] === "geojson" || a_settings["data_type"] === "topojson" || a_settings["data_type"] === "api") {
		l_data = await f_xhr_get(a_settings["data"], "json");
		if (a_settings["data_type"] === "topojson") {
			l_data = f_from_topojson(l_data);
		} else if (a_settings["data_type"] === "geojson") {
			l_data = f_from_geojson(l_data);
			l_data["routes"] = l_data["ur_routes"]; //臨時に追加
		} else if (a_settings["data_type"] === "api") {
			l_data = f_from_api(l_data);
		}
		//この時点では、stops、ur_routesのみ
		//stop_nameを補う
		//a_data["calendar"] = []; //仮、互換性
		//a_data["ur_routes"][i1]["service_array"] = ""; //仮の処置
		//a_data["ur_routes"][i1]["trip_number"] = 999; //仮に999とする。
		f_prepare_json(l_data);
	} else {
		new Error("読み込みできないタイプ");
	}
	console.time("t2");
	
	f_set_color(l_data); //route_color、route_text_colorを補う
	f_make_shape_pt_array(l_data); //shape_pt_arrayを加える
	f_make_parent_stations(l_data); //stopsをur_stopsとparent_stationsに分け、location_typeを補う
	f_count_trip_number(l_data);//便数を数える
	
	//GTFS-RTの読み込み
	l_data["rt"] = null;
	if (typeof a_settings["rt"] === "string") {
		const c_grb = module.exports.transit_realtime;
		const c_cors_url = a_settings["cors_url"]; //クロスオリジンを回避するphpをかませる
		const c_rt_url = c_cors_url + a_settings["rt"];
		a_data["rt"] = f_binary_to_json(await f_xhr_get(c_rt_url, "arraybuffer"), c_grb);
	}
	
	console.log(l_data);
	const c_bmd = {
		"rt": l_data["rt"],
		"stops": l_data["stops"],
		"ur_stops": l_data["ur_stops"],
		"parent_stations": l_data["parent_stations"],
		"ur_routes": l_data["ur_routes"],
		"calendar": l_data["calendar"],
		"trips": l_data["trips"],
		"stop_times": l_data["stop_times"]//,
	};
	
	if (a_settings["change"] === true) {
		//当面機能停止
		//document.getElementById("ur_route_list").innerHTML = f_ur_route_list(c_bmd);
	}
	console.timeEnd("t2");
	console.time("t3");
	f_make_shape_segments(c_bmd, f_lonlat_xy, a_settings); //新規
	console.timeEnd("t3");
	console.timeEnd("T");
	console.time("U");
	window.busmapjs.f_draw(c_bmd, a_settings); //6s遅い！
	console.timeEnd("U");
	
}









/*
各系統の停留所リストは途中の欠損禁止。
停留所一覧の欠損も禁止。
緯度経度の欠損は可。

現状
"calendar":[{"service_id": "平日", "monday": "1", "start_date": "20181201", "end_date": "20190331"}]
, "stops": [{"location_type": "0", "parent_station": "市役所_parent", "stop_id": "1001-1", "stop_name": "市役所", "stop_lat": 35, "stop_lon": 138}]
, "trips": []
, "ur_routes": [{"agency_id": "122", "route_color": "002200", "route_id": "101010", "route_long_name": "A線", "route_short_name": "A", "route_text_color": "FFFFFF", "service_array": ["service_id": "平日", "number": 12], "shape_pt_array": [{"shape_id": "A", "shape_pt_lat": 35, "shape_pt_lon": 137, "shape_pt_sequence": 2}], "stop_array": [{"stop_id": "1101-1", "stop_number": 23, "drop_off_type": "1", "pickup_type": "0"}]}]
*/