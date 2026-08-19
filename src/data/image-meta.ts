/** Generated from public/images via ffprobe. Used to shape gallery tiles around each photo. */
export const imageMeta: Record<string, { w: number; h: number }> = {
  "/images/bridge-trail.jpg": { w: 1920, h: 1038 },
  "/images/campfire.jpg": { w: 1920, h: 2560 },
  "/images/cliff-view.jpg": { w: 1920, h: 1440 },
  "/images/detail-01.jpg": { w: 1084, h: 724 },
  "/images/detail-02.jpg": { w: 1084, h: 724 },
  "/images/detail-03.jpg": { w: 1084, h: 724 },
  "/images/detail-04.jpg": { w: 724, h: 1084 },
  "/images/forest-light.jpg": { w: 1920, h: 2560 },
  "/images/group-trail.jpg": { w: 4032, h: 3024 },
  "/images/hero-poster-dji.jpg": { w: 1280, h: 720 },
  "/images/highland-road.jpg": { w: 1920, h: 1440 },
  "/images/homestay.jpg": { w: 1920, h: 2562 },
  "/images/kyllang-rock.png": { w: 1536, h: 1024 },
  "/images/landscape-panorama.jpg": { w: 1920, h: 790 },
  "/images/living-bridge.jpg": { w: 1920, h: 1280 },
  "/images/market-day.jpg": { w: 2400, h: 1600 },
  "/images/meadow-walk.jpg": { w: 1920, h: 2880 },
  "/images/portrait-warm.jpg": { w: 1600, h: 1200 },
  "/images/raksan-01.jpg": { w: 4000, h: 1840 },
  "/images/raksan-02.jpg": { w: 1600, h: 900 },
  "/images/raksan-03.jpg": { w: 1600, h: 1200 },
  "/images/raksan-04.jpg": { w: 1600, h: 1200 },
  "/images/raksan-05.jpg": { w: 4000, h: 1840 },
  "/images/raksan-06.jpg": { w: 4000, h: 1840 },
  "/images/raksan-07.jpg": { w: 4080, h: 3072 },
  "/images/ridge-light.jpg": { w: 1920, h: 2880 },
  "/images/river-stones.jpg": { w: 1920, h: 1440 },
  "/images/tishu-01.jpg": { w: 1920, h: 2560 },
  "/images/tishu-02.jpg": { w: 1920, h: 2058 },
  "/images/tishu-03.jpg": { w: 1600, h: 2844 },
  "/images/trail-mist.jpg": { w: 1600, h: 2846 },
  "/images/valley-green.jpg": { w: 1920, h: 2880 },
  "/images/village-path.jpg": { w: 1600, h: 2134 },
  "/images/waterfall-pool.jpg": { w: 1920, h: 2880 },
};

export function imageRatio(src: string) {
  const meta = imageMeta[src];
  return meta ? meta.w / meta.h : null;
}

/** Tall phone photos look wrong in wide crops, so they get portrait tiles. */
export function isPortrait(src: string) {
  const ratio = imageRatio(src);
  return ratio !== null && ratio < 0.95;
}

export function isWide(src: string) {
  const ratio = imageRatio(src);
  return ratio === null || ratio >= 1.2;
}
