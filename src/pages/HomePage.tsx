import { Link } from 'react-router-dom'
import { useSongs } from '../context/SongsContext'
import { HomeLyricStage } from '../components/home/HomeLyricStage'

const MODES = [
  { id: '01', name: 'Blok', desc: 'Story tarzı kademeli kelime akışı', tone: 'hp-mode-pink' },
  { id: '02', name: 'Akış', desc: 'Kaydırmalı satır görünümü', tone: 'hp-mode-mint' },
  { id: '03', name: 'Karaoke', desc: 'Kelime kelime yatay vurgu', tone: 'hp-mode-blue' },
]

export function HomePage() {
  const { songs, loading } = useSongs()

  return (
    <div className="hp">
      <div className="hp-topbar">
        <span>SyncLyrics v1</span>
        <span className="hp-topbar-mid">Eşzamanlı söz platformu</span>
        <span>100% ücretsiz</span>
      </div>

      <section className="hp-hero">
        <div className="hp-hero-grid">
          <div className="hp-hero-copy">
            <p className="hp-label">Ana sayfa</p>
            <h1 className="hp-title">
              Sözler
              <br />
              <em>ritimle</em>
              <br />
              buluşsun
            </h1>
            <p className="hp-desc">
              Instagram story estetiğinde eşzamanlı söz oynatıcısı.
              Tarayıcında çalışır, kurulum yok, ücret yok.
            </p>
            <div className="hp-actions">
              <Link to="/editor" className="hp-btn hp-btn-fill">
                Şarkı eşitle →
              </Link>
              <Link to="/library" className="hp-btn hp-btn-line">
                Kütüphane
              </Link>
            </div>
          </div>

          <div className="hp-hero-visual">
            <div className="hp-frame">
              <div className="hp-frame-tag">Canlı demo</div>
              <HomeLyricStage />
            </div>
            <div className="hp-frame-sticker">9:16</div>
          </div>
        </div>
      </section>

      <section className="hp-block">
        <div className="hp-block-head">
          <p className="hp-label">Görünüm</p>
          <h2 className="hp-heading">Üç farklı mod</h2>
        </div>
        <div className="hp-modes">
          {MODES.map((m) => (
            <article key={m.id} className={`hp-mode ${m.tone}`}>
              <span className="hp-mode-id">{m.id}</span>
              <h3>{m.name}</h3>
              <p>{m.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hp-block hp-lib">
        <div className="hp-block-head hp-lib-head">
          <div>
            <p className="hp-label">Kütüphane</p>
            <h2 className="hp-heading">
              {loading
                ? 'Yükleniyor…'
                : songs.length === 0
                  ? 'Henüz şarkı yok'
                  : 'Son şarkıların'}
            </h2>
          </div>
          <Link to="/library" className="hp-link">Tümü →</Link>
        </div>

        {!loading && songs.length === 0 ? (
          <div className="hp-empty">
            <p>İlk şarkını birkaç dakikada eşitle</p>
            <Link to="/editor" className="hp-btn hp-btn-fill">
              Başla
            </Link>
          </div>
        ) : (
          <ul className="hp-tracks">
            {songs.slice(0, 6).map((song, i) => (
              <li key={song.id}>
                <Link to={`/play/${song.id}`} className="hp-track">
                  <span className="hp-track-n">{String(i + 1).padStart(2, '0')}</span>
                  <div
                    className="hp-track-thumb"
                    style={
                      song.backgroundImageUrl
                        ? {
                            backgroundImage: `url(${song.backgroundImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  >
                    {!song.backgroundImageUrl && song.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="hp-track-info">
                    <strong>{song.title}</strong>
                    <span>{song.artist}</span>
                  </div>
                  <span className="hp-track-play">▶</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="hp-end">
        <div className="hp-end-box">
          <h2>Hazır mısın?</h2>
          <p>İlk şarkını eşitle, story modunda izle.</p>
          <div className="hp-actions hp-actions-center">
            <Link to="/editor" className="hp-btn hp-btn-mint">
              Hemen başla
            </Link>
            <Link to="/library" className="hp-btn hp-btn-ghost">
              Kütüphane
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
