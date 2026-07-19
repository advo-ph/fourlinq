export interface ProjectReel {
  id: string;
  videoSrc: string;
  posterSrc: string;
}

export const PROJECT_REEL: ProjectReel[] = [
  {
    id: "reel-1",
    videoSrc: "/videos/reels/reel-1.mp4",
    posterSrc: "/images/reels/reel-1-poster.jpg",
  },
  {
    id: "reel-2",
    videoSrc: "/videos/reels/reel-2.mp4",
    posterSrc: "/images/reels/reel-2-poster.jpg",
  },
  {
    id: "reel-3",
    videoSrc: "/videos/reels/reel-3.mp4",
    posterSrc: "/images/reels/reel-3-poster.jpg",
  },
];
