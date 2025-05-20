import os
import requests

def file_load(url, file_name):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    # リクエスト
    response = requests.get(url, headers=headers)
    if response.status_code != requests.codes.ok:
        raise Exception('相手のサーバーが有効になっていません')

    # フォルダの作成
    path_dir = os.getcwd() + '/tmp'
    if not os.path.exists(path_dir):
        os.mkdir(path_dir)

    # ファイルの出力
    path_file = path_dir + '/' + file_name
    f = open(path_file, 'w', encoding='UTF-8')
    f.write(response.text.replace("\u200B", ""))
    f.close()

    # ファイルの出力先を返す
    return path_file
