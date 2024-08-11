/*! Capacitor: https://capacitorjs.com/ - MIT License */const Z=r=>{const e=new Map;e.set("web",{name:"web"});const t=r.CapacitorPlatforms||{currentPlatform:{name:"web"},platforms:e},o=(n,a)=>{t.platforms.set(n,a)},i=n=>{t.platforms.has(n)&&(t.currentPlatform=t.platforms.get(n))};return t.addPlatform=o,t.setPlatform=i,t},N=r=>r.CapacitorPlatforms=Z(r),M=N(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});M.addPlatform;M.setPlatform;var C;(function(r){r.Unimplemented="UNIMPLEMENTED",r.Unavailable="UNAVAILABLE"})(C||(C={}));class _ extends Error{constructor(e,t,o){super(e),this.message=e,this.code=t,this.data=o}}const ee=r=>{var e,t;return r!=null&&r.androidBridge?"android":!((t=(e=r==null?void 0:r.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},te=r=>{var e,t,o,i,n;const a=r.CapacitorCustomPlatform||null,s=r.Capacitor||{},f=s.Plugins=s.Plugins||{},l=r.CapacitorPlatforms,E=()=>a!==null?a.name:ee(r),P=((e=l==null?void 0:l.currentPlatform)===null||e===void 0?void 0:e.getPlatform)||E,x=()=>P()!=="web",I=((t=l==null?void 0:l.currentPlatform)===null||t===void 0?void 0:t.isNativePlatform)||x,q=c=>{const d=A.get(c);return!!(d!=null&&d.platforms.has(P())||S(c))},B=((o=l==null?void 0:l.currentPlatform)===null||o===void 0?void 0:o.isPluginAvailable)||q,G=c=>{var d;return(d=s.PluginHeaders)===null||d===void 0?void 0:d.find(y=>y.name===c)},S=((i=l==null?void 0:l.currentPlatform)===null||i===void 0?void 0:i.getPluginHeader)||G,K=c=>r.console.error(c),z=(c,d,y)=>Promise.reject("".concat(y,' does not have an implementation of "').concat(d,'".')),A=new Map,V=(c,d={})=>{const y=A.get(c);if(y)return console.warn('Capacitor plugin "'.concat(c,'" already registered. Cannot register plugins twice.')),y.proxy;const b=P(),L=S(c);let v;const Q=async()=>(!v&&b in d?v=typeof d[b]=="function"?v=await d[b]():v=d[b]:a!==null&&!v&&"web"in d&&(v=typeof d.web=="function"?v=await d.web():v=d.web),v),X=(u,g)=>{var h,w;if(L){const p=L==null?void 0:L.methods.find(m=>g===m.name);if(p)return p.rtype==="promise"?m=>s.nativePromise(c,g.toString(),m):(m,k)=>s.nativeCallback(c,g.toString(),m,k);if(u)return(h=u[g])===null||h===void 0?void 0:h.bind(u)}else{if(u)return(w=u[g])===null||w===void 0?void 0:w.bind(u);throw new _('"'.concat(c,'" plugin is not implemented on ').concat(b),C.Unimplemented)}},j=u=>{let g;const h=(...w)=>{const p=Q().then(m=>{const k=X(m,u);if(k){const $=k(...w);return g=$==null?void 0:$.remove,$}else throw new _('"'.concat(c,".").concat(u,'()" is not implemented on ').concat(b),C.Unimplemented)});return u==="addListener"&&(p.remove=async()=>g()),p};return h.toString=()=>"".concat(u.toString(),"() { [capacitor code] }"),Object.defineProperty(h,"name",{value:u,writable:!1,configurable:!1}),h},T=j("addListener"),H=j("removeListener"),Y=(u,g)=>{const h=T({eventName:u},g),w=async()=>{const m=await h;H({eventName:u,callbackId:m},g)},p=new Promise(m=>h.then(()=>m({remove:w})));return p.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await w()},p},U=new Proxy({},{get(u,g){switch(g){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return L?Y:T;case"removeListener":return H;default:return j(g)}}});return f[c]=U,A.set(c,{name:c,proxy:U,platforms:new Set([...Object.keys(d),...L?[b]:[]])}),U},J=((n=l==null?void 0:l.currentPlatform)===null||n===void 0?void 0:n.registerPlugin)||V;return s.convertFileSrc||(s.convertFileSrc=c=>c),s.getPlatform=P,s.handleError=K,s.isNativePlatform=I,s.isPluginAvailable=B,s.pluginMethodNoop=z,s.registerPlugin=J,s.Exception=_,s.DEBUG=!!s.DEBUG,s.isLoggingEnabled=!!s.isLoggingEnabled,s.platform=s.getPlatform(),s.isNative=s.isNativePlatform(),s},re=r=>r.Capacitor=te(r),O=re(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),D=O.registerPlugin;O.Plugins;class F{constructor(e){this.listeners={},this.retainedEventArguments={},this.windowListeners={},e&&(console.warn('Capacitor WebPlugin "'.concat(e.name,'" config object was deprecated in v3 and will be removed in v4.')),this.config=e)}addListener(e,t){let o=!1;this.listeners[e]||(this.listeners[e]=[],o=!0),this.listeners[e].push(t);const n=this.windowListeners[e];n&&!n.registered&&this.addWindowListener(n),o&&this.sendRetainedArgumentsForEvent(e);const a=async()=>this.removeListener(e,t);return Promise.resolve({remove:a})}async removeAllListeners(){this.listeners={};for(const e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,o){const i=this.listeners[e];if(!i){if(o){let n=this.retainedEventArguments[e];n||(n=[]),n.push(t),this.retainedEventArguments[e]=n}return}i.forEach(n=>n(t))}hasListeners(e){return!!this.listeners[e].length}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:o=>{this.notifyListeners(t,o)}}}unimplemented(e="not implemented"){return new O.Exception(e,C.Unimplemented)}unavailable(e="not available"){return new O.Exception(e,C.Unavailable)}async removeListener(e,t){const o=this.listeners[e];if(!o)return;const i=o.indexOf(t);this.listeners[e].splice(i,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){const t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(o=>{this.notifyListeners(e,o)}))}}const R=r=>encodeURIComponent(r).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),W=r=>r.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class ne extends F{async getCookies(){const e=document.cookie,t={};return e.split(";").forEach(o=>{if(o.length<=0)return;let[i,n]=o.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");i=W(i).trim(),n=W(n).trim(),t[i]=n}),t}async setCookie(e){try{const t=R(e.key),o=R(e.value),i="; expires=".concat((e.expires||"").replace("expires=","")),n=(e.path||"/").replace("path=",""),a=e.url!=null&&e.url.length>0?"domain=".concat(e.url):"";document.cookie="".concat(t,"=").concat(o||"").concat(i,"; path=").concat(n,"; ").concat(a,";")}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie="".concat(e.key,"=; Max-Age=0")}catch(t){return Promise.reject(t)}}async clearCookies(){try{const e=document.cookie.split(";")||[];for(const t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,"=;expires=".concat(new Date().toUTCString(),";path=/"))}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}}D("CapacitorCookies",{web:()=>new ne});const se=async r=>new Promise((e,t)=>{const o=new FileReader;o.onload=()=>{const i=o.result;e(i.indexOf(",")>=0?i.split(",")[1]:i)},o.onerror=i=>t(i),o.readAsDataURL(r)}),oe=(r={})=>{const e=Object.keys(r);return Object.keys(r).map(i=>i.toLocaleLowerCase()).reduce((i,n,a)=>(i[n]=r[e[a]],i),{})},ie=(r,e=!0)=>r?Object.entries(r).reduce((o,i)=>{const[n,a]=i;let s,f;return Array.isArray(a)?(f="",a.forEach(l=>{s=e?encodeURIComponent(l):l,f+="".concat(n,"=").concat(s,"&")}),f.slice(0,-1)):(s=e?encodeURIComponent(a):a,f="".concat(n,"=").concat(s)),"".concat(o,"&").concat(f)},"").substr(1):null,ae=(r,e={})=>{const t=Object.assign({method:r.method||"GET",headers:r.headers},e),i=oe(r.headers)["content-type"]||"";if(typeof r.data=="string")t.body=r.data;else if(i.includes("application/x-www-form-urlencoded")){const n=new URLSearchParams;for(const[a,s]of Object.entries(r.data||{}))n.set(a,s);t.body=n.toString()}else if(i.includes("multipart/form-data")||r.data instanceof FormData){const n=new FormData;if(r.data instanceof FormData)r.data.forEach((s,f)=>{n.append(f,s)});else for(const s of Object.keys(r.data))n.append(s,r.data[s]);t.body=n;const a=new Headers(t.headers);a.delete("content-type"),t.headers=a}else(i.includes("application/json")||typeof r.data=="object")&&(t.body=JSON.stringify(r.data));return t};class le extends F{async request(e){const t=ae(e,e.webFetchExtra),o=ie(e.params,e.shouldEncodeUrlParams),i=o?"".concat(e.url,"?").concat(o):e.url,n=await fetch(i,t),a=n.headers.get("content-type")||"";let{responseType:s="text"}=n.ok?e:{};a.includes("application/json")&&(s="json");let f,l;switch(s){case"arraybuffer":case"blob":l=await n.blob(),f=await se(l);break;case"json":f=await n.json();break;case"document":case"text":default:f=await n.text()}const E={};return n.headers.forEach((P,x)=>{E[x]=P}),{data:f,headers:E,status:n.status,url:n.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}}D("CapacitorHttp",{web:()=>new le});const ce=(r,e)=>{const t=r.__vccOpts||r;for(const[o,i]of e)t[o]=i;return t};export{F as W,ce as _,D as r};