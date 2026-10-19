import { useEffect, useRef, useState } from "react";
import { Cube, setDragger, setKeyOps } from "./Cube";
import "./App.css";
import Gesture from "./Gesture";

const ORDERS = [2, 3, 4, 5];
const FONT_SIZES = [
  { label: "小", value: 13 },
  { label: "中", value: 15 },
  { label: "大", value: 17 },
];

const App = () => {
  const cubeRef = useRef(null);

  const [order, setOrder] = useState(2);
  const [gesture, setGesture] = useState(false);
  const [showAxes, setShowAxes] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [mode, setMode] = useState("view");
  const [layer, setLayer] = useState({ face: null, value: 0 });

  // 手势 -> 操作
  const handleGesture = (name) => {
    const cube = cubeRef.current;
    if (!cube) return;

    if (name === "Pointing_Up") {
      cube.mode = "view";
      cube.selectClear();
    } else if (name === "Victory") {
      cube.mode = "rotate";
    } else if (name === "Thumb_Up" || name === "Thumb_Down") {
      const direction = name === "Thumb_Up" ? 1 : -1;
      if (cube.mode === "view") cube.select(direction);
      else cube.rotate(direction);
    }
  };

  return (
    <main className="app" style={{ "--fs": `${fontSize}px` }}>
      <header className="app-header">
        <h1>
          Cube<span>Game</span>
        </h1>
      </header>

      {gesture && <Gesture onGesture={handleGesture} />}
      <Utils
        cubeRef={cubeRef}
        order={order}
        setOrder={setOrder}
        gesture={gesture}
        setGesture={setGesture}
        showAxes={showAxes}
        setShowAxes={setShowAxes}
        fontSize={fontSize}
        setFontSize={setFontSize}
        mode={mode}
        layer={layer}
      />

      <CubeView
        cubeRef={cubeRef}
        order={order}
        showAxes={showAxes}
        onMode={setMode}
        onLayer={setLayer}
      />
    </main>
  );
};

const CubeView = ({ cubeRef, order, showAxes, onMode, onLayer }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    container.replaceChildren();

    const cube = new Cube(order, container);
    cubeRef.current = cube;

    cube.genAxesHelper();
    cube.axesHelper.visible = showAxes;

    setDragger(cube);
    setKeyOps(cube);

    // 同步键盘操作产生的状态（模式 / 当前层）到界面
    const timer = setInterval(() => {
      onMode(cube.mode);
      onLayer(cube.layer[cube.selected]);
    }, 100);

    return () => {
      clearInterval(timer);
      container.replaceChildren();
      if (cubeRef.current === cube) cubeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  // 坐标轴显示开关
  useEffect(() => {
    if (cubeRef.current) cubeRef.current.axesHelper.visible = showAxes;
  }, [showAxes, order, cubeRef]);

  return <div ref={containerRef} className="cube-view" />;
};

const Utils = ({
  cubeRef,
  order,
  setOrder,
  gesture,
  setGesture,
  showAxes,
  setShowAxes,
  fontSize,
  setFontSize,
  mode,
  layer,
}) => {
  const hasLayer = layer.face !== null;
  const [custom, setCustom] = useState("");

  const changeMode = (next) => {
    const cube = cubeRef.current;
    if (!cube) return;
    cube.mode = next;
    if (next === "view") cube.selectClear();
  };

  // view 模式选择层，rotate 模式旋转层
  const step = (direction) => {
    const cube = cubeRef.current;
    if (!cube) return;
    if (cube.mode === "view") cube.select(direction);
    else cube.rotate(direction);
  };

  const applyCustom = () => {
    const n = parseInt(custom, 10);
    if (!Number.isInteger(n)) return;
    setOrder(Math.min(Math.max(n, 2), 10));
  };

  return (
    <div className="utils">
      {/* 魔方的阶数 */}
      <section className="panel">
        <h2>阶数</h2>
        <div className="orders">
          {ORDERS.map((n) => (
            <button
              key={n}
              className={n === order ? "chip active" : "chip"}
              onClick={() => setOrder(n)}
            >
              {n}阶
            </button>
          ))}
        </div>
        <div className="order-input">
          <input
            type="number"
            min="2"
            max="10"
            placeholder="自定义阶数（2～10）"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyCustom();
            }}
          />
          <button className="chip" onClick={applyCustom}>
            设置
          </button>
        </div>
      </section>

      {/* 当前模式: view / rotate */}
      <section className="panel">
        <h2>模式</h2>
        <div className="modes">
          <button
            className={mode === "view" ? "chip active" : "chip"}
            onClick={() => changeMode("view")}
          >
            观察 View
          </button>
          <button
            className={mode === "rotate" ? "chip active" : "chip"}
            onClick={() => changeMode("rotate")}
          >
            旋转 Rotate
          </button>
        </div>
        <p className="layer-info">
          当前层：
          <span className={hasLayer ? "layer-badge" : "layer-badge empty"}>
            {hasLayer
              ? `${layer.face.toUpperCase()} = ${layer.value}`
              : "未选择"}
          </span>
        </p>

        <div className="directions">
          <button className="chip" onClick={() => step(1)}>
            正向 ＋
          </button>
          <button className="chip" onClick={() => step(-1)}>
            反向 －
          </button>
        </div>
        <p className="hint">
          {mode === "view" ? "正向/反向切换选中的层" : "正向/反向旋转选中的层"}
        </p>
      </section>

      {/* 显示选项 */}
      <section className="panel">
        <h2>显示</h2>
        <label className="switch">
          <input
            type="checkbox"
            checked={showAxes}
            onChange={(e) => setShowAxes(e.target.checked)}
          />
          <span>显示坐标轴</span>
        </label>
        <p className="hint">
          当你被鼠标转换视角弄晕的时候，试试打开坐标轴，让 x 轴向屏幕右侧、y
          轴向屏幕上方。
        </p>
        <label className="switch">
          <input
            type="checkbox"
            checked={gesture}
            onChange={(e) => setGesture(e.target.checked)}
          />
          <span>手势识别</span>
        </label>
        {gesture && (
          <p className="hint">
            比「1」→ 观察模式；比「2」→ 旋转模式；拇指向上 / 向下 →
            正向 / 反向操作
          </p>
        )}

        <p className="field-label">字号</p>
        <div className="modes">
          {FONT_SIZES.map((f) => (
            <button
              key={f.value}
              className={f.value === fontSize ? "chip active" : "chip"}
              onClick={() => setFontSize(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Helper */}
      <section className="panel helper">
        <h2>操作说明</h2>
        <ul>
          <li>
            <kbd>R</kbd> 进入 rotate 旋转模式
          </li>
          <li>
            <kbd>V</kbd> / <kbd>Esc</kbd> 返回 view 观察模式
          </li>
          <li>
            view：方向键 / <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> 选择要旋转的层
          </li>
          <li>
            rotate：方向键 / <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> 旋转选中的层
          </li>
          <li>拖拽画布旋转视角，滚轮缩放</li>
        </ul>
      </section>
    </div>
  );
};

export default App;
