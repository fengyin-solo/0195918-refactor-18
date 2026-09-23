import TextElement from '@/components/Canvas/elements/TextElement.vue'
import RectElement from '@/components/Canvas/elements/RectElement.vue'
import CircleElement from '@/components/Canvas/elements/CircleElement.vue'
import LineElement from '@/components/Canvas/elements/LineElement.vue'
import ImageElement from '@/components/Canvas/elements/ImageElement.vue'
import BarcodeElement from '@/components/Canvas/elements/BarcodeElement.vue'
import QrcodeElement from '@/components/Canvas/elements/QrcodeElement.vue'
import TableElement from '@/components/Canvas/elements/TableElement.vue'

/**
 * 元件类型统一定义。
 *
 * 新增一种元件时只需在本数组中添加一项，元件库列表、拖入画布的默认
 * 尺寸、画布组件映射、图层名称与图标、属性面板分组都会自动生效：
 * - type:          类型标识（唯一）
 * - label:         元件库与图层列表中显示的名称
 * - icon:          Element Plus 图标名
 * - defaultProps:  拖入画布时的默认属性
 * - defaultSize:   拖入画布时的默认尺寸
 * - component:     画布中渲染该元件使用的组件
 * - propertyGroups: 属性面板中显示的分组，可选值：
 *   text / shape / line / image / barcode / qrcode / table / tableCells
 */
export const ELEMENT_TYPES = [
  {
    type: 'text',
    label: '文本',
    icon: 'Document',
    defaultProps: { content: '双击编辑', fontSize: 14, fontFamily: 'Arial', color: '#000000', bold: false, italic: false },
    defaultSize: { width: 100, height: 24 },
    component: TextElement,
    propertyGroups: ['text']
  },
  {
    type: 'rect',
    label: '矩形',
    icon: 'FullScreen',
    defaultProps: { fillColor: '#ffffff', strokeColor: '#000000', strokeWidth: 1 },
    defaultSize: { width: 80, height: 60 },
    component: RectElement,
    propertyGroups: ['shape']
  },
  {
    type: 'circle',
    label: '圆形',
    icon: 'CircleCheck',
    defaultProps: { fillColor: '#ffffff', strokeColor: '#000000', strokeWidth: 1 },
    defaultSize: { width: 60, height: 60 },
    component: CircleElement,
    propertyGroups: ['shape']
  },
  {
    type: 'line',
    label: '线条',
    icon: 'Minus',
    defaultProps: { strokeColor: '#000000', strokeWidth: 2 },
    defaultSize: { width: 100, height: 4 },
    component: LineElement,
    propertyGroups: ['line']
  },
  {
    type: 'image',
    label: '图片',
    icon: 'Picture',
    defaultProps: { src: 'https://picsum.photos/100/100' },
    defaultSize: { width: 80, height: 80 },
    component: ImageElement,
    propertyGroups: ['image']
  },
  {
    type: 'barcode',
    label: '条码',
    icon: 'Postcard',
    defaultProps: { content: '123456789', format: 'CODE128', showText: true },
    defaultSize: { width: 150, height: 60 },
    component: BarcodeElement,
    propertyGroups: ['barcode']
  },
  {
    type: 'qrcode',
    label: '二维码',
    icon: 'Grid',
    defaultProps: { content: 'https://example.com', errorLevel: 'M' },
    defaultSize: { width: 80, height: 80 },
    component: QrcodeElement,
    propertyGroups: ['qrcode']
  },
  {
    type: 'table',
    label: '表格',
    icon: 'Grid',
    defaultProps: { rows: 3, cols: 3, borderWidth: 1, borderColor: '#000000', cellFontSize: 12, cellFontFamily: 'Arial', cellFontColor: '#000000', cellTextAlign: 'center', cells: {} },
    defaultSize: { width: 200, height: 120 },
    component: TableElement,
    propertyGroups: ['table', 'tableCells']
  }
]

const DEFAULT_ICON = 'Document'
const DEFAULT_SIZE = { width: 100, height: 40 }

export const getElementDef = (type) => ELEMENT_TYPES.find(e => e.type === type)

export const getElementComponent = (type) => getElementDef(type)?.component || 'div'

export const getElementIcon = (type) => getElementDef(type)?.icon || DEFAULT_ICON

export const getElementLabel = (type) => getElementDef(type)?.label || type

export const getDefaultSize = (type) => getElementDef(type)?.defaultSize || DEFAULT_SIZE

export const hasPropertyGroup = (type, group) => (getElementDef(type)?.propertyGroups || []).includes(group)
