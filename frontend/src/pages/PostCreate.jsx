import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { CATEGORIES } from '../lib/format';
import ImageDrop from '../components/ImageDrop';

export default function PostCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [image, setImage] = useState(null);
  const [imageFit, setImageFit] = useState('contain');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onPublish = async () => {
    if (!title.trim() || !body.trim()) { setError('Title and article text are required.'); return; }
    setError('');
    setBusy(true);
    try {
      // Anonymous authorship is the product default (PRD 6.2).
      await api.createPost({ title, category, image, imageFit, body, isAnonymous: true });
      navigate('/user');
    } catch (err) {
      setError(err.message || 'Failed to publish');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bb-fade-in" style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-8) var(--space-6) 80px', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: 26, marginBottom: 'var(--space-1)', fontWeight: 800 }}>Write a post</h1>
      <p style={{ fontSize: 13, color: '#787c7e', marginBottom: 'var(--space-6)' }}>Published anonymously — your account isn't shown publicly.</p>
      <div className="bb-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div><label className="bb-label">Title</label><input className="bb-field-input" placeholder="Give your post a title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} /></div>
        <div>
          <label className="bb-label">Category</label>
          <select className="bb-field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="bb-label">Picture (optional)</label><ImageDrop value={image} onChange={setImage} fit={imageFit} onFitChange={setImageFit} /></div>
        <div><label className="bb-label">Article text</label><textarea className="bb-field-input" rows={10} placeholder="Write your article..." value={body} onChange={(e) => setBody(e.target.value)} /></div>
        {error && <p className="bb-error">{error}</p>}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button className="bb-pill-btn bb-pill-outline" style={{ borderRadius: 8 }} onClick={() => navigate('/')}>Cancel</button>
          <button className="bb-pill-btn bb-pill-primary" style={{ borderRadius: 8 }} onClick={onPublish} disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</button>
        </div>
      </div>
    </div>
  );
}
