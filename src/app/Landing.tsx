import React from 'react';
import { ArrowUpRight, ArrowRight, BookOpen, Search, NotebookPen, Download, Palette, Accessibility, Pause, Play, CheckCircle2, Sigma, Bookmark, Compass } from 'lucide-react';
import { useBook } from '@/stores/useBook';
import { EDITIONS } from '@/themes/themes';
import { downloadCompleteBook, promptInstall, cacheAppShell, isOfflineReady } from '@/services/offline';
import { totalTopics, totalMinutes, CHAPTERS, allTopics, searchBook } from '@/data';
import './semester.css';

export default function Landing({ onTools }: { onTools: (tab?: string) => void }) {
  const { go, openTopic, lastTopic, edition, reducedMotion, completed } = useBook();
  const [paused, setPaused] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [ready, setReady] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const topics = allTopics();
  const last = topics.find(({ topic }) => topic.id === lastTopic);
  const next = topics.find(({ topic }) => !completed.includes(topic.id)) ?? topics[0];
  const target = last ?? next;
  const done = topics.filter(({ topic }) => completed.includes(topic.id)).length;
  const hits = React.useMemo(() => searchBook(query), [query]);
  React.useEffect(() => { isOfflineReady().then(setReady); }, []);
  /* ambient interaction layer */
  React.useEffect(() => {
    const root = document.querySelector<HTMLElement>('.semester-home');
    if (!root) return;
    const move = (e: PointerEvent) => {
      root.style.setProperty('--px', `${(e.clientX / window.innerWidth) * 100}%`);
      root.style.setProperty('--py', `${(e.clientY / window.innerHeight) * 100}%`);
    };
    const scroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty('--study-scroll', `${max > 0 ? (window.scrollY / max) * 100 : 0}%`);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scroll);
    };
  }, []);
  const install = async () => {
    setBusy(true);
    try {
      const message = await promptInstall();
      const cached = await cacheAppShell();
      setReady(cached);
      setMsg(cached ? message + ' Book saved for offline reading.' : 'Offline storage is unavailable. You can still download the complete book.');
    } catch { setMsg('Could not save the book offline. Please try the complete-book download.'); }
    finally { setBusy(false); }
  };
  return <main id="main" className="semester-home">
    <header className="semester-nav">
      <a className="semester-brand" href="#main" aria-label="Semester One home"><span><BookOpen size={22}/></span><b>SEMESTER<span>ONE / PHYSICS</span></b></a>
      <nav aria-label="Study navigation"><button onClick={() => go('library')}>Chapters</button><button onClick={() => onTools('formulas')}>Formula atlas</button><button onClick={() => go('notes')}>Notebook</button></nav>
      <button className="semester-search" onClick={() => onTools('search')} aria-label="Search the book"><Search size={18}/><span>Search the book</span></button>
    </header>
    <section className="semester-hero">
      <div className="semester-intro">
        <p className="semester-eyebrow"><span/> AN INTERACTIVE FIELD GUIDE · B.SC. PHYSICS</p>
        <h1>A little curiosity.<br/>An entire <em>universe.</em></h1>
        <p className="semester-lead">The Living Physics Book</p>
        <p className="semester-description">See the mathematics. Move the models. Understand the laws.<br/>Your first semester, brought to life.</p>
        <div className="semester-actions"><button className="semester-primary" onClick={() => openTopic(target.chapter.id, target.topic.id)}>{last ? 'Continue learning' : 'Begin your journey'}<ArrowUpRight size={19}/></button><button className="semester-link" onClick={() => go('library')}>Explore chapters <ArrowRight size={17}/></button></div>
        <div className="semester-stats"><div><strong>04</strong><span>CONNECTED CHAPTERS</span></div><div><strong>{totalTopics}</strong><span>TOPICS TO EXPLORE</span></div><div><strong>~{Math.round(totalMinutes / 60)}h</strong><span>GUIDED LEARNING</span></div></div>
      </div>
      <div className={'semester-scene' + (paused || reducedMotion ? ' is-still' : '')}>
        <div className="scene-caption">VOL. 01 <span>MATHEMATICS × MECHANICS</span></div>
        <div className="book-stage" aria-hidden="true"><div className="book-halo"/><div className="physics-volume"><div className="volume-pages"/><div className="volume-cover"><div className="volume-top">THE INTERACTIVE EDITION <span>01</span></div><p>The Living<br/>Physics<br/><i>Book.</i></p><div className="volume-orbit"><i/><i/><i/><b/></div><div className="volume-bottom">MATHEMATICAL PHYSICS<br/>& CLASSICAL MECHANICS<span>B.SC. · SEMESTER I</span></div></div></div><span className="floating-equation equation-one">F = ma</span><span className="floating-equation equation-two">∇ · F</span></div>
        <div className="scene-bottom"><span>IDEAS YOU CAN INTERACT WITH</span><button onClick={() => setPaused(!paused)} aria-label={paused ? 'Play book animation' : 'Pause book animation'} aria-pressed={paused}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button></div>
      </div>
    </section>
    <section className="semester-resume" aria-label="Your study progress"><span className="resume-icon"><Compass size={25}/></span><div><p>{last ? 'PICK UP WHERE YOU LEFT OFF' : 'YOUR FIRST SMALL STEP'}</p><h2>{target.topic.title}</h2><span>Unit {target.chapter.unit} · {target.topic.minutes} minute lesson</span></div><div className="resume-progress"><span>{done} of {totalTopics} topics complete <b>{Math.round(done / totalTopics * 100)}%</b></span><progress value={done} max={totalTopics}/></div><button className="semester-link" onClick={() => openTopic(target.chapter.id, target.topic.id)}>{last ? 'Resume lesson' : 'Start lesson'}<ArrowRight size={18}/></button></section>
    <section className="semester-chapters"><div className="semester-section-title"><div><p className="semester-eyebrow">THE SYLLABUS, REIMAGINED</p><h2>Four doors to understanding.</h2></div><button className="semester-link" onClick={() => go('library')}>View all topics <ArrowUpRight size={18}/></button></div>
      <div className="chapter-grid">{CHAPTERS.map((c,i) => { const count=c.topics.filter(t=>completed.includes(t.id)).length; return <button key={c.id} className={'chapter-door chapter-door-'+i} onClick={() => go('library',c.id)}><div className="door-heading"><span>UNIT 0{c.unit}</span><ArrowUpRight size={21}/></div><div className="door-art" aria-hidden="true">{['∫','∇','F = ma','◎'][i]}<span>{['CHANGE / ACCUMULATION','DIRECTION / FIELDS','FORCE / MOTION','GRAVITY / ORBITS'][i]}</span></div><h3>{c.title}</h3><p>{c.topics.length} topics · {count} complete</p><div className="door-progress"><span style={{width:`${count/c.topics.length*100}%`}}/></div></button>})}</div>
    </section>
    <section className="semester-workbench"><div><p className="semester-eyebrow">LESS SEARCHING. MORE UNDERSTANDING.</p><h2>Your study workbench.</h2><p>Jump to a concept, collect your thoughts, or revisit the essentials before an exam.</p><label className="concept-search"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try Newton, gradient, or integral…" aria-label="Find a physics topic"/><kbd>SEARCH</kbd></label>{query.trim().length>=2 && <div className="concept-results" aria-live="polite">{hits.length ? hits.slice(0,5).map(hit=><button key={hit.topicId} onClick={()=>openTopic(hit.chapterId,hit.topicId)}><span>{hit.title}<small>{hit.chapter}</small></span><ArrowUpRight size={18}/></button>) : <p>No topics found. Try a broader term.</p>}</div>}</div><div className="workbench-grid">{[{icon:Sigma,title:'Formula atlas',description:'Equations, with context.',action:()=>onTools('formulas')},{icon:NotebookPen,title:'Your notebook',description:'Make the ideas your own.',action:()=>go('notes')},{icon:Bookmark,title:'Saved topics',description:'Return to what matters.',action:()=>onTools('marks')},{icon:CheckCircle2,title:'Learning progress',description:'See how far you’ve come.',action:()=>onTools('progress')}].map(x=><button key={x.title} onClick={x.action}><x.icon size={23}/><strong>{x.title}</strong><span>{x.description}</span><ArrowUpRight size={16}/></button>)}</div></section>
    <section className="semester-offline"><div><Download size={26}/><div><h2>Your book. Anywhere.</h2><p>{ready ? 'Saved on this device for offline reading.' : 'Save the complete book, including its interactive simulations.'}</p></div></div><div className="offline-actions"><button className="btn" onClick={install} disabled={busy}>{busy ? 'Saving…' : ready ? 'Install offline app' : 'Save for offline'}</button><button className="btn btn-primary" onClick={downloadCompleteBook}>Download complete book <ArrowUpRight size={16}/></button></div>{msg && <p role="status" className="offline-message">{msg}</p>}</section>
    <footer className="semester-footer"><span>THE LIVING PHYSICS BOOK <small>Made for curious minds. Built for deeper understanding.</small></span><div><button onClick={()=>onTools('themes')}><Palette size={16}/>{EDITIONS.find(e=>e.id===edition)?.name}</button><button onClick={()=>onTools('settings')}><Accessibility size={16}/>Accessibility</button></div></footer>
  </main>;
}
