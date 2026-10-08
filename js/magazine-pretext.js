/* 杂志排版布局 7 式 · Pretext 驱动
 * 经典脚本（非 module），可直接以 file:// 打开；Pretext.js 通过动态 import 加载。 */
(async function(){

// 导航：平滑滚动（系统开启“减少动态效果”时直接跳转）
document.querySelectorAll('nav a').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    const t=document.querySelector(a.getAttribute('href'));
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(t)t.scrollIntoView({behavior:reduce?'auto':'smooth'});
  });
});

// 加载 Pretext.js；失败时在仪表盘提示，静态版式仍可阅读
let P;
try{
  P=await import('https://esm.sh/@chenglou/pretext@0.0.9');
}catch(e){
  const h=document.querySelector('#d h4');
  if(h)h.textContent='⚠ Pretext.js 未加载（需要联网）';
  console.error('Pretext.js 加载失败',e);
  return;
}
const {prepare:p_,layout:l_,prepareWithSegments:pw_,layoutNextLine:ln_}=P;

const $=id=>document.getElementById(id);
const gf=el=>{
  const s=getComputedStyle(el);
  return `${s.fontWeight||'400'} ${s.fontSize||'16px'} ${s.fontFamily||'sans-serif'}`
};
const lh=el=>{
  const s=getComputedStyle(el),fs=parseFloat(s.fontSize),v=s.lineHeight;
  return v==='normal'?Math.round(fs*1.6):(parseFloat(v)||fs*1.6)
};
const ms=(txt,font,w,lh_)=>{
  try{return l_(p_(txt,font,{whiteSpace:'normal'}),w,lh_)}
  catch(e){return null}
};

const stats=new Map();
const db=()=>{
  const total=Array.from(stats.values()).reduce((a,s)=>({
    blocks:a.blocks+s.blocks,lines:a.lines+s.lines,chars:a.chars+s.chars
  }),{blocks:0,lines:0,chars:0});
  $('dBlk').textContent=total.blocks;$('dLn').textContent=total.lines;$('dCh').textContent=total.chars
};
const resetStats=id=>{stats.set(id,{blocks:0,lines:0,chars:0});db()};
const recordStats=(id,r,txt)=>{
  const s=stats.get(id);s.blocks++;s.lines+=r.lineCount;s.chars+=txt.length;db()
};

// ── 1. 通栏 ──
function s1(){
  resetStats(1);
  const el=$('s1body'),fs=parseInt($('s1fs').value);
  $('s1fsv').textContent=fs+'px';
  el.style.fontSize=fs+'px';
  const txt=el.textContent.replace(/\s+/g,' ').trim(),f=gf(el),l=lh(el),w=el.clientWidth;
  if(w>0){
    const r=ms(txt,f,w,l);
    if(r){
      $('s1lc').textContent=r.lineCount;$('s1ht').textContent=Math.round(r.height);
      $('s1ch').textContent=txt.length;
      const min=Math.max(1,Math.round(txt.length/250));
      $('s1rt').textContent=`约 ${min} 分钟`;
      recordStats(1,r,txt)
    }
  }
}
$('s1fs').addEventListener('input',s1);

// ── 2. 双栏 ──
function s2(){
  resetStats(2);
  const n=parseInt($('s2col').value);
  $('s2colv').textContent=n+' 栏';
  $('s2wrap').style.columnCount=n;
  const ps=$('s2wrap').querySelectorAll('.two-p'),all=Array.from(ps).map(p=>p.textContent).join(' ');
  const f=gf(ps[0]),l=lh(ps[0]);
  const cw=($('s2wrap').clientWidth-44*(n-1))/n;
  if(cw>0){
    const r=ms(all,f,cw,l);
    if(r){
      $('s2lc').textContent=r.lineCount;
      $('s2ppc').textContent=Math.round(r.lineCount/n);
      const min=Math.max(1,Math.round(all.length/250));
      $('s2rt').textContent=`约 ${min} 分钟`;
      recordStats(2,r,all)
    }
  }
}
$('s2col').addEventListener('input',s2);

// ── 3. 三栏 ──
function s3(){
  resetStats(3);
  const n=parseInt($('s3col').value);
  $('s3colv').textContent=n+' 栏';
  $('s3wrap').style.columnCount=n;
  const ps=$('s3wrap').querySelectorAll('.three-p'),all=Array.from(ps).map(p=>p.textContent).join(' ');
  const f=gf(ps[0]),l=lh(ps[0]);
  const cw=($('s3wrap').clientWidth-32*(n-1))/n;
  if(cw>0){
    const r=ms(all,f,cw,l);
    if(r){
      $('s3lc').textContent=r.lineCount;
      $('s3ppc').textContent=Math.round(r.lineCount/n);
      $('s3cw').textContent=Math.round(cw);
      recordStats(3,r,all)
    }
  }
}
$('s3col').addEventListener('input',s3);

// ── 4. 绕排 ──
// 逐段排版（含首段引导语）。图片占据的纵向区间内，行宽扣除图片宽度与外边距；区间之外按整行宽计算。
// 近似处理：首字下沉的占位未计入。
function s4(){
  resetStats(4);
  const side=$('s4side').value,iw=parseInt($('s4w').value);
  $('s4wv').textContent=iw+'px';
  const img=$('s4img');
  img.style.cssFloat=side;
  img.style.width=iw+'px';
  img.className='wrap-img'+(side==='right'?' r':'');

  const wrap=$('s4wrap'),ws=getComputedStyle(wrap),is=getComputedStyle(img);
  const full=wrap.clientWidth-(parseFloat(ws.paddingLeft)||0)-(parseFloat(ws.paddingRight)||0);
  const floated=is.cssFloat!=='none';   // 移动端图片位于正文上方，此时不绕排
  const imgW=img.offsetWidth+(parseFloat(is.marginLeft)||0)+(parseFloat(is.marginRight)||0);
  const imgH=img.offsetHeight+(parseFloat(is.marginTop)||0)+(parseFloat(is.marginBottom)||0);
  const narrow=full-(floated?imgW:0);
  if(full<=100||narrow<=100)return;

  let y=0,lines=0,chars=0,ht=0;
  wrap.querySelectorAll('.wrap-p').forEach(p=>{
    const txt=p.textContent.replace(/\s+/g,' ').trim();
    if(!txt)return;
    const cs=getComputedStyle(p),l=lh(p),indent=parseFloat(cs.textIndent)||0;
    const prepared=pw_(txt,gf(p),{whiteSpace:'normal'});
    let cur={segmentIndex:0,graphemeIndex:0},n=0,first=true;
    for(;;){
      const avail=(floated&&y<imgH?narrow:full)-(first?indent:0);
      if(avail<=0)break;
      const line=ln_(prepared,cur,avail);
      if(!line)break;
      if(line.end.segmentIndex===cur.segmentIndex&&line.end.graphemeIndex===cur.graphemeIndex)break;
      cur=line.end;n++;first=false;y+=l;
    }
    lines+=n;ht+=n*l;chars+=txt.length;
    y+=parseFloat(cs.marginBottom)||0;
    recordStats(4,{lineCount:n},txt);
  });
  $('s4lc').textContent=lines;
  $('s4ht').textContent=Math.round(ht);
  $('s4ch').textContent=chars;
}
$('s4side').addEventListener('change',s4);
$('s4w').addEventListener('input',s4);
// ── 5. 交错 ──
function s5(){
  resetStats(5);
  const fs=parseInt($('s5fs').value);
  $('s5fsv').textContent=fs+'px';
  let th=0;
  $('s5stagger').querySelectorAll('.stag-p').forEach(el=>{
    el.style.fontSize=fs+'px';
    const txt=el.textContent,f=gf(el),l=lh(el),w=el.clientWidth;
    if(w>0){const r=ms(txt,f,w,l);if(r){th+=r.height;recordStats(5,r,txt)}}
  });
  $('s5th').textContent=Math.round(th);
}
$('s5fs').addEventListener('input',s5);

// ── 6. 网格 ──
function s6(){
  resetStats(6);
  const fs=parseInt($('s6fs').value);
  $('s6fsv').textContent=fs+'px';
  $('s6grid').querySelectorAll('.mp').forEach(el=>el.style.fontSize=fs+'px');
  const ids=['s6t0','s6t1','s6t2','s6t3','s6t4','s6t5','s6t6'];
  let ml=0,th=0;
  ids.forEach(id=>{
    const el=$(id);if(!el)return;
    const txt=el.textContent,f=gf(el),l=lh(el),w=el.clientWidth;
    if(w>0){const r=ms(txt,f,w,l);if(r){ml=Math.max(ml,r.lineCount);th+=r.height;recordStats(6,r,txt)}}
  });
  $('s6ml').textContent=ml;$('s6th').textContent=Math.round(th);
}
$('s6fs').addEventListener('input',s6);

// ── 7. 自由 ──
// 字号缩放：通过 CSS 变量 --fs 作用于 .ct / h4 / p（见 css）。每个文本块按其实际渲染宽度与字体计算行数。
function s7(){
  resetStats(7);
  const scale=parseInt($('s7scale').value)/100;
  $('s7scalev').textContent=Math.round(scale*100)+'%';
  $('s7free').style.setProperty('--fs',scale);
  let tot=0,cnt=0;
  for(let i=1;i<=5;i++){
    const el=$('s7e'+i);if(!el)continue;
    const cs=getComputedStyle(el);
    // 绝对定位元素按 max-width 收缩，读取的是应用新字号后的渲染宽度
    const cw=el.getBoundingClientRect().width-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);
    if(cw<=0)continue;
    let n=0,txt='';
    el.querySelectorAll('.ct,h4,p').forEach(node=>{
      const t=node.textContent.replace(/\s+/g,' ').trim();
      if(!t)return;
      txt+=t;
      const r=ms(t,gf(node),cw,lh(node));
      if(r)n+=r.lineCount;
    });
    tot+=n;cnt++;
    recordStats(7,{lineCount:n},txt);
  }
  $('s7lc').textContent=tot;
  $('s7avg').textContent=cnt?(tot/cnt).toFixed(1):'-';
}
$('s7scale').addEventListener('input',s7);
// ── All ──
function all(){s1();s2();s3();s4();s5();s6();s7()}
let rt;
window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(all,250)});
document.fonts.ready.then(()=>setTimeout(all,120));
if(document.readyState==='complete')all();else window.addEventListener('load',all);

console.log('7 layouts × Pretext 0.0.9 ready');
})();
