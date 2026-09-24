var Engine = BABYLON.Engine, Scene = BABYLON.Scene, HemisphericLight = BABYLON.HemisphericLight, ArcRotateCamera = BABYLON.ArcRotateCamera, Vector3 = BABYLON.Vector3, Animation = BABYLON.Animation, ParticleSystem = BABYLON.ParticleSystem, DynamicTexture = BABYLON.DynamicTexture, SubEmitter = BABYLON.SubEmitter, Color4 = BABYLON.Color4, DefaultRenderingPipeline = BABYLON.DefaultRenderingPipeline;
(function main() {
    var state = createState();
    var el = document.querySelector('#elCanvas');
    var engine = new Engine(el, true);
    var scene = createScene({ engine: engine, state: state, el: el });
    engine.runRenderLoop(function () { return scene.render(); });
    addEventListener('resize', function () { return engine.resize(); });
}());
function createState() {
    return {};
}
function createScene(_a) {
    var engine = _a.engine, el = _a.el;
    var scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
    var camera = new ArcRotateCamera('', -Math.PI / 2, Math.PI / 2, 20, new Vector3(), scene);
    camera.attachControl(el);
    camera.wheelPrecision = 100;
    var light0 = new HemisphericLight('', new Vector3(0, 1, 0), scene);
    light0.intensity = 0.1;
    var box0 = BABYLON.MeshBuilder.CreateBox('', {});
    box0.visibility = 0;
    var keys = [
        { frame: 0, value: 0 },
        { frame: 60, value: Math.PI * 2 }
    ];
    var animRy = new Animation('', 'rotation.y', 100, Animation.ANIMATIONTYPE_FLOAT);
    animRy.setKeys(keys);
    var animRz = new Animation('', 'rotation.z', 100, Animation.ANIMATIONTYPE_FLOAT);
    animRz.setKeys(keys);
    var animT = new Animation('', 'position.y', 5, Animation.ANIMATIONTYPE_FLOAT);
    animT.setKeys([
        { frame: 0, value: -2 },
        { frame: 30, value: 5 },
        { frame: 60, value: -2 }
    ]);
    box0.animations.push(animT, animRy, animRz);
    scene.beginAnimation(box0, 0, 60, true);
    var p0 = new BABYLON.ParticleSystem('', 1000, scene);
    p0.particleTexture = createDynamicTexture({ color: 'white', scene: scene });
    p0.emitter = box0;
    p0.createPointEmitter(new BABYLON.Vector3(0, 1, 0.0001), new BABYLON.Vector3(0, 1, 0.0001));
    p0.minLifeTime = 0.5;
    p0.maxLifeTime = 0.7;
    p0.emitRate = 100;
    p0.minEmitPower = 2;
    p0.maxEmitPower = 2;
    p0.addColorGradient(0, new Color4(1, 1, 0, 0.5));
    p0.addColorGradient(1, new Color4(1, 0, 0, 0));
    p0.addSizeGradient(0, 0.1);
    p0.addSizeGradient(1, 0.1);
    p0.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    p0.gravity = new Vector3(0, -10, 0);
    var p1 = new BABYLON.ParticleSystem('', 100, scene);
    p1.particleTexture = createDynamicTexture({ color: 'white', scene: scene });
    p1.emitter = new BABYLON.Mesh('');
    p1.createPointEmitter(new BABYLON.Vector3(-1, -1, 0), new BABYLON.Vector3(1, 1, 0));
    p1.minLifeTime = 1;
    p1.maxLifeTime = 1;
    p1.minEmitPower = 1;
    p1.maxEmitPower = 10;
    p1.manualEmitCount = 100;
    p1.color1 = new Color4(1, 0, 0, 1);
    p1.color2 = new Color4(0, 1, 0, 0);
    p1.addSizeGradient(0, 0.04);
    p1.addSizeGradient(1, 0.01);
    p1.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    var se1 = new SubEmitter(p1);
    se1.inheritDirection = true;
    se1.inheritedVelocityAmount = 5;
    p0.subEmitters = [se1];
    p0.start();
    var rp = new DefaultRenderingPipeline('', true, scene, [camera]);
    rp.bloomEnabled = true;
    rp.bloomScale = 1;
    rp.bloomThreshold = 0.1;
    rp.bloomWeight = 5;
    rp.bloomKernel = 16;
    rp.samples = 4;
    return scene;
}
function createDynamicTexture(_a) {
    var color = _a.color, scene = _a.scene;
    var SZ = 32;
    var tex = new DynamicTexture('', SZ, scene, false);
    var ctx = tex.getContext();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, SZ, SZ);
    tex.update();
    return tex;
}