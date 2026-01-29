(function () {
  if (typeof THREE === 'undefined') return;

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setClearColor(0xffffff, 1);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

  var stripeCount = 40;
  var stripeSize = 0.07;
  var noiseZoom = 0.90;
  var speed = 0.05;

  var uniforms = {
    time: { value: 0 },
    stripe_count: { value: stripeCount },
    stripe_size: { value: stripeSize },
    noise_zoom: { value: noiseZoom },
    speed: { value: speed },
  };

  var vShader = document.getElementById('vertexShader');
  var fShader = document.getElementById('fragmentShader');
  if (!vShader || !fShader) return;

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vShader.textContent,
    fragmentShader: fShader.textContent,
    depthWrite: false,
  });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  var start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  function animate(t) {
    requestAnimationFrame(animate);
    var now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    uniforms.time.value = (now - start) * 0.001 * speed;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
