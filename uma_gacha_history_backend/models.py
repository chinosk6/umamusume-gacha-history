from pydantic import BaseModel
import typing as t


class GachaDbData(BaseModel):
    id: t.Optional[int]
    type: t.Optional[int]  # 1-chara; 2-support card
    start_date: t.Optional[int]
    end_date: t.Optional[int]


class GachaExecHistoryArrayItem(BaseModel):
    cost_count: t.Optional[int]
    cost_id: t.Optional[int]
    create_time: t.Optional[str]
    draw_num: t.Optional[int]
    draw_type: t.Optional[int]
    exec_history_id: t.Optional[int]
    gacha_card_type: t.Optional[int]  # 1-chara; 2-support card
    gacha_id: t.Optional[int]


class GachaRewardHistoryArrayItem(BaseModel):
    additional_piece_num: t.Optional[int]
    card_id: t.Optional[int]
    card_type: t.Optional[int]
    common_item_category: t.Optional[int]
    common_item_id: t.Optional[int]
    convert_common_item_num: t.Optional[int]
    convert_piece_num: t.Optional[int]
    disp_order: t.Optional[int]
    exec_history_id: t.Optional[int]
    piece_id: t.Optional[int]


class GachaUserUploadHistoryData(BaseModel):
    gacha_exec_history_array: t.List[GachaExecHistoryArrayItem]
    gacha_reward_history_array: t.List[GachaRewardHistoryArrayItem]

    def get_reward_ids_str(self, exec_history_id: int):
        items = []
        for i in self.gacha_reward_history_array:
            if i.exec_history_id == exec_history_id:
                items.append(i)
        items = sorted(items, key=lambda x: x.disp_order)
        return "|".join([str(i.card_id) for i in items])


class DataHeaders(BaseModel):
    viewer_id: int


class GachaUserUploadHistory(BaseModel):
    data: GachaUserUploadHistoryData
    data_headers: DataHeaders
    response_code: t.Optional[int]
    user_name: t.Optional[str]
    dmm_viewer_id: t.Optional[str]


class GachaExecHistoryArrayRetItem(GachaExecHistoryArrayItem):
    results: t.List[t.Dict[str, int]]

    def __init__(self, get_rarity_callback: t.Callable[[int, int], int], **data):
        results_str = data.get("card_results", "")
        results = []
        for i in results_str.split("|"):
            if i.isdigit():
                card_id = int(i)
                rarity = get_rarity_callback(card_id, data["gacha_card_type"])
                if rarity != -233:
                    results.append({"id": card_id, "rarity": rarity})
        data["results"] = results
        super().__init__(**data)


class GachaUserReturnHistory(BaseModel):
    user_id: int
    user_name: str
    data_chara: t.List[GachaExecHistoryArrayRetItem]
    data_cards: t.List[GachaExecHistoryArrayRetItem]
    total_users: int
    rank: int


    def __init__(self, data: t.List[GachaExecHistoryArrayRetItem], user_id: int, user_name: str, total_users: int,
                 rank: int):
        data_chara = []
        data_cards = []
        for i in data:
            gacha_card_type = i.gacha_card_type
            if gacha_card_type == 1:
                data_chara.append(i)
            elif gacha_card_type  == 2:
                data_cards.append(i)
            else:
                print(f"Unknown gacha_card_type： {gacha_card_type}")
        super().__init__(data_chara=data_chara, data_cards=data_cards, user_id=user_id, user_name=user_name,
                         total_users=total_users, rank=rank)

    def to_dict(self):
        data = dict(self)
        for n, i in enumerate(data["data_chara"]):
            data["data_chara"][n] = dict(i)
        for n, i in enumerate(data["data_cards"]):
            data["data_cards"][n] = dict(i)
        return data
