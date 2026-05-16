// app.jsx — SAMURAI BLUE スタメンビルダー (モバイル対応版)
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ============================================================
// Share Card — Canvas renderer
// ============================================================
const SAVE_STYLES = `
  .save-overlay{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.78);
    display:flex;align-items:center;justify-content:center;padding:16px}
  .save-modal{background:#111827;border-radius:18px;overflow:hidden;
    width:min(440px,100%);max-height:90vh;display:flex;flex-direction:column;
    box-shadow:0 24px 64px rgba(0,0,0,.6)}
  .save-modal-hdr{display:flex;align-items:center;justify-content:space-between;
    padding:14px 18px;background:rgba(255,255,255,.05);color:#fff;
    font-weight:700;font-size:14px;letter-spacing:.04em}
  .save-modal-hdr button{appearance:none;border:0;background:rgba(255,255,255,.1);
    color:#fff;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:13px}
  .save-modal-hdr button:hover{background:rgba(255,255,255,.2)}
  .save-preview-wrap{flex:1;overflow:auto;padding:16px;display:flex;
    align-items:center;justify-content:center;min-height:0;background:#0a0f1e}
  .save-preview-wrap img{max-width:100%;max-height:100%;border-radius:10px;display:block;
    -webkit-touch-callout:default}
  .save-generating{color:rgba(255,255,255,.4);font-size:14px;padding:48px;text-align:center}
  .save-modal-ftr{padding:10px 18px 16px;background:rgba(255,255,255,.03);display:flex;flex-direction:column;gap:8px}
  .save-dl-btn{width:100%;appearance:none;border:0;padding:13px;border-radius:11px;
    background:#ff2d4a;color:#fff;font-weight:800;font-size:15px;cursor:pointer;
    letter-spacing:.04em;transition:background .15s}
  .save-dl-btn:hover{background:#e6273f}
  .save-dl-btn:disabled{background:rgba(255,255,255,.15);cursor:not-allowed;color:rgba(255,255,255,.4)}
  .save-hint{font-size:12px;color:rgba(110,166,255,.65);text-align:center;line-height:1.6;padding:0 4px}
  .save-hdr-btn{appearance:none;border:0;background:rgba(255,255,255,.08);
    color:rgba(255,255,255,.65);padding:6px 11px;border-radius:9px;
    font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.06em;
    line-height:1.3;text-align:center;transition:background .15s,color .15s}
  .save-hdr-btn:hover{background:rgba(255,255,255,.16);color:#fff}
  .save-hdr-btn.can-save{background:rgba(255,45,74,.6);color:#fff}
  .save-hdr-btn.can-save:hover{background:#ff2d4a}

  /* Completion popup */
  .comp-overlay{position:fixed;inset:0;z-index:8500;background:rgba(0,0,0,.72);
    display:flex;align-items:center;justify-content:center;padding:24px;
    animation:fadeInBg .25s ease}
  @keyframes fadeInBg{from{opacity:0}to{opacity:1}}
  .comp-modal{background:linear-gradient(160deg,#0c1d56 0%,#06112e 100%);
    border:1px solid rgba(110,166,255,.25);
    border-radius:24px;width:min(380px,100%);padding:36px 28px 28px;
    text-align:center;box-shadow:0 32px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.06);
    animation:popIn .35s cubic-bezier(.22,1.8,.36,1)}
  @keyframes popIn{from{opacity:0;transform:scale(.82) translateY(20px)}to{opacity:1;transform:none}}
  .comp-flag{font-size:52px;line-height:1;margin-bottom:12px;
    animation:flagWave .6s ease .2s both}
  @keyframes flagWave{0%{transform:rotate(-8deg) scale(.8)}50%{transform:rotate(6deg) scale(1.1)}100%{transform:rotate(0) scale(1)}}
  .comp-title{font-size:22px;font-weight:900;color:#fff;margin-bottom:8px;letter-spacing:.02em}
  .comp-sub{font-size:13px;color:rgba(110,166,255,.8);margin-bottom:28px;letter-spacing:.04em}
  .comp-save-btn{width:100%;appearance:none;border:0;padding:15px;border-radius:13px;
    background:linear-gradient(135deg,#ff2d4a,#c41e35);color:#fff;
    font-weight:800;font-size:16px;cursor:pointer;letter-spacing:.04em;
    box-shadow:0 8px 24px rgba(255,45,74,.4);transition:transform .12s,box-shadow .12s;
    margin-bottom:12px}
  .comp-save-btn:hover{transform:translateY(-1px);box-shadow:0 12px 32px rgba(255,45,74,.5)}
  .comp-save-btn:active{transform:translateY(0)}
  .comp-later-btn{appearance:none;border:0;background:transparent;
    color:rgba(255,255,255,.38);font-size:13px;cursor:pointer;padding:6px;
    transition:color .15s;width:100%}
  .comp-later-btn:hover{color:rgba(255,255,255,.6)}

  /* Favorites modal */
  .fav-overlay{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.78);
    display:flex;align-items:center;justify-content:center;padding:16px}
  .fav-modal{background:#111827;border-radius:18px;overflow:hidden;
    width:min(480px,100%);max-height:85vh;display:flex;flex-direction:column;
    box-shadow:0 24px 64px rgba(0,0,0,.6)}
  .fav-hdr{display:flex;align-items:center;justify-content:space-between;
    padding:14px 18px;background:rgba(255,255,255,.05);color:#fff;
    font-weight:700;font-size:14px;letter-spacing:.04em}
  .fav-hdr button{appearance:none;border:0;background:rgba(255,255,255,.1);
    color:#fff;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:13px}
  .fav-hdr button:hover{background:rgba(255,255,255,.2)}
  .fav-save-row{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;gap:8px}
  .fav-name-input{width:100%;appearance:none;border:1px solid rgba(110,166,255,.25);background:rgba(255,255,255,.05);
    color:#fff;padding:9px 12px;border-radius:9px;font-size:13px;outline:none;
    transition:border-color .15s}
  .fav-name-input::placeholder{color:rgba(255,255,255,.3)}
  .fav-name-input:focus{border-color:rgba(110,166,255,.6)}
  .fav-name-input:disabled{opacity:.35;cursor:not-allowed}
  .fav-save-btn{width:100%;appearance:none;border:0;padding:11px;border-radius:10px;
    background:#1948d1;color:#fff;font-weight:700;font-size:14px;cursor:pointer;
    transition:background .15s}
  .fav-save-btn:hover{background:#2e7bff}
  .fav-save-btn:disabled{background:rgba(255,255,255,.1);color:rgba(255,255,255,.3);cursor:not-allowed}
  .fav-list{flex:1;overflow-y:auto;padding:4px 0}
  .fav-empty{padding:32px;text-align:center;color:rgba(255,255,255,.35);font-size:14px}
  .fav-item{display:flex;align-items:center;gap:12px;padding:12px 18px;
    border-bottom:1px solid rgba(255,255,255,.05)}
  .fav-item:last-child{border-bottom:none}
  .fav-item-info{flex:1;min-width:0}
  .fav-item-name{font-size:14px;font-weight:700;color:#fff;margin-bottom:3px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .fav-item-meta{font-size:11px;color:rgba(110,166,255,.65)}
  .fav-item-btns{display:flex;gap:6px;flex-shrink:0}
  .fav-load-btn{appearance:none;border:0;background:rgba(46,123,255,.3);color:#fff;
    padding:6px 10px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;
    transition:background .15s}
  .fav-load-btn:hover{background:rgba(46,123,255,.65)}
  .fav-del-btn{appearance:none;border:0;background:rgba(255,45,74,.18);
    color:rgba(255,100,120,.9);padding:6px 10px;border-radius:7px;
    font-size:12px;font-weight:700;cursor:pointer;transition:background .15s}
  .fav-del-btn:hover{background:rgba(255,45,74,.4);color:#fff}
`;

async function buildShareCard({ formation, assignments, players }) {
  const uniformImg = await new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = 'screens/uniicon_new.png';
  });
  const W = 1080, H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0c1d56'); bg.addColorStop(0.65, '#06112e'); bg.addColorStop(1, '#030817');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = '#ff2d4a'; ctx.fillRect(0, 0, W, 5);

  // Header zone
  const HDR = 190;
  ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(0, 5, W, HDR - 5);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(110,166,255,.85)';
  ctx.font = 'bold 13px -apple-system,"Helvetica Neue",sans-serif';
  ctx.fillText('FIFA WORLD CUP 2026™  ·  STARTING XI', W / 2, 46);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 68px -apple-system,"Helvetica Neue",sans-serif';
  ctx.fillText('SAMURAI BLUE', W / 2, 128);

  // Formation chip
  ctx.font = 'bold 15px -apple-system,sans-serif';
  const chipText = formation.label + '  ·  ' + formation.tagline;
  const chipW = ctx.measureText(chipText).width + 36;
  const chipX = W / 2 - chipW / 2, chipY = 146;
  ctx.fillStyle = '#ff2d4a';
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(chipX, chipY, chipW, 32, 16); ctx.fill(); }
  else { ctx.fillRect(chipX, chipY, chipW, 32); }
  ctx.fillStyle = '#fff';
  ctx.fillText(chipText, W / 2, chipY + 21);

  // Pitch area
  const PX = 56, PY = HDR + 10, PW = W - PX * 2, PH = H - PY - 72;

  // Grass stripes
  const stripes = 14;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,.016)' : 'rgba(0,0,0,0)';
    ctx.fillRect(PX, PY + i * (PH / stripes), PW, PH / stripes);
  }

  // Pitch lines
  ctx.strokeStyle = 'rgba(255,255,255,.38)'; ctx.lineWidth = 2.5;
  ctx.strokeRect(PX, PY, PW, PH);
  ctx.beginPath(); ctx.moveTo(PX, PY + PH / 2); ctx.lineTo(PX + PW, PY + PH / 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, PY + PH / 2, PW * 0.09, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, PY + PH / 2, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();

  const PAW = PW * 0.52, PAH = PH * 0.13, GAW = PW * 0.28, GAH = PH * 0.05;
  ctx.strokeRect(PX + (PW - PAW) / 2, PY, PAW, PAH);
  ctx.strokeRect(PX + (PW - GAW) / 2, PY, GAW, GAH);
  ctx.beginPath(); ctx.arc(W / 2, PY + PAH, PW * 0.085, 0.18 * Math.PI, 0.82 * Math.PI); ctx.stroke();
  ctx.strokeRect(PX + (PW - PAW) / 2, PY + PH - PAH, PAW, PAH);
  ctx.strokeRect(PX + (PW - GAW) / 2, PY + PH - GAH, GAW, GAH);
  ctx.beginPath(); ctx.arc(W / 2, PY + PH - PAH, PW * 0.085, 1.18 * Math.PI, 1.82 * Math.PI); ctx.stroke();

  // Players
  const playerById = Object.fromEntries(players.map(p => [p.id, p]));
  const slotById = Object.fromEntries(formation.slots.map(s => [s.id, s]));
  const R = 38;

  // Empty slots (dashed rings)
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
  for (const slot of formation.slots) {
    if (assignments[slot.id]) continue;
    const cx = PX + (slot.x / 100) * PW, cy = PY + (slot.y / 100) * PH;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    ctx.font = 'bold 14px -apple-system,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(slot.label, cx, cy);
  }
  ctx.setLineDash([]);

  for (const [slotId, playerId] of Object.entries(assignments)) {
    const slot = slotById[slotId], player = playerById[playerId];
    if (!slot || !player) continue;
    const cx = PX + (slot.x / 100) * PW, cy = PY + (slot.y / 100) * PH;

    // shadow + background fill (separate from clip so shadow renders correctly)
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#1948d1'; ctx.fill();
    ctx.restore();

    // uniform image clipped to circle
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    if (uniformImg) ctx.drawImage(uniformImg, cx - R, cy - R, R * 2, R * 2);
    ctx.restore();

    // ring border
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = player.captain ? '#ffd700' : 'rgba(255,255,255,0.6)';
    ctx.lineWidth = player.captain ? 3.5 : 1.5;
    ctx.stroke();

    // captain badge
    if (player.captain) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 13px -apple-system,sans-serif';
      ctx.textBaseline = 'top'; ctx.textAlign = 'right';
      ctx.fillText('C', cx + R - 1, cy - R + 2);
      ctx.textAlign = 'center';
    }

    // name label
    const namePart = player.name.split(' ')[1] || player.name;
    ctx.font = `bold 17px -apple-system,"Hiragino Sans","Yu Gothic","Noto Sans CJK JP",sans-serif`;
    ctx.textAlign = 'center';
    const nW = ctx.measureText(namePart).width + 18;
    ctx.fillStyle = 'rgba(0,0,0,.65)';
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(cx - nW / 2, cy + R + 5, nW, 26, 7); ctx.fill(); }
    else { ctx.fillRect(cx - nW / 2, cy + R + 5, nW, 26); }
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'top';
    ctx.fillText(namePart, cx, cy + R + 10);
  }

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(0, H - 62, W, 62);
  const d = new Date();
  const ds = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  ctx.font = '12px -apple-system,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`SAMURAI BLUE STARTING XI BUILDER  ·  ${ds}`, W / 2, H - 31);

  return canvas;
}

// ====== Favorites (localStorage) ======
const FAVS_KEY = 'samurai-blue-favs-v1';

function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVS_KEY)) || []; }
    catch { return []; }
  });
  const save = useCallback((fav) => {
    setFavorites(prev => {
      const next = [fav, ...prev].slice(0, 15);
      try { localStorage.setItem(FAVS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  const remove = useCallback((id) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.id !== id);
      try { localStorage.setItem(FAVS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return { favorites, save, remove };
}

// ====== Tweakable defaults ======
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "pitchStyle": "grass",
  "showClub": true,
  "showRomaji": false,
  "accent": "#ff2d4a"
}/*EDITMODE-END*/;

const ROLE_ORDER = ['GK', 'DF', 'MF', 'FW'];
const ROLE_LABELS = { GK: 'GK / ゴールキーパー', DF: 'DF / ディフェンダー', MF: 'MF / ミッドフィルダー', FW: 'FW / フォワード' };

function groupByRole(players) {
  const out = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of players) out[p.pos].push(p);
  return out;
}

// ============================================================
// usePointerDnD — touch & mouse unified drag-and-drop + tap select
// ============================================================
function usePointerDnD({ onDropSlot, onDropBench }) {
  const [drag, setDrag] = useState(null); // { playerId, x, y }
  const [selected, setSelected] = useState(null);
  const handlersRef = useRef({ onDropSlot, onDropBench });
  useEffect(() => { handlersRef.current = { onDropSlot, onDropBench }; }, [onDropSlot, onDropBench]);

  const begin = useCallback((playerId, e, el) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const startX = e.clientX, startY = e.clientY;
    let dragging = false;
    const pointerId = e.pointerId;
    let lastHover = null;

    try { el.setPointerCapture(pointerId); } catch {}

    const onMove = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) > 8) {
        dragging = true;
        document.body.classList.add('is-dragging-body');
      }
      if (dragging) {
        setDrag({ playerId, x: ev.clientX, y: ev.clientY });
        // hover hint
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const dropEl = target ? target.closest('[data-drop]') : null;
        if (dropEl !== lastHover) {
          if (lastHover) lastHover.classList.remove('drop-hover');
          if (dropEl) dropEl.classList.add('drop-hover');
          lastHover = dropEl;
        }
        ev.preventDefault?.();
      }
    };

    const finish = (ev, cancelled) => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      try { el.releasePointerCapture(pointerId); } catch {}
      document.body.classList.remove('is-dragging-body');
      if (lastHover) lastHover.classList.remove('drop-hover');

      if (cancelled) { setDrag(null); return; }

      if (dragging) {
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const dropEl = target ? target.closest('[data-drop]') : null;
        if (dropEl) {
          const type = dropEl.dataset.drop;
          if (type === 'slot') handlersRef.current.onDropSlot(dropEl.dataset.slotId, playerId);
          else if (type === 'bench') handlersRef.current.onDropBench(playerId);
        }
        setDrag(null);
      } else {
        // tap = toggle selection
        setSelected(prev => prev === playerId ? null : playerId);
      }
    };
    const onUp = (ev) => finish(ev, false);
    const onCancel = (ev) => finish(ev, true);

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
  }, []);

  return { drag, selected, begin, setSelected };
}

// ============================================================
// Components
// ============================================================
function Header() {
  return (
    <header className="hdr">
      <div className="hdr-left">
        <div className="hdr-mark" aria-hidden="true">
          <div className="hdr-mark-circle" />
          <div className="hdr-mark-line" />
        </div>
        <div className="hdr-titles">
          <div className="hdr-eyebrow">君だけの最強スタメンを選ぼう</div>
          <div className="hdr-title">
            <span>SAMURAI</span>
            <span className="hdr-title-blue">BLUE</span>
          </div>
          <div className="hdr-title-jp">スタメン<em>を</em>組もう。</div>
        </div>
      </div>
    </header>
  );
}

function IconReset() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" />
      <polyline points="3 3 3 8 8 8" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function FormationBar({ formations, currentId, onChange, onReset, onSave, onFavorites, filledCount }) {
  return (
    <div className="formations">
      <div className="formations-top">
        <div className="formations-label">
          <span className="dot" />
          <span className="formations-label-en">FORMATION</span>
          <span className="formations-label-jp">フォーメーション</span>
        </div>
        <div className="formations-actions">
          <button className="ghost-btn" onClick={onReset} title="リセット">
            <span className="btn-ic"><IconReset /></span><span>RESET</span>
          </button>
          <button className="ghost-btn" onClick={onFavorites} title="お気に入り">
            <span className="btn-ic"><IconStar /></span><span>FAV</span>
          </button>
          <button className="ghost-btn" onClick={onSave} disabled={filledCount === 0} title="スタメンを画像で保存">
            <span className="btn-ic"><IconCamera /></span><span>SAVE</span>
          </button>
        </div>
      </div>
      <div className="formations-list">
        {formations.map(f => (
          <button
            key={f.id}
            className={'formation-chip' + (f.id === currentId ? ' active' : '')}
            onClick={() => onChange(f.id)}
          >
            <span className="formation-chip-label">{f.label}</span>
            <span className="formation-chip-tag">{f.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Pitch chip (in slot, smaller / vertical)
function PitchChip({ player, isSelected, isDragging, isDimmed, onPointerStart, showRomaji }) {
  const ref = useRef();
  return (
    <div
      ref={ref}
      className={
        'chip chip-pitch' +
        (isSelected ? ' is-selected' : '') +
        (isDragging ? ' is-dragging' : '') +
        (isDimmed ? ' is-dimmed' : '') +
        (player.captain ? ' is-captain' : '')
      }
      onPointerDown={(e) => onPointerStart(player.id, e, ref.current)}
      data-player={player.id}
    >
      <div className="chip-jersey">
        <img src="screens/uniicon_new.png" className="uniform-img" alt="" draggable="false" />
        {player.captain && <span className="chip-c">C</span>}
      </div>
      <div className="chip-meta">
        <div className="chip-name">{player.name}</div>
        {showRomaji && <div className="chip-roman">{player.nameRoman}</div>}
      </div>
    </div>
  );
}

// Bench chip (card layout for desktop, compact for mobile)
function BenchChip({ player, isSelected, isDragging, isDimmed, isPlaced, onPointerStart, showRomaji, showClub }) {
  const ref = useRef();
  return (
    <div
      ref={ref}
      className={
        'chip chip-bench' +
        (isSelected ? ' is-selected' : '') +
        (isDragging ? ' is-dragging' : '') +
        (isDimmed ? ' is-dimmed' : '') +
        (player.captain ? ' is-captain' : '') +
        (isPlaced ? ' is-placed' : '')
      }
      onPointerDown={isPlaced ? undefined : (e) => onPointerStart(player.id, e, ref.current)}
      data-player={player.id}
    >
      {isPlaced && <span className="chip-placed-badge">✓ スタメン</span>}
      <div className="chip-jersey">
        <img src="screens/uniicon_new.png" className="uniform-img" alt="" draggable="false" />
        {player.captain && <span className="chip-c">C</span>}
      </div>
      <div className="chip-meta">
        <div className="chip-name">{player.name}</div>
        {showRomaji && <div className="chip-roman">{player.nameRoman}</div>}
        {showClub && <div className="chip-club">{player.club}</div>}
      </div>
      <div className={'chip-pos-tag role-' + player.pos}>{player.pos}</div>
    </div>
  );
}

function SlotPickerModal({ slot, assignments, players, onPick, onRemove, onClose }) {
  const currentPlayerId = assignments[slot.id];
  const placedIds = new Set(Object.values(assignments));

  const bench = players.filter(p => !placedIds.has(p.id));
  const benchMatch = bench.filter(p => p.pos === slot.role);
  const benchOther = bench.filter(p => p.pos !== slot.role);
  const pitchOthers = players.filter(p => placedIds.has(p.id) && p.id !== currentPlayerId);

  const PlayerRow = ({ p, placed }) => (
    <button className={'picker-player' + (placed ? ' picker-placed' : '')} onClick={() => onPick(p.id)}>
      <img src="screens/uniicon_new.png" className="picker-player-icon" alt="" draggable="false" />
      <div className="picker-player-info">
        <span className="picker-player-name">{p.name}{p.captain ? '  ©' : ''}</span>
        <span className="picker-player-club">{p.club}</span>
      </div>
      <span className={'role-tag role-' + p.pos}>{p.pos}</span>
    </button>
  );

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-handle" />
        <div className="picker-hdr">
          <div className="picker-hdr-info">
            <span className={'role-tag role-' + slot.role}>{slot.role}</span>
            <span className="picker-hdr-label">{slot.label} に配置</span>
          </div>
          {currentPlayerId && <button className="picker-remove" onClick={onRemove}>外す</button>}
          <button className="picker-close" onClick={onClose}>✕</button>
        </div>
        <div className="picker-list">
          {benchMatch.map(p => <PlayerRow key={p.id} p={p} />)}
          {benchOther.map(p => <PlayerRow key={p.id} p={p} />)}
          {pitchOthers.length > 0 && <>
            <div className="picker-section-label">ピッチ上から入れ替え</div>
            {pitchOthers.map(p => <PlayerRow key={p.id} p={p} placed />)}
          </>}
        </div>
      </div>
    </div>
  );
}

function SlotMarker({ slot, hinted }) {
  return (
    <div className={'slot-empty' + (hinted ? ' slot-empty-hint' : '')}>
      <div className="slot-ring" />
      <div className="slot-label">{slot.label}</div>
    </div>
  );
}

function Pitch({ slots, assignments, players, draggingPlayerId, selectedPlayerId, onPointerStart, onSlotTap, pitchStyle, showRomaji }) {
  const playerById = useMemo(() => Object.fromEntries(players.map(p => [p.id, p])), [players]);
  return (
    <div className={'pitch-wrap pitch-' + pitchStyle}>
      <div className="pitch-inner">
        <span className="pitch-tap-hint">タップで選択</span>
        <Field />
        {slots.map(slot => {
          const placedId = assignments[slot.id];
          const placed = placedId ? playerById[placedId] : null;
          const hinted = (draggingPlayerId || selectedPlayerId) && !placed;
          return (
            <div
              key={slot.id}
              className={'slot' + (hinted ? ' is-hinted' : '')}
              style={{ left: slot.x + '%', top: slot.y + '%' }}
              data-drop="slot"
              data-slot-id={slot.id}
              onClick={() => onSlotTap(slot.id)}
            >
              {placed ? (
                <PitchChip
                  player={placed}
                  isSelected={selectedPlayerId === placed.id}
                  isDragging={draggingPlayerId === placed.id}
                  isDimmed={draggingPlayerId && draggingPlayerId !== placed.id}
                  onPointerStart={onPointerStart}
                  showRomaji={showRomaji}
                />
              ) : (
                <SlotMarker slot={slot} hinted={hinted} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field() {
  return (
    <svg className="pitch-svg" viewBox="0 0 100 150" preserveAspectRatio="none">
      <rect x="2" y="2" width="96" height="146" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <line x1="2" y1="75" x2="98" y2="75" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <circle cx="50" cy="75" r="9" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <circle cx="50" cy="75" r="0.7" fill="rgba(255,255,255,0.7)" />
      <rect x="22" y="2" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <rect x="34" y="2" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <circle cx="50" cy="13" r="0.7" fill="rgba(255,255,255,0.7)" />
      <path d="M 38 18 A 10 10 0 0 0 62 18" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <rect x="22" y="132" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <rect x="34" y="142" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <circle cx="50" cy="137" r="0.7" fill="rgba(255,255,255,0.7)" />
      <path d="M 38 132 A 10 10 0 0 1 62 132" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <path d="M 2 4 A 2 2 0 0 1 4 2" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <path d="M 96 2 A 2 2 0 0 1 98 4" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <path d="M 98 146 A 2 2 0 0 1 96 148" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
      <path d="M 4 148 A 2 2 0 0 1 2 146" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
    </svg>
  );
}

function Bench({ players, placedIds, draggingPlayerId, selectedPlayerId, onPointerStart, onBenchTap, showRomaji, showClub }) {
  const [filter, setFilter] = useState('ALL');
  const grouped = groupByRole(players); // all 26

  const availableByRole = {};
  for (const r of ROLE_ORDER) availableByRole[r] = grouped[r].filter(p => !placedIds.has(p.id)).length;

  const visibleRoles = filter === 'ALL' ? ROLE_ORDER : [filter];
  const benchCount = players.length - placedIds.size;

  return (
    <aside
      className="bench"
      data-drop="bench"
      onClick={(e) => {
        if (e.target.closest('.chip')) return;
        onBenchTap();
      }}
    >
      <div className="bench-hdr">
        <div className="bench-hdr-row">
          <div className="bench-hdr-label">
            <span className="dot dot-red" />
            選手一覧<span className="bench-hdr-count">{benchCount}/{players.length}</span>
          </div>
          <div className="bench-hdr-hint">
            <span className="hint-mob">← 横にスクロール</span>
            <span className="hint-desk">ポジションをタップして配置</span>
          </div>
        </div>
        <div className="filter-tabs">
          {['ALL', ...ROLE_ORDER].map(t => (
            <button
              key={t}
              className={'filter-tab' + (filter === t ? ' active' : '') + ' filter-' + t}
              onClick={() => setFilter(t)}
            >
              {t}{t !== 'ALL' ? <span className="filter-count">{availableByRole[t]}</span> : null}
            </button>
          ))}
        </div>
      </div>
      <div className="bench-list">
        {visibleRoles.map(role => (
          <div key={role} className="bench-group">
            <div className="bench-group-title">
              <span className={'role-tag role-' + role}>{role}</span>
              <span className="bench-group-name">{ROLE_LABELS[role]}</span>
              <span className="bench-group-count">{availableByRole[role]}/{grouped[role].length}</span>
            </div>
            <div className="bench-group-chips">
              {grouped[role].map(p => (
                <BenchChip
                  key={p.id}
                  player={p}
                  isPlaced={placedIds.has(p.id)}
                  isSelected={selectedPlayerId === p.id}
                  isDragging={draggingPlayerId === p.id}
                  isDimmed={draggingPlayerId && draggingPlayerId !== p.id}
                  onPointerStart={onPointerStart}
                  showRomaji={showRomaji}
                  showClub={showClub}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DragGhost({ drag, players }) {
  if (!drag) return null;
  const p = players.find(pp => pp.id === drag.playerId);
  if (!p) return null;
  return (
    <div
      className={'drag-ghost' + (p.captain ? ' is-captain' : '')}
      style={{ left: drag.x, top: drag.y }}
    >
      <div className="chip-jersey ghost-jersey">
        <img src="screens/uniicon_new.png" className="uniform-img" alt="" draggable="false" />
        {p.captain && <span className="chip-c">C</span>}
      </div>
      <div className="ghost-name">{p.name}</div>
    </div>
  );
}

function FormationInfo({ formation, filledCount, selectedName }) {
  return (
    <footer className="ftr">
      <div className="ftr-row">
        <div className="ftr-formation">
          <span className="ftr-label">FORMATION</span>
          <span className="ftr-value">{formation.label}</span>
          <span className="ftr-tag">{formation.tagline}</span>
        </div>
        <div className="ftr-progress">
          {selectedName && (
            <div className="ftr-selected">
              <span className="ftr-selected-dot" />
              <span><b>{selectedName}</b> を選択中 — 配置先をタップ</span>
            </div>
          )}
          <div className="ftr-bar"><div className="ftr-bar-fill" style={{ width: (filledCount / 11 * 100) + '%' }} /></div>
          <span className="ftr-pct">{filledCount}/11</span>
        </div>
      </div>
    </footer>
  );
}

function Toast({ children }) {
  return (
    <div className="toast">
      <div className="toast-burst" />
      <div className="toast-text">{children}</div>
    </div>
  );
}

const UA = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(UA) && !window.MSStream;
const isSafari = isIOS && /Safari/.test(UA) && !/CriOS|FxiOS|EdgiOS/.test(UA);
const isIOSChrome = isIOS && /CriOS/.test(UA);
const isAndroid = /Android/.test(UA);

function SaveModal({ formation, assignments, players, onClose }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [dlState, setDlState] = useState('idle');
  const canvasRef = useRef(null);

  useEffect(() => {
    buildShareCard({ formation, assignments, players }).then(canvas => {
      canvasRef.current = canvas;
      setImgUrl(canvas.toDataURL('image/png'));
    });
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDlState('downloading');
    canvas.toBlob(blob => {
      if (!blob) { setDlState('error'); return; }
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `samurai-blue-xi-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setDlState('done');
      } catch { setDlState('error'); }
    }, 'image/png');
  };

  const btnLabel = dlState === 'downloading' ? '処理中…'
    : dlState === 'done' ? '✓ ダウンロード完了！'
    : dlState === 'error' ? '⚠ もう一度試してください'
    : '⬇ 画像をダウンロード';

  return (
    <div className="save-overlay" onClick={onClose}>
      <div className="save-modal" onClick={e => e.stopPropagation()}>
        <div className="save-modal-hdr">
          <span>📷 スタメン保存</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="save-preview-wrap">
          {imgUrl
            ? <img src={imgUrl} alt="スタメン" />
            : <div className="save-generating">画像を生成中…</div>
          }
        </div>
        <div className="save-modal-ftr">
          {isIOS
            ? imgUrl && <div className="save-hint" style={{fontSize:'13px',color:'rgba(255,255,255,.75)',padding:'10px 4px',textAlign:'center',lineHeight:1.7}}>
                👆 画像を長押し →「写真に追加」でカメラロールに保存できます
              </div>
            : <>
                <button
                  className="save-dl-btn"
                  onClick={handleDownload}
                  disabled={!imgUrl || dlState === 'downloading'}
                >
                  {btnLabel}
                </button>
                {isAndroid && imgUrl && <div className="save-hint">💡 ダウンロード後、ギャラリーアプリに自動で追加されます</div>}
              </>
          }
        </div>
      </div>
    </div>
  );
}

function FavoritesModal({ favorites, filledCount, onSaveCurrent, onLoad, onDelete, onClose }) {
  const [favName, setFavName] = useState('');
  const fmt = (ts) => {
    const d = new Date(ts);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  };
  const handleSave = () => {
    onSaveCurrent(favName.trim());
    setFavName('');
  };
  return (
    <div className="fav-overlay" onClick={onClose}>
      <div className="fav-modal" onClick={e => e.stopPropagation()}>
        <div className="fav-hdr">
          <span>⭐ お気に入り</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="fav-save-row">
          <input
            className="fav-name-input"
            type="text"
            placeholder="スタメン名（省略可）"
            value={favName}
            onChange={e => setFavName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && filledCount > 0) handleSave(); }}
            maxLength={40}
            disabled={filledCount === 0}
          />
          <button className="fav-save-btn" onClick={handleSave} disabled={filledCount === 0}>
            ＋ 現在のスタメンを保存
          </button>
        </div>
        {favorites.length === 0
          ? <div className="fav-empty">保存されたスタメンはありません</div>
          : <div className="fav-list">
              {favorites.map(f => (
                <div key={f.id} className="fav-item">
                  <div className="fav-item-info">
                    <div className="fav-item-name">{f.name}</div>
                    <div className="fav-item-meta">{f.formationId} · {f.filledCount}/11人 · {fmt(f.savedAt)}</div>
                  </div>
                  <div className="fav-item-btns">
                    <button className="fav-load-btn" onClick={() => onLoad(f)}>読み込む</button>
                    <button className="fav-del-btn" onClick={() => onDelete(f.id)}>削除</button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

function CompletionModal({ onSave, onClose }) {
  return (
    <div className="comp-overlay" onClick={onClose}>
      <div className="comp-modal" onClick={e => e.stopPropagation()}>
        <div className="comp-flag">🇯🇵</div>
        <div className="comp-title">スタメン11人完成！</div>
        <div className="comp-sub">最強のイレブンが揃った！</div>
        <button className="comp-save-btn" onClick={onSave}>
          📷 スタメンを保存する
        </button>
        <button className="comp-later-btn" onClick={onClose}>
          あとで保存する
        </button>
      </div>
    </div>
  );
}

function TweaksUI({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="ピッチスタイル">
        <TweakRadio
          value={tweaks.pitchStyle}
          options={[
            { value: 'grass', label: '芝' },
            { value: 'blueprint', label: '青写真' },
            { value: 'night', label: 'ナイター' },
          ]}
          onChange={(v) => setTweak('pitchStyle', v)}
        />
      </TweakSection>
      <TweakSection label="アクセントカラー">
        <TweakColor
          value={tweaks.accent}
          options={['#ff2d4a', '#ffd84a', '#46e0b6', '#7c5cff']}
          onChange={(v) => setTweak('accent', v)}
        />
      </TweakSection>
      <TweakSection label="表示オプション">
        <TweakToggle label="所属クラブを表示" value={tweaks.showClub} onChange={(v) => setTweak('showClub', v)} />
        <TweakToggle label="ローマ字名を表示" value={tweaks.showRomaji} onChange={(v) => setTweak('showRomaji', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

// ============================================================
// App
// ============================================================
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [formationId, setFormationId] = useState('3-4-2-1');
  const [assignments, setAssignments] = useState({});
  const [toast, setToast] = useState(null);
  const [showSave, setShowSave] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [pickingSlot, setPickingSlot] = useState(null);
  const favs = useFavorites();

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = SAVE_STYLES;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  const formation = FORMATIONS.find(f => f.id === formationId);
  const slots = formation.slots;
  const placedIds = new Set(Object.values(assignments));
  const filledCount = Object.keys(assignments).length;

  // ----- handlers -----
  const handleDropSlot = useCallback((slotId, playerId) => {
    setAssignments(prev => {
      const next = { ...prev };
      const incumbent = next[slotId];
      let oldSlot = null;
      for (const k of Object.keys(next)) {
        if (next[k] === playerId) { oldSlot = k; delete next[k]; }
      }
      if (incumbent === playerId) return prev; // dropped on self
      next[slotId] = playerId;
      if (incumbent && oldSlot) next[oldSlot] = incumbent;
      return next;
    });
    dnd.setSelected(null);
  }, []);

  const handleDropBench = useCallback((playerId) => {
    setAssignments(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (next[k] === playerId) delete next[k];
      }
      return next;
    });
    dnd.setSelected(null);
  }, []);

  // Init DnD hook
  const dnd = usePointerDnD({ onDropSlot: handleDropSlot, onDropBench: handleDropBench });

  // tap on slot → open picker
  const handleSlotTap = useCallback((slotId) => {
    dnd.setSelected(null);
    setPickingSlot(slotId);
  }, []);

  const handlePickPlayer = useCallback((playerId) => {
    handleDropSlot(pickingSlot, playerId);
    setPickingSlot(null);
  }, [pickingSlot, handleDropSlot]);

  const handleRemoveFromSlot = useCallback(() => {
    if (assignments[pickingSlot]) handleDropBench(assignments[pickingSlot]);
    setPickingSlot(null);
  }, [pickingSlot, assignments, handleDropBench]);

  // tap on bench background — return selected to bench
  const handleBenchTap = useCallback(() => {
    if (dnd.selected && placedIds.has(dnd.selected)) {
      handleDropBench(dnd.selected);
    }
  }, [dnd.selected, placedIds, handleDropBench]);

  // formation change — preserve players by role
  const changeFormation = useCallback((newId) => {
    setFormationId(prevId => {
      const prevForm = FORMATIONS.find(f => f.id === prevId);
      const newForm = FORMATIONS.find(f => f.id === newId);
      setAssignments(prevAssign => {
        const placedByRole = { GK: [], DF: [], MF: [], FW: [] };
        for (const [slotId, pid] of Object.entries(prevAssign)) {
          const slot = prevForm.slots.find(s => s.id === slotId);
          if (slot) placedByRole[slot.role].push(pid);
        }
        const newSlotsByRole = { GK: [], DF: [], MF: [], FW: [] };
        for (const s of newForm.slots) newSlotsByRole[s.role].push(s);
        const next = {};
        for (const r of ROLE_ORDER) {
          const sl = newSlotsByRole[r];
          const pl = placedByRole[r];
          const n = Math.min(sl.length, pl.length);
          for (let i = 0; i < n; i++) next[sl[i].id] = pl[i];
        }
        return next;
      });
      return newId;
    });
  }, []);

  const onReset = () => { setAssignments({}); dnd.setSelected(null); };

  const onSaveFavorite = (customName) => {
    const d = new Date();
    const ds = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
    favs.save({
      id: Date.now(),
      name: customName || `${formation.label}  ${ds}`,
      formationId,
      assignments: { ...assignments },
      filledCount,
      savedAt: Date.now(),
    });
    setToast({ msg: '⭐ お気に入りに保存しました！', key: Date.now() });
  };

  const onLoadFavorite = (fav) => {
    const form = FORMATIONS.find(f => f.id === fav.formationId);
    if (!form) return;
    setFormationId(fav.formationId);
    setAssignments(fav.assignments);
    setShowFavorites(false);
    setToast({ msg: 'スタメンを読み込みました！', key: Date.now() });
  };

  const onShuffle = () => {
    const slotsByRole = { GK: [], DF: [], MF: [], FW: [] };
    for (const s of slots) slotsByRole[s.role].push(s);
    const used = new Set(Object.values(assignments));
    const next = { ...assignments };
    for (const r of ROLE_ORDER) {
      const empty = slotsByRole[r].filter(s => !next[s.id]);
      const pool = PLAYERS.filter(p => p.pos === r && !used.has(p.id));
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      for (let i = 0; i < empty.length && i < pool.length; i++) {
        next[empty[i].id] = pool[i].id;
        used.add(pool[i].id);
      }
    }
    for (const s of slots) {
      if (!next[s.id]) {
        const cand = PLAYERS.find(p => !used.has(p.id));
        if (cand) { next[s.id] = cand.id; used.add(cand.id); }
      }
    }
    setAssignments(next);
  };

  // celebrate at 11
  const prev = useRef(0);
  useEffect(() => {
    if (filledCount === 11 && prev.current !== 11) setShowCompletion(true);
    prev.current = filledCount;
  }, [filledCount]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // accent var
  useEffect(() => { document.documentElement.style.setProperty('--accent', tweaks.accent); }, [tweaks.accent]);

  const selectedPlayer = dnd.selected ? PLAYERS.find(p => p.id === dnd.selected) : null;

  return (
    <div className="app" data-pitch={tweaks.pitchStyle}>
      <div className="bg" />
      <Header />
      <FormationBar
        formations={FORMATIONS}
        currentId={formationId}
        onChange={changeFormation}
        onReset={onReset}
        onFavorites={() => setShowFavorites(true)}
        onSave={() => setShowSave(true)}
        filledCount={filledCount}
      />
      <main className="main">
        <div className="pitch-col">
          <Pitch
            slots={slots}
            assignments={assignments}
            players={PLAYERS}
            draggingPlayerId={dnd.drag?.playerId}
            selectedPlayerId={dnd.selected}
            onPointerStart={dnd.begin}
            onSlotTap={handleSlotTap}
            pitchStyle={tweaks.pitchStyle}
            showRomaji={tweaks.showRomaji}
          />
          <div className="pitch-progress">
            <div className="pitch-progress-bar">
              <div className="pitch-progress-fill" style={{ width: (filledCount / 11 * 100) + '%' }} />
            </div>
            <span className="pitch-progress-count">{filledCount}/11</span>
          </div>
        </div>
        <Bench
          players={PLAYERS}
          placedIds={placedIds}
          draggingPlayerId={dnd.drag?.playerId}
          selectedPlayerId={dnd.selected}
          onPointerStart={dnd.begin}
          onBenchTap={handleBenchTap}
          showRomaji={tweaks.showRomaji}
          showClub={tweaks.showClub}
        />
      </main>
      <DragGhost drag={dnd.drag} players={PLAYERS} />
      {toast && <Toast key={toast.key}>{toast.msg}</Toast>}
      {pickingSlot && (
        <SlotPickerModal
          slot={formation.slots.find(s => s.id === pickingSlot)}
          assignments={assignments}
          players={PLAYERS}
          onPick={handlePickPlayer}
          onRemove={handleRemoveFromSlot}
          onClose={() => setPickingSlot(null)}
        />
      )}
      {showFavorites && (
        <FavoritesModal
          favorites={favs.favorites}
          filledCount={filledCount}
          onSaveCurrent={onSaveFavorite}
          onLoad={onLoadFavorite}
          onDelete={favs.remove}
          onClose={() => setShowFavorites(false)}
        />
      )}
      {showCompletion && (
        <CompletionModal
          onSave={() => { setShowCompletion(false); setShowSave(true); }}
          onClose={() => setShowCompletion(false)}
        />
      )}
      {showSave && (
        <SaveModal
          formation={formation}
          assignments={assignments}
          players={PLAYERS}
          onClose={() => setShowSave(false)}
        />
      )}
      <TweaksUI tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
