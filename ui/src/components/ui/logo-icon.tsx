import React from "react";

interface LogoIconProps {
  className?: string;
  width?: number;
  height?: number;
  lightMode?: boolean;
}

export function LogoIcon({
  className = "",
  width = 32,
  height = 32,
  lightMode = false
}: LogoIconProps) {
  // 光模式和暗模式下的颜色差异
  const primaryColor = lightMode ? "#3B82F6" : "#60A5FA"; // 浅色模式使用blue-500，深色模式使用blue-400
  const secondaryColor = lightMode ? "#8B5CF6" : "#A78BFA"; // 浅色模式使用violet-500，深色模式使用violet-400
  const tertiaryColor = lightMode ? "#1E40AF" : "#3B82F6"; // 浅色模式使用blue-800，深色模式使用blue-500
  const accentColor = lightMode ? "#6D28D9" : "#8B5CF6"; // 浅色模式使用violet-700，深色模式使用violet-500

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 背景星系/漩涡效果 */}
      <circle cx="16" cy="16" r="16" fill="url(#paint0_radial)" />

      {/* 主要区块链 */}
      <path
        d="M8 12L12 8L16 12L20 8L24 12L20 16L24 20L20 24L16 20L12 24L8 20L12 16L8 12Z"
        fill="url(#paint1_linear)"
        stroke={primaryColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 中心圆点 - 代表交易中心 */}
      <circle cx="16" cy="16" r="2.5" fill={secondaryColor} />

      {/* 动态连接线 - 代表交易路径 */}
      <path
        d="M16 8V14"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 18V24"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 16H14"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 16H24"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 四个角上的点 - 代表交易节点 */}
      <circle cx="12" cy="12" r="1.5" fill={primaryColor} />
      <circle cx="20" cy="12" r="1.5" fill={tertiaryColor} />
      <circle cx="12" cy="20" r="1.5" fill={tertiaryColor} />
      <circle cx="20" cy="20" r="1.5" fill={primaryColor} />

      {/* 渐变定义 */}
      <defs>
        <radialGradient
          id="paint0_radial"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(16 16) rotate(90) scale(16)"
        >
          <stop stopColor={primaryColor} stopOpacity="0.2" />
          <stop offset="0.6" stopColor={tertiaryColor} stopOpacity="0.1" />
          <stop offset="1" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="paint1_linear"
          x1="8"
          y1="8"
          x2="24"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={primaryColor} stopOpacity="0.1" />
          <stop offset="1" stopColor={secondaryColor} stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
