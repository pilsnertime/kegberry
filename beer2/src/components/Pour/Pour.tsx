import React, { useState, useEffect } from 'react';
import { useMessagingService } from '../../infrastructure/MessagingContext';
import { IPourNotification } from '../../infrastructure/MessagingService';
import './Pour.css';

export interface IPourProps {
  pourFinished(): void;
}

export function Pour({ pourFinished }: IPourProps) {
  const maxBeerHeight = 220;
  const [progress, setProgress] = useState(0);
  const foams = Array(7).fill(0).map((x,i) => i);
  const bubbles = Array(6).fill(0).map((x, i) => i);
  const messagingService = useMessagingService();

  useEffect(() => {
    messagingService.pourNotificationStream.subscribe((data: IPourNotification) => {
      if (data !== undefined) {
        const newProgress = data.totalPour*1200/5;
        setProgress(newProgress);
        console.log('totalpour' + data.totalPour);
        console.log(newProgress);

        if (data.isFinished) {
          setTimeout(() => {
              setProgress(0);
              pourFinished();
          }, 4000);
        }
      }
    })
  },
  [messagingService.pourNotificationStream, pourFinished]);

  return (
    <div className='pour-progress'>
      <div id='beer-pint-container'>
        <div id='pint'>
          <div id='liquid' style={{height: progress * maxBeerHeight / 100}}>
            <div id='bubblesContainer'>
                {bubbles.map((bubble, index) => {
                  return <div key={index} className='bubble'></div>;
                })}
            </div>
          </div>
          <div className='beer-foam'>
              {foams.map((foam, index) => {
                return <div key={index} className='foam'></div>;
              })}
          </div>
        </div>
      </div>
    </div>
  );
};