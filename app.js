// Replace with your GIPHY API key: https://developers.giphy.com/
const GIPHY_API_KEY = 'N6Z1JzsQVxBZ6ljjKgHA5ZRiphqGagIT';
const API_BASE = 'https://api.giphy.com/v1/gifs';

const dom = {
  searchInput: document.getElementById('searchInput'),
  ratingSelect: document.getElementById('ratingSelect'),
  mediaSelect: document.getElementById('mediaSelect'),
  searchBtn: document.getElementById('searchBtn'),
  trendingBtn: document.getElementById('trendingBtn'),
  memeGrid: document.getElementById('memeGrid'),
  viewer: document.getElementById('viewer'),
  viewerImg: document.getElementById('viewerImg'),
  viewerMeta: document.getElementById('viewerMeta'),
  closeModal: document.getElementById('closeModal')
};

// Simple in-memory cache to reduce API calls while browsing
const cache = new Map();
let currentItems = [];
let currentIndex = -1;
let imgObserver = null;

async function fetchGifs({q = '', trending = false, limit = 36, rating = 'g'} = {}){
  const key = `${trending ? 'trending' : 'search'}::${q}::${rating}::${limit}`;
  if(cache.has(key)){
    return cache.get(key);
  }

  const params = new URLSearchParams({api_key: GIPHY_API_KEY, limit, rating});
  const url = trending ? `${API_BASE}/trending?${params}` : `${API_BASE}/search?${params}&q=${encodeURIComponent(q)}`;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('API error');
    const data = await res.json();
    const items = data.data || [];
    cache.set(key, items);
    return items;
  }catch(err){
    console.error(err);
    return [];
  }
}

function chooseMediaUrl(item, mediaType){
  const imgs = item.images || {};
  if(mediaType === 'gif'){
    return (imgs.downsized && imgs.downsized.url) || (imgs.original && imgs.original.url) || item.url;
  }else{
    return (imgs.fixed_height_still && imgs.fixed_height_still.url) || (imgs.downsized_still && imgs.downsized_still.url) || (imgs.preview && imgs.preview.url) || item.url;
  }
}

function ensureObserver(){
  if(imgObserver) return imgObserver;
  imgObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const img = entry.target;
        const src = img.dataset.src;
        if(src){
          img.src = src;
          img.removeAttribute('data-src');
        }
        imgObserver.unobserve(img);
      }
    });
  },{rootMargin:'200px'});
  return imgObserver;
}

function renderMemes(items, mediaType){
  dom.memeGrid.innerHTML = '';
  currentItems = items || [];
  if(!items.length){
    dom.memeGrid.innerHTML = '<p style="color:var(--muted)">No memes found — try another search or lower the rating.</p>';
    return;
  }

  const observer = ensureObserver();

  items.forEach((item, idx) => {
    const url = chooseMediaUrl(item, mediaType);
    const card = document.createElement('article');
    card.className = 'card';
    const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    card.innerHTML = `
      <img loading="lazy" src="${placeholder}" data-src="${url}" alt="${(item.title||'meme').replace(/"/g,'')}">
      <div class="meta"><div class="title">${(item.title||'Untitled')}</div><div class="badge">${item.rating||'NA'}</div></div>
    `;
    card.dataset.index = idx;
    card.addEventListener('click', ()=> openViewerByIndex(idx, mediaType));
    dom.memeGrid.appendChild(card);
    const img = card.querySelector('img');
    observer.observe(img);
  });
}

function openViewerByIndex(index, mediaType){
  if(!currentItems || !currentItems.length) return;
  currentIndex = index;
  const item = currentItems[index];
  const url = chooseMediaUrl(item, mediaType || dom.mediaSelect.value);
  dom.viewerImg.src = url;
  dom.viewerImg.alt = item.title || 'Meme';
  dom.viewerMeta.textContent = `${item.username || 'source'} · Rating: ${item.rating || 'NA'}`;
  dom.viewer.setAttribute('aria-hidden','false');
}

function closeViewer(){
  dom.viewer.setAttribute('aria-hidden','true');
  // clear after a short delay to avoid flicker when quickly reopening
  setTimeout(()=> dom.viewerImg.src = '', 200);
  currentIndex = -1;
}

function nextViewer(){
  if(!currentItems.length) return;
  currentIndex = (currentIndex + 1) % currentItems.length;
  openViewerByIndex(currentIndex);
}

function prevViewer(){
  if(!currentItems.length) return;
  currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
  openViewerByIndex(currentIndex);
}

async function doSearch(){
  const q = dom.searchInput.value.trim();
  const rating = dom.ratingSelect.value;
  const mediaType = dom.mediaSelect.value;
  const items = await fetchGifs({q, trending:false, limit:36, rating});
  renderMemes(items, mediaType);
}

async function loadTrending(){
  const rating = dom.ratingSelect.value;
  const mediaType = dom.mediaSelect.value;
  const items = await fetchGifs({trending:true, limit:36, rating});
  renderMemes(items, mediaType);
}

function attach(){
  dom.searchBtn.addEventListener('click', doSearch);
  dom.searchInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') doSearch(); });
  dom.trendingBtn.addEventListener('click', loadTrending);
  dom.closeModal.addEventListener('click', closeViewer);
  dom.viewer.addEventListener('click', (e)=>{ if(e.target === dom.viewer) closeViewer(); });

  // keyboard navigation
  document.addEventListener('keydown', (e)=>{
    if(dom.viewer.getAttribute('aria-hidden') === 'false'){
      if(e.key === 'ArrowRight') nextViewer();
      if(e.key === 'ArrowLeft') prevViewer();
      if(e.key === 'Escape') closeViewer();
    }
  });
}

function init(){
  attach();
  loadTrending();
}

document.addEventListener('DOMContentLoaded', init);
