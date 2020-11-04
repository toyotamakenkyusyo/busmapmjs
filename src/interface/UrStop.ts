

//     "ur_stops": { //標柱
//         "ur_stop_id": string; //★標柱ID
//         "ur_stop_lat": number; //標柱緯度
//         "ur_stop_lon": number; //標柱経度
//     }[];

/**
 * @typedef UrStop 原子標柱
 * @description もとのGTFSではlocation_typeが混在している為、
 * 整理してbusmapjsで加工しやすくする
 */
export type UrStop = {
    ur_stop_id: string,
    lat: number,
    lon: number
}

