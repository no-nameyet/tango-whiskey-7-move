'use strict';
import * as db from 'paradoxDB'

/** １度に表示する最大行 */
const OFFSET = 50;

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
    /** DB初期化 */
    await db.init();

    /** 指定可能パラドクス数 */
    let optMove = makeOption(SELECTOR_MOVE, true);
    /** 指定可能スキル数 */
    let optSkill = makeOption(SELECTOR_SKILL, true);

    /** メタデータの取得 */
    let metadata = db.metadata()['timestamp'] || {
        timestamp: 'メタデータが取得できませんでした。',
    };

    $('#search-condision').insertAdjacentHTML('afterbegin', `
        <form>
            <div id="search-condision__title">検索条件</div>
            <div id="search-condision__status">
                <dl>
                    <dt class="search-condision__status-label">POW</dt>
                    <dd class="search-condision__status-list">
                        <ul>
                            <li class="search-condision__status-row"><label for="search-condision__pow1" class="search-condision__row-label">1</label><select id="search-condision__pow1" class="search-condision__select" name="pow1">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__pow2" class="search-condision__row-label">2</label><select id="search-condision__pow2" class="search-condision__select" name="pow2">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__pow3" class="search-condision__row-label">3</label><select id="search-condision__pow3" class="search-condision__select" name="pow3">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__pow4" class="search-condision__row-label">4</label><select id="search-condision__pow4" class="search-condision__select" name="pow4">${optMove}</select></li>
                        </ul>
                    </dd>
                    <dt class="search-condision__status-label">SPD</dt>
                    <dd class="search-condision__status-list">
                        <ul>
                            <li class="search-condision__status-row"><label for="search-condision__spd1" class="search-condision__row-label">1</label><select id="search-condision__spd1" class="search-condision__select" name="spd1">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__spd2" class="search-condision__row-label">2</label><select id="search-condision__spd2" class="search-condision__select" name="spd2">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__spd3" class="search-condision__row-label">3</label><select id="search-condision__spd3" class="search-condision__select" name="spd3">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__spd4" class="search-condision__row-label">4</label><select id="search-condision__spd4" class="search-condision__select" name="spd4">${optMove}</select></li>
                        </ul>
                    </dd>
                    <dt class="search-condision__status-label">WIZ</dt>
                    <dd class="search-condision__status-list">
                        <ul>
                            <li class="search-condision__status-row"><label for="search-condision__wiz1" class="search-condision__row-label">1</label><select id="search-condision__wiz1" class="search-condision__select" name="wiz1">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__wiz2" class="search-condision__row-label">2</label><select id="search-condision__wiz2" class="search-condision__select" name="wiz2">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__wiz3" class="search-condision__row-label">3</label><select id="search-condision__wiz3" class="search-condision__select" name="wiz3">${optMove}</select></li>
                            <li class="search-condision__status-row"><label for="search-condision__wiz4" class="search-condision__row-label">4</label><select id="search-condision__wiz4" class="search-condision__select" name="wiz4">${optMove}</select></li>
                        </ul>
                    </dd>
                </dl>
            </div>
            <dl id="search-condision__skill">
                <dt>技能数</dt>
                <dd><select class="search-condision__select" name="skill">${optSkill}</select></dd>
            </dl>
            <div id="search-condision__button">
                <ul>
                    <li><button type="reset">条件クリア</button></li>
                </ul>
            </div>
            <div id="search-condision__meta">${metadata['timestamp']}</div>

            <!-- オフセット -->
            <input type="hidden" name="offset" value="${OFFSET}"/>
        </form>
    `);

    $$('.search-condision__select').forEach(elmn => elmn.addEventListener('change', event => {
        let itrator = db.select(new FormData($('form')));

        let html = '';
        let idx = 0;
        for (let row of itrator()) {
            if (idx++ >= OFFSET) {
                break;
            }
            let pdx_html = '';
            for (var rdx of row) {
                pdx_html += `
                    <li class="search-result__paradox">
                        <dl class="search-result__detail">
                            <dt class="search-result__name">${rdx.name}（${rdx.status}${rdx.target}）</dt>
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
            html += `
                <li class="search-result__pattern">
                    <ul class="search-result__list">
                        ${pdx_html}
                    </ul>
                </li>
            `;
        }

        $('#search-result').innerHTML = '';
        $('#search-result').insertAdjacentHTML('afterbegin', html);
    }));
}

export { initialize };
