import React, { useState, useEffect } from 'react';
import '../App.css'; // Import the CSS file for animations
import { DiceFace1, DiceFace2, DiceFace3, DiceFace4, DiceFace5, DiceFace6 } from './DiceFaces';

const Dice = ({ faces, className }) => {
    const defaultFace = faces === 6 ? 6 : 3;
    const [value, setValue] = useState(defaultFace);
    const [rolling, setRolling] = useState(false);

    useEffect(() => {
        let interval;
        if (rolling) {
            interval = setInterval(() => {
                const randomValue = Math.floor(Math.random() * faces) + 1;
                setValue(randomValue);
            }, 200); // Change face every 200ms
        }
        return () => clearInterval(interval);
    }, [rolling, faces]);

    const rollDice = () => {
        if (!rolling) {
            setRolling(true);
            setTimeout(() => {
                const newValue = Math.floor(Math.random() * faces) + 1;
                setValue(newValue);
                setRolling(false);
            }, 2000); // Animation duration
        }
    };

    const renderDiceFace = (value) => {
        switch (value) {
            case 1: return <DiceFace1 />;
            case 2: return <DiceFace2 />;
            case 3: return <DiceFace3 />;
            case 4: return <DiceFace4 />;
            case 5: return <DiceFace5 />;
            case 6: return <DiceFace6 />;
            default: return null;
        }
    };

    return (
        <div className={`dice ${className} ${rolling ? 'rolling' : ''}`} onClick={rollDice}>
            {renderDiceFace(value)}
        </div>
    );
};

export default Dice;