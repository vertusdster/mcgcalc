# 计算器界面核心优化要点

## 背景

本文档记录 `/src/components/sections/peptide-calculator.tsx` 在迁移和改造过程中的关键设计决策与优化实现，供后续维护参考。

---

## 1. 数字步进按钮（NumberInput 组件）

### 问题
原生 `<input type="number">` 的浏览器默认 spin 按钮太小（约 16px），移动端几乎无法点击，且无法定制样式。

### 方案
替换为自定义 `NumberInput` 组件，左右各一个 48×48px 的 `−` / `+` 按钮。

### 智能步进（smartStep）
步进幅度根据当前值量级自动调整，避免小值时步进过大、大值时步进过慢：

```ts
function smartStep(current: number, mode: "small" | "large"): number {
  const v = Math.abs(current);
  if (mode === "large") {      // 剂量字段（mcg 量级）
    if (v < 10)   return 1;
    if (v < 100)  return 10;
    if (v < 1000) return 50;
    return 100;
  }
  // 小量级：vial size / water volume（mg/mL）
  if (v < 1)  return 0.1;
  if (v < 10) return 0.5;
  return 1;
}
```

### 长按连续触发
- 按下 350ms 后开始连续触发，间隔 60ms（约 16次/秒）
- 使用 `onPointerDown` / `onPointerUp` / `onPointerLeave` 保证触控和鼠标都能正确松开

### 关键性能修复：避免闭包过期
**问题根因**：`useCallback` 依赖 `value` prop，`setInterval` 捕获的是旧函数，连按时读的始终是初始值，导致响应滞后。

**解决方案**：用 `useRef` 持有最新 `value` 和 `onChange`，interval 回调始终通过 ref 读取最新值：

```ts
const valueRef = useRef(value);
const onChangeRef = useRef(onChange);
valueRef.current = value;      // 每次 render 同步更新
onChangeRef.current = onChange;

const step = useCallback((dir: 1 | -1) => {
  const cur = Number(valueRef.current) || 0;  // 读最新值
  onChangeRef.current(format(clamp(cur + dir * smartStep(cur, stepMode))));
}, [stepMode, clamp]);
```

---

## 2. 注射器动画（AnimatedSyringe）性能优化

### 问题
快速连按时，每次值变化都触发 AnimatedSyringe 重渲染（约 104 个绝对定位 DOM 节点），造成明显卡顿。

### 方案：Debounce 注射器渲染
数字结果（单位数）实时更新，注射器动画延迟 120ms 后才刷新：

```ts
const [debouncedFill, setDebouncedFill] = useState(totalFillPercentage);
const [debouncedValid, setDebouncedValid] = useState(isTotalValid);

useEffect(() => {
  const t = setTimeout(() => {
    setDebouncedFill(totalFillPercentage);
    setDebouncedValid(isTotalValid);
  }, 120);
  return () => clearTimeout(t);
}, [totalFillPercentage, isTotalValid]);
```

效果：快速按按钮时注射器"冻结"，停手后平滑更新到最终位置。

---

## 3. 单位换算（注射用水）

### 规则
- `ml`：直接体积，1ml = 1mL
- `IU`：适用于 U-100 胰岛素注射器，**100 IU = 1 mL**

```ts
const waterMl = waterUnit === "IU" ? waterVolNum / 100 : waterVolNum;
```

### 注意
IU 不是通用体积单位，仅在 U-100 规格注射器语境下有意义。Tooltip 已注明：
> "Use ml for direct volume, or IU if measuring with a U-100 insulin syringe (100 IU = 1 mL)"

---

## 4. 超量程警示配色

| 状态 | 注射器条纹 | 含义 |
|---|---|---|
| 正常 | 青绿渐变 `#11696f → #2bb3ba` | 剂量在注射器容量内 |
| 超量 | 琥珀斜纹 `#f59e0b / #fde68a` | 超出容量，需调整 |

琥珀色（amber）为工业标准警告色，区别于红色（错误/危险），传达"注意，但非致命错误"的语义。

```css
repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 10px, #fde68a 10px, #fde68a 20px)
```

---

## 5. 可访问性（A11y）

| 元素 | 改动 |
|---|---|
| 注射器动画 | `role="img"` + 动态 `aria-label`（填充% + 有效性） |
| 单位切换按钮组 | `role="group"` + 每个按钮 `aria-pressed` |
| 结果区域 | `aria-live="polite" aria-atomic="true"` |
| +/− 按钮 | `aria-label="Increase" / "Decrease"` |

---

## 6. localStorage 保存记录

结构：
```ts
interface SavedCalculation {
  id: string;
  label: string;
  savedAt: string;        // ISO date
  syringeValue: number;   // 30 | 50 | 100
  waterVolume: number | string;
  waterUnit: "ml" | "IU";
  peptides: Peptide[];
}
```

- Key：`peptide-saved-calculations`
- Load 时为每个 peptide 重新生成 `id`，避免 key 冲突
- Save 仅在 `isTotalValid`（结果有效）时出现

---

## 7. 移除品名预设的原因

曾考虑添加品名快速选择（BPC-157、Semaglutide 等），自动填入默认 vial size 和 dose。  
**移除原因**：每种肽品的实际用量因研究方案不同差异极大，硬编码的默认值可能误导用户输入不适合自身的数值。计算器定位为**纯计算工具**，不提供剂量建议。
