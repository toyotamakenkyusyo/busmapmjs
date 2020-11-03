import { LatLon } from "../interface/UrRoute";
import { ZoomLevel } from "../interface/XYZ";

/**
 * @typedef 入力ファイル形式
 * @description この形式に応じて処理を変更する
 */
export type SourceType = "gtfs" | "json" | "geojson" | "topojson" | "api";

/**
 * @typedef Config busmapjsの諸設定
 */
export type Config = {
    // 全てのconfigをここに詰め込むより、いくつかに分けて設定したい……

    /**
     * @property CORSの問題を回避するため、間にサーバーサイドのプログラムを挟む場合に前に加えるURL
     */
    cors_url?: string,

    /**
     * @property GTFS-RTの読込を行うかどうか
     */
    rt?: boolean,

    /**
     * @property データのURL文字列
     */
    data?: string,
    /**
     * @property 取り込むファイル形式
     */
    data_type?: SourceType,

    /**
     * @property ？？？？？？？？？？
     */
    busmapjs_id?: string,

    /**
     * @property 作成した内容をhtmlのどこへ挿入するか
     * @description divのidを指定する
     */
    div_id?: string,

    /**
     * 
     * @description trueの場合、値をc_globalに渡し、変更可能にする
     */
    global?: boolean,

    /**
     * @property trueの場合、設定を変更する
     */
    change?: boolean,

    /**
     * @property trueの場合、使用
     */
    leaflet?: boolean,

    /**
     * @property Leafletの初期表示位置の緯度経度（[35, 135]）
     * @default {lat:35,lon:135}
     */
    set_view_latlon?: null | LatLon,

    /**
     * @property Leafletの初期表示位置のズームレベル（16）
     * @default 16
     */
    set_view_zoom?: null | number,

    /**
     * @property 線等をクリックできるかどうか
     */
    clickable?: boolean,

    /**
     * @property 時刻表を表示するかどうか
     */
    timetable?: boolean,

    /**
     * @property trueの場合、上り下りを分けて描画する
     */
    direction?: boolean,

    /**
     * まとめる単位
     */
    parent_route_id?: string,

    /**
     * trueの場合、表示する
     */
    stop_name?: boolean,

    /**
     * trueの場合、重なりを許容する
     */
    stop_name_overlap?: boolean,

    /**
     * 途中計算で使うズームレベル。なんでもよいが16にしておく。
     */
    zoom_level?: ZoomLevel,
    /**
     * @description 互換性のため残す
     */
    svg_zoom_level?: ZoomLevel,

    /**
     * @description f_cut_shape_segments用
     */
    cut_zoom_level?: ZoomLevel,

    /**
     * @description SVG表示縮小率=zoom_level - svg_zoom_level
     */
    svg_zoom_ratio?: number,
    /**
     * オフセットする最小ズームレベル
     * @description SVG出力時のズームレベル。表示される相対的なオフセット幅や文字サイズに影響する。
     * 1614は可変。拡大縮小のscaleはここを使う。
     */
    min_zoom_level?: ZoomLevel,

    /**
     * オフセットする最小ズームレベル
     */
    max_zoom_level?: ZoomLevel,

    /**
     * @property 背景地図を表示するかどうか。trueの場合、表示する
     */
    background_map?: boolean,

    /**
     * @property 背景地図の設定
     */
    background_layers?: [
        /**
         * 地図タイルのURL
         */
        string,
        {
            /**
             * 著作権表記のhtml
             */
            attribution: string,
            /**
             * 透過率
             */
            opacity: number
        }
    ][],
    /**
     * @property 停留所名のフォントサイズ
     */
    font_size?: number,

    /**
     * @property 停留所名のフォント
     * @description 二重のクオーテーションマークに注意
     */
    font_family?: string,
    /**
     * @description  //横書き（horizontal-tb）か縦書き（vertical-rl）か
     */
    writing_mode?: "horizontal-tb" | "vertical-rl",

    /**
     * 通常の停留所記号の色の16進数表記
     * @example "#000000"
     */
    stop_color_standard?: string,

    /**
     * 起終点等の停留所記号の色の16進数表記
     * @example "#FFFFFF"
     */
    stop_color_nonstandard?: string,

    /**
     * 位置を示す停留所記号の色
     */
    stop_color_location?: string,

    /**
     * 停留所記号の縁の色
     */
    stop_stroke_color?: string,

    /**
     * 停留所記号の縁の太さ
     */
    stop_stroke_width?: number,

    /**
     * 停留所位置の記号を表示
     */
    show_stop_location?: boolean,

    /**
     * 停留所記号を三角形にして向きを明示
     */
    stop_direction?: boolean,

    /**
     * 線の間隔の最小幅
     */
    min_space_width?: number,

    /**
     * 線の最小幅。単位はpx
     */
    min_width?: number,

    /**
     * 線の最大幅
     */
    max_width?: number,

    /**
     * @property 角を丸めるかどうか
     */
    round?: boolean
};

// 背景設定だけ既定値を切り出し
const bglayers: [string, {
    attribution: string,
    opacity: number
}][] = [[
    "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
    {
        attribution: '<a href=\"https://maps.gsi.go.jp/development/ichiran.html\">地理院タイル</a>',
        opacity: 0.25
    }
]];

/**
 * 既定値の指定
 */
const defaultConfig: Config = {
    cors_url: "",//CORSの問題を回避するため、間にサーバーサイドのプログラムを挟む場合に前に加えるURL
    rt: false,//GTFS-RTの読込
    data: "data",//データのURL
    data_type: "gtfs",//データがgtfs, json, geojson, topojson, apiか
    busmapjs_id: "busmapjs_1",
    div_id: "div",//挿入するdivのid
    global: true,//trueの場合、値をc_globalに渡し、変更可能にする
    change: true,
    leaflet: true,
    set_view_latlon: null, //Leafletの初期表示位置の緯度経度（[35, 135]）
    set_view_zoom: null, //Leafletの初期表示位置のズームレベル（16）
    clickable: true,//線等をクリックできる
    timetable: true,//時刻表を表示する
    direction: true,
    parent_route_id: "route_id",
    stop_name: true,
    stop_name_overlap: true,
    zoom_level: 16,
    svg_zoom_level: 16, //互換性のため残す
    cut_zoom_level: 16, //f_cut_shape_segments用
    svg_zoom_ratio: 0, //SVG表示縮小率=zoom_level - svg_zoom_level
    min_zoom_level: 12, //オフセットする最小ズームレベル
    max_zoom_level: 16, //オフセットする最小ズームレベル
    background_map: true,
    background_layers: bglayers,
    font_size: 16, //停留所名のフォントサイズ
    font_family: "'源ノ角ゴシック'", //停留所名のフォント、二重のクオーテーションマークに注意
    writing_mode: "horizontal-tb", //横書き（horizontal-tb）か縦書き（vertical-rl）か
    stop_color_standard: "#000000", //通常の停留所記号の色
    stop_color_nonstandard: "#FFFFFF", //起終点等の停留所記号の色
    stop_color_location: "#C0C0C0", //位置を示す停留所記号の色
    stop_stroke_color: "#000000", //停留所記号の縁の色
    stop_stroke_width: 1, //停留所記号の縁の太さ
    show_stop_location: true, //停留所位置の記号を表示
    stop_direction: true, //停留所記号を三角形にして向きを明示
    min_space_width: 2, //線の間隔の最小幅
    min_width: 4, //線の最小幅
    max_width: 8, //線の最大幅
    round: true //, //角を丸める
} as const;

export {
    defaultConfig
}