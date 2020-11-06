import { Config } from "./Config/config";
import setConfig from "./Config/setConfig";
import { makeBmdFromGtfs } from "./importLogics/makeBmdFromGtfs";
import { BusMapData } from "./interface/BusMapData";

const main = (userConfig: Config) => {
    // busmapjsのマージ済みコンフィグ
    const config = setConfig(userConfig);

    // f_htmlは省略
    // f_change_settingは省略
    // f_leafletも省略

    // try-catchをどうするか、要調整

    // l_dataはur_routes+ur_stops+trips

    // zip経由とAPI/geojsonなど経由がある
    // ひとまずzip経由の構築を先に目指す

    // 格納用busmapdata
    let busMapData: BusMapData;

    // タイプによって処理を分ける
    // 各分岐内で、busmapdataを格納するようにしたい
    if (config.data_type === "gtfs") {

        // gtfsのzipを取得し、中身からBusMapDataを作る
        makeBmdFromGtfs(config)
            .then(result => {
                
                // 作ったBusMapDataを格納する
                busMapData = result;
            });
    }

    // 自分用メモ
    // zip経由→calenderをcsvから読み取り
    // trips.txtのshape_idを補完
    // ある場合はshapesの整理後検証し上書き、ない場合は作成し追加
    // stopsとur_routesだけ抽出→calenderを補完？preparejsonが読めないが……

};
