(() => {
  const data = {
    evolucaoPortfolio: {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      values: [36, 37, 38, 39, 40, 41, 41, 42, 42, 42, 43, 43],
    },
    pendencias: {
      conclusaoPercent: 78,
    },
  };

  function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  function getDevicePixelRatio() {
    return Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  }

  function setupHiDpiCanvas(canvas, cssWidth, cssHeight) {
    const dpr = getDevicePixelRatio();
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function drawLineChart(canvas, labels, values) {
    const cssW = canvas.clientWidth || 620;
    const cssH = Math.max(240, Math.floor(cssW * 0.42));
    const ctx = setupHiDpiCanvas(canvas, cssW, cssH);

    const w = cssW;
    const h = cssH;
    const pad = { l: 42, r: 18, t: 18, b: 40 };
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1, max - min);

    const xAt = (i) => pad.l + (innerW * i) / (values.length - 1);
    const yAt = (v) => {
      const t = (v - min) / range;
      return pad.t + innerH * (1 - t);
    };

    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(47,58,74,0.12)";
    for (let g = 0; g <= 4; g++) {
      const y = pad.t + (innerH * g) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();
    }

    const gradFill = ctx.createLinearGradient(0, pad.t, 0, pad.t + innerH);
    gradFill.addColorStop(0, "rgba(183,255,42,0.30)");
    gradFill.addColorStop(1, "rgba(45,252,150,0.06)");

    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(values[0]));
    for (let i = 1; i < values.length; i++) ctx.lineTo(xAt(i), yAt(values[i]));
    ctx.lineTo(xAt(values.length - 1), pad.t + innerH);
    ctx.lineTo(xAt(0), pad.t + innerH);
    ctx.closePath();
    ctx.fillStyle = gradFill;
    ctx.fill();

    const gradLine = ctx.createLinearGradient(pad.l, 0, w - pad.r, 0);
    gradLine.addColorStop(0, "rgba(183,255,42,0.96)");
    gradLine.addColorStop(1, "rgba(45,252,150,0.92)");
    ctx.strokeStyle = gradLine;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(values[0]));
    for (let i = 1; i < values.length; i++) ctx.lineTo(xAt(i), yAt(values[i]));
    ctx.stroke();

    for (let i = 0; i < values.length; i++) {
      const x = xAt(i);
      const y = yAt(values[i]);
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.strokeStyle = "rgba(15,23,42,0.16)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(47,58,74,0.72)";
    ctx.font = "800 12px Onest, system-ui, -apple-system, 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i < labels.length; i++) {
      const x = xAt(i);
      ctx.fillText(labels[i], x, pad.t + innerH + 10);
    }
  }

  function drawDonut(canvas, percent) {
    const size = Math.min(canvas.parentElement?.clientWidth ?? 240, 240);
    const ctx = setupHiDpiCanvas(canvas, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    const thickness = size * 0.14;
    const start = -Math.PI / 2;
    const end = start + (Math.PI * 2 * percent) / 100;

    ctx.clearRect(0, 0, size, size);

    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(47,58,74,0.14)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "rgba(183,255,42,0.98)");
    grad.addColorStop(1, "rgba(45,252,150,0.94)");
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.stroke();

    ctx.fillStyle = "rgba(15,23,42,0.86)";
    ctx.font = "1000 34px Onest, system-ui, -apple-system, 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(percent)}%`, cx, cy - 4);

    ctx.fillStyle = "rgba(15,23,42,0.64)";
    ctx.font = "900 11px Onest, system-ui, -apple-system, 'Segoe UI'";
    ctx.fillText("Concluídos", cx, cy + 22);
  }

  function setupScrollAnimation() {
    if (prefersReducedMotion()) return;

    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.section, .card, .panel, .ribbonCard, .summaryCard');
    elementsToAnimate.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
      
      if (!isInViewport) {
        el.classList.add('scroll-fade-in');
        observer.observe(el);
      }
    });
  }

  function setupScrollRevealBlur() {
    if (prefersReducedMotion()) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const blurObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const elementsForBlur = document.querySelectorAll('.section__head, .section__title, .section__desc, .card__title, .card__metric, .panel__title, .ribbon__title, .ribbon__desc');
    elementsForBlur.forEach(el => {
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1;
      
      if (!isInViewport) {
        el.classList.add('scroll-reveal-blur');
        blurObserver.observe(el);
      }
    });
  }

  function init() {
    const lineCanvas = document.getElementById("portfolioChart");
    if (lineCanvas) {
      drawLineChart(lineCanvas, data.evolucaoPortfolio.labels, data.evolucaoPortfolio.values);
      const redraw = () => drawLineChart(lineCanvas, data.evolucaoPortfolio.labels, data.evolucaoPortfolio.values);
      window.addEventListener("resize", () => {
        window.clearTimeout(init._t);
        init._t = window.setTimeout(redraw, 120);
      });
    }

    const donutCanvas = document.getElementById("completionDonut");
    if (donutCanvas) {
      drawDonut(donutCanvas, data.pendencias.conclusaoPercent);
      const redraw = () => drawDonut(donutCanvas, data.pendencias.conclusaoPercent);
      window.addEventListener("resize", () => {
        window.clearTimeout(init._t2);
        init._t2 = window.setTimeout(redraw, 120);
      });
    }

    document.getElementById("btnScrollResumo")?.addEventListener("click", () => scrollToId("resumo"));

    document.querySelectorAll("a[href^='#']").forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href.length < 2) return;
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        scrollToId(id);
      });
    });

    const btnScrollUp = document.getElementById("btnScrollUp");
    const btnScrollDown = document.getElementById("btnScrollDown");
    
    function findCurrentSection() {
      const sections = document.querySelectorAll("section");
      const currentScroll = window.pageYOffset + window.innerHeight / 3;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= currentScroll) {
          return { current: sections[i], index: i, all: sections };
        }
      }
      return { current: sections[0], index: 0, all: sections };
    }
    
    if (btnScrollUp) {
      btnScrollUp.addEventListener("click", () => {
        const { current, index, all } = findCurrentSection();
        
        if (index > 0) {
          const previousSection = all[index - 1];
          previousSection.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start"
          });
        } else {
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion() ? "auto" : "smooth"
          });
        }
      });
    }

    if (btnScrollDown) {
      btnScrollDown.addEventListener("click", () => {
        const { current, index, all } = findCurrentSection();
        
        if (index < all.length - 1) {
          const nextSection = all[index + 1];
          nextSection.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start"
          });
        } else {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: prefersReducedMotion() ? "auto" : "smooth"
          });
        }
      });
    }

    setupScrollAnimation();
    setupScrollRevealBlur();
  }

  init();
  setupLoadingScreen();
})();

function setupLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  
  if (!loadingScreen) return;

  // Preload the loaded image first
  const loadedImg = new Image();
  loadedImg.src = './imgs/imagem carregada.png';
  
  loadedImg.onload = () => {
    // Once image is loaded, show it with zoom effect after a short delay
    setTimeout(() => {
      loadingScreen.classList.add('image-loaded');
      // Also show CTA
      const loadingCTA = document.getElementById('loadingCTA');
      if (loadingCTA) {
        loadingCTA.classList.add('show');
      }
    }, 1000);
  };
  
  // Fallback: show CTA after 2 seconds even if image doesn't load
  setTimeout(() => {
    const loadingCTA = document.getElementById('loadingCTA');
    if (loadingCTA && !loadingCTA.classList.contains('show')) {
      loadingCTA.classList.add('show');
    }
  }, 2000);
  
  // Also preload unloaded image to ensure smooth transition
  const unloadedImg = new Image();
  unloadedImg.src = './imgs/imagem sem carregar.png';

  function startTransition() {
    if (!loadingScreen.classList.contains('transitioning')) {
      // Force reflow to ensure transitions start
      void loadingScreen.offsetWidth;
      
      loadingScreen.classList.add('transitioning');
      
      // Fade out the loading screen smoothly
      setTimeout(() => {
        loadingScreen.style.transition = 'opacity 1s ease-out, visibility 1s ease-out';
        loadingScreen.style.opacity = '0';
      }, 2200);
      
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        const loadingCTA = document.getElementById('loadingCTA');
        if (loadingCTA) {
          loadingCTA.style.display = 'none';
        }
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        // Show scroll buttons after loading screen is hidden
        setTimeout(() => {
          const scrollButtons = document.querySelector('.scroll-buttons');
          if (scrollButtons) {
            scrollButtons.classList.add('visible');
            scrollButtons.style.cssText = `
              opacity: 1 !important;
              visibility: visible !important;
              pointer-events: auto !important;
              display: flex !important;
              z-index: 10000 !important;
            `;
            console.log('Scroll buttons should be visible now');
          }
        }, 1000);
      }, 3200);
    }
  }

  loadingScreen.addEventListener('click', startTransition);
  
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  
  // Hide scroll buttons initially
  const scrollButtons = document.querySelector('.scroll-buttons');
  if (scrollButtons) {
    scrollButtons.classList.remove('visible');
    scrollButtons.style.opacity = '0';
    scrollButtons.style.visibility = 'hidden';
  }
  
  // Fallback: show buttons after 4 seconds regardless
  setTimeout(() => {
    const scrollButtonsFallback = document.querySelector('.scroll-buttons');
    const loadingScreenCheck = document.getElementById('loadingScreen');
    if (scrollButtonsFallback) {
      if (!loadingScreenCheck || loadingScreenCheck.classList.contains('hidden')) {
        scrollButtonsFallback.classList.add('visible');
        scrollButtonsFallback.style.cssText = `
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          display: flex !important;
          z-index: 10000 !important;
        `;
      }
    }
  }, 4000);
  
  // Show buttons when page loads if no loading screen or if it's already hidden
  function showScrollButtons() {
    const scrollButtons = document.querySelector('.scroll-buttons');
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (scrollButtons) {
      if (!loadingScreen || loadingScreen.classList.contains('hidden')) {
        scrollButtons.classList.add('visible');
        scrollButtons.style.cssText = `
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          display: flex !important;
          z-index: 10000 !important;
        `;
      }
    }
  }
  
  // Check immediately and after a delay
  setTimeout(showScrollButtons, 100);
  setTimeout(showScrollButtons, 3500);
}

