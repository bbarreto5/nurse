(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  /* ---------- ECG waveform: sum of gaussians (P, Q, R, S, T) ---------- */
  const g = (x, mu, w, a) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
  const ecg = (p) =>
    g(p, 0.16, 0.025, 0.12) - g(p, 0.285, 0.008, 0.14) + g(p, 0.3, 0.011, 1) -
    g(p, 0.318, 0.01, 0.28) + g(p, 0.5, 0.04, 0.26);

  // Build static SVG paths (hero + contact)
  const beatW = 240;
  let d = "";
  for (let x = 0; x <= 2400; x += 2) {
    const y = 62 - ecg((x % beatW) / beatW) * 52;
    d += (x ? "L" : "M") + x + " " + y.toFixed(1);
  }
  document.querySelectorAll(".ecg-base, .ecg-sweep").forEach((p) => p.setAttribute("d", d));

  /* ---------- Split title letters ---------- */
  let i = 0;
  document.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-hidden", "true");
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--i", i++);
      s.textContent = c;
      el.appendChild(s);
    });
  });

  document.querySelectorAll(".checklist li").forEach((li, n) => li.style.setProperty("--i", n));
  document.querySelectorAll(".capsule").forEach((c, n) => c.style.setProperty("--i", n));

  /* ---------- Preloader ---------- */
  body.classList.add("is-loading");
  const preloader = document.querySelector(".preloader");
  const start = () => {
    preloader.classList.add("is-done");
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
  };
  if (reduceMotion) start();
  else window.addEventListener("load", () => setTimeout(start, 1300));
  // Safety net in case "load" is slow (fonts / slow network)
  setTimeout(() => body.classList.contains("is-ready") || start(), 4000);

  /* ---------- Nav ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Reveal on scroll (with stagger via --d) ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = (parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0) * 110;
        setTimeout(() => el.classList.add("is-in"), delay);
        io.unobserve(el);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal, .capsules").forEach((el) => io.observe(el));

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1600;
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Monitor: clock + live ECG sweep ---------- */
  const clock = document.querySelector("[data-clock]");
  const pad = (n) => String(n).padStart(2, "0");
  const tickClock = () => {
    const n = new Date();
    clock.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  };
  tickClock();
  setInterval(tickClock, 1000);

  const canvas = document.querySelector("[data-ecg]");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1, x = 0, lastY = null;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    x = 0; lastY = null;
  };
  resize();
  window.addEventListener("resize", resize);

  const speed = 2.2; // px per frame
  const period = 190; // px per beat
  let phase = 0;
  const draw = () => {
    const r = canvas.getBoundingClientRect();
    const visible = r.bottom > 0 && r.top < window.innerHeight;
    if (visible && W) {
      for (let s = 0; s < speed; s += 1) {
        phase = (phase + 1) % period;
        const y = H * 0.62 - ecg(phase / period) * H * 0.48;
        ctx.clearRect(x, 0, 18, H); // the "eraser" gap ahead of the trace
        if (lastY !== null) {
          ctx.strokeStyle = "#2bbf9f";
          ctx.lineWidth = 2.4;
          ctx.shadowColor = "#2bbf9f";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(x - 1, lastY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        lastY = y;
        x += 1;
        if (x > W) { x = 0; lastY = null; }
      }
    }
    requestAnimationFrame(draw);
  };
  if (!reduceMotion) requestAnimationFrame(draw);
  else {
    // Static trace for reduced motion
    ctx.strokeStyle = "#2bbf9f"; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let px = 0; px < W; px++) {
      const y = H * 0.62 - ecg((px % period) / period) * H * 0.48;
      px ? ctx.lineTo(px, y) : ctx.moveTo(px, y);
    }
    ctx.stroke();
  }

  /* ---------- Timeline fill on scroll ---------- */
  const timeline = document.querySelector(".timeline");
  const fill = document.querySelector(".timeline__fill");
  const onTimeline = () => {
    const r = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const k = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    fill.style.height = k * 100 + "%";
  };
  onTimeline();
  window.addEventListener("scroll", onTimeline, { passive: true });

  /* ---------- Hero parallax on mouse ---------- */
  const floats = document.querySelectorAll(".float");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    window.addEventListener("mousemove", (e) => {
      const mx = e.clientX / window.innerWidth - 0.5;
      const my = e.clientY / window.innerHeight - 0.5;
      floats.forEach((f) => {
        const depth = +f.dataset.depth || 1;
        f.style.transform = `translate(${mx * depth * 40}px, ${my * depth * 40}px)`;
      });
    });

    /* ---------- Custom cursor ---------- */
    const cursor = document.querySelector(".cursor");
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("is-active");
    });
    const follow = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(follow);
    };
    follow();
    document.querySelectorAll("a, button, .capsule, .card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ---------- Copy email + toast ---------- */
  const toast = document.querySelector(".toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2600);
  };
  document.querySelectorAll("[data-copy]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        showToast("✓ Correo copiado. ¡Te espero en tu bandeja!");
      } catch {
        window.location.href = `mailto:${text}`;
      }
    })
  );

  /* ---------- Footer year ---------- */
  document.querySelector("[data-year]").textContent = new Date().getFullYear();
})();
