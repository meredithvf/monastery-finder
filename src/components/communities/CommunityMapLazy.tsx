"use client";

import dynamic from "next/dynamic";
import styles from "./communities.module.css";

export const CommunityMapLazy = dynamic(
  () => import("./CommunityMap").then((m) => ({ default: m.CommunityMap })),
  {
    ssr: false,
    loading: () => <p className={styles.status}>Loading map…</p>,
  },
);
