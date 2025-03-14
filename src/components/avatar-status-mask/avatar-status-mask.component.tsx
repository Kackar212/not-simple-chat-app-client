import { useRef } from "react";

type Size = {
  size: number;
  status: number;
  stroke: number;
  offset: number;
};

interface AvatarStatusMaskProps {
  size: Size;
}

const getAvatarMaskProps = ({ size }: Size) => {
  const value = size / (2 * size);

  return {
    cx: value,
    cy: value,
    r: value,
  };
};

const getStatusMaskProps = ({ size, status, offset, stroke }: Size) => {
  const statusSize = status / 2;
  const center = (size - statusSize - offset) / size;
  const radius = (statusSize + stroke) / size;

  return {
    cx: center,
    cy: center,
    r: radius,
  };
};

export function AvatarStatusMask({ size }: AvatarStatusMaskProps) {
  const { current: avatarMaskProps } = useRef(getAvatarMaskProps(size));
  const { current: statusMaskProps } = useRef(getStatusMaskProps(size));

  return (
    <mask
      id={`avatar-status-mask-${size.size}`}
      maskContentUnits="objectBoundingBox"
      viewBox="0 0 1 1"
    >
      <circle fill="white" {...avatarMaskProps}></circle>
      <circle fill="black" {...statusMaskProps}></circle>
    </mask>
  );
}
