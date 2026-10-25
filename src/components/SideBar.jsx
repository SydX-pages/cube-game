import OrderSetter from "./OrderSetter";
import ModeBtn from "./ModeBtn";
import Instruction from "./Instruction";
import GestureCheck from "./GestureCheck";
import AxesCheck from "./AxesCheck";
import "../style/SideBar.css";

const SideBar = ({
  order,
  setOrder,
  mode,
  cubeRef,
  showAxes,
  setShowAxes,
  showGes,
  setShowGes,
}) => {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="brand-mark" aria-hidden="true" />
        <div>
          <h1>Cube Game</h1>
          <p>空间魔方实验室</p>
        </div>
      </header>

      <div className="sidebar-sections">
        <OrderSetter order={order} setOrder={setOrder} />
        <ModeBtn cubeRef={cubeRef} mode={mode} />

        <section className="panel">
          <h2 className="panel-title">显示选项</h2>
          <div className="switch-list">
            <GestureCheck showGes={showGes} setShowGes={setShowGes} />
            <AxesCheck showAxes={showAxes} setShowAxes={setShowAxes} />
          </div>
        </section>

        <Instruction />
      </div>
    </aside>
  );
};

export default SideBar;
