/* Payment switches – read from backend/.env (or Render environment variables) */

// Cash on Delivery is OFF by default. To bring it back: ALLOW_COD=true
const codEnabled = () => String(process.env.ALLOW_COD || 'false').toLowerCase() === 'true';

const razorpayConfigured = () => {
  const { RAZORPAY_KEY_ID: k, RAZORPAY_KEY_SECRET: s } = process.env;
  return !!(k && s && !k.startsWith('your_'));
};

// rzp_test_xxx → 'test'   |   rzp_live_xxx → 'live'
const razorpayMode = () => (!razorpayConfigured() ? null : process.env.RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'live' : 'test');

module.exports = { codEnabled, razorpayConfigured, razorpayMode };
