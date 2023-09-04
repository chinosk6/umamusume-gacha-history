from flask import Flask, request, jsonify
import json
import server
import models as m
from sqlite3 import OperationalError
import utils
from flask_cors import CORS


app = Flask(__name__)
uma_server = server.UmaServerMain()
CORS(app)


@app.route("/api/upload/usergacha", methods=["POST"])
def gacha_history():
    try:
        data = json.loads(request.data)
        query_id = uma_server.db.update_user_gacha_data(m.GachaUserUploadHistory(**data))
        return query_id
    except BaseException as e:
        print("upload_user_gacha_failed", e)
        return "failed", 400

@app.route("/api/get/usergacha", methods=["GET"])
def get_gacha_history():
    try:
        query_id = request.args.get("query_id", "").strip()
        try:
            uid, did = utils.query_id_dec(query_id)
        except:
            return "", 404
        data = uma_server.db.get_user_gacha_data(uid, did)
        return jsonify(data.to_dict())
    except OperationalError:
        return "", 404
    except BaseException as e:
        print("get_gacha_history failed", e)
        return "", 500

if __name__ == "__main__":
    app.run("0.0.0.0", 5854)
