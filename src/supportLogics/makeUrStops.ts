import { Stop } from "@come25136/gtfs";
import { UrStop } from "../interface/UrStop";

/**
 * @method makeUrStops 原子標柱(UrStop)の配列を作成する
 * @param {Stop[]} stops データのもととなるstop配列
 * @returns {UrStop[]} 作成したUrStop配列
 */
const makeUrStops = (stops: Stop[]):UrStop[] => {

    // locationTypeが0のものを集める
    const stopsLocation0 = stops.filter(stop => {
        return stop.location.type === 0;
    });

    // 必要な項目のみを抽出し、UrStop配列を作成し返す
    const urStops: UrStop[] = stopsLocation0.map(stop => {
        return {
            ur_stop_id: stop.id,
            lat: stop.location.lat,
            lon: stop.location.lon,
            name: stop.name,
            parentStation:stop.parentStation
        }
    });
    return urStops;
}

export default makeUrStops;
