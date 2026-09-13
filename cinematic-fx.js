/* =========================================================
   CINEMATIC FX — additive animation & atmosphere layer.
   Purely additive: creates its own elements and listeners,
   never touches existing markup, classes or logic used by
   script.js. Safe to remove this file with zero side effects
   on the rest of the site.
   ========================================================= */
(function(){
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined';
  var hasST = typeof ScrollTrigger !== 'undefined';
  if(hasGSAP && hasST){ gsap.registerPlugin(ScrollTrigger); }

  function run(){

    /* ---------------- 1. Scroll progress bar ---------------- */
    (function scrollProgress(){
      var wrap = document.createElement('div');
      wrap.id = 'fx-progress';
      var bar = document.createElement('div');
      bar.id = 'fx-progress-bar';
      wrap.appendChild(bar);
      document.body.appendChild(wrap);
      function update(){
        var h = document.documentElement;
        var scrolled = h.scrollTop || document.body.scrollTop;
        var max = (h.scrollHeight - h.clientHeight) || 1;
        var pct = Math.min(100, Math.max(0, (scrolled / max) * 100));
        bar.style.width = pct + '%';
      }
      document.addEventListener('scroll', update, { passive:true });
      window.addEventListener('resize', update);
      update();
    })();

    /* ---------------- 2. Film grain + vignette ---------------- */
    (function atmosphere(){
      var vig = document.createElement('div');
      vig.id = 'fx-vignette';
      document.body.appendChild(vig);
      if(!reduceMotion){
        var grain = document.createElement('div');
        grain.id = 'fx-grain';
        document.body.appendChild(grain);
      }
    })();

    /* ---------------- 3. Floating background orbs per section ---------------- */
    (function orbs(){
      var config = [
        { id:'hero',        items:[ {c:'var(--fx-1)', size:260, top:'10%',  left:'62%', op:.18}, {c:'var(--fx-3)', size:180, top:'68%', left:'6%', op:.14} ] },
        { id:'about',       items:[ {c:'var(--fx-2)', size:220, top:'6%',   left:'4%',  op:.14}, {c:'var(--fx-3)', size:160, top:'70%', left:'88%', op:.12} ] },
        { id:'skills',      items:[ {c:'var(--fx-1)', size:200, top:'12%', left:'90%', op:.12} ] },
        { id:'portfolio',   items:[ {c:'var(--fx-3)', size:240, top:'8%',  left:'8%',  op:.12}, {c:'var(--fx-2)', size:180, top:'75%', left:'92%', op:.12} ] },
        { id:'projects',    items:[ {c:'var(--fx-1)', size:210, top:'10%', left:'92%', op:.12} ] },
        { id:'testimonials',items:[ {c:'var(--fx-2)', size:200, top:'80%', left:'6%',  op:.12} ] },
        { id:'contact',     items:[ {c:'var(--fx-3)', size:230, top:'12%', left:'90%', op:.14}, {c:'var(--fx-1)', size:170, top:'78%', left:'4%', op:.12} ] }
      ];
      config.forEach(function(sec, si){
        var el = document.getElementById(sec.id);
        if(!el) return;
        sec.items.forEach(function(o, i){
          var orb = document.createElement('div');
          orb.className = 'fx-orb fx-orb-blur' + (i%2? ' fx-orb-a':' fx-orb-b');
          orb.style.width = o.size + 'px';
          orb.style.height = o.size + 'px';
          orb.style.top = o.top;
          orb.style.left = o.left;
          orb.style.background = o.c;
          orb.style.opacity = o.op;
          orb.style.animationDelay = (si + i) * .7 + 's';
          el.insertBefore(orb, el.firstChild);
        });
      });
    })();

    /* ---------------- 4. Drifting background words (in & out on scroll) ---------------- */
    (function floatingWords(){
      var config = [
        { id:'hero',         words:[ {t:'FOCUS',   top:'14%', left:'68%', size:96}  ] },
        { id:'about',        words:[ {t:'CRAFT',   top:'8%',  left:'58%', size:80}  ] },
        { id:'portfolio',    words:[ {t:'FRAME',   top:'10%', left:'4%',  size:100}, {t:'LIGHT', top:'80%', left:'70%', size:70} ] },
        { id:'projects',     words:[ {t:'VISION',  top:'8%',  left:'55%', size:90}  ] },
        { id:'testimonials', words:[ {t:'TRUST',   top:'12%', left:'6%',  size:84}  ] },
        { id:'contact',      words:[ {t:'CONNECT', top:'10%', left:'42%', size:78}  ] }
      ];
      var els = [];
      config.forEach(function(sec){
        var host = document.getElementById(sec.id);
        if(!host) return;
        sec.words.forEach(function(w){
          var span = document.createElement('div');
          span.className = 'fx-word';
          span.textContent = w.t;
          span.style.top = w.top;
          span.style.left = w.left;
          span.style.fontSize = w.size + 'px';
          host.insertBefore(span, host.firstChild);
          els.push({ el:span, host:host });
        });
      });

      if(!hasGSAP || !hasST){
        // Fallback: simple fade-in via IntersectionObserver, no scrub.
        if('IntersectionObserver' in window){
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
              entry.target.style.transition = 'opacity 1.2s ease';
              entry.target.style.opacity = entry.isIntersecting ? .1 : 0;
            });
          }, { threshold:.2 });
          els.forEach(function(item){ io.observe(item.el); });
        }
        return;
      }

      els.forEach(function(item, idx){
        gsap.set(item.el, { opacity:0, y:40 });
        ScrollTrigger.create({
          trigger:item.host,
          start:'top bottom',
          end:'bottom top',
          scrub:.6,
          onUpdate:function(self){
            // Triangular curve: fades in on entry, peaks mid-section, fades out on exit.
            var p = self.progress;
            var peak = 1 - Math.abs(p - .5) * 2;
            gsap.set(item.el, { opacity: Math.max(0, peak) * .12, y: 40 - peak * 40 });
          }
        });
      });
    })();

    /* ---------------- 5. Extra floating shapes in front of hero + about imagery ---------------- */
    (function frontFloaters(){
      var heroVisual = document.getElementById('hero-visual');
      if(heroVisual){
        var heroShapes = [
          { cls:'fx-shape-ring fx-float-a', w:70,  h:70,  top:'2%',  left:'78%' },
          { cls:'fx-shape-dot fx-float-b',  w:16,  h:16,  top:'82%', left:'12%' },
          { cls:'fx-shape-glass fx-float-a',w:54,  h:54,  top:'70%', left:'82%' }
        ];
        heroShapes.forEach(function(s, i){
          var d = document.createElement('div');
          d.className = 'fx-float-shape ' + s.cls;
          d.style.width = s.w + 'px';
          d.style.height = s.h + 'px';
          d.style.top = s.top;
          d.style.left = s.left;
          d.style.animationDelay = (i * .4) + 's';
          heroVisual.appendChild(d);
        });
      }

      var aboutPortrait = document.querySelector('.about-portrait');
      if(aboutPortrait){
        var aboutShapes = [
          { cls:'fx-shape-dot fx-float-a',  w:14, h:14, top:'6%',  left:'88%' },
          { cls:'fx-shape-ring fx-float-b', w:46, h:46, top:'22%', left:'92%' }
        ];
        aboutShapes.forEach(function(s, i){
          var d = document.createElement('div');
          d.className = 'fx-float-shape ' + s.cls;
          d.style.width = s.w + 'px';
          d.style.height = s.h + 'px';
          d.style.top = s.top;
          d.style.left = s.left;
          d.style.animationDelay = (i * .5) + 's';
          aboutPortrait.appendChild(d);
        });
      }

      // Gentle mouse parallax on the hero floaters, layered on top of the
      // existing portrait parallax in script.js (independent elements).
      if(!reduceMotion && heroVisual && hasGSAP){
        var shapes = heroVisual.querySelectorAll('.fx-float-shape');
        heroVisual.addEventListener('mousemove', function(e){
          var r = heroVisual.getBoundingClientRect();
          var x = (e.clientX - r.left - r.width/2) / r.width;
          var y = (e.clientY - r.top - r.height/2) / r.height;
          shapes.forEach(function(sh, i){
            var depth = 10 + i * 6;
            gsap.to(sh, { x:x*depth, y:y*depth, duration:.6, ease:'power2.out', overwrite:'auto' });
          });
        });
        heroVisual.addEventListener('mouseleave', function(){
          shapes.forEach(function(sh){ gsap.to(sh, { x:0, y:0, duration:.8, ease:'power3.out' }); });
        });
      }
    })();

    /* ---------------- 6. Cinematic wipe-reveal for imagery (incl. dynamic cards) ---------------- */
    (function imageReveal(){
      function attach(container){
        if(!container || container.dataset.fxRevealed) return;
        container.dataset.fxRevealed = '1';
        container.classList.add('fx-reveal-host');
        var panel = document.createElement('div');
        panel.className = 'fx-reveal-panel';
        container.appendChild(panel);
        if(hasGSAP && hasST){
          ScrollTrigger.create({
            trigger:container,
            start:'top 88%',
            once:true,
            onEnter:function(){
              gsap.to(panel, { scaleX:0, duration:1, ease:'power4.inOut' });
            }
          });
        } else {
          panel.style.transition = 'transform 1s cubic-bezier(.16,.84,.44,1)';
          setTimeout(function(){ panel.style.transform = 'scaleX(0)'; }, 300);
        }
      }

      attach(document.querySelector('.hero-portrait-frame'));
      attach(document.querySelector('.about-portrait-img'));

      // Dynamically injected cards (gallery / projects) — watch for them.
      ['gallery','projects-grid'].forEach(function(id){
        var host = document.getElementById(id);
        if(!host) return;
        var selector = id === 'gallery' ? '.g-card-img' : '.p-cover';
        Array.prototype.forEach.call(host.querySelectorAll(selector), attach);
        var mo = new MutationObserver(function(){
          Array.prototype.forEach.call(host.querySelectorAll(selector), attach);
          if(hasST) ScrollTrigger.refresh();
        });
        mo.observe(host, { childList:true, subtree:true });
      });
    })();

    /* ---------------- 7. Interactive tilt on cards ---------------- */
    (function tilt(){
      if(reduceMotion) return;
      var selector = '.skill-card, .a-card, .g-card, .p-card, .fb-card';
      document.addEventListener('mousemove', function(e){
        var card = e.target.closest && e.target.closest(selector);
        if(!card) return;
        if(!card.dataset.fxTiltInit){
          card.dataset.fxTiltInit = '1';
          card.classList.add('fx-tilt');
        }
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        var rx = (-py * 6).toFixed(2);
        var ry = (px * 8).toFixed(2);
        if(hasGSAP){
          gsap.to(card, { rotateX:rx, rotateY:ry, transformPerspective:700, duration:.4, ease:'power2.out', overwrite:'auto' });
        } else {
          card.style.transform = 'perspective(700px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
        }
      }, { passive:true });

      document.addEventListener('mouseout', function(e){
        var card = e.target.closest && e.target.closest(selector);
        if(!card) return;
        var to = e.relatedTarget;
        if(to && card.contains(to)) return;
        if(hasGSAP){
          gsap.to(card, { rotateX:0, rotateY:0, duration:.6, ease:'power3.out' });
        } else {
          card.style.transform = '';
        }
      }, { passive:true });
    })();

    if(hasST){ setTimeout(function(){ ScrollTrigger.refresh(); }, 1200); }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  window.addEventListener('load', function(){ if(hasST) ScrollTrigger.refresh(); });

})();