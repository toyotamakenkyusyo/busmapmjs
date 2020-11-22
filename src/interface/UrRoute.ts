// "ur_routes": {
//     [key: string]: { //★行先経路ID
//         "sorted_stops": {
//             "ur_stop_id": string; //標柱ID
//             "pickup_type": number; //乗車可否
//             "drop_off_type": number; //降車可否
//         }[];
//         "sorted_shape_points": {
//             "shape_pt_lat": number; //描画点緯度
//             "shape_pt_lon": number; //描画点経度
//         }[];
//     }
// };

import { Trip } from "@come25136/gtfs";

/**
 * @typedef PickUpOrDropOffType 乗降分類数字
 * @description GTFSでいう、stop_timesのpickup_typeとdrop_off_type
 */
export type PickUpOrDropOffType = 0 | 1 | 2 | 3;

/**
 * @typedef StopOnRoute 標柱IDと、その標柱での乗降扱い
 * @description 系統ごとに管理する
 */
export type StopOnRoute = {
    ur_stop_id: string,
    pickup_type: PickUpOrDropOffType,
    drop_off : PickUpOrDropOffType
}

/**
 * @typedef LatLon 緯度経度の組み合わせ
 * @description Webでよく使われているWGS84の測地系
 */
export type LatLon = {
    lat: number,
    lon:number
}

/**
 * @typedef UrRoute 原子系統クラス
 * @description 系統ごとに、停留所配列と描画点配列を持つ。
 * 元データではroutesが細分化されていない為、この型で整理して描画しやすくする
 * service_arrayはtripIdsから必要に応じて算出する
 */
export type UrRoute = {
    ur_route_id: string,
    sorted_stops: StopOnRoute[],
    shape_points: LatLon[],
    tripIds: Set<Trip["id"]>
}