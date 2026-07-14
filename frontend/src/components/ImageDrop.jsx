import { useRef, useState } from 'react';
import { api, resolveImage } from '../api/client';
import { ImageIcon } from './icons';

// Single-image picker for post creation. Uploads immediately and reports the
// stored path back via onChange. Mirrors the prototype's rounded 220px slot.
export default function ImageDrop({ value, onChange, placeholder = 'Drop a picture' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const preview = resolveImage(value);

  const pick = () => inputRef.current && inputRef.current.click();

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be 5MB or smaller.'); return; }
    setError('');
    setBusy(true);
    try {
      const { imageUrl } = await api.uploadImage(file);
      onChange(imageUrl);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        onClick={pick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          width: '100%', height: 220, borderRadius: 8, cursor: 'pointer',
          border: preview ? '1px solid #edeff1' : '2px dashed #d7d9da',
          background: preview ? `center/cover no-repeat url("${preview}")` : '#f6f7f8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#9a9a9b', flexDirection: 'column', gap: 8, overflow: 'hidden',
        }}
      >
        {!preview && (
          <>
            <ImageIcon size={28} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{busy ? 'Uploading…' : placeholder}</span>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
      <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
        {preview && (
          <button type="button" className="bb-btn-plain" style={{ fontSize: 12.5, color: '#7353ea', fontWeight: 600 }} onClick={() => onChange(null)}>Remove picture</button>
        )}
        {error && <span className="bb-error">{error}</span>}
      </div>
    </div>
  );
}
