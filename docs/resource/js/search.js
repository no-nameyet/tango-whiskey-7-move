'use strict';
import * as db from 'paradoxDB'

/** １度に表示する最大行 */
const OFFSET = 50;
/** 選択可能ステータス数 */
const OPTION_STATUS = 10;
/** 技能上限数 */
const OPTION_MAX_SKILL = 10;

/** メタデータが取得できない場合の標準値 */
const DEFAULT_METADATA = {
    timestamp: 'メタデータが取得できませんでした。',
};

const SELECTOR_MOVE = Array.from(new Array(10), (_, idx) => idx + 1);
const SELECTOR_SKILL = Array.from(new Array(30), (_, idx) => idx + 1);

/**
 * querySelectorのエイリアス
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * optionタグを繰り返し作成する
 * @param {arr} selector option要素の表示
 * @returns HTMLの出力
 */
function makeOption(selector, useEmpty) {
    return [(useEmpty? '<option></option>': ''), ...Array.from(selector, opt => `<option value="${opt}">${opt}</option>`)].join('');
}

/**
 * 初期化処理
 */
async function initialize() {
    // DB初期化
    await db.init();
    /** メタデータの取得 */
    const metadata = db.metadata() || DEFAULT_METADATA;

    //
    // 検索条件
    //

    // ステータス
    (_ => {
        let opt = '<option></option>';
        for (let idx = 1; OPTION_STATUS >= idx; idx++) {
            opt += `<option value="${idx}">${idx}</option>`;
        }
        $$('.search-condision__select_status').forEach(elmn => elmn.insertAdjacentHTML('afterbegin', opt));
    })();
    // 技能
    (_ => {
        let opt = '<option></option>';
        for (let idx = 3; OPTION_MAX_SKILL >= idx; idx++) {
            opt += `<option value="${idx}">${idx}</option>`;
        }
        $('#search-condision__select_skill').insertAdjacentHTML('afterbegin', opt);
    })();
    // オフセット
    (_ => {
        $('#search-condision__offset').value = OFFSET;
    })();
    // タイムスタンプの表示
    (_ => {
        $('#search-condision__meta').insertAdjacentHTML('afterbegin', metadata['timestamp']);
    })();

    /** 一覧の追加 */
    const appendResult = _ => {
        let idx = 0;
        for (let data of db.itrator()) {
            let html = '';
            for (var rdx of data) {
                html += `
                    <li class="search-result__paradox">
                        <dl class="search-result__detail">
                            <dt class="search-result__name"><span class="search-result__name-title label__${rdx.status}">${rdx.name}</span>（${rdx.status}:${rdx.target}）</dt>
                            <dd class="search-result__skills">
                                <ul class="search-result__skill-list">
                                    <li class="search-result__skill-row">${rdx.skill[0]}</li>
                                    <li class="search-result__skill-row">${rdx.skill[1]}</li>
                                    <li class="search-result__skill-row">${rdx.skill[2]}</li>
                                </ul>
                            </dd>
                        </dl>
                    </li>
                `;
            }
            $('#search-result').insertAdjacentHTML('afterbegin', `
                <li class="search-result__pattern">
                    <ul class="search-result__list">
                        ${html}
                    </ul>
                </li>
            `);
            if (++idx >= OFFSET) {
                break;
            }
        }
    };

    // 検索条件の変更
    $$('.search-condision__select').forEach(elmn => elmn.addEventListener('change', event => {
        $('#search-result').innerHTML = '';
        db.select(new FormData($('form')));
        appendResult();
    }));
}

export { initialize };
