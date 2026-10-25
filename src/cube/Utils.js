import * as THREE from "three";

export class Utils {
  canvaInit = (container) => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const cubeGroup = new THREE.Group();
    const rotateGroup = new THREE.Group();

    scene.background = null;
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    const canvas = renderer.domElement;
    container.appendChild(canvas);

    scene.add(cubeGroup);
    cubeGroup.add(rotateGroup);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", resize);

    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();

        const distance = camera.position.length();

        const zoomSpeed = 0.005;
        const newDistance = distance + e.deltaY * zoomSpeed;

        const clamp = THREE.MathUtils.clamp(newDistance, 2, 20);

        camera.position.normalize().multiplyScalar(clamp);

        camera.lookAt(0, 0, 0);
      },
      { passive: false },
    );

    return { scene, camera, canvas, cubeGroup, rotateGroup };
  };

  setDragger = (cube) => {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    cube.canvas.addEventListener("pointerdown", (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    cube.canvas.addEventListener("pointermove", (e) => {
      if (!isDragging) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      cube.cubeGroup.rotation.x += dy * 0.01;
      cube.cubeGroup.rotation.y += dx * 0.01;

      lastX = e.clientX;
      lastY = e.clientY;
    });

    cube.canvas.addEventListener("pointerup", () => {
      isDragging = false;
    });
  };

  setKeyOps = (cube) => {
    window.addEventListener("keydown", (e) => {
      if (e.key.startsWith("Arrow")) e.preventDefault();

      if (e.key.toLowerCase() === "r") {
        cube.transMode("rotate");
        return;
      }
      if (e.key.toLowerCase() === "v" || e.key === "Escape") {
        cube.transMode("view");
        cube.selectClear();
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
        case "w":
        case "d":
          cube.step(1);
          break;
        case "ArrowDown":
        case "ArrowLeft":
        case "s":
        case "a":
          cube.step(-1);
          break;
      }
    });
  };
}
