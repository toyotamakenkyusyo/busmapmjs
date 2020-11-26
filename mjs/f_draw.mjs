import {f_lonlat_xy} from "./f_lonlat_xy.mjs";
import {f_set_width_offset} from "./f_set_width_offset.mjs";
import {f_offset_segment_array} from "./f_offset_segment_array.mjs";

import {f_make_polyline} from "./f_make_polyline.mjs";
import {f_cut_polyline} from "./f_cut_polyline.mjs";
import {f_search_route} from "./f_search_route.mjs";






export function f_draw(a_bmd, a_settings) {
	
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
	
	//端の位置を調べる
	let l_top_lat = -90;
	let l_bottom_lat = 90;
	let l_left_lon = 180;
	let l_right_lon = -180;
	for (let i1 = 0; i1 < a_bmd["ur_stops"].length; i1++) {
		l_top_lat = Math.max(l_top_lat, a_bmd["ur_stops"][i1]["stop_lat"]);
		l_bottom_lat = Math.min(l_bottom_lat, a_bmd["ur_stops"][i1]["stop_lat"]);
		l_left_lon = Math.min(l_left_lon, a_bmd["ur_stops"][i1]["stop_lon"]);
		l_right_lon = Math.max(l_right_lon, a_bmd["ur_stops"][i1]["stop_lon"]);
	}
	const c_top_y16 = Math.floor(f_lonlat_xy(l_top_lat, "lat_to_y", 16));
	const c_bottom_y16 = Math.ceil(f_lonlat_xy(l_bottom_lat, "lat_to_y", 16));
	const c_left_x16 = Math.floor(f_lonlat_xy(l_left_lon, "lon_to_x", 16));
	const c_right_x16 = Math.ceil(f_lonlat_xy(l_right_lon, "lon_to_x", 16));
	
	//SVG作成
	const c_svg_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	//c_svg_svg.setAttributeNS(null, "xmlns", "http://www.w3.org/2000/svg");
	//c_svg_svg.setAttributeNS(null, "xmlns:xlink", "http://www.w3.org/1999/xlink");
	//c_svg_svg.setAttributeNS(null, "version", "1.1");
	//c_svg_svg.setAttributeNS(null, "width", "768px");
	//c_svg_svg.setAttributeNS(null, "height", "512px");
	//c_svg_svg.setAttributeNS(null, "viewBox", "0 0 768 512");
	const c_width_x16 = 256 * (c_right_x16 - c_left_x16 + 1);
	const c_height_y16 = 256 * (c_bottom_y16 - c_top_y16 + 1);
	c_svg_svg.setAttributeNS(null, "width", String(c_width_x16) + "px");
	c_svg_svg.setAttributeNS(null, "height", String(c_height_y16) + "px");
	c_svg_svg.setAttributeNS(null, "viewBox", "0 0 " + String(c_width_x16) + " " + String(c_height_y16));
	
	
	console.log(document.getElementById(a_settings["div_id"]));
	document.getElementById(a_settings["div_id"]).appendChild(c_svg_svg);
	const c_svg_g1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
	c_svg_g1.setAttributeNS(null, "id", "g_all");
	//c_svg_g1.setAttributeNS(null, "transform", "translate(-57125,-25860) scale(2,2)");
	const c_sz = 256;
	
	console.log(String(c_left_x16) + "," + String(c_top_y16));
	c_svg_g1.setAttributeNS(null, "transform", "translate(" + String(-1 * c_left_x16 * c_sz) + "," + String(-1 * c_top_y16 * c_sz) + ") scale(" + String(c_sz) + "," + String(c_sz) + ")");
	c_svg_svg.appendChild(c_svg_g1);
	
	
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
		console.log(c_zoom_ratio);
		
		a_bmd["index_zoom_" + String(i1)] = {};
		for (let i2 = 0; i2 < a_bmd["parent_routes"].length; i2++) {
			const c_parent_route_id = a_bmd["parent_routes"][i2]["parent_route_id"];
			a_bmd["index_zoom_" + String(i1)][c_parent_route_id] = [];
		}
		if (a_settings["leaflet"] === true) {
			a_bmd["layer_zoom_" + String(i1)] = L.layerGroup();
			c_groups["zoom_" + String(i1)] = L.layerGroup();
		}
		//SVGのグループ作成（ズームレベルごと）
		const c_svg_g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
		c_svg_g2.setAttributeNS(null, "id", "g_zoom_" + String(i1));
		c_svg_g1.appendChild(c_svg_g2);
		
		//経路線
		const c_svg_paths = document.createElementNS("http://www.w3.org/2000/svg", "g");
		c_svg_paths.setAttributeNS(null, "id", "g_paths_" + String(i1));
		c_svg_g2.appendChild(c_svg_paths);
		
		//停車表示
		const c_svg_stop_types = document.createElementNS("http://www.w3.org/2000/svg", "g");
		c_svg_stop_types.setAttributeNS(null, "id", "g_stop_types_" + String(i1));
		c_svg_g2.appendChild(c_svg_stop_types);
		
		//停留所名
		const c_svg_stop_names = document.createElementNS("http://www.w3.org/2000/svg", "g");
		c_svg_stop_names.setAttributeNS(null, "id", "g_stop_names_" + String(i1));
		c_svg_g2.appendChild(c_svg_stop_names);
			
		
		
		
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
					//c_polyline[i3]["ids"] = []; //使われていなさそう
				}
				for (const i4 of c_polyline[i3]["ids"]) {
					c_polyline[i3]["near_stops"] = c_polyline[i3]["near_stops"].concat(a_bmd["shape_points"][i4]["near_stops"]);
				}
			}
			
			if (a_bmd["ur_routes"][i2]["stop_array"] === undefined) {
				a_bmd["ur_routes"][i2]["stop_array"] = [];
			}
			
			const c_cut_polyline = f_cut_polyline(c_polyline, a_bmd["ur_routes"][i2]["stop_array"]);
			const c_parent_route_id = a_bmd["ur_routes"][i2][a_settings["parent_route_id"]];
			//親のroutecolor
			let l_route_color;
			for (let i3 = 0; i3 < a_bmd["parent_routes"].length; i3++) {
				if (c_parent_route_id === a_bmd["parent_routes"][i3]["parent_route_id"]) {
					if (a_bmd["parent_routes"][i3]["route_color"] === undefined || a_bmd["parent_routes"][i3]["route_color"] === "") {
						//l_route_color = "808080"
						a_bmd["parent_routes"][i3]["route_color"] = Math.round((Math.random() * 15)).toString(16) + "F" + Math.round((Math.random() * 15)).toString(16) + "F" + Math.round((Math.random() * 15)).toString(16) + "F"; //本来はFFFFFF
					}
					l_route_color = a_bmd["parent_routes"][i3]["route_color"];
					break;
				}
			}
			
			
			if (a_settings["round"] === true) { //角を丸める＜注意＞未完成でoffsetと連動していない
				for (let i3 in c_cut_polyline["curves"]) {
					if (a_settings["leaflet"] === true) {
						if (c_groups["parent_route_id_" + c_parent_route_id][i3] === undefined) {
							c_groups["parent_route_id_" + c_parent_route_id][i3] = L.featureGroup();
						}
						for (let i4 = 0; i4 < c_cut_polyline["curves"][i3].length; i4++) {
							//console.log(c_cut_polyline["curves"][i3][i4]["curve"]);
							
							const c_curve = L.curve(c_cut_polyline["curves"][i3][i4]["curve"], {"color": "#" + l_route_color/*a_bmd["ur_routes"][i2]["route_color"]*/, "weight": c_cut_polyline["curves"][i3][i4]["width"] * 256 /  c_zoom_ratio});
							
							//クリックしたとき
							c_curve.on("click", function(e) {
								f_change_parent_route_color(c_parent_route_id, i3);
							});
							
							c_groups["parent_route_id_" + c_parent_route_id][i3].addLayer(c_curve);
							c_groups["zoom_" + String(i1)].addLayer(c_curve);
						}
					} else { //SVG単独出力
						for (let i4 = 0; i4 < c_cut_polyline["curves"][i3].length; i4++) {
							const c_svg_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
							c_svg_path.setAttributeNS(null, "fill", "none");
							c_svg_path.setAttributeNS(null, "stroke", "#" + l_route_color);
							c_svg_path.setAttributeNS(null, "stroke-width", c_cut_polyline["svg_paths"][i3][i4]["stroke-width"]);
							c_svg_path.setAttributeNS(null, "d", c_cut_polyline["svg_paths"][i3][i4]["d"]);
							c_svg_paths.appendChild(c_svg_path);
						}
					}
				}
			}
			
			for (let i3 = 0; i3 < c_cut_polyline["stop_array"].length; i3++) {
				if (a_settings["leaflet"] === true) {
					a_bmd["layer_zoom_" + String(i1)].addLayer(L.circle(c_cut_polyline["stop_array"][i3], {"radius": 2, "stroke": 1, "color": "#000000", "fill": true, "fillColor": "#FFFFFF"}));
				} else {
					const c_svg_circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
					c_svg_circle.setAttributeNS(null, "fill", "#FFFFFF");
					c_svg_circle.setAttributeNS(null, "stroke", "#000000");
					c_svg_circle.setAttributeNS(null, "stroke-width", 2 ** (-8));
					c_svg_circle.setAttributeNS(null, "r", 2 * 2 ** (-8));
					c_svg_circle.setAttributeNS(null, "cx", c_cut_polyline["stop_circles"][i3]["x"]);
					c_svg_circle.setAttributeNS(null, "cy", c_cut_polyline["stop_circles"][i3]["y"]);
					c_svg_stop_types.appendChild(c_svg_circle);
				}
			}
			
			
		}
		
		//停留所名
		//簡易同名チェック
		const c_name_check = {};
		if (a_settings["leaflet"] !== true) {
			for (let i2 = 0; i2 < a_bmd["parent_stations"].length; i2++) {
				if (c_name_check[a_bmd["parent_stations"][i2]["stop_name"]] === true) {
					continue;
				}
				c_name_check[a_bmd["parent_stations"][i2]["stop_name"]] = true;
				const c_svg_text = document.createElementNS("http://www.w3.org/2000/svg", "text");
				c_svg_text.setAttributeNS(null, "fill", "#000000");
				c_svg_text.setAttributeNS(null, "x", f_lonlat_xy(a_bmd["parent_stations"][i2]["stop_lon"], "lon_to_x", 16) + 8 * (2 ** (-8)));
				c_svg_text.setAttributeNS(null, "y", f_lonlat_xy(a_bmd["parent_stations"][i2]["stop_lat"], "lat_to_y", 16) + 16 * (2 ** (-8)));
				c_svg_text.setAttributeNS(null, "font-size", 16 * 2 ** (-8));
				c_svg_text.style.fontFamily = "源ノ角ゴシック";
				c_svg_text.textContent = a_bmd["parent_stations"][i2]["stop_name"];
				c_svg_stop_names.appendChild(c_svg_text);
			}
		}
		console.log(c_svg_g2);
	}
	
	
	console.timeEnd("u4");
	console.time("u5");
	let c_leaflet_map = null;
	if (a_settings["leaflet"] === true) {
		/*const */c_leaflet_map = window.busmapjs[a_settings["busmapjs_id"]].leaflet_map;
		for (let i1 = 0; i1 < a_bmd["parent_stations"].length; i1++) {
			L.marker({"lon": a_bmd["parent_stations"][i1]["stop_lon"], "lat": a_bmd["parent_stations"][i1]["stop_lat"]}, {"icon": L.divIcon({"html": "<span style=\"writing-mode: " + a_settings["writing_mode"] + ";\" onclick=\"f_set_stop_id('" + a_bmd["parent_stations"][i1]["stop_id"] + "');\">" + a_bmd["parent_stations"][i1]["stop_name"] + "</span>", className: "className", iconSize: [256, 256], iconAnchor: [-4, -4]})}).addTo(c_leaflet_map);
		}
	}
	
	console.timeEnd("u5");
	console.time("u6");
	if (a_settings["leaflet"] === true) {
		f_zoom();
		//ズームレベル変更→leaflet変更
		c_leaflet_map.on("zoom", f_zoom);
	}
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