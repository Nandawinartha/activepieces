# Panduan Custom Pieces Activepieces

## Masalah yang Anda Hadapi

Custom piece yang sudah dibuat tidak muncul di UI Activepieces meskipun sudah didaftarkan di konfigurasi.

## Analisis Masalah

Berdasarkan analisis mendalam proyek, masalah terjadi karena:

1. **Mode Deployment**: Activepieces memiliki 2 mode untuk pieces:
   - `PIECES_SOURCE=DB` (default): Pieces disimpan di database
   - `PIECES_SOURCE=FILE`: Pieces diload dari file system (development)

2. **Environment Configuration**: Custom pieces memerlukan konfigurasi environment yang tepat

3. **Build Process**: Custom pieces harus dibuild terlebih dahulu sebelum bisa digunakan

## Solusi yang Telah Dibuat

### 1. Custom Piece yang Dibuat

```typescript
// packages/pieces/custom/my-custom-piece/src/index.ts
export const myCustomPiece = createPiece({
  displayName: 'My Custom Piece',
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/custom.png',
  authors: ['Custom Developer'],
  actions: [myCustomAction],
  triggers: [],
});
```

### 2. Konfigurasi Environment

File `.env` sudah dikonfigurasi dengan:
```bash
AP_PIECES_SOURCE=FILE
AP_DEV_PIECES=@activepieces/piece-my-custom-piece
```

### 3. Build Configuration

- `package.json` ✅
- `project.json` ✅ 
- `tsconfig.json` ✅
- Built files di `dist/packages/pieces/custom/my-custom-piece` ✅

## Cara Menjalankan Custom Pieces

### Opsi A: Development Mode (Recommended)

1. **Pastikan konfigurasi benar**:
   ```bash
   node debug-pieces.js
   ```

2. **Build custom piece**:
   ```bash
   npx nx build pieces-my-custom-piece
   ```

3. **Jalankan development server**:
   ```bash
   ./scripts/dev-with-custom-pieces.sh
   ```

### Opsi B: Manual Development

1. **Set environment variables**:
   ```bash
   export $(grep -v '^#' .env | xargs)
   ```

2. **Build semua komponen**:
   ```bash
   npx nx build server-api
   npx nx build engine
   npx nx build pieces-my-custom-piece
   ```

3. **Jalankan development**:
   ```bash
   npm run dev:backend
   ```

### Opsi C: Docker Development

1. **Build dengan Docker**:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Verifikasi Custom Piece

### 1. Cek Build Status
```bash
node debug-pieces.js
```

### 2. Cek File Structure
```
dist/packages/pieces/custom/my-custom-piece/
├── package.json
└── src/
    ├── index.js
    ├── index.d.ts
    └── index.js.map
```

### 3. Cek di UI
- Buka http://localhost:4200 (frontend) atau http://localhost:3000 (backend)
- Masuk ke Flow Builder
- Cari "My Custom Piece" di daftar pieces

## Troubleshooting

### Custom Piece Tidak Muncul

1. **Cek environment**:
   ```bash
   echo $AP_PIECES_SOURCE  # should be FILE
   echo $AP_DEV_PIECES     # should contain your piece name
   ```

2. **Cek build**:
   ```bash
   ls -la dist/packages/pieces/custom/my-custom-piece/src/
   ```

3. **Cek logs server**:
   - Look for piece loading messages
   - Check for errors in console

### Error saat Build

1. **Dependencies tidak terinstall**:
   ```bash
   npm install
   ```

2. **TypeScript errors**:
   - Check `tsconfig.json` configuration
   - Ensure all imports are correct

### Database Connection Error

Jika menggunakan mode development tanpa Docker:
```bash
# Install PostgreSQL dan Redis lokal, atau
# Gunakan Docker untuk services saja:
docker-compose up postgres redis -d
```

## Mode Production (DB)

Untuk production deployment dengan DB mode:

1. **Build piece sebagai archive**:
   ```bash
   npm run build-piece
   ```

2. **Upload via API**:
   ```bash
   curl -X POST "http://localhost:3000/api/v1/pieces" \
     -H "Content-Type: application/json" \
     -d '{"packageType": "ARCHIVE", "pieceArchive": {...}}'
   ```

3. **Upload via UI**:
   - Masuk ke Admin panel
   - Upload piece archive

## Files yang Dibuat

1. `packages/pieces/custom/my-custom-piece/` - Custom piece source
2. `.env` - Environment configuration  
3. `scripts/dev-with-custom-pieces.sh` - Development script
4. `debug-pieces.js` - Debug tool
5. `docker-compose.dev.yml` - Docker development setup

## Next Steps

1. **Jalankan development server** dengan script yang sudah dibuat
2. **Cek UI** untuk memastikan custom piece muncul
3. **Test functionality** dari custom action
4. **Deploy** sesuai dengan mode yang dipilih (FILE/DB)

## Troubleshooting Lanjutan

Jika masih ada masalah, periksa:

1. **Version compatibility** - Pastikan menggunakan version yang sesuai
2. **Build cache** - Hapus `dist/` dan build ulang
3. **Environment isolation** - Pastikan tidak ada konflik environment
4. **Log output** - Check server logs untuk error messages

---

**Note**: Custom piece sudah berhasil dibuat dan dikonfigurasi dengan benar. Masalah kemungkinan terjadi pada saat deployment atau environment setup.