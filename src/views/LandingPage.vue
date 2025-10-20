<template>
<div class="min-h-screen bg-gray-50 antialiased">
  <header ref="navbar" class="sticky top-0 z-50 transition-all duration-300 ease-in-out" :class="isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <img src="/images/logo/Compartalia2.png" alt="Compartalia Logo" class="h-10 w-auto object-contain sm:h-15" style="transform: scale(1.5);" />
        </div>
        <!-- Menú desktop -->
        <nav class="hidden md:flex space-x-8 items-center">
          <a href="#como-funciona" class="font-semibold transition duration-150 ease-in-out" :class="isScrolled ? 'text-black hover:text-green-600' : 'text-black hover:text-green-600'">Cómo funciona</a>
          <a href="#beneficios" class="font-semibold transition duration-150 ease-in-out" :class="isScrolled ? 'text-black hover:text-green-600' : 'text-black hover:text-green-600'">Beneficios</a>
          <a href="#precios" class="font-semibold transition duration-150 ease-in-out" :class="isScrolled ? 'text-black hover:text-green-600' : 'text-black hover:text-green-600'">Precios</a>
          <a href="#contacto" class="font-semibold transition duration-150 ease-in-out" :class="isScrolled ? 'text-black hover:text-green-600' : 'text-black hover:text-green-600'">Contacto</a>
        </nav>

        <!-- Botón hamburguesa móvil -->
        <button 
          @click="toggleMobileMenu" 
          class="md:hidden p-2 rounded-lg transition-colors"
          :class="isScrolled ? 'text-black hover:bg-gray-100' : 'text-black hover:bg-gray-100'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <!-- Botón de perfil o login -->
        <div class="hidden md:block relative">
          <button 
            v-if="!isAuthenticated"
            @click="openAuthModal" 
            class="px-5 py-2.5 rounded-full shadow-md transition duration-150 ease-in-out font-semibold text-base transform hover:scale-105"
            style="background-color: #4CAF50; color: white;"
            onmouseover="this.style.backgroundColor='#2a9235'"
            onmouseout="this.style.backgroundColor='#4CAF50'"
          >
            Acceder
          </button>
          
          <!-- Icono de perfil cuando está autenticado -->
          <div v-else class="relative">
            <button 
              @click="toggleProfileMenu"
              class="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition duration-150"
            >
              <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-semibold">
                  {{ userProfile?.name?.charAt(0)?.toUpperCase() || 'U' }}
                </span>
              </div>
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <!-- Menú desplegable del perfil -->
            <div 
              v-if="isProfileMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ userProfile?.name || 'Usuario' }}</p>
                <p class="text-xs text-gray-500">{{ userProfile?.email }}</p>
                <p class="text-xs text-green-600 font-medium">{{ userProfile?.role === 'conductor' ? 'Conductor' : 'Pasajero' }}</p>
              </div>
              
              <a href="/dashboard" @click="closeProfileMenu" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                🏠 Dashboard
              </a>
              <a href="/carpooling/search-trips" @click="closeProfileMenu" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                🔍 Buscar Viajes
              </a>
              <a href="/carpooling/create-trip-madrid" @click="closeProfileMenu" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                ➕ Publicar Viajes
              </a>
              <a href="/carpooling/miembros" @click="closeProfileMenu" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                👥 Miembros
              </a>
              <a href="/carpooling/mensajeria" @click="closeProfileMenu" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                💬 Mensajería
              </a>
              
              <div class="border-t border-gray-100 mt-2 pt-2">
                <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menú móvil -->
      <div v-if="isMobileMenuOpen" class="md:hidden bg-white shadow-lg border-t border-gray-200 rounded-b-xl mx-2 mt-2">
        <nav class="flex flex-col space-y-3 px-6 py-6">
          <a href="#como-funciona" @click="closeMobileMenu" class="text-gray-700 font-semibold hover:text-green-600 transition duration-150 ease-in-out py-3 px-4 rounded-lg hover:bg-green-50">Cómo funciona</a>
          <a href="#beneficios" @click="closeMobileMenu" class="text-gray-700 font-semibold hover:text-green-600 transition duration-150 ease-in-out py-3 px-4 rounded-lg hover:bg-green-50">Beneficios</a>
          <a href="#precios" @click="closeMobileMenu" class="text-gray-700 font-semibold hover:text-green-600 transition duration-150 ease-in-out py-3 px-4 rounded-lg hover:bg-green-50">Precios</a>
          <a href="#contacto" @click="closeMobileMenu" class="text-gray-700 font-semibold hover:text-green-600 transition duration-150 ease-in-out py-3 px-4 rounded-lg hover:bg-green-50">Contacto</a>
          <div class="pt-2">
            <button 
              @click="irAlDashboard; closeMobileMenu()" 
              class="w-full px-5 py-3 rounded-full shadow-md transition duration-150 ease-in-out font-semibold text-base"
              style="background-color: #4CAF50; color: white;"
            >
              Acceder
            </button>
          </div>
        </nav>
      </div>
    </div>
  </header>

  <section class="hero-section relative overflow-hidden">
    <div class="hero-content">
      <div class="hero-layout">
        <div class="hero-text">
          <h1 class="text-5xl md:text-6xl font-extrabold mb-6 leading-tight" style="color: var(--text-100);">
            Viaja al trabajo de forma 
            <span class="animate-fadeIn bg-gradient-to-r from-green-500 via-green-600 to-green-700 bg-clip-text text-transparent">sostenible</span> 
            y 
            <span class="bg-gradient-to-r from-green-500 via-green-600 to-green-700 bg-clip-text text-transparent">económica</span>
          </h1>
          <p class="text-xl mb-10 max-w-xl" style="color: var(--text-200);">
            Únete a la principal comunidad de carpooling mensual del extrarradio de Madrid. Conecta, comparte gastos y reduce tu huella.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="irAlDashboard"
              class="px-8 py-4 rounded-xl text-xl font-bold transition duration-150 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
              style="background-color: #4CAF50; color: white;"
              onmouseover="this.style.backgroundColor='#2a9235'"
              onmouseout="this.style.backgroundColor='#4CAF50'"
            >
              🚀 Empezar Ahora (¡Es Gratis!)
            </button>
            <button
              @click="scrollToSection('como-funciona')"
              class="px-8 py-4 rounded-xl text-xl font-semibold transition duration-150 ease-in-out"
              style="border: 2px solid #4CAF50; color: #4CAF50; background-color: transparent;"
              onmouseover="this.style.backgroundColor='#4CAF50'; this.style.color='white'"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='#4CAF50'"
            >
              📖 Ver Cómo Funciona
            </button>
          </div>
        </div>
        
        <div class="hero-image">
          <div class="scroll-container">
            <div class="scroll-content">
              <img src="/images/escena1.png" alt="Escena de personas" class="scroll-image scene-1" />
              <img src="/images/Cochepng.png" alt="Escena de coche" class="scroll-image scene-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="py-16 border-b" style="background-color: var(--bg-100); border-color: var(--bg-300);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div class="p-4 sm:p-6 transition duration-300 rounded-lg" style="background-color: var(--bg-100);">
          <div class="text-4xl font-extrabold mb-1" style="color: var(--primary-100);">20+</div>
          <div class="text-sm uppercase tracking-wider font-semibold" style="color: var(--text-200);">Ciudades del Extrarradio</div>
        </div>
        <div class="p-4 sm:p-6 transition duration-300 rounded-lg" style="background-color: var(--bg-100);">
          <div class="text-4xl font-extrabold mb-1" style="color: var(--primary-200);">500+</div>
          <div class="text-sm uppercase tracking-wider font-semibold" style="color: var(--text-200);">Usuarios Activos</div>
        </div>
        <div class="p-4 sm:p-6 transition duration-300 rounded-lg" style="background-color: var(--bg-100);">
          <div class="text-4xl font-extrabold mb-1" style="color: var(--accent-100);">1,200+</div>
          <div class="text-sm uppercase tracking-wider font-semibold" style="color: var(--text-200);">Viajes Mensuales</div>
        </div>
        <div class="p-4 sm:p-6 transition duration-300 rounded-lg" style="background-color: var(--bg-100);">
          <div class="text-4xl font-extrabold mb-1" style="color: var(--accent-200);">60%</div>
          <div class="text-sm uppercase tracking-wider font-semibold" style="color: var(--text-200);">Ahorro en Transporte</div>
        </div>
      </div>
    </div>
  </section>

  <section id="como-funciona" class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider">Flujo simple</span>
        <h2 class="text-4xl font-extrabold text-gray-900 mt-2 mb-4">¿Cómo Funciona?</h2>
        <p class="text-xl text-gray-500 max-w-2xl mx-auto">Es muy sencillo unirse a nuestra comunidad de carpooling y empezar a ahorrar.</p>
      </div>

      <div class="relative grid grid-cols-1 md:grid-cols-3 gap-12">
        <div class="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-gray-200 z-0 mx-20"></div>

        <div class="text-center relative z-10 p-8 bg-white rounded-2xl shadow-lg border-t-4 border-blue-600 transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 group">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-6">
            <span class="text-white text-3xl font-bold">1</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">Regístrate y Configura</h3>
          <p class="text-gray-600 leading-relaxed">
            Crea tu perfil <span class="font-bold text-lg">(conductor/pasajero)</span> e indica tu ruta diaria: <span class="font-bold text-lg">Origen (extrarradio)</span> y <span class="font-bold text-lg">Destino (Madrid)</span>.
          </p>
          <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mx-auto"></div>
          </div>
        </div>

        <div class="text-center relative z-10 p-8 bg-white rounded-2xl shadow-lg border-t-4 border-green-600 transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 group">
          <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-6">
            <span class="text-white text-3xl font-bold">2</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">Encuentra o Publica</h3>
          <p class="text-gray-600 leading-relaxed">
            Busca <span class="font-bold text-lg">viajes coincidentes</span> o, si eres <span class="font-bold text-lg">conductor</span>, publica tu ruta para que te encuentren.
          </p>
          <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="w-12 h-1 bg-gradient-to-r from-green-500 to-green-700 rounded-full mx-auto"></div>
          </div>
        </div>

        <div class="text-center relative z-10 p-8 bg-white rounded-2xl shadow-lg border-t-4 border-purple-600 transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 group">
          <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-6">
            <span class="text-white text-3xl font-bold">3</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">Viaja, Ahorra y Conecta</h3>
          <p class="text-gray-600 leading-relaxed">
            Disfruta de <span class="font-bold text-lg">viajes cómodos</span>, comparte el <span class="font-bold text-lg">coste del combustible</span> y amplía tu <span class="font-bold text-lg">red profesional</span>.
          </p>
          <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="w-12 h-1 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="beneficios" class="py-24 bg-blue-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider">Nuestras Ventajas</span>
        <h2 class="text-4xl font-extrabold text-gray-900 mt-2 mb-4">¿Por Qué Elegir Compartalia?</h2>
        <p class="text-xl text-gray-500 max-w-3xl mx-auto">Más que compartir un coche, compartes una forma de vida más inteligente y sostenible.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <div class="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition duration-300 group">
          <div class="text-5xl mb-4 text-blue-600 group-hover:scale-110 transition duration-300">💰</div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Ahorro Económico</h3>
          <p class="text-gray-700 leading-relaxed">
            Reduce hasta un <span class="font-bold text-lg">60%</span> tus gastos de transporte. Paga solo tu parte del combustible y peajes.
          </p>
          <span class="mt-4 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
            ¡Optimiza tus finanzas!
          </span>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition duration-300 group">
          <div class="text-5xl mb-4 text-green-600 group-hover:scale-110 transition duration-300">🌱</div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Sostenibilidad</h3>
          <p class="text-gray-700 leading-relaxed">
            Disminuye tu huella de carbono y contribuye a la reducción del tráfico en Madrid.
          </p>
          <span class="mt-4 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            ¡Cero emisiones extra!
          </span>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition duration-300 group">
          <div class="text-5xl mb-4 text-purple-600 group-hover:scale-110 transition duration-300">🤝</div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Comunidad y Networking</h3>
          <p class="text-gray-700 leading-relaxed">
            Conoce a otros profesionales en tu ruta. Convierte el trayecto en tiempo productivo o social.
          </p>
          <span class="mt-4 inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
            ¡Tu red crece!
          </span>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition duration-300 group">
          <div class="text-5xl mb-4 text-red-600 group-hover:scale-110 transition duration-300">🛡️</div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Seguridad y Confianza</h3>
          <p class="text-gray-700 leading-relaxed">
            Todos los usuarios y vehículos están <span class="font-bold text-lg">verificados</span>. Sistema de valoraciones para elegir con quién viajas.
          </p>
          <span class="mt-4 inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
            ¡Viaja tranquilo!
          </span>
        </div>
        
        <div class="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition duration-300 group">
          <div class="text-5xl mb-4 text-indigo-600 group-hover:scale-110 transition duration-300">📱</div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">App Intuitiva</h3>
          <p class="text-gray-700 leading-relaxed">
            Nuestra plataforma está diseñada para una gestión de viajes, pagos y comunicación sin esfuerzo.
          </p>
          <span class="mt-4 inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
            ¡Súper fácil de usar!
          </span>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-xl border border-gray-100 transform hover:shadow-2xl transition duration-300 group">
          <div class="text-5xl mb-4 text-yellow-600 group-hover:scale-110 transition duration-300">⏰</div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Puntualidad y Comodidad</h3>
          <p class="text-gray-700 leading-relaxed">
            Asegura tu plaza en rutas fijas. Di adiós a los retrasos del transporte público.
          </p>
          <span class="mt-4 inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
            ¡Más control de tu tiempo!
          </span>
        </div>
      </div>
    </div>
  </section>

  <section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider">Nuestra Cobertura</span>
        <h2 class="text-4xl font-extrabold text-gray-900 mt-2 mb-4">Conectamos el Extrarradio de Madrid</h2>
        <p class="text-xl text-gray-500 max-w-3xl mx-auto">Más de 20 ciudades con rutas diarias y confirmadas a los principales núcleos de trabajo.</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div
          v-for="ciudad in ciudadesPrincipales"
          :key="ciudad.nombre"
          class="bg-gray-50 rounded-xl p-4 text-center shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-blue-400"
        >
          <div class="text-3xl mb-1">🏙️</div>
          <h3 class="font-bold text-lg text-gray-900">{{ ciudad.nombre }}</h3>
          <p class="text-sm text-gray-500">{{ ciudad.poblacion }} hab.</p>
        </div>
      </div>
      
      <div class="text-center mt-12">
          <button class="text-blue-600 font-semibold hover:text-blue-700 transition duration-150">
              Ver todas las ciudades cubiertas →
          </button>
      </div>
    </div>
  </section>

  <section id="precios" class="py-24 bg-blue-600/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider">¡Es gratis!</span>
        <h2 class="text-4xl font-extrabold text-gray-900 mt-2 mb-4">Modelo de Costes Transparente</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          La plataforma es <span class="font-bold text-2xl">gratuita</span> para conductores y pasajeros. Solo se comparte el coste real del viaje.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div class="bg-white rounded-xl p-10 text-center shadow-2xl transform hover:scale-[1.02] transition duration-300">
          <div class="text-5xl mb-4">🧑</div>
          <h3 class="text-2xl font-extrabold text-gray-900 mb-4 border-b pb-2">Pasajero</h3>
          <div class="text-5xl font-extrabold text-blue-600 mb-4">Gratis</div>
          <p class="text-gray-500 mb-6 font-medium">Registro, búsqueda y reserva</p>
          <ul class="text-left text-gray-700 space-y-3 font-medium text-base">
            <li><span class="text-green-500 font-bold mr-2">✓</span> Búsqueda y reservas ilimitadas</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Perfiles y viajes verificados</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Comunicación con el conductor</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Soporte prioritario</li>
          </ul>
          <button
            @click="irAlDashboard"
            class="mt-8 w-full bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-blue-700 transition duration-150 shadow-lg"
          >
            Empezar como Pasajero
          </button>
        </div>

        <div class="bg-white rounded-xl p-10 text-center shadow-2xl border-4 border-green-500 transform scale-105 transition duration-500 relative">
          <span class="absolute top-0 right-0 -mt-3 -mr-3 bg-green-500 text-white text-xs font-bold uppercase py-1 px-3 rounded-full shadow-lg transform rotate-3">
              MÁS POPULAR
          </span>
          <div class="text-5xl mb-4">🚗</div>
          <h3 class="text-2xl font-extrabold text-gray-900 mb-4 border-b pb-2">Conductor</h3>
          <div class="text-5xl font-extrabold text-green-600 mb-4">Gratis</div>
          <p class="text-gray-500 mb-6 font-medium">Publica y gestiona tus viajes</p>
          <ul class="text-left text-gray-700 space-y-3 font-medium text-base">
            <li><span class="text-green-500 font-bold mr-2">✓</span> Publicación de rutas ilimitadas</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Cálculo automático de costes</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Recepción de pagos de pasajeros</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Bonificaciones por viajes completos</li>
          </ul>
          <button
            @click="irAlDashboard"
            class="mt-8 w-full bg-green-600 text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-green-700 transition duration-150 shadow-lg"
          >
            Publicar Mi Ruta
          </button>
        </div>

        <div class="bg-white rounded-xl p-10 text-center shadow-2xl transform hover:scale-[1.02] transition duration-300">
          <div class="text-5xl mb-4">🏢</div>
          <h3 class="text-2xl font-extrabold text-gray-900 mb-4 border-b pb-2">Empresa</h3>
          <div class="text-5xl font-extrabold text-purple-600 mb-4">Personalizado</div>
          <p class="text-gray-500 mb-6 font-medium">Soluciones para flotas y empleados</p>
          <ul class="text-left text-gray-700 space-y-3 font-medium text-base">
            <li><span class="text-green-500 font-bold mr-2">✓</span> Dashboard de gestión corporativa</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Reportes de sostenibilidad (CO2)</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Integración con sistemas RRHH</li>
            <li><span class="text-green-500 font-bold mr-2">✓</span> Soporte y consultoría dedicada</li>
          </ul>
          <button
            @click="scrollToSection('contacto')"
            class="mt-8 w-full bg-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-purple-700 transition duration-150 shadow-lg"
          >
            Contactar para Solución
          </button>
        </div>
      </div>
    </div>
  </section>

  <section class="py-24 bg-blue-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
        ¡Deja de ir solo! Únete y empieza a ahorrar.
      </h2>
      <p class="text-xl text-blue-200 mb-10 max-w-3xl mx-auto">
        Miles de profesionales ya han transformado su viaje diario. Regístrate en 3 minutos.
      </p>
      <button
        @click="irAlDashboard"
        class="bg-white text-blue-700 px-10 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition duration-150 shadow-2xl transform hover:scale-105"
      >
        ✅ Regístrate Gratis y Viaja Hoy
      </button>
    </div>
  </section>

  <footer id="contacto" class="text-black py-16" style="background-color: #f5f5f5;">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-10">
        
        <div class="col-span-2 md:col-span-2">
          <img 
            src="/images/logo/Compartalia2.png" 
            alt="Compartalia Logo" 
            class="h-12 w-auto object-contain mb-4"
          />
          <p class="text-gray-400 text-sm max-w-sm">
            Conectando el extrarradio de Madrid con viajes compartidos más sostenibles, económicos y seguros.
          </p>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-4 text-black">Plataforma</h4>
          <ul class="space-y-3 text-sm">
            <li><a href="#como-funciona" class="transition-colors text-gray-600 hover:text-green-600">Cómo funciona</a></li>
            <li><a href="#beneficios" class="transition-colors text-gray-600 hover:text-green-600">Beneficios</a></li>
            <li><a href="#precios" class="transition-colors text-gray-600 hover:text-green-600">Precios</a></li>
            <li><a href="#" class="transition-colors text-gray-600 hover:text-green-600">Dashboard (Acceso)</a></li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-4 text-black">Legal</h4>
          <ul class="space-y-3 text-sm">
            <li><a href="#" class="transition-colors text-gray-600 hover:text-green-600">Aviso Legal</a></li>
            <li><a href="#" class="transition-colors text-gray-600 hover:text-green-600">Política de Privacidad</a></li>
            <li><a href="#" class="transition-colors text-gray-600 hover:text-green-600">Términos de Servicio</a></li>
            <li><a href="#" class="transition-colors text-gray-600 hover:text-green-600">Cookies</a></li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-4 text-black">Contacto</h4>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center"><span class="mr-2">📧</span> <a href="mailto:info@compartalia.com" class="text-gray-600 hover:text-green-600 transition-colors">info@compartalia.com</a></li>
            <li class="flex items-center"><span class="mr-2">📞</span> <span class="text-gray-600">+34 900 123 456</span></li>
            <li class="flex items-center"><span class="mr-2">📍</span> <span class="text-gray-600">Madrid, España</span></li>
          </ul>
          <div class="flex space-x-4 mt-6">
            <a href="#" class="text-gray-600 hover:text-green-600 transition-colors text-xl">📘</a>
            <a href="#" class="text-gray-600 hover:text-green-600 transition-colors text-xl">🐦</a>
            <a href="#" class="text-gray-600 hover:text-green-600 transition-colors text-xl">📸</a>
            <a href="#" class="text-gray-600 hover:text-green-600 transition-colors text-xl">💼</a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-300 mt-12 pt-8 text-center text-sm text-gray-600">
        <p>&copy; 2024 Compartalia. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>

  <!-- Modal de Autenticación -->
  <AuthModal 
    :is-open="showAuthModal" 
    @close="closeAuthModal"
    @success="closeAuthModal"
  />
</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import AuthModal from '@/components/auth/AuthModal.vue';

const router = useRouter();

// Auth composable
const { user, userProfile, isAuthenticated, logout, loginWithGoogle } = useAuth();

// Variables reactivas para el navbar
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const isProfileMenuOpen = ref(false);
const showAuthModal = ref(false);

// Función para manejar el scroll
function handleScroll() {
  isScrolled.value = window.scrollY > 50;
}

// Funciones para el menú móvil
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}

// Funciones para el perfil
function toggleProfileMenu() {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
}

function closeProfileMenu() {
  isProfileMenuOpen.value = false;
}

function openAuthModal() {
  showAuthModal.value = true;
}

function closeAuthModal() {
  showAuthModal.value = false;
}

async function handleLogout() {
  try {
    await logout();
    closeProfileMenu();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}

// Event listeners
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Ciudades principales del extrarradio (datos OK)
const ciudadesPrincipales = [
  { nombre: 'Torrejón de Ardoz', poblacion: '132K' },
  { nombre: 'Getafe', poblacion: '185K' },
  { nombre: 'Móstoles', poblacion: '210K' },
  { nombre: 'Alcalá de Henares', poblacion: '195K' },
  { nombre: 'Fuenlabrada', poblacion: '193K' },
  { nombre: 'Leganés', poblacion: '190K' },
  { nombre: 'Alcorcón', poblacion: '170K' },
  { nombre: 'Parla', poblacion: '130K' },
  { nombre: 'Alcobendas', poblacion: '118K' },
  { nombre: 'Las Rozas', poblacion: '96K' }
];

function irAlDashboard() {
  // Aquí mantienes tu lógica de redirección
  router.push('/dashboard');
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Función de login con Google
const handleGoogleLogin = async () => {
  try {
    console.log('Iniciando login con Google...');
    await loginWithGoogle();
    console.log('Login con Google exitoso');
    closeAuthModal();
  } catch (error) {
    console.error('Error en login con Google:', error);
    alert('Error al iniciar sesión con Google. Inténtalo de nuevo.');
  }
};

// Componente listo para usar
</script>

<style scoped>
/* Variables CSS personalizadas */
:root {
  --primary-100: #4CAF50;
  --primary-200: #2a9235;
  --primary-300: #0a490a;
  --accent-100: #FFC107;
  --accent-200: #916400;
  --text-100: #333333;
  --text-200: #5c5c5c;
  --bg-100: #e6fbe3;
  --bg-200: #dcf1d9;
  --bg-300: #b4c8b1;
}

/* Animación fadeIn */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out;
}

/* Hero Section con Layout Izquierda-Derecha */
.hero-section {
  width: 100%;
  min-height: 600px;
  position: relative;
  background: linear-gradient(135deg, var(--bg-200) 0%, var(--bg-300) 100%);
  overflow: hidden;
}


.hero-content {
  position: relative;
  z-index: 10;
  padding: 80px 20px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1200px;
  width: 100%;
}

.hero-text {
  text-align: left;
}

.hero-image {
  position: relative;
  height: 500px;
  overflow: hidden;
  margin-top: 50px;
}

.scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.scroll-content {
  display: flex;
  width: 200%;
  height: 100%;
}

.scroll-image {
  width: 50%;
  height: 100%;
  object-fit: cover;
}

.scene-1 {
  /* Imagen normal sin scroll */
  transform: scale(1);
  transform-origin: center center;
}

.scene-2 {
  /* Imagen normal sin scroll */
  transform: scale(1);
  transform-origin: center center;
}


/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    min-height: 400px;
  }
  
  .hero-content {
    padding: 60px 15px;
    min-height: 400px;
  }
  
  .hero-layout {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .hero-text {
    text-align: center;
  }
  
  .hero-text h1 {
    font-size: 2.5rem;
  }
  
  .hero-image {
    height: 300px;
    order: -1;
    margin-top: 20px;
  }
  
  .scene-1 {
    transform: scale(1);
  }
  
  .scene-2 {
    transform: scale(1);
  }
}
</style>