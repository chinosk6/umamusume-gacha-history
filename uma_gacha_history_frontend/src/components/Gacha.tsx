import React, {useEffect, useState, useRef} from 'react';
import axios, {AxiosError} from 'axios';
import {Card, GachaTypes, UserData} from "./models/GachaResponse";
import CardList from "./CardList";
import GachaStatistics from "./GachaStatistics";
import {i18nText, LanguageTypes} from "../i18n/i18n";
import Cookies from "js-cookie";
import SearchBar from "./subPages/SearchBar";
import PageEndEvent from "./subPages/PageEndEvent";
import Bandage from "./subPages/Bandage";
import PopUpWindow from "./subPages/PopUpWindow";
import Background from "./Background";


const shouCountAdd = 5;
let currentShouCount = 5;

const Gacha: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<GachaTypes>(GachaTypes.SupportCard);
    const [languageType, setLanguageType] = useState(LanguageTypes.SChinese);
    const [searchTip, setSearchTip] = useState("");
    const [showCount, setShowCount] = useState<number>(shouCountAdd);
    const [popUpText, setPopUpText] = useState("");
    const [popUpDisplay, setPopUpDisplay] = useState(false);

    const i18nT = (id: string) => i18nText(id, languageType);

    const onLanguageTypeChanged = (value: number) => {
        setLanguageType(value);
        Cookies.set("userSetLang", value.toString());
    }

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
        else {
            const cookieCache = Cookies.get("lastQueryUID");
            if (cookieCache) {
                setUserId(cookieCache);
            }
        }
        const userLang = Cookies.get("userSetLang");
        if (userLang) {
            setLanguageType(parseInt(userLang));
        }
    }, []);

    const fetchData = async (uid: string | null = null) => {
        try {
            const searchUID = uid === null ? userId : uid;
            const response = await axios.get(`https://uma.gacha.chinosk6.cn/api/get/usergacha?query_id=${searchUID}`);
            setUserData(response.data);
            setSearchTip("");
            if (response.status == 200) {
                Cookies.set("lastQueryUID", searchUID);
            }
        }
        catch (error) {
            if (error instanceof AxiosError) {
                switch (error.response?.status) {
                    case 404:
                        setSearchTip(`${i18nT("Search User Failed")}: ${i18nT("User Not Found")}.`); break;
                    default:
                        setSearchTip(`${i18nT("Search User Failed")}: ${error.response?.status}`);
                }
            } else {
                console.error("fetchDataError", error);
            }
        }
    };

    const handleTabClick = (tab: GachaTypes) => {
        if (tab != activeTab) {
            setActiveTab(tab);
            currentShouCount = shouCountAdd;
            setShowCount(currentShouCount);
        }
    };

    let lastEndTime = new Date().getTime();
    const onPageEnd = () => {
        let currentEndTime = new Date().getTime();
        if (currentEndTime - lastEndTime > 100) {
            lastEndTime = currentEndTime;
            currentShouCount += shouCountAdd;
            setShowCount(currentShouCount);
        }
    };

    const popUp = (text: string) => {
        setPopUpText(text);
        setPopUpDisplay(true);
    }

    return (
        <div>
            <div className="background">
                <Background imgSrc={['bg/orange.png', 'bg/green.png', 'bg/blue.png']} speed={0.1}/>
            </div>
            <PopUpWindow text={popUpText} display={popUpDisplay} setDisplay={setPopUpDisplay}/>
            <div className="result-div">
                <div className="config-div">
                    <div className="title-div">
                        <h1>{i18nT("Umamusume Gacha History")}</h1>
                        <div style={{display: "flex", height: "100%", flexDirection: "column"}}>
                            <a href="#" onClick={() => popUp(i18nT("_description"))}>(?)</a>
                        </div>
                    </div>
                    <div className="repo-div">
                        <a href="https://github.com/chinosk6/umamusume-gacha-history" className="bandage-a" target="_blank">
                            <Bandage leftText={"Github"} rightText={"This Repo"} leftColor={"#414141"}
                                     rightColor={"#007ec6"} leftTextColor={"#fff"} rightTextColor={"#fff"}/>
                        </a>
                        <a href="https://github.com/MinamiChiwa/Trainers-Legend-G" className="bandage-a" target="_blank">
                            <Bandage leftText={"Github"} rightText={"Trainers' Legend G"} leftColor={"#414141"}
                                     rightColor={"#007ec6"} leftTextColor={"#fff"} rightTextColor={"#fff"}/>
                        </a>
                    </div>
                    <div>
                        <SearchBar inputValue={userId} placeHolder={i18nT("Enter User ID")}
                                   onInputChange={handleInputChange} onSubmit={() => handleSubmit()} />
                    </div>
                    <div style={{display: searchTip ? "" : "none"}}>
                        <p style={{color: "red"}}>{searchTip}</p>
                    </div>
                    <div style={{marginTop: "8px"}}>
                        <label className="label-for">Language</label>
                        <select onChange={(event) => onLanguageTypeChanged(parseInt(event.target.value))} value={languageType} className="select">
                            {
                                Object.keys(LanguageTypes).filter((value) =>
                                    !value.match(/^\d+$/)
                                ).map((r, i) => {
                                    return (
                                        <option value={LanguageTypes[r as keyof typeof LanguageTypes]} key={i}>{i18nT(r)}</option>
                                    )
                                })
                            }
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
                        <h1>{i18nT("Gacha History")}</h1>

                        <div style={{display: "flex", justifyContent: "center"}}>
                            <div className="radio-inputs">
                                <label className="radio">
                                    <input type="radio" name="radioGachaType" onClick={() => handleTabClick(GachaTypes.SupportCard)} defaultChecked/>
                                    <span className="name">{i18nT("Support Card")}</span>
                                </label>
                                <label className="radio">
                                    <input type="radio" name="radioGachaType" onClick={() => handleTabClick(GachaTypes.Chara)}/>
                                    <span className="name">{i18nT("Character")}</span>
                                </label>
                            </div>
                        </div>


                        {activeTab === GachaTypes.SupportCard && (
                            <CardList cards={userData.data_cards} gachaType={GachaTypes.SupportCard}
                                      languageType={languageType} showCount={showCount} />
                        )}
                        {activeTab === GachaTypes.Chara && (
                            <CardList cards={userData.data_chara} gachaType={GachaTypes.Chara}
                                      languageType={languageType} showCount={showCount} />
                        )}
                    </div>
                )}
            </div>
            <PageEndEvent onPageEnd={onPageEnd}/>
        </div>
    );
};

export default Gacha;