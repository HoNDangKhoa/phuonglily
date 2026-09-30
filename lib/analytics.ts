import { prisma } from "@/lib/prisma";

export type DashboardAnalytics = {
  month: number;
  year: number;
  daily: { day: number; count: number }[];
  online: number;
  week: number;
  monthTotal: number;
  allTime: number;
  browsers: { name: string; count: number; color: string }[];
  devices: { desktop: number; mobile: number };
  ips: { ip: string; count: number }[];
};

const BROWSER_COLORS: Record<string, string> = {
  Chrome: "#22c55e",
  "Microsoft Edge": "#3b82f6",
  "Internet Explorer": "#0ea5e9",
  "Mozilla Firefox": "#f97316",
  Safari: "#a855f7",
  Opera: "#ef4444",
  Khác: "#94a3b8",
};

export function detectBrowser(ua: string) {
  const u = ua.toLowerCase();
  if (u.includes("edg/")) return "Microsoft Edge";
  if (u.includes("opr/") || u.includes("opera")) return "Opera";
  if (u.includes("chrome") && !u.includes("edg/")) return "Chrome";
  if (u.includes("safari") && !u.includes("chrome")) return "Safari";
  if (u.includes("firefox")) return "Mozilla Firefox";
  if (u.includes("trident") || u.includes("msie")) return "Internet Explorer";
  return "Khác";
}

export function detectDevice(ua: string) {
  return /mobile|android|iphone|ipad|ipod/i.test(ua) ? "mobile" : "desktop";
}

export async function getDashboardAnalytics(
  month?: number,
  year?: number,
): Promise<DashboardAnalytics> {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const onlineSince = new Date(now.getTime() - 5 * 60 * 1000);

  const [monthLogs, online, week, allTime, browsersRaw, devicesRaw, ipsRaw] =
    await Promise.all([
      prisma.visitLog.findMany({
        where: { createdAt: { gte: start, lt: end } },
        select: { createdAt: true },
      }),
      prisma.visitLog.count({
        where: { createdAt: { gte: onlineSince } },
      }),
      prisma.visitLog.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.visitLog.count(),
      prisma.visitLog.groupBy({
        by: ["browser"],
        _count: { browser: true },
        orderBy: { _count: { browser: "desc" } },
      }),
      prisma.visitLog.groupBy({
        by: ["device"],
        _count: { device: true },
      }),
      prisma.visitLog.groupBy({
        by: ["ip"],
        where: { ip: { not: null } },
        _count: { ip: true },
        orderBy: { _count: { ip: "desc" } },
        take: 10,
      }),
    ]);

  const daysInMonth = new Date(y, m, 0).getDate();
  const dailyMap = new Map<number, number>();
  for (let d = 1; d <= daysInMonth; d++) dailyMap.set(d, 0);
  for (const log of monthLogs) {
    const day = log.createdAt.getDate();
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
  }

  const browserOrder = [
    "Chrome",
    "Microsoft Edge",
    "Internet Explorer",
    "Mozilla Firefox",
    "Safari",
    "Opera",
    "Khác",
  ];
  const browserCount = new Map(
    browsersRaw.map((b) => [b.browser, b._count.browser]),
  );

  const desktop =
    devicesRaw.find((d) => d.device === "desktop")?._count.device || 0;
  const mobile =
    devicesRaw.find((d) => d.device === "mobile")?._count.device || 0;

  return {
    month: m,
    year: y,
    daily: Array.from(dailyMap.entries()).map(([day, count]) => ({
      day,
      count,
    })),
    online,
    week,
    monthTotal: monthLogs.length,
    allTime,
    browsers: browserOrder.map((name) => ({
      name,
      count: browserCount.get(name) || 0,
      color: BROWSER_COLORS[name] || "#94a3b8",
    })),
    devices: { desktop, mobile },
    ips: ipsRaw
      .filter((i) => i.ip)
      .map((i) => ({ ip: i.ip!, count: i._count.ip })),
  };
}

export async function seedDemoVisitsIfEmpty() {
  const count = await prisma.visitLog.count();
  if (count > 0) return;

  const now = new Date();
  const browsers = [
    "Chrome",
    "Chrome",
    "Chrome",
    "Safari",
    "Safari",
    "Mozilla Firefox",
    "Microsoft Edge",
    "Khác",
  ];
  const ips = [
    "42.116.72.179",
    "171.252.227.121",
    "14.224.230.171",
    "58.187.249.252",
    "103.199.32.147",
  ];
  const rows = [];
  for (let i = 0; i < 120; i++) {
    const day = Math.max(1, now.getDate() - Math.floor(Math.random() * 20));
    const createdAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      day,
      Math.floor(Math.random() * 23),
      Math.floor(Math.random() * 59),
    );
    rows.push({
      path: ["/", "/tin-tuc", "/lien-he", "/gioi-thieu", "/dich-vu"][
        i % 5
      ],
      ip: ips[i % ips.length],
      browser: browsers[i % browsers.length],
      device: i % 4 === 0 ? "mobile" : "desktop",
      createdAt,
    });
  }
  await prisma.visitLog.createMany({ data: rows });
}
