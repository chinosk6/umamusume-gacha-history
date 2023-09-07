import React, { useRef, useEffect } from 'react';

interface TriangleProps {
    number: number;
}

const Triangle: React.FC<TriangleProps> = ({ number }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!("getContext" in canvas)) return;
        const context = canvas.getContext('2d');

        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(0, canvas.height);
            context.lineTo(canvas.width, 0);
            context.closePath();
            context.fillStyle = '#32CD32FF';
            context.fill();

            context.fillStyle = '#fff';
            let fontSize = 20;
            context.font = `${fontSize}px Arial`;
            let textWidth = context.measureText(String(number)).width;

            while (textWidth > canvas.width / 1.5) {
                fontSize -= 1;
                context.font = `${fontSize}px Arial`;
                textWidth = context.measureText(String(number)).width;
                if (fontSize < 8) break;
            }

            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(String(number), canvas.width / 3, canvas.height / 3);
        }
    }, [number]);

    return <canvas ref={canvasRef} width={60} height={60} />;
};

export default Triangle;
