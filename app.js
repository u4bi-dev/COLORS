const COLORS = (rootElement = document.body, properties ) => {
    
    properties = properties || {
        renderer : {
            width           : rootElement.clientWidth,
            height          : rootElement.clientHeight,
            backgroundColor : 0xF0F0F0,
            backgroundAlpha : 1
        },
        camera : {
            fov    : 45,
            aspect : rootElement.clientWidth / rootElement.clientHeight,
            near   : 1,
            far    : 10000,
            position : { x : 0, y : 0, z : 1100 },
            rotation : { x : 0, y : 0, z : 0 }
        },
        scene : {
            position : { x : 0, y : 0, z : 0 },
            rotation : { x : 0, y : 0, z : 0 },
            scale    : { x : 0, y : 0, z : 0 }
        }
    };

    ( (prop) => {

        console.log('constructor', prop);

        Object.assign(prop, prop, {
            mouseX : 0,
            mouseY : 0,
            halfX : prop.renderer.width / 2,
            halfY : prop.renderer.height / 2
        });

    }) (properties);


    let { camera } = properties;

    return ({
        rootElement : rootElement,
        camera : new THREE.PerspectiveCamera(camera.fov, camera.aspect, camera.near, camera.far),
        renderer : {
            webgl : new THREE.WebGLRenderer( { alpha:true } ),
            css3d : new THREE.CSS3DRenderer()
        },
        scene : {
            webgl : new THREE.Scene(),
            css3d : new THREE.Scene(),
            add : function(element3D) {
                let e = this,
                    { webgl, css3d } = e;

                webgl.add(element3D.webgl);
                css3d.add(element3D.css3d);
            }
        },
        _properties : properties,
        initialize : function(callback = null) {

            console.log('initialize', this);
            
            let e = this,
                { camera, renderer, scene } = e._properties;


            /* CAMERA
            ------------------------------------------------------------- */
            let { position } = camera;

            e.camera.position.set(position.x, position.y, position.z);


            /* RENDERER
            ------------------------------------------------------------- */
            let { width, height, backgroundColor, backgroundAlpha } = renderer;

            // WebGL
            e.renderer.webgl.domElement.style.position = 'absolute';
            e.renderer.webgl.domElement.style.zIndex   = 0;
            e.renderer.webgl.domElement.style.top      = 0;
            e.renderer.webgl.setSize(width, height);
            e.renderer.webgl.setClearColor(backgroundColor, backgroundAlpha);

            // CSS3D
            e.renderer.css3d.domElement.style.position = 'absolute';
            e.renderer.css3d.domElement.style.zIndex   = 0;
            e.renderer.css3d.domElement.style.top      = 0;
            e.renderer.css3d.setSize(width, height);


            /* SCENE
            ------------------------------------------------------------- */


            /* DOM Eleement
            ------------------------------------------------------------- */
            e.rootElement.appendChild(e.renderer.css3d.domElement);
            e.renderer.css3d.domElement.appendChild(e.renderer.webgl.domElement);


            /* Event
            ------------------------------------------------------------- */
            window.addEventListener('resize', () => {
                let { rootElement, camera, renderer, _properties } = e,
                    w = rootElement.clientWidth,
                    h = rootElement.clientHeight;

                _properties.halfX           = w / 2;
                _properties.halfY           = h / 2;
                _properties.renderer.aspect = w / h;

                camera.aspect = _properties.renderer.aspect;
                camera.updateProjectionMatrix();

                renderer.webgl.setSize(w, h);
                renderer.css3d.setSize(w, h);

            });

            window.addEventListener('mousemove', event => {

                e._properties.mouseX = (event.clientX - e._properties.halfX );
                e._properties.mouseY = (event.clientY - e._properties.halfY) * 0.2;
            });


            /* USE
            ------------------------------------------------------------- */
            callback && callback(this);

        },
        animate : function(callback = null) {

            console.log('animate', this);

            let e = this;

            ( _ => render = time => {
                requestAnimationFrame(render);
                TWEEN.update(time);

                e.camera.lookAt(new THREE.Vector3(0, 0, 0));

                e.camera.position.x += ( e._properties.mouseX - e.camera.position.x) * 0.15;
                e.camera.position.y += (-e._properties.mouseY - e.camera.position.y) * 0.15;

                e.renderer.webgl.render(e.scene.webgl, e.camera);
                e.renderer.css3d.render(e.scene.css3d, e.camera);

                callback && callback(e);

            })()();

        },
        createElement3D : ( opts = {}, element = document.createElement('div')) => {
            
            opts.style = opts.style || {};

            let w = parseInt( ( opts.style.width  = opts.style.width  || '500px') ),
                h = parseInt( ( opts.style.height = opts.style.height || '500px') );


            Object.assign(element.style, element.style, { ...opts.style || undefined });

            element.innerHTML = opts.innerHTML || '';

            let mesh      = new THREE.Mesh( new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x000000, opacity : 0.0, side : THREE.DoubleSide }) ),
                element3D = new THREE.CSS3DObject(element);

            return {
                webgl : mesh,
                css3d : element3D,
                translateX : function(distance) {
                    this.webgl.translateX(distance);
                    this.css3d.translateX(distance);
                },
                translateY : function(distance) {
                    this.webgl.translateY(distance);
                    this.css3d.translateY(distance);
                },
                translateZ : function(distance) {
                    this.webgl.translateZ(distance);
                    this.css3d.translateZ(distance);
                },
                rotateX : function(radians) {
                    this.webgl.rotateX(radians);
                    this.css3d.rotateX(radians);
                },
                rotateY : function(radians) {
                    this.webgl.rotateY(radians);
                    this.css3d.rotateY(radians);
                },
                rotateZ : function(radians) {
                    this.webgl.rotateZ(radians);
                    this.css3d.rotateZ(radians);
                },
                setPosition : function(x, y, z) {
                    this.webgl.position.set(x, y, z);
                    this.css3d.position.set(x, y, z);
                },
                setRotation : function(x, y, z) {
                    this.webgl.rotation.set(x, y, z);
                    this.css3d.rotation.set(x, y, z);
                },
                setScale : function(x, y, z) {
                    this.webgl.scale.set(x, y, z);
                    this.css3d.scale.set(x, y, z);
                }
            };
        }
    });

};