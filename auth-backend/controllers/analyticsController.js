const db = require('../db');

const getLocationFromIP = async (ip) => {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return 'Local Environment';
  try {
    const res = await fetch(`https://freeipapi.com/api/json/${ip}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.countryName) {
        return `${data.cityName ? data.cityName + ', ' : ''}${data.countryName}`;
      }
    }
    return 'Unknown Location';
  } catch (e) {
    return 'Unknown Location';
  }
};

exports.trackView = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    const user = await db.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
    if (ipAddress.includes(',')) ipAddress = ipAddress.split(',')[0].trim();
    
    if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
       try {
           const ipRes = await fetch('https://api.ipify.org?format=json');
           const ipData = await ipRes.json();
           ipAddress = ipData.ip;
       } catch(e) {}
    }

    const location = await getLocationFromIP(ipAddress);
    const device = req.headers['user-agent'] || 'Unknown';

    await db.analytics.create({
      data: {
        userId: user.id,
        eventType: 'view',
        ipAddress,
        location,
        device
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track View Error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
};

exports.trackClick = async (req, res) => {
  try {
    const { username, url, title } = req.body;
    if (!username || !url) return res.status(400).json({ error: 'Username and URL required' });
    
    const user = await db.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
    if (ipAddress.includes(',')) ipAddress = ipAddress.split(',')[0].trim();
    
    if (ipAddress === '::1' || ipAddress === '127.0.0.1') {
       try {
           const ipRes = await fetch('https://api.ipify.org?format=json');
           const ipData = await ipRes.json();
           ipAddress = ipData.ip;
       } catch(e) {}
    }

    const location = await getLocationFromIP(ipAddress);
    const device = req.headers['user-agent'] || 'Unknown';

    await db.analytics.create({
      data: {
        userId: user.id,
        eventType: 'click',
        url,
        title: title || 'Unknown Link',
        ipAddress,
        location,
        device
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track Click Error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
};

exports.getProfileStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const views = await db.analytics.findMany({ where: { userId, eventType: 'view' } });
    const clicks = await db.analytics.findMany({ where: { userId, eventType: 'click' } });

    // Aggregate Data for Charts (Last 7 days)
    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayViews = views.filter(v => v.timestamp.startsWith(dateStr)).length;
      const dayClicks = clicks.filter(c => c.timestamp.startsWith(dateStr)).length;
      
      chartData.push({ date: shortDate, views: dayViews, clicks: dayClicks });
    }

    // Top Links
    const linkCounts = {};
    clicks.forEach(c => {
      const key = c.url;
      if (!linkCounts[key]) linkCounts[key] = { url: c.url, title: c.title, clicks: 0 };
      linkCounts[key].clicks++;
    });
    
    let topLinks = Object.values(linkCounts).sort((a, b) => b.clicks - a.clicks).slice(0, 5);
    const totalClicks = clicks.length;
    topLinks = topLinks.map(l => ({ ...l, percentage: totalClicks ? Math.round((l.clicks / totalClicks) * 100) : 0 }));

    // Top Locations
    const locCounts = {};
    views.forEach(v => {
      const loc = v.location;
      if (!locCounts[loc]) locCounts[loc] = { location: loc, views: 0 };
      locCounts[loc].views++;
    });
    
    let topLocations = Object.values(locCounts).sort((a, b) => b.views - a.views).slice(0, 5);
    const totalViews = views.length;
    topLocations = topLocations.map(l => ({ 
      country: l.location, 
      code: l.location.split(', ').pop()?.substring(0, 2).toUpperCase() || 'UN', 
      views: l.views, 
      percentage: totalViews ? Math.round((l.views / totalViews) * 100) : 0 
    }));

    const ctr = totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

    res.status(200).json({
      totalViews,
      totalClicks,
      ctr,
      chartData,
      topLinks,
      topLocations
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
