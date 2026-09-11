"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "⌂", label: "Dashboard" },
  { href: "/watchlist", icon: "◎", label: "Watchlist" },
  { href: "/calendar", icon: "▦", label: "Calendar" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brandMark"><span>SB</span><div><strong>SCOUTBOARD</strong><small>PERSONAL SCOUTING DESK</small></div></div>
      <nav className="sideNav" aria-label="Primary navigation">
        <div className="sideLabel">WORKSPACE</div>
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return <Link href={item.href} key={item.href} className={active ? "navItem active" : "navItem"}><span className="navIcon">{item.icon}</span><span>{item.label}</span></Link>;
        })}
      </nav>
      <div className="sideFooter">
        <div className="statusDot"><span /> Data providers online</div>
        <div className="sideHint">Built for repeat viewings, not score checking.</div>
      </div>
    </aside>
  );
}
