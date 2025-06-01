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
    // 最大技能
    (_ => {
        let opt = '<option></option>';
        for (let idx = 3; OPTION_MAX_SKILL >= idx; idx++) {
            opt += `<option value="${idx}">${idx}</option>`;
        }
        $('#search-condision__select_max_skill').insertAdjacentHTML('afterbegin', opt);
    })();
    // 必須技能
    (async _ => {
        let opt = '<option></option>';
        for (let [ prefix, list ] of Object.entries(await db.skillList())) {
            opt += `<optgroup label="${prefix}">`;
            list.forEach(skill => {
                opt += `<option value="${skill}">${skill}</option>`;
            });
            opt += `</optgroup>`;
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

    //
    // 検索結果の表示
    //
    /** イテレータ */
    let itrator;

    /** 一覧の追加 */
    const appendResult = _ => {
        let idx = 0;
        let skill = $('#search-condision__select_skill').value;

        $$('#search-result__next').forEach(elmn =>elmn.remove());
        for (let { done, value: data, } = itrator.next(); !done; { done, value: data, } = itrator.next()) {
            let html = '';
            for (var rdx of data) {
                html += `
                    <li class="search-result__paradox">
                        <dl class="search-result__detail">
                            <dt class="search-result__name"><span class="search-result__name-title label__${rdx.status}">${rdx.name}</span>（${rdx.status}:${rdx.target}）</dt>
                            <dd class="search-result__skills">
                                <ul class="search-result__skill-list">
                                    <li class="search-result__skill-row ${(skill == rdx.skill[0])? 'search-result__skill-row--mark': ''}">${rdx.skill[0]}</li>
                                    <li class="search-result__skill-row ${(skill == rdx.skill[1])? 'search-result__skill-row--mark': ''} ">${rdx.skill[1]}</li>
                                    <li class="search-result__skill-row ${(skill == rdx.skill[2])? 'search-result__skill-row--mark': ''} ">${rdx.skill[2]}</li>
                                </ul>
                            </dd>
                        </dl>
                    </li>
                `;
            }
            $('#search-result').insertAdjacentHTML('beforeend', `
                <li class="search-result__pattern">
                    <ul class="search-result__list">
                        ${html}
                    </ul>
                </li>
            `);
            if (++idx >= OFFSET) {
                $('#search-result').insertAdjacentHTML('beforeend', `
                    <li id="search-result__next" class="search-result__pattern">
                        Loading....
                    </li>
                `);
                return;
            }
        }
    };

    // 検索条件の変更
    $$('.search-condision__select').forEach(elmn => elmn.addEventListener('change', event => {
        window.scrollTo({
            top: 0,
            behavior: 'instant',
        });
        $('#search-result').innerHTML = '';
        itrator = db.select(new FormData($('form')));
        appendResult();
    }));

    // 最下部までスクロールした時の処理
    window.addEventListener('scroll', function () {
        let target = $('#search-result__next');
        if (!!target) {
            let scroll = window.scrollY;
            let windowHeight = window.innerHeight;
            let targetPos = target.getBoundingClientRect().top + scroll;
            if (scroll > targetPos - windowHeight) {
                appendResult();
            }
        }
    });

    $('#search-scroll').addEventListener('click', _ => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });
}

export { initialize };
