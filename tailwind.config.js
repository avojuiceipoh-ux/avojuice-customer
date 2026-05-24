/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 品牌色：牛油果绿系 — 温润自然，非荧光 lime
        brand: {
          50:  '#f4f7ed',  // 极淡绿白 — 页面背景、卡片底
          100: '#e0edce',  // 浅牛油果肉色
          200: '#c1db9e',  // 标签、次要高亮
          300: '#9ec76a',  // 图标、进度条
          400: '#7eb63d',  // hover 态
          500: '#649b29',  // 主色 — 温润牛油果绿
          600: '#4f7d1e',  // 按下态、深色文字背景
          700: '#395e13',  // 大标题、强调文字
          800: '#25400b',  // 极深 — dark mode 主色
          900: '#132405',  // 最深 — dark mode 背景
        },
        // 中性灰（保持）
        ink: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Semantic: 成功/警告/错误（与品牌绿协调，非 Ant Design 默认）
        success: {
          50:  '#f0faf0',
          500: '#43a047',
          600: '#2e7d32',
        },
        warning: {
          50:  '#fff8e1',
          500: '#f9a825',
          600: '#f57f17',
        },
        danger: {
          50:  '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      // 圆角系统
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
