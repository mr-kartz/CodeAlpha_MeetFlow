import { useEffect, useRef, useState } from "react";
import "../styles/whiteboard.css";

function Whiteboard({ onClose }) {
  const canvasRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [eraser, setEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 900;
    canvas.height = 550;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext("2d");

    ctx.beginPath();

    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

    ctx.strokeStyle = eraser ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;

    const ctx = canvasRef.current.getContext("2d");

    ctx.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );

    ctx.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const clearBoard = () => {
    const ctx = canvasRef.current.getContext("2d");

    ctx.fillStyle = "white";

    ctx.fillRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  const downloadBoard = () => {
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="whiteboard-overlay">
      <div className="whiteboard">

        <div className="whiteboard-header">
          <h2>✏️ Whiteboard</h2>

          <button onClick={onClose}>
            ❌
          </button>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        <div className="toolbar">

          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) =>
              setBrushSize(Number(e.target.value))
            }
          />

          <button onClick={() => setColor("#000000")}>
            ⚫
          </button>

          <button onClick={() => setColor("#2563eb")}>
            🔵
          </button>

          <button onClick={() => setColor("#ef4444")}>
            🔴
          </button>

          <button onClick={() => setColor("#22c55e")}>
            🟢
          </button>

          <button
            onClick={() => setEraser(!eraser)}
          >
            {eraser ? "✏️ Pen" : "🧽 Eraser"}
          </button>

          <button onClick={clearBoard}>
            🗑 Clear
          </button>

          <button onClick={downloadBoard}>
            💾 Save
          </button>

        </div>

      </div>
    </div>
  );
}

export default Whiteboard;