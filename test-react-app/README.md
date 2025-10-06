# D3 Force Packing - Local Test Environment

This is a standalone React test environment to verify the D3 Force Packing component works correctly before integrating into Lovable.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd test-react-app
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📱 Testing Features

### **Responsive Testing**
- **Mobile (xs/sm):** Test stacked layout - animations stack vertically
- **Tablet (md):** Test hybrid layout - 50/50 horizontal split  
- **Desktop (lg/xl/2xl):** Test dual layout - side-by-side animations

### **Breakpoint Testing**
Use browser dev tools to test different breakpoints:
- **xs:** 0-639px (Stacked)
- **sm:** 640-767px (Stacked) 
- **md:** 768-1023px (Hybrid 50/50)
- **lg:** 1024-1279px (Dual)
- **xl:** 1280-1535px (Dual)
- **2xl:** 1536px+ (Dual)

### **Component Features**
- ✅ Container-based dimension calculation
- ✅ ResizeObserver for responsive updates
- ✅ Tailwind breakpoint alignment
- ✅ Mobile-optimized layouts
- ✅ DAG overlay animation
- ✅ Clean UI toggle (disabled by default)

## 🔧 Configuration

The component can be configured in `src/components/D3ForcePacking.tsx`:

```tsx
const CONFIG = {
  BALL_COUNT: 60,                    // Number of balls in main animation
  BALL_APPEAR_DELAY: 500,           // ms between ball appearances
  FINAL_SETTLEMENT_TIME: 8000,      // ms before animation freezes
  SHOW_LINES: true,                 // Toggle connection lines
  UNIFORM_BALL_SIZES: false,        // Variable vs uniform ball sizes
};

const UI_CONFIG = {
  SHOW_UI_ELEMENTS: false, // Hide borders, debug info for clean presentation
};
```

## 🐛 Troubleshooting

### **Component Not Rendering**
1. Check browser console for errors
2. Verify D3.js is loaded: `npm install d3 @types/d3`
3. Ensure container has proper dimensions

### **Mobile Layout Issues**
1. Test with browser dev tools mobile view
2. Check container width constraints
3. Verify Tailwind classes are applied

### **Performance Issues**
1. Reduce `BALL_COUNT` in config
2. Reduce `BALLS_PER_CLUSTER` for right-side animation
3. Check browser performance tab

## 📊 Expected Behavior

### **Mobile (xs/sm)**
- Animations stack vertically
- Smaller ball sizes
- Optimized for touch interaction
- Single column layout

### **Tablet (md)**  
- 50/50 horizontal split
- Medium ball sizes
- Balanced layout
- Hybrid responsive behavior

### **Desktop (lg/xl/2xl)**
- Side-by-side animations
- Full-size balls
- DAG overlay animation
- Dual layout with text labels

## 🔄 Integration Ready

Once tested locally, this component is ready for Lovable integration:

1. Copy `src/components/D3ForcePacking.tsx` to your Lovable project
2. Install dependencies: `npm install d3 @types/d3`
3. Import and use: `<D3ForcePacking className="w-full h-[600px]" />`

The component handles all responsive behavior automatically and integrates seamlessly with Tailwind CSS breakpoints.
