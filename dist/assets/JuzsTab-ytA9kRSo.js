import{d as C,u as x,m as S,c as i,w as r,a as e,o as l,b as n,n as V,I as v,f as d,r as m,g as w,h as j,p as _,t as p,F as f,q as y,j as h,i as F,s as J,v as N,k as B,l as T}from"./index-BxKZXudA.js";import{u as A}from"./JuzStore-CwiWQwvV.js";import{u as $}from"./ChapterStore-BCWT5l7E.js";import{_ as q}from"./HeaderComponent.vue_vue_type_script_setup_true_lang-mKbkqiA6.js";import{_ as D}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./number-50Ioylus.js";const E={class:"metadata-end-wrapper",slot:"end"},M=C({__name:"JuzsTab",setup(O){const o=A(),{getChapter:g}=$(),{getLine:I}=x(),b=S(()=>{if(o.juzs)return o.juzs.map(a=>({...a,chapters:k(a.juz_number,a.verse_mapping)})).filter(a=>a.juz_number.toLocaleString().replace(/([\-\'])/,"").includes(o.searchValue.toLocaleLowerCase().replace(/([\-\'])/,"")))}),k=(u,a)=>{const t=[];for(const s in a){const L=a[s],c=g(Number(s));c&&t.push({juzNumber:u,chapterId:s,en:c.nameSimple,ar:c.nameArabic,verses:L})}return t},z=u=>{o.searchValue=u};return(u,a)=>(l(),i(e(T),null,{default:r(()=>[n(q,{title:e(I)("tabs.juzs"),"is-loading":e(o).isLoading,icon:e(V),"onUpdate:searchValue":z},null,8,["title","is-loading","icon"]),n(e(B),{fullscreen:!0},{default:r(()=>[n(e(v),null,{default:r(()=>[(l(!0),d(f,null,m(b.value,t=>(l(),i(e(w),{button:!0,detail:!1,key:t.id,"router-link":"juz/".concat(t.juz_number)},{default:r(()=>[n(e(j),null,{default:r(()=>[_("strong",null,"Juz-"+p(t.juz_number),1),(l(!0),d(f,null,m(t.chapters,s=>(l(),i(e(y),{key:s.chapterId,color:"medium",class:"d-flex"},{default:r(()=>[h(p(s.en),1)]),_:2},1024))),128))]),_:2},1024),_("div",E,[n(e(F),{color:"medium"},{default:r(()=>[h(p(t.chapters.length),1)]),_:2},1024),n(e(J),{color:"medium",icon:e(N)},null,8,["icon"])])]),_:2},1032,["router-link"]))),128))]),_:1})]),_:1})]),_:1}))}}),Q=D(M,[["__scopeId","data-v-0212e790"]]);export{Q as default};
