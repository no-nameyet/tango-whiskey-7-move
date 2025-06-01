'use strict';
export class Db {
    /** コンストラクタ */
    constructor() {};

    //
    // メタデータ
    //
    /** メタデータ */
    #metadata = {};

    /** メタデータの設定 */
    metadataFile(json) {
        this.#metadata = json;
    }

    /** メタデータの取得 */
    metadata() {
        return this.#metadata;
    }

    //
    // データベース
    //
    /** データベース */
    #db = {}

    /** テーブルの作成 */
    createTable(name, json) {
        this.#db[name] = json;
    }

    //
    // データ取得
    //
    /** データアクセス条件 */
    #data = (db, key) => { return key; }

    /** データアクセス条件 */
    dataAccess(callback) {
        this.#data = callback;
    }

    //
    // 抽出条件
    //
    /** 抽出条件 */
    #extracter = {}

    /** 抽出条件の設定 */
    extractier(name, callback) {
        this.#extracter[name] = callback;
    }

    /** 抽出条件処理 */
    #extractData(condition) {
        let result = [];
        for (let [key, value] of Object.entries(condition)) {
            if (key in this.#extracter) {
                let list = this.#extracter[key](this.#db, value);
                if (result.length == 0) {
                    result = list;
                } else {
                    result = result.filter(row => list.includes(row));
                }
                if (result.length == 0) {
                    break;
                }
            }
        }
        return result;
    }

    //
    // 絞込条件
    //
    /** 絞込条件 */
    #filter = {}

    /** 絞込条件の設定 */
    filter(name, callback) {
        this.#filter[name] = callback;
    }

    //
    // 検索処理
    //
    /** 検索ステータス */
    #status = {}

    /** 検索ステータスの初期化 */
    select(extracterConditionList, filterCondition) {
        this.#status = {
            condition: filterCondition,
            count: 0,
            elements: [],
            keyList: [],
            dataList: [],
            indexes: [0,],
        }

        // 組み合わせ対象のリストを設定
        for (let condition of extracterConditionList) {
            let list = this.#extractData(condition);
            if (list.length == 0) {
                this.#status.elements = [];
                break;
            } else {
                this.#status.elements.push(list);
            }
        }
    }

    //
    // イテレータ
    //
    /** イテレータ */
    *next() {
        while (this.#status.indexes.length > 0) {
            let idx = this.#status.keyList.length;
            let data = this.#status.elements[idx][this.#status.indexes[idx]];

            // 同一のパラドクスの存在チェック
            if (this.#status.keyList.indexOf(data) < 0) {
                this.#status.keyList[idx] = data;
                this.#status.dataList[idx] = this.#data(this.#db, data);

                // フィルターチェック
                if (Object.entries(this.#filter).every(([key, func,]) => (!(key in this.#status.condition) || func({ keyList: this.#status.keyList, list: this.#status.dataList, condition: this.#status.condition, isLast: this.#status.keyList.length == this.#status.elements.length, })))) {
                    if (this.#status.keyList.length == this.#status.elements.length) {
                        this.#status.count++;
                        yield this.#status.dataList;
                    } else {
                        this.#status.indexes.push(0);
                        continue;
                    }
                }

                this.#status.keyList.pop();
                this.#status.dataList.pop();
            }
            do {
                this.#status.indexes[this.#status.keyList.length]++;
                if (this.#status.elements[this.#status.keyList.length].length > this.#status.indexes[this.#status.keyList.length]) {
                    break;
                }
                this.#status.indexes.pop();
                this.#status.keyList.pop();
                this.#status.dataList.pop();
            } while (this.#status.indexes.length > 0);
        }
    }
}
