import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiTranslateAuth } from '../..';

// Helper function outside the action
function splitIntoChunks(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];
  
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence + '.';
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence + '.';
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export const translateDocument = createAction({
  auth: rapidApiTranslateAuth,
  name: 'translate_document',
  displayName: 'Terjemahkan Dokumen',
  description: 'Terjemahkan dokumen panjang dengan memecah menjadi chunk-chunk',
  props: {
    documentText: Property.LongText({
      displayName: 'Teks Dokumen',
      description: 'Teks dokumen yang akan diterjemahkan',
      required: true,
    }),
    sourceLanguage: Property.StaticDropdown({
      displayName: 'Bahasa Sumber',
      required: false,
      defaultValue: 'auto',
      options: {
        options: [
          { label: 'Auto Detect', value: 'auto' },
          { label: 'English', value: 'en' },
          { label: 'Indonesian', value: 'id' }
        ]
      }
    }),
    targetLanguage: Property.StaticDropdown({
      displayName: 'Bahasa Target',
      required: true,
      defaultValue: 'id',
      options: {
        options: [
          { label: 'Indonesian', value: 'id' },
          { label: 'English', value: 'en' }
        ]
      }
    }),
    preserveStructure: Property.Checkbox({
      displayName: 'Pertahankan Struktur',
      description: 'Pertahankan struktur paragraf dan format dokumen',
      required: false,
      defaultValue: true
    })
  },
  async run({ auth, propsValue }) {
    const { documentText, sourceLanguage = 'auto', targetLanguage, preserveStructure = true } = propsValue;
    
    try {
      // Split document into chunks if too large
      const chunks = splitIntoChunks(documentText, 1000);
      const translatedChunks = [];
      
      for (const chunk of chunks) {
        const response = await httpClient.sendRequest({
          method: HttpMethod.POST,
          url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
          headers: {
            'X-RapidAPI-Key': auth,
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `q=${encodeURIComponent(chunk)}&target=${targetLanguage}&source=${sourceLanguage}`
        });

        const translatedText = response.body.data?.translations?.[0]?.translatedText || chunk;
        translatedChunks.push(translatedText);
      }

      const fullTranslation = preserveStructure 
        ? translatedChunks.join('\n\n')
        : translatedChunks.join(' ');

      return {
        success: true,
        translated_document: fullTranslation,
        document_info: {
          source_language: sourceLanguage,
          target_language: targetLanguage,
          original_length: documentText.length,
          translated_length: fullTranslation.length,
          chunks_processed: chunks.length,
          structure_preserved: preserveStructure
        },
        processing_stats: {
          total_chunks: chunks.length,
          avg_chunk_size: Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        source_language: sourceLanguage,
        target_language: targetLanguage
      };
    }
  }
});