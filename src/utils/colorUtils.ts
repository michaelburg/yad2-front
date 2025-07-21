const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const getColorStyles = (color: string) => {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return { borderColor: color, backgroundColor: color, headerBg: color };
  }

  return {
    borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    dragOverBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    headerBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
    headerColor: color,
  };
};
