/**
 * 元件类型注册表 —— 全应用唯一的元件定义来源（single source of truth）
 *
 * 新增一种元件（例如新的矩形/圆形类元件）只需在下方 ELEMENT_TYPES 数组中
 * 追加一项，以下所有环节会自动生效，无需再到处改代码：
 *   1. 左侧元件库列表............label / icon / defaultProps
 *   2. 拖到画布时的默认属性/尺寸..defaultProps / defaultSize
 *   3. 画布上的渲染组件..........component（组件映射）
 *   4. 图层列表中的名称与图标....label / icon
 *   5. 右侧属性面板的分类分支....propertyGroups（字段描述符驱动）
 *   6. 导出 PNG / 1-bit BMP 绘制.render
 */
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import TextElement from '@/components/Canvas/elements/TextElement.vue'
import RectElement from '@/components/Canvas/elements/RectElement.vue'
import CircleElement from '@/components/Canvas/elements/CircleElement.vue'
import LineElement from '@/components/Canvas/elements/LineElement.vue'
import ImageElement from '@/components/Canvas/elements/ImageElement.vue'
import BarcodeElement from '@/components/Canvas/elements/BarcodeElement.vue'
import QrcodeElement from '@/components/Canvas/elements/QrcodeElement.vue'
import TableElement from '@/components/Canvas/elements/TableElement.vue'

// ---------------------------------------------------------------------------
// 属性面板下拉选项（供 propertyGroups 字段描述符引用）
// ---------------------------------------------------------------------------
const FONT_NAMES = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Microsoft YaHei', 'SimSun', 'SimHei']
const FONT_OPTIONS = FONT_NAMES.map(f => ({ label: f, value: f }))

const BARCODE_FORMAT_OPTIONS = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'CODE39', label: 'Code 39' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' }
]

const ERROR_LEVEL_OPTIONS = [
  { value: 'L', label: '低 (7%)' },
  { value: 'M', label: '中 (15%)' },
  { value: 'Q', label: '较高 (25%)' },
  { value: 'H', label: '高 (30%)' }
]

const CELL_ALIGN_OPTIONS = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' }
]

// ---------------------------------------------------------------------------
// 各元件在属性面板中的分类分支（字段描述符）
// control 取值：input / number / color / select / checkbox / checkboxes /
//               upload / cellGrid
// change 为可选的自定义变更处理器名（在 PropertyPanel 中注册，默认走 updateProp）
// ---------------------------------------------------------------------------
const TEXT_PROPERTY_GROUPS = [
  {
    title: '文本属性',
    fields: [
      { key: 'content', label: '内容', control: 'input' },
      { key: 'fontFamily', label: '字体', control: 'select', options: FONT_OPTIONS },
      { key: 'fontSize', label: '字号', control: 'number', min: 8, max: 200 },
      { key: 'color', label: '颜色', control: 'color' },
      {
        key: 'textStyle', label: '样式', control: 'checkboxes',
        checkboxes: [
          { key: 'bold', label: '粗体' },
          { key: 'italic', label: '斜体' }
        ]
      }
    ]
  }
]

const SHAPE_PROPERTY_GROUPS = [
  {
    title: '图形属性',
    fields: [
      { key: 'fillColor', label: '填充色', control: 'color', showAlpha: true },
      { key: 'strokeColor', label: '边框色', control: 'color' },
      { key: 'strokeWidth', label: '边框宽', control: 'number', min: 0, max: 20 }
    ]
  }
]

const LINE_PROPERTY_GROUPS = [
  {
    title: '线条属性',
    fields: [
      { key: 'strokeColor', label: '颜色', control: 'color' },
      { key: 'strokeWidth', label: '粗细', control: 'number', min: 1, max: 50 }
    ]
  }
]

const IMAGE_PROPERTY_GROUPS = [
  {
    title: '图片属性',
    fields: [
      { key: 'imageData', label: '图片', control: 'upload' }
    ]
  }
]

const BARCODE_PROPERTY_GROUPS = [
  {
    title: '条码属性',
    fields: [
      { key: 'content', label: '内容', control: 'input' },
      { key: 'format', label: '格式', control: 'select', options: BARCODE_FORMAT_OPTIONS },
      { key: 'showText', label: '文字', control: 'checkbox', checkboxLabel: '显示' }
    ]
  }
]

const QRCODE_PROPERTY_GROUPS = [
  {
    title: '二维码属性',
    fields: [
      { key: 'content', label: '内容', control: 'input' },
      { key: 'errorLevel', label: '容错', control: 'select', options: ERROR_LEVEL_OPTIONS }
    ]
  }
]

const TABLE_PROPERTY_GROUPS = [
  {
    title: '表格属性',
    fields: [
      { key: 'rows', label: '行数', control: 'number', min: 1, max: 20, change: 'tableRows' },
      { key: 'cols', label: '列数', control: 'number', min: 1, max: 20, change: 'tableCols' },
      { key: 'borderColor', label: '边框色', control: 'color' },
      { key: 'borderWidth', label: '边框宽', control: 'number', min: 0, max: 10 },
      { key: 'cellFontSize', label: '字号', control: 'number', min: 6, max: 72 },
      { key: 'cellFontFamily', label: '字体', control: 'select', options: FONT_OPTIONS },
      { key: 'cellFontColor', label: '字色', control: 'color' },
      { key: 'cellTextAlign', label: '对齐', control: 'select', options: CELL_ALIGN_OPTIONS }
    ]
  },
  {
    title: '单元格内容',
    hint: '(双击画布中的单元格也可编辑)',
    fields: [
      { control: 'cellGrid' }
    ]
  }
]

// ---------------------------------------------------------------------------
// 元件注册表：新增元件只需在此数组中追加一项
// ---------------------------------------------------------------------------
export const ELEMENT_TYPES = [
  {
    type: 'text',
    label: '文本',
    icon: 'Document',
    defaultSize: { width: 100, height: 24 },
    defaultProps: { content: '双击编辑', fontSize: 14, fontFamily: 'Arial', color: '#000000', bold: false, italic: false },
    component: TextElement,
    propertyGroups: TEXT_PROPERTY_GROUPS,
    render: (ctx, el) => {
      ctx.fillStyle = el.color || '#000'
      ctx.font = `${el.italic ? 'italic ' : ''}${el.bold ? 'bold ' : ''}${el.fontSize || 14}px ${el.fontFamily || 'Arial'}`
      ctx.textBaseline = 'top'
      ctx.fillText(el.content || '', 0, 0)
    }
  },
  {
    type: 'rect',
    label: '矩形',
    icon: 'FullScreen',
    defaultSize: { width: 80, height: 60 },
    defaultProps: { fillColor: '#ffffff', strokeColor: '#000000', strokeWidth: 1 },
    component: RectElement,
    propertyGroups: SHAPE_PROPERTY_GROUPS,
    render: (ctx, el) => {
      if (el.fillColor && el.fillColor !== 'transparent') { ctx.fillStyle = el.fillColor; ctx.fillRect(0, 0, el.width, el.height) }
      if (el.strokeWidth) { ctx.strokeStyle = el.strokeColor || '#000'; ctx.lineWidth = el.strokeWidth; ctx.strokeRect(0, 0, el.width, el.height) }
    }
  },
  {
    type: 'circle',
    label: '圆形',
    icon: 'CircleCheck',
    defaultSize: { width: 60, height: 60 },
    defaultProps: { fillColor: '#ffffff', strokeColor: '#000000', strokeWidth: 1 },
    component: CircleElement,
    propertyGroups: SHAPE_PROPERTY_GROUPS,
    render: (ctx, el) => {
      ctx.beginPath()
      ctx.ellipse(el.width / 2, el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2)
      if (el.fillColor && el.fillColor !== 'transparent') { ctx.fillStyle = el.fillColor; ctx.fill() }
      if (el.strokeWidth) { ctx.strokeStyle = el.strokeColor || '#000'; ctx.lineWidth = el.strokeWidth; ctx.stroke() }
    }
  },
  {
    type: 'line',
    label: '线条',
    icon: 'Minus',
    defaultSize: { width: 100, height: 4 },
    defaultProps: { strokeColor: '#000000', strokeWidth: 2 },
    component: LineElement,
    propertyGroups: LINE_PROPERTY_GROUPS,
    render: (ctx, el) => {
      ctx.beginPath(); ctx.moveTo(0, el.height / 2); ctx.lineTo(el.width, el.height / 2)
      ctx.strokeStyle = el.strokeColor || '#000'; ctx.lineWidth = el.strokeWidth || 2; ctx.stroke()
    }
  },
  {
    type: 'image',
    label: '图片',
    icon: 'Picture',
    defaultSize: { width: 80, height: 80 },
    defaultProps: { src: 'https://picsum.photos/100/100' },
    component: ImageElement,
    propertyGroups: IMAGE_PROPERTY_GROUPS,
    render: async (ctx, el) => {
      if (el.imageData) {
        const img = new Image(); img.src = el.imageData
        await new Promise(r => { img.onload = r; img.onerror = r })
        ctx.drawImage(img, 0, 0, el.width, el.height)
      }
    }
  },
  {
    type: 'barcode',
    label: '条码',
    icon: 'Postcard',
    defaultSize: { width: 150, height: 60 },
    defaultProps: { content: '123456789', format: 'CODE128', showText: true },
    component: BarcodeElement,
    propertyGroups: BARCODE_PROPERTY_GROUPS,
    render: (ctx, el) => {
      try {
        const bcCanvas = document.createElement('canvas')
        JsBarcode(bcCanvas, el.content || '123456', { format: el.format || 'CODE128', displayValue: el.showText !== false })
        ctx.drawImage(bcCanvas, 0, 0, el.width, el.height)
      } catch (e) { console.error(e) }
    }
  },
  {
    type: 'qrcode',
    label: '二维码',
    icon: 'Grid',
    defaultSize: { width: 80, height: 80 },
    defaultProps: { content: 'https://example.com', errorLevel: 'M' },
    component: QrcodeElement,
    propertyGroups: QRCODE_PROPERTY_GROUPS,
    render: async (ctx, el) => {
      try {
        const qrCanvas = document.createElement('canvas')
        await QRCode.toCanvas(qrCanvas, el.content || 'https://example.com', { width: el.width, errorCorrectionLevel: el.errorLevel || 'M' })
        ctx.drawImage(qrCanvas, 0, 0, el.width, el.height)
      } catch (e) { console.error(e) }
    }
  },
  {
    type: 'table',
    label: '表格',
    icon: 'Grid',
    defaultSize: { width: 200, height: 120 },
    defaultProps: { rows: 3, cols: 3, borderWidth: 1, borderColor: '#000000', cellFontSize: 12, cellFontFamily: 'Arial', cellFontColor: '#000000', cellTextAlign: 'center', cells: {} },
    component: TableElement,
    propertyGroups: TABLE_PROPERTY_GROUPS,
    render: (ctx, el) => {
      const rows = el.rows || 3
      const cols = el.cols || 3
      const bw = el.borderWidth || 1
      const bc = el.borderColor || '#000000'
      const cellW = el.width / cols
      const cellH = el.height / rows
      const padding = 4
      ctx.strokeStyle = bc
      ctx.lineWidth = bw
      ctx.strokeRect(bw / 2, bw / 2, el.width - bw, el.height - bw)
      for (let r = 1; r < rows; r++) {
        ctx.beginPath()
        ctx.moveTo(0, r * cellH)
        ctx.lineTo(el.width, r * cellH)
        ctx.stroke()
      }
      for (let c = 1; c < cols; c++) {
        ctx.beginPath()
        ctx.moveTo(c * cellW, 0)
        ctx.lineTo(c * cellW, el.height)
        ctx.stroke()
      }
      const fontSize = el.cellFontSize || 12
      const fontFamily = el.cellFontFamily || 'Arial'
      const textAlign = el.cellTextAlign || 'center'
      ctx.fillStyle = el.cellFontColor || '#000000'
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.textAlign = textAlign
      ctx.textBaseline = 'middle'
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const text = (el.cells && el.cells[r] && el.cells[r][c]) || ''
          if (text) {
            let x
            if (textAlign === 'left') x = c * cellW + padding
            else if (textAlign === 'right') x = (c + 1) * cellW - padding
            else x = c * cellW + cellW / 2
            const y = r * cellH + cellH / 2
            ctx.fillText(text, x, y)
          }
        }
      }
    }
  }
]

// ---------------------------------------------------------------------------
// 查询辅助函数（供元件库、画布、图层面板、属性面板、导出逻辑统一使用）
// ---------------------------------------------------------------------------
const ELEMENT_TYPE_MAP = Object.fromEntries(ELEMENT_TYPES.map(item => [item.type, item]))

export const getElementDef = (type) => ELEMENT_TYPE_MAP[type]

/** 画布上渲染该元件所用的 Vue 组件（组件映射） */
export const getElementComponent = (type) => ELEMENT_TYPE_MAP[type]?.component || 'div'

/** 图层列表 / 元件库图标 */
export const getElementIcon = (type) => ELEMENT_TYPE_MAP[type]?.icon || 'Document'

/** 图层列表 / 元件库名称 */
export const getElementLabel = (type) => ELEMENT_TYPE_MAP[type]?.label

/** 拖到画布时的默认尺寸 */
export const getDefaultSize = (type) => ELEMENT_TYPE_MAP[type]?.defaultSize || { width: 100, height: 40 }

/** 拖到画布时的默认属性 */
export const getDefaultProps = (type) => ELEMENT_TYPE_MAP[type]?.defaultProps || {}

/** 属性面板的分类分支 */
export const getPropertyGroups = (type) => ELEMENT_TYPE_MAP[type]?.propertyGroups || []

/** 汇总所有元件的默认属性，用于属性面板表单初始化 */
export const getAllDefaultProps = () => ELEMENT_TYPES.reduce((acc, item) => {
  Object.assign(acc, item.defaultProps)
  return acc
}, {})

/** 导出 PNG / BMP 时在离屏 canvas 上绘制单个元件 */
export const renderElementToCanvas = async (ctx, el) => {
  await ELEMENT_TYPE_MAP[el.type]?.render?.(ctx, el)
}
