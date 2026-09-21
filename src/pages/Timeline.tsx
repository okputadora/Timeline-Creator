import React, { useRef, useState, useEffect } from 'react';
import styles from './Timeline.module.css';

const sampleData = [
  { start: -3000, end: -2000, label: 'Invention of Writing' },
  { start: -2900, end: -2100, label: 'Bronze Age Expansion' },
  { start: -2800, end: -2200, label: 'Early Empires' },
  { start: -2700, end: -2300, label: 'First Cities' },
  { start: -2600, end: -2400, label: 'Ancient Trade Routes' },
  { start: -2500, end: -2000, label: 'Pyramids Built' },
  { start: -776, end: -393, label: 'Ancient Olympic Games' },
  { start: -750, end: -400, label: 'Greek City-States' },
  { start: -700, end: -500, label: 'Rise of Sparta' },
  { start: -650, end: -450, label: 'Early Democracy' },
  { start: 1096, end: 1291, label: 'Crusades' },
  { start: 1100, end: 1200, label: 'Medieval Universities' },
  { start: 1150, end: 1250, label: 'Gothic Cathedrals' },
  { start: 1914, end: 1918, label: 'World War I' },
  { start: 1915, end: 1917, label: 'Gallipoli Campaign' },
  { start: 1916, end: 1918, label: 'Battle of the Somme' },
  { start: 1939, end: 1945, label: 'World War II' },
  { start: 1941, end: 1945, label: 'Eastern Front' },
  { start: 1942, end: 1945, label: 'Pacific War' },
  { start: 1944, end: 1945, label: 'Battle of the Bulge' },
];

const INITIAL_RANGE = 10000;
const MIN_SPAN = 1;
const MAX_SPAN = 40000;

// -------------------------------
// Utility mapping functions
// -------------------------------
function yearToX(year: number, range: { startYear: number; endYear: number }, width: number) {
  return ((year - range.startYear) / (range.endYear - range.startYear)) * width;
}

function xToYear(x: number, range: { startYear: number; endYear: number }, width: number) {
  return range.startYear + (x / width) * (range.endYear - range.startYear);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Adjust tick density based on zoom
function getTickSpacing(span: number) {
  if (span > 16000) return 200;
  // if (span > 15000) return 500
  if (span > 9000) return 100;
  if (span > 4000) return 50;
  if (span > 2000) return 20;
  if (span > 700) return 10;
  if (span > 400) return 5;
  if (span > 100) return 2.5;
  if (span > 25) return 0.5;

  return 1;
}

// Animation steps: each step defines target span, speed (years/frame), and pause (ms)
const animationSteps = [
  { targetSpan: 500, speed: 20, pause: 1 },
  { targetSpan: 5000, speed: 60, pause: 2 },
  { targetSpan: 20000, speed: 120, pause: 10 },
  { targetSpan: 1000, speed: 40, pause: 1200 },
  // Add more steps as needed
];

// -------------------------------
// Main Component
// -------------------------------
export function Timeline() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(window.innerHeight);
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
        setHeight(containerRef.current.clientHeight);
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const [range, setRange] = useState({
    startYear: -INITIAL_RANGE,
    endYear: INITIAL_RANGE,
  });

  // Animation state
  const animationRef = useRef<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [animStepIdx, setAnimStepIdx] = useState(0);
  const [pauseUntil, setPauseUntil] = useState<number | null>(null);

  // Animation effect
  useEffect(() => {
    if (!animating || animStepIdx >= animationSteps.length) return;

    function animate() {
      setRange((prev) => {
        const step = animationSteps[animStepIdx];
        const span = prev.endYear - prev.startYear;
        const center = (prev.startYear + prev.endYear) / 2;

        // If already at target span, pause
        if (Math.abs(span - step.targetSpan) < 1) {
          if (pauseUntil === null) {
            setPauseUntil(Date.now() + step.pause);
          } else if (Date.now() >= pauseUntil) {
            setPauseUntil(null);
            setAnimStepIdx((idx) => idx + 1);
          }
          return prev;
        }

        // Animate towards target span
        let newSpan = span;
        if (span < step.targetSpan) {
          newSpan = Math.min(span + step.speed, step.targetSpan);
        } else {
          newSpan = Math.max(span - step.speed, step.targetSpan);
        }
        return {
          startYear: center - newSpan / 2,
          endYear: center + newSpan / 2,
        };
      });
      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animating, animStepIdx, pauseUntil]);

  // Start/stop animation controls (for demo)
  function startAnimation() {
    setAnimStepIdx(0);
    setAnimating(true);
    setPauseUntil(null);
  }
  function stopAnimation() {
    setAnimating(false);
    setPauseUntil(null);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }

  const isPanning = useRef(false);
  const lastMouseX = useRef(0);
  function onMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    isPanning.current = true;
    lastMouseX.current = e.clientX;
  }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setHoverX(x);

    if (!isPanning.current) return;

    const deltaX = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;

    const yearsPerPixel = span / width;
    const deltaYears = -deltaX * yearsPerPixel;

    setRange((prev) => ({
      startYear: prev.startYear + deltaYears,
      endYear: prev.endYear + deltaYears,
    }));
  }

  function onMouseUp() {
    isPanning.current = false;
  }

  const [hoverX, setHoverX] = useState<number | null>(null);

  const span = range.endYear - range.startYear;
  const tickSpacing = getTickSpacing(span);

  // Logging span and tickSpacing
  // useEffect(() => {
  //   console.log("span:", span, "tickSpacing:", tickSpacing)
  // }, [span, tickSpacing])

  // -------------------------------
  // Zoom handler (cursor-centered)
  // -------------------------------
  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;

    const hoveredYear = xToYear(mouseX, range, width);
    const newSpan = clamp(span * zoomFactor, MIN_SPAN, MAX_SPAN);

    const mouseRatio = mouseX / width;

    const newStart = hoveredYear - mouseRatio * newSpan;
    const newEnd = hoveredYear + (1 - mouseRatio) * newSpan;

    setRange({
      startYear: newStart,
      endYear: newEnd,
    });
  }

  // -------------------------------
  // Mouse move / leave
  // -------------------------------
  function onMouseLeave() {
    setHoverX(null);
  }

  // -------------------------------
  // Generate ticks
  // -------------------------------
  const ticks: number[] = [];
  const firstTick = Math.ceil(range.startYear / tickSpacing) * tickSpacing;

  for (let year = firstTick; year <= range.endYear; year += tickSpacing) {
    ticks.push(year);
  }

  const hoveredYear = hoverX !== null ? xToYear(hoverX, range, width) : null;

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div ref={containerRef} className={styles.timelineContainer}>
      {/* Animation controls */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
        {!animating ? (
          <button onClick={startAnimation}>Start Animation</button>
        ) : (
          <button onClick={stopAnimation}>Stop Animation</button>
        )}
        {animating && animStepIdx < animationSteps.length && (
          <span style={{ marginLeft: 10 }}>
            Step {animStepIdx + 1}/{animationSteps.length}
          </span>
        )}
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        onWheel={onWheel}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        className={styles.timelineSvg}
      >
        {/* Render sampleData events as bars above the timeline */}
        {(() => {
          // Improved overlap avoidance: keep raising until no overlap with any previous bar (time overlap or label overlap)
          const prevBars: { x1: number; x2: number; labelY: number; barY: number }[] = [];
          const barYBase = height - 90;
          const barHeight = 18;
          const labelGap = 90; // px between label centers to avoid label overlap
          const raisedOffset = 40; // px to raise bar and label if overlapping

          return sampleData.map((event) => {
            const x1 = yearToX(event.start, range, width);
            const x2 = yearToX(event.end, range, width);
            const left = Math.min(x1, x2);
            const right = Math.max(x1, x2);
            const centerX = (x1 + x2) / 2;

            // Keep raising until no overlap with any previous bar (either time overlap or label overlap)
            let bumpLevel = 0;
            let labelY, barY;
            while (true) {
              barY = barYBase - bumpLevel * raisedOffset;
              labelY = barY - 6;
              let overlaps = false;
              for (let i = 0; i < prevBars.length; ++i) {
                const prev = prevBars[i];
                // Check for time overlap (bar x ranges overlap) and vertical overlap
                const barsOverlap = !(right < prev.x1 || left > prev.x2);
                const verticalOverlap = Math.abs(barY - prev.barY) < barHeight + 2;
                // Also check for label overlap (centerX proximity and labelY proximity)
                const labelOverlap =
                  Math.abs(centerX - (prev.x1 + prev.x2) / 2) < labelGap &&
                  Math.abs(labelY - prev.labelY) < 18;
                if ((barsOverlap && verticalOverlap) || labelOverlap) {
                  overlaps = true;
                  break;
                }
              }
              if (!overlaps) break;
              bumpLevel += 1;
            }
            prevBars.push({ x1: left, x2: right, labelY, barY });

            return (
              <g key={event.label}>
                <rect
                  x={left}
                  y={barY}
                  width={right - left}
                  height={barHeight}
                  fill="#1976d2"
                  opacity={0.7}
                  rx={6}
                />
                <text
                  x={centerX}
                  y={labelY}
                  fontSize={13}
                  textAnchor="middle"
                  fill="#1976d2"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {event.label}
                </text>
              </g>
            );
          });
        })()}

        {/* Timeline baseline at bottom */}
        <line x1={0} y1={height - 60} x2={width} y2={height - 60} stroke="#999" />

        {/* Ticks */}
        {ticks.map((year) => {
          const x = yearToX(year, range, width);
          const isMajor = year % (tickSpacing * 10) === 0 || span <= 25;

          return (
            <g key={year}>
              <line
                x1={x}
                y1={isMajor ? height - 80 : height - 70}
                x2={x}
                y2={height - 60}
                stroke="#999"
              />
              {isMajor && <line x1={x} y1={height - 80} x2={x} y2={0} stroke="#333" />}
              {isMajor && (
                <text x={x} y={height - 35} fontSize={12} stroke="white" textAnchor="middle">
                  {year < 0 ? `${Math.abs(year)} BC` : year === 0 ? '0' : `${year} AD`}
                </text>
              )}
            </g>
          );
        })}

        {/* Hover indicator */}
        {hoverX !== null && hoveredYear !== null && (
          <>
            <line x1={hoverX} y1={0} x2={hoverX} y2={height} stroke="#aaa" strokeDasharray="4 4" />
            <rect x={hoverX - 45} y={height - 60 - 22} width={90} height={22} fill="black" rx={4} />
            <text x={hoverX} y={height - 60 - 7} fill="white" fontSize={12} textAnchor="middle">
              {hoveredYear < 0
                ? `${Math.round(Math.abs(hoveredYear))} BC`
                : `${Math.round(hoveredYear)} AD`}
            </text>
          </>
        )}
      </svg>

      <div className={styles.rangeInfo}>
        Range: {Math.round(range.startYear)} → {Math.round(range.endYear)}
      </div>
    </div>
  );
}
