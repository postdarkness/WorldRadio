export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://rms.api.bbc.co.uk/v2/experience/inline/schedules/bbc_6music'
    );

    if (!response.ok) {
      throw new Error(`BBC API returned ${response.status}`);
    }

    const data = await response.json();
    const now = new Date();

    // Get schedule items
    const scheduleItems = data.data?.[0]?.data || [];

    // Find current and upcoming shows
    let currentShow = null;
    const upcomingShows = [];

    for (const item of scheduleItems) {
      const start = new Date(item.start);
      const end = new Date(item.end);

      const show = {
        title: item.titles?.primary || 'Unknown Show',
        subtitle: item.titles?.secondary || '',
        description: item.synopses?.short || item.synopses?.medium || '',
        image: item.image_url?.replace('{recipe}', '320x320') || null,
        startTime: item.start,
        endTime: item.end,
        duration: item.duration
      };

      if (now >= start && now < end) {
        currentShow = show;
      } else if (now < start && upcomingShows.length < 3) {
        upcomingShows.push(show);
      }
    }

    const result = {
      currentShow,
      upcomingShows
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json(result);
  } catch (error) {
    console.error('Schedule API error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule data' });
  }
}

