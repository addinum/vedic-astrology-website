// Central frontend configuration
// In production (served by the same Express server) leave API_BASE as ''.
// If you host frontend separately (e.g. Netlify) set API_BASE to your Render backend URL.
const CONFIG = {
  API_BASE: '', // e.g. 'https://your-backend.onrender.com'
  WHATSAPP_NUMBER: '919999999999', // country code + number, no + or spaces
  PHONE_NUMBER: '+919999999999',
  BUSINESS_NAME: 'Pandit Ji Vedic Astrology',
  BUSINESS_EMAIL: 'contact@panditjiastrology.com',
  ADDRESS: 'Varanasi, Uttar Pradesh, India'
};

function waLink(message) {
  const text = encodeURIComponent(message || 'Namaste Pandit Ji, I would like to know more about your services.');
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${text}`;
}
