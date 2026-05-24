export interface ProjectReel {
  id: string;
  location: string;
  videoSrc: string;
  posterSrc?: string;
}

export const PROJECT_REELS: ProjectReel[] = [
  {
    id: "reel-1",
    location: "Las Pinas",
    videoSrc: "/videos/reels/reel-1.mp4",
  },
  {
    id: "reel-2",
    location: "Private residence",
    videoSrc: "/videos/reels/reel-2.mp4",
  },
  {
    id: "reel-3",
    location: "Private residence",
    videoSrc: "/videos/reels/reel-3.mp4",
  },
];
