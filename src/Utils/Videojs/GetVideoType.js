export const getVideoType = source => {
  if (source.includes('m3u8')) {
    return 'application/x-mpegURL';
  } else {
    return 'video/mp4';
  }
};
