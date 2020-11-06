
// 可読性低く、正規表現のバグ潜む可能性あり
// 大丈夫だとは思うけど……

/**
 * @method csv2object csv_to_json相当の変換メソッド
 * @param {string} csv CSVに相当する文字列
 * @returns {Array<object>} csvから変換したなにかの配列
 * @description 今後リファクタリングが必要
 */
const csv2object = (csv: string): Array<object> => {
    //a_csvはCSVの文字列。カンマ区切り。
    //CSVを2次元配列にする。
    let l_1 = 0;
    let l_2 = 0;

    const reg2 = new RegExp(',|\r?\n|[^,"\r\n][^,\r\n]*|"(?:[^"]|"")*"', "g");
    const items: string[][] = [[]];
    csv
        .replace(/\r?\n$/, "")
        .replace(reg2, (substr) => {
            if (substr === ",") {
                l_2 += 1;
                items[l_1][l_2] = "";
            } else if (substr === "\n" || substr === "\r\n") {
                l_1 += 1;
                items[l_1] = [];
                l_2 = 0;
            } else if (substr.charAt(0) !== "\"") {
                items[l_1][l_2] = substr;
            } else {
                items[l_1][l_2] = substr.slice(1, -1).replace(/""/g, "\"");
            }
            return substr
        });

        //二次元配列をJSONに変換する。
    let objects: object[] = [];

    // アイテムからjson風のobjectを作成
    items.forEach((row, rowIndex) => {
        // ヘッダー行は読み飛ばす
        if (rowIndex !== 0) {

            // オブジェクト(any……)
            const object:any = {};
            row.forEach((item, columnIndex) => {

                // ヘッダーを取得
                const header = items[0][columnIndex];

                // 値
                const value = item
                    .replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
                
                // objectに値を追加
                object[header] = value
            })
            objects.push(object)
        }
    });

    //この段階では全てテキストになっている。
    return objects;
    //objectsは[{"stop_id": "停留所ID", "stop_name": "停留所名", ……}, {……}, ……, {……}]
}
export {
    csv2object
}