export default async function handler(req, res) {
  const station = req.query.station || 'bbc_6music';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    let result;

    switch (station) {
      case 'bbc_6music':
        result = await fetchBBCSchedule();
        break;
      case 'nts_1':
        result = await fetchNTSSchedule(0);
        break;
      case 'nts_2':
        result = await fetchNTSSchedule(1);
        break;
      default:
        result = { currentShow: null, upcomingShows: [] };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(`Schedule API error for ${station}:`, error);
    res.status(500).json({ error: 'Failed to fetch schedule data' });
  }
}

// BBC Radio 6 Music Schedule
async function fetchBBCSchedule() {
  const response = await fetch(
    'https://rms.api.bbc.co.uk/v2/experience/inline/schedules/bbc_6music'
  );

  if (!response.ok) {
    throw new Error(`BBC API returned ${response.status}`);
  }

  const data = await response.json();
  const now = new Date();

  const scheduleItems = data.data?.[0]?.data || [];

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

  return { currentShow, upcomingShows };
}

// NTS Radio Schedule (channel: 0 = NTS 1, 1 = NTS 2)
async function fetchNTSSchedule(channel = 0) {
  const response = await fetch('https://www.nts.live/api/v2/live');

  if (!response.ok) {
    throw new Error(`NTS API returned ${response.status}`);
  }

  const data = await response.json();
  const channelData = data.results?.[channel];

  if (!channelData) {
    return { currentShow: null, upcomingShows: [] };
  }

  const now = channelData.now;
  const next = channelData.next;

  const currentShow = now ? {
    title: now.broadcast_title || 'NTS Radio',
    subtitle: now.embeds?.details?.location_long || '',
    description: now.embeds?.details?.description || '',
    image: now.embeds?.details?.media?.picture_medium ||
           now.embeds?.details?.media?.picture_large ||
           'https://www.nts.live/assets/img/nts.png',
    startTime: now.start_timestamp,
    endTime: now.end_timestamp,
    duration: null
  } : null;

  const upcomingShows = next ? [{
    title: next.broadcast_title || 'Coming Up',
    subtitle: next.embeds?.details?.location_long || '',
    description: next.embeds?.details?.description || '',
    image: next.embeds?.details?.media?.picture_medium ||
           next.embeds?.details?.media?.picture_large ||
           'https://www.nts.live/assets/img/nts.png',
    startTime: next.start_timestamp,
    endTime: next.end_timestamp,
    duration: null
  }] : [];

  return { currentShow, upcomingShows };
}
