import { Route } from "@come25136/gtfs"

/**
 * @method setRouteColor colorが未設定の所を補充する
 * @param { Array<Route>} route 色を補充したいRouteオブジェクト 
 * @returns { Array<Route>} 色を補充したRouteオブジェクト
 * @description 現状、完全にランダムに振り分ける
 * 今後、色の選択アルゴリズムなど要検討
 */
const setRouteColor = (routes: Array<Route>): Array<Route> => {
    
    // routesから1つずつ、色があるか確認していく
    return routes.map(route => {
        // ランダムにRGBを導出
        const red = Math.round((Math.random() * 15)).toString(16) + "F";
        const green = Math.round((Math.random() * 15)).toString(16) + "F";
        const blue = Math.round((Math.random() * 15)).toString(16) + "F";

        // もし色が未定義であれば、ランダム色を補充
        if (route.color === undefined || route.color === "") {
            route.color = red + green + blue;
        }

        // 補充したrouteから新たな配列を作成し、それをメソッドが返す
        return route;
    });
}

export default setRouteColor