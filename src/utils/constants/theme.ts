// src/utils/constants/theme.ts
import { ThemeConfig } from 'antd';

// Core brand colors from the original design
export const brandColors = {
  primary: '#454545',      // Dark gray
  accent: '#FF6000',       // Orange
  lightAccent: '#FFA559',  // Light orange
  cream: '#FFE6C7',        // Cream
  dark: '#2A2A2A',         // Darker gray
  light: '#F8F8F8',        // Light gray
  white: '#FFFFFF',
  black: '#000000'
} as const;

// Semantic colors for different states
export const semanticColors = {
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1677ff',
  critical: '#d4380d',
  high: '#fa541c',
  medium: '#fa8c16',
  low: '#52c41a'
} as const;

// Attack type colors
export const attackColors = {
  volumetric: '#e74c3c',
  protocol: '#3498db',
  application: '#9b59b6',
  amplification: '#f39c12',
  botnet: '#27ae60',
  hybrid: '#d35400'
} as const;

// Protocol colors for visualizations
export const protocolColors = {
  'HTTP/HTTPS': '#e74c3c',
  'DNS': '#3498db',
  'UDP': '#f39c12',
  'TCP': '#9b59b6',
  'ICMP': '#27ae60',
  'NTP': '#e67e22',
  'SSDP': '#16a085',
  'Memcached': '#c0392b',
  'LDAP': '#8e44ad'
} as const;

// Ant Design theme configuration
export const antdTheme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: brandColors.accent,
    colorPrimaryHover: brandColors.lightAccent,
    colorPrimaryActive: brandColors.accent,
    
    // Background colors
    colorBgContainer: '#ffffff',
    colorBgLayout: brandColors.light,
    colorBgElevated: '#ffffff',
    
    // Text colors
    colorText: brandColors.primary,
    colorTextHeading: brandColors.dark,
    colorTextSecondary: '#666666',
    colorTextTertiary: '#999999',
    
    // Border and shadow
    colorBorder: brandColors.cream,
    colorBorderSecondary: brandColors.lightAccent,
    boxShadow: '0 2px 8px rgba(69, 69, 69, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(255, 96, 0, 0.1)',
    
    // Typography
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Layout
    borderRadius: 8,
    borderRadiusLG: 16,
    borderRadiusSM: 4,
    
    // Component specific
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    
    // Motion
    motionUnit: 0.1,
    motionBase: 0,
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    motionEaseIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  },
  components: {
    Layout: {
      headerBg: brandColors.primary,
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#ffffff',
      triggerBg: brandColors.accent,
      footerBg: brandColors.light,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: brandColors.cream,
      itemSelectedColor: brandColors.accent,
      itemHoverBg: `${brandColors.cream}50`,
      itemHoverColor: brandColors.accent,
      horizontalItemSelectedBg: 'transparent',
      horizontalItemSelectedColor: brandColors.accent,
    },
    Card: {
      headerBg: brandColors.light,
      actionsBg: brandColors.light,
      boxShadowTertiary: '0 1px 2px rgba(69, 69, 69, 0.05)',
    },
    Table: {
      headerBg: brandColors.light,
      headerColor: brandColors.primary,
      rowHoverBg: `${brandColors.cream}30`,
      rowSelectedBg: `${brandColors.lightAccent}20`,
      rowSelectedHoverBg: `${brandColors.lightAccent}30`,
    },
    Button: {
      primaryShadow: '0 2px 4px rgba(255, 96, 0, 0.2)',
      defaultBorderColor: brandColors.lightAccent,
      defaultColor: brandColors.primary,
    },
    Input: {
      activeBorderColor: brandColors.accent,
      hoverBorderColor: brandColors.lightAccent,
      activeShadow: `0 0 0 2px ${brandColors.cream}50`,
    },
    Select: {
      optionSelectedBg: `${brandColors.cream}50`,
      optionActiveBg: `${brandColors.cream}30`,
    },
    Tag: {
      defaultBg: brandColors.cream,
      defaultColor: brandColors.primary,
    },
    Progress: {
      defaultColor: brandColors.accent,
      remainingColor: brandColors.cream,
    },
    Alert: {
      errorBg: '#fff2f0',
      errorBorderColor: '#ffccc7',
      warningBg: '#fffbe6',
      warningBorderColor: '#ffe58f',
      infoBg: '#e6f4ff',
      infoBorderColor: '#91caff',
      successBg: '#f6ffed',
      successBorderColor: '#b7eb8f',
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
    },
    Badge: {
      dotSize: 8,
      statusSize: 8,
    },
    Tabs: {
      itemSelectedColor: brandColors.accent,
      itemHoverColor: brandColors.lightAccent,
      inkBarColor: brandColors.accent,
      cardBg: brandColors.light,
    },
    Steps: {
      navArrowColor: brandColors.lightAccent,
      processTailColor: brandColors.accent,
      finishIconBorderColor: brandColors.accent,
      finishTailColor: brandColors.accent,
    },
    Timeline: {
      dotBg: brandColors.accent,
      tailColor: brandColors.cream,
    },
  },
};

// Custom CSS variables for additional styling
export const cssVariables = `
  :root {
    --color-primary: ${brandColors.primary};
    --color-accent: ${brandColors.accent};
    --color-light-accent: ${brandColors.lightAccent};
    --color-cream: ${brandColors.cream};
    --color-dark: ${brandColors.dark};
    --color-light: ${brandColors.light};
    
    --gradient-primary: linear-gradient(135deg, ${brandColors.accent}, ${brandColors.lightAccent});
    --gradient-secondary: linear-gradient(135deg, ${brandColors.cream}, ${brandColors.light});
    --gradient-dark: linear-gradient(135deg, ${brandColors.primary}, ${brandColors.dark});
    
    --shadow-sm: 0 1px 2px rgba(69, 69, 69, 0.05);
    --shadow-md: 0 2px 8px rgba(69, 69, 69, 0.08);
    --shadow-lg: 0 4px 16px rgba(69, 69, 69, 0.12);
    --shadow-xl: 0 8px 32px rgba(69, 69, 69, 0.16);
    
    --shadow-accent: 0 4px 16px rgba(255, 96, 0, 0.2);
    
    --animation-duration-fast: 200ms;
    --animation-duration-base: 300ms;
    --animation-duration-slow: 500ms;
  }
`;

// Utility function to get severity color
export const getSeverityColor = (severity: number | string): string => {
  const score = typeof severity === 'string' ? parseFloat(severity) : severity;
  
  if (isNaN(score)) return semanticColors.info;
  if (score >= 9.0) return semanticColors.critical;
  if (score >= 7.0) return semanticColors.high;
  if (score >= 4.0) return semanticColors.medium;
  return semanticColors.low;
};

// Utility function to get confidence color
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return semanticColors.success;
  if (confidence >= 70) return semanticColors.warning;
  if (confidence >= 50) return semanticColors.medium;
  return semanticColors.error;
};

// Export all theme utilities
export const theme = {
  colors: brandColors,
  semantic: semanticColors,
  attack: attackColors,
  protocol: protocolColors,
  antd: antdTheme,
  css: cssVariables,
  utils: {
    getSeverityColor,
    getConfidenceColor,
  },
};

export default theme;