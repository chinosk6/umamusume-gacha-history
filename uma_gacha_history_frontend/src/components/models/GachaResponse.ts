
export interface ResultInfo {
    id: number;
    rarity: number;
    name?: string;
}

export interface Card {
    cost_count: number;
    cost_id: number;
    create_time: string;
    draw_num: number;
    draw_type: number;
    exec_history_id: number;
    gacha_card_type: number;
    gacha_id: number;
    results: ResultInfo[];
}

export interface UserData {
    data_cards: Card[];
    data_chara: Card[];
    user_id: number;
    user_name: string;
    rank: number;
    total_users: number;
}

export enum GachaTypes {
    Chara,
    SupportCard
}
