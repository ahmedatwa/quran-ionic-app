!function(){function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,s(r.key),r)}}function n(t,n,i){return n=o(n),function(t,n){if(n&&("object"==e(n)||"function"==typeof n))return n;if(void 0!==n)throw new TypeError("Derived constructors may only return object or undefined");return function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(t)}(t,r()?Reflect.construct(n,i||[],o(t).constructor):n.apply(t,i))}function r(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(e){}return(r=function(){return!!e})()}function o(e){return o=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},o(e)}function i(e,t){return i=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},i(e,t)}function a(e){return function(e){if(Array.isArray(e))return p(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||f(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function u(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?u(Object(n),!0).forEach((function(t){c(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t,n){return(t=s(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(t){var n=function(t,n){if("object"!=e(t)||!t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var o=r.call(t,n||"default");if("object"!=e(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(t)}(t,"string");return"symbol"==e(n)?n:n+""}function d(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,o,i,a,u=[],l=!0,c=!1;try{if(i=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;l=!1}else for(;!(l=(r=i.call(n)).done)&&(u.push(r.value),u.length!==t);l=!0);}catch(e){c=!0,o=e}finally{try{if(!l&&null!=n.return&&(a=n.return(),Object(a)!==a))return}finally{if(c)throw o}}return u}}(e,t)||f(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function f(e,t){if(e){if("string"==typeof e)return p(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?p(e,t):void 0}}function p(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function v(){"use strict";/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */v=function(){return n};var t,n={},r=Object.prototype,o=r.hasOwnProperty,i=Object.defineProperty||function(e,t,n){e[t]=n.value},a="function"==typeof Symbol?Symbol:{},u=a.iterator||"@@iterator",l=a.asyncIterator||"@@asyncIterator",c=a.toStringTag||"@@toStringTag";function s(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{s({},"")}catch(t){s=function(e,t,n){return e[t]=n}}function d(e,t,n,r){var o=t&&t.prototype instanceof b?t:b,a=Object.create(o.prototype),u=new E(r||[]);return i(a,"_invoke",{value:T(e,n,u)}),a}function f(e,t,n){try{return{type:"normal",arg:e.call(t,n)}}catch(e){return{type:"throw",arg:e}}}n.wrap=d;var p="suspendedStart",m="suspendedYield",y="executing",h="completed",g={};function b(){}function _(){}function w(){}var k={};s(k,u,(function(){return this}));var x=Object.getPrototypeOf,P=x&&x(x(R([])));P&&P!==r&&o.call(P,u)&&(k=P);var j=w.prototype=b.prototype=Object.create(k);function S(e){["next","throw","return"].forEach((function(t){s(e,t,(function(e){return this._invoke(t,e)}))}))}function O(t,n){function r(i,a,u,l){var c=f(t[i],t,a);if("throw"!==c.type){var s=c.arg,d=s.value;return d&&"object"==e(d)&&o.call(d,"__await")?n.resolve(d.__await).then((function(e){r("next",e,u,l)}),(function(e){r("throw",e,u,l)})):n.resolve(d).then((function(e){s.value=e,u(s)}),(function(e){return r("throw",e,u,l)}))}l(c.arg)}var a;i(this,"_invoke",{value:function(e,t){function o(){return new n((function(n,o){r(e,t,n,o)}))}return a=a?a.then(o,o):o()}})}function T(e,n,r){var o=p;return function(i,a){if(o===y)throw Error("Generator is already running");if(o===h){if("throw"===i)throw a;return{value:t,done:!0}}for(r.method=i,r.arg=a;;){var u=r.delegate;if(u){var l=L(u,r);if(l){if(l===g)continue;return l}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(o===p)throw o=h,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);o=y;var c=f(e,n,r);if("normal"===c.type){if(o=r.done?h:m,c.arg===g)continue;return{value:c.arg,done:r.done}}"throw"===c.type&&(o=h,r.method="throw",r.arg=c.arg)}}}function L(e,n){var r=n.method,o=e.iterator[r];if(o===t)return n.delegate=null,"throw"===r&&e.iterator.return&&(n.method="return",n.arg=t,L(e,n),"throw"===n.method)||"return"!==r&&(n.method="throw",n.arg=new TypeError("The iterator does not provide a '"+r+"' method")),g;var i=f(o,e.iterator,n.arg);if("throw"===i.type)return n.method="throw",n.arg=i.arg,n.delegate=null,g;var a=i.arg;return a?a.done?(n[e.resultName]=a.value,n.next=e.nextLoc,"return"!==n.method&&(n.method="next",n.arg=t),n.delegate=null,g):a:(n.method="throw",n.arg=new TypeError("iterator result is not an object"),n.delegate=null,g)}function A(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function C(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function E(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(A,this),this.reset(!0)}function R(n){if(n||""===n){var r=n[u];if(r)return r.call(n);if("function"==typeof n.next)return n;if(!isNaN(n.length)){var i=-1,a=function e(){for(;++i<n.length;)if(o.call(n,i))return e.value=n[i],e.done=!1,e;return e.value=t,e.done=!0,e};return a.next=a}}throw new TypeError(e(n)+" is not iterable")}return _.prototype=w,i(j,"constructor",{value:w,configurable:!0}),i(w,"constructor",{value:_,configurable:!0}),_.displayName=s(w,c,"GeneratorFunction"),n.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return!!t&&(t===_||"GeneratorFunction"===(t.displayName||t.name))},n.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,w):(e.__proto__=w,s(e,c,"GeneratorFunction")),e.prototype=Object.create(j),e},n.awrap=function(e){return{__await:e}},S(O.prototype),s(O.prototype,l,(function(){return this})),n.AsyncIterator=O,n.async=function(e,t,r,o,i){void 0===i&&(i=Promise);var a=new O(d(e,t,r,o),i);return n.isGeneratorFunction(t)?a:a.next().then((function(e){return e.done?e.value:a.next()}))},S(j),s(j,c,"Generator"),s(j,u,(function(){return this})),s(j,"toString",(function(){return"[object Generator]"})),n.keys=function(e){var t=Object(e),n=[];for(var r in t)n.push(r);return n.reverse(),function e(){for(;n.length;){var r=n.pop();if(r in t)return e.value=r,e.done=!1,e}return e.done=!0,e}},n.values=R,E.prototype={constructor:E,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(C),!e)for(var n in this)"t"===n.charAt(0)&&o.call(this,n)&&!isNaN(+n.slice(1))&&(this[n]=t)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var n=this;function r(r,o){return u.type="throw",u.arg=e,n.next=r,o&&(n.method="next",n.arg=t),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],u=a.completion;if("root"===a.tryLoc)return r("end");if(a.tryLoc<=this.prev){var l=o.call(a,"catchLoc"),c=o.call(a,"finallyLoc");if(l&&c){if(this.prev<a.catchLoc)return r(a.catchLoc,!0);if(this.prev<a.finallyLoc)return r(a.finallyLoc)}else if(l){if(this.prev<a.catchLoc)return r(a.catchLoc,!0)}else{if(!c)throw Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return r(a.finallyLoc)}}}},abrupt:function(e,t){for(var n=this.tryEntries.length-1;n>=0;--n){var r=this.tryEntries[n];if(r.tryLoc<=this.prev&&o.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var i=r;break}}i&&("break"===e||"continue"===e)&&i.tryLoc<=t&&t<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=e,a.arg=t,i?(this.method="next",this.next=i.finallyLoc,g):this.complete(a)},complete:function(e,t){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),g},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),C(n),g}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var r=n.completion;if("throw"===r.type){var o=r.arg;C(n)}return o}}throw Error("illegal catch attempt")},delegateYield:function(e,n,r){return this.delegate={iterator:R(e),resultName:n,nextLoc:r},"next"===this.method&&(this.arg=t),g}},n}function m(e,t,n,r,o,i,a){try{var u=e[i](a),l=u.value}catch(e){return void n(e)}u.done?t(l):Promise.resolve(l).then(r,o)}function y(e){return function(){var t=this,n=arguments;return new Promise((function(r,o){var i=e.apply(t,n);function a(e){m(i,r,o,a,u,"next",e)}function u(e){m(i,r,o,a,u,"throw",e)}a(void 0)}))}}System.register(["./index-legacy-YeDwoDUQ.js","./_plugin-vue_export-helper-legacy-Cqk5Dwm6.js","./ChapterStore-legacy-kjNYS6C_.js","./ModalComponent.vue_vue_type_script_setup_true_lang-legacy-DVmbhuI3.js"],(function(e,r){"use strict";var o,u,s,f,p,m,h,g,b,_,w,k,x,P,j,S,O,T,L,A,C,E,R,N,F,I,V,D,z,B,M,$,U,G,H,K,W,Y,q,J,Q,X,Z,ee,te,ne,re,oe,ie,ae,ue,le,ce,se,de,fe,pe,ve,me,ye,he,ge,be,_e,we,ke,xe,Pe,je,Se,Oe,Te,Le,Ae,Ce,Ee,Re,Ne,Fe,Ie,Ve,De,ze,Be,Me;return{setters:[function(e){o=e.ax,u=e.ay,s=e.a,e.az,e.aA,e.aB,f=e.z,p=e.P,m=e.a5,h=e.as,g=e.aC,b=e.d,_=e.o,w=e.f,k=e.b,x=e.aD,P=e.u,j=e.a4,S=e.c,O=e.w,T=e.ab,L=e.v,A=e.aE,C=e.aF,E=e.j,R=e.k,N=e.t,F=e.aG,I=e.a1,V=e.i,D=e.$,z=e.A,B=e.aH,M=e.a2,$=e.ag,U=e.ah,G=e.ai,H=e.aI,K=e.h,W=e.aJ,Y=e.q,q=e.s,J=e.aK,Q=e.aL,X=e.aM,Z=e.a9,ee=e.aa,te=e.aN,ne=e.aO,re=e.aP,oe=e.aQ,ie=e.aR,ae=e.R,ue=e.aS,le=e.I,ce=e.r,se=e.K,de=e.g,fe=e.M,pe=e.N,ve=e.aT,me=e.aU,ye=e.F,he=e.m,ge=e.aV,be=e.aW,_e=e.aX,we=e.C,ke=e.X,xe=e.aY,Pe=e.aZ,je=e.a_,Se=e.a$,Oe=e.b0,Te=e.b1,Le=e.b2,Ae=e.b3,Ce=e.Z},function(e){Ee=e.W,Re=e.r,Ne=e._},function(e){Fe=e.u,Ie=e.g,Ve=e.c,De=e.d,ze=e.m},function(e){Be=e._,Me=e.u}],execute:function(){var r=document.createElement("style");r.textContent=".d-none[data-v-786fc39e]{display:none!important}ion-avatar[data-v-786fc39e]{--border-radius: 4px}.footer[data-v-786fc39e]{height:73px;padding:0 10px}.slide-fade-enter-active[data-v-786fc39e]{transition:all .3s ease-out}.slide-fade-leave-active[data-v-786fc39e]{transition:all .2s cubic-bezier(1,.5,.8,1)}.slide-fade-enter-from[data-v-786fc39e],.slide-fade-leave-to[data-v-786fc39e]{transform:translate(20px);opacity:0}.img[data-v-786fc39e]{border-radius:10px;height:45px;width:50px;padding:2px}\n",document.head.appendChild(r);e("s",function(){var e=y(v().mark((function e(t,n,r,o){var i,a,u,l=arguments;return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(i=l.length>4&&void 0!==l[4]?l[4]:$e,a=document.querySelector(t),u=n||void 0,!a||Ue(a,u)){e.next=9;break}return e.next=6,Ge(r);case 6:a.scrollIntoView(i),e.next=10;break;case 9:return e.abrupt("return");case 10:case"end":return e.stop()}}),e)})));return function(t,n,r,o){return e.apply(this,arguments)}}());var $e={block:"center",behavior:"smooth"},Ue=function(e,t){var n=e.getBoundingClientRect(),r=t||document.documentElement;return n.top>=0&&n.left>=0&&n.bottom<=(window.innerHeight||r.clientHeight)&&n.right<=(window.innerWidth||r.clientWidth)},Ge=function(e){return new Promise((function(t,n){setTimeout((function(){t()}),e)}))};function He(e){return!!o()&&(u(e),!0)}function Ke(e){return"function"==typeof e?e():s(e)}var We="undefined"!=typeof window&&"undefined"!=typeof document;"undefined"!=typeof WorkerGlobalScope&&(globalThis,WorkerGlobalScope);var Ye=function(e){return null!=e},qe=(Object.prototype.toString,function(){});function Je(e){var t,n=Ke(e);return null!=(t=null==n?void 0:n.$el)?t:n}var Qe=We?window:void 0;function Xe(e){var t=function(){var e=f(!1),t=g();return t&&h((function(){e.value=!0}),t),e}();return p((function(){return t.value,Boolean(e())}))}function Ze(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=n.root,o=n.rootMargin,i=void 0===o?"0px":o,a=n.threshold,u=void 0===a?.1:a,l=n.window,c=void 0===l?Qe:l,s=n.immediate,v=void 0===s||s,y=Xe((function(){return c&&"IntersectionObserver"in c})),h=p((function(){var t=Ke(e);return(Array.isArray(t)?t:[t]).map(Je).filter(Ye)})),g=qe,b=f(v),_=y.value?m((function(){return[h.value,Je(r),b.value]}),(function(e){var n=d(e,2),r=n[0],o=n[1];if(g(),b.value&&r.length){var a=new IntersectionObserver(t,{root:Je(o),rootMargin:i,threshold:u});r.forEach((function(e){return e&&a.observe(e)})),g=function(){a.disconnect(),g=qe}}}),{immediate:v,flush:"post"}):qe,w=function(){g(),_(),b.value=!1};return He(w),{isSupported:y,isActive:b,pause:function(){g(),b.value=!1},resume:function(){b.value=!0},stop:w}}e("v",c({},"mounted",(function(e,t){"function"==typeof t.value?Ze(e,t.value):Ze.apply(void 0,[e].concat(a(t.value)))})));f(!1);var et=function(e){function r(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,r),n(this,r,arguments)}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&i(e,t)}(r,e),o=r,a=[{key:"write",value:(f=y(v().mark((function e(t){var n,r;return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("undefined"!=typeof navigator&&navigator.clipboard){e.next=2;break}throw this.unavailable("Clipboard API not available in this browser");case 2:if(void 0===t.string){e.next=7;break}return e.next=5,this.writeText(t.string);case 5:case 10:case 31:e.next=34;break;case 7:if(!t.url){e.next=12;break}return e.next=10,this.writeText(t.url);case 12:if(!t.image){e.next=33;break}if("undefined"==typeof ClipboardItem){e.next=30;break}return e.prev=14,e.next=17,fetch(t.image);case 17:return e.next=19,e.sent.blob();case 19:return n=e.sent,r=new ClipboardItem(c({},n.type,n)),e.next=23,navigator.clipboard.write([r]);case 23:e.next=28;break;case 25:throw e.prev=25,e.t0=e.catch(14),new Error("Failed to write image");case 28:e.next=31;break;case 30:throw this.unavailable("Writing images to the clipboard is not supported in this browser");case 33:throw new Error("Nothing to write");case 34:case"end":return e.stop()}}),e,this,[[14,25]])}))),function(e){return f.apply(this,arguments)})},{key:"read",value:(d=y(v().mark((function e(){var t,n,r,o;return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("undefined"!=typeof navigator&&navigator.clipboard){e.next=2;break}throw this.unavailable("Clipboard API not available in this browser");case 2:if("undefined"==typeof ClipboardItem){e.next=22;break}return e.prev=3,e.next=6,navigator.clipboard.read();case 6:return t=e.sent,n=t[0].types[0],e.next=10,t[0].getType(n);case 10:return r=e.sent,e.next=13,this._getBlobData(r,n);case 13:return o=e.sent,e.abrupt("return",{value:o,type:n});case 17:return e.prev=17,e.t0=e.catch(3),e.abrupt("return",this.readText());case 20:e.next=23;break;case 22:return e.abrupt("return",this.readText());case 23:case"end":return e.stop()}}),e,this,[[3,17]])}))),function(){return d.apply(this,arguments)})},{key:"readText",value:(s=y(v().mark((function e(){var t;return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("undefined"!=typeof navigator&&navigator.clipboard&&navigator.clipboard.readText){e.next=2;break}throw this.unavailable("Reading from clipboard not supported in this browser");case 2:return e.next=4,navigator.clipboard.readText();case 4:return t=e.sent,e.abrupt("return",{value:t,type:"text/plain"});case 6:case"end":return e.stop()}}),e,this)}))),function(){return s.apply(this,arguments)})},{key:"writeText",value:(l=y(v().mark((function e(t){return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("undefined"!=typeof navigator&&navigator.clipboard&&navigator.clipboard.writeText){e.next=2;break}throw this.unavailable("Writting to clipboard not supported in this browser");case 2:return e.next=4,navigator.clipboard.writeText(t);case 4:case"end":return e.stop()}}),e,this)}))),function(e){return l.apply(this,arguments)})},{key:"_getBlobData",value:function(e,t){return new Promise((function(n,r){var o=new FileReader;t.includes("image")?o.readAsDataURL(e):o.readAsText(e),o.onloadend=function(){var e=o.result;n(e)},o.onerror=function(e){r(e)}}))}}],a&&t(o.prototype,a),u&&t(o,u),Object.defineProperty(o,"prototype",{writable:!1}),o;var o,a,u,l,s,d,f}(Ee),tt=Re("Clipboard",{web:function(){return new et}}),nt={class:"container"},rt=(e("a",b({__name:"VerseActionComponent",props:{verse:{},triggerProp:{},actionSheetButtonsProps:{}},emits:["update:didDismiss","update:playVerseAudio","update:bookmarked"],setup:function(e,t){var n=t.emit,r=e,o=n,i=[{text:"Play",role:"play"},{text:"Copy",role:"copy"},{text:"Bookmark",role:"bookmark"},{text:"Cancel",role:"cancel"}],a=function(){var e=y(v().mark((function e(t){return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,tt.write({string:t});case 2:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return function(e,t){return _(),w("div",nt,[k(s(x),{trigger:e.triggerProp,header:"Verse ".concat(e.verse.verse_key),buttons:i,onDidDismiss:[t[0]||(t[0]=function(t){return e.$emit("update:didDismiss",t)}),t[1]||(t[1]=function(e){return function(e){switch(e.detail.role){case"play":o("update:playVerseAudio",{audioID:r.verse.chapter_id,verseKey:r.verse.verse_key});break;case"copy":a(r.verse.text_uthmani);break;case"bookmark":o("update:bookmarked",r.verse)}}(e)})]},null,8,["trigger","header"])])}}})),e("_",b({__name:"ToolbarComponent",props:{routeBackLabel:{},routerDirection:{},routeBackPath:{},isLoading:{type:Boolean}},setup:function(e){var t=P().isRtl,n=j().go;return function(e,r){return _(),S(s(D),null,{default:O((function(){return[k(s(F),{slot:"start"},{default:O((function(){return[k(s(T),{onClick:r[0]||(r[0]=function(t){return e.routeBackPath?e.routeBackPath:s(n)(-1)}),"router-direction":e.routerDirection?e.routerDirection:"back",color:"primary"},{default:O((function(){return[k(s(L),{icon:s(t)?s(A):s(C)},null,8,["icon"]),k(s(E),null,{default:O((function(){return[R(N(e.routeBackLabel),1)]})),_:1})]})),_:1},8,["router-direction"])]})),_:1}),e.isLoading?(_(),S(s(I),{key:0,type:"indeterminate"})):V("",!0)]})),_:1})}}})),{key:0}),ot={key:1},it=b({__name:"AudioPlayerModalComponent",props:{isPlaying:{type:Boolean},verseTiming:{},selectedReciter:{},audioFiles:{},chapterName:{},progressTimer:{},mediaVolume:{},loopAudio:{},mapRecitions:{}},emits:["update:playAudio","update:playChapter","update:changeVolume","update:seek","update:download","update:selectedReciter","update:playNext","update:playPrev","update:loop"],setup:function(e,t){t.emit;var n=f(),r=Fe(),o=r.chapters,i=r.getVerseByVerseKey,a=P(),u=a.getLine,l=a.isRtl,c=f(!0),d=z("__audioDB").storageKeys,m=function(e){return"".concat(e,"%")},g=function(){return be.dismiss(null,"cancel")},b=e,x=p((function(){var e=b.verseTiming;if(e){var t=String(e.verseKey),n=i(t);if(n)return{juzNumber:n.juz_number,hizbNumber:n.hizb_number,pageNumber:n.page_number}}})),j=f();h(y(v().mark((function e(){var t;return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,d();case 2:(t=e.sent)&&(j.value=t);case 4:case"end":return e.stop()}}),e)}))));var A=function(e,t){var n=String(e).concat("-").concat(String(t));return!(!j.value||!j.value.includes(n))};return function(e,t){return _(),S(s(ge),{ref_key:"modalRef",ref:n,trigger:"audio-modal"},{default:O((function(){return[k(s(M),null,{default:O((function(){return[k(s(D),null,{default:O((function(){return[k(s(F),{slot:"start"},{default:O((function(){return[k(s(T),{color:"medium",onClick:g},{default:O((function(){return[k(s(L),{icon:s(B)},null,8,["icon"])]})),_:1})]})),_:1})]})),_:1})]})),_:1}),k(s(he),{class:"ion-padding ion-margin-vertical"},{default:O((function(){return[k(s($),null,{default:O((function(){return[k(s(U),{class:"ion-justify-content-center"},{default:O((function(){return[k(s(G),{size:"11"},{default:O((function(){var n,r;return[c.value?(_(),S(s(H),{key:0,style:{height:"331px",width:"331px"}},{default:O((function(){return[k(s(K),{animated:!0})]})),_:1})):V("",!0),k(s(W),{onIonImgDidLoad:t[0]||(t[0]=function(e){return c.value=!1}),src:"/reciters/".concat(null===(n=e.selectedReciter)||void 0===n?void 0:n.reciter_id,".jpg"),alt:null===(r=e.selectedReciter)||void 0===r?void 0:r.name},null,8,["src","alt"])]})),_:1})]})),_:1}),k(s(U),null,{default:O((function(){return[k(s(G),{size:"12"},{default:O((function(){return[k(s(Y),{class:"ion-padding-vertical"},{default:O((function(){return[k(s(Y),null,{default:O((function(){return[q("h3",null,N(e.chapterName),1)]})),_:1}),k(s(Y),null,{default:O((function(){var t;return[q("h4",null,N(null===(t=e.selectedReciter)||void 0===t?void 0:t.name),1)]})),_:1}),x.value?(_(),S(s(Y),{key:0},{default:O((function(){var e,t,n;return[q("p",null,"Hizb "+N(null===(e=x.value)||void 0===e?void 0:e.hizbNumber)+" | Page "+N(null===(t=x.value)||void 0===t?void 0:t.pageNumber)+" | Juz "+N(null===(n=x.value)||void 0===n?void 0:n.juzNumber),1)]})),_:1})):V("",!0)]})),_:1})]})),_:1})]})),_:1}),k(s(U),{class:"ion-justify-content-center"},{default:O((function(){return[k(s(G),{size:"12"},{default:O((function(){var n;return[k(s(J),{"aria-label":"Seek",color:"primary",onIonInput:t[1]||(t[1]=function(t){return e.$emit("update:seek",Number(t.detail.value))}),pin:!0,"pin-formatter":m,value:Math.round(e.progressTimer),min:0,max:null===(n=e.audioFiles)||void 0===n?void 0:n.duration},null,8,["value","max"])]})),_:1})]})),_:1}),k(s(U),{class:"ion-justify-content-evenly"},{default:O((function(){return[k(s(G),null,{default:O((function(){return[k(s(T),{fill:"clear",id:"reciters-modal"},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(Q)},null,8,["icon"])]})),_:1}),k(Be,{title:s(u)("settings.reciters"),trigger:"reciters-modal",data:e.mapRecitions,selected:e.selectedReciter,"onUpdate:selectedRecition":t[2]||(t[2]=function(t){return e.$emit("update:selectedReciter",t)})},null,8,["title","data","selected"])]})),_:1}),k(s(G),null,{default:O((function(){return[k(s(T),{fill:"clear",onClick:t[3]||(t[3]=function(t){return e.$emit("update:playPrev",!0)})},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(X)},null,8,["icon"])]})),_:1})]})),_:1}),k(s(G),null,{default:O((function(){return[k(s(T),{fill:"clear",onClick:t[4]||(t[4]=function(t){return e.$emit("update:playAudio",!0)})},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:e.isPlaying?s(Z):s(ee),color:"primary"},null,8,["icon"])]})),_:1})]})),_:1}),k(s(G),null,{default:O((function(){return[k(s(T),{fill:"clear",onClick:t[5]||(t[5]=function(t){return e.$emit("update:playNext",!0)})},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(te)},null,8,["icon"])]})),_:1})]})),_:1}),k(s(G),null,{default:O((function(){return["none"===e.loopAudio?(_(),S(s(T),{key:0,fill:"clear",onClick:t[6]||(t[6]=function(t){return e.$emit("update:loop","repeat")})},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(ne),color:"medium"},null,8,["icon"])]})),_:1})):"repeat"===e.loopAudio?(_(),S(s(T),{key:1,fill:"clear",onClick:t[7]||(t[7]=function(t){return e.$emit("update:loop","none")})},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(ne),color:"primary"},null,8,["icon"])]})),_:1})):V("",!0)]})),_:1}),k(s(G),null,{default:O((function(){var n,r;return[k(s(T),{fill:"clear",onClick:t[8]||(t[8]=function(t){return e.$emit("update:download",!0)}),disabled:A(String(null===(n=e.audioFiles)||void 0===n?void 0:n.reciterId),String(null===(r=e.audioFiles)||void 0===r?void 0:r.chapter_id))},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(re),color:"danger"},null,8,["icon"])]})),_:1},8,["disabled"])]})),_:1})]})),_:1}),k(s(U),{class:"ion-justify-content-center"},{default:O((function(){return[k(s(G),{size:"12"},{default:O((function(){return[k(s(J),{"aria-label":"Volume",onIonChange:t[9]||(t[9]=function(t){return e.$emit("update:changeVolume",Number(t.detail.value))}),pin:!0,"pin-formatter":m,value:100*e.mediaVolume},{default:O((function(){return[k(s(L),{slot:"start",icon:s(oe)},null,8,["icon"]),k(s(L),{slot:"end",icon:s(ie)},null,8,["icon"])]})),_:1},8,["value"])]})),_:1})]})),_:1}),k(s(U),{class:"ion-justify-content-center ion-margin-vertical"},{default:O((function(){return[k(s(G),{size:"12"},{default:O((function(){return[k(s(ae),{class:"ion-margin-bottom"},{default:O((function(){return[k(s(L),{icon:s(ue),style:{"margin-right":"5px"}},null,8,["icon"]),R(" "+N(s(u)("audio.playlist")),1)]})),_:1}),k(s(le),{style:{height:"400px","overflow-y":"scroll"},class:"ion-padding",inset:!0},{default:O((function(){return[(_(!0),w(ye,null,ce(s(o),(function(n){return _(),S(s(se),{key:n.id},{default:O((function(){return[k(s(de),{button:!0},{default:O((function(){return[k(s(E),null,{default:O((function(){var t;return[q("h3",null,[s(l)?(_(),w("span",rt,N(n.nameArabic),1)):(_(),w("span",ot,N(n.nameSimple),1))]),q("p",null,N(null===(t=e.selectedReciter)||void 0===t?void 0:t.name),1)]})),_:2},1024)]})),_:2},1024),k(s(fe),{slot:"end"},{default:O((function(){var r,o,i;return[k(s(pe),{color:A(String(null===(r=e.audioFiles)||void 0===r?void 0:r.reciterId),String(n.id))?"medium":"success",onClick:t[10]||(t[10]=function(t){return e.$emit("update:download",!0)}),disabled:A(String(null===(o=e.audioFiles)||void 0===o?void 0:o.reciterId),String(n.id))},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(ve)},null,8,["icon"])]})),_:2},1032,["color","disabled"]),k(s(pe),{color:"primary",onClick:function(t){return e.$emit("update:playChapter",n.id)},disabled:(null===(i=e.audioFiles)||void 0===i?void 0:i.chapter_id)===n.id},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(me)},null,8,["icon"])]})),_:2},1032,["onClick","disabled"])]})),_:2},1024)]})),_:2},1024)})),128))]})),_:1})]})),_:1})]})),_:1})]})),_:1})]})),_:1})]})),_:1},512)}}}),at=["alt","src"],ut={class:"d-none"},lt=["autoplay","src","type"],ct=b({__name:"AudioPlayerComponent",props:{modelValue:{type:Boolean}},emits:["update:modelValue"],setup:function(e,t){var n=t.emit,r=Me(),o=_e(),i=f(),a=P().getLocale,u=n,c=function(){i.value&&(i.value.paused?(i.value.play(),r.isPlaying=!0):(i.value.pause(),r.isPlaying=!1))},d=function(){var e;if(null!==(e=i.value)&&void 0!==e&&e.buffered&&i.value.buffered.length){var t=i.value.buffered.length-1;return i.value.buffered.end(t)}return 0},m=function(){i.value&&r.audioFiles&&(r.listenerActive=!0,r.currentTimestamp=i.value.currentTime,r.duration=Te(r.audioFiles.duration),r.elapsedTime=Le(r.duration-(r.currentTimestamp-1),Ie(a.value)),r.progressTimer=Ae(r.currentTimestamp-1))},h=function(){var e=y(v().mark((function e(){var t;return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:e.t0=r.loopAudio,e.next="once"===e.t0?3:"repeat"===e.t0?5:"none"===e.t0?8:13;break;case 3:return i.value&&(i.value.currentTime=0,r.isPlaying=!0,null===(t=i.value)||void 0===t||t.play()),e.abrupt("break",13);case 5:return e.next=7,r.playNext();case 7:return e.abrupt("break",13);case 8:return r.isPlaying=!1,r.listenerActive=!1,g(),r.audioPlayerSetting.dismissOnEnd&&E(),e.abrupt("break",13);case 13:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),g=function(){var e,t,n;r.listenerActive=!1,r.isPlaying=!1,null===(e=i.value)||void 0===e||e.removeEventListener("timeupdate",m),null===(t=i.value)||void 0===t||t.removeEventListener("ended",h),null===(n=i.value)||void 0===n||n.removeEventListener("pause",r.playbackPaused)},b=function(){r.audioFiles&&(r.audioDuration=Le(Math.round(r.audioFiles.duration))),i.value&&(i.value.volume=r.mediaVolume)},w=function(){if(r.isLoading=!0,i.value){if(!(i.value.readyState>2))throw"Failed to fetch Audio";if(r.selectedVerseKey){var e,t=null===(e=r.audioFiles)||void 0===e?void 0:e.verse_timings.find((function(e){return e.verse_key===r.selectedVerseKey}));t&&i.value&&(i.value.currentTime=Te(t.timestamp_from),r.progressTimer=Ae(t.timestamp_from/t.timestamp_to))}r.isLoading=!1}},x=function(e){i.value&&(r.progressTimer=e,i.value.currentTime=e/1e3)},j=function(){r.chapterName&&(o.setPageTitle(r.chapterName),o.setMetaData([{property:"og:audio:title",content:r.chapterName},{name:"twitter:title",content:r.chapterName},{property:"og:title",content:r.chapterName}])),r.audioFiles&&o.setMetaData([{property:"music:song:track",content:String(r.audioFiles.id)},{property:"og:url",content:r.audioFiles.audio_url},{property:"og:type",content:r.audioFiles.format},{property:"og:audio",content:r.audioFiles.audio_url},{property:"music:duration",content:r.audioFiles.duration.toString()},{property:"og:audio:type",content:r.audioFiles.format}]),r.selectedReciter&&(o.setMetaData([{name:"twitter:image",content:"/reciters/".concat(r.selectedReciter.reciter_id,".jpg")},{property:"music:musician",content:r.selectedReciter.name},{property:"og:audio:artist",content:r.selectedReciter.name},{property:"og:image",content:"/reciters/".concat(r.selectedReciter.reciter_id,".jpg")}]),"mediaSession"in navigator&&(navigator.mediaSession.metadata=new MediaMetadata({title:r.chapterName,artist:r.selectedReciter.name,album:"Quran",artwork:[{src:"/reciters/".concat(r.selectedReciter.reciter_id,".jpg"),sizes:"96x96",type:"image/jpg"}]}),navigator.mediaSession.setActionHandler("play",(function(){c()})),navigator.mediaSession.setActionHandler("pause",(function(){c()})),navigator.mediaSession.setActionHandler("seekto",(function(e){var t=e.seekTime;t&&(r.progressTimer=Ae(t),x(t))})),navigator.mediaSession.setActionHandler("nexttrack",(function(){r.playNext()})),navigator.mediaSession.setActionHandler("previoustrack",(function(){r.playPrevious()}))))},A=function(e,t,n){return e>=t&&e<n},C=p((function(){if(r.audioFiles)return r.audioFiles.verse_timings.map((function(e){return l({inRange:!1,wordLocation:"",wordPosition:0,verseNumber:0},e)}))}));we((function(){if(C){var e,t=Math.ceil(Ae(r.currentTimestamp)),n=null===(e=C.value)||void 0===e?void 0:e.find((function(e){return t>=e.timestamp_from&&t<=e.timestamp_to}));if(n)A(t,n.timestamp_from,null==n?void 0:n.timestamp_to)&&n.segments.map((function(e){var o=A(t,e[1],e[2]);o&&(r.verseTiming={chapterId:Ve(n.verse_key),verseKey:n.verse_key,inRange:o,verseNumber:De(n.verse_key),wordLocation:ze(n.verse_key,e[0]),wordPosition:e[0],audioSrc:r.audioPayLoadSrc})}))}})),ke((function(){r.audioFiles=null}));var E=function(){u("update:modelValue",!1),i.value&&i.value.pause(),r.chapterId=0,r.audioFiles=null,r.selectedVerseKey="",g()},R=function(){var e=y(v().mark((function e(t){return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:i.value&&(r.mediaVolume=t,i.value.volume=r.mediaVolume/100);case 1:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),N=function(e){r.getAudio({audioID:e})},F=function(e){r.selectedReciter=e},I=function(e){console.log(e),r.playNext()};return function(e,t){return _(),S(Oe,{name:"slide-fade"},{default:O((function(){return[e.modelValue?(_(),S(s(xe),{key:0,class:"footer"},{default:O((function(){return[k(s(D),null,{default:O((function(){var e,n;return[k(s($),null,{default:O((function(){return[k(s(U),null,{default:O((function(){return[k(s(G),{id:"audio-modal"},{default:O((function(){return[k(s(Pe),null,{default:O((function(){var e,t;return[q("img",{alt:null===(e=s(r).selectedReciter)||void 0===e?void 0:e.name,class:"img",src:"/reciters/".concat(null===(t=s(r).selectedReciter)||void 0===t?void 0:t.reciter_id,".jpg")},null,8,at)]})),_:1})]})),_:1}),k(s(G),{size:"5","size-md":"3","size-lg":"3",class:"ion-text-right"},{default:O((function(){return[k(s(T),{fill:"clear",onClick:c},{default:O((function(){return[s(r).isLoading?(_(),S(s(je),{key:0})):(_(),S(s(L),{key:1,slot:"icon-only",icon:s(r).isPlaying?s(Z):s(ee)},null,8,["icon"]))]})),_:1}),k(s(T),{fill:"clear",onClick:s(r).playNext},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(te)},null,8,["icon"])]})),_:1},8,["onClick"]),k(s(T),{fill:"clear",onClick:E},{default:O((function(){return[k(s(L),{slot:"icon-only",icon:s(Se),color:"danger"},null,8,["icon"])]})),_:1})]})),_:1})]})),_:1})]})),_:1}),q("div",ut,[q("audio",{controls:"",autoplay:s(r).audioPlayerSetting.autoPlay,ref_key:"audioPlayerRef",ref:i,id:"audioPlayerRef",src:null===(e=s(r).audioFiles)||void 0===e?void 0:e.audio_url,type:"audio/".concat(null===(n=s(r).audioFiles)||void 0===n?void 0:n.format),onPause:t[0]||(t[0]=function(){var e;return s(r).playbackPaused&&(e=s(r)).playbackPaused.apply(e,arguments)}),onPlaying:t[1]||(t[1]=function(){var e;return s(r).playbackPlaying&&(e=s(r)).playbackPlaying.apply(e,arguments)}),onEnded:h,onCanplaythrough:b,onTimeupdate:m,onLoadeddata:w,onProgress:d,onLoadedmetadata:j,onSeek:x},null,40,lt)])]})),_:1}),k(it,{trigger:"audio-modal","is-playing":s(r).isPlaying,"verse-timing":s(r).verseTiming,"selected-reciter":s(r).selectedReciter,"audio-files":s(r).audioFiles,"chapter-name":s(r).chapterName,"loop-audio":s(r).loopAudio,"media-volume":s(r).mediaVolume,"map-recitions":s(r).mapRecitions,"progress-timer":s(r).progressTimer,"onUpdate:changeVolume":R,"onUpdate:seek":x,"onUpdate:download":s(r).downloadAudioFile,"onUpdate:playChapter":N,"onUpdate:playNext":I,"onUpdate:playPrev":t[2]||(t[2]=function(e){return s(r).playPrevious()}),"onUpdate:playAudio":c,"onUpdate:loopAudio":t[3]||(t[3]=function(e){return s(r).loopAudio=e}),"onUpdate:selectedReciter":F},null,8,["is-playing","verse-timing","selected-reciter","audio-files","chapter-name","loop-audio","media-volume","map-recitions","progress-timer","onUpdate:download"])]})),_:1})):V("",!0)]})),_:1})}}}),st=(e("A",Ne(ct,[["__scopeId","data-v-786fc39e"]])),{key:0});e("b",b({__name:"ChapterInfoModalComponent",props:{pageEl:{},trigger:{},chapterInfo:{}},setup:function(e){var t=f(),n=Fe().getChapter,r=f(""),o=function(){t.value.$el.dismiss()},i=e;return we((function(){if(i.chapterInfo){var e=n(i.chapterInfo.chapter_id);e&&(r.value=null==e?void 0:e.nameSimple)}})),function(e,n){return _(),S(s(ge),{ref_key:"modal",ref:t,trigger:e.trigger,"can-dismiss":!0},{default:O((function(){return[k(s(M),null,{default:O((function(){return[k(s(D),null,{default:O((function(){return[k(s(Ce),null,{default:O((function(){return[R(N(r.value),1)]})),_:1}),k(s(F),{slot:"start"},{default:O((function(){return[k(s(T),{onClick:o,color:"medium"},{default:O((function(){return[k(s(L),{icon:s(B)},null,8,["icon"])]})),_:1})]})),_:1})]})),_:1})]})),_:1}),k(s(he),{class:"ion-padding"},{default:O((function(){var t;return[e.chapterInfo?(_(),w("div",st,[k(s(Y),{innerHTML:null===(t=e.chapterInfo)||void 0===t?void 0:t.text},null,8,["innerHTML"])])):V("",!0)]})),_:1})]})),_:1},8,["trigger"])}}}))}}}))}();