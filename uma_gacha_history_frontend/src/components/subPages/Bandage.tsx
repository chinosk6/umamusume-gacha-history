import React from 'react';

type callBack = () => void;

interface BadgeProps {
    leftText: string;
    rightText: string;
    leftColor?: string;
    rightColor?: string;
    leftTextColor?: string;
    rightTextColor?: string;
    onClick?: callBack
}

// const baseStyle = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '3px 10px'
// }
const baseStyle = {}

function getBandageStyle(background, color, isLeft: boolean) {
    return isLeft ? Object.assign({}, baseStyle, {background: background,
                                                                 color: color,
                                                                 borderBottomLeftRadius: "5px",
                                                                 borderTopLeftRadius: "5px"}) :
        Object.assign({}, baseStyle, {background: background,
                                                     color: color,
                                                     borderBottomRightRadius: "5px",
                                                     borderTopRightRadius: "5px"});
}

const Badge: React.FC<BadgeProps> = ({ leftText, rightText, leftColor = 'green', rightColor = 'black',
                                         leftTextColor = "#fff", rightTextColor = "#fff",
                                         onClick}) => {
    return (
        <div style={{display: "flex", marginRight: "10px", height: "80%"}} onClick={onClick}>
            <div style={getBandageStyle(leftColor, leftTextColor, true)} className="bandage-base">
                {leftText}
            </div>
            <div style={getBandageStyle(rightColor, rightTextColor, false)} className="bandage-base">
                {rightText}
            </div>
        </div>

    );
};

export default Badge;
