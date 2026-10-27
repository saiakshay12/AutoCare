(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const body = document.body;
  const toast = $('.toast'); let toastTimer;
  function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
  
  const progress=$('.scroll-progress i');
  function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%'}
  addEventListener('scroll',updateProgress,{passive:true});updateProgress();
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>revealObserver.observe(el));
  const nav=$('.mobile-nav'),navScrim=$('.nav-scrim');
  function toggleNav(open){nav.classList.toggle('open',open);navScrim.classList.toggle('open',open);body.classList.toggle('locked',open);nav.setAttribute('aria-hidden',String(!open))}
  $('.menu-toggle').addEventListener('click',()=>toggleNav(true));$('.mobile-close').addEventListener('click',()=>toggleNav(false));navScrim.addEventListener('click',()=>toggleNav(false));$$('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>toggleNav(false)));
  const search=$('.search-panel'),panelScrim=$('.panel-scrim');
  function toggleSearch(open){search.classList.toggle('open',open);panelScrim.classList.toggle('open',open);body.classList.toggle('locked',open);if(open)setTimeout(()=>$('#search-input').focus(),250)}
  $('.search-trigger').addEventListener('click',()=>toggleSearch(true));$('.search-close').addEventListener('click',()=>toggleSearch(false));
  const cart=$('.cart-drawer');let cartItems=[];
  function toggleCart(open){cart.classList.toggle('open',open);panelScrim.classList.toggle('open',open);body.classList.toggle('locked',open)}
  $('.cart-trigger').addEventListener('click',()=>toggleCart(true));$('.cart-close').addEventListener('click',()=>toggleCart(false));
  panelScrim.addEventListener('click',()=>{toggleSearch(false);toggleCart(false)});
  function renderCart(){const count=cartItems.reduce((sum,item)=>sum+item.qty,0);$$('.cart-count').forEach(el=>el.textContent=count);$('.cart-count-inline').textContent=`(${count})`;$('.cart-total').textContent='₹'+cartItems.reduce((sum,item)=>sum+item.price*item.qty,0).toLocaleString('en-IN');const box=$('.cart-items');if(!cartItems.length){box.innerHTML='<p class="empty-cart">Your cart is taking a pit stop.<br><small>Add a part and it’ll show up here.</small></p>';return}box.innerHTML=cartItems.map(item=>`<div class="cart-row"><div><b>${item.name}</b><small>Qty ${item.qty} · ₹${item.price.toLocaleString('en-IN')} each</small></div><strong>₹${(item.price*item.qty).toLocaleString('en-IN')}</strong><button data-remove="${item.name}">Remove item</button></div>`).join('');$$('[data-remove]',box).forEach(btn=>btn.addEventListener('click',()=>{cartItems=cartItems.filter(item=>item.name!==btn.dataset.remove);renderCart()}))}
  function addProduct(name,price){const existing=cartItems.find(item=>item.name===name);existing?existing.qty++:cartItems.push({name,price:Number(price),qty:1});renderCart();notify(`${name} added to your cart`)}
  $$('[data-product]').forEach(btn=>btn.addEventListener('click',()=>addProduct(btn.dataset.product,btn.dataset.price)));
  $('.checkout-button').addEventListener('click',()=>notify(cartItems.length?'Checkout is a demo — no payment was taken.':'Your cart is empty'));
  $('.search-panel form').addEventListener('submit',e=>{e.preventDefault();const q=$('#search-input').value.trim().toLowerCase();if(!q){notify('Type a service or part to search');return}const match=[...$$('.service-card'),...$$('.product-card')].find(el=>el.innerText.toLowerCase().includes(q));toggleSearch(false);if(match){match.scrollIntoView({behavior:'smooth',block:'center'});match.classList.add('search-highlight');setTimeout(()=>match.classList.remove('search-highlight'),1500)}else notify('No exact match — try “engine”, “brake” or “filter”.')});
  const backdrop=$('.modal-backdrop');
  let authMode='login';
  function authOpen(open){backdrop.classList.toggle('open',open);body.classList.toggle('locked',open);if(open)setTimeout(()=>$('#auth-form input:not([type=checkbox])')?.focus(),180)}
  function setAuthMode(mode){
    authMode=mode;
    const signup=mode==='signup';
    $('#auth-title').textContent=signup?'Create your account.':'Sign in.';
    $('.auth-form > .eyebrow').innerHTML='<span class="eyebrow-dot"></span> '+(signup?'JOIN THE AUTO CARE CLUB':'WELCOME BACK');
    $('.auth-form > p:not(.eyebrow)').textContent=signup?'A better ownership experience starts here.':'Enter your details to continue.';
    $('.auth-name-field').hidden=!signup;
    $('.auth-name-field input').required=signup;
    $('#auth-form [name="password"]').autocomplete=signup?'new-password':'current-password';
    $('.auth-options').hidden=signup;
    $('.auth-submit').innerHTML=(signup?'Create account':'Sign in')+' <span>↗</span>';
    $('.auth-switch').innerHTML=signup?'Already have an account? <button type="button" class="signup-switch">Sign in</button>':'New to Auto Care? <button type="button" class="signup-switch">Create account</button>';
    $('.signup-switch').addEventListener('click',()=>setAuthMode(authMode==='login'?'signup':'login'));
  }
  $$('[data-open="login"]').forEach(btn=>btn.addEventListener('click',()=>{setAuthMode('login');authOpen(true)}));
  $('.auth-close').addEventListener('click',()=>authOpen(false));
  backdrop.addEventListener('click',e=>{if(e.target===backdrop)authOpen(false)});
  $('.signup-switch').addEventListener('click',()=>setAuthMode('signup'));
  $('.forgot-button').addEventListener('click',()=>notify('Password recovery is not connected in this front-end demo.'));
  $('#auth-form').addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(e.currentTarget);
    const email=String(data.get('email')||'').trim();
    const password=String(data.get('password')||'');
    const name=String(data.get('name')||'').trim();
    if(!email || !password || (authMode==='signup'&&!name)){notify('Please fill in all required fields.');return}
    const displayName=authMode==='signup'?name:(email.split('@')[0]||'Driver');
    // Frontend-only demo: accepts any validly formatted email and any non-empty password.
    sessionStorage.setItem('autocare-demo-user',JSON.stringify({name:displayName,email}));
    authOpen(false);
    notify(authMode==='signup'?`Welcome to Auto Care, ${displayName}!`:`Welcome back, ${displayName}!`);
    e.currentTarget.reset();
    setAuthMode('login');
  });
  $$('.service-book').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.service-card');$('#booking-form select').value=card.dataset.service;$('#booking').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#booking-form input[name="name"]').focus({preventScroll:true}),700)}));
  $('#booking-date').min=new Date().toISOString().split('T')[0];
  $('#booking-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);notify(`Thanks ${data.get('name')} — your ${data.get('service')} request is ready (demo).`);e.currentTarget.reset()});
  $('#newsletter-form').addEventListener('submit',e=>{e.preventDefault();$('#newsletter-message').textContent='You’re on the list — thanks for joining.';e.currentTarget.reset()});
  const reviews=[['Finally, a service team that explains everything clearly and treats my car like their own.','Arjun R.','Customer since 2022 · Hyderabad','AR'],['Booked a service in minutes. The team was professional, on time and genuinely helpful.','Meera S.','Customer since 2023 · Chennai','MS'],['Clear pricing, genuine parts and no pressure. Exactly how car care should feel.','Rahul K.','Customer since 2021 · Hyderabad','RK']];let reviewIndex=0;
  function showReview(i){reviewIndex=(i+reviews.length)%reviews.length;const r=reviews[reviewIndex];$('blockquote').textContent='“'+r[0]+'”';$('.quote-author b').textContent=r[1];$('.quote-author small').textContent=r[2];$('.author-avatar').textContent=r[3]}
  $('.quote-prev').addEventListener('click',()=>showReview(reviewIndex-1));$('.quote-next').addEventListener('click',()=>showReview(reviewIndex+1));
  const statObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const el=entry.target,target=Number(el.dataset.count),duration=1200,start=performance.now();function tick(now){const p=Math.min((now-start)/duration,1);el.textContent=Math.round(target*(1-Math.pow(1-p,3))).toLocaleString('en-IN');if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick);statObserver.unobserve(el)}}),{threshold:.5});$$('[data-count]').forEach(el=>statObserver.observe(el));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggleNav(false);toggleSearch(false);toggleCart(false);authOpen(false)}});
})();


/* ===== PRELOADER + OPTIMISED MOTION LAYER ===== */
(()=>{
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],body=document.body;
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches,calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const raf=requestAnimationFrame;
  // ---- HUD preloader (real load + minimum display time)
  const L=$('.loader');
  function ready(){body.classList.add('ready');body.classList.remove('locked')}
  if(L){
    body.classList.add('locked');
    const ticks=$('.ticks',L);for(let i=0;i<48;i++){const a=i/48*Math.PI*2,l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',60+Math.cos(a)*57);l.setAttribute('y1',60+Math.sin(a)*57);l.setAttribute('x2',60+Math.cos(a)*59.5);l.setAttribute('y2',60+Math.sin(a)*59.5);ticks.append(l)}
    const tk=$$('line',ticks),num=$('.ld-pct b',L),arc=$('.r1',L),bar=$('.ld-bar i',L),st=$('.ld-status',L);
    const msgs=[[0,'INITIALIZING SYSTEMS'],[22,'RUNNING ENGINE DIAGNOSTICS'],[48,'LOADING PARTS CATALOG'],[72,'CALIBRATING BRAKE SENSORS'],[94,'ALL SYSTEMS READY']];
    let loaded=false,p=0,shown=-1,t0=performance.now();addEventListener('load',()=>loaded=true);setTimeout(()=>loaded=true,4500);
    (function step(now){
      const t=now-t0,target=loaded&&t>1900?100:Math.min(88,t/2300*88);p+=(target-p)*.07;if(target===100&&p>99.5)p=100;
      const v=Math.round(p);if(v!==shown){shown=v;num.textContent=v;arc.setAttribute('stroke-dasharray',p.toFixed(1)+' 100');bar.style.transform=`scaleX(${p/100})`;
        const n=Math.round(p/100*48);tk.forEach((l,i)=>l.classList.toggle('on',i<n));st.textContent=msgs.filter(m=>p>=m[0]).pop()[1]}
      if(p<100)raf(step);else{L.classList.add('ok');setTimeout(()=>{L.classList.add('done');ready();setTimeout(()=>L.remove(),1200)},450)}
    })(t0);
  }else addEventListener('load',ready);
  // ---- kinetic headline
  const h1=$('.hero h1');let wi=0;
  if(h1)[...h1.childNodes].forEach(n=>{if(n.nodeType===3){const f=document.createDocumentFragment();n.textContent.trim().split(/\s+/).filter(Boolean).forEach(w=>{const o=document.createElement('span');o.className='w';o.innerHTML=`<span class="wi" style="--i:${wi++}">${w}</span>`;f.append(o,' ')});n.replaceWith(f)}});
  // ---- RPM gauge (runs only while hero is visible)
  const hero=$('.hero');
  if(hero){
    const arcP='d="M30.72 140A80 80 0 1 1 169.28 140" pathLength="100"';
    hero.insertAdjacentHTML('beforeend',`<div class="gauge" aria-hidden="true"><svg viewBox="0 0 200 200"><circle class="bg" cx="100" cy="100" r="96"/><path class="g-track" ${arcP}/><path class="g-red" ${arcP} stroke-dasharray="20 100" stroke-dashoffset="-80"/><path class="g-val" ${arcP} stroke-dasharray="0 100"/><line class="g-needle" x1="100" y1="100" x2="100" y2="36"/><circle cx="100" cy="100" r="7" fill="#17181d" stroke="#ff303b" stroke-width="2"/><text x="100" y="146">0</text><text class="u" x="100" y="162">RPM × 100</text></svg></div>`);
    const gg=$('.gauge'),gv=$('.g-val'),gn=$('.g-needle'),gt=$('.gauge text');let p=0,hov=false,s=0,vis=true,last=-1;
    new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(hero);
    gg.addEventListener('pointerenter',()=>hov=true);gg.addEventListener('pointerleave',()=>hov=false);
    (function loop(now){raf(loop);if(!vis||!gg.offsetParent||!body.classList.contains('ready'))return;s=s||now;const t=(now-s)/1000;
      const target=calm?34:t<1.4?100*(1-Math.pow(1-t/1.4,3)):t<2.3?100:hov?96:34+Math.sin(t*1.7)*3+Math.sin(t*6)*1.2;
      p+=(target-p)*.1;const v=Math.round(p*10);if(v===last)return;last=v;
      gv.setAttribute('stroke-dasharray',`${Math.max(p,.6).toFixed(1)} 100`);gn.style.transform=`rotate(${(-120+p*2.4).toFixed(1)}deg)`;gt.textContent=Math.round(p*.8)})(0);
  }
  // ---- header, scrollspy, parallax (cached offsets, rAF-throttled)
  const hd=$('.site-header'),links=$$('.desktop-nav a'),secs=links.map(a=>$(a.getAttribute('href'))),fv=$('.feature-visual'),fimg=fv&&$('img',fv),hi=$('.hero-image');
  const toTop=document.createElement('button');toTop.className='to-top';toTop.setAttribute('aria-label','Back to top');toTop.textContent='↑';toTop.onclick=()=>scrollTo({top:0,behavior:'smooth'});body.append(toTop);
  let tops=[],fvVis=false,lastY=scrollY,tick=false;
  const calc=()=>{tops=secs.map(el=>el?el.getBoundingClientRect().top+scrollY:1e9)};calc();addEventListener('resize',calc);addEventListener('load',calc);
  if(fv)new IntersectionObserver(e=>fvVis=e[0].isIntersecting).observe(fv);
  function onScroll(){tick=false;const y=scrollY,d=y-lastY;
    hd.classList.toggle('scrolled',y>40);
    if(Math.abs(d)>8){hd.classList.toggle('hide',d>0&&y>500&&!body.classList.contains('locked'));lastY=y}
    let idx=0;tops.forEach((t,i)=>{if(y+innerHeight*.4>=t)idx=i});links.forEach((a,i)=>a.classList.toggle('active',i===idx));
    toTop.classList.toggle('show',y>800);
    if(!calm){if(hi&&y<1000)hi.style.setProperty('--py',Math.min(y*.15,90)+'px');if(fvVis&&fimg){const r=fv.getBoundingClientRect();fimg.style.setProperty('--py',((r.top+r.height/2-innerHeight/2)*-.07).toFixed(1)+'px')}}}
  addEventListener('scroll',()=>{if(!tick){tick=true;raf(onScroll)}},{passive:true});onScroll();
  // ---- staggered reveals
  const rv=[...$$('.trust-item'),...$$('.footer-main>*'),...$$('.quote-section>*:not(.quote-controls)'),$('.brand-strip')].filter(Boolean);
  rv.forEach((el,i)=>{el.classList.add('rv');el.style.setProperty('--d',(i%4)*.09+'s')});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});rv.forEach(el=>io.observe(el));
  // ---- cards: tilt (rAF-throttled), buttons: magnetic, cursor ring (idle-aware)
  const cards=$$('.service-card,.product-card');
  const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('settled'),1200);so.unobserve(e.target)}}),{threshold:.1});cards.forEach(c=>so.observe(c));
  if(fine&&!calm){
    cards.forEach(c=>{c.classList.add('tilt');let pend=0,ev;
      c.addEventListener('pointermove',e=>{ev=e;if(pend)return;pend=raf(()=>{pend=0;const r=c.getBoundingClientRect(),px=(ev.clientX-r.left)/r.width,py=(ev.clientY-r.top)/r.height;c.style.setProperty('--mx',(px*100).toFixed(0)+'%');c.style.setProperty('--my',(py*100).toFixed(0)+'%');c.style.transform=`perspective(900px) translateY(-8px) rotateX(${((.5-py)*6).toFixed(2)}deg) rotateY(${((px-.5)*8).toFixed(2)}deg)`})});
      c.addEventListener('pointerleave',()=>{pend=0;c.style.transform=''})});
    $$('.button,.login-button').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.translate=`${((e.clientX-r.left-r.width/2)*.16).toFixed(1)}px ${((e.clientY-r.top-r.height/2)*.25).toFixed(1)}px`});b.addEventListener('pointerleave',()=>b.style.translate='')});
    const ring=document.createElement('div');ring.className='cursor-ring';body.append(ring);let x=0,y=0,rx=0,ry=0,run=false;
    function f(){rx+=(x-rx)*.2;ry+=(y-ry)*.2;ring.style.transform=`translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;if(Math.abs(x-rx)+Math.abs(y-ry)>.5)raf(f);else run=false}
    addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;ring.classList.add('on');if(!run){run=true;raf(f)}},{passive:true});
    document.addEventListener('pointerover',e=>ring.classList.toggle('big',!!e.target.closest('a,button,.service-card,.product-card,input,select')));
  }
  // ---- ripple, fly-to-cart, testimonials, marquee
  document.addEventListener('pointerdown',e=>{const b=e.target.closest('.button,.add-cart,.login-button');if(!b)return;const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,o=document.createElement('span');o.className='ripple';o.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.append(o);setTimeout(()=>o.remove(),650)});
  $$('[data-product]').forEach(b=>b.addEventListener('click',()=>{hd.classList.remove('hide');const cart=$('.cart-trigger');cart.classList.remove('bump');void cart.offsetWidth;cart.classList.add('bump');if(calm)return;
    const a=b.getBoundingClientRect(),c=cart.getBoundingClientRect(),d=document.createElement('i');d.className='fly';d.style.cssText=`left:${a.left+a.width/2}px;top:${a.top+a.height/2}px`;body.append(d);
    d.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${c.left+c.width/2-a.left-a.width/2}px),calc(-50% + ${c.top+c.height/2-a.top-a.height/2}px)) scale(.3)`,opacity:.4}],{duration:750,easing:'cubic-bezier(.5,-.3,.7,.6)'}).onfinish=()=>d.remove()}));
  const swap=()=>['blockquote','.quote-author'].forEach(s=>{const el=$(s);el.classList.remove('swap');void el.offsetWidth;el.classList.add('swap')});
  $$('.quote-prev,.quote-next').forEach(b=>b.addEventListener('click',swap));
  const qs=$('.quote-section'),go=()=>{if(!document.hidden)$('.quote-next').click()};let auto=setInterval(go,7000);
  qs.addEventListener('pointerenter',()=>clearInterval(auto));qs.addEventListener('pointerleave',()=>{clearInterval(auto);auto=setInterval(go,7000)});
  const bw=$('.brand-words');
  if(bw&&!calm){const tr=document.createElement('div');tr.className='mq-track';[...bw.children].forEach(c=>tr.append(c));const cl=[...tr.children].map(c=>{const k=c.cloneNode(true);k.setAttribute('aria-hidden','true');return k});tr.append(...cl);bw.classList.add('marquee');bw.append(tr)}
})();
