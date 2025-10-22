#!/usr/bin/env node

// Script para verificar que el build funciona correctamente
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando build...');

// Verificar que el directorio dist existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ El directorio dist no existe. Ejecuta npm run build primero.');
  process.exit(1);
}

// Verificar archivos principales
const requiredFiles = [
  'index.html',
  'assets/index-C87L9Zxv.js',
  'assets/index-BvfiezGI.css'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} no existe`);
    allFilesExist = false;
  }
});

// Verificar archivos de componentes específicos
const componentFiles = [
  'assets/HybridTripSearch-ssMmOMyv.js',
  'assets/AutocompleteInput.vue_vue_type_script_setup_true_lang-*.js',
  'assets/simpleAutocompleteService-*.js'
];

console.log('\n🔍 Verificando componentes específicos...');
const distAssets = path.join(distPath, 'assets');
if (fs.existsSync(distAssets)) {
  const assets = fs.readdirSync(distAssets);
  
  // Buscar archivos que contengan los nombres de los componentes
  const hybridSearch = assets.find(file => file.includes('HybridTripSearch'));
  const autocomplete = assets.find(file => file.includes('AutocompleteInput'));
  const simpleAutocomplete = assets.find(file => file.includes('simpleAutocompleteService'));
  
  if (hybridSearch) console.log(`✅ HybridTripSearch: ${hybridSearch}`);
  if (autocomplete) console.log(`✅ AutocompleteInput: ${autocomplete}`);
  if (simpleAutocomplete) console.log(`✅ SimpleAutocompleteService: ${simpleAutocomplete}`);
}

if (allFilesExist) {
  console.log('\n✅ Build verificado correctamente');
  console.log('📦 El proyecto está listo para deploy en Netlify');
} else {
  console.log('\n❌ Hay problemas con el build');
  process.exit(1);
}
