"use client";
import React, {useEffect,useRef,useState} from "react";
import AppBrand from "./AppBrand";

export default function HowWeWork(){
 const howRef=useRef(null);
 const [progress,setProgress]=useState(0), [compact,setCompact]=useState(false), [tick,setTick]=useState(0);
 useEffect(()=>{
  function update(){const vh=window.innerHeight;setCompact(window.innerWidth<900);setProgress(Math.round(Math.min(1,Math.max(0,(vh*.75-howRef.current.getBoundingClientRect().top)/(vh*.55)))*100));}
  update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
  const timer=!matchMedia('(prefers-reduced-motion: reduce)').matches && setInterval(()=>setTick(t=>t+1),1100);
  return ()=>{clearInterval(timer);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
 },[]);
 const trackDisplay = compact ? 'none' : 'block';
 const howCols = compact ? 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' : 'repeat(3, minmax(0, 1fr))';
 const howFill = (progress * 0.6668).toFixed(2) + '%';
 const howNodes = ['16.66%', '50%', '83.33%'].map((x, k) => { const on = progress >= k * 50; return { x, bg: on ? '#2A62F5' : '#DDE1E8', glow: on ? '0 0 0 6px rgba(42,98,245,0.15)' : 'none' }; });
 const hc0 = progress >= 0 && progress > 2 ? '#7FA2FF' : 'var(--yl-line, #E4E7EC)';
 const hc1 = progress >= 50 ? '#7FA2FF' : 'var(--yl-line, #E4E7EC)';
 const hc2 = progress >= 100 ? '#7FA2FF' : 'var(--yl-line, #E4E7EC)';
 const buildBlocks = [['Zapier', '#FF7A45'], ['GoHighLevel', '#2A62F5'], ['OpenAI', '#0D1321']].map(([name, c], k) => { const on = k < (tick % 5); return { name, c, op: on ? 1 : 0, tf: on ? 'none' : 'translateY(16px) scale(0.96)', fl: on ? 'blur(0px)' : 'blur(6px)' }; });
 const uptime = Array.from({ length: 60 }, (_, i) => i % 30 === 17 ? '#FFC48A' : '#B7E9CD');
 const runRing = tick % 2 ? 6 : 2;
return (<section ref={(howRef)} data-screen-label={"How we work"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(110px, 14vw, 180px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"h"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 56px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"How"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"we"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"work."}
</span>
</h2>
{" "}
<div style={{"position":"relative","display":(trackDisplay),"height":"24px","margin":"0 0 20px"}}>
{" "}
<div style={{"position":"absolute","left":"16.66%","right":"16.66%","top":"11px","height":"2px","background":"var(--yl-line, #DDE1E8)","borderRadius":"2px"}}>

</div>
{" "}
<div style={{"position":"absolute","left":"16.66%","top":"11px","height":"2px","width":(howFill),"background":"#2A62F5","borderRadius":"2px","transition":"width 140ms linear"}}>

</div>
{" "}
{(howNodes).map((hn, itemIndex4) => <React.Fragment key={itemIndex4}>{" "}
<span style={{"position":"absolute","left":(hn.x),"top":"3px","width":"18px","height":"18px","marginLeft":"-9px","boxSizing":"border-box","borderRadius":"999px","background":(hn.bg),"border":"3px solid var(--yl-bg, #F6F7F9)","boxShadow":(hn.glow),"transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>

</span>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
<div style={{"display":"grid","gridTemplateColumns":(howCols),"gap":"16px"}}>
{" "}
<div data-yl-reveal={"0"} style={{"padding":"12px","borderRadius":"28px","background":"var(--yl-card, #FFFFFF)","border":"1px solid " + String(hc0),"display":"flex","flexDirection":"column","gap":"22px","transition":"border-color 600ms ease"}}>
{" "}
<div style={{"position":"relative","height":"210px","borderRadius":"20px","overflow":"hidden","color":"#0D1321","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div data-yl-float={"0"} style={{"position":"absolute","left":"10%","top":"18%","padding":"10px 14px","borderRadius":"16px 16px 16px 6px","background":"#FFFFFF","fontSize":"13px","boxShadow":"0 10px 30px -14px rgba(13,19,33,0.35)"}}>
{"How fast do you reply?"}
</div>
{" "}
<div data-yl-float={"1"} style={{"position":"absolute","right":"8%","top":"44%","padding":"10px 14px","borderRadius":"16px 16px 6px 16px","background":"#2A62F5","color":"#FFFFFF","fontSize":"13px","boxShadow":"0 14px 30px -14px rgba(42,98,245,0.6)"}}>
{"Test enquiry sent 2:14pm…"}
</div>
{" "}
<div data-yl-float={"2"} style={{"position":"absolute","left":"16%","bottom":"13%","display":"inline-flex","gap":"8px","alignItems":"center","padding":"6px 12px","borderRadius":"999px","background":"#FFFFFF","fontSize":"12px","fontWeight":"500","boxShadow":"0 10px 24px -14px rgba(13,19,33,0.35)"}}>
<span style={{"width":"7px","height":"7px","borderRadius":"999px","background":"#2A62F5"}}>

</span>
{"3-min video · free"}
</div>
{" "}
</div>
{" "}
<div style={{"padding":"0 16px 18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"20px","color":"#2A62F5"}}>
{"01"}
</span>
{" "}
<div style={{"fontSize":"28px","fontWeight":"500","letterSpacing":"0","marginTop":"4px"}}>
{"Free audit"}
</div>
{" "}
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"We test your enquiry form and send a 3-minute video."}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"110"} style={{"padding":"12px","borderRadius":"28px","background":"var(--yl-card, #FFFFFF)","border":"1px solid " + String(hc1),"display":"flex","flexDirection":"column","gap":"22px","transition":"border-color 600ms ease"}}>
{" "}
<div style={{"position":"relative","height":"210px","borderRadius":"20px","overflow":"hidden","color":"#0D1321","display":"grid","placeItems":"center","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"8px","width":"min(80%, 240px)"}}>
{" "}
{(buildBlocks).map((bb, itemIndex7) => <React.Fragment key={itemIndex7}>{" "}
<div style={{"display":"flex","alignItems":"center","gap":"10px","padding":"10px 12px","borderRadius":"14px","background":"#FFFFFF","fontSize":"13px","fontWeight":"500","boxShadow":"0 10px 24px -14px rgba(13,19,33,0.35)","opacity":(bb.op),"transform":(bb.tf),"filter":(bb.fl),"transition":"all 700ms cubic-bezier(.16,1,.3,1)"}}>
<AppBrand name={bb.name} />
<span style={{"marginLeft":"auto","color":"#2A62F5"}}>
{"✓"}
</span>
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"padding":"0 16px 18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"20px","color":"#2A62F5"}}>
{"02"}
</span>
{" "}
<div style={{"fontSize":"28px","fontWeight":"500","letterSpacing":"0","marginTop":"4px"}}>
{"21-day build"}
</div>
{" "}
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"45 minutes of your time. Live in 21 days."}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"220"} style={{"padding":"12px","borderRadius":"28px","background":"var(--yl-card, #FFFFFF)","border":"1px solid " + String(hc2),"display":"flex","flexDirection":"column","gap":"22px","transition":"border-color 600ms ease"}}>
{" "}
<div style={{"position":"relative","height":"210px","borderRadius":"20px","overflow":"hidden","color":"#0D1321","display":"grid","placeItems":"center","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div style={{"width":"min(86%, 280px)","boxSizing":"border-box","padding":"16px","borderRadius":"18px","background":"#FFFFFF","boxShadow":"0 14px 34px -16px rgba(13,19,33,0.35)","display":"flex","flexDirection":"column","gap":"14px"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"8px","fontSize":"13px","fontWeight":"500"}}>
<span style={{"width":"8px","height":"8px","borderRadius":"999px","background":"#22B26B","boxShadow":"0 0 0 " + String(runRing) + "px rgba(34,178,107,0.18)","transition":"box-shadow 900ms ease"}}>

</span>
{"All systems running"}
<span style={{"marginLeft":"auto","color":"#5B6272","fontWeight":"400"}}>
{"24/7"}
</span>
</div>
{" "}
<div style={{"overflow":"hidden","WebkitMaskImage":"linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)","maskImage":"linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)"}}>
{" "}
<div data-yl-uptime={""} style={{"display":"flex","gap":"4px","width":"max-content"}}>
{" "}
{(uptime).map((u, itemIndex9) => <React.Fragment key={itemIndex9}><span style={{"width":"6px","height":"28px","borderRadius":"3px","background":(u)}}>

</span></React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"padding":"0 16px 18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"20px","color":"#2A62F5"}}>
{"03"}
</span>
{" "}
<div style={{"fontSize":"28px","fontWeight":"500","letterSpacing":"0","marginTop":"4px"}}>
{"Run"}
</div>
{" "}
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"It works quietly. We watch for problems."}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</section>);
}
