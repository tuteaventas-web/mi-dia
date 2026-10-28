// Original poses and a separate four-phase contralateral running cycle.
export const SPRITE_FRAMES=[[0],[1,2],[8,9,10,11],[8,9,10,11],[7]];
function frame(index){
 const running=index>=8,local=running?index-8:index,columns=running?2:4,cell=running?627:443.5,side=running?1254:1774,height=running?1254:887;
 const col=local%columns,row=Math.floor(local/columns);
 // The upper row's boot tips bleed into the next cells. Clip that empty
 // top margin without shifting or rescaling the lower-row character.
 const inset=running&&row===1?24:0;
 const image=`<image href="assets/${running?'hiker-run-cycle.png':'hiker-poses.png'}" x="0" y="0" width="${side}" height="${height}"/>`;
 const content=inset?`<svg x="${col*cell}" y="${row*cell+inset}" width="${cell}" height="${cell-inset}" viewBox="${col*cell} ${row*cell+inset} ${cell} ${cell-inset}" overflow="hidden">${image}</svg>`:image;
 return `<svg x="-9" y="-5" width="50" height="50" viewBox="${col*cell} ${row*cell} ${cell} ${cell}" overflow="hidden" aria-hidden="true">${content}</svg>`;
}
export function runner(stage=0,x=0,y=0,scale=1,animate=true){
 const frames=SPRITE_FRAMES[stage],moving=animate&&frames.length>1,visible=animate?frames:frames.slice(0,1);
 return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="runner ${moving?'moving':''} ${animate&&stage===4?'celebrate':''}" style="--cadence:${stage===1?'1s':stage===2?'.32s':'.24s'}"><g class="body">${visible.map((index,i)=>`<g class="motion-frame ${i===0?'first-frame':''} ${frames.length===4?'four-phase':'two-phase'}" style="--phase:${i};--delay:calc(var(--cadence) * ${i===0?0:-(frames.length-i)/frames.length})">${frame(index)}</g>`).join('')}</g></g></g>`;
}
export function scene(p){
 const ratio=p.percent/100,center=38+ratio*292,baseline=32+120*(.76+.12*Math.sin(Math.PI*ratio)-.12*ratio),shown=p.percent===100?100:Math.min(99,Math.round(p.percent));
 return `<svg viewBox="0 0 360 202.5" role="img" aria-label="${p.done} de ${p.total} tareas completadas, ${shown} por ciento" xmlns="http://www.w3.org/2000/svg"><title>Recorrido hacia la META</title><rect width="360" height="202.5" fill="#fbfdfb"/><image href="assets/mountain-trail.png" x="0" y="32" width="360" height="120" preserveAspectRatio="xMidYMid slice"/><ellipse cx="${center}" cy="${baseline}" rx="10" ry="1.8" fill="#354f35" opacity=".18"/>${runner(p.stage,center-28.8,baseline-77.4,1.8)}${p.stage===4?`<path class="finish-ribbon" d="M305 ${baseline-24}q8 4 14-1m9 0q9-5 19-2" fill="none" stroke="#e7f3d4" stroke-width="2" stroke-linecap="round"/>`:''}<path d="M17 156H343" stroke="#d5e4d9" stroke-width="2" stroke-linecap="round"/><path d="M17 156H${17+ratio*326}" stroke="#72a98b" stroke-width="2" stroke-linecap="round"/></svg>`;
}
