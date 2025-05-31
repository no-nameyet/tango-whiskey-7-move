'use strict';
import { Db } from 'database'

/** DBオブジェクト */
const DB = new Db();

/** JSONの読み込み */
async function jsonLoad(path) {
    return await (await fetch(path)).json();
};

/** 初期化 */
export let init = async function () {
    DB.metadataFile(await jsonLoad('./resource/data/metadata.json'));

    DB.createTable('paradox', await jsonLoad('./resource/data/paradox.json'));
    DB.createTable('skills', await jsonLoad('./resource/data/skills.json'));
    DB.createTable('idx__status', await jsonLoad('./resource/data/paradox__status.json'));
    DB.createTable('idx__target', await jsonLoad('./resource/data/paradox__target.json'));
    DB.createTable('idx__prefix', await jsonLoad('./resource/data/skills__idx-prefix.json'));
    DB.createTable('idx__effect1', await jsonLoad('./resource/data/paradox__effect1.json'));
    DB.createTable('idx__effect2', await jsonLoad('./resource/data/paradox__effect2.json'));
    DB.createTable('sort__skills', await jsonLoad('./resource/data/skills__sort.json'));
    DB.createTable('sort__paradox', await jsonLoad('./resource/data/paradox__sort.json'));

    DB.extractier('status', (db, value) => db['idx__status'][value]);
    DB.extractier('target', (db, value) => db['idx__target'][value]);

    DB.filter('skill', ({ db, list, condition: { skill = 0 }, }) => {
        return Number(skill) >= Object.keys(Array.from(list, key => db['paradox'][key].skill).flat().reduce((skill, key) => {
            skill[key] = true;
            return skill;
        }, {})).length;
    });
    DB.filter('offset', _ => true);

    DB.dataAccess((db, key) => db['paradox'][key]);
};

/** メタデータの取得 */
export let metadata = _ => { return DB.metadata() };

/** 検索 */
export function select(form) {
    let extract = [];
    let filter = {};
    const appendExtract = (state, target, value) => {
        for (let idx = 0; Number(value) > idx; idx++) {
            extract.push({
                'status': state,
                'target': target,
            });
        }
    }
    for (let [key, value] of form.entries()) {
        switch (key) {
            case 'pow1':
                appendExtract('POW', '1', value);
                break;
            case 'pow2':
                appendExtract('POW', '2', value);
                break;
            case 'pow3':
                appendExtract('POW', '3', value);
                break;
            case 'pow4':
                appendExtract('POW', '4', value);
                break;
            case 'spd1':
                appendExtract('SPD', '1', value);
                break;
            case 'spd2':
                appendExtract('SPD', '2', value);
                break;
            case 'spd3':
                appendExtract('SPD', '3', value);
                break;
            case 'spd4':
                appendExtract('SPD', '4', value);
                break;
            case 'wiz1':
                appendExtract('WIZ', '1', value);
                break;
            case 'wiz2':
                appendExtract('WIZ', '2', value);
                break;
            case 'wiz3':
                appendExtract('WIZ', '3', value);
                break;
            case 'wiz4':
                appendExtract('WIZ', '4', value);
                break;
            default:
                filter[key] = value;
        }
    }
    DB.select(extract, filter);
    return DB.next.bind(DB);
}
