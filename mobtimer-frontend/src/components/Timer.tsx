import { TimeUtils } from 'mobtimer-api';
import React, { useEffect, useState } from 'react';
import { frontendMobTimer } from '../timers';

const Timer = () => {

    const [timeString, setTimeString] = useState(frontendMobTimer.secondsRemainingString);

    useEffect(() => {
        //Component mounted
        const interval = setInterval(() => {
            // console.log(
            //     frontendMobTimer.secondsRemainingString, 
            //     TimeUtils.getMinutesPart(frontendMobTimer.secondsRemaining), 
            //     TimeUtils.getSecondsPart(frontendMobTimer.secondsRemaining),
            //      frontendMobTimer.secondsRemaining);
            setTimeString(frontendMobTimer.secondsRemainingString);
        }, 1000);

        //Component will unmount
        return () => { clearInterval(interval) }

    }, [timeString]);

    return (
        <p>{timeString}</p>
    );

}

export default Timer;
export { frontendMobTimer };