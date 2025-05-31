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
        let list = [];
        let indexes = [ 0, ];

        while (indexes.length > 0) {
            let idx = list.length;
            let data = this.#status.elements[idx][indexes[idx]];

            // 同一のパラドクスの存在チェック
            if (list.indexOf(data) < 0) {
                list[idx] = data;

                let torf = true;
                // フィルターチェック
                for (let [key, value,] of Object.entries(this.#status.condition)) {
                    if (!this.#filter[key]({ db: this.#db, list: list, condition: this.#status.condition, })) {
                        torf = false
                        break;
                    }
                }
                if (torf) {
                    if (list.length == this.#status.elements.length) {
                        this.#status.count ++;
                        let result = [];
                        for (let key of list) {
                            result.push(this.#data(this.#db, key))
                        }
                        yield result;
                    } else {
                        indexes.push(0);
                        continue;
                    }
                }
                list.pop();
            }
            do {
                indexes[list.length]++;
                if (this.#status.elements[list.length].length > indexes[list.length]) {
                    break;
                }
                indexes.pop();
                list.pop();
            } while (indexes.length > 0);
        }
    }
}
