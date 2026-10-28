import type { Product, ProductCategory } from '@/types/product'

// Danh mục 8 slot chuẩn của hệ thống PC Case
export const PC_COMPONENT_SLOTS: {
  category: ProductCategory
  label: string
  description: string
}[] = [
  { category: 'CPU', label: 'Bộ vi xử lý (CPU)', description: 'Trái tim của hệ thống PC' },
  { category: 'MAINBOARD', label: 'Bo mạch chủ (Mainboard)', description: 'Nền tảng kết nối linh kiện' },
  { category: 'RAM', label: 'Bộ nhớ trong (RAM)', description: 'Đa nhiệm và lưu trữ tạm thời' },
  { category: 'GPU', label: 'Card đồ họa (VGA / GPU)', description: 'Xử lý hình ảnh, gaming và AI' },
  { category: 'STORAGE', label: 'Ổ cứng lưu trữ (SSD/HDD)', description: 'Lưu trữ hệ điều hành và dữ liệu' },
  { category: 'PSU', label: 'Nguồn máy tính (PSU)', description: 'Cung cấp năng lượng ổn định' },
  { category: 'CASE', label: 'Vỏ máy tính (Case)', description: 'Bảo vệ và định hình thẩm mỹ' },
  { category: 'CPU_COOLER', label: 'Tản nhiệt CPU (Cooler)', description: 'Làm mát và duy trì hiệu năng' },
]

// Nhóm nhu cầu hiển thị UI
export const USE_CASE_OPTIONS = [
  {
    value: 'gaming',
    label: 'Gaming & Esports',
    badgeClass: 'bg-purple-50 text-purple-600 border border-purple-200',
  },
  {
    value: 'rendering',
    label: 'Đồ họa & Render 3D',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  {
    value: 'office',
    label: 'Học tập & Văn phòng',
    badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200',
  },
  {
    value: 'ai',
    label: 'AI & Deep Learning',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
]

// Tabs phân loại nhóm nhu cầu
export const USE_CASE_TABS: { label: string; value: string }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Gaming & Esports', value: 'gaming' },
  { label: 'Đồ họa & Render 3D', value: 'rendering' },
  { label: 'Học tập & Văn phòng', value: 'office' },
  { label: 'AI & Deep Learning', value: 'ai' },
]

// Hàm kiểm tra 8 ràng buộc tương thích phần cứng dựa trên thông số detail thực tế của sản phẩm
export function checkHardwareCompatibility(
  components: Partial<Record<ProductCategory, Product | null>>
): { compatible: boolean; violations: string[] } {
  const violations: string[] = []

  const cpu = components.CPU
  const mainboard = components.MAINBOARD
  const ram = components.RAM
  const gpu = components.GPU
  const storage = components.STORAGE
  const psu = components.PSU
  const pcCase = components.CASE
  const cooler = components.CPU_COOLER

  const getProp = (detail: any, ...keys: string[]) => {
    if (!detail) return undefined
    for (const key of keys) {
      if (detail[key] !== undefined) return detail[key]
    }
    return undefined
  }

  // Ràng buộc 1: Socket CPU và Bo mạch chủ
  const cpuSocket = getProp(cpu?.detail, 'socket')
  const mbSocket = getProp(mainboard?.detail, 'socket')
  if (cpuSocket && mbSocket) {
    if (String(cpuSocket).trim().toLowerCase() !== String(mbSocket).trim().toLowerCase()) {
      violations.push(
        `Socket CPU (${cpuSocket}) không tương thích với Socket Bo mạch chủ (${mbSocket}).`
      )
    }
  }

  // Ràng buộc 2 & 3: Chuẩn RAM tương thích với Bo mạch chủ
  const ramType = getProp(ram?.detail, 'type', 'memory_type', 'memoryType')
  const mbMem = getProp(mainboard?.detail, 'memory_type', 'memoryType')
  if (ramType && mbMem) {
    const mbMemStr = String(mbMem).toUpperCase()
    const ramTypeStr = String(ramType).toUpperCase()
    if (!mbMemStr.includes(ramTypeStr)) {
      violations.push(
        `Chuẩn RAM (${ramType}) không khớp với chuẩn khe cắm RAM của Bo mạch chủ (${mbMem}).`
      )
    }
  }

  // Ràng buộc 4: Form Factor Bo mạch chủ vừa trong Vỏ Case
  const mbFormFactor = getProp(mainboard?.detail, 'form_factor', 'formFactor')
  const caseFfSupport = getProp(pcCase?.detail, 'form_factor_support', 'formFactorSupport')
  if (mbFormFactor && caseFfSupport) {
    const supportedList: string[] = Array.isArray(caseFfSupport)
      ? caseFfSupport.map((f) => String(f).toUpperCase())
      : [String(caseFfSupport).toUpperCase()]
    const mbFfStr = String(mbFormFactor).toUpperCase()
    if (!supportedList.includes(mbFfStr)) {
      violations.push(
        `Kích thước Bo mạch chủ (${mbFormFactor}) không nằm trong danh sách hỗ trợ của Vỏ Case (${supportedList.join(', ')}).`
      )
    }
  }

  // Ràng buộc 5: Chiều dài GPU không vượt quá giới hạn Vỏ Case
  const gpuLength = Number(getProp(gpu?.detail, 'length_mm', 'lengthMm'))
  const caseMaxGpu = Number(getProp(pcCase?.detail, 'max_gpu_length_mm', 'maxGpuLengthMm'))
  if (gpuLength > 0 && caseMaxGpu > 0) {
    if (gpuLength > caseMaxGpu) {
      violations.push(
        `Chiều dài Card đồ họa (${gpuLength}mm) vượt quá chiều dài GPU tối đa của Vỏ Case (${caseMaxGpu}mm).`
      )
    }
  }

  // Ràng buộc 6: Chiều cao tản nhiệt CPU không vượt quá giới hạn Vỏ Case
  const coolerHeight = Number(getProp(cooler?.detail, 'height_mm', 'heightMm'))
  const caseMaxCooler = Number(getProp(pcCase?.detail, 'max_cooler_height_mm', 'maxCoolerHeightMm'))
  if (coolerHeight > 0 && caseMaxCooler > 0) {
    if (coolerHeight > caseMaxCooler) {
      violations.push(
        `Chiều cao Tản nhiệt CPU (${coolerHeight}mm) vượt quá chiều cao tản nhiệt tối đa của Vỏ Case (${caseMaxCooler}mm).`
      )
    }
  }

  // Ràng buộc 7: Tản nhiệt CPU hỗ trợ Socket của CPU
  const coolerSocketSupport = getProp(cooler?.detail, 'socket_support', 'socketSupport')
  if (coolerSocketSupport && cpuSocket) {
    const supportedSockets: string[] = Array.isArray(coolerSocketSupport)
      ? coolerSocketSupport.map((s) => String(s).toUpperCase())
      : [String(coolerSocketSupport).toUpperCase()]
    const cpuSocketStr = String(cpuSocket).toUpperCase()
    if (!supportedSockets.includes(cpuSocketStr)) {
      violations.push(
        `Tản nhiệt CPU không hỗ trợ Socket ${cpuSocket} của bộ vi xử lý đã chọn.`
      )
    }
  }

  // Ràng buộc 8: Nguồn máy tính (PSU) đủ công suất: TDP(CPU) + TDP(GPU) <= PSU.wattage * 0.8
  const psuWattage = Number(getProp(psu?.detail, 'wattage_w', 'wattageW'))
  if (psuWattage > 0) {
    const cpuTdp = Number(getProp(cpu?.detail, 'tdp_w', 'tdpW')) || 65
    const gpuTdp = Number(getProp(gpu?.detail, 'tdp_w', 'tdpW')) || 100
    const totalTdp = cpuTdp + gpuTdp
    const safePsuCapacity = psuWattage * 0.8

    if (totalTdp > safePsuCapacity) {
      violations.push(
        `Công suất tiêu thụ tổng CPU & GPU (${totalTdp}W) vượt ngưỡng an toàn 80% của Nguồn PSU (${psuWattage}W, an toàn tối đa: ${Math.round(safePsuCapacity)}W). Nên chọn Nguồn từ ${Math.ceil(totalTdp / 0.75 / 50) * 50}W trở lên.`
      )
    }
  }

  // Ràng buộc 9: Kiểm tra tồn kho của linh kiện
  const componentsList = [cpu, mainboard, ram, gpu, storage, psu, pcCase, cooler].filter(Boolean)
  for (const c of componentsList) {
    if (c && typeof c.stockQuantity === 'number' && c.stockQuantity <= 0) {
      violations.push(`Linh kiện "${c.name}" hiện đang hết hàng trong kho (Tồn kho: 0).`)
    }
  }

  return {
    compatible: violations.length === 0,
    violations,
  }
}
