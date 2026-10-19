import * as THREE from "three";

class Cube {
  constructor(n, container) {
    ({
      // THREE
      scene: this.scene,
      camera: this.camera,
      canvas: this.canvas,

      // Cube
      cubeGroup: this.cubeGroup,
      rotateGroup: this.rotateGroup,
    } = this.canvaInit(container));

    // Cube
    this.n = n;
    this.cubes = [];
    this.cubeSize = 0.9;
    this.cubeSpace = 0.1;
    this.cubeLen = this.cubeSize + this.cubeSpace;
    this.mode = "view";
    this.selected = 0;

    this.layer = this.genLayer();
    this.cubeInit();
  }

  genLayer = () => {
    const layer = [{ face: null, value: 0 }];

    const pos = [];

    const range = Math.trunc(this.n / 2);
    for (let i = -range; i <= range; i++) {
      if (!(this.n % 2) && i === 0) continue;
      pos.push(i);
    }

    for (const face of ["x", "y", "z"]) {
      for (const value of pos) {
        layer.push({ face, value });
      }
    }

    return layer;
  };

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

    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });

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

  cubeInit = () => {
    const cubePos = (x) =>
      (this.n % 2
        ? Math.abs(x) * this.cubeLen
        : (Math.abs(x) - 0.5) * this.cubeLen) * Math.sign(x);

    const colors = [
      "#e53935", // 红
      "#f5c928", // 黄
      "#f5f3ed", // 暖白
      "#292929", // 深黑
      "#27ae60", // 绿
      "#2878d0", // 蓝
    ];

    const materials = colors.map(
      (c) => new THREE.MeshBasicMaterial({ color: c }),
    );
    const geometry = new THREE.BoxGeometry(
      this.cubeSize,
      this.cubeSize,
      this.cubeSize,
    );

    const n = this.n;
    const range = Math.trunc(n / 2);
    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        for (let z = -range; z <= range; z++) {
          if (!(this.n % 2) && (x === 0 || y === 0 || z === 0)) continue;

          const cube = new THREE.Mesh(geometry, materials);
          cube.position.set(cubePos(x), cubePos(y), cubePos(z));
          cube.userData.cubePos = { x, y, z };
          this.cubeGroup.add(cube);
          this.cubes.push(cube);

          const highlight = new THREE.Mesh(
            new THREE.BoxGeometry(
              this.cubeLen * 1.02,
              this.cubeLen * 1.02,
              this.cubeLen * 1.02,
            ),
            new THREE.MeshBasicMaterial({
              color: "#ff4f9a",
              transparent: true,
              opacity: 0.5,
            }),
          );
          highlight.visible = false;
          cube.add(highlight);
          cube.userData.highlight = highlight;
        }
      }
    }
  };

  select = (op) => {
    this.selected =
      (this.selected + op + this.layer.length) % this.layer.length;
    this.selectLayer();
  };

  rotate = (direction) => {
    const mapPos = (cube, face) => {
      const pos = cube.userData.cubePos;
      const { x, y, z } = pos;
      switch (face) {
        case "x":
          pos.y = -z * direction;
          pos.z = y * direction;
          break;
        case "y":
          pos.z = -x * direction;
          pos.x = z * direction;
          break;
        case "z":
          pos.x = -y * direction;
          pos.y = x * direction;
          break;
      }
    };

    const { face, value } = this.layer[this.selected];
    if (face === null) return;

    const selectedCubes = this.cubes.filter(
      (cube) => cube.userData.cubePos[face] === value,
    );
    this.rotateGroup.rotation[face] += (direction * Math.PI) / 2;
    for (const cube of selectedCubes) {
      mapPos(cube, face);
      this.cubeGroup.attach(cube);
    }

    this.selectLayer();
  };

  selectClear = () => {
    this.selected = 0;
    this.selectLayer();
  };
  selectLayer = () => {
    for (const cube of this.cubes) {
      this.cubeGroup.attach(cube);
    }

    this.rotateGroup.rotation.set(0, 0, 0);

    const { face, value } = this.layer[this.selected];

    for (const cube of this.cubes) {
      const isSelected = face !== null && cube.userData.cubePos[face] === value;
      cube.userData.highlight.visible = isSelected;
      if (isSelected) this.rotateGroup.attach(cube);
    }
  };

  genAxesHelper = () => {
    const group = new THREE.Group();

    const axes = new THREE.AxesHelper(3);
    group.add(axes);

    const createLabel = (text, color) => {
      const labCanvas = document.createElement("canvas");
      labCanvas.width = 128;
      labCanvas.height = 128;

      const ctx = labCanvas.getContext("2d");
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(text, 64, 64);

      const texture = new THREE.CanvasTexture(labCanvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.8, 0.4, 1);
      return sprite;
    };

    const xLabel = createLabel("+X", "#ff5555");
    xLabel.position.set(3, 0.5, 0.5);
    group.add(xLabel);

    const yLabel = createLabel("+Y", "#55dd77");
    yLabel.position.set(0.5, 3, 0.5);
    group.add(yLabel);

    const zLabel = createLabel("+Z", "#5599ff");
    zLabel.position.set(0.5, 0.5, 3);
    group.add(zLabel);

    this.axesHelper = group;
    this.cubeGroup.add(group);
  };
}

const setDragger = (cube) => {
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

const setKeyOps = (cube) => {
  window.addEventListener("keydown", (e) => {
    if (e.key.startsWith("Arrow")) e.preventDefault();

    if (e.key.toLowerCase() === "r") {
      cube.mode = "rotate";
      return;
    }
    if (e.key.toLowerCase() === "v" || e.key === "Escape") {
      cube.mode = "view";
      cube.selectClear();
      return;
    }

    if (cube.mode === "view") {
      switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
        case "w":
        case "d":
          cube.select(1);
          break;
        case "ArrowDown":
        case "ArrowLeft":
        case "s":
        case "a":
          cube.select(-1);
          break;
      }
    } else if (cube.mode === "rotate") {
      switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
        case "w":
        case "d":
          cube.rotate(1);
          break;
        case "ArrowDown":
        case "ArrowLeft":
        case "s":
        case "a":
          cube.rotate(-1);
          break;
      }
    }
  });
};

export { Cube, setDragger, setKeyOps };
