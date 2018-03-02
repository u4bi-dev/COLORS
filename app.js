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
            position : { x : 0, y : 0, z : 2000 },
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
            css3d : new THREE.Scene()
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
                let w = e.rootElement.clientWidth,
                    h = e.rootElement.clientHeight;

                e.camera.aspect = w / h;
                e.camera.updateProjectionMatrix();

                e.renderer.webgl.setSize(w, h);
                e.renderer.css3d.setSize(w, h);

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

            let mesh      = new THREE.Mesh( new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ opacity : 0.0, side : THREE.DoubleSide }) ),
                element3D = new THREE.CSS3DObject(element);

            return {
                webgl : mesh,
                css3d : element3D
            };
        }
    });

};