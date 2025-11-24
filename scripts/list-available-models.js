const fetch = require('node-fetch');

const API_KEY = "AIzaSyALYoHdzlkDTBboX6lWUpg7mL04IqQTsh0";

async function listModels() {
  try {
    console.log("Listando modelos disponibles con tu API key...\n");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error("Error:", response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log("Modelos disponibles:");
    console.log("===================\n");
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        console.log(`Nombre: ${model.name}`);
        console.log(`Métodos soportados: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('---');
      });
    } else {
      console.log("No se encontraron modelos disponibles");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
