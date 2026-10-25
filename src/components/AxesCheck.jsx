const AxesCheck = ({ showAxes, setShowAxes }) => (
  <label className="switch">
    <input
      type="checkbox"
      checked={showAxes}
      onChange={(e) => setShowAxes(e.target.checked)}
    />
    <span className="switch-track" aria-hidden="true" />
    <span className="switch-label">显示坐标轴</span>
  </label>
);

export default AxesCheck;
