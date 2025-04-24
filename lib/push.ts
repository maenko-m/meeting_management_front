export function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
        return registration;
    }
    throw new Error('Push notifications not supported');
}

export async function subscribeToPush(
    registration: ServiceWorkerRegistration,
    vapidPublicKey: string
): Promise<PushSubscription> {
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    return subscription;
}

export async function sendSubscriptionToServer(
    subscription: PushSubscription,
    userId: number
): Promise<{ status: string } | { error: string }> {
    const response = await fetch('http://127.0.0.1:8000/api/push-subscribe', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "jwt": `${localStorage.getItem("jwt")}`,
          },
        body: JSON.stringify({ ...subscription.toJSON(), userId }),
    });
    localStorage.setItem('pushEnabled', JSON.stringify(true));
    return response.json();
}

export async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    await fetch('http://127.0.0.1:8000/api/push-unsubscribe', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "jwt": `${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }