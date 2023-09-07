import sqlite3
import os
import models as m
import errors
import utils
from . import umadb

spath = os.path.split(__file__)[0]

class UserDb(umadb.UmaDb):
    def __init__(self):
        super().__init__()
        self.conn = sqlite3.connect(f"{spath}/uma_gacha.db", check_same_thread=False)
        self.init_table()

    def init_table(self):
        cursor = self.conn.cursor()
        cursor.execute("""CREATE TABLE IF NOT EXISTS "user_names" (
        "user_id" INTEGER NOT NULL,
        "user_name" TEXT NOT NULL,
        "dmm_viewer_id" TEXT NOT NULL,
        PRIMARY KEY ("user_id")
        );""")
        cursor.execute("""CREATE TABLE IF NOT EXISTS "user_rank" (
        "user_id" INTEGER NOT NULL,
        "total_count" INTEGER NOT NULL,
        "count_3" INTEGER NOT NULL,
        "count_2" INTEGER NOT NULL,
        "score" REAL NOT NULL,
        PRIMARY KEY ("user_id")
        );""")
        self.conn.commit()
        cursor.close()

    def check_table(self, user_id: int):
        user_id = int(user_id)
        cursor = self.conn.cursor()
        cursor.execute(f"""CREATE TABLE IF NOT EXISTS "{user_id}" (
        "exec_history_id" INTEGER NOT NULL,
        "gacha_card_type" INTEGER NOT NULL,
        "gacha_id" INTEGER NOT NULL,
        "draw_num" INTEGER NOT NULL,
        "draw_type" INTEGER NOT NULL,
        "cost_count" INTEGER NOT NULL,
        "cost_id" INTEGER NOT NULL,
        "create_time" TEXT NOT NULL,
        "card_results" TEXT NOT NULL,
        PRIMARY KEY ("exec_history_id")
        );""")
        if cursor.rowcount > 0:
            self.conn.commit()
        cursor.close()

    def update_username(self, user_id: int, user_name: str, dmm_viewer_id: str):
        cursor = self.conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO user_names (user_id, user_name, dmm_viewer_id) VALUES (?, ?, ?)",
                       [user_id, user_name, dmm_viewer_id])
        self.conn.commit()
        cursor.close()

    def get_username(self, user_id: int, dmm_viewer_id: str):
        cursor = self.conn.cursor()
        query = cursor.execute("SELECT user_name FROM user_names WHERE user_id=? AND dmm_viewer_id=?",
                               [user_id, dmm_viewer_id]).fetchone()
        cursor.close()
        if not query:
            return None
        return query[0]

    def update_user_stat_info(self, user_id: int):
        """
        NEED COMMIT!
        """
        cursor = self.conn.cursor()
        try:
            cursor.row_factory = sqlite3.Row
            query = cursor.execute(f"SELECT * FROM \"{user_id}\" ORDER BY create_time DESC").fetchall()
            items = [m.GachaExecHistoryArrayRetItem(get_rarity_callback=self.get_rarity, **i) for i in query]

            count_3 = 0
            count_2 = 0
            total_count = 0
            for i in items:
                total_count += len(i.results)
                for r in i.results:
                    rarity = r["rarity"]
                    if rarity >= 3:
                        count_3 += 1
                    elif rarity == 2:
                        count_2 += 1
            score = round((count_3 * 6 + count_2) / total_count, 4)
            cursor.execute("INSERT OR REPLACE INTO user_rank (user_id, total_count, count_3, count_2, score) "
                           "VALUES (?, ?, ?, ?, ?)", [user_id, total_count, count_3, count_2, score])
            self.conn.commit()
        finally:
            cursor.close()

    def update_user_gacha_data(self, data: m.GachaUserUploadHistory):
        user_id = data.data_headers.viewer_id
        self.check_table(user_id)
        cursor = self.conn.cursor()
        for i in data.data.gacha_exec_history_array:
            cursor.execute(f"INSERT OR REPLACE INTO \"{user_id}\" (exec_history_id, gacha_card_type, gacha_id, "
                           f"draw_num, draw_type, cost_count, cost_id, create_time, card_results) "
                           f"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                           [i.exec_history_id, i.gacha_card_type, i.gacha_id, i.draw_num, i.draw_type,
                            i.cost_count, i.cost_id, i.create_time, data.data.get_reward_ids_str(i.exec_history_id)])
        self.conn.commit()
        cursor.close()
        self.update_user_stat_info(user_id)
        if data.user_name:
            self.update_username(user_id, data.user_name, data.dmm_viewer_id)
        return utils.query_id_enc(user_id, data.dmm_viewer_id)

    def get_rarity(self, card_id: int, card_type: int):
        # card_type: 1-chara; 2-support card
        cursor = self.master_conn.cursor()
        try:
            if card_type == 1:
                query = cursor.execute("SELECT default_rarity FROM card_data WHERE id=?", [card_id]).fetchone()
                if query:
                    return query[0], None
            elif card_type == 2:
                query = cursor.execute("SELECT rarity FROM support_card_data WHERE id=?", [card_id]).fetchone()
                if query:
                    rarity = query[0]
                    query = cursor.execute("SELECT text FROM text_data WHERE \"index\"=? AND id=75", [card_id]).fetchone()
                    if query:
                        return rarity, query[0]
                    else:
                        return rarity, None
            return -233, None
        finally:
            cursor.close()

    def get_user_gacha_data(self, user_id: int, dmm_viewer_id: str):
        user_id = int(user_id)
        user_name = self.get_username(user_id, dmm_viewer_id)
        if user_name is None:
            raise errors.UserNotFoundError()
        cursor = self.conn.cursor()
        cursor.row_factory = sqlite3.Row
        query = cursor.execute(f"SELECT * FROM \"{user_id}\" ORDER BY create_time DESC").fetchall()
        items = [m.GachaExecHistoryArrayRetItem(get_rarity_callback=self.get_rarity, **i) for i in query]

        query = cursor.execute("SELECT COUNT(*) FROM user_rank WHERE score > (SELECT score FROM user_rank WHERE user_id = ?)",
                               [user_id]).fetchone()
        if query:
            rank = query[0] + 1
        else:
            rank = -1
        total_users = cursor.execute("SELECT COUNT(*) FROM user_rank").fetchone()[0]
        cursor.close()

        return m.GachaUserReturnHistory(items, user_id, user_name, total_users, rank)
