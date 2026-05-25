"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./communities.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/list", label: "List" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.brand}>
        Monastery Finder
      </Link>
      <div className={styles.navLinks}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
