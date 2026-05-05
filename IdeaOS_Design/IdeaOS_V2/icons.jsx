// IdeaOS — Icons (lucide-style stroke icons)
const Icon = ({ d, size = 16, fill, stroke = 'currentColor', sw = 1.6, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d}
  </svg>
);

const IconDashboard = (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>}/>;
const IconBulb = (p) => <Icon {...p} d={<><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3Z"/></>}/>;
const IconPlus = (p) => <Icon {...p} d={<><path d="M12 5v14M5 12h14"/></>}/>;
const IconSettings = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></>}/>;
const IconSearch = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>}/>;
const IconChevron = (p) => <Icon {...p} d={<><path d="m9 18 6-6-6-6"/></>}/>;
const IconChevronDown = (p) => <Icon {...p} d={<><path d="m6 9 6 6 6-6"/></>}/>;
const IconArrowUp = (p) => <Icon {...p} d={<><path d="M7 17 17 7M7 7h10v10"/></>}/>;
const IconArrowDown = (p) => <Icon {...p} d={<><path d="M17 7 7 17M17 17H7V7"/></>}/>;
const IconGrid = (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>}/>;
const IconList = (p) => <Icon {...p} d={<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>}/>;
const IconBell = (p) => <Icon {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>}/>;
const IconSparkles = (p) => <Icon {...p} d={<><path d="M9.94 14.34 12 20l2.06-5.66L20 12l-5.94-2.34L12 4l-2.06 5.66L4 12Z"/><path d="M19 5l.6 1.6L21 7l-1.4.4L19 9l-.6-1.6L17 7l1.4-.4Z"/></>}/>;
const IconTrending = (p) => <Icon {...p} d={<><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></>}/>;
const IconShield = (p) => <Icon {...p} d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></>}/>;
const IconCoin = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9h4.5a2 2 0 0 1 0 4H9h5a2 2 0 0 1 0 4H9"/></>}/>;
const IconRocket = (p) => <Icon {...p} d={<><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></>}/>;
const IconDice = (p) => <Icon {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M16 8h.01M8 8h.01M8 16h.01M16 16h.01M12 12h.01"/></>}/>;
const IconClock = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}/>;
const IconCheck = (p) => <Icon {...p} d={<><path d="m5 12 5 5L20 7"/></>}/>;
const IconMic = (p) => <Icon {...p} d={<><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>}/>;
const IconFilter = (p) => <Icon {...p} d={<><path d="M22 3H2l8 9.46V19l4 2v-8.54Z"/></>}/>;
const IconPanel = (p) => <Icon {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>}/>;
const IconShare = (p) => <Icon {...p} d={<><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/></>}/>;

Object.assign(window, {
  Icon, IconDashboard, IconBulb, IconPlus, IconSettings, IconSearch, IconChevron, IconChevronDown,
  IconArrowUp, IconArrowDown, IconGrid, IconList, IconBell, IconSparkles, IconTrending, IconShield,
  IconCoin, IconRocket, IconDice, IconClock, IconCheck, IconMic, IconFilter, IconPanel, IconShare
});
