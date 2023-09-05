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
                <div className="config-div">
                    <div>
                        <div className="searchbar">
                            <div className="searchbar-wrapper">
                                <div className="searchbar-left">
                                    <div className="search-icon-wrapper">
                                        <span className="search-icon searchbar-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path
                                                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
                                                </path>
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                <div className="searchbar-center">
                                    <div className="searchbar-input-spacer"></div>
                                    <input type="text" className="searchbar-input" maxLength={2048}
                                           autoCapitalize="off" role="combobox"
                                           placeholder={i18nText("Enter User ID", languageType)}
                                           value={userId} onChange={handleInputChange}/>
                                </div>

                                <div className="searchbar-right">
                                    <img src="umai.png" alt="search" className="start-search" role="button" onClick={() => handleSubmit()}/>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div>
                        <label className="label-for">Language</label>
                        <select onChange={(event) => {setLanguageType(parseInt(event.target.value))}} value={languageType} className="select">
                            <option value={LanguageTypes.English}>{i18nText("English", languageType)}</option>
                            <option value={LanguageTypes.SChinese}>{i18nText("SChinese", languageType)}</option>
                        </select>
                    </div>
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

                        <div style={{display: "flex", justifyContent: "center"}}>
                            <div className="radio-inputs">
                                <label className="radio">
                                    <input type="radio" name="radioGachaType" onClick={() => handleTabClick(GachaTypes.SupportCard)} defaultChecked/>
                                    <span className="name">{i18nText("Support Card", languageType)}</span>
                                </label>
                                <label className="radio">
                                    <input type="radio" name="radioGachaType" onClick={() => handleTabClick(GachaTypes.Chara)}/>
                                    <span className="name">{i18nText("Character", languageType)}</span>
                                </label>
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