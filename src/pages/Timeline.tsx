import React, { useEffect, useState, useMemo } from 'react';
import { BasicEvent } from '../components/BasicEvent';

import { searchWikipedia } from '../utils/wikiAPI';

const x = 5;
function getSpan(zoomLevel: number,): [number, number] {
  if (zoomLevel >= 1 && zoomLevel <= x) return [10000, 1000];
  if (zoomLevel >= x + 1 && zoomLevel <= 2 * x) return [5000, 500];
  if (zoomLevel >= 2 * x + 1 && zoomLevel <= 3 * x) return [2500, 250];
  if (zoomLevel >= 3 * x + 1 && zoomLevel <= 4 * x) return [1000, 100];
  if (zoomLevel >= 4 * x + 1 && zoomLevel <= 5 * x) return [500, 50];
  if (zoomLevel >= 5 * x + 1 && zoomLevel <= 6 * x) return [250, 25];
  if (zoomLevel >= 6 * x + 1 && zoomLevel <= 7 * x) return [100, 10];
  if (zoomLevel >= 7 * x + 1 && zoomLevel <= 8 * x) return [50, 5];
  if (zoomLevel >= 8 * x + 1 && zoomLevel <= 9 * x) return [20, 2];
  if (zoomLevel >= 9 * x + 1) return [10, 1];
  // if (zoomLevel >= 7 && zoomLevel <= 9) return [1000, 100];
  return [10000, 1000]; // fallback for other values
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
// function getSpan(zoomLevel: number): [number, number] {
//   const baseSpan = 10000;
//   const baseIncrement = 1000;
//   const block = Math.floor((zoomLevel - 1) / x); // which block of x levels
//   const span = baseSpan / Math.pow(2, block);
//   const increment = baseIncrement / Math.pow(2, block);
//   return [span, increment];
// }

const testData = [
  { title: 'Event 1', startYear: -3000, endYear: -2500 },
  { title: 'Event 2', startYear: -2500, endYear: -1000 },
  { title: 'Event 3', startYear: 0, endYear: 500 },
  { title: 'Event 4', startYear: -1500, endYear: 1600 }
] 

const renderEvents = (
  events: { title: string; startYear: number; endYear: number }[], 
  width: number, 
  baseSpan: number, 
  increment: number,
  localZoomLevel: number, 
  centerYear: number): React.ReactNode[] =>  {
    // console.log("rendering events")
  return events.map((event, index) => {
    const eventStartX = getXFromYear(event.startYear, width, baseSpan, increment, localZoomLevel, centerYear);
    const eventEndX = getXFromYear(event.endYear, width, baseSpan, increment, localZoomLevel, centerYear);
    const eventWidth = eventEndX - eventStartX;
    return (
      <BasicEvent
        key={index}
        event={{ title: event.title }}  
        x={eventStartX}
        y={10 + index * 60}  
        height={50}
        width={eventWidth}    
        />
    )
  })
}

export const Timeline: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [width, setWidth] = useState<number>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        console.log('setting width:', containerRef.current.clientWidth);
        setWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  useEffect(() => { 
    searchWikipedia("World War I").then(results => {
      console.log("Wiki Search Results:", results);
    });
  }, []);

  const [mouseX, setMouseX] = useState<number>(0);
  const localZoomLevel = ((Math.ceil(zoomLevel) - 1) % x) + 1;
  const [zoomMouseX, setZoomMouseX] = useState<number>(0);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomLevel((z) => Math.max(1, Math.min(100, z - e.deltaY * 0.01)));
      
      setZoomMouseX(mouseX)
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Timeline rendering logic
  const height = 100;
  const [baseSpan, increment] = getSpan(zoomLevel); // years
  
  // Track mouse X position over the SVG

  // Memoize ticks so it only recomputes when zoomLevel or width changes
  const ticks = useMemo(() => {
    function renderTicks(): React.ReactNode[] {
      const centerYear = 0;
      const span = baseSpan - ((localZoomLevel - 1) * increment)
      const ticks: React.ReactNode[] = [];
      console.log({ width, span, baseSpan, increment, localZoomLevel, centerYear });
      const incrementSize = width / span;
      const spanDiff = baseSpan - span;
      console.log({incrementSize, spanDiff});
      for (let count = 0; count <= baseSpan; count += increment) {
        const year = centerYear - baseSpan / 2 + count;
        const level = 0;
        const x = count * incrementSize - (spanDiff * incrementSize) / 2;
        // Only push ticks if x is within the visible range
        if (x > 0 && x < width + 20) {
          ticks.push(
            <g key={x + '-' + year}>
              <line
                x1={x}
                y1={100}
                x2={x}
                y2={level === 0 ? -1000 : 50}
                stroke="#333"
                strokeWidth={level === 0 ? 2 : 1}
              />
              <line
                x1={x}
                y1={40}
                x2={x}
                y2={level === 0 ? 60 : 50}
                stroke="#999"
                strokeWidth={level === 0 ? 2 : 1}
              />
              {level === 0 && (
                <text x={x} y={85} fontSize={12} textAnchor="middle" fill="#999">
                  {year >= 0 ? year + ' AD' : -year + ' BC'}
                </text>
              )}
            </g>,
          );
        }
        // render level 2 ticks 
        const tickCount = increment === 1 ? 12 : 5;
        const spacing = increment === 1 ? increment / 12 : increment / 5;
        for (let subCount = 0; subCount < tickCount; subCount++) {
          ticks.push(
            <g key={x + '-sub-' + subCount}>
              <line 
                x1={x + (subCount) * (spacing) * (width / span)}
                y1={55}
                x2={x + (subCount) * (spacing) * (width / span)}
                y2={45}
                stroke="#999"
                strokeWidth={1}
              />
              {increment === 1 && (
                <text 
                  x={x + (subCount) * (spacing) * (width / span)}
                  y={40}
                  fontSize={5}
                  textAnchor="middle"
                  fill="#999"
                >
                  {MONTHS[subCount]}
                </text>
              )}
            </g>
          )
        }
        // If spacing is large enough, add subdivision ticks
        //   if (spacing > subdivisionThreshold && yearsStep > 1) {
        //     const subYearsStep = yearsStep / 2;
        //     const subSpacing = spacing / 2;
        //     if (subYearsStep >= 1) {
        //       // Render subdivision ticks between this and next major tick
        //       const nextYear = year + yearsStep;
        //       if (nextYear <= end) {
        //         const midYear = year + subYearsStep;
        //         const midX = ((midYear - startYear) / (endYear - startYear)) * width;
        //         ticks.push(
        //           <g key={midYear + '-sub-' + level}>
        //             <line x1={midX} y1={45} x2={midX} y2={55} stroke="#bbb" strokeWidth={1} />
        //             {/* No label for subdivision ticks */}
        //           </g>,
        //         );
        //         // Recursively add further subdivisions
        //         ticks.push(
        //           ...renderTicks(
        //             year + subYearsStep,
        //             year + yearsStep - subYearsStep,
        //             subSpacing,
        //             subYearsStep,
        //             level + 1,
        //           ),
        //         );
        //       }
        //     }
        //   }
      }
      return ticks;
    }
    return renderTicks();
  }, [localZoomLevel, width, baseSpan, increment]);


  return (
    <div>

    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'end',
        width: '100vw',
        height: '90vh',
      }}
      onMouseMove={e => {
        const rect = (e.target as SVGSVGElement).getBoundingClientRect();
        setMouseX(e.clientX - rect.left);
      }}
    >
      {renderEvents(testData, width, baseSpan, increment, localZoomLevel, 0)}
      <div
        style={{ minWidth: '100vw'  }}
        ref={containerRef}
      >
        <svg
          width={width}
          height={height}
          style={{ display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setMouseX(0)}
        >
          <line x1={0} y1={50} x2={width} y2={50} stroke="#999" strokeWidth={2} />
          {ticks}
        </svg>
        
      </div>
    </div>
      <div>
        Year: {getYearFromX(mouseX, width, baseSpan, increment, localZoomLevel, 0).toFixed(0)}
        <div>TIMELINE (zoomLevel: {zoomLevel.toFixed(2)})</div>
        <div>(local zoomLevel: {localZoomLevel.toFixed(2)})</div>
      </div>
      </div>
  );
};


// these are both broken and incorrect
const getXFromYear = (year: number, width: number, baseSpan: number, increment: number, localZoomLevel: number, centerYear: number): number => {
  const span = baseSpan - ((localZoomLevel - 1) * (baseSpan / increment));
  const spanDiff = baseSpan - span;
  const x = ((year - (centerYear - baseSpan / 2)) * width / span) + (spanDiff * width / (2 * span));
  return x;
}

const getYearFromX = (mouseX: number, width: number, baseSpan: number, increment: number, localZoomLevel: number, centerYear: number): number => {
  const span = baseSpan - ((localZoomLevel - 1) * (baseSpan / increment));
  const spanDiff = baseSpan - span;
  const year = centerYear - baseSpan / 2 + (mouseX * span / width) + (spanDiff / 2);
  return year;
};