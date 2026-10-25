import { Cube } from "../cube/Cube";
import { useEffect, useRef } from "react";
import "../style/CubeView.css";

const CubeView = ({ order, cubeRef, showAxes }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    container.replaceChildren();

    const cube = new Cube(order, container);
    cubeRef.current = cube;

    cube.genAxesHelper();
    cube.axesHelper.visible = showAxes;
  }, [order, showAxes]);

  return <div ref={containerRef} className="cube-view" />;
};

export default CubeView;
