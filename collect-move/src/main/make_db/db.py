import os
import re
import json
from bs4 import BeautifulSoup

def convert(file_path):
    # DOM操作の初期化
    with open(file_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')

    # パラドクスの一覧
    paradox = __paradox(soup)
    __output_json(paradox, 'paradox.json')
    __output_json(__paradox__sort(soup), 'paradox__sort.json')
    __output_json(__paradox__idx_status(paradox), 'paradox__status.json')
    __output_json(__paradox__idx_target(paradox), 'paradox__target.json')
    __output_json(__paradox__idx_effect1(paradox), 'paradox__effect1.json')
    __output_json(__paradox__idx_effect2(paradox), 'paradox__effect2.json')

    # スキルの一覧
    __output_json(__skills(soup, paradox), 'skills.json')
    __output_json(__skills__sort(soup), 'skills__sort.json')
    __output_json(__skills__idx_prefix(soup), 'skills__idx-prefix.json')



# JSONを出力する
def __output_json(data, file_name):
    with open(os.getcwd() + '/tmp/' + file_name, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

# パラドクス一覧の取得
def __paradox(soup):
    paradox = {}
    for idx, part in enumerate(soup.select('.grid-parts')):
        id = part.select('a')[0].get('href').split('#')[-1]

        target = 0
        effect1 = ''
        effect2 = ''
        skill = []
        paradox[id] = {
            'name': part.select('h4')[0].text,
            'status': part.select('span')[0].text,
            'target': re.findall(r'対象：(\d)体', part.text)[0],
            'effect1': re.findall(r'効果1：【([^】]+)】', part.text)[0],
            'effect2': re.findall(r'効果2：【([^】]+)】', part.text)[0],
            'skill': re.split(r'[　 ]', re.findall(r'使用技能：([^\n]+)', part.text)[0]),
        }
    return paradox

# パラドクスの順序を取得
def __paradox__sort(soup):
    paradox = {}
    return list(map(lambda x: x.text, soup.select('.grid-parts h4')))

# パラドクスのインデックス（ステータス）を取得
def __paradox__idx_status(paradox):
    status = {}
    for key, value in paradox.items():
        if value['status'] not in status:
            status[value['status']] = []
        status[value['status']].append(key)
    return status

# パラドクスのインデックス（ターゲット）を取得
def __paradox__idx_target(paradox):
    target = {}
    for key, value in paradox.items():
        if value['target'] not in target:
            target[value['target']] = []
        target[value['target']].append(key)
    return target

# パラドクスのインデックス（残留効果１）を取得
def __paradox__idx_effect1(paradox):
    effect1 = {}
    for key, value in paradox.items():
        if value['effect1'] not in effect1:
            effect1[value['effect1']] = []
        effect1[value['effect1']].append(key)
    return effect1

# パラドクスのインデックス（残留効果２）を取得
def __paradox__idx_effect2(paradox):
    effect2 = {}
    for key, value in paradox.items():
        if value['effect2'] not in effect2:
            effect2[value['effect2']] = []
        effect2[value['effect2']].append(key)
    return effect2

# スキル一覧の取得
def __skills(soup, paradox):
    skills = {}
    for key, value in __skills__idx_prefix(soup).items():
        for idx, option in enumerate(value):
            skills[option] = {
                'prefix': key,
                'paradox': [],
            }
    for key, value in paradox.items():
        for idx, option in enumerate(value['skill']):
            skills[option]['paradox'].append(key)
    return skills

# スキルの順序を取得
def __skills__sort(soup):
    return list(map(lambda x: x.get('value'), soup.select('.filter-skill option')[1:]))

# スキルのインデックス（プレフィクス）を取得
def __skills__idx_prefix(soup):
    skills = {}
    for idx, optgroup in enumerate(soup.select('.filter-skill > optgroup')):
        prefix = optgroup.get('label')
        options = list(map(lambda x: x.get('value'), soup.select('.filter-skill > optgroup[label="' + prefix + '"] > option')))
        skills[prefix] = options
    return skills
