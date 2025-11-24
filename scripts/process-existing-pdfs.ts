// Script para procesar PDFs existentes
import { processPDFDocument } from '../src/lib/ai/embeddings';
import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const CLASS_ID = '690139b79e802c194586e7ed';

async function processExistingPDFs() {
  try {
    const classDir = path.join(UPLOADS_DIR, CLASS_ID);
    console.log(`📁 Leyendo directorio: ${classDir}`);
    
    const files = await fs.readdir(classDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    console.log(`📄 Encontrados ${pdfFiles.length} archivos PDF`);
    
    for (const file of pdfFiles) {
      const filePath = path.join(classDir, file);
      console.log(`\n🔄 Procesando: ${file}`);
      
      try {
        await processPDFDocument(filePath, CLASS_ID);
        console.log(`✅ ${file} procesado exitosamente`);
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error);
      }
    }
    
    console.log('\n✨ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

processExistingPDFs();
