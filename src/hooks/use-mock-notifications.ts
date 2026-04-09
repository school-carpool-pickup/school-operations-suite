'use client';

import { useEffect } from 'react';
import { useAppStore, NotificationSeverity } from './use-app-store';

const randomEvents = [
  { msg: 'Student "Emily Davis" was picked up.', level: 'success' },
  { msg: 'Beacon "Gate 1 Scanner" battery dropped below 20%.', level: 'warning' },
  { msg: 'New generic message from Administration.', level: 'info' },
  { msg: 'Parent "Tom Wilson" arrived at Drop-off Zone A.', level: 'info' },
  { msg: 'Failed transaction detected for Parent ID 9928.', level: 'error' },
];

export function useMockNotifications() {
  const addNotification = useAppStore(state => state.addNotification);

  useEffect(() => {
    // Inject a random notification every 20 seconds to simulate platform activity inside the demo.
    const interval = setInterval(() => {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      addNotification(event.msg, event.level as NotificationSeverity);
    }, 20000);

    return () => clearInterval(interval);
  }, [addNotification]);
}
