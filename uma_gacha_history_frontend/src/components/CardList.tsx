import React, {useState} from "react";
import {Card, GachaTypes} from "./models/GachaResponse";
import {i18nText, LanguageTypes} from "../i18n/i18n";
import Triangle from "./subPages/Triangle";


const CardList: React.FC<{ cards: Card[], gachaType: GachaTypes, languageType: LanguageTypes, showCount: number }> =
    ({cards, gachaType, languageType, showCount}) => {
    const [expanded, setExpanded] = useState<boolean>(true);

    const i18nT = (id: string) => i18nText(id, languageType);

    const handleExpand = () => {
        setExpanded(!expanded);
    };

    const getSrcPath = (gachaType: GachaTypes, result: number, rarity: number) => {
        let resultStr = result.toString()
        if (gachaType === GachaTypes.Chara) {
            return `img/charas/chr_icon_${resultStr.substring(0, 4)}_${resultStr}_${rarity < 3 ? "01" : "02"}.jpg`
        } else if (gachaType === GachaTypes.SupportCard) {
            return `img/cards/support_card_s_${resultStr}.jpg`
        }
        return ""
    }

    const onCardClick = (cardType: GachaTypes, cardName?: string) => {
        if (!cardName) return;
        switch (cardType) {
            case GachaTypes.SupportCard:
                let newName = cardName.replace(/\[/g, "【")
                    .replace(/]/g, "】")
                    .replace(/・/g, "·");
                window.open(`https://wiki.biligame.com/umamusume/${newName}`, "_blank");
                break;
            default:
                break;
        }
    }

    return (
        <div>
            {/*onClick={handleExpand}*/}
            <h2>{gachaType === GachaTypes.Chara ? i18nT("Chara Gacha History") : i18nT("Card Gacha History")}</h2>
            {expanded && (
                <ol className="card-ol">
                    {cards.slice(0, showCount).map((card, index) => (
                        <li className="card-il" key={index}>
                            <div className="triangle">
                                <Triangle number={index + 1}/>
                            </div>
                            <div>
                                <div className="card-results">
                                    {card.results.map((result, i) => (
                                        <img key={i} src={getSrcPath(gachaType, result.id, result.rarity)}
                                             alt={`Card ${result.id}`} className="card-image"
                                             onClick={() => {onCardClick(gachaType, result.name)}}/>
                                    ))}
                                </div>
                                <div>
                                    <div>{card.create_time}</div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default CardList;
