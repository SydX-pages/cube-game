const GestureCheck = ({ showGes, setShowGes }) => (
  <div className="switch-item">
    <label className="switch">
      <input
        type="checkbox"
        checked={showGes}
        onChange={(e) => setShowGes(e.target.checked)}
      />
      <span className="switch-track" aria-hidden="true" />
      <span className="switch-label">手势检测</span>
    </label>
    {showGes && (
      <ul className="gesture-guide">
        <li>握拳：观察模式</li>
        <li>张开手掌：旋转模式</li>
        <li>数字1：正向选择/旋转</li>
        <li>数字2：负向选择/旋转</li>
      </ul>
    )}
  </div>
);

export default GestureCheck;
