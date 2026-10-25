import "../style/ModeBtn.css";

const ModeBtn = ({ cubeRef }) => {
  return (
    <section className="panel">
      <h2 className="panel-title">操作模式</h2>
      <div className="btn-row">
        <button
          type="button"
          className="btn"
          onClick={() => cubeRef.current?.transMode("view")}
        >
          观察模式
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => cubeRef.current?.transMode("rotate")}
        >
          旋转模式
        </button>
      </div>
      <div className="btn-row">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => cubeRef.current?.step(1)}
        >
          正向 +
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => cubeRef.current?.step(-1)}
        >
          负向 +
        </button>
      </div>
    </section>
  );
};

export default ModeBtn;
