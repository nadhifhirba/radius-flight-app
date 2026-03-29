module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, origin, maxPrice } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) return res.status(500).json({ error: 'Email service not configured' });

    try {
        // Add contact to Resend audience
        await fetch('https://api.resend.com/contacts', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                unsubscribed: false,
                audience_id: process.env.RESEND_AUDIENCE_ID || undefined
            })
        });

        // Send confirmation email
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: 'Radius <noreply@radius-flight.vercel.app>',
                to: [email],
                subject: 'Price alert aktif! ✈️',
                html: `<p>Halo!</p><p>Price alert kamu untuk penerbangan dari <strong>${origin || 'CGK'}</strong> dengan budget <strong>Rp${Number(maxPrice || 0).toLocaleString('id-ID')}</strong> sudah aktif.</p><p>Kami akan kabarin kamu kalau ada deal bagus!</p><p>— Tim Radius</p>`
            })
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Subscribe error:', err);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};
