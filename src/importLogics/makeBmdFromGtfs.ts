// 名前どうにかしたい……

import { gtfs, Shape, Stop } from "@come25136/gtfs";
import { Config } from "../Config/config";
import { BusMapData } from "../interface/BusMapData";
import { UrRoute } from "../interface/UrRoute";
import { UrStop } from "../interface/UrStop";
import { makeUrRoutes } from "../supportLogics/makeUrRoutes";
import setRouteColor from "../supportLogics/setRouteColor";
import { setTmpShapeId } from "../supportLogics/setTmpShapeId";
import { getZipPromise } from "./fetch";

/**
 * @method getGtfsFromWebZip ネット上のzipのurlを元に取得したGTFSオブジェクトを返す
 * @param {string} url 取得したいZipデータのあるURL
 * @returns {gtfs} 取得して解凍を済ませたGTFS
 * @description 手抜きなので後で調整が必要、promise周りが心配すぎる
 */
const getGtfsFromWebZip = async (url: string): Promise<gtfs> => {

    // urlからzipを取得する
    // あとでtry-catchするよう改造？.catch追加？
    // エラー時に何をするかも悩みどころ
    const zip: ArrayBuffer = await getZipPromise(url)

    // zip2csvsは未定義なのでエラー抑止でignoreしている
    // zipから複数のcsvを抽出する
    //@ts-ignore
    const gtfs: gtfs = zip2gtfs(zip);

    // 出来上がったgtfsオブジェクトを返す
    return gtfs;
};

/**
 * @method makeBmdFromGtfs BusMapDataオブジェクトをGTFSのzipから作成し返す
 * @param {Config} config 設定ファイル
 * @returns {BusMapData} 作成したBusMapDataオブジェクト 
 * @description Promiseです
 */
const makeBmdFromGtfs = async (config: Config): Promise<BusMapData> => {

    // 取得したいzipのあるurl
    const url = config.data as string;

    // 処理結果をbusmapdataに格納
    const gtfs = await getGtfsFromWebZip(url);

    // プロパティを抽出(後で省略記法を使える用)
    const stops = gtfs.stops;

    // setcolorによって色を補充する
    const routes = setRouteColor(gtfs.routes);

    //stop_timesのpickup_type,drop_off_typeを埋める(未定義)
    // @ts-ignore
    const stopTimes = setStopType(
        gtfs.stopTimes
    );

    // tripsの検証を行い、shapeIdがない場合は仮の名前を補完する
    const trips = setTmpShapeId(gtfs.trips);

    // shapesを作る(未定義、makeShape相当)
    // @ts-ignore
    const shapes = setShape(
        gtfs.shapes,
        trips,
        routes,
        stopTimes
    ) as Array<Shape>;

    // "route_sort_order"の設定は省略、おそらく不要
    // 数値への変換もおそらく不要(getGtfsFromWebZipでやっているはず)

    // urRoutes作成(make_ur_routes相当)
    const urRoutes: Array<UrRoute> = makeUrRoutes({
        trips,
        stopTimes,
        routes,
        shapes
    });

    // makeUrStopsとmakeParentStationをここで追加する
    // 本家ではzipとjsonの処理が合流した後に行っていたが、あえてここで実施

    // stopsから、まずurStopsを生成(未定義)
    // @ts-ignore
    const urStops: Array<UrStop> = makeUrStops(stops);

    // urStopsとgtfs.stopsを元に、parentStationsを作成(未定義)
    // @ts-ignore
    const parentStations: Array<Stop> = makeParentStations(urStops,stops);

    // 補完などした各データからBusMapDataとして1つにまとめ、返す
    // プロパティ名と変数名が同じ場合、省略記法が使える
    return {
        urStops,
        urRoutes,
        parentStations,
        shapes,
        stopTimes,
        stops,
        trips,
        calendar:["何が格納されるかわかってないから後で書き直す"]
    }
}

export {
    getGtfsFromWebZip,
    makeBmdFromGtfs
}