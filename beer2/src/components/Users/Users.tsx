import React, { useState, useEffect, Fragment } from 'react';
import { useMessagingService } from '../../infrastructure/MessagingContext';
import { GetUsers, IGetUserResponse, IUser, IAddUserMessageData, AddUser, SelectUser, ISelectUserData } from '../../infrastructure/MessagingService';
import './Users.css';
import add_user from '../../assets/add_user.png';
import stats from '../../assets/stats.png';
import profile0 from '../../assets/profile_0.png'
import profile1 from '../../assets/profile_1.png'
import profile2 from '../../assets/profile_2.png'
import profile3 from '../../assets/profile_3.png'
import profile4 from '../../assets/profile_4.png'
import profile5 from '../../assets/profile_5.png'
import profile6 from '../../assets/profile_6.png'
import profile7 from '../../assets/profile_7.png'
import profile8 from '../../assets/profile_8.png'
import profile9 from '../../assets/profile_9.png'
import { AddUserDialog } from '../AddUserDialog/AddUserDialog';
import { Link } from 'react-router-dom';

const profileImages = [
  profile0,
  profile1,
  profile2,
  profile3,
  profile4,
  profile5,
  profile6,
  profile7,
  profile8,
  profile9
];

export interface IUsersProps {
  onUserSelected: () => void;
}

export const Users = (props: any) => {
  const messagingService = useMessagingService();
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [addUserDialogActive, setAddUserDialogActive]  = useState(false);

  function addUser(username: string): void {
    let data: IAddUserMessageData = {name: username};
    messagingService.sendMessage(AddUser, data);
  }

  function onUserSelected(user: IUser): void {
    let data: ISelectUserData = {id: user.id};
    messagingService.sendMessage(SelectUser, data);
    setSelectedUserId(user.id);
    props.onUserSelected();
  }

  function onAddUserCommit(username: string) {
      setAddUserDialogActive(false);
      addUser(username);
  }

  function onAddUserCancel() {
    setAddUserDialogActive(false);
  }

  function onAddUser() {
    setAddUserDialogActive(true);
  }

  useEffect(() => {
    const subscriptions = [
      messagingService.readyStream.subscribe(() => {
        messagingService.sendMessage(GetUsers, undefined);
      }),
      messagingService.getUsersResponseStream.subscribe((response: IGetUserResponse|undefined) => {
        if (response !== undefined) {
            setUsers(response.users);
        }
      }),
      messagingService.addUserResponseStream.subscribe((user: IUser) => {
        if (user !== undefined || user !== null) {
          setUsers(users => [...users, user]);
        }
      })
    ];

    return () => subscriptions.forEach(sub => sub.unsubscribe());
  },
  [messagingService]);

  return (
    <Fragment>
      {addUserDialogActive &&
      <AddUserDialog
        onCommit={onAddUserCommit}
        onCancel={onAddUserCancel}/>}
      <div className='users-container'>
        <Link to="/stats">
          <div className='user-container'>
            <div className='user-icon'>
              <img className='user-icon'
                src={stats}
                alt='Leaderboard Chart'/>
            </div>
          </div>
        </Link>
        <div className='user-container'>
          <div className='user-icon'
            onClick={onAddUser}>
            <img className='user-icon'
              src={add_user}
              alt='Add User'/>
          </div>
        </div>
        
          {
            users.map((user, index) => {
              return <div key={index} className='user-container'>
                <img className={user.id === selectedUserId ?
                  'user-icon-selected' : 'user-icon'}
                  src={profileImages[index % 10]}
                  alt='Avatar'
                  onClick={() => onUserSelected(user)}/>
                <div className='user-name'>
                  {user.name}
                </div>
              </div>
            })
          }
        
      </div>
    </Fragment>
  );
}