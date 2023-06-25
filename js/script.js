import * as THREE from 'three';

import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../jsm/postprocessing/UnrealBloomPass.js';

let container;
let camera, scene, renderer;
let cylinder01, cylinder02;
let texture;

let composer, bloomPass;

window.addEventListener('DOMContentLoaded',()=>{
    init();
    animate();
});

function init(){
    //カンバス
    container = document.getElementById('conteiner');

    //レンダラー
    renderer = new THREE.WebGLRenderer({
        antialias:true,
        alpha:true
    });
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(window.innerWidth/window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;//白飛びをどう処理するか
    container.appendChild(renderer.domElement);

    //シーン
    scene = new THREE.Scene();

    //カメラ
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = window.innerHeight / 2 / Math.tan(fovRad);
    camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth/window.innerHeight,
        1,
        1000
    );
	camera.position.set(0,0,dist * 0.1);

    //環境光
    let ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    //平行光源
    let directionalLight = new THREE.DirectionalLight(0xffffff);
    scene.add(directionalLight);

    //canvasからテクスチャを作成
    let canvas = document.getElementById('uv');
    let ctx = canvas.getContext('2d');
    //console.log(ctx);
    
    let fontSize = 24;
    ctx.font = `bold ${fontSize}px serif`;
    ctx.fillStyle = `#ff0000`;
    ctx.fillText('臨 兵 闘 者 皆 陣 列 在 前', 10, fontSize * 3);
    ctx.textBaseline = 'middle';

    texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    //マテリアル
    let material = new THREE.MeshStandardMaterial({
        map:texture,
        transparent:true,
        color: new THREE.Color(0xfc1c03), 
        emissive: new THREE.Color(0xfc1c03),
        side: THREE.DoubleSide,
        depthWrite:false, //これ大事!
    });

    //円柱01
    let geo01 = new THREE.CylinderGeometry(fontSize, fontSize, fontSize * 2, 32, 32, true);
    cylinder01 = new THREE.Mesh(geo01, material);
    scene.add(cylinder01);
    cylinder01.position.set(0,0,0);

    //円柱02
    let geo02 = new THREE.CylinderGeometry(fontSize, fontSize, fontSize * 2, 32, 32, true);
    cylinder02 = new THREE.Mesh(geo02, material);
    scene.add(cylinder02);
    cylinder02.position.set(0,0,0);
    cylinder02.rotation.z = 60 * Math.PI / 180;

    window.addEventListener('resize',onWindowResize);

    renderer.autoClear = false;

    //ポストプロセッシング
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    //グローエフェクトをかける
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.01;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0.2;
    composer.addPass(bloomPass);
}


//ブラウザをリサイズした時の挙動
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
}


//アニメーション
function animate(){
    requestAnimationFrame(animate);
    render();
}

const amplitude = 0.5;
const frequency = 0.5; 
let time = 0;

//レンダリング
function render(){
    //renderer.render(scene,camera);
    composer.render();

    time += 0.01;
    let random = Math.random() * 0.75;
    bloomPass.strength = 1 + (amplitude * Math.sin(2 * Math.PI * frequency * time) * random);

    cylinder01.rotation.y -= 0.01;

    cylinder02.rotation.x -= 0.01;
}

