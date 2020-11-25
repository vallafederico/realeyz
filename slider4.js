class Sketch {
    constructor() {
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance", alpha:true});
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.width, this.height);
      this.renderer.setClearColor(0x111111, 0);
      this.renderer.physicallyCorrectLights = true;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      this.container = document.getElementById("c");
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.container.appendChild(this.renderer.domElement);

      this.group = new THREE.Group();

      this.camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        .1,
        1000
      );
      this.camera.position.set(0, 0, 0.1);
      // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
      this.time = 0;
      this.paused = false;

      this.count = null;
      this.totsli;

      // Call'em!
      this.setupResize();
      this.tabEvents();

      this.isSliding = false;


      this.addObjects();
      this.videos = [...document.querySelectorAll('.sli-vid')];
      this.playstate = false;
      this.handleVids();
      // this.imagesandPlanes();
      this.domctrls();

      this.resize();
      this.render();
      this.mouseMoveEvt();
      this.mouseEvt();
      this.slide();

      this.domslides = [...document.querySelectorAll('.slides')];
      this.s_h = [...document.querySelectorAll('.s_h')];
      this.domsplit();
      this.domrel(this.count); // Called AGAIN in the animation frame when necessary

    }

    setupResize() {
      window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.renderer.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;

      // Image Cover
      this.imageAspect = 1;
      let a1, a2;
      if(this.height / this.width > this.imageAspect ) {
        a1 = (this.width / this.height) * this.imageAspect;
        a2 = 1;
      } else {
        a1 = 1;
        a2 = (this.height / this.width) * this.imageAspect;
      }

      this.material.uniforms.resolution.value.x = this.width;
      this.material.uniforms.resolution.value.y = this.height;
      this.material.uniforms.resolution.value.z = a1;
      this.material.uniforms.resolution.value.w = a2;


      this.camera.updateProjectionMatrix();
    }

    mouseMoveEvt(){
      window.addEventListener('mousemove', mm =>{
        this.mouse.x = mm.clientX/this.width;
        this.mouse.y = 1. - mm.clientY/this.height;

        let xx = (.5 - this.mouse.y) *.08;
        let yy = -(.5 - this.mouse.x) *.08;

        gsap.to(this.camera.rotation, {x: xx, ease:"back", delay:.2, duration:.7});
        gsap.to(this.camera.rotation, {y: yy, ease:"back", delay:.2, duration:.7})

        // Update uniform
        // this.material.uniforms.mouse.value = this.mouse;

      })

    }

    mouseEvt() {
      window.addEventListener('mousedown', e => {
        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.clickprogress, {value:1, duration:.5, ease: "power4" })
        });

      })
      window.addEventListener('mouseup', e => {
        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.clickprogress, {value:0, duration:.9, ease: "power4"})
        });
      })

    }

    domctrls() {
      let that = this;
      // Dom links
      this.bt = {
        in: document.getElementById('in'), // 0
        out: document.getElementById('back'), // 1
        init: document.getElementById('init'), // 3
        inner: document.getElementById('inner'), // 4
        outer: document.getElementById('outer'), // 5
      };
        console.log(this.bt);
      let werein = false;

      // IN
      this.bt.in.addEventListener('click', ()=> {
        werein = true;
        this.playstate = true;
        this.videoplayer();
        gsap.to(that.camera.position, {z:-1.5, duration:.7, ease: "power4.out"});

        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.buttonin, {value:1, duration:.5, ease: "power3.out"})
        });
      })

      //  OUT
      this.bt.out.addEventListener('click', ()=> {
        werein = false;
        this.playstate = false;
        this.videoplayer();
        gsap.to(that.camera.position, {z:0, duration:.3, ease: "power2"})

        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.buttonin, {value:0, duration:.5, ease: "power3.out"})
        });
      })

      // INIT
      this.bt.init.addEventListener('click', ()=> {
        if (this.count == null) { this.count = 0}
        this.domrel(this.count);

        gsap.from(this.group.rotation, {y: -.3*Math.PI, duration:1.5, ease: "power4.out"});

        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.introanim, {value:0, duration:1, ease: "power4.out"})
        });
      })

      // IN HOVER STATE
      this.bt.in.addEventListener('mouseenter', ()=> {
        this.playstate = true;
        this.videoplayer();

        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.hoverstate, {value:.3, duration:1, ease: "power2.out"})
        });
      })
      this.bt.in.addEventListener('mouseleave', ()=> {
        if (!werein) { this.playstate = false; this.videoplayer(); }

        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.hoverstate, {value:0, duration:1, ease: "power2.out"})
        });
      })

      // BACK HOVER STATE
      this.bt.out.addEventListener('mouseenter', ()=> {
        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.hoverstate, {value:-.3, duration:1, ease: "power2.out"})
        });
      })
      this.bt.out.addEventListener('mouseleave', ()=> {
        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.hoverstate, {value:0, duration:1, ease: "power2.out"})
        });
      })

      // INNER AND OUTER
      this.bt.inner.addEventListener('click', ()=> {
        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.buttoninner, {value:1., duration:.7, ease: "power3.out"})
          gsap.to(item.material.uniforms.buttonin, {value:0, duration:.5, ease: "power3.out"})
            console.log("inner!");

        });
      })
      this.bt.outer.addEventListener('click', ()=> {
        this.group.children.forEach((item, i) => {
          gsap.to(item.material.uniforms.buttoninner, {value:0., duration:.8, ease: "power4.out"})
          gsap.to(item.material.uniforms.buttonin, {value:1, duration:.5, ease: "power3.out"})
            console.log("outer");
        });
      })

    }

    domsplit() {
      // Slide Headings
      new SplitText(this.s_h, { type: "chars", charsClass: "sh_spl" });
      this.s_hSplit = [];
      this.s_h.forEach((item, i) => {
        this.s_hSplit.push([...item.querySelectorAll('.sh_spl')]);
      });

    }

    domrel(c) {
      let that = this;
      // Slide Content Iterate
      this.domslides.forEach((item, i) => {
        if ( i!==c ) { // ! // NON ACTIVE state
          item.classList.remove("active");
          gsap.set(this.s_hSplit[i], {scale:.1, opacity:0});

        } else if ( i == c) { // ! // ACTIVE state
          item.classList.add("active");
          gsap.to(this.s_hSplit[i], {scale:1, opacity:1, duration:.04, delay:0, ease:"power1.in", stagger:.03});

        }
      });

    }

    addObjects() {
      let that = this;
      this.material = new THREE.ShaderMaterial({
        extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
        },
        side: THREE.DoubleSide,
        uniforms: {
          time: {type: "f", value: 0 },
          clickprogress: {type: "f", value: 0 },
          introanim: {type: "f", value: 1 },
          buttonin: {type: "f", value: 0 },
          buttoninner: {type: "f", value: 0 },
          intersecting: {type: "f", value: 0 },
          hoverstate: {type: "f", value: 0 },
          texture1: {type: "t", value: null },
          mouse: {type: "v3", value: new THREE.Vector3(0., 0., 0.) },
          resolution: {type: "v4", value: new THREE.Vector4()},
          uvRate1: {
            value: new THREE.Vector2(1, 1)
          }
        },
          // wireframe : true,
          transparent: true,
          vertexShader: ` uniform float time;
          uniform vec2 pixels;
          uniform float clickprogress;
          uniform float intersecting;
          uniform float buttonin;
          uniform float introanim;
          uniform float hoverstate;
          uniform float buttoninner;


          uniform vec3 mouse;

          varying vec2 vUv;
          // varying vec4 vPosition;

          void main() {
            vUv = uv;
            vec3 pos = position;



            // Plane Basic Distortion
            float verpos = length(uv.x - .5);
            float maxvertpos = length(vec2(.6));
            pos.z += cos( verpos / maxvertpos ) - 1.1;

            // Intro Animation
            pos.z += introanim * 10.;

            // Mouse Clicked Distortion
            float dist = length(uv - vec2(.5));
            pos.z += (dist * clickprogress);
            pos.z += clickprogress * float(.5);
            pos.z += (clickprogress) *sin((uv.x- 0.)*6. + time*1.)*0.3;
            pos.z += (1.-clickprogress) *sin((uv.x)*6. + time*.5)*0.02;

            // // Mouse Intersection
            // pos.z += intersecting;

            // IN and OUT animation
            float disty = length(uv.x - .5);
            pos.z += buttonin * .5;
            pos.z = mix(pos.z, 1. + pos.z*0. , buttonin*.6 - (clickprogress*.8) * buttonin);
            pos.z += buttonin * cos(disty * .2 / maxvertpos * .8) * .2;

            // Hover State Interaction
            pos.z += hoverstate * (.1);

            // Inner Animation for Case Study # 2
            vec3 v = (normalize(pos) * .2);
            v.z +=1.;
            v.x += .2;
            pos = mix(pos, v, buttoninner);


            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }

          `,
          fragmentShader: `uniform float time;
          uniform float clickprogress;
          uniform float introanim;
          uniform float progress;
          uniform vec3 mouse;
          uniform sampler2D texture1;
          //uniform sampler2D texture2;
          uniform vec4 resolution;
          uniform float buttoninner;

          varying vec2 vUv;
          varying vec4 vPosition;



          void main() {

            vec2 newUv = vUv;
            // float ns = snoise(vUv.xy * 2.);

            vec4 t = texture2D(texture1, newUv);

            // Intro Animation
            float grad = .5 - vUv.y + .5;
            grad = step(introanim, grad );
            t.a = grad;

            // // Inner animation #1
            // float circgrad = length(vec2(1.) - newUv.y);
            // circgrad = 1. - step(circgrad, buttoninner*1.3);
            // // t.a = circgrad;


            gl_FragColor = t;
            // gl_FragColor = vec4(circgrad);

          }`
      });
      // this.geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 10);
      // this.plane = new THREE.Mesh(this.geometry, this.material);
      // this.scene.add(this.plane);

    }

    handleVids() {
      let loadingCount = 0;
      let loadingTarget = this.videos.length;

      this.videos.forEach((item, i) => {
        item.pause();
        item.addEventListener("loadeddata", ()=> {
          loadingCount +=1;

          if(loadingCount == loadingTarget) {
            // console.log('loaded all videos');
            this.imagesandPlanes();
          }
          // else {
          //   console.log(loadingCount);
          // }

        });
      });

    }

    imagesandPlanes() {
      this.images = this.videos;

      // Setup Circle
      let rad = 1.5;
      let unitAng = 2*Math.PI / this.images.length;
      this.rotationUnits = unitAng;

      this.images.forEach((img, i) => {
        // Material
        let mat = this.material.clone();
        mat.uniforms.texture1.value = new THREE.VideoTexture(img);
        mat.uniforms.texture1.value.needsUpdate = true;
        // Geometry
        let geo = new THREE.PlaneBufferGeometry(1.7, 1, 60, 60);
        // Mesh
        let mesh = new THREE.Mesh(geo, mat);
        // Circle setup
        mesh.position.x = Math.sin(unitAng*i) * rad;
        mesh.position.z = Math.cos(unitAng*i) * rad;
        mesh.rotation.y = (unitAng*i);
        // Add
        this.group.add(mesh);
      });

      this.scene.add(this.group);
      this.videoplayer();

    }

    videoplayer() {
      if (this.playstate) {
        this.videos.forEach((item, i) => {
          item.play();
        });

      } else {
        this.videos.forEach((item, i) => {
          item.pause();
        });
      }
    }

    slide() {
      // Slide Vars
      let that = this,
          speed = 0,
          pos = 0,
          rounded = 0,
          isClicked = false;
      // Dom Vars
      let ssli = [...document.querySelectorAll('.slides')]; // dom sliding elements
      this.totsli = ssli;

      // Drag Slide
      window.addEventListener('mousedown', (e) => {
        isClicked = true;
      })
      window.addEventListener('mouseup', (e) => {
        isClicked = false;
      })
      window.addEventListener('mousemove', (e) =>{
        if (isClicked) {
          speed = e.movementX *.003;
        }
      })

      // Setup Dom Manipulation
      let counter = 0;

      function raf() {
        // vars
        pos += speed;
        speed *= .8;
        rounded = Math.round(pos);
        let diff = rounded - pos;
        pos += Math.sign(diff) * Math.pow(Math.abs(diff), .75) * .025; // .025

        // Update Slider Rotation for 3D
        that.group.rotation.y = (- pos * that.rotationUnits) + that.rotationUnits/2;

        // DOM counting
        let ccount = that.count;
        if (counter !== rounded && counter < rounded) {
          that.count -= 1;
          counter = rounded;
        } else if (counter !== rounded && counter > rounded) {
          that.count += 1;
          counter = rounded;
        }
        if (that.count < 0) {
          that.count = ssli.length-1;
        } else if (that.count > ssli.length-1) {
          that.count = 0;
        }

        if ( ccount !== that.count) {
          that.domrel(that.count);
          ccount = that.count;
        }

        window.requestAnimationFrame(raf);
      }
      raf();
    }

    tabEvents() {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.play();
        }
      });
    }
    stop() { this.paused = true; }
    play() { this.paused = false; }
    render() {
      if (this.paused) return;
      this.time += .05;

      // update Group Uniforms
      let that = this;
      this.group.children.forEach((item, i) => {
        item.material.uniforms.time.value = that.time;
      });

      // console.log(this.material.uniforms.clickprogress.value);

      requestAnimationFrame(this.render.bind(this));
      this.renderer.render(this.scene, this.camera);
    }

  }

  new Sketch();
