import sqlite3
import os
import models as m

spath = os.path.split(__file__)[0]

class UmaDb:
    def __init__(self):
        self.master_conn = sqlite3.connect(f"{spath}/../res/master.mdb", check_same_thread=False)

    def get_gacha_data(self):
        cursor = self.master_conn.cursor()
        cursor.row_factory = sqlite3.Row
        query = cursor.execute("SELECT * FROM gacha_data").fetchall()
        cursor.close()
        return [m.GachaDbData(**dict(i)) for i in query]
