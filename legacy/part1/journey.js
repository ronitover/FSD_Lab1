(() => {
  const canvas = document.getElementById('journey-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
  if (!gl) return;

  const vertexSource = `
    attribute vec3 position;
    attribute vec3 normal;
    uniform vec3 center;
    uniform vec3 size;
    uniform float turn;
    uniform float aspect;
    varying float light;
    void main() {
      float c = cos(turn), s = sin(turn);
      vec3 p = position * size;
      p = vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z) + center;
      vec3 n = normalize(normal / max(size, vec3(0.001)));
      n = vec3(c*n.x + s*n.z, n.y, -s*n.x + c*n.z);
      light = 0.55 + 0.45 * max(dot(n, normalize(vec3(-0.45, 0.85, 0.7))), 0.0);
      vec3 view = vec3(p.x, p.y*0.90 - p.z*0.44, p.y*0.44 + p.z*0.90);
      gl_Position = vec4(view.x / (4.7 * aspect), view.y / 1.85, view.z / 12.0, 1.0);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform vec3 color;
    varying float light;
    void main() { gl_FragColor = vec4(color * light, 1.0); }
  `;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      gl.deleteShader(result);
      return null;
    }
    return result;
  }
  const vertex = shader(gl.VERTEX_SHADER, vertexSource);
  const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  canvas.parentElement.classList.add('webgl-ready');

  const positions = gl.getAttribLocation(program, 'position');
  const normals = gl.getAttribLocation(program, 'normal');
  const uniforms = {
    center: gl.getUniformLocation(program, 'center'),
    size: gl.getUniformLocation(program, 'size'),
    turn: gl.getUniformLocation(program, 'turn'),
    aspect: gl.getUniformLocation(program, 'aspect'),
    color: gl.getUniformLocation(program, 'color')
  };
  function mesh(vertices) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return { buffer, count: vertices.length / 6 };
  }
  function add(out, a, b, c, n) {
    for (const p of [a, b, c]) out.push(...p, ...n);
  }
  function box() {
    const out = [];
    const faces = [
      [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],
      [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],
      [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]],
      [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],
      [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],
      [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]]
    ];
    for (const [a,b,c,d,n] of faces) { add(out,a,b,c,n); add(out,a,c,d,n); }
    return mesh(out);
  }
  function sphere() {
    const out = [], steps = 18, rings = 12;
    const point = (u,v) => [Math.cos(u)*Math.sin(v), Math.cos(v), Math.sin(u)*Math.sin(v)];
    const tri = (a,b,c) => { for (const p of [a,b,c]) out.push(...p,...p); };
    for (let i=0; i<rings; i++) for (let j=0; j<steps; j++) {
      const a=point(j*2*Math.PI/steps,i*Math.PI/rings);
      const b=point((j+1)*2*Math.PI/steps,i*Math.PI/rings);
      const c=point(j*2*Math.PI/steps,(i+1)*Math.PI/rings);
      const d=point((j+1)*2*Math.PI/steps,(i+1)*Math.PI/rings);
      tri(a,c,b); tri(b,c,d);
    }
    return mesh(out);
  }
  function disk() {
    const out=[];
    for (let i=0;i<32;i++) {
      const a=i*2*Math.PI/32, b=(i+1)*2*Math.PI/32;
      add(out,[0,0,0],[Math.cos(a),0,Math.sin(a)],[Math.cos(b),0,Math.sin(b)],[0,1,0]);
    }
    return mesh(out);
  }
  const cube=box(), ball=sphere(), plate=disk();
  gl.enable(gl.DEPTH_TEST);
  function draw(shape, center, size, color, turn=0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);
    gl.enableVertexAttribArray(positions);
    gl.vertexAttribPointer(positions,3,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(normals);
    gl.vertexAttribPointer(normals,3,gl.FLOAT,false,24,12);
    gl.uniform3fv(uniforms.center,center);
    gl.uniform3fv(uniforms.size,size);
    gl.uniform3fv(uniforms.color,color);
    gl.uniform1f(uniforms.turn,turn);
    gl.drawArrays(gl.TRIANGLES,0,shape.count);
  }

  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible=true, frame=0, dragging=false, lastX=0, rotation=0;
  function render(now=0) {
    const scale=Math.min(window.devicePixelRatio||1,2);
    const width=Math.max(1,Math.round(canvas.clientWidth*scale));
    const height=Math.max(1,Math.round(canvas.clientHeight*scale));
    if (canvas.width!==width||canvas.height!==height) {
      canvas.width=width; canvas.height=height; gl.viewport(0,0,width,height);
    }
    gl.uniform1f(uniforms.aspect,Math.max(0.95,Math.min(1.1,width/height/2.35)));
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const seconds=motion.matches?3.5:now/1000;
    const progress=(seconds%9)/9;
    const x=-2.9+5.8*progress;
    const hover=0.08*Math.sin(seconds*3);
    const spin=rotation+(motion.matches?0:seconds*0.65);

    draw(cube,[0,-0.66,-0.18],[3.02,0.025,0.035],[0.67,0.76,0.64]);
    for (const station of [-2.9,0,2.9]) {
      draw(plate,[station,-0.65,0],[0.62,1,0.43],[0.29,0.42,0.30]);
      draw(ball,[station,-0.59,0],[0.11,0.11,0.11],[0.91,0.54,0.31]);
    }
    draw(cube,[x,0.02+hover,0],[0.47,0.35,0.34],[0.68,0.40,0.22],spin);
    draw(cube,[x,0.38+hover,0],[0.49,0.055,0.36],[0.91,0.63,0.36],spin);
    draw(ball,[x-0.24,0.55+hover,0],[0.18,0.19,0.18],[0.91,0.54,0.31],spin);
    draw(ball,[x+0.17,0.57+hover,-0.12],[0.20,0.20,0.20],[0.79,0.28,0.20],spin);
    draw(ball,[x+0.12,0.55+hover,0.17],[0.16,0.18,0.16],[0.62,0.72,0.30],spin);
    draw(ball,[x-0.24,0.75+hover,0],[0.07,0.035,0.11],[0.25,0.48,0.27],spin);
    if (!motion.matches&&visible&&!document.hidden) frame=requestAnimationFrame(render);
  }
  function update() {
    cancelAnimationFrame(frame);
    if (visible&&!document.hidden) render(performance.now());
  }
  canvas.addEventListener('pointerdown',event=>{
    dragging=true; lastX=event.clientX; canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if (!dragging) return;
    rotation+=(event.clientX-lastX)*0.015; lastX=event.clientX;
    if (motion.matches) update();
  });
  canvas.addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();}).observe(canvas);
  }
  document.addEventListener('visibilitychange',update);
  motion.addEventListener('change',update);
  window.addEventListener('resize',update);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault(); cancelAnimationFrame(frame);
    canvas.parentElement.classList.remove('webgl-ready');
  });
  update();
})();
