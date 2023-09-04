import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Card, GachaTypes, UserData} from "./models/GachaResponse";
import GachaStatistics from "./GachaStatistics";
import {i18nText, LanguageTypes} from "../i18n/i18n";


const CardList: React.FC<{ cards: Card[], gachaType: GachaTypes, languageType: LanguageTypes }> = ({ cards, gachaType, languageType }) => {
    const [expanded, setExpanded] = useState<boolean>(true);

    const handleExpand = () => {
        setExpanded(!expanded);
    };

    const getSrcPath = (gachaType: GachaTypes, result: number, rarity: number) => {
        let resultStr = result.toString()
        if (gachaType === GachaTypes.Chara) {
            return `img/charas/chr_icon_${resultStr.substring(0, 4)}_${resultStr}_${ rarity < 3 ? "01" : "02"}.png`
        }
        else if (gachaType === GachaTypes.SupportCard) {
            return `img/cards/support_card_s_${resultStr}.png`
        }
        return ""
    }

    return (
        <div>
            {/*onClick={handleExpand}*/}
            <h2>{gachaType === GachaTypes.Chara ? i18nText("Chara Gacha History", languageType) : i18nText("Card Gacha History", languageType)}</h2>
            {expanded && (
                <ol className="card-ol">
                    {cards.map((card, index) => (
                        <li className="card-il" key={index}>
                            {/*<div>
                                <div>Cost Count: {card.cost_count}</div>
                            </div>*/}
                            <div className="card-results">
                                {card.results.map((result, i) => (
                                    <img key={i} src={ getSrcPath(gachaType, result.id, result.rarity) } alt={`Card ${result.id}`} className="card-image" />
                                ))}
                            </div>
                            <div>
                                <div>{card.create_time}</div>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

const Gacha: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<GachaTypes>(GachaTypes.SupportCard);
    const [languageType, setLanguageType] = useState<LanguageTypes>(LanguageTypes.SChinese);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserId(e.target.value);
    };

    let lastQueryTime = 0;  // 用于过滤载入时重复触发的事件
    const handleSubmit = (uid: string | null = null) => {
        let timeNow = Math.round(new Date().getTime() / 1000);
        if (timeNow - lastQueryTime > 2) {
            lastQueryTime = timeNow;
            fetchData(uid);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const uid = urlParams.get('uid');
        if (uid) {
            setUserId(uid);
            handleSubmit(uid);
        }
    }, []);

    const fetchData = async (uid: string | null = null) => {
        try {
            const response = await axios.get(`https://uma.gacha.chinosk6.cn/api/get/usergacha?query_id=${uid === null ? userId : uid}`);
            setUserData(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTabClick = (tab: GachaTypes) => {
        setActiveTab(tab);
    };

    return (
        <div>
            <div className="result-div">
                <input type="text" value={userId} onChange={handleInputChange} placeholder={i18nText("Enter User ID", languageType)} />
                <button onClick={() => handleSubmit()}>{i18nText("Submit", languageType)}</button>
                <div>
                    <label>Language</label>
                    <select onChange={(event) => {setLanguageType(parseInt(event.target.value))}} value={languageType}>
                        <option value={LanguageTypes.English}>{i18nText("English", languageType)}</option>
                        <option value={LanguageTypes.SChinese}>{i18nText("SChinese", languageType)}</option>
                    </select>
                </div>
            </div>
            <div className="result-div">
                {userData && (
                    <div>
                        <h1>{userData.user_name} ({userData.user_id})</h1>
                        <hr/>
                        <GachaStatistics userData={userData} languageType={languageType} />
                        <hr/>
                        <h1>{i18nText("Gacha History", languageType)}</h1>
                        <div className="tabs">
                            <div
                                className={`tab ${activeTab === GachaTypes.SupportCard ? 'active' : ''}`}
                                onClick={() => handleTabClick(GachaTypes.SupportCard)}
                            >
                                {i18nText("Support Card", languageType)}
                            </div>
                            <div
                                className={`tab ${activeTab === GachaTypes.Chara ? 'active' : ''}`}
                                onClick={() => handleTabClick(GachaTypes.Chara)}
                            >
                                {i18nText("Character", languageType)}
                            </div>
                        </div>
                        {activeTab === GachaTypes.SupportCard && (
                            <CardList cards={userData.data_cards} gachaType={GachaTypes.SupportCard} languageType={languageType} />
                        )}
                        {activeTab === GachaTypes.Chara && (
                            <CardList cards={userData.data_chara} gachaType={GachaTypes.Chara} languageType={languageType} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gacha;