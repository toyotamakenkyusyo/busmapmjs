import {f_lonlat_xy} from "./f_lonlat_xy.js";
import {f_set_width_offset} from "./f_set_width_offset.js";
import {f_offset_segment_array} from "./f_offset_segment_array.js";

import {f_make_polyline} from "./f_make_polyline.js";
import {f_cut_polyline} from "./f_cut_polyline.js";
import {f_search_route} from "./f_search_route.js";

export function f_draw(a_bmd, a_settings) {
	const c_leaflet_map = window.busmapjs[a_settings["busmapjs_id"]].leaflet_map;
	console.time("u1");
	if (a_settings["change"] === true) {
		//表示するur_routeの設定
		//showはいずれにしても必要？
		//現在故障中。
		/*
		for (let i1 = 0; i1 < a_bmd["ur_routes"].length; i1++) {
			if (form1[a_bmd["ur_routes"][i1]["ur_route_id"]].checked) {
				a_bmd["ur_routes"][i1]["show"] = true;
			} else {
				a_bmd["ur_routes"][i1]["show"] = false;
			}
		}
		*/
	}
	console.timeEnd("u1");
	console.time("u2");
	f_set_width_offset(a_bmd, f_lonlat_xy, a_settings); //新規
	console.timeEnd("u2");
	console.time("u3");
	//オフセット
	const c_groups = {};
	for (let i1 = 0; i1 < a_bmd["parent_routes"].length; i1++) {
		const c_parent_route_id = a_bmd["parent_routes"][i1]["parent_route_id"];
		c_groups["parent_route_id_" + c_parent_route_id] = {};
	}
	console.timeEnd("u3");
	console.time("u4");
	for (let i1 = a_settings["min_zoom_level"]; i1 <= a_settings["max_zoom_level"]; i1++) {
		const c_zoom_ratio = 2 ** (16 - i1);
		console.log(c_zoom_ratio)
		a_bmd["layer_zoom_" + String(i1)] = L.layerGroup();
		a_bmd["index_zoom_" + String(i1)] = {};
		for (let i2 = 0; i2 < a_bmd["parent_routes"].length; i2++) {
			const c_parent_route_id = a_bmd["parent_routes"][i2]["parent_route_id"];
			a_bmd["index_zoom_" + String(i1)][c_parent_route_id] = [];
		}
		c_groups["zoom_" + String(i1)] = L.layerGroup();
		for (let i2 = 0; i2 < a_bmd["ur_route_child_shape_segment_arrays"].length; i2++) {
			const c_array_0 = []; //a_bmd["ur_route_child_shape_segment_arrays"][i1]のコピー
			for (let i3 = 0; i3 < a_bmd["ur_route_child_shape_segment_arrays"][i2].length; i3++) {
				c_array_0[i3] = {};
				for (let i4 in a_bmd["ur_route_child_shape_segment_arrays"][i2][i3]) {
					c_array_0[i3][i4] = a_bmd["ur_route_child_shape_segment_arrays"][i2][i3][i4];
				}
				c_array_0[i3]["sids"] = [c_array_0[i3]["sid"]];
				c_array_0[i3]["eids"] = [c_array_0[i3]["eid"]];
				c_array_0[i3]["w"] = c_array_0[i3]["w"] * c_zoom_ratio; //オフセット倍率を変更
				c_array_0[i3]["z"] = c_array_0[i3]["z"] * c_zoom_ratio; //オフセット倍率を変更
			}
			
			
			
			
			const c_array = f_offset_segment_array(c_array_0); //オフセット
			
			//console.log(c_array);
			//折れ線に変換する
			const c_polyline = f_make_polyline(c_array);
			//緯度経度
			const c_zoom_level = 16; //仮、set_width_offsetと同じ
			for (let i3 = 0; i3 < c_polyline.length; i3++) {
				c_polyline[i3]["lon"] = f_lonlat_xy(c_polyline[i3]["x"], "x_to_lon", c_zoom_level);
				c_polyline[i3]["lat"] = f_lonlat_xy(c_polyline[i3]["y"], "y_to_lat", c_zoom_level);
			}
			
			//near_stopsを入れる
			for (let i3 = 0; i3 < c_polyline.length; i3++) {
				c_polyline[i3]["near_stops"] = [];
				if (c_polyline[i3]["ids"] === undefined) {
					c_polyline[i3]["ids"] = [];
				}
				for (let i4 = 0; i4 < c_polyline[i3]["ids"].length; i4++) {
					const c_near_stops = a_bmd["shape_points"][c_polyline[i3]["ids"][i4]]["near_stops"];
					for (let i5 = 0; i5 < c_near_stops.length; i5++) {
						c_polyline[i3]["near_stops"].push(c_near_stops[i5]);
					}
				}
			}
			
			if (a_bmd["ur_routes"][i2]["stop_array"] === undefined) {
				a_bmd["ur_routes"][i2]["stop_array"] = [];
			}
			
			const c_cut_polyline = f_cut_polyline(c_polyline, a_bmd["ur_routes"][i2]["stop_array"]);
			const c_parent_route_id = a_bmd["ur_routes"][i2][a_settings["parent_route_id"]];
			if (a_settings["round"] === true) { //角を丸める＜注意＞未完成でoffsetと連動していない
				for (let i3 in c_cut_polyline["curves"]) {
					if (c_groups["parent_route_id_" + c_parent_route_id][i3] === undefined) {
						c_groups["parent_route_id_" + c_parent_route_id][i3] = L.featureGroup();
					}
					for (let i4 = 0; i4 < c_cut_polyline["curves"][i3].length; i4++) {
						//console.log(c_cut_polyline["curves"][i3][i4]["curve"]);
						//親のroutecolor
						let l_route_color;
						for (let i5 = 0; i5 < a_bmd["parent_routes"].length; i5++) {
							if (c_parent_route_id === a_bmd["parent_routes"][i5]["parent_route_id"]) {
								l_route_color = a_bmd["parent_routes"][i5]["route_color"];
								break;
							}
						}
						
						const c_curve = L.curve(c_cut_polyline["curves"][i3][i4]["curve"], {"color": "#" + l_route_color/*a_bmd["ur_routes"][i2]["route_color"]*/, "weight": c_cut_polyline["curves"][i3][i4]["width"] * 256 /  c_zoom_ratio});
						
						//クリックしたとき
						c_curve.on("click", function(e) {
							f_change_parent_route_color(c_parent_route_id, i3);
						});
						
						c_groups["parent_route_id_" + c_parent_route_id][i3].addLayer(c_curve);
						c_groups["zoom_" + String(i1)].addLayer(c_curve);
					}
				}
			}
			
			for (let i3 = 0; i3 < c_cut_polyline["stop_array"].length; i3++) {
				a_bmd["layer_zoom_" + String(i1)].addLayer(L.circle(c_cut_polyline["stop_array"][i3], {"radius": 2, "stroke": 1, "color": "#000000", "fill": true, "fillColor": "#FFFFFF"}));
			}
			
			
		}
	}
	
	
	console.timeEnd("u4");
	console.time("u5");
	
	for (let i1 = 0; i1 < a_bmd["parent_stations"].length; i1++) {
		L.marker({"lon": a_bmd["parent_stations"][i1]["stop_lon"], "lat": a_bmd["parent_stations"][i1]["stop_lat"]}, {"icon": L.divIcon({"html": "<span style=\"writing-mode: " + a_settings["writing_mode"] + ";\" onclick=\"f_set_stop_id('" + a_bmd["parent_stations"][i1]["stop_id"] + "');\">" + a_bmd["parent_stations"][i1]["stop_name"] + "</span>", className: "className", iconSize: [256, 256], iconAnchor: [-4, -4]})}).addTo(c_leaflet_map);
	}
	console.timeEnd("u5");
	console.time("u6");
	
	f_zoom();
	//ズームレベル変更→leaflet変更
	c_leaflet_map.on("zoom", f_zoom);
	console.timeEnd("u6");
	
	function f_zoom() {
		let l_zoom_level = c_leaflet_map.getZoom();
		if (l_zoom_level < a_settings["min_zoom_level"]) {
			l_zoom_level = a_settings["min_zoom_level"];
		}
		if (l_zoom_level > a_settings["max_zoom_level"]) {
			l_zoom_level = a_settings["max_zoom_level"];
		}
		for (let i1 = a_settings["min_zoom_level"]; i1 <= a_settings["max_zoom_level"]; i1++) {
			if (i1 === l_zoom_level) {
				c_groups["zoom_" + String(i1)].addTo(c_leaflet_map);
				a_bmd["layer_zoom_" + String(i1)].addTo(c_leaflet_map);
			} else {
				c_groups["zoom_" + String(i1)].remove(c_leaflet_map);
				a_bmd["layer_zoom_" + String(i1)].remove(c_leaflet_map);
			}
		}
	}
	
	//クリックしたところを強調
	function f_change_parent_route_color(a_parent_route_id, a_to) {
		for (let i1 = 0; i1 < a_bmd["parent_routes"].length; i1++) {
			const c_parent_route_id = a_bmd["parent_routes"][i1]["parent_route_id"];
			for (let i2 in c_groups["parent_route_id_" + c_parent_route_id]) {
				let l_color;
				if (c_parent_route_id === a_parent_route_id && i2 === a_to) {
					l_color = "#" + a_bmd["parent_routes"][i1]["route_color"];
				} else {
					l_color = "#C0C0C0";
				}
				c_groups["parent_route_id_" + c_parent_route_id][i2].setStyle({"color": l_color});
			}
		}
	}
	
	window.start_stop_id = null;
	window.end_stop_id = null;
	//停留所名をクリックして経路検索
	window.f_set_stop_id = function (a_stop_id) {
		window.start_stop_id = window.end_stop_id;
		window.end_stop_id = a_stop_id;
		console.log(window.start_stop_id + "→" + window.end_stop_id);
		
		f_show_search_route(window.start_stop_id, window.end_stop_id);
	}
	
	console.time("u7");
	
	//経路検索
	const c_parent_station_index = {};
	for (let i1 = 0; i1 < a_bmd["ur_stops"].length; i1++) {
		c_parent_station_index[a_bmd["ur_stops"][i1]["stop_id"]] = a_bmd["ur_stops"][i1]["parent_station"];
	}
	
	function f_show_search_route(a_start_parent_station, a_end_parent_station) {
		const c_route_se = f_search_route(a_start_parent_station, a_end_parent_station, a_bmd, c_parent_station_index);
		//parent_routeでまとめる
		const c_parent_route_se = {};
		for (let i1 = 0; i1 < a_bmd["ur_routes"].length; i1++) {
			const c_parent_route_id = a_bmd["ur_routes"][i1][a_settings["parent_route_id"]];
			if (c_parent_route_se["parent_route_id_" + c_parent_route_id] === undefined) {
				c_parent_route_se["parent_route_id_" + c_parent_route_id] = {};
			}
			for (let i2 = 0; i2 < c_route_se[i1].length; i2++) {
				const c_id = c_route_se[i1][i2];
				c_parent_route_se["parent_route_id_" + c_parent_route_id][c_id] = true;
			}
		}
		//表示に反映する
		for (let i1 = 0; i1 < a_bmd["parent_routes"].length; i1++) {
			const c_parent_route_id = a_bmd["parent_routes"][i1]["parent_route_id"];
			for (let i2 in c_groups["parent_route_id_" + c_parent_route_id]) {
				let l_color;
				if (c_parent_route_se["parent_route_id_" + c_parent_route_id][i2] === true) {
					l_color = "#" + a_bmd["parent_routes"][i1]["route_color"];
				} else {
					l_color = "#C0C0C0";
				}
				c_groups["parent_route_id_" + c_parent_route_id][i2].setStyle({"color": l_color});
			}
		}
	}
	
	
	
	console.timeEnd("u7");
	
	
	/*
	console.log(a_bmd);
	
	console.time("A");
	try { //tripが無いとエラーなので回避
		f_stop_array(a_bmd);
	} catch(e) {
	}
	console.timeEnd("A");
	console.time("L");
	if (a_settings["leaflet"] === true) {
		f_leaflet(a_bmd, a_settings);//この中に作ったsvgを入力して描画。
	} else {
		f_svg(a_bmd, a_settings);
	}
	console.timeEnd("L");
	*/
}