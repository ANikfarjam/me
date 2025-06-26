// components/TriangleMesh.js
import { useRef, useEffect } from "react";

export default function TriangleMesh() {
  return (
    <>
      <style>{`
        .luxury-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #0e0e0e;
          z-index: -1;
          overflow: hidden;
        }

        .gold-line {
          position: absolute;
          width: 2px;
          height: 200%;
          background: linear-gradient(to bottom, #f5d067, #c08f2a, #f5d067);
          box-shadow: 0 0 10px #ffcc00, 0 0 25px #ffcc00;
          opacity: 0.9;
          animation: glow 3s ease-in-out infinite alternate;
          transform-origin: center;
        }

        .line1 {
          top: -50%;
          left: 15%;
          transform: rotate(45deg);
        }

        .line2 {
          top: -50%;
          left: 50%;
          transform: rotate(45deg);
        }

        .line3 {
          top: -50%;
          left: 85%;
          transform: rotate(45deg);
        }

        @keyframes glow {
          from {
            box-shadow: 0 0 10px #ffcc00, 0 0 20px #ffcc00;
            opacity: 0.8;
          }
          to {
            box-shadow: 0 0 25px #ffcc00, 0 0 50px #ffcc00;
            opacity: 1;
          }
        }
      `}</style>

      <div className="luxury-bg">
        <div className="gold-line line1"></div>
        <div className="gold-line line2"></div>
        <div className="gold-line line3"></div>
      </div>
    </>
  );
}
