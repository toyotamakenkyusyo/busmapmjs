
/**
 * @method getZipPromise URLを元に、zipをWebから取得するPromiseを返す
 * @param {string} dataUrl fetchするURL
 * @returns {Promise<ArrayBuffer>} zipのArrayBuffer
 * @description fetchをそのまま返しているので、呼び出し元でawaitが必要なはず
 * また、エラー時にはerrorをthrowするので、try-catchに必ず入れること
 */
const getZipPromise = (dataUrl: string): Promise<ArrayBuffer> => {
    // 非同期久しぶりに書いたからこれであってるか不安すぎる
    // 間違ってたら修正お願いします
    return fetch(dataUrl)
        .then(response => {
            if (response.ok) {
                // 正常な場合、arrayBufferとして出力
                return response.arrayBuffer();
            } else {
                // エラー
                const errorMessage = response.status.toString()
                    .concat(" - ", response.statusText)
                throw Error(errorMessage);
            }
        });
}

export {
    getZipPromise
}