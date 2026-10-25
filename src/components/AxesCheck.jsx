const AxesCheck = ({ showAxes, setShowAxes }) => (
  <div className="switch-item">
    <label className="switch">
      <input
        type="checkbox"
        checked={showAxes}
        onChange={(e) => setShowAxes(e.target.checked)}
      />
      <span className="switch-track" aria-hidden="true" />
      <span className="switch-label">显示坐标轴</span>
    </label>
    <p className="option-hint">
      当你被鼠标转换视角弄晕的时候，试试打开坐标轴，让 x
      轴向屏幕右侧、y轴向屏幕上方。
    </p>
  </div>
);

export default AxesCheck;
