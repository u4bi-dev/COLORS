const COLORS = (rootElement = document.body, properties ) => {
    
    properties = properties || {
        renderer : {
            width           : rootElement.clientWidth,
            height          : rootElement.clientHeight,
            backgroundColor : 0xF0F0F0,
            backgroundAlpha : 1,
            domElementStyle : {
                position : 'absolute',
                zIndex   : 0,
                top      : 0
            }
        },
        camera : {
            fov    : 45,
            aspect : rootElement.clientWidth / rootElement.clientHeight,
            near   : 1,
            far    : 10000,
            position : { x : 0, y : 0, z : -12200 },
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
        track : {
            type : '',
            animations : {},
            add : function(type, animation) {
                this.animations[type] = animation;
            },
            start : function(type) {
                this.type = type;
                this.animations[type].start();
            }
        },
        lookAt : {
            position : {
                x : 0,
                y : 0,
                z : 0
            },
            set : function(x, y, z) {
                x !== undefined && [ this.position.x = x]
                y !== undefined && [ this.position.y = y]
                z !== undefined && [ this.position.z = z]
            }
        },
        _properties : properties,
        initialize : function(callback = null) {

            console.log('initialize', this);
            
            let self = this,
                { camera, renderer, scene, rootElement } = self;


            /* CAMERA
            ------------------------------------------------------------- */
            let { position } = self._properties.camera;

            camera.position.set(position.x, position.y, position.z);


            /* RENDERER
            ------------------------------------------------------------- */
            let { width, height, backgroundColor, backgroundAlpha, domElementStyle } = self._properties.renderer;

            // WebGL
            Object.assign(renderer.webgl.domElement.style, renderer.webgl.domElement.style, domElementStyle);
            renderer.webgl.setSize(width, height);
            renderer.webgl.setClearColor(backgroundColor, backgroundAlpha);

            // CSS3D
            Object.assign(renderer.css3d.domElement.style, renderer.css3d.domElement.style, domElementStyle);
            renderer.css3d.setSize(width, height);


            /* SCENE
            ------------------------------------------------------------- */


            /* DOM Eleement
            ------------------------------------------------------------- */
            rootElement.appendChild(renderer.css3d.domElement);
            renderer.css3d.domElement.appendChild(renderer.webgl.domElement);


            /* Event
            ------------------------------------------------------------- */
            window.addEventListener('resize', () => {
                let { rootElement, camera, renderer, _properties } = self,
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


            let move = (event, touchX) => {

                    let { _properties } = self;


                    _properties.mouseX = (event.clientX - _properties.halfX );
                    touchX && [ _properties.mouseX *= touchX ];


                    _properties.mouseY = (event.clientY - _properties.halfY) * 0.2;
                },
                click = event => {

                    let { rootElement, camera, scene } = self,
                        pointer = {
                            x :  (event.clientX / rootElement.clientWidth ) * 2 - 1,
                            y : -(event.clientY / rootElement.clientHeight) * 2 + 1
                        },
                        raycaster = new THREE.Raycaster(),
                        intersect = null;


                    raycaster.setFromCamera(pointer, camera);
                    intersect = raycaster.intersectObjects(scene.webgl.children, true)[0];


                    intersect && window.dispatchEvent(new CustomEvent('raycaster', { detail : { ...intersect } }));

                };


            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup'  , click);
            window.addEventListener('touchmove', e => move(e.changedTouches[0], 4));
            window.addEventListener('touchend' , e => click(e.changedTouches[0]));


            /* USE
            ------------------------------------------------------------- */
            callback && callback(this);

        },
        animate : function(callback = null) {

            console.log('animate', this);

            let { camera, renderer, scene, lookAt, _properties } = this;

            ( _ => render = time => {
                requestAnimationFrame(render);
                TWEEN.update(time);

                camera.lookAt(new THREE.Vector3().copy(lookAt.position));

                camera.position.x += (- _properties.mouseX - camera.position.x) * 0.15;
                camera.position.y += (  _properties.mouseY - camera.position.y) * 0.15;

                renderer.webgl.render(scene.webgl, camera);
                renderer.css3d.render(scene.css3d, camera);

                callback && callback(self);

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
                dataset : opts.dataset || {},
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
                },
                isIntersect : function(mesh) {

                    return this.webgl === mesh;
                }
            };
        },
        createPlane3D : (x, y, margin, color) => {

            let group = new THREE.Group();

            for (let IX = 0; IX < x; IX++) {

                for (let IY = 0; IY < y; IY++) {

                    let particle = new THREE.Sprite(new THREE.MeshBasicMaterial( { color : color } ));

                    particle.position.set(IX * margin - ( (x * margin) / 2 ), -170, IY * margin - ( ( y * margin) / 2 ));
                    particle.scale.x = particle.scale.y = 1.5;

                    group.add(particle);
                }

            }

            return group;
        },
        createThumbnail3D : function(x, y, width, height, marginX, marginY, depth, items) {
            let tick = 0,
                elements3D = [],
                { createElement3D } = this;

            for (let IY = y; IY--;) {

                for (let IX = 0; IX < x; IX++) {

                    let element3D = createElement3D({
                            style : {
                                width : width,
                                height: height
                            },
                            dataset : {
                                id : tick
                            },
                            innerHTML : ` <img style="width:100%; height:100%;" src="${ items[tick] }">`
                        });

                    element3D.setPosition(
                        IX * marginX - ( (x * marginX) / 2 ),
                        IY * marginY + marginY,
                        depth
                    );

                    elements3D.push(element3D);
                    tick++;

                }
            }

            return elements3D;
        }
    });

};