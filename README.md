# June Admin

A clean, minimalist admin dashboard for monitoring June's waitlist in real-time. **100% mobile optimized** for perfect visibility on all devices.

## ✨ Features

### 📱 **Perfect Mobile Experience**
- **Mobile-first design** with perfect ratios on all screen sizes
- **Card-based view** on mobile for easy data consumption
- **Touch-optimized** buttons and interactions (44px+ touch targets)
- **Responsive typography** that scales perfectly
- **Mobile hamburger menu** for all admin actions
- **Swipe-friendly** table scrolling on smaller screens

### 🔐 **Authentication**
- Simple admin code authentication
- Clean, professional login interface
- Mobile-optimized input fields and buttons

### 📊 **Clean Data Management**
- **Desktop**: Full table view with all columns
- **Mobile**: Clean card-based layout showing key info
- Smart search across all fields
- Column sorting functionality (desktop)
- Export to CSV and JSON
- User detail modals (fully mobile responsive)
- Pagination (50 entries per page)

### 📈 **Simple Analytics**
- **Mobile-responsive charts** with proper scaling
- Key metrics overview (2x2 grid on mobile, 4x1 on desktop)
- Growth tracking charts
- Gender distribution
- Location insights
- Essential KPIs only

### 🎨 **Design Philosophy**
- **Montserrat font** throughout the interface
- **Beige color scheme** for calm, professional feel
- **Perfect spacing** that adapts to screen size
- **Minimalist UI** focused on data
- **Clean tables** with optimal readability
- **Simple interactions** without complexity
- **Touch-friendly** interface elements

## 📱 Mobile Optimizations

### **Responsive Breakpoints**
- **Mobile (< 640px)**: Card-based layout, hamburger menu, stacked elements
- **Tablet (640px - 1024px)**: Hybrid layout with responsive columns
- **Desktop (> 1024px)**: Full table view with all features

### **Mobile-Specific Features**
- **Collapsible menu**: All admin actions in a clean dropdown
- **Card view**: User data displayed in digestible cards instead of wide tables
- **Optimized touch targets**: All buttons and links sized for finger taps
- **Responsive modals**: User details adapt perfectly to small screens
- **Horizontal scrolling**: Tables scroll smoothly on mobile when needed

### **Typography Scaling**
- **Mobile**: `text-xs` to `text-base` for perfect readability
- **Desktop**: `text-sm` to `text-xl` for comfortable viewing
- **Dynamic sizing**: Elements scale automatically based on screen size

## 🚀 Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Environment variables** are configured in `.env.local`

3. **Start the dashboard:**
```bash
npm run dev
```

4. **Access at** [http://localhost:3000](http://localhost:3000)

## 🎯 Access

- **Admin Code**: `NASJUNE`
- **Dashboard**: Responsive view that adapts to your device
- **Analytics**: Click the 📊 icon for insights

## 🎨 Design Elements

- **Typography**: Montserrat font family with responsive scaling
- **Colors**: Warm beige palette (beige-50 to beige-900)
- **Layout**: Fluid containers that adapt to any screen size
- **Tables**: Perfect alignment with horizontal scroll on mobile
- **Forms**: Touch-friendly inputs with proper focus states
- **Buttons**: Sized for optimal touch interaction (44px+ height)

## 📋 Data Display

### **Desktop View**
Full table with all columns: ID, Name, Email, Phone, Age, Gender, Location, Priority Score, Batch Number, Access Code, Created Date

### **Mobile View**
Clean cards showing:
- Name and ID as header
- Email and phone as subtext
- Age, gender, priority, and batch in a 2x2 grid
- Location when available
- Creation date at bottom

## 📱 Mobile Experience Highlights

- **Perfect visibility**: All content perfectly scaled for mobile screens
- **Easy navigation**: Intuitive hamburger menu with all admin functions
- **Touch-optimized**: All interactive elements sized for fingers, not mouse pointers
- **No horizontal scrolling**: Content reflows beautifully on small screens
- **Fast loading**: Optimized for mobile data connections
- **Thumb-friendly**: Important actions within easy reach

## 🛠 Technology

- **Next.js 14** with App Router
- **TypeScript** for reliability
- **Tailwind CSS** with custom responsive design
- **Montserrat** font from Google Fonts
- **Supabase** for real-time data
- **Recharts** with mobile-responsive configurations

---

*Perfect on every device. Optimized for mobile. Built for productivity.*
