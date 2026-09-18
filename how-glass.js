(() => {
  const section = document.getElementById('how-it-works');
  const canvas = document.getElementById('how-glass-canvas');
  const grid = section?.querySelector('.steps-grid');
  const heroSection = document.querySelector('.hero-section');
  const heroCanvas = document.getElementById('hero-glass-canvas');
  if (!section || !canvas || !grid) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!motion.matches && 'IntersectionObserver' in window) {
    grid.classList.add('motion-ready');
    new IntersectionObserver(([entry], observer) => {
      if (entry.isIntersecting) {
        grid.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.25 }).observe(grid);
  } else {
    grid.classList.add('is-visible');
  }

  function initBlobs(surface, layer, isHero) {
  const gl = layer.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) return;
  const vertexSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;
    uniform float parallax;
    uniform float narrow;
    uniform float hero;
    float blob(vec2 uv, vec2 center, vec2 radius, float phase) {
      vec2 p = (uv - center) / radius;
      float angle = atan(p.y, p.x);
      float wobble = 0.06 * sin(angle * 3.0 + phase) + 0.04 * sin(angle * 5.0 - phase);
      float edge = length(p) + wobble;
      return 1.0 - smoothstep(0.3, 1.25, edge);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      float drift = sin(time * 0.35) * 0.018;
      vec2 a = mix(vec2(0.16, 0.36), vec2(0.28, 0.72), narrow);
      vec2 b = mix(vec2(0.49, 0.36), vec2(0.7, 0.48), narrow);
      vec2 c = mix(vec2(0.83, 0.36), vec2(0.29, 0.21), narrow);
      a = mix(a, vec2(0.59, 0.53), hero);
      b = mix(b, vec2(0.87, 0.2), hero);
      c = mix(c, vec2(0.22, 0.38), hero);
      a += vec2(drift, parallax);
      b += vec2(-drift * 0.8, -parallax * 0.7);
      c += vec2(drift * 0.6, parallax * 0.5);
      vec2 radius = mix(vec2(0.15, 0.25), vec2(0.3, 0.14), narrow);
      radius = mix(radius, vec2(0.22, 0.31), hero);
      float first = blob(uv, a, radius, time * 0.25);
      float second = blob(uv, b, radius, time * 0.2 + 2.0);
      float third = blob(uv, c, radius, time * 0.22 + 4.0);
      vec3 sage = vec3(0.66, 0.76, 0.67);
      vec3 green = vec3(0.29, 0.48, 0.36);
      vec3 color = (sage * first + green * second + sage * third) / max(first + second + third, 0.001);
      float alpha = min(0.36, first * 0.28 + second * 0.23 + third * 0.28);
      gl_FragColor = vec4(color, alpha);
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  surface.classList.add('has-webgl-blobs');

  const vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const parallax = gl.getUniformLocation(program, 'parallax');
  const narrow = gl.getUniformLocation(program, 'narrow');
  const hero = gl.getUniformLocation(program, 'hero');
  let visible = false;
  let frame = 0;
  function render(now = 0) {
    const scale = Math.min(1, 900 / Math.max(1, layer.clientWidth));
    const width = Math.max(1, Math.round(layer.clientWidth * scale));
    const height = Math.max(1, Math.round(layer.clientHeight * scale));
    if (layer.width !== width || layer.height !== height) {
      layer.width = width;
      layer.height = height;
      gl.viewport(0, 0, width, height);
    }
    const rect = surface.getBoundingClientRect();
    const offset = motion.matches ? 0 : Math.max(-0.05, Math.min(0.05, (window.innerHeight / 2 - rect.top - rect.height / 2) / rect.height * 0.04));
    gl.uniform2f(resolution, width, height);
    gl.uniform1f(time, motion.matches ? 0 : now / 1000);
    gl.uniform1f(parallax, offset);
    gl.uniform1f(narrow, window.innerWidth < 768 ? 1 : 0);
    gl.uniform1f(hero, isHero ? 1 : 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(render);
  }
  function update() {
    cancelAnimationFrame(frame);
    if (visible && !document.hidden) render(performance.now());
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }).observe(surface);
  } else {
    visible = true;
  }
  document.addEventListener('visibilitychange', update);
  window.addEventListener('resize', update);
  motion.addEventListener('change', update);
  layer.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    surface.classList.remove('has-webgl-blobs');
  });
  update();
  }
  initBlobs(section, canvas, false);
  if (heroSection && heroCanvas) initBlobs(heroSection, heroCanvas, true);
  const nav = document.querySelector('.glass-nav');
  if (nav) {
    const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }
})();
