import { Config, defaultConfig } from "./config";

/**
 * @method setConfig ユーザー設定と設定既定値をマージする
 * @param {Config} userConfig ユーザーの追加設定
 * @returns {Config} マージ済み既定値
 * @description もしユーザーが一部しか設定を記載しなくても、他の値は既定値で埋める
 */
const setConfig = (userConfig: Config): Config => {

    // 既定値をもとに、ユーザー指定でそのまま上書き
    // 新たな設定オブジェクトを作る
    const newConfig = Object.assign(
        {},
        defaultConfig,
        userConfig
    );

    // マージした設定オブジェクトを返す
    return newConfig;
}

// これ以外に無いだろうからdefaultExportする
export default setConfig;