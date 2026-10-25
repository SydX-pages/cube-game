const GestureCheck = ({ showGes, setShowGes }) => (
  <label className="switch">
    <input
      type="checkbox"
      checked={showGes}
      onChange={(e) => setShowGes(e.target.checked)}
    />
    <span className="switch-track" aria-hidden="true" />
    <span className="switch-label">手势检测</span>
  </label>
);

export default GestureCheck;
