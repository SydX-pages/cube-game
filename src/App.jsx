import Gesture from "./components/Gesture.jsx";
import CubeView from "./components/CubeView.jsx";
import SideBar from "./components/SideBar.jsx";
import { useRef, useState } from "react";
import "./App.css";

const App = () => {
  const cubeRef = useRef(null);
  const [order, setOrder] = useState(2);
  const [showAxes, setShowAxes] = useState(false);
  const [showGes, setShowGes] = useState(false);
  const [mode, setMode] = useState("view");

  const handleGesture = (name) => {
    const cube = cubeRef.current;
    if (!cube) return;

    if (name === "Pointing_Up") {
      cube.transMode("view");
      cube.selectClear();
    } else if (name === "Victory") {
      cube.transMode("rotate");
    } else if (name === "Thumb_Up" || name === "Thumb_Down") {
      const direction = name === "Thumb_Up" ? 1 : -1;
      if (cube.mode === "view") cube.select(direction);
      else cube.rotate(direction);
    }
  };

  return (
    <div className="app">
      <SideBar
        order={order}
        setOrder={setOrder}
        mode={mode}
        cubeRef={cubeRef}
        showAxes={showAxes}
        setShowAxes={setShowAxes}
        showGes={showGes}
        setShowGes={setShowGes}
      />
      <main className="stage">
        <CubeView
        order={order}
        cubeRef={cubeRef}
        showAxes={showAxes}
        onModeChange={setMode}
      />
        {showGes && <Gesture onGesture={handleGesture} />}
      </main>
    </div>
  );
};

export default App;
