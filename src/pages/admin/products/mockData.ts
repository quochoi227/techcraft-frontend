import type { ApiResponse, PageData, Product } from "@/types/product"

export const MOCK_PRODUCTS_PAGE: PageData<Product> = {
  content: [
    {
      id: "72a66a99-27bd-4edb-92fb-cd5d4301de69",
      name: "Tản nhiệt khí DeepCool AK600 Digital (Đen / Màn hình hiển thị nhiệt độ)",
      sku: "CL-DC-AK600-DIG",
      brand: "DeepCool",
      price: 890000.0,
      stockQuantity: 35,
      category: "CPU_COOLER",
      description:
        "Tản nhiệt khí 4 ống đồng tích hợp màn hình kỹ thuật số hiển thị nhiệt độ và mức tải CPU theo thời gian thực, vận hành êm ái và dễ dàng lắp đặt.",
      detail: {
        type: "Air",
        heightMm: 156,
        tdpSupportW: 220,
        socketSupport: ["LGA1700", "LGA1200", "AM5", "AM4"],
        radiatorSizeMm: null,
      },
      images: [
        {
          id: "4947f04f-7569-4b79-93c7-abda721c0aab",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/cooler/deepcool-ak400-digital-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T11:49:50.605683Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T11:49:50.576792Z",
      updatedAt: "2026-10-19T11:51:03.240500Z",
      active: false,
      detailSummary: {
        primary: "Air • Cao 156mm • TDP 220W",
        secondary: "LGA1700, LGA1200, AM5, AM4",
      },
    },
    {
      id: "bfb1c57b-aa19-4d33-b076-4f35b041a3a3",
      name: "Tản nhiệt khí DeepCool AK550 Digital (Đen / Màn hình hiển thị nhiệt độ)",
      sku: "CL-DC-AK550-DIG",
      brand: "DeepCool",
      price: 890000.0,
      stockQuantity: 35,
      category: "CPU_COOLER",
      description:
        "Tản nhiệt khí 4 ống đồng tích hợp màn hình kỹ thuật số hiển thị nhiệt độ và mức tải CPU theo thời gian thực, vận hành êm ái và dễ dàng lắp đặt.",
      detail: {
        type: "Air",
        heightMm: 156,
        tdpSupportW: 220,
        socketSupport: ["LGA1700", "LGA1200", "AM5", "AM4"],
        radiatorSizeMm: null,
      },
      images: [
        {
          id: "c62d722a-bf8b-4a9d-9d35-f280517460a2",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/cooler/deepcool-ak400-digital-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T11:48:39.018772Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T11:48:38.978792Z",
      updatedAt: "2026-10-19T11:48:38.978792Z",
      active: true,
      detailSummary: {
        primary: "Air • Cao 156mm • TDP 220W",
        secondary: "LGA1700, LGA1200, AM5, AM4",
      },
    },
    {
      id: "e5a329e1-6efc-497d-a19d-7243b8112180",
      name: "Card màn hình ASUS ROG Strix GeForce RTX 4080 Super OC 16GB",
      sku: "GPU-ASUS-4080-16G",
      brand: "ASUS ROG",
      category: "GPU",
      price: 19490000.0,
      stockQuantity: 12,
      active: true,
      description:
        "Card đồ họa đỉnh cao kiến trúc Ada Lovelace với hiệu năng AI vượt trội và hệ thống tản nhiệt 3 quạt Axial.",
      detail: {
        vramGb: 16,
        vramType: "GDDR6X",
        tdpW: 320,
        pcieSlot: "x16",
        lengthMm: 338.9,
      },
      images: [
        {
          id: "img-gpu-1",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/gpu/asus-rog-strix-4080-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T10:00:00.000Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T10:00:00.000Z",
      updatedAt: "2026-10-19T10:00:00.000Z",
      detailSummary: {
        primary: "16GB GDDR6X • Dài 338.9mm • 3 Quạt Axial",
        secondary: "PCIe 4.0 x16, 2x HDMI 2.1, 3x DP 1.4a",
      },
    },
    {
      id: "f83b23c4-118b-4c48-b4b3-bc42d59103c8",
      name: "CPU Intel Core i7-14700K (20 nhân 28 luồng, up to 5.6GHz)",
      sku: "CPU-INTEL-14700K",
      brand: "Intel Box Chính Hãng",
      category: "CPU",
      price: 10890000.0,
      stockQuantity: 8,
      active: true,
      description:
        "Vi xử lý thế hệ thứ 14 Raptor Lake Refresh với 20 nhân 28 luồng, xung nhịp turbo lên đến 5.6GHz.",
      detail: {
        socket: "LGA1700",
        cores: 20,
        threads: 28,
        baseClockGhz: 3.4,
        boostClockGhz: 5.6,
        tdpW: 125,
        memoryType: "DDR4/DDR5",
        integratedGpu: true,
      },
      images: [
        {
          id: "img-cpu-1",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/cpu/intel-core-i7-14700k-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T10:10:00.000Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T10:10:00.000Z",
      updatedAt: "2026-10-19T10:10:00.000Z",
      detailSummary: {
        primary: "Socket LGA1700 • 20C/28T • 33MB Cache",
        secondary: "Hỗ trợ DDR4/DDR5, iGPU Intel UHD 770",
      },
    },
    {
      id: "a1c2d3e4-f5b6-4789-8012-3456789abcde",
      name: "RAM Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz",
      sku: "RAM-COR-32G-6000",
      brand: "Corsair",
      category: "RAM",
      price: 4250000.0,
      stockQuantity: 24,
      active: true,
      description:
        "Bộ nhớ DDR5 hiệu năng cao cấp từ Corsair với đèn LED RGB iCUE và thiết kế kim loại tinh xảo.",
      detail: {
        type: "DDR5",
        speedMhz: 6000,
        capacityGb: 16,
        sticks: 2,
        totalGb: 32,
      },
      images: [
        {
          id: "img-ram-1",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/ram/corsair-dominator-titanium-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T10:20:00.000Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T10:20:00.000Z",
      updatedAt: "2026-10-19T10:20:00.000Z",
      detailSummary: {
        primary: "DDR5 • 6000MHz • CL30 • 2×16GB",
        secondary: "Intel XMP 3.0 & AMD EXPO, LED RGB iCUE",
      },
    },
    {
      id: "b2c3d4e5-f6a7-4890-9123-456789abcdef",
      name: "Mainboard ASUS ROG MAXIMUS Z790 DARK HERO",
      sku: "MB-ASUS-Z790-DH",
      brand: "ASUS ROG",
      category: "MAINBOARD",
      price: 16990000.0,
      stockQuantity: 4,
      active: true,
      description:
        "Bo mạch chủ đỉnh cao chipset Intel Z790, hỗ trợ PCIe 5.0, Wi-Fi 7 và dàn VRM cấp điện cực kỳ mạnh mẽ.",
      detail: {
        socket: "LGA1700",
        formFactor: "ATX",
        chipset: "Z790",
        memoryType: "DDR5",
        memorySlots: 4,
        maxMemoryGb: 192,
        m2Slots: 5,
        pcieVersion: 5.0,
      },
      images: [
        {
          id: "img-mb-1",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/mb/asus-rog-z790-dark-hero-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T10:30:00.000Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T10:30:00.000Z",
      updatedAt: "2026-10-19T10:30:00.000Z",
      detailSummary: {
        primary: "Socket LGA1700 • ATX • Z790 Chipset",
        secondary: "4x DDR5 8000+ MT/s, 5x M.2, Wi-Fi 6E, PCIe 5.0",
      },
    },
    {
      id: "c3d4e5f6-a7b8-4901-a234-56789abcdef0",
      name: "Nguồn máy tính Corsair RM850e 850W 80 Plus Gold",
      sku: "PSU-COR-850E",
      brand: "Corsair",
      category: "PSU",
      price: 3190000.0,
      stockQuantity: 15,
      active: true,
      description:
        "Nguồn máy tính chuẩn ATX 3.0 với chứng nhận 80 Plus Gold, cáp Full Modular và cổng nguồn 12VHPWR.",
      detail: {
        wattageW: 850,
        efficiency: "80+ Gold",
        modular: "Full",
        formFactor: "ATX",
      },
      images: [
        {
          id: "img-psu-1",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/psu/corsair-rm850e-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T10:40:00.000Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T10:40:00.000Z",
      updatedAt: "2026-10-19T10:40:00.000Z",
      detailSummary: {
        primary: "850W • 80 Plus Gold • Chuẩn ATX 3.0",
        secondary: "Full Modular, PCIe 5.0 12VHPWR Ready, Quạt 120mm",
      },
    },
    {
      id: "d4e5f6a7-b8c9-4012-b345-6789abcdef01",
      name: "Vỏ Case NZXT H9 Flow White Dual-Chamber Mid-Tower",
      sku: "CASE-NZXT-H9F-WH",
      brand: "NZXT",
      category: "CASE",
      price: 4190000.0,
      stockQuantity: 6,
      active: true,
      description:
        "Vỏ case thiết kế buồng đôi Dual-Chamber với mặt kính cường lực liền mạch mở rộng góc nhìn toàn cảnh phần cứng.",
      detail: {
        formFactorSupport: ["ATX", "mATX", "ITX"],
        maxGpuLengthMm: 435,
        maxCoolerHeightMm: 165,
        driveBays35: 2,
        driveBays25: 4,
      },
      images: [
        {
          id: "img-case-1",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/case/nzxt-h9-flow-white-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T10:50:00.000Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T10:50:00.000Z",
      updatedAt: "2026-10-19T10:50:00.000Z",
      detailSummary: {
        primary: "ATX, Micro-ATX, Mini-ITX • GPU max 435mm",
        secondary: "Tản CPU Max 165mm, Kính cường lực Panoramic",
      },
    },
    {
      id: "e5f6a7b8-c9d0-4123-c456-789abcdef012",
      name: "Ổ cứng SSD Samsung 990 PRO 1TB PCIe 4.0 M.2 NVMe",
      sku: "SSD-SAM-990P-1TB",
      brand: "Samsung VN",
      category: "STORAGE",
      price: 2890000.0,
      stockQuantity: 0,
      active: true,
      description:
        "Ổ cứng thể rắn tốc độ đọc tuần tự lên đến 7450 MB/s, tối ưu hóa cho đồ họa nặng, workstation và gaming.",
      detail: {
        type: "NVMe SSD",
        capacityGb: 1000,
        interface: "M.2 PCIe 4.0",
        readMbps: 7450,
        writeMbps: 6900,
      },
      images: [
        {
          id: "img-ssd-1",
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/products/ssd/samsung-990-pro-1.jpg",
          displayOrder: 0,
          createdAt: "2026-10-19T11:00:00.000Z",
          primary: true,
        },
      ],
      createdAt: "2026-10-19T11:00:00.000Z",
      updatedAt: "2026-10-19T11:00:00.000Z",
      detailSummary: {
        primary: "M.2 NVMe 2280 • Đọc 7.450 MB/s • Ghi 6.900 MB/s",
        secondary: "PCIe Gen 4.0 x4, Samsung V-NAND TLC",
      },
    },
  ],
  page: 0,
  size: 12,
  totalElements: 13,
  totalPages: 2,
  first: true,
  last: false,
  empty: false,
}

// Khớp với ApiResponse bọc ngoài
export const MOCK_API_PRODUCTS_RESPONSE: ApiResponse<PageData<Product>> = {
  success: true,
  message: "Lấy danh sách sản phẩm thành công!",
  data: MOCK_PRODUCTS_PAGE,
}

// Dùng cho tương thích mảng trực tiếp nếu cần
export const MOCK_PRODUCTS: Product[] = MOCK_PRODUCTS_PAGE.content
