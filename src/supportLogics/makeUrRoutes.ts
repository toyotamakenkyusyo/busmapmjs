import { Route, Shape, StopTime, Trip } from "@come25136/gtfs"
import { LatLon, StopOnRoute, UrRoute } from "../interface/UrRoute"

type makeUrRoutesProps = {
    trips: Array<Trip>
    stopTimes: Array<StopTime>
    routes: Array<Route>
    shapes: Array<Shape>
}

/**
 * @method makeUrRoutes UrRoute配列を各種情報から作成する
 * @param {makeUrRoutesProps} param  
 * @returns {Array<UrRoute>} 作成したUrRoute配列
 */
const makeUrRoutes = ({
    trips,
    stopTimes,
    routes,
    shapes
}: makeUrRoutesProps): Array<UrRoute> => {

    //---------------------------------------------
    // stopTimes配列を作成する

    /**
     * @var {Map<string, Array<StopTime>>} tripMap
     * @description 
     * key:trip.id
     * value:trip.idでまとめたstopTimes配列
     */
    const stopTimesMap = new Map<string, Array<StopTime>>();

    // tripIdを元にMapオブジェクトへstopTimesを格納
    trips.forEach(trip => {

        // tripIdの一致するstopTime配列を作成
        const stopTimesEachTrip = stopTimes.filter(stopTime => {
            // stopTimeのtripidが、一意のtripidと一致する場合に取得
            return stopTime.tripId === trip.id;
        });

        // filterしたstopTime配列を昇順に並び替える
        const sortedStopTimes = stopTimesEachTrip.sort((a, b) => {
            // a<bならaが先にくるように並び替えるsortの仕様を活用
            return (a.sequence - b.sequence);
        });

        // MapオブジェクトにstopTime配列を格納
        stopTimesMap.set(trip.id, sortedStopTimes);
    });

    // 一意のtripIdが格納されたセットオブジェクトを作成
    // このあと使いたい為
    const tripIds = new Set<string>();
    trips.forEach(trip => {
        tripIds.add(trip.id);
    });
    //---------------------------------------------
    // shapeもまとめる

    /**
     * @var {Map<string, Array<Shape>>} shapesMap
     * @description 
     * key:trip.id
     * value:trip.idでまとめたsahpes配列
     */
    const shapesMap = new Map<string, Array<Shape>>();

    // 各便ごとに検索
    trips.forEach(trip => {
        const shapesEachTrip = shapes.filter(shape => {
            return trip.shapeId === shape.id;
        });

        const sortedShapes = shapesEachTrip.sort((a, b) => {
            return (a.sequence - b.sequence);
        });

        shapesMap.set(trip.id, sortedShapes);
    });

    //---------------------------------------------
    // ur_routesを作る
    //---------------------------------------------

    // 新たに作るurRoutes
    let urRoutes = new Array<UrRoute>();

    // 1つ1つの便を確認する
    trips.forEach((trip, tripIndex) => {

        /**
         * 既に全く同じurRouteオブジェクトが存在するかどうか
         */
        const existUrRoute = urRoutes.some(urRoute => {

            // (1)該当するrouteIdがそもそもtripsにない場合、
            // 同じurRouteは必ず存在しない
            /**
             * 同一のshapeIdを含むか
             */
            const hasShapeId = tripIds.has(urRoute.ur_route_id);

            // 同一のshapeIdを持たないなら、評価を切り上げてfalseを返す
            if (!hasShapeId) {
                // 同じurRouteは存在しない
                return false;
            }

            // (2)stopId,pickUpType,drodOffTypeが異なれば、
            // (1)はtrueでも同じurRouteは存在しない
            const stops = urRoute.sorted_stops;

            /**
             * 全バス停について、全く同じかどうか
             */
            const hasSameStop = stops.every((stop, stopSequence) => {

                // 素朴な疑問、命名規則的に、urIdとstIdは必ずかぶらないのでは？

                // urRouteオブジェクトを調査
                const urId = stop.ur_stop_id;
                const urPickType = stop.pickup_type;
                const urDropType = stop.drop_off;

                // tripIdを元に取得した停留所時刻表を調査
                // 今回undefinedの可能性は考慮しない
                const stopTimes = stopTimesMap.get(trip.id) as StopTime[];
                const stopTime = stopTimes[stopSequence];
                const stId = stopTime.stopId;
                const stPickType = stopTime.pickupType;
                const stDropType = stopTime.dropOffType;

                // urRouteオブジェクトの停留所と、GTFSの停留所時刻表を比較
                // idもpickUpもdropOffも全て同じなら、
                // 同じバス停があるとみなす
                return (
                    urId === stId
                    && urPickType === stPickType
                    && urDropType === stDropType
                );
            });

            // 同一のshapeIDがあり、
            // かつ全バス停が全く同じであれば、urRouteは存在する
            // 逆にそうでなければ、urRouteは存在せず、新たに作る必要がある
            return hasSameStop;
        });

        // service_arrayを追加するような記述が本家にはある
        // service_idごとに便数を数えているとのこと
        // 実装方法未定、未定義

        // もし見つからない場合、urRouteを追加する
        if (!existUrRoute) {

            // id
            const id = `ur_route_id_${tripIndex}`;

            // sortedStops
            const stopTimes = stopTimesMap.get(trip.id) as StopTime[];

            const stops: Array<StopOnRoute> = stopTimes.map(time => {
                return {
                    ur_stop_id: time.stopId,
                    pickup_type: time.pickupType,
                    drop_off: time.dropOffType
                }
            });

            // shape_points
            const shapes = shapesMap.get(trip.id) as Shape[];

            const points: Array<LatLon> = shapes.map(shape => {
                return shape.location;
            });

            // id,sortedStops,shapePointsを格納しurRouteを作成
            const newUrRoute: UrRoute = {
                ur_route_id: id,
                sorted_stops: stops,
                shape_points:points
            }

            // 末尾に追加する(ここでは普通にpushした)
            urRoutes.push(newUrRoute);
        }
    });
    
    // 最後にurRoutesをroute_sort_orderで並び替えるらしい
    // 未実装
    return urRoutes;
}

export {
    makeUrRoutes
}