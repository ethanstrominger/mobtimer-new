import React, { useEffect, useState } from 'react';
import { MobTimer } from '../mobTimer';

const frontendMobTimer = new MobTimer('front-end-timer');

const Timer = () => {

    // todo: maybe rename as secondPart and minutePart
    const [second, setSecond] = useState(0);
    const [minute, setMinute] = useState(0);    

    const countdownMilliseconds = 61 * 1000; // todo: unhardcode
    const endTime = Date.now() + countdownMilliseconds;

    const setTheTimer = () => {
        const currentTime = new Date().getTime();
        const distance = frontendMobTimer.secondsRemaining * 1000;

        console.log('distance', distance.toLocaleString("en-US") + " ms ("+ Math.round(distance/1000).toLocaleString("en-US")+" sec.)");

        const newMinute = Math.abs(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        const newSecond = Math.abs(Math.floor((distance % (1000 * 60)) / 1000));

        return [newMinute, newSecond]
    }

    useEffect(() => {
        //Component mounted
        const interval = setInterval(() => {

            const [newMinute, newSecond] = setTheTimer();
            setMinute(newMinute);
            setSecond(newSecond);

        }, 1000);

        //Component will unmount
        return () => { clearInterval(interval) }


    }, [minute, second]);

    return (
        <p>{minute}:{second}</p>
    );

}

export default Timer;
export { frontendMobTimer };