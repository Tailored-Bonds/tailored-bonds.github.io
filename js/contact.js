
/**
 * Static-only contact handler for GitHub Pages.
 * Supports 3 transports: 'emailjs' | 'formspree' | 'mailto'
 * - EmailJS: https://www.emailjs.com  (requires PUBLIC KEY + service_id + template_id)
 * - Formspree: https://formspree.io/  (requires form ID)
 * - mailto: no account; opens user's mail client
 *
 * Usage: include this script at the bottom of each contact page that has:
 *   <form id="contact-form"> ... <input type="hidden" name="category" value="..."> ... </form>
 */

const CONFIG = {
  TRANSPORT: 'mailto', // 'emailjs' | 'formspree' | 'mailto'  <-- change here

  // EmailJS config (only used if TRANSPORT === 'emailjs')
  EMAILJS_PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',     // e.g. 'rA3x...'
  EMAILJS_SERVICE_ID: 'YOUR_SERVICE_ID',             // e.g. 'service_tb'
  EMAILJS_TEMPLATE_ID: 'YOUR_TEMPLATE_ID',           // e.g. 'template_contact'

  // Formspree config (only used if TRANSPORT === 'formspree')
  FORMSPREE_ENDPOINT: 'https://formspree.io/f/YOUR_ID', // replace with your form ID

  // mailto config (used if TRANSPORT === 'mailto')
  MAILTO_TO: 'contact@tailoredbonds.com', // where you want to receive emails
};

// ---------- helpers ----------
function $(sel, root=document){ return root.querySelector(sel); }
function flash(msg, ok=true){
  const el = document.createElement('div');
  el.className = `contact-flash ${ok?'ok':'err'}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 5000);
}
function setBusy(btn, busy){
  btn.disabled = busy;
  btn.dataset.loading = busy ? '1' : '0';
  if(busy){ btn.__oldText = btn.textContent; btn.textContent = 'Sending…'; }
  else if(btn.__oldText){ btn.textContent = btn.__oldText; }
}
function getFormData(form){
  const fd = new FormData(form);
  // context (useful if you later switch to Formspree/EmailJS)
  fd.set('page', location.pathname);
  fd.set('ts', new Date().toISOString());
  return Object.fromEntries(fd.entries());
}
function validEmail(s){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s || ''); }

// ---------- transports ----------
async function sendViaEmailJS(data){
  if(!window.emailjs){
    throw new Error('EmailJS SDK not loaded');
  }
  if(!CONFIG.EMAILJS_PUBLIC_KEY || !CONFIG.EMAILJS_SERVICE_ID || !CONFIG.EMAILJS_TEMPLATE_ID){
    throw new Error('EmailJS not configured');
  }
  window.emailjs.init({ publicKey: CONFIG.EMAILJS_PUBLIC_KEY });

  // Map your template vars; adjust names to match your EmailJS template
  const templateParams = {
    from_name: data.name,
    reply_to: data.email,
    subject: data.subject,
    message: data.message,
    category: data.category || 'general',
    page: data.page,
    ts: data.ts,
  };

  const res = await window.emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, templateParams);
  if(res.status !== 200) throw new Error('EmailJS failed');
  return { ok: true, message: 'Thanks — we received your message.' };
}

async function sendViaFormspree(data){
  if(!CONFIG.FORMSPREE_ENDPOINT) throw new Error('Formspree endpoint not set');
  const body = new URLSearchParams(data).toString();
  const res = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if(!res.ok) {
    const t = await res.text();
    throw new Error(`Formspree error: ${t.slice(0,200)}`);
  }
  return { ok: true, message: 'Thanks — we received your message.' };
}

function sendViaMailto(data){
  // Construct a mailto: link (safest on static sites with no external service)
  const subj = `[Tailored Bonds | ${data.category||'general'}] ${data.subject||'Website contact'}`;
  const bodyLines = [
    `Name: ${data.name||''}`,
    `Email: ${data.email||''}`,
    `Category: ${data.category||'general'}`,
    `Page: ${data.page||''}`,
    `Time: ${data.ts||''}`,
    `---`,
    `${data.message||''}`,
  ];
  const href = `mailto:${encodeURIComponent(CONFIG.MAILTO_TO)}`
    + `?subject=${encodeURIComponent(subj)}`
    + `&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  // Open the user's email client
  window.location.href = href;
  return { ok: true, message: 'Opening your email app… Please press send.' };
}

// ---------- main ----------
async function handleSubmit(e){
  e.preventDefault();
  const form = e.currentTarget;
  const btn  = $('button[type="submit"]', form);

  // honeypot (optional)
  const hp = $('input[name="website"]', form);
  if(hp && hp.value.trim()){
    flash('Submission blocked (spam detected).', false);
    return;
  }

  const data = getFormData(form);
  if(!data.name || !validEmail(data.email) || !data.message){
    flash('Please fill name, a valid email, and your message.', false);
    return;
  }

  try{
    setBusy(btn, true);
    let rsp;
    if(CONFIG.TRANSPORT === 'emailjs') {
      rsp = await sendViaEmailJS(data);
    } else if(CONFIG.TRANSPORT === 'formspree') {
      rsp = await sendViaFormspree(data);
    } else {
      rsp = sendViaMailto(data);
    }
    flash(rsp.message || 'Sent.');
    if(CONFIG.TRANSPORT !== 'mailto') form.reset();
  }catch(err){
    console.error(err);
    flash(err.message || 'Failed to send. Please try again.', false);
  }finally{
    setBusy(btn, false);
  }
}

const form = document.getElementById('contact-form');
if(form) form.addEventListener('submit', handleSubmit);
