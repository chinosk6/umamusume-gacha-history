import React from "react";


const PopUpWindow: React.FC<{text: string, display: boolean, setDisplay}> = ({text, display, setDisplay}) => {
    return (
        <div style={{display: display ? "" : "none"}} className="overlay" onClick={() => setDisplay(false)}>
            <div className="popup" onClick={(event => event.stopPropagation())}>
                <div className="popup-close">
                    <a onClick={() => setDisplay(false)}>x</a>
                </div>
                <div className="popup-inner" onClick={() => {}}>
                    {text.split("\n").map((t, index, arr) => (
                        <p className="popup-p" key={index}>{t}</p>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PopUpWindow;
