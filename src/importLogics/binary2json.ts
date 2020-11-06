/**
 * @method binary2json 
 * @description リアルタイム用にバイナリをjsonへ
 * @param {ArrayBuffer} binary バイナリ
 * @param grb GtfsRealtimeBindings
 * @returns feed
 */
const binary2json = (binary:ArrayBuffer, grb:any) => {

    // 8ビット符号なし整数値の配列を作成
    const unit8array = new Uint8Array(binary);

    // GTFS RT Bindingからbodyだけを抽出
    const body = unit8array.filter((number, index) => {
        return index > 2;
    });

    // デコードする
    return grb.FeedMessage.decode(body);
}

export default binary2json;