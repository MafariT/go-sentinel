export const colors = {
  bg: {
    primary: '#0a0a0a',
    secondary: '#111111',
    tertiary: '#161616',
    hover: '#1a1a1a',
    input: '#050505',
  },
  border: {
    default: '#262626',
    muted: '#333',
  },
  text: {
    primary: '#d1d1d1',
    secondary: '#666',
    muted: '#444',
    white: '#fff',
    description: '#888',
    timestamp: '#555',
  },
  status: {
    up: '#2f855a',
    upDark: '#276749',
    down: '#c53030',
    downLight: '#fc8181',
    unknown: '#4a5568',
  },
} as const;

/**
 * Chart-specific styling
 */
export const chartStyles = {
  tooltip: {
    backgroundColor: colors.bg.secondary,
    border: `1px solid ${colors.border.muted}`,
    fontSize: '10px',
    padding: '4px 8px',
  },
  tooltipItem: {
    color: colors.text.white,
  },
  tooltipLabel: {
    color: colors.text.secondary,
    marginBottom: '2px',
    fontSize: '9px',
  },
  cursor: {
    stroke: colors.border.muted,
  },
  referenceLine: {
    stroke: colors.border.muted,
    strokeDasharray: '3 3',
  },
} as const;
