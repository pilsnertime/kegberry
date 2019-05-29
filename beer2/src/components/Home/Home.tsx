import React, { useState, useEffect } from 'react';
import { useMessagingService } from '../../infrastructure/MessagingContext';
import './Home.css';
import { Users } from '../Users/Users';
import { Pouring } from '../Pouring/Pouring';


export const Home = (props: any) => {
  const messagingService = useMessagingService();
  const [pouring, setPouring] = useState(false);
  const onUserSelected = () => {
    setPouring(true);
  };

  const onPourFinished = () => {
    setPouring(false);
  };

  useEffect(() => {
    const subscription = messagingService.currentUserTimeoutNotification$
      .subscribe(_ => {
        setPouring(false)
    });

    return () => subscription.unsubscribe();
  },
  [messagingService
    .currentUserTimeoutNotification$]);

  return (
    <div className="home">
      {!pouring &&
        <Users onUserSelected={onUserSelected}>
        </Users>
      }
      {pouring &&
        <Pouring pourFinished={onPourFinished}>
        </Pouring>
      }
    </div>
  )
}