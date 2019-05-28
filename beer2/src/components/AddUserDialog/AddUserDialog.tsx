import React, { useState, useCallback } from 'react';
import './AddUserDialog.css';

export interface IAddUserDialogProps {
  onCommit(username: string): void;
  onCancel(): void;
}

export function AddUserDialog(props: IAddUserDialogProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const handleOnKeyUp = useCallback((event: any) => setUsernameInput(event.target.value), []);

  return (
    <div className='add-user-dialog'>
      <label className='username-label'>What's your name?</label>
      <input type='username' placeholder='Type Name' onKeyUp={handleOnKeyUp}/>
      <div className='action-buttons'>
          <button className='cancel-button' onClick={props.onCancel}>Cancel</button>
          <button className='commit-button' onClick={() => { props.onCommit(usernameInput) }}>Ok</button>
      </div>
    </div>
  );
}