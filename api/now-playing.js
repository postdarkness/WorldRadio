export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://rms.api.bbc.co.uk/v2/services/bbc_6music/segments/latest'
    );

    if (!response.ok) {
      throw new Error(`BBC API returned ${response.status}`);
    }

    const data = await response.json();

    // Find the currently playing track
    const nowPlaying = data.data?.find(item => item.offset?.now_playing);
    const recentTracks = data.data?.filter(item => !item.offset?.now_playing) || [];

    // Format response
    const result = {
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch now playing data' });
  }
}
