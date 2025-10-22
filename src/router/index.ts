import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: () => import('../views/LandingPage.vue'),
      meta: {
        title: 'Compartalia - Carpooling Mensual',
      },
    },
    {
      path: '/buscar-viajes',
      name: 'PublicTripSearch',
      component: () => import('../views/NewPublicTripSearch.vue'),
      meta: {
        title: 'Buscar Viajes - Compartalia',
      },
    },
    {
      path: '/test-public-route',
      name: 'TestPublicRoute',
      component: () => import('../views/TestPublicRoute.vue'),
      meta: {
        title: 'Test Public Route - Compartalia',
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: {
        title: 'Iniciar Sesión - Compartalia',
      },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: {
        title: 'Registrarse - Compartalia',
      },
    },
    {
      path: '/buscar-viajes-simple',
      name: 'SimpleTripSearch',
      component: () => import('../views/SimpleTripSearch.vue'),
      meta: {
        title: 'Buscar Viajes - Compartalia',
      },
    },
    {
      path: '/test-supabase',
      name: 'TestSupabase',
      component: () => import('../views/TestSupabase.vue'),
      meta: {
        title: 'Test Supabase - Compartalia',
      },
    },
    {
      path: '/test-search-trips',
      name: 'TestSearchTrips',
      component: () => import('../views/TestSearchTrips.vue'),
      meta: {
        title: 'Test Search Trips - Compartalia',
      },
    },
    {
      path: '/carpooling/search-trips-fixed',
      name: 'SearchTripsFixed',
      component: () => import('../views/carpooling/SearchTripsFixed.vue'),
      meta: {
        title: 'Buscar Viajes - Compartalia',
      },
    },
    {
      path: '/buscar-viajes-hibrido',
      name: 'HybridTripSearch',
      component: () => import('../views/HybridTripSearch.vue'),
      meta: {
        title: 'Buscar Viajes Híbrido - Compartalia',
      },
    },
    {
      path: '/test-hybrid',
      name: 'TestHybrid',
      component: () => import('../views/TestHybrid.vue'),
      meta: {
        title: 'Test Hybrid - Compartalia',
      },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'Compartalia - Dashboard',
      },
    },
    {
      path: '/ecommerce',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'eCommerce Dashboard',
      },
    },
    {
      path: '/carpooling',
      name: 'Carpooling Dashboard',
      component: () => import('../views/Carpooling/Dashboard.vue'),
      meta: {
        title: 'Compartalia - Dashboard',
      },
    },
    {
      path: '/carpooling/buscar-viajes-hibrido',
      name: 'Buscar Viajes Híbrido',
      component: () => import('../views/HybridTripSearch.vue'),
      meta: {
        title: 'Buscar Viajes',
      },
    },
    {
      path: '/carpooling/busqueda-mapa',
      name: 'Busqueda Mapa',
      component: () => import('../views/Carpooling/BusquedaMapa.vue'),
      meta: {
        title: 'Búsqueda por Mapa',
      },
    },
    {
      path: '/carpooling/miembros',
      name: 'Miembros',
      component: () => import('../views/Carpooling/Miembros.vue'),
      meta: {
        title: 'Gestión de Miembros',
      },
    },
    {
      path: '/carpooling/mensajeria',
      name: 'Mensajeria',
      component: () => import('../views/Carpooling/Mensajeria.vue'),
      meta: {
        title: 'Sistema de Mensajería',
      },
    },
    {
      path: '/carpooling/historial-mensajes',
      name: 'Historial Mensajes',
      component: () => import('../views/Carpooling/HistorialMensajes.vue'),
      meta: {
        title: 'Historial de Mensajes',
      },
    },
    {
      path: '/carpooling/debug-search',
      name: 'Debug Search',
      component: () => import('../views/Carpooling/DebugSearch.vue'),
      meta: {
        title: 'Debug Búsqueda',
      },
    },
    {
      path: '/carpooling/test-route-service',
      name: 'Test Route Service',
      component: () => import('../views/Carpooling/TestRouteService.vue'),
      meta: {
        title: 'Test Route Service',
      },
    },
        {
          path: '/carpooling/test-route-stops',
          name: 'Test Route Stops',
          component: () => import('../views/Carpooling/TestRouteStops.vue'),
          meta: {
            title: 'Test Paradas sobre Ruta',
          },
        },
        {
          path: '/carpooling/test-simple-route',
          name: 'Test Simple Route',
          component: () => import('../views/Carpooling/TestSimpleRoute.vue'),
          meta: {
            title: 'Test Ruta Simple',
          },
        },
        {
          path: '/carpooling/test-fixed-route',
          name: 'Test Fixed Route',
          component: () => import('../views/Carpooling/TestFixedRoute.vue'),
          meta: {
            title: 'Test Ruta Fija',
          },
        },
        {
          path: '/carpooling/test-trip-search',
          name: 'Test Trip Search',
          component: () => import('../views/Carpooling/TestTripSearch.vue'),
          meta: {
            title: 'Test Búsqueda de Viajes',
          },
        },
      {
        path: '/carpooling/create-trip-stops',
        name: 'Create Trip With Stops',
        component: () => import('../views/Carpooling/CreateTripWithStops.vue'),
        meta: {
          title: 'Crear Viaje con Paradas',
        },
      },
      {
        path: '/carpooling/test-supabase',
        name: 'Test Supabase',
        component: () => import('../components/carpooling/TestSupabase.vue'),
        meta: {
          title: 'Test Supabase',
        },
      },
      {
        path: '/carpooling/create-monthly-trip',
        name: 'Create Monthly Trip',
        component: () => import('../components/carpooling/CreateMonthlyTrip.vue'),
        meta: {
          title: 'Crear Viaje Mensual',
        },
      },
      {
        path: '/carpooling/monthly-trips-search',
        name: 'Monthly Trips Search',
        component: () => import('../components/carpooling/MonthlyTripsSearch.vue'),
        meta: {
          title: 'Búsqueda Viajes Mensuales',
        },
      },
      {
        path: '/carpooling/create-sample-trips',
        name: 'Create Sample Trips',
        component: () => import('../components/carpooling/CreateSampleTrips.vue'),
        meta: {
          title: 'Crear Viajes de Ejemplo',
        },
      },
      {
        path: '/carpooling/create-trip',
        name: 'Create Trip',
        component: () => import('../components/carpooling/CreateTripForm.vue'),
        meta: {
          title: 'Crear Viaje',
        },
      },
      {
        path: '/carpooling/test-form',
        name: 'Test Form',
        component: () => import('../components/carpooling/TestForm.vue'),
        meta: {
          title: 'Test Formulario',
        },
      },
      {
        path: '/carpooling/create-trip-madrid',
        name: 'Create Trip Madrid',
        component: () => import('../views/Carpooling/CreateTripMadrid.vue'),
        meta: {
          title: 'Crear Viaje Madrid',
        },
      },
    {
      path: '/carpooling/search-advanced',
      name: 'Search Advanced',
      component: () => import('../views/Carpooling/SearchTripsAdvanced.vue'),
      meta: {
        title: 'Búsqueda Avanzada',
      },
    },
    {
      path: '/carpooling/create-advanced',
      name: 'Create Advanced',
      component: () => import('../views/Carpooling/CreateTripAdvanced.vue'),
      meta: {
        title: 'Crear Viaje Avanzado',
      },
    },
    {
      path: '/carpooling/create-trip',
      name: 'Create Trip',
      component: () => import('../views/Carpooling/CreateTrip.vue'),
      meta: {
        title: 'Crear Viaje',
      },
    },
    {
      path: '/carpooling/my-trips',
      name: 'My Trips',
      component: () => import('../views/Carpooling/MyTrips.vue'),
      meta: {
        title: 'Mis Viajes',
      },
    },
    {
      path: '/carpooling/messages',
      name: 'Messages',
      component: () => import('../views/Carpooling/Messages.vue'),
      meta: {
        title: 'Mensajes',
      },
    },
    {
      path: '/carpooling/trip/:id',
      name: 'Trip Details',
      component: () => import('../views/Carpooling/TripDetails.vue'),
      meta: {
        title: 'Detalles del Viaje',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `Vue.js ${to.meta.title} | TailAdmin - Vue.js Tailwind CSS Dashboard Template`
  next()
})
