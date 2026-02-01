// Station configuration
export const stations = [
  {
    id: 'bbc_6music',
    name: 'BBC Radio 6 Music',
    country: 'UK',
    color: '#e94560',
    artwork: 'https://sounds.files.bbci.co.uk/3.9.4/networks/bbc_6music/blocks-colour_600x600.png',
    streams: {
      high: 'https://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio=320000.m3u8',
      low: 'https://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio=96000.m3u8'
    },
    hasNowPlaying: true,
    hasSchedule: true
  },
  {
    id: 'fip',
    name: 'FIP',
    country: 'France',
    color: '#e84e10',
    artwork: 'https://www.radiofrance.fr/s3/cruiser-production/2022/05/0bab0094-9798-4e0e-9cd1-b8e9a0347825/200x200_fip-cover.jpg',
    streams: {
      high: 'https://icecast.radiofrance.fr/fip-hifi.aac',
      low: 'https://direct.fipradio.fr/live/fip-midfi.mp3'
    },
    hasNowPlaying: true,
    hasSchedule: false
  },
  {
    id: 'kexp',
    name: 'KEXP 90.3',
    country: 'Seattle',
    color: '#000000',
    artwork: 'https://www.kexp.org/static/assets/img/og-kexp.jpg',
    streams: {
      high: 'https://kexp.streamguys1.com/kexp160.aac',
      low: 'https://kexp.streamguys1.com/kexp64.aac'
    },
    hasNowPlaying: true,
    hasSchedule: false
  },
  {
    id: 'radio_paradise',
    name: 'Radio Paradise',
    country: 'California',
    color: '#006400',
    artwork: 'https://img.radioparadise.com/covers/l/B000002MXK.jpg',
    streams: {
      high: 'https://stream.radioparadise.com/aac-320',
      low: 'https://stream.radioparadise.com/aac-128'
    },
    hasNowPlaying: true,
    hasSchedule: false
  },
  {
    id: 'nts_1',
    name: 'NTS Radio 1',
    country: 'London',
    color: '#000000',
    artwork: 'https://www.nts.live/assets/img/nts.png',
    streams: {
      high: 'https://stream-relay-geo.ntslive.net/stream',
      low: 'https://stream-relay-geo.ntslive.net/stream'
    },
    hasNowPlaying: true,
    hasSchedule: false
  },
  {
    id: 'nts_2',
    name: 'NTS Radio 2',
    country: 'London',
    color: '#000000',
    artwork: 'https://www.nts.live/assets/img/nts.png',
    streams: {
      high: 'https://stream-relay-geo.ntslive.net/stream2',
      low: 'https://stream-relay-geo.ntslive.net/stream2'
    },
    hasNowPlaying: true,
    hasSchedule: false
  },
  {
    id: 'rne_radio3',
    name: 'RNE Radio 3',
    country: 'Spain',
    color: '#d32f2f',
    artwork: 'https://img2.rtve.es/css/rtve.commons.css/rtve_radio/radio3.png',
    streams: {
      high: 'https://ztnr.rtve.es/ztnr/rne3.m3u8',
      low: 'https://195.55.74.217/rtve/radio3.mp3'
    },
    hasNowPlaying: false,
    hasSchedule: false
  }
];

export function getStation(id) {
  return stations.find(s => s.id === id);
}
