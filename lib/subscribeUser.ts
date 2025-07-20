
export async function subscribeUser(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push通知はこのブラウザでサポートされていません。');
    return;
  }

  try {
    // Service Worker 登録準備
    const registration = await navigator.serviceWorker.ready;

    // すでに購読済みか確認
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('すでにPush購読されています');
      return;
    }

    // 公開鍵（base64 → Uint8Array に変換）
    const response = await fetch('/api/public-key');
    const { publicKey } = await response.json();
    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // Push購読を作成
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // サーバーに購読を保存
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, userId }),
    });

    console.log('Push通知の購読が完了しました');
  } catch (error) {
    console.error('Push購読失敗:', error);
  }
}

// 🔧 Base64 → Uint8Array 変換ユーティリティ
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
