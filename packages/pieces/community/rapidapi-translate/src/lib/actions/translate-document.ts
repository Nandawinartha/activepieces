import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiTranslateAuth } from '../..';

export const translateDocument = createAction({
  auth: rapidApiTranslateAuth,
  name: 'translate_document',
  displayName: 'Terjemahkan Dokumen',
  description: 'Menerjemahkan dokumen dengan mempertahankan struktur dan format',
  props: {
    documentText: Property.LongText({
      displayName: 'Konten Dokumen',
      description: 'Teks lengkap dokumen yang akan diterjemahkan',
      required: true
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
      options: {
        options: [
          { label: 'Indonesian', value: 'id' },
          { label: 'English', value: 'en' }
        ]
      }
    }),
    preserveStructure: Property.Checkbox({
      displayName: 'Pertahankan Struktur',
      description: 'Mempertahankan paragraf, bullet points, dan struktur dokumen',
      required: false,
      defaultValue: true
    })
  },
  async run({ auth, propsValue }) {
    const { documentText, sourceLanguage = 'auto', targetLanguage, preserveStructure = true } = propsValue;
    
    try {
      // Split document into chunks if too large
      const chunks = this.splitIntoChunks(documentText, 1000);
      const translatedChunks = [];
      
      for (const chunk of chunks) {
        const response = await httpClient.sendRequest({
          method: HttpMethod.POST,
          url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
          headers: {
            'X-RapidAPI-Key': auth,
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          body: {
            q: chunk,
            target: targetLanguage,
            source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
            format: preserveStructure ? 'text' : 'html'
          }
        });
        
        const translation = response.body.data?.translations?.[0];
        translatedChunks.push(translation?.translatedText || chunk);
      }
      
      const translatedDocument = translatedChunks.join('');
      
      return {
        success: true,
        document_translation: {
          original_text: documentText,
          translated_text: translatedDocument,
          source_language: sourceLanguage,
          target_language: targetLanguage
        },
        processing_info: {
          chunks_processed: chunks.length,
          structure_preserved: preserveStructure,
          total_characters: documentText.length,
          translated_characters: translatedDocument.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  splitIntoChunks(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) return [text];
    
    const chunks = [];
    let currentChunk = '';
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          chunks.push(sentence.trim());
        }
      } else {
        currentChunk += sentence + '.';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
});