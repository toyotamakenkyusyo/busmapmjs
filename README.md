# busmapmjs
これは、GTFS等からバスマップを作るJavaScriptです。<a href="https://github.com/toyotamakenkyusyo/busmapjs">https://github.com/toyotamakenkyusyo/busmapjs</a>をmodule分割して、リニューアルをしているところです。  
XHTML5ではGoogle Chromeでmoduleが使えないため、HTML5でも作っています。
使用例は<a href="https://toyotamakenkyusyo.github.io/busmapmjs/busmapmjs.html">https://toyotamakenkyusyo.github.io/busmapmjs/busmapmjs.html</a>にあります。
使い方の説明などは、今後書く予定です。
## ファイルの説明
- <a href="busmapmjs.xhtml">busmapmjs.xhtml</a>  
- <a href="mjs/f_binary_to_mjson.mjs">mjs/f_binary_to_mjson.mjs</a>  
- <a href="mjs/f_csv_to_mjson.mjs">mjs/f_csv_to_mjson.mjs</a>  
GTFSの各CSVファイル（stops.txt等）をJavaScriptのobjectに変換する
- <a href="mjs/f_from_api.mjs">mjs/f_from_api.mjs</a>  
TraRepoのapiを読み込む
- <a href="mjs/f_from_geomjson.mjs">mjs/f_from_geomjson.mjs</a>  
独自形式GeomjsONを読み込む
- <a href="mjs/f_from_topomjson.mjs">mjs/f_from_topomjson.mjs</a>  
独自形式TopomjsONを読み込む、廃止予定
- <a href="mjs/f_html.mjs">mjs/f_html.mjs</a>  
ウェブページで表示するときの、Leafletや表示の設定を行うHTMLを書き出す
- <a href="mjs/f_input_settings.mjs">mjs/f_input_settings.mjs</a>
初期設定を読み込む
- <a href="mjs/f_lonlat_xy.mjs">mjs/f_lonlat_xy.mjs</a>  
緯度経度をxyと変換する
- <a href="mjs/f_make_bmd.mjs">mjs/f_make_bmd.mjs</a>  
使用停止？
- <a href="mjs/f_make_parent_stations.mjs">mjs/f_make_parent_stations.mjs</a>  
標柱のstopからparent_stationを作る
- <a href="mjs/f_make_shape_pt_array.mjs">mjs/f_make_shape_pt_array.mjs</a>  
- <a href="mjs/f_make_shape_segments.mjs">mjs/f_make_shape_segments.mjs</a>  
- <a href="mjs/f_make_ur_routes.mjs">mjs/f_make_ur_routes.mjs</a>  
- <a href="mjs/f_number_gtfs.mjs">mjs/f_number_gtfs.mjs</a>  
- <a href="mjs/f_offset_segment_array.mjs">mjs/f_offset_segment_array.mjs</a>  
- <a href="mjs/f_prepare_gtfs.mjs">mjs/f_prepare_gtfs.mjs</a>  
- <a href="mjs/f_prepare_mjson.mjs">mjs/f_prepare_mjson.mjs</a>  
- <a href="mjs/f_set_color.mjs">mjs/f_set_color.mjs</a>  
route_colorがない場合に設定する
- <a href="mjs/f_set_route_sort_order.mjs">mjs/f_set_route_sort_order.mjs</a>  
route_sort_orderがない場合に設定する
- <a href="mjs/f_set_stop_type.mjs">mjs/f_set_stop_type.mjs</a>  
- <a href="mjs/f_set_width_offset.mjs">mjs/f_set_width_offset.mjs</a>  
- <a href="mjs/f_stop_number.mjs">mjs/f_stop_number.mjs</a>  
- <a href="mjs/f_xhr_get.mjs">mjs/f_xhr_get.mjs</a>  
XMLHttpRequestにより外部ファイルを読み込む
- <a href="mjs/f_zip_to_text.mjs">mjs/f_zip_to_text.mjs</a>  
GTFSのZIPを展開して中のCSVファイルを読み込む
