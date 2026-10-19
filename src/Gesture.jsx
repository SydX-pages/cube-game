import { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

const LABELS = {
  None: "无手势",
  Closed_Fist: "握拳",
  Open_Palm: "张开手掌",
  Pointing_Up: "数字 1",
  Thumb_Down: "拇指向下",
  Thumb_Up: "拇指向上",
  Victory: "数字 2",
  ILoveYou: "爱你",
};

const ACTIONABLE = new Set([
  "Pointing_Up",
  "Victory",
  "Thumb_Up",
  "Thumb_Down",
]);

const Gesture = ({ onGesture }) => {
  const videoRef = useRef(null);
  const onGestureRef = useRef(onGesture);

  const [name, setName] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onGestureRef.current = onGesture;
  });

  useEffect(() => {
    let cancelled = false;
    let recognizer = null;
    let stream = null;
    let raf = null;

    const main = async () => {
      const video = videoRef.current;
      if (!video) return;

      // 1. 先打开摄像头，保证即使识别器初始化失败也能看到画面
      try {
        // WebKitGTK 会把 width/height 当作严格约束而报 OverconstrainedError，
        // 因此优先用 video: true，失败再退回简单约束。
        const attempts = [
          { video: true, audio: false },
          {
            video: { width: { ideal: 320 }, height: { ideal: 240 } },
            audio: false,
          },
        ];

        let lastError;
        for (const constraints of attempts) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (e) {
            lastError = e;
          }
        }

        if (!stream) throw lastError;

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        video.srcObject = stream;
        await video.play();
      } catch (e) {
        if (!cancelled) setError(`无法打开摄像头：${e?.message ?? e}`);
        return;
      }

      // 2. 初始化识别器（CPU delegate，避免 WebGL/OpenGL 相关问题）
      try {
        const vision = await FilesetResolver.forVisionTasks("/wasm");

        recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/gesture_recognizer.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
      } catch (e) {
        if (!cancelled) setError(`识别器初始化失败：${e?.message ?? e}`);
        return;
      }

      if (cancelled) {
        recognizer.close();
        return;
      }

      setReady(true);

      const DETECT_INTERVAL = 100;
      const SCORE_MIN = 0.6; // 触发操作的最低置信度
      const TRIGGER_INTERVAL = 1000; // 手势操作的最小触发间隔(ms)
      let lastDetect = 0;
      let lastActionTime = 0;

      const detect = (now) => {
        if (cancelled) return;

        const due = now - lastDetect >= DETECT_INTERVAL;
        if (due && video.readyState >= 2 && video.currentTime > 0) {
          lastDetect = now;
          try {
            const result = recognizer.recognizeForVideo(
              video,
              performance.now(),
            );
            const gesture = result.gestures?.[0]?.[0];
            const category = gesture?.categoryName ?? null;

            setName(category);
            setScore(gesture ? gesture.score : 0);

            // 手势 -> 操作：间隔限流，任意两次触发至少相隔 TRIGGER_INTERVAL
            if (
              category &&
              gesture.score >= SCORE_MIN &&
              ACTIONABLE.has(category)
            ) {
              const nowMs = performance.now();
              if (nowMs - lastActionTime >= TRIGGER_INTERVAL) {
                lastActionTime = nowMs;
                onGestureRef.current?.(category);
              }
            }
          } catch {}
        }

        raf = requestAnimationFrame(detect);
      };

      raf = requestAnimationFrame(detect);
    };

    main();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (recognizer) recognizer.close();
    };
  }, []);

  const recognized = name && name !== "None";

  return (
    <div className="gesture">
      <video ref={videoRef} autoPlay playsInline muted />

      <div className="gesture-result">
        {error ? (
          <span className="gesture-empty">{error}</span>
        ) : !ready ? (
          <span className="gesture-empty">模型加载中…</span>
        ) : recognized ? (
          <>
            <span className="gesture-name">{LABELS[name] ?? name}</span>
            <span className="gesture-score">{(score * 100).toFixed(0)}%</span>
          </>
        ) : (
          <span className="gesture-empty">未检测到手势</span>
        )}
      </div>
    </div>
  );
};

export default Gesture;
