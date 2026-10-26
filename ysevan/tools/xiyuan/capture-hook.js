// Frame capture for the walkthrough videos (video/ in the repository, never shipped as media). app.js imports this module only
// when the address has ?capture=1; without it nothing here is loaded and the page is unchanged.
// It stops the page's own animation loop and lets a driver (video/scripts/capture.mjs, headless Chrome) place the camera and
// render one frame at a time, so every video frame is a fully rendered frame of the real scene at an exact time, whatever the
// frame rate of the machine. Frames are read from the WebGL canvas only, so no page UI ever reaches the video.
// Layout and style changes go through the page's own buttons, exactly as a visitor's clicks would.
export function installCapture(app){
 const {renderer,scene,camera}=app,out=document.createElement('canvas'),ctx=out.getContext('2d');
 app.hold(true);
 const click=sel=>{const b=document.querySelector(sel);if(!b)throw new Error('no '+sel);b.click();};
 const api={
  // tier must be 'gpu' for the full scene (GTAO, room lights, normal maps); ao is the GTAO layer's state once it has loaded.
  async ready(){for(let i=0;i<100&&app.tier==='gpu'&&!window.xiyuanAO;i++)await new Promise(r=>setTimeout(r,100));return {tier:app.tier,ao:window.xiyuanAO?window.xiyuanAO():null,layout:app.layout()};},
  setLayout(id){click(`[data-layout="${id}"]`);return app.layout();},
  setStyle(id){click(`[data-preset="${id}"]`);return document.querySelector(`[data-preset="${id}"]`).getAttribute('aria-pressed')==='true';},
  // The owner's rooms for the current layout, as the page names and frames them.
  rooms:()=>app.rooms.filter(r=>r.unit==='bl').map(({id,name,pos,look,rect})=>({id,name,pos,look,rect})),
  walkable:(x,z,r=.12)=>app.canWalk(x,z,r),roomAt:(x,z)=>app.roomAt(x,z),
  // 'eye': as when walking (roof, outlook, room lights, GTAO); 'overview': the cut-away model on its plinth.
  view(kind){app.prepare(kind==='eye'?'walk':'dollhouse');camera.clearViewOffset();camera.updateProjectionMatrix();return kind;},
  // One frame: hfov is the horizontal field of view in degrees; ratio the drawing buffer's pixels per output pixel (2 =
  // supersampled, downscaled into the out canvas). Returns a JPEG data URL of the out canvas.
  frame({pos,look,hfov,ratio=2,quality=.94}){
   const w=innerWidth,h=innerHeight,a=w/h;
   if(renderer.getPixelRatio()!==ratio){renderer.setPixelRatio(ratio);renderer.setSize(w,h);}
   camera.aspect=a;camera.fov=2*Math.atan(Math.tan(hfov*Math.PI/360)/a)*180/Math.PI;camera.updateProjectionMatrix();
   camera.position.set(...pos);camera.lookAt(...look);camera.updateMatrixWorld();
   app.refresh();renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);
   if(out.width!==w||out.height!==h){out.width=w;out.height=h;}
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(renderer.domElement,0,0,w,h);
   return out.toDataURL('image/jpeg',quality);
  }
 };
 window.__xyCapture=api;document.documentElement.dataset.capture='ready';return api;
}
