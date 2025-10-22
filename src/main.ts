import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'

// Global error handler for IntersectionObserver errors
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('IntersectionObserver')) {
    console.warn('IntersectionObserver error caught and handled:', event.message);
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('IntersectionObserver')) {
    console.warn('IntersectionObserver promise rejection caught and handled:', event.reason.message);
    event.preventDefault();
    return false;
  }
});

const app = createApp(App)

app.use(router)
app.use(VueApexCharts)

app.mount('#app')
