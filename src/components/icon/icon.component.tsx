import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";

export function Icon({
  children,
  width,
  height,
  badgeCount = 0,
  shape = "circle",
}: PropsWithChildren<{
  width: number;
  height: number;
  badgeCount?: number;
  shape: "circle" | "squircle";
}>) {
  const [id, setId] = useState("");

  useEffect(() => {
    setId(crypto.randomUUID());
  }, []);

  const circlePath =
    "M48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24Z";
  const squirclePath =
    "M0 24C0 16.5449 0 12.8174 1.21793 9.87706C2.84183 5.95662 5.95662 2.84183 9.87706 1.21793C12.8174 0 16.5449 0 24 0C31.4551 0 35.1826 0 38.1229 1.21793C42.0434 2.84183 45.1582 5.95662 46.7821 9.87706C48 12.8174 48 16.5449 48 24C48 31.4551 48 35.1826 46.7821 38.1229C45.1582 42.0434 42.0434 45.1582 38.1229 46.7821C35.1826 48 31.4551 48 24 48C16.5449 48 12.8174 48 9.87706 46.7821C5.95662 45.1582 2.84183 42.0434 1.21793 38.1229C0 35.1826 0 31.4551 0 24Z";

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        className="contain-paint top-0 left-0 absolute overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
      >
        <defs>
          <path
            d={shape === "squircle" ? squirclePath : circlePath}
            id={`${id}-blob-mask`}
            style={{
              scale: width === 24 ? 0.5 : 1,
            }}
          ></path>
          <rect
            id={`${id}-upper-badge-mask`}
            x={width - width / 2.4}
            y={width - height * 1.085}
            width={width / 2}
            height={width / 2}
            rx={width / 4}
            ry={width / 4}
            transform={`translate(${width / 2.4} -${width / 2.4})`}
          ></rect>
          <rect
            id={`${id}-badge-mask`}
            x={Math.ceil(width - width / 2.4)}
            y={Math.ceil(width - height / 2.4)}
            width={width / 2}
            height={width / 2}
            rx={width / 4}
            ry={width / 4}
            transform="translate(0 0)"
          ></rect>
        </defs>
        <mask
          x={0}
          y={0}
          width={width}
          height={height}
          fill="black"
          id={`${id}-avatar-mask`}
        >
          <use href={`#${id}-blob-mask`} fill="white"></use>
          <use href={`#${id}-upper-badge-mask`} fill="black"></use>
          <use href={`#${id}-badge-mask`} fill="black"></use>
        </mask>
        <foreignObject
          x={0}
          y={0}
          width={width}
          height={height}
          mask={badgeCount > 0 ? `url(#${id}-avatar-mask)` : undefined}
        >
          {children}
        </foreignObject>
      </svg>
      {badgeCount > 0 && (
        <span className="absolute md:bottom-0 md:right-0 flex justify-center items-center font-medium bg-red-700 w-4 h-4 pb-[1px] text-white-0 text-sm rounded-lg scale-75 md:scale-100 -bottom-1 -right-1">
          {badgeCount}
        </span>
      )}
    </div>
  );
}
