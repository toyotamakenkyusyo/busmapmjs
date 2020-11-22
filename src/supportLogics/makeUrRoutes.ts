import { Route, Shape, StopTime, Trip } from "@come25136/gtfs"
import { LatLon, StopOnRoute, UrRoute } from "../interface/UrRoute"

type makeUrRoutesProps = {
    trips: Array<Trip>
    stopTimes: Array<StopTime>
    routes: Array<Route>
    shapes: Array<Shape>
}

/**
 * @method makeStopTimesMap tripIdごとのstopTimesをまとめたMapを作成する
 * @param {Set<Trip["id"]>} tripIds 一意のtripIdセット
 * @param {StopTime[]} stopTimes stopTimes配列
 * @returns {Map<string, StopTime[]>} 作成したマップオブジェクト
 */
const makeStopTimesMap = (
    tripIds: Set<Trip["id"]>,
    stopTimes: StopTime[]
): Map<string, StopTime[]> => {

    // Mapオブジェクトを新たに作成
    const stopTimesMap = new Map<string, StopTime[]>();

    // tripIdを元にMapオブジェクトへstopTimesを格納
    tripIds.forEach(tripId => {

        // tripIdの一致するstopTime配列を作成
        const stopTimesEachTrip = stopTimes.filter(stopTime => {
            // stopTimeのtripidが、一意のtripidと一致する場合に取得
            return stopTime.tripId === tripId;
        });

        // filterしたstopTime配列を昇順に並び替える
        const sortedStopTimes = stopTimesEachTrip.sort((a, b) => {
            // a<bならaが先にくるように並び替えるsortの仕様を活用
            return (a.sequence - b.sequence);
        });

        // MapオブジェクトにstopTime配列を格納
        stopTimesMap.set(tripId, sortedStopTimes);
    });
    return stopTimesMap;
}

/**
 * @method makeShapesMap tripIdごとのshapeをまとめたMapを作成する
 * @param {Trip[]} trips trip配列(setでないのはshapeIdを探すため)
 * @param {Shape[]} shapes Shape配列
 * @returns {Map<string,Shape[]} 作成したマップオブジェクト
 */
const makeShapesMap = (
    trips: Trip[],
    shapes: Shape[]
):Map<string,Shape[]> => {
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
    return shapesMap;
}

/**
 * @method makeUrRoutes UrRoute配列を各種情報から作成する
 * @param {makeUrRoutesProps} param  
 * @returns {UrRoute[]} 作成したUrRoute配列
 */
const makeUrRoutes = ({
    trips,
    stopTimes,
    routes,
    shapes
}: makeUrRoutesProps): UrRoute[] => {

    // ? : routesの出番がないのはなぜ？
    // 後々に必要になると思われるので消さずに残す
    //---------------------------------------------
    // stopTimes配列を作成する

    // 一意のtripIdが格納されたセットオブジェクトを作成
    // このあと使いたい為
    const tripIds = new Set<Trip["id"]>();
    trips.forEach(trip => {
        tripIds.add(trip.id);
    });

    /**
     * @var {Map<string, Array<StopTime>>} tripMap
     * @description 
     * key:trip.id
     * value:trip.idでまとめたstopTimes配列
     */
    const stopTimesMap = makeStopTimesMap(
        tripIds,
        stopTimes
    );

    //---------------------------------------------
    // shapeもまとめる

    /**
     * @var {Map<string, Array<Shape>>} shapesMap
     * @description 
     * key:trip.id
     * value:trip.idでまとめたsahpes配列
     */
    const shapesMap = makeShapesMap(trips,shapes)

    //---------------------------------------------
    // ur_routesを作る
    //---------------------------------------------

    // 新たに作るurRoutes
    let urRoutes = new Array<UrRoute>();

    // 1つ1つの便を確認する
    trips.forEach((trip, tripIndex) => {

        /**
         * 既に全く同じurRouteオブジェクトが存在する場合、その要素indexを取得
         * もしなければ-1
         */
        const urRouteIndex = urRoutes.findIndex(urRoute => {

            // (1)該当するrouteIdがそもそもtripsにない場合、
            // 同じurRouteは必ず存在しない
            // 次のRouteを探す
            const hasRouteId = trip.routeId === urRoute.ur_route_id;

            // (1)評価
            if (!hasRouteId) {
                return false;
            }

            // (2)停留所数は同じか
            const stopCount = (stopTimesMap.get(trip.id) as StopTime[]).length;
            const urRouteStopCount = urRoute.sorted_stops.length;
            const isSameStopCount = stopCount === urRouteStopCount;

            // (3)shapePointの個数は同じか
            const pointCount = (shapesMap.get(trip.id) as Shape[]).length;
            const urRoutesPointCount = urRoute.shape_points.length;
            const isSamePointCount = pointCount === urRoutesPointCount;

            // (2)(3)評価
            // 停留所数とshapePountが同じでないなら、評価を切り上げてfalseを返す
            if (!(isSameStopCount && isSamePointCount)) {
                // 同じurRouteは存在しないので、次を探す
                return false;
            }

            // (4)各停留所ごとに確認
            // stopId,pickUpType,drodOffTypeが異なれば、
            // 同じurRouteは存在しない
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

            // (4)評価
            if (!hasSameStop) {
                return false;
            }

            // (5)shapesごとに評価
            // 全てのlat,lonが同じであるか
            // (個人的には誤差Xm以内とかでも良さそうとか思ったり)
            const shapePoints = urRoute.shape_points;
            const hasSameShape = shapePoints.every((point, index) => {
                // urRouteのlat,lonを取得
                const urLat = point.lat;
                const urLon = point.lon;

                // tripIdを元に、shapePointを取得
                // undefinedの可能性は考慮しない
                const stShapes = shapesMap.get(trip.id) as Shape[];
                const stShapePoint = stShapes[index];
                const stLat = stShapePoint.location.lat;
                const stLon = stShapePoint.location.lon;

                // lat,lonが同じであればtrue、そうでなければfalse
                return (
                    urLat === stLat
                    && urLon === stLon
                );
            });

            // (5)評価
            // 最終的に、shapeが全く同じかどうかを返す
            return hasSameShape;
        });

        // service_arrayを追加するような記述が本家にはある
        // service_idごとに便数を数えているとのこと
        // 実装方法未定、未定義

        // もし同じものがあれば、そのurRouteのtripIdsにtripIdを追加する
        // もし見つからない場合、urRouteを追加する
        if (urRouteIndex >= 0) {
            urRoutes[urRouteIndex].tripIds.add(trip.id);
        }
        else {

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
                shape_points: points,
                tripIds: new Set<Trip["id"]>()
            }

            // 末尾に追加する(ここでは普通にpushした)
            urRoutes.push(newUrRoute);
        }
    });

    // TODO : 最後にurRoutesをroute_sort_orderで並び替えるらしい
    // ? : 今回route_sort_orderを用意していないのだけれどもどうにかなるか？

    return urRoutes;
}

export {
    makeUrRoutes
}