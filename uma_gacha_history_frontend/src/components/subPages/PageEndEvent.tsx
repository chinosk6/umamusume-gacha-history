import React, { useEffect, useRef } from 'react';

type callbackFun = () => void;

const PageEndEvent: React.FC<{onPageEnd: callbackFun}> = ({onPageEnd}) => {
    const targetRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    onPageEnd();
                }
            });
        });

        observer.observe(targetRef.current!);

        return () => {
            observer.unobserve(targetRef.current!);
        };
    }, []);

    return <div ref={targetRef}></div>;
};

export default PageEndEvent;
