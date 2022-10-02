# nbtMapEditor
minecraftのmapのnbtデータを編集して任意の画像(128×128)に近いブロックの色に置き替えた地図上に書き換えます。

# usage
1. index.html or https://tsukasa-u.github.io/nbtMapEditor/ を起動。※１
2. 任意のmap_#.datをnbtの枠内にDrag&Drop.
3. 任意の画像(縦:128px, 横:128px)をimageの枠内にDrag&Drop.
4. WRITEの文字をClick.書き込みが始まります。
5. 書き込み終了の表示が出たら、file DownloadのURLをClick.map_#.datのダウンロードが始まります。※2
6. minecraftのセーブデータのworld/data/に保存。
7. minecraftにおいて、次のコマンドを実行　\give @p minecraft:filled_map{map:#} 1 

※１ Chrome  version: 105.0.5195.127(Official Build) (64 ビット)で動作確認済み。firefixでは正常に動作しないことがあります。

※２ Download終了と同時にdatファイルがeditorなどで開かれることがあります。

# image
本repositoryの画像の著作権はhttps://github.com/noboribe にあります。
