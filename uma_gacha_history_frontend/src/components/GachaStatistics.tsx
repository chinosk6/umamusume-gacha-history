import { Card, UserData, ResultInfo } from "./models/GachaResponse";
import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from "react-chartjs-2";
import {i18nText, LanguageTypes} from "../i18n/i18n";

ChartJS.register(ArcElement, Tooltip, Legend);

enum FTypes {
    All,
    Chara,
    Card
}

const GachaStatistics: React.FC<{userData: UserData, languageType: LanguageTypes}> = ({userData, languageType}) => {
    const [fType, setFType] = useState(FTypes.All);
    const [countLimit, setCountLimit] = useState(2000);
    const [rarityData, setRarityData] = useState<number[]>([]);
    const [totalGachaCount, setTotalGachaCount] = useState(0);
    const [continuousNoDesiredCount, setContinuousNoDesiredCount] = useState(0);

    const onCountLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCountLimit(parseInt(e.target.value));
    }

    const getRarityDataPercentage = (index: number) => {
        let total = 0;
        rarityData.forEach((v) => {total += v});
        return `${(rarityData[index] / total * 100).toFixed(2)}%`;
    }

    const getFilteredCardData = () => {
        let cardData: Card[] = [];
        if (fType === FTypes.All) {
            cardData = [...userData.data_cards, ...userData.data_chara];
        } else if (fType === FTypes.Chara) {
            cardData = userData.data_chara;
        } else if (fType === FTypes.Card) {
            cardData = userData.data_cards;
        }
        cardData.sort((a, b) => {
            const dateA = new Date(a.create_time);
            const dateB = new Date(b.create_time);
            return dateB.getTime() - dateA.getTime();
        });
        return countLimit > 0 ? cardData.slice(0, countLimit) : cardData;
    }

    const updateContinuousNoDesiredCount = (cardData: Card[]) => {
        let continuousCount = 0;
        let maxContinuousCount = 0;
        cardData.forEach((card) => {
            card.results.forEach((result) => {
                if (result.rarity < 3) {
                    continuousCount += 1;
                }
                else {
                    if (continuousCount > maxContinuousCount) {
                        maxContinuousCount = continuousCount;
                        continuousCount = 0;
                    }
                }
            })
        })
        if (continuousCount > maxContinuousCount) {
            maxContinuousCount = continuousCount;
        }
        setContinuousNoDesiredCount(maxContinuousCount);
    }

    const updateStatistics = ()=> {
        let cardData: Card[] = getFilteredCardData();
        const rarityCount: { [key: number]: number } = {};
        let _totalGachaCount = 0;

        cardData.forEach((card) => {
            _totalGachaCount += card.results.length;
            card.results.forEach((result) => {
                if (rarityCount[result.rarity]) {
                    rarityCount[result.rarity]++;
                } else {
                    rarityCount[result.rarity] = 1;
                }
            });
        });

        const rarityValues = Object.values(rarityCount);
        setRarityData(rarityValues);
        setTotalGachaCount(_totalGachaCount);
        updateContinuousNoDesiredCount(cardData);
    }

    useEffect(() => {
        updateStatistics();
    }, [fType, countLimit, userData]);

    const pieChartData = {
        labels: [`R/☆ (${getRarityDataPercentage(0)})`, `SR/☆☆ (${getRarityDataPercentage(1)})`,
            `SSR/☆☆☆ (${getRarityDataPercentage(2)})`],
        datasets: [
            {
                label: "#gachaRarity",
                data: rarityData,
                backgroundColor: [
                    "#7a7676",
                    "#8bd8fc",
                    "#FFCE56",
                ],
            },
        ],
    };

    return (
        <div className="stat-div">
            <div className="radio-inputs">
                <label className="radio">
                    <input type="radio" name="radioFilterType" onClick={() => {setFType(FTypes.All)}} defaultChecked/>
                        <span className="name">{i18nText("All", languageType)}</span>
                </label>
                <label className="radio">
                    <input type="radio" name="radioFilterType" onClick={() => {setFType(FTypes.Chara)}}/>
                        <span className="name">{i18nText("Chara Only", languageType)}</span>
                </label>

                <label className="radio">
                    <input type="radio" name="radioFilterType" onClick={() => {setFType(FTypes.Card)}}/>
                        <span className="name">{i18nText("Card Only", languageType)}</span>
                </label>
            </div>

            <div style={{height: "40px", display: "flex", flexDirection: "row", alignItems: "center"}}>
                <label htmlFor="countLimitInput" className="label-for">{i18nText("Gacha Count Limit", languageType)}</label>
                <input id="countLimitInput" type="number" className="searchbar" value={countLimit} onChange={onCountLimitChange} />
            </div>
            <div className="stat-info-div">
                <div>
                    <p>{i18nText("Total Gacha Count", languageType)}: {totalGachaCount}</p>
                    <p>{i18nText("SSR/3☆ Rate", languageType)}: {getRarityDataPercentage(2)}</p>
                    <p>{i18nText("Continuous No SSR/3☆ Count", languageType)}: {continuousNoDesiredCount}</p>
                    <p>{i18nText("Lucky Ranking (Total)", languageType)}: {userData.rank}/{userData.total_users}</p>
                </div>
                <Pie data={pieChartData} className="pie" />
            </div>

        </div>
    );
}

export default GachaStatistics;
