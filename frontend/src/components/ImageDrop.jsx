import { useRef, useState } from 'react';
import { api, resolveImage } from '../api/client';
import { ImageIcon } from './icons';

const FIT_OPTIONS = [
  { value: 'contain', label: 'Full image' },
  { value: 'cover', label: 'Crop to fill' },
];

// Single-image picker for post creation. Uploads immediately and reports the
// stored path back via onChange. `fit` controls how the image is displayed
// everywhere the post appears — "contain" shows the whole picture
// (letterboxed), "cover" crops it to fill the frame.
export default function ImageDrop({ value, onChange, fit = 'contain', onFitChange, placeholder = 'Drop a picture' }) {
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
          backgroundColor: preview ? '#f6f7f8' : '#f6f7f8',
          backgroundImage: preview ? `url("${preview}")` : 'none',
          backgroundSize: fit,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
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

      {preview && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: 12.5, color: '#787c7e', marginRight: 2 }}>Display:</span>
          {FIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="bb-pill-btn"
              style={{
                height: 28, fontSize: 12, padding: '0 12px',
                background: fit === opt.value ? '#7353ea' : '#f6f7f8',
                color: fit === opt.value ? '#fff' : '#1a1a1b',
              }}
              onClick={() => onFitChange && onFitChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
        {preview && (
          <button type="button" className="bb-btn-plain" style={{ fontSize: 12.5, color: '#7353ea', fontWeight: 600 }} onClick={() => onChange(null)}>Remove picture</button>
        )}
        {error && <span className="bb-error">{error}</span>}
      </div>
    </div>
  );
}
