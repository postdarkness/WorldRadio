export default async function handler(req, res) {
  const station = req.query.station || 'bbc_6music';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    let result;

    switch (station) {
      case 'bbc_6music':
        result = await fetchBBC6Music();
        break;
      case 'fip':
        result = await fetchFIP();
        break;
      case 'kexp':
        result = await fetchKEXP();
        break;
      case 'radio_paradise':
        result = await fetchRadioParadise();
        break;
      case 'nts_1':
        result = await fetchNTS(0);
        break;
      case 'nts_2':
        result = await fetchNTS(1);
        break;
      case 'rne_radio3':
        result = { nowPlaying: null, recentTracks: [] };
        break;
      default:
        result = { nowPlaying: null, recentTracks: [] };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(`Error fetching ${station}:`, error);
    res.status(500).json({ error: 'Failed to fetch now playing data' });
  }
}

// BBC Radio 6 Music
async function fetchBBC6Music() {
  const response = await fetch(
    'https://rms.api.bbc.co.uk/v2/services/bbc_6music/segments/latest'
  );

  if (!response.ok) throw new Error(`BBC API returned ${response.status}`);

  const data = await response.json();
  const nowPlaying = data.data?.find(item => item.offset?.now_playing);
  const recentTracks = data.data?.filter(item => !item.offset?.now_playing) || [];

  return {
    nowPlaying: nowPlaying ? {
      artist: nowPlaying.titles?.primary || 'Unknown Artist',
      title: nowPlaying.titles?.secondary || 'Unknown Track',
      image: nowPlaying.image_url?.replace('{recipe}', '400x400') || null
    } : null,
    recentTracks: recentTracks.slice(0, 3).map(track => ({
      artist: track.titles?.primary || 'Unknown Artist',
      title: track.titles?.secondary || 'Unknown Track',
      image: track.image_url?.replace('{recipe}', '96x96') || null,
      label: track.offset?.label || ''
    }))
  };
}

// FIP (Radio France)
async function fetchFIP() {
  const response = await fetch('https://api.radiofrance.fr/livemeta/pull/7');

  if (!response.ok) throw new Error(`FIP API returned ${response.status}`);

  const data = await response.json();

  // Current song
  const now = data.now || data.levels?.[0]?.items?.[0];
  const prev = data.prev || data.levels?.[0]?.items?.slice(1) || [];

  return {
    nowPlaying: now ? {
      artist: now.performers || now.secondLine || 'Unknown Artist',
      title: now.title || now.firstLine || 'Unknown Track',
      image: now.visual ? `https://www.radiofrance.fr${now.visual}` : null
    } : null,
    recentTracks: (Array.isArray(prev) ? prev : []).slice(0, 3).map(track => ({
      artist: track.performers || track.secondLine || 'Unknown Artist',
      title: track.title || track.firstLine || 'Unknown Track',
      image: track.visual ? `https://www.radiofrance.fr${track.visual}` : null,
      label: ''
    }))
  };
}

// KEXP Seattle
async function fetchKEXP() {
  const response = await fetch(
    'https://api.kexp.org/v2/plays/?format=json&limit=5&ordering=-airdate'
  );

  if (!response.ok) throw new Error(`KEXP API returned ${response.status}`);

  const data = await response.json();
  const plays = data.results?.filter(p => p.play_type === 'trackplay') || [];

  const nowPlaying = plays[0];
  const recentTracks = plays.slice(1, 4);

  return {
    nowPlaying: nowPlaying ? {
      artist: nowPlaying.artist || 'Unknown Artist',
      title: nowPlaying.song || 'Unknown Track',
      image: nowPlaying.thumbnail_uri || nowPlaying.image_uri || null
    } : null,
    recentTracks: recentTracks.map(track => ({
      artist: track.artist || 'Unknown Artist',
      title: track.song || 'Unknown Track',
      image: track.thumbnail_uri || track.image_uri || null,
      label: track.labels?.[0] || ''
    }))
  };
}

// Radio Paradise
async function fetchRadioParadise() {
  const response = await fetch(
    'https://api.radioparadise.com/api/now_playing?chan=0'
  );

  if (!response.ok) throw new Error(`Radio Paradise API returned ${response.status}`);

  const data = await response.json();

  // Build cover URL - Radio Paradise uses different formats
  let coverUrl = null;
  if (data.cover) {
    // Cover can be a full path or relative
    if (data.cover.startsWith('http')) {
      coverUrl = data.cover;
    } else {
      coverUrl = `https://img.radioparadise.com${data.cover.startsWith('/') ? '' : '/'}${data.cover}`;
    }
  } else if (data.album && data.asin) {
    // Fallback to album art via ASIN
    coverUrl = `https://img.radioparadise.com/covers/l/${data.asin}.jpg`;
  }

  return {
    nowPlaying: data ? {
      artist: data.artist || 'Unknown Artist',
      title: data.title || 'Unknown Track',
      image: coverUrl
    } : null,
    recentTracks: []
  };
}

// NTS Radio (channel: 0 = NTS 1, 1 = NTS 2)
async function fetchNTS(channel = 0) {
  const response = await fetch('https://www.nts.live/api/v2/live');

  if (!response.ok) throw new Error(`NTS API returned ${response.status}`);

  const data = await response.json();
  const channelData = data.results?.[channel];

  if (!channelData) {
    return { nowPlaying: null, recentTracks: [] };
  }

  const now = channelData.now;

  return {
    nowPlaying: now ? {
      artist: now.broadcast_title || 'NTS Radio',
      title: now.embeds?.details?.name || now.broadcast_title || 'Live',
      image: now.embeds?.details?.media?.picture_medium ||
             now.embeds?.details?.media?.picture_large ||
             'https://www.nts.live/assets/img/nts.png'
    } : null,
    recentTracks: [] // NTS API shows current broadcast, not track history
  };
}
