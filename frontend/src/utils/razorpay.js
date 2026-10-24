import API from '../api';

function loadScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Is online payment switched on in the backend (.env has Razorpay keys)? */
export async function onlinePaymentEnabled() {
  try { const { data } = await API.get('/api/payment/config'); return !!data.onlineEnabled; } catch { return false; }
}

/** { onlineEnabled, mode: 'test'|'live'|null, codEnabled } – used by checkout screens. */
export async function getPaymentConfig() {
  try { const { data } = await API.get('/api/payment/config'); return { onlineEnabled: !!data.onlineEnabled, mode: data.mode || null, codEnabled: !!data.codEnabled }; }
  catch { return { onlineEnabled: false, mode: null, codEnabled: false, unreachable: true }; }
}

/**
 * Pay for an ALREADY-CREATED order (the amount is read from the database by the server).
 * Resolves { ok:true } | { ok:false, dismissed?:true, msg }
 */
export async function payOnline(orderId, prefill = {}) {
  if (!(await loadScript())) return { ok: false, msg: 'Could not load Razorpay. Check your internet.' };
  let created;
  try { created = (await API.post('/api/payment/create-order', { orderId })).data; }
  catch (e) { return { ok: false, msg: e.response?.data?.message || 'Could not start payment' }; }

  return new Promise((resolve) => {
    const rzp = new window.Razorpay({
      key: created.key,
      amount: created.order.amount,
      currency: 'INR',
      name: 'Nisha Boutique',
      description: `Order ${created.orderNumber}`,
      order_id: created.order.id,
      prefill,
      theme: { color: '#7c3aed' },
      handler: async (resp) => {
        try {
          await API.post('/api/payment/verify', { ...resp, orderId });
          resolve({ ok: true });
        } catch (e) { resolve({ ok: false, msg: e.response?.data?.message || 'Payment verification failed' }); }
      },
      modal: { ondismiss: () => resolve({ ok: false, dismissed: true, msg: 'Payment cancelled' }) },
    });
    rzp.on('payment.failed', (r) => resolve({ ok: false, msg: r.error?.description || 'Payment failed' }));
    rzp.open();
  });
}
