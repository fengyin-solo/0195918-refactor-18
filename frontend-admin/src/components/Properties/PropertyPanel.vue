<template>
  <div class="property-panel card">
    <div class="section-title">属性设置</div>
    <div class="property-content" v-if="element">
      <el-form label-position="left" label-width="60px" size="small">
        <!-- 通用属性 -->
        <div class="property-group">
          <div class="group-title">位置与尺寸 <span class="hint">(单位: px, 不可超出画布)</span></div>
          <el-form-item label="X">
            <el-input-number v-model="formData.x" :min="0" :max="maxX" controls-position="right" @change="updateProp('x')" />
          </el-form-item>
          <el-form-item label="Y">
            <el-input-number v-model="formData.y" :min="0" :max="maxY" controls-position="right" @change="updateProp('y')" />
          </el-form-item>
          <el-form-item label="宽度">
            <el-input-number v-model="formData.width" :min="10" :max="maxWidth" controls-position="right" @change="updateProp('width')" />
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number v-model="formData.height" :min="10" :max="maxHeight" controls-position="right" @change="updateProp('height')" />
          </el-form-item>
          <el-form-item label="旋转">
            <el-input-number v-model="formData.rotation" :min="0" :max="360" :step="15" controls-position="right" @change="updateProp('rotation')" />
            <span class="unit">°</span>
          </el-form-item>
        </div>

        <!-- 元件专属属性：分类分支由元件注册表的 propertyGroups 字段描述符驱动 -->
        <div
          v-for="(group, gi) in propertyGroups"
          :key="gi"
          class="property-group"
        >
          <div class="group-title">
            {{ group.title }}
            <span v-if="group.hint" class="hint">{{ group.hint }}</span>
          </div>
          <template v-for="field in group.fields" :key="field.key || field.control">
            <!-- 图片上传（预览图位于表单项外，保持原有结构） -->
            <template v-if="field.control === 'upload'">
              <el-form-item :label="field.label">
                <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="image/*" @change="handleImageUpload">
                  <el-button type="primary" size="small">选择图片</el-button>
                </el-upload>
              </el-form-item>
              <div v-if="element.imageData" class="image-preview">
                <img :src="element.imageData" alt="预览" />
              </div>
            </template>

            <!-- 表格单元格内容编辑 -->
            <div v-else-if="field.control === 'cellGrid'" class="cell-editor-grid">
              <div v-for="r in formData.rows" :key="r" class="cell-editor-row">
                <div v-for="c in formData.cols" :key="c" class="cell-editor-item">
                  <el-input
                    :model-value="getCellText(r - 1, c - 1)"
                    size="small"
                    placeholder=""
                    @update:model-value="(val) => setCellText(r - 1, c - 1, val)"
                  />
                </div>
              </div>
            </div>

            <!-- 普通表单项 -->
            <el-form-item v-else :label="field.label">
              <el-input
                v-if="field.control === 'input'"
                v-model="formData[field.key]"
                @change="onFieldChange(field)"
              />
              <el-input-number
                v-else-if="field.control === 'number'"
                v-model="formData[field.key]"
                :min="field.min"
                :max="field.max"
                @change="onFieldChange(field)"
              />
              <el-color-picker
                v-else-if="field.control === 'color'"
                v-model="formData[field.key]"
                :show-alpha="field.showAlpha"
                @change="onFieldChange(field)"
              />
              <el-select
                v-else-if="field.control === 'select'"
                v-model="formData[field.key]"
                @change="onFieldChange(field)"
              >
                <el-option v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
              <el-checkbox
                v-else-if="field.control === 'checkbox'"
                v-model="formData[field.key]"
                @change="onFieldChange(field)"
              >{{ field.checkboxLabel }}</el-checkbox>
              <template v-else-if="field.control === 'checkboxes'">
                <el-checkbox
                  v-for="cb in field.checkboxes"
                  :key="cb.key"
                  v-model="formData[cb.key]"
                  @change="updateProp(cb.key)"
                >{{ cb.label }}</el-checkbox>
              </template>
            </el-form-item>
          </template>
        </div>

        <!-- 操作按钮 -->
        <div class="property-group">
          <div class="group-title">元件对齐 <span class="hint">(Ctrl+点击多选后可用)</span></div>
          <div class="align-buttons">
              <el-button size="small" :disabled="!canAlign" @click="alignElements('left')">
                左对齐
              </el-button>
              <el-button size="small" :disabled="!canAlign" @click="alignElements('center-h')">
                水平居中
              </el-button>
              <el-button size="small" :disabled="!canAlign" @click="alignElements('right')">
                右对齐
              </el-button>
          </div>
          <el-divider />
          <div class="action-buttons">
            <el-button size="small" @click="duplicate">复制元件</el-button>
            <el-button size="small" type="danger" @click="remove">删除元件</el-button>
          </div>
        </div>
      </el-form>
    </div>
    <el-empty v-else description="请选择元件" :image-size="80" />
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { getAllDefaultProps, getPropertyGroups } from '@/config/elementTypes'
import { ElMessage } from 'element-plus'

const store = useCanvasStore()
const element = computed(() => store.selectedElement)
const canAlign = computed(() => store.selectedElementIds.length >= 2)

// 属性面板分类分支来自元件注册表
const propertyGroups = computed(() => element.value ? getPropertyGroups(element.value.type) : [])

// 计算最大值限制
const maxX = computed(() => element.value ? store.canvasPixelWidth - element.value.width : store.canvasPixelWidth)
const maxY = computed(() => element.value ? store.canvasPixelHeight - element.value.height : store.canvasPixelHeight)
const maxWidth = computed(() => element.value ? store.canvasPixelWidth - element.value.x : store.canvasPixelWidth)
const maxHeight = computed(() => element.value ? store.canvasPixelHeight - element.value.y : store.canvasPixelHeight)

// 表单初始值由各元件在注册表中的默认属性汇总而来
const formData = reactive({
  x: 0, y: 0, width: 100, height: 40, rotation: 0,
  ...getAllDefaultProps()
})

watch(element, (el) => {
  if (el) {
    Object.keys(formData).forEach(key => {
      if (el[key] !== undefined) formData[key] = el[key]
    })
  }
}, { immediate: true, deep: true })

const updateProp = (key) => {
  if (element.value) {
    let value = formData[key]
    // 确保不超出画布
    if (key === 'x') value = Math.min(value, store.canvasPixelWidth - element.value.width)
    if (key === 'y') value = Math.min(value, store.canvasPixelHeight - element.value.height)
    if (key === 'width') value = Math.min(value, store.canvasPixelWidth - element.value.x)
    if (key === 'height') value = Math.min(value, store.canvasPixelHeight - element.value.y)
    store.updateElement(element.value.id, { [key]: value })
  }
}

// 字段描述符变更分发：默认走 updateProp，注册表中声明了自定义 change 的走对应处理器
const fieldChangeHandlers = {}
const onFieldChange = (field) => {
  const handler = field.change && fieldChangeHandlers[field.change]
  if (handler) handler(formData[field.key])
  else updateProp(field.key)
}

const handleImageUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    store.updateElement(element.value.id, { imageData: e.target.result })
    ElMessage.success('图片已上传')
  }
  reader.readAsDataURL(file.raw)
}

const getCellText = (row, col) => {
  const cells = formData.cells
  if (cells && cells[row] && cells[row][col] !== undefined) {
    return cells[row][col]
  }
  return ''
}

const setCellText = (row, col, text) => {
  const oldCells = formData.cells || {}
  const cells = {}
  for (const r in oldCells) {
    cells[r] = { ...oldCells[r] }
  }
  if (!cells[row]) cells[row] = {}
  cells[row][col] = text
  formData.cells = cells
  store.updateElement(element.value.id, { cells })
}

const rebuildCells = (newRows, newCols) => {
  const oldCells = formData.cells || {}
  const newCells = {}
  for (let r = 0; r < newRows; r++) {
    newCells[r] = {}
    for (let c = 0; c < newCols; c++) {
      if (oldCells[r] && oldCells[r][c] !== undefined) {
        newCells[r][c] = oldCells[r][c]
      }
    }
  }
  return newCells
}

// 表格行/列数变化时重建单元格内容（在注册表字段描述符中以 change: 'tableRows'/'tableCols' 引用）
fieldChangeHandlers.tableRows = (val) => {
  const cells = rebuildCells(val, formData.cols)
  formData.cells = cells
  store.updateElement(element.value.id, { rows: val, cells })
}

fieldChangeHandlers.tableCols = (val) => {
  const cells = rebuildCells(formData.rows, val)
  formData.cells = cells
  store.updateElement(element.value.id, { cols: val, cells })
}

const alignElements = (type) => {
  store.alignElements(type)
  ElMessage.success('对齐完成')
}

const duplicate = () => {
  store.duplicateElement(element.value.id)
  ElMessage.success('已复制')
}

const remove = () => {
  store.deleteElement(element.value.id)
  ElMessage.success('已删除')
}
</script>

<style lang="scss" scoped>
.property-panel { width: 260px; display: flex; flex-direction: column; overflow: hidden; }
.property-content { flex: 1; overflow-y: auto; padding: 12px; }

.property-group {
  margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ebeef5;
  &:last-child { border-bottom: none; }
}

.group-title {
  font-size: 13px; font-weight: 600; color: #303133; margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
  .hint { font-size: 11px; font-weight: normal; color: #909399; }
}

:deep(.el-form-item) {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  
  .el-form-item__label { padding-right: 8px; font-size: 12px; }
  .el-form-item__content { flex: 1; }
}

:deep(.el-input-number) { width: 100%; }
:deep(.el-select) { width: 100%; }
:deep(.el-input) { width: 100%; }

.unit { margin-left: 4px; font-size: 12px; color: #909399; }

.image-preview {
  margin-top: 8px; padding: 8px; background: #f5f7fa; border-radius: 4px;
  img { max-width: 100%; max-height: 100px; display: block; margin: 0 auto; }
}

.align-buttons {
  display: flex; gap: 8px; justify-content: center;
}

.action-buttons {
  display: flex; gap: 8px; justify-content: center;
}

.cell-editor-grid {
  max-height: 240px;
  overflow-y: auto;
}

.cell-editor-row {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.cell-editor-item {
  flex: 1;
  min-width: 0;
}

.cell-editor-item :deep(.el-input) {
  width: 100%;
}

.cell-editor-item :deep(.el-input__inner) {
  padding: 0 4px;
  text-align: center;
}
</style>
