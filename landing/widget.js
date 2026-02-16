/**
 * XRPL Wallet Score Widget
 * Embed on any site: <div data-xrpl-score="rAddress"></div>
 * Include: <script src="https://xrplanalytics.com/widget.js"></script>
 * 
 * Options via data attributes:
 *   data-xrpl-score="rAddress"  - Wallet address to score
 *   data-api-key="your_key"     - Your API key (get free at xrplanalytics.com)
 *   data-theme="dark|light"     - Color theme (default: dark)
 *   data-size="sm|md|lg"        - Widget size (default: md)
 */
(function() {
    const API = 'https://api.xrplanalytics.com/api/v1'
    const widgets = document.querySelectorAll('[data-xrpl-score]')
    
    widgets.forEach(async (el) => {
        const addr = el.dataset.xrplScore
        const apiKey = el.dataset.apiKey || 'widget-demo'
        const theme = el.dataset.theme || 'dark'
        const size = el.dataset.size || 'md'
        
        if (!addr) return
        
        const sizes = { sm: '120px', md: '160px', lg: '200px' }
        const fonts = { sm: '24px', md: '36px', lg: '48px' }
        const bg = theme === 'light' ? '#f9fafb' : '#111827'
        const text = theme === 'light' ? '#111827' : '#f9fafb'
        const muted = theme === 'light' ? '#6b7280' : '#9ca3af'
        const border = theme === 'light' ? '#e5e7eb' : '#1f2937'
        
        el.innerHTML = `<div style="width:${sizes[size]};padding:12px;border-radius:12px;background:${bg};border:1px solid ${border};font-family:Inter,system-ui,sans-serif;text-align:center">
            <div style="font-size:10px;color:${muted};margin-bottom:4px">XRPL Trust Score</div>
            <div style="font-size:${fonts[size]};font-weight:800;color:${muted}">...</div>
            <div style="font-size:9px;color:${muted};margin-top:4px">${addr.slice(0,8)}...</div>
            <div style="font-size:8px;margin-top:6px"><a href="https://xrplanalytics.com" style="color:${muted};text-decoration:none">⚡ xrplanalytics.com</a></div>
        </div>`
        
        try {
            const resp = await fetch(`${API}/wallet/${addr}/score`, { headers: { 'X-API-Key': apiKey } })
            const data = await resp.json()
            if (data.success && data.data) {
                const score = data.data.score
                let color = '#ef4444' // red
                if (score >= 80) color = '#22c55e' // green
                else if (score >= 60) color = '#3b82f6' // blue
                else if (score >= 40) color = '#f59e0b' // amber
                
                const scoreEl = el.querySelector('div > div:nth-child(2)')
                scoreEl.style.color = color
                scoreEl.textContent = score
                scoreEl.style.fontSize = fonts[size]
            }
        } catch (e) {
            console.error('XRPL Widget error:', e)
        }
    })
})()
