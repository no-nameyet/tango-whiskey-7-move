import os
import shutil
import glob
from load_html.load import file_load
from make_db.db import convert

# main関数
def main():
    # データの取得
    file = file_load('https://tw7.t-walker.jp/garage/gravity/all', 'plane.html')
    # データベースの構築
    convert(file)
    # 不要ファイルの削除
    os.remove(file)
    # # データベースをデプロイ
    # files = glob.glob(os.getcwd() + '/tmp/*.json')
    # for file in files:
    #     shutil.copy(file, os.getcwd() + '/pages/resource/data')
    #
    # # tmpフォルダの削除
    # shutil.rmtree(os.getcwd() + '/tmp')

# 直接呼出し時にmain関数を参照させる
if __name__ == '__main__':
    main()
