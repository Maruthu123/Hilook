/* Feature switches (set in frontend/.env.* or Netlify env variables) */

// Cash on Delivery is switched OFF. To bring it back later:
//   frontend  → REACT_APP_ENABLE_COD=true
//   backend   → ALLOW_COD=true
export const COD_ENABLED = process.env.REACT_APP_ENABLE_COD === 'true';
