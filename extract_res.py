import sqlite3
from typing import Optional
import UnityPy
import os


def get_texture2d(file_path: str, name: Optional[str], save_name: str, resize=None):
    dir_name = os.path.dirname(save_name)
    if not os.path.isdir(dir_name):
        os.makedirs(dir_name)

    env = UnityPy.load(file_path)
    for obj in env.objects:
        if obj.type.name == "Texture2D":
            data = obj.read()
            if hasattr(data, "name") or (name is None):
                if (name is None) or (data.name.lower() == name.lower()):
                    img_data = data.read()
                    if resize:
                        img_data.image.resize(resize).save(save_name)
                    else:
                        img_data.image.save(save_name)
                    return True
    return False


class UmaDb:
    def __init__(self):
        self.base_path = f"{os.getenv('UserProfile')}/AppData/LocalLow/Cygames/umamusume"
        self.meta_conn = sqlite3.connect(f"{self.base_path}/meta")

    def get_bundle_path_from_hash(self, bundle_hash: str):
        return f"{self.base_path}/dat/{bundle_hash[:2]}/{bundle_hash}"

    def get_support_cards(self):
        cursor = self.meta_conn.cursor()
        query = cursor.execute("SELECT n, h FROM a WHERE n LIKE 'supportcard/support%/support_card_s_%'").fetchall()
        cursor.close()
        return query

    def get_chara_icons(self):
        cursor = self.meta_conn.cursor()
        query = cursor.execute("SELECT n, h FROM a WHERE n LIKE 'chara/chr____/chr_icon______%'").fetchall()
        cursor.close()
        return query


def main():
    db = UmaDb()
    support_cards = db.get_support_cards()
    total = len(support_cards)
    failed_names = []

    for n, i in enumerate(support_cards):
        name_full, bundle_hash = i[0], i[1]
        file_name = name_full.split("/")[-1]
        is_s = get_texture2d(db.get_bundle_path_from_hash(bundle_hash), file_name, f"extracted_res/cards/{file_name}.png",
                             resize=(64, 64))
        print(f"Card: {n + 1}/{total} {name_full} success: {is_s}")
        if not is_s:
            failed_names.append(file_name)

    chara_icons = db.get_chara_icons()
    total = len(chara_icons)
    for n, i in enumerate(chara_icons):
        name_full, bundle_hash = i[0], i[1]
        file_name = name_full.split("/")[-1]
        is_s = get_texture2d(db.get_bundle_path_from_hash(bundle_hash), file_name, f"extracted_res/charas/{file_name}.png",
                             resize=(64, 64))
        print(f"Chara: {n + 1}/{total} {name_full} success: {is_s}")
        if not is_s:
            failed_names.append(file_name)

    if failed_names:
        print("\nFailed:")
        print("\n".join(failed_names))


if __name__ == "__main__":
    main()
