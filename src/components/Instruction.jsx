import "../style/Instruction.css";

const Instruction = () => (
  <section className="panel">
    <h2 className="panel-title">操作说明</h2>
    <ul className="instructions">
      <li>
        观察模式：方向键 / <kbd>W</kbd>
        <kbd>A</kbd>
        <kbd>S</kbd>
        <kbd>D</kbd> 选择要旋转的层
      </li>
      <li>
        旋转模式：方向键 / <kbd>W</kbd>
        <kbd>A</kbd>
        <kbd>S</kbd>
        <kbd>D</kbd> 旋转选中的层
      </li>
      <li>
        <kbd>R</kbd>：进入旋转模式
      </li>
      <li>
        <kbd>V</kbd> / <kbd>Esc</kbd>：进入观察模式
      </li>
      <li>拖拽画面旋转视角，滚轮缩放</li>
    </ul>
  </section>
);

export default Instruction;
