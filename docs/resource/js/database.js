'use strict';
export class Db {
    #data = {};
    constructor() {
        this.#dbLoad();
    };
    async #dbLoad() {
        this.#data['paradox'] = await this.#jsonLoad('./resource/data/paradox.json');
        this.#data['skills'] = await this.#jsonLoad('./resource/data/skills.json');
        this.#data['idx__status'] = await this.#jsonLoad('./resource/data/paradox__status.json');
        this.#data['idx__target'] = await this.#jsonLoad('./resource/data/paradox__target.json');
        this.#data['idx__prefix'] = await this.#jsonLoad('./resource/data/skills__idx-prefix.json');
        this.#data['idx__effect1'] = await this.#jsonLoad('./resource/data/paradox__effect1.json');
        this.#data['idx__effect2'] = await this.#jsonLoad('./resource/data/paradox__effect2.json');
        this.#data['sort__skills'] = await this.#jsonLoad('./resource/data/skills__sort.json');
        this.#data['sort__paradox'] = await this.#jsonLoad('./resource/data/paradox__sort.json');
    };
    async #jsonLoad(path) {
        return await (await fetch(path)).json();
    };

    async metadata() {
        this.#data['meta'] = await this.#jsonLoad('./resource/data/metadata.json');
        return this.#data['meta'];
    }

    search(condition) {
        let data = [];
        if (condition['pow1'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['pow1'])), _ => this.#status_target('POW', '1'))];
        }
        if (condition['pow2'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['pow2'])), _ => this.#status_target('POW', '2'))];
        }
        if (condition['pow3'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['pow3'])), _ => this.#status_target('POW', '3'))];
        }
        if (condition['pow4'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['pow4'])), _ => this.#status_target('POW', '4'))];
        }
        if (condition['spd1'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['spd1'])), _ => this.#status_target('SPD', '1'))];
        }
        if (condition['spd2'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['spd2'])), _ => this.#status_target('SPD', '2'))];
        }
        if (condition['spd3'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['spd3'])), _ => this.#status_target('SPD', '3'))];
        }
        if (condition['spd4'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['spd4'])), _ => this.#status_target('SPD', '4'))];
        }
        if (condition['wiz1'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['wiz1'])), _ => this.#status_target('WIZ', '1'))];
        }
        if (condition['wiz2'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['wiz2'])), _ => this.#status_target('WIZ', '2'))];
        }
        if (condition['wiz3'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['wiz3'])), _ => this.#status_target('WIZ', '3'))];
        }
        if (condition['wiz4'] != '') {
            data = [...data, ...Array.from(new Array(Number(condition['wiz4'])), _ => this.#status_target('WIZ', '4'))];
        }
        if (condition['offset'] == '' || condition['skill'] == '' || data.length == 0) {
            return;
        }

        let result = [];
        let indexes = Array.from(new Array(data.length), _ => 0);
        while (indexes[indexes.length - 1] < data[data.length - 1].length) {
            let skills = {};
            let paradoxes = [];
            for (let idx = indexes.length - 1; idx >= 0; idx--) {
                let torf = true;
                let ss;
                for (; indexes[idx] < data[idx].length; indexes[idx]++) {
                    if (paradoxes.indexOf(data[idx][indexes[idx]]) >= 0) {
                        indexes[idx]++;
                    } else {
                        ss = [...Object.keys(skills), ...this.#data['paradox'][data[idx][indexes[idx]]].skill].reduce((ss, key) => {
                            ss[key] = true;
                            return ss;
                        }, {});
                        if (Number(condition['skill']) >= Object.keys(ss).length) {
                            break;
                        }
                    }
                    if (torf) {
                        for (let idx_n = idx - 1; idx_n >= 0; idx_n--) {
                            indexes[idx_n] = 0;
                        }
                        torf = false;
                    }
                }
                if (torf) {
                }
                if (indexes[idx] >= data[idx].length) {
                    paradoxes = [];
                    break;
                }
                skills = ss;
                paradoxes.push(data[idx][indexes[idx]]);
            }
            if (paradoxes.length == data.length) {
                result.push(Array.from(paradoxes, pdx => this.#data['paradox'][pdx]));
                if (Number(condition['offset']) < result.length) {
                    break;
                }
            }

            // インデックスの更新
            indexes[0]++;
            for (let idx = 0; indexes.length - 1 > idx; idx++) {
                if (indexes[idx] >= data[idx].length) {
                    indexes[idx + 1]++;
                    indexes[idx] = 0;
                }
            }
        }
        return result;
    };

    #status_target(status, target) {
        let data = [];
        data = this.#data['idx__status'][status];
        return data.filter(row => this.#data['idx__target'][target].includes(row));
    }
}
