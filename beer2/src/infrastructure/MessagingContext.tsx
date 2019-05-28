import React, { useContext } from 'react';
import { MessagingService, IMessagingService } from './MessagingService';

export const MessagingContext = React.createContext<IMessagingService|undefined>(undefined);

export function MessagingServiceProvider({children}: any): any {
  const messageService = new MessagingService();

  return (
    <MessagingContext.Provider value={messageService}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessagingService() {
  const messagingContext = useContext(MessagingContext);
  if (messagingContext === undefined) {
    throw new Error('useMessagingService must be used within a MessagingServiceProvider')
  }

  return messagingContext;
}
