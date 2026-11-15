import type { Ref } from 'react';

interface CameraVideoProps {
  ref: Ref<HTMLVideoElement>;
  className?: string;
}

/** Camera <video> element with the attributes iOS WKWebView requires for inline playback. */
export function CameraVideo({ ref, className }: CameraVideoProps) {
  return <video ref={ref} className={className} playsInline muted autoPlay aria-hidden="true" />;
}
