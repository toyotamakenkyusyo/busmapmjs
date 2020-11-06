import { UrRoute } from "./UrRoute";
import { UrStop } from "./UrStop"
import { Shape, Stop, StopTime, Trip } from "@come25136/gtfs";

interface BusMapData {
    /**
     * GTFS-RTのバイナリ変換後そのままのデータ
     */
    rt?: any;

    /**
     * Stop配列
     */
    stops: Array<Stop>;

    /**
     * 原子Stop配列
     */
    urStops: Array<UrStop>;

    /**
     * 親Stop配列
     * @description 基本はUrStopのみ
     * parent_stationsは平均をとって元データを無視し生成
     */
    parentStations: Array<Stop>;

    /**
     * 原子route配列
     */
    urRoutes: Array<UrRoute>;

    // calendarの使いみちわかる方補足お願いします

    /**
     * ？？？？？？？？？？
     */
    calendar: Array<Object>;

    /**
     * 便配列
     */
    trips: Array<Trip>;

    /**
     * StopTimes配列
     */
    stopTimes: Array<StopTime>;

    /**
     * shape配列
     */
    shapes: Array<Shape>;
}

// l_bmd→c_bmdに変わる場面がある
// データ加工後、何らかの「封印」状態に変化する？
// クラスを作る際、その辺りも考慮した方が良さげ

export {
    BusMapData
}
