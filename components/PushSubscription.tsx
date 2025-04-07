import { useEffect } from 'react';
import { registerServiceWorker, subscribeToPush, sendSubscriptionToServer } from '../lib/push';

const VAPID_PUBLIC_KEY = 'BBceryB_Lo_6FOu8_jstUK5ExGze1esePCV8P8NwRbSCkOMeIm9xn23_7dTWM14M6YQx2VPEVX8yqcqtgezRppc'; 

interface PushSubscriptionProps {
    userId: number;
}

export default function PushSubscription({ userId }: PushSubscriptionProps) {
    useEffect(() => {
        console.log('PushSubscription: Starting setup for user', userId);
        const setupPush = async () => {
            try {
                console.log('PushSubscription: Registering Service Worker');
                const registration = await registerServiceWorker();
                console.log('PushSubscription: Subscribing to push');
                const subscription = await subscribeToPush(registration, VAPID_PUBLIC_KEY);
                console.log('PushSubscription: Sending subscription to server');
                const result = await sendSubscriptionToServer(subscription, userId);
                console.log('PushSubscription: Server response:', result);
            } catch (error) {
                console.error('PushSubscription: Error:', error instanceof Error ? error.message : error);
            }
        };

        console.log('PushSubscription: Checking permission:', Notification.permission);
        if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                console.log('PushSubscription: Permission granted:', permission);
                if (permission === 'granted') {
                    setupPush();
                }
            });
        } else if (Notification.permission === 'granted') {
            setupPush();
        } else {
            console.log('PushSubscription: Notifications denied');
        }
    }, [userId]);

    return null;
}