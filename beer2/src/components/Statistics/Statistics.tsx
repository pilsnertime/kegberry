import React, { Fragment } from 'react';
import { Leaderboard } from '../Leaderboard/Leaderboard';
import './Statistics.css';
import { Link } from 'react-router-dom';
import users from '../../assets/users.png';
import { BreweryMixer } from '../BreweryMixer/BreweryMixer';

export function Statistics() {
  return (
    <Fragment>
      <Link to='/'>
        <div className='home-icon'>
          <img className='home-icon'
              src={users}
              alt='Home'/>
        </div>
      </Link>
      <Leaderboard/>
      <BreweryMixer/>
    </Fragment>
  );
}