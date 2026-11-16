import type {
  RevenueStatistics,
  OrderStatistics,
  TopProduct,
  UserStatistics,
} from "@/types/statistics"

// Hàm sinh ngày dạng YYYY-MM-DD
const getPastDateStr = (daysAgo: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split("T")[0]
}

const formatDateLabel = (daysAgo: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// ---------------------------------------------------------------------------
// 1. MOCK REVENUE STATISTICS
// ---------------------------------------------------------------------------
const dailyTimelineData = [
  { daysAgo: 13, rev: 12500000, orders: 2 },
  { daysAgo: 12, rev: 8900000, orders: 1 },
  { daysAgo: 11, rev: 24600000, orders: 4 },
  { daysAgo: 10, rev: 18200000, orders: 3 },
  { daysAgo: 9, rev: 31000000, orders: 5 },
  { daysAgo: 8, rev: 15400000, orders: 2 },
  { daysAgo: 7, rev: 27800000, orders: 4 },
  { daysAgo: 6, rev: 42100000, orders: 6 },
  { daysAgo: 5, rev: 36500000, orders: 5 },
  { daysAgo: 4, rev: 19800000, orders: 3 },
  { daysAgo: 3, rev: 48900000, orders: 7 },
  { daysAgo: 2, rev: 53200000, orders: 8 },
  { daysAgo: 1, rev: 38400000, orders: 6 },
  { daysAgo: 0, rev: 28700000, orders: 4 },
]

export const MOCK_REVENUE_STATS_DAILY: RevenueStatistics = {
  totalRevenue: dailyTimelineData.reduce((acc, curr) => acc + curr.rev, 0),
  totalOrders: dailyTimelineData.reduce((acc, curr) => acc + curr.orders, 0),
  averageOrderValue: Math.round(
    dailyTimelineData.reduce((acc, curr) => acc + curr.rev, 0) /
      dailyTimelineData.reduce((acc, curr) => acc + curr.orders, 0)
  ),
  period: "DAY",
  timeline: dailyTimelineData.map((item) => ({
    date: getPastDateStr(item.daysAgo),
    label: formatDateLabel(item.daysAgo),
    revenue: item.rev,
    orderCount: item.orders,
  })),
}

export const MOCK_REVENUE_STATS_MONTHLY: RevenueStatistics = {
  totalRevenue: 1248000000,
  totalOrders: 194,
  averageOrderValue: 6432989,
  period: "MONTH",
  timeline: [
    { date: "2026-01", label: "Tháng 01/2026", revenue: 85000000, orderCount: 14 },
    { date: "2026-02", label: "Tháng 02/2026", revenue: 98000000, orderCount: 16 },
    { date: "2026-03", label: "Tháng 03/2026", revenue: 112000000, orderCount: 18 },
    { date: "2026-04", label: "Tháng 04/2026", revenue: 104000000, orderCount: 15 },
    { date: "2026-05", label: "Tháng 05/2026", revenue: 135000000, orderCount: 21 },
    { date: "2026-06", label: "Tháng 06/2026", revenue: 128000000, orderCount: 19 },
    { date: "2026-07", label: "Tháng 07/2026", revenue: 142000000, orderCount: 22 },
    { date: "2026-08", label: "Tháng 08/2026", revenue: 156000000, orderCount: 24 },
    { date: "2026-09", label: "Tháng 09/2026", revenue: 138000000, orderCount: 21 },
    { date: "2026-10", label: "Tháng 10/2026", revenue: 150000000, orderCount: 24 },
  ],
}

export const MOCK_REVENUE_STATS_YEARLY: RevenueStatistics = {
  totalRevenue: 3450000000,
  totalOrders: 540,
  averageOrderValue: 6388888,
  period: "YEAR",
  timeline: [
    { date: "2023", label: "Năm 2023", revenue: 680000000, orderCount: 110 },
    { date: "2024", label: "Năm 2024", revenue: 950000000, orderCount: 150 },
    { date: "2025", label: "Năm 2025", revenue: 1320000000, orderCount: 200 },
    { date: "2026", label: "Năm 2026", revenue: 500000000, orderCount: 80 },
  ],
}

// ---------------------------------------------------------------------------
// 2. MOCK ORDER BREAKDOWN STATISTICS
// ---------------------------------------------------------------------------
export const MOCK_ORDER_STATS: OrderStatistics = {
  totalOrders: 128,
  pendingCount: 12,
  confirmedCount: 19,
  shippingCount: 14,
  deliveredCount: 76,
  cancelledCount: 7,
  breakdown: [
    {
      status: "PENDING",
      statusName: "Chờ xác nhận",
      count: 12,
      percentage: 9.38,
    },
    {
      status: "CONFIRMED",
      statusName: "Đã xác nhận",
      count: 19,
      percentage: 14.84,
    },
    {
      status: "SHIPPING",
      statusName: "Đang giao hàng",
      count: 14,
      percentage: 10.94,
    },
    {
      status: "DELIVERED",
      statusName: "Đã giao hàng",
      count: 76,
      percentage: 59.38,
    },
    {
      status: "CANCELLED",
      statusName: "Đã hủy",
      count: 7,
      percentage: 5.47,
    },
  ],
}

// ---------------------------------------------------------------------------
// 3. MOCK TOP PRODUCTS
// ---------------------------------------------------------------------------
export const MOCK_TOP_PRODUCTS: TopProduct[] = [
  {
    productId: "prod-001",
    productName: "Card màn hình ASUS ROG Strix GeForce RTX 4070 Ti SUPER 16GB",
    category: "GPU",
    primaryImageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80",
    currentPrice: 24990000,
    stockQuantity: 8,
    totalQuantitySold: 28,
    totalRevenue: 699720000,
  },
  {
    productId: "prod-002",
    productName: "CPU Intel Core i7 14700K (Up to 5.6GHz, 20 Nhân 28 Luồng, 33MB)",
    category: "CPU",
    primaryImageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80",
    currentPrice: 10890000,
    stockQuantity: 15,
    totalQuantitySold: 46,
    totalRevenue: 500940000,
  },
  {
    productId: "prod-003",
    productName: "Mainboard ASUS ROG MAXIMUS Z790 HERO DDR5",
    category: "MAINBOARD",
    primaryImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    currentPrice: 15490000,
    stockQuantity: 6,
    totalQuantitySold: 19,
    totalRevenue: 294310000,
  },
  {
    productId: "prod-004",
    productName: "RAM Corsair Dominator Titanium RGB 32GB (2x16GB) 6000MHz White",
    category: "RAM",
    primaryImageUrl: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&w=400&q=80",
    currentPrice: 4290000,
    stockQuantity: 24,
    totalQuantitySold: 58,
    totalRevenue: 248820000,
  },
  {
    productId: "prod-005",
    productName: "Ổ cứng SSD Samsung 990 PRO 2TB PCIe Gen 4.0 x4 NVMe M.2",
    category: "STORAGE",
    primaryImageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80",
    currentPrice: 4890000,
    stockQuantity: 18,
    totalQuantitySold: 44,
    totalRevenue: 215160000,
  },
  {
    productId: "prod-006",
    productName: "Nguồn máy tính Corsair RM850e 850W 80 Plus Gold ATX 3.0",
    category: "PSU",
    primaryImageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80",
    currentPrice: 3250000,
    stockQuantity: 12,
    totalQuantitySold: 35,
    totalRevenue: 113750000,
  },
  {
    productId: "prod-007",
    productName: "Tản nhiệt nước NZXT Kraken Elite 360 RGB Black",
    category: "CPU_COOLER",
    primaryImageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=400&q=80",
    currentPrice: 7590000,
    stockQuantity: 5,
    totalQuantitySold: 14,
    totalRevenue: 106260000,
  },
  {
    productId: "prod-008",
    productName: "Vỏ Case Lian Li O11 Dynamic EVO Black (Mid Tower)",
    category: "CASE",
    primaryImageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80",
    currentPrice: 4150000,
    stockQuantity: 9,
    totalQuantitySold: 21,
    totalRevenue: 87150000,
  },
]

// ---------------------------------------------------------------------------
// 4. MOCK USER STATISTICS
// ---------------------------------------------------------------------------
const userTimelineData = [
  { daysAgo: 13, users: 4 },
  { daysAgo: 12, users: 3 },
  { daysAgo: 11, users: 7 },
  { daysAgo: 10, users: 5 },
  { daysAgo: 9, users: 8 },
  { daysAgo: 8, users: 6 },
  { daysAgo: 7, users: 9 },
  { daysAgo: 6, users: 12 },
  { daysAgo: 5, users: 10 },
  { daysAgo: 4, users: 8 },
  { daysAgo: 3, users: 15 },
  { daysAgo: 2, users: 14 },
  { daysAgo: 1, users: 11 },
  { daysAgo: 0, users: 9 },
]

export const MOCK_USER_STATS: UserStatistics = {
  totalUsers: 384,
  newUsersInPeriod: userTimelineData.reduce((acc, curr) => acc + curr.users, 0),
  activeUsers: 368,
  verifiedUsers: 326,
  period: "DAY",
  timeline: userTimelineData.map((item) => ({
    date: getPastDateStr(item.daysAgo),
    label: formatDateLabel(item.daysAgo),
    newUsersCount: item.users,
  })),
}
