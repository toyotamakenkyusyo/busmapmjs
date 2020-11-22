import { Stop } from "@come25136/gtfs";
import { UrStop } from "../interface/UrStop";

/**
 * @method makeParentStations 親停留所配列を作成する
 * @param {urStops[]} urStops 原子停留所の配列 
 * @param {Stop[]} stops 元データの停留所配列
 * @returns {Stop[]} 親停留所配列
 * @description 親の緯度経度は、子達の相加平均で補完する場合がある
 */
const makeParentStations = (urStops: UrStop[], stops: Stop[]): Stop[] => {

    /**
     * @typedef PositionSum 和を計算する為に使用するオブジェクト
     */
    type PositionSum = {
        lat: number,
        lon: number,
        childrenCount: number
    }

    // 親停留所と和の計算用オブジェクトののMap
    const parentsMap = new Map<Stop["parentStation"], PositionSum>();

    // 親停留所があるか調べると同時に、相加平均を求める為に足し合わせる
    urStops.forEach(urStop => {
        // 親停留所の計算をするオブジェクトを取得する
        // ない場合もある
        const parentStation = urStop.parentStation;
        const parentSum: PositionSum | undefined = parentsMap.get(parentStation);

        // 緯度、経度、子停留所数
        // ない場合は0で補完した上で、
        // 今調べている停留所を加味し追加する
        const lat = (parentSum?.lat ?? 0) + urStop.lat;
        const lon = (parentSum?.lon ?? 0) + urStop.lon;
        const childrenCount = (parentSum?.childrenCount ?? 0) + 1;
        parentsMap.set(urStop.parentStation, {
            lat,
            lon,
            childrenCount
        });
    });

    // parentStation作成
    let parentStations: Stop[] = [];

    // Mapオブジェクトから親停留所配列を作成
    parentsMap.forEach((positionSum, key) => {

        // 平均を算出する
        const lat = positionSum.lat / positionSum.childrenCount;
        const lon = positionSum.lon / positionSum.childrenCount;

        // 親を探す
        // undefinedの場合、各項目を補完して追加する
        // つまり、平均のlat,lon補完はundefinedの場合のみ使用
        const parentStation = stops.find(stop => {
            return stop.id === key;
        }) ?? {
            // 各項目を補完してStopを作成する
            // keyがnullの可能性を考慮しない
            id: key as string,
            name: key as string,
            location: {
                lat,
                lon,
                type: 1
            },
            code: null,
            description: null,
            parentStation: null,
            zone: {
                id: null,
            },
            timezone: null,
            wheelchairBoarding: 0,
            url: null,
            level: {
                id: null,
            },
            platformCode: null,
        }

        parentStations.push(parentStation);
    });
    return parentStations;
}
export default makeParentStations;