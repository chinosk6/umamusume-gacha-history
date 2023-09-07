import React, { useRef, useEffect, useState } from 'react';

interface BackgroundOptions {
    imgSrc: string[];
    speed: number;
    maxCount?: number
}

const Background: React.FC<BackgroundOptions> = ({ imgSrc, speed, maxCount = 40 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);


    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        if (!("getContext" in canvas)) return;

        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.width = 2560;
        canvas.height = 1440;

        const images = imgSrc;
        const backgrounds: Background[] = [];

        class Background {
            x: number;
            y: number;
            image: HTMLImageElement;
            rotation: number;
            speedX: number;
            speedY: number;
            width: number;
            height: number;
            rotDirection: number;

            constructor(x: number, y: number, image: HTMLImageElement, width: number, height: number) {
                this.x = x;
                this.y = y;
                this.image = image;
                this.rotation = Math.random() * 360;
                this.speedX = Math.random() * speed + 1;
                this.speedY = -(Math.random() * speed + 1);
                this.width = width;
                this.height = height;
                this.rotDirection = this.rotation > 180 ? 1 : -1;
            }

            update() {
                if (!("getContext" in canvas)) return;
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) {
                    this.x = -this.width;
                }

                if (this.y < -this.height) {
                    this.y = canvas.height;
                }
                if ((-360 <= this.rotation) || (this.rotation <= 360)) {
                    this.rotation += this.rotDirection;
                }
                else {
                    this.rotation = 0;
                }
            }

            draw() {
                context?.save();
                context?.translate(this.x, this.y);
                context?.rotate((this.rotation * Math.PI) / 180);
                context?.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
                context?.restore();
            }
        }

        async function createBackground() {
            if (!("getContext" in canvas)) return;
            const imageIndex = Math.floor(Math.random() * images.length);
            const image = new Image();
            image.src = images[imageIndex];

            const loadImage = new Promise((resolve) => {
                image.onload = () => {
                    resolve(1);
                };
            });

            await loadImage;

            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const maxWidth = image.width;
            const maxHeight = image.height;
            const aspectRatio = maxWidth / maxHeight;
            let width = Math.max(Math.random(), 0.8) * maxWidth;
            let height = width / aspectRatio;
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }

            return new Background(x, y, image, width, height);
        }

        function updateBackgrounds() {
            if (!("getContext" in canvas)) return;
            context?.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < backgrounds.length; i++) {
                const background = backgrounds[i];
                background.update();
                background.draw();
            }

            requestAnimationFrame(updateBackgrounds);
        }

        async function startUpdate() {
            for (let i = 0; i < maxCount; i++) {
                let result = await createBackground();
                if (result) {
                    backgrounds.push(result);
                }
            }
            updateBackgrounds();
        }

        startUpdate();
    }, [speed]);

    return <canvas ref={canvasRef} className="background" />;
};

export default Background;
