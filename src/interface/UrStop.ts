
import { Location, Stop } from "@come25136/gtfs";

/**
 * @typedef UrStop 原子標柱
 * @description もとのGTFSではlocation_typeが混在している為、
 * 整理してbusmapjsで加工しやすくする
 */
export type UrStop = {
    ur_stop_id: Stop["id"],
    lat: Location["lat"],
    lon: Location["lon"],
    name:Stop["name"]
}

