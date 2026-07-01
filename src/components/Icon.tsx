"use client";

import * as React from "react";

export type IconName =
  | "home" | "users" | "calendar" | "funnel" | "settings" | "card" | "link"
  | "copy" | "share" | "whatsapp" | "check" | "checkCircle" | "chevRight"
  | "chevLeft" | "chevDown" | "plus" | "search" | "sparkles" | "google"
  | "instagram" | "arrowRight" | "arrowLeft" | "bell" | "x" | "edit"
  | "grip" | "eye" | "trash" | "lock" | "shield" | "clock" | "dots"
  | "video" | "mappin" | "send" | "bolt" | "grid" | "logout" | "alert"
  | "money" | "sun" | "moon" | "phone" | "user" | "camera" | "refresh"
  | "chat" | "map" | "heart" | "bookmark" | "bolt2" | "tag" | "target"
  | "wand" | "pencilPlus" | "file" | "paperclip"
  | "tiktok" | "youtube" | "linkedin" | "facebook" | "twitter" | "globe";

export function Icon({
  name,
  size = 20,
  sw = 1.75,
  style,
  className,
}: {
  name: IconName;
  size?: number;
  sw?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const p = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, React.ReactNode> = {
    home: (<><path d="M3 10.5 12 3l9 7.5" {...p} /><path d="M5 9.5V20h14V9.5" {...p} /><path d="M9.5 20v-5.5h5V20" {...p} /></>),
    users: (<><circle cx="9" cy="8" r="3.2" {...p} /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...p} /><path d="M16 6.2A3 3 0 0 1 16 12M16.5 14.2c2.4.3 4 2.2 4 4.8" {...p} /></>),
    calendar: (<><rect x="3.5" y="5" width="17" height="15.5" rx="3" {...p} /><path d="M3.5 9.5h17M8 3v4M16 3v4" {...p} /></>),
    funnel: (<><path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" {...p} /></>),
    settings: (<><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1 5.5 5.5" {...p} /></>),
    card: (<><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" {...p} /><path d="M2.5 9.5h19" {...p} /></>),
    link: (<><path d="M9.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" {...p} /><path d="M14.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" {...p} /></>),
    copy: (<><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" {...p} /><path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" {...p} /></>),
    share: (<><circle cx="6" cy="12" r="2.5" {...p} /><circle cx="17" cy="6" r="2.5" {...p} /><circle cx="17" cy="18" r="2.5" {...p} /><path d="M8.2 10.8 14.8 7.2M8.2 13.2 14.8 16.8" {...p} /></>),
    whatsapp: (<><path d="M4 20l1.3-4A8 8 0 1 1 8 18.6L4 20Z" {...p} /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1.2-.4 1.2-1l-.1-1.1-2-.6-.9.9c-1-.4-1.8-1.2-2.2-2.2l.9-.9-.6-2-1.1-.1c-.6 0-1 .6-1 1.2Z" fill="currentColor" stroke="none" /></>),
    check: (<><path d="M5 12.5 10 17l9-10" {...p} /></>),
    checkCircle: (<><circle cx="12" cy="12" r="9" {...p} /><path d="M8.5 12.2 11 14.7l4.6-5" {...p} /></>),
    chevRight: (<><path d="M9 5l7 7-7 7" {...p} /></>),
    chevLeft: (<><path d="M15 5l-7 7 7 7" {...p} /></>),
    chevDown: (<><path d="M5 9l7 7 7-7" {...p} /></>),
    plus: (<><path d="M12 5v14M5 12h14" {...p} /></>),
    search: (<><circle cx="11" cy="11" r="6.5" {...p} /><path d="M20 20l-3.5-3.5" {...p} /></>),
    sparkles: (<><path d="M12 3.5 13.7 9 19 10.7 13.7 12.4 12 18 10.3 12.4 5 10.7 10.3 9 12 3.5Z" {...p} /><path d="M18.5 4v3M20 5.5h-3M5.5 16v2.5M6.75 17.25h-2.5" {...p} /></>),
    google: (<g><path d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" fill="#4285F4" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" /><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" fill="#FBBC05" /><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.4 3-4.1 5.6-4.1Z" fill="#EA4335" /></g>),
    instagram: (<><rect x="3.5" y="3.5" width="17" height="17" rx="5" {...p} /><circle cx="12" cy="12" r="4" {...p} /><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" /></>),
    tiktok: (<><path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46" {...p} /><path d="M14 4c.4 2.4 2 4 4.5 4.2" {...p} /></>),
    youtube: (<><rect x="2.5" y="6" width="19" height="12" rx="3.5" {...p} /><path d="M10.5 9.3v5.4l4.5-2.7-4.5-2.7Z" fill="currentColor" stroke="none" /></>),
    linkedin: (<><rect x="3.5" y="3.5" width="17" height="17" rx="3" {...p} /><path d="M7 10.5V16M7 7.6v.1M11 16v-3a2 2 0 0 1 4 0v3M11 10.5V16" {...p} /></>),
    facebook: (<><rect x="3.5" y="3.5" width="17" height="17" rx="5" {...p} /><path d="M14.5 8.2h-1.2c-.9 0-1.3.5-1.3 1.4V11h2.3l-.4 2.4H12V20" {...p} /></>),
    twitter: (<><path d="M4 4l7 8.5M13 11.5 20 20M4.5 20l6.2-6.8M12.8 10.4 19.5 4" {...p} /></>),
    globe: (<><circle cx="12" cy="12" r="8.5" {...p} /><path d="M3.5 12h17M12 3.5c2.4 2.3 3.7 5.4 3.7 8.5s-1.3 6.2-3.7 8.5c-2.4-2.3-3.7-5.4-3.7-8.5S9.6 5.8 12 3.5Z" {...p} /></>),
    arrowRight: (<><path d="M5 12h14M13 6l6 6-6 6" {...p} /></>),
    arrowLeft: (<><path d="M19 12H5M11 6l-6 6 6 6" {...p} /></>),
    bell: (<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...p} /><path d="M10 19a2 2 0 0 0 4 0" {...p} /></>),
    x: (<><path d="M6 6l12 12M18 6 6 18" {...p} /></>),
    edit: (<><path d="M14 5.5 18.5 10 8 20.5l-4.5 1 1-4.5L14 5.5Z" {...p} /><path d="M13 6.5 17.5 11" {...p} /></>),
    grip: (<><circle cx="9" cy="7" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="7" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="17" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="1.3" fill="currentColor" stroke="none" /></>),
    eye: (<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>),
    trash: (<><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" {...p} /></>),
    lock: (<><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" {...p} /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...p} /></>),
    shield: (<><path d="M12 3 5 5.5V11c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V5.5L12 3Z" {...p} /><path d="M9 11.5 11 13.5l4-4" {...p} /></>),
    clock: (<><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 7v5l3.5 2" {...p} /></>),
    dots: (<><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" /></>),
    video: (<><rect x="2.5" y="6" width="13" height="12" rx="2.5" {...p} /><path d="m15.5 10 6-3v10l-6-3" {...p} /></>),
    mappin: (<><path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" {...p} /><circle cx="12" cy="10" r="2.5" {...p} /></>),
    send: (<><path d="M4 12 20 4l-6 16-3-7-7-1Z" {...p} /></>),
    bolt: (<><path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z" {...p} /></>),
    grid: (<><rect x="3.5" y="3.5" width="7" height="7" rx="2" {...p} /><rect x="13.5" y="3.5" width="7" height="7" rx="2" {...p} /><rect x="3.5" y="13.5" width="7" height="7" rx="2" {...p} /><rect x="13.5" y="13.5" width="7" height="7" rx="2" {...p} /></>),
    logout: (<><path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" {...p} /><path d="M10 12h11M18 9l3 3-3 3" {...p} /></>),
    alert: (<><path d="M12 3 22 20H2L12 3Z" {...p} /><path d="M12 10v4M12 17v.5" {...p} /></>),
    money: (<><rect x="2.5" y="6" width="19" height="12" rx="2.5" {...p} /><circle cx="12" cy="12" r="2.6" {...p} /><path d="M6 9.5v5M18 9.5v5" {...p} /></>),
    sun: (<><circle cx="12" cy="12" r="4" {...p} /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" {...p} /></>),
    moon: (<><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" {...p} /></>),
    phone: (<><path d="M5 4h4l1.5 5-2 1.5a11 11 0 0 0 5 5l1.5-2 5 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" {...p} /></>),
    user: (<><circle cx="12" cy="8" r="3.6" {...p} /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" {...p} /></>),
    camera: (<><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Z" {...p} /><circle cx="12" cy="13" r="3.2" {...p} /></>),
    refresh: (<><path d="M20 11a8 8 0 0 0-14-4.5L4 9M4 4v5h5" {...p} /><path d="M4 13a8 8 0 0 0 14 4.5L20 15M20 20v-5h-5" {...p} /></>),
    chat: (<><path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z" {...p} /></>),
    map: (<><path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" {...p} /><path d="M9 4v14M15 6v14" {...p} /></>),
    heart: (<><path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.5 0 5 3.5 3.5 6.5-2.5 4.5-9.5 9-9.5 9Z" {...p} /></>),
    bookmark: (<><path d="M6 4h12v17l-6-4-6 4V4Z" {...p} /></>),
    bolt2: (<><path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z" {...p} /></>),
    tag: (<><path d="M3 12.5 11.5 4H20v8.5L11.5 21 3 12.5Z" {...p} /><circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" /></>),
    target: (<><circle cx="12" cy="12" r="8.5" {...p} /><circle cx="12" cy="12" r="4.5" {...p} /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>),
    wand: (<><path d="M4 20 16 8M14 6l4 4M18 3v3M21 5h-3M19.5 9.5 21 11" {...p} /></>),
    pencilPlus: (<><path d="M14 5.5 18.5 10 8 20.5l-4.5 1 1-4.5L14 5.5Z" {...p} /><path d="M13 6.5 17.5 11" {...p} /></>),
    file: (<><path d="M6 3h8l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" {...p} /><path d="M13 3v5h5" {...p} /></>),
    paperclip: (<><path d="M18 7.5 9.5 16a3 3 0 0 1-4.2-4.2l8-8a4.5 4.5 0 0 1 6.4 6.4l-8.2 8.2a6 6 0 0 1-8.5-8.5" {...p} /></>),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {paths[name] || null}
    </svg>
  );
}
