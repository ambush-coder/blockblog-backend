import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { initialsOf, displayName } from '../lib/format';
import { applyVote, reconcileCounts } from '../lib/vote';
import PostCard from '../components/PostCard';

export default function Account() {
  const navigate = useNavigate();
  const { user, savedIds, toggleSaved } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user && (user.id || user._id);

  useEffect(() => {
    let cancelled = false;
    api.myPosts()
      .then((p) => { if (!cancelled) setPosts(Array.isArray(p) ? p : []); })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const vote = useCallback(async (id, type) => {
    setPosts((prev) => prev.map((p) => ((p._id || p.id) === id ? applyVote(p, userId, type) : p)));
    try {
      const res = type === 'like' ? await api.toggleLike(id) : await api.toggleDislike(id);
      setPosts((prev) => prev.map((p) => ((p._id || p.id) === id ? reconcileCounts(p, res) : p)));
    } catch { /* ignore */ }
  }, [userId]);

  const name = displayName(user);

  return (
    <div className="bb-fade-in" style={{ maxWidth: 820, margin: '0 auto', padding: 'var(--space-8) var(--space-6) 80px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="bb-card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f1edfe', color: '#7353ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>{initialsOf(name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{name || 'Your account'}</div>
          <div style={{ fontSize: 13, color: '#787c7e' }}>{user && user.email}</div>
        </div>
        <button className="bb-pill-btn bb-pill-outline" onClick={() => navigate('/saved-post')}>Saved posts</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 19, margin: 0, fontWeight: 800 }}>Your posts</h2>
        <button className="bb-pill-btn bb-pill-primary" onClick={() => navigate('/post')}>New post</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {loading && <div style={{ color: '#787c7e', fontSize: 14 }}>Loading…</div>}
        {!loading && posts.length === 0 && (
          <div className="bb-card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: '#787c7e' }}>You haven't published any posts yet.</div>
        )}
        {!loading && posts.map((post) => (
          <PostCard
            key={post._id || post.id}
            post={post}
            userId={userId}
            savedSet={savedSet}
            loggedIn
            onOpen={(id, goLogin) => (goLogin ? navigate('/login') : navigate(`/${id}`))}
            onLike={(id) => vote(id, 'like')}
            onDislike={(id) => vote(id, 'dislike')}
            onSave={(id) => toggleSaved(id)}
          />
        ))}
      </div>
    </div>
  );
}
