!function(){function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function n(t,n,r){return(n=function(t){var n=function(t,n){if("object"!=e(t)||!t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var a=r.call(t,n||"default");if("object"!=e(a))return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(t)}(t,"string");return"symbol"==e(n)?n:n+""}(n))in t?Object.defineProperty(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r,t}function r(){"use strict";/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */r=function(){return n};var t,n={},a=Object.prototype,i=a.hasOwnProperty,o=Object.defineProperty||function(e,t,n){e[t]=n.value},u="function"==typeof Symbol?Symbol:{},l=u.iterator||"@@iterator",c=u.asyncIterator||"@@asyncIterator",s=u.toStringTag||"@@toStringTag";function f(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{f({},"")}catch(t){f=function(e,t,n){return e[t]=n}}function d(e,t,n,r){var a=t&&t.prototype instanceof b?t:b,i=Object.create(a.prototype),u=new C(r||[]);return o(i,"_invoke",{value:E(e,n,u)}),i}function p(e,t,n){try{return{type:"normal",arg:e.call(t,n)}}catch(e){return{type:"throw",arg:e}}}n.wrap=d;var v="suspendedStart",h="suspendedYield",m="executing",g="completed",y={};function b(){}function _(){}function w(){}var x={};f(x,l,(function(){return this}));var k=Object.getPrototypeOf,j=k&&k(k(I([])));j&&j!==a&&i.call(j,l)&&(x=j);var L=w.prototype=b.prototype=Object.create(x);function P(e){["next","throw","return"].forEach((function(t){f(e,t,(function(e){return this._invoke(t,e)}))}))}function O(t,n){function r(a,o,u,l){var c=p(t[a],t,o);if("throw"!==c.type){var s=c.arg,f=s.value;return f&&"object"==e(f)&&i.call(f,"__await")?n.resolve(f.__await).then((function(e){r("next",e,u,l)}),(function(e){r("throw",e,u,l)})):n.resolve(f).then((function(e){s.value=e,u(s)}),(function(e){return r("throw",e,u,l)}))}l(c.arg)}var a;o(this,"_invoke",{value:function(e,t){function i(){return new n((function(n,a){r(e,t,n,a)}))}return a=a?a.then(i,i):i()}})}function E(e,n,r){var a=v;return function(i,o){if(a===m)throw Error("Generator is already running");if(a===g){if("throw"===i)throw o;return{value:t,done:!0}}for(r.method=i,r.arg=o;;){var u=r.delegate;if(u){var l=S(u,r);if(l){if(l===y)continue;return l}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(a===v)throw a=g,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);a=m;var c=p(e,n,r);if("normal"===c.type){if(a=r.done?g:h,c.arg===y)continue;return{value:c.arg,done:r.done}}"throw"===c.type&&(a=g,r.method="throw",r.arg=c.arg)}}}function S(e,n){var r=n.method,a=e.iterator[r];if(a===t)return n.delegate=null,"throw"===r&&e.iterator.return&&(n.method="return",n.arg=t,S(e,n),"throw"===n.method)||"return"!==r&&(n.method="throw",n.arg=new TypeError("The iterator does not provide a '"+r+"' method")),y;var i=p(a,e.iterator,n.arg);if("throw"===i.type)return n.method="throw",n.arg=i.arg,n.delegate=null,y;var o=i.arg;return o?o.done?(n[e.resultName]=o.value,n.next=e.nextLoc,"return"!==n.method&&(n.method="next",n.arg=t),n.delegate=null,y):o:(n.method="throw",n.arg=new TypeError("iterator result is not an object"),n.delegate=null,y)}function T(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function z(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function C(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(T,this),this.reset(!0)}function I(n){if(n||""===n){var r=n[l];if(r)return r.call(n);if("function"==typeof n.next)return n;if(!isNaN(n.length)){var a=-1,o=function e(){for(;++a<n.length;)if(i.call(n,a))return e.value=n[a],e.done=!1,e;return e.value=t,e.done=!0,e};return o.next=o}}throw new TypeError(e(n)+" is not iterable")}return _.prototype=w,o(L,"constructor",{value:w,configurable:!0}),o(w,"constructor",{value:_,configurable:!0}),_.displayName=f(w,s,"GeneratorFunction"),n.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return!!t&&(t===_||"GeneratorFunction"===(t.displayName||t.name))},n.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,w):(e.__proto__=w,f(e,s,"GeneratorFunction")),e.prototype=Object.create(L),e},n.awrap=function(e){return{__await:e}},P(O.prototype),f(O.prototype,c,(function(){return this})),n.AsyncIterator=O,n.async=function(e,t,r,a,i){void 0===i&&(i=Promise);var o=new O(d(e,t,r,a),i);return n.isGeneratorFunction(t)?o:o.next().then((function(e){return e.done?e.value:o.next()}))},P(L),f(L,s,"Generator"),f(L,l,(function(){return this})),f(L,"toString",(function(){return"[object Generator]"})),n.keys=function(e){var t=Object(e),n=[];for(var r in t)n.push(r);return n.reverse(),function e(){for(;n.length;){var r=n.pop();if(r in t)return e.value=r,e.done=!1,e}return e.done=!0,e}},n.values=I,C.prototype={constructor:C,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(z),!e)for(var n in this)"t"===n.charAt(0)&&i.call(this,n)&&!isNaN(+n.slice(1))&&(this[n]=t)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var n=this;function r(r,a){return u.type="throw",u.arg=e,n.next=r,a&&(n.method="next",n.arg=t),!!a}for(var a=this.tryEntries.length-1;a>=0;--a){var o=this.tryEntries[a],u=o.completion;if("root"===o.tryLoc)return r("end");if(o.tryLoc<=this.prev){var l=i.call(o,"catchLoc"),c=i.call(o,"finallyLoc");if(l&&c){if(this.prev<o.catchLoc)return r(o.catchLoc,!0);if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else if(l){if(this.prev<o.catchLoc)return r(o.catchLoc,!0)}else{if(!c)throw Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return r(o.finallyLoc)}}}},abrupt:function(e,t){for(var n=this.tryEntries.length-1;n>=0;--n){var r=this.tryEntries[n];if(r.tryLoc<=this.prev&&i.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var a=r;break}}a&&("break"===e||"continue"===e)&&a.tryLoc<=t&&t<=a.finallyLoc&&(a=null);var o=a?a.completion:{};return o.type=e,o.arg=t,a?(this.method="next",this.next=a.finallyLoc,y):this.complete(o)},complete:function(e,t){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),y},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),z(n),y}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var r=n.completion;if("throw"===r.type){var a=r.arg;z(n)}return a}}throw Error("illegal catch attempt")},delegateYield:function(e,n,r){return this.delegate={iterator:I(e),resultName:n,nextLoc:r},"next"===this.method&&(this.arg=t),y}},n}function a(e,t,n,r,a,i,o){try{var u=e[i](o),l=u.value}catch(e){return void n(e)}u.done?t(l):Promise.resolve(l).then(r,a)}function i(e){return function(){var t=this,n=arguments;return new Promise((function(r,i){var o=e.apply(t,n);function u(e){a(o,r,i,u,l,"next",e)}function l(e){a(o,r,i,u,l,"throw",e)}u(void 0)}))}}function o(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,a,i,o,u=[],l=!0,c=!1;try{if(i=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;l=!1}else for(;!(l=(r=i.call(n)).done)&&(u.push(r.value),u.length!==t);l=!0);}catch(e){c=!0,a=e}finally{try{if(!l&&null!=n.return&&(o=n.return(),Object(o)!==o))return}finally{if(c)throw a}}return u}}(e,t)||function(e,t){if(e){if("string"==typeof e)return u(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?u(e,t):void 0}}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function u(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}System.register(["./index-legacy-YeDwoDUQ.js","./ChapterInfoModalComponent.vue_vue_type_script_setup_true_lang-legacy-OJd3zeJJ.js","./ChapterStore-legacy-kjNYS6C_.js","./ModalComponent.vue_vue_type_script_setup_true_lang-legacy-DVmbhuI3.js","./string-legacy-lts3lsqp.js","./_plugin-vue_export-helper-legacy-Cqk5Dwm6.js"],(function(e,a){"use strict";var u,l,c,s,f,d,p,v,h,m,g,y,b,_,w,x,k,j,L,P,O,E,S,T,z,C,I,N,A,V,R,B,U,$,q,D,F,G,M,H,K,Y,W,J,Q,X,Z,ee,te,ne,re,ae,ie,oe,ue,le,ce,se,fe,de,pe,ve,he,me,ge,ye;return{setters:[function(e){u=e.d,l=e.u,c=e.a3,s=e.A,f=e.z,d=e.P,p=e.C,v=e.a5,h=e.a6,m=e.a7,g=e.o,y=e.f,b=e.b,_=e.a,w=e.w,x=e.H,k=e.s,j=e.a8,L=e.v,P=e.a9,O=e.aa,E=e.j,S=e.k,T=e.t,z=e.ab,C=e.ac,I=e.ad,N=e.ae,A=e.af,V=e.F,R=e.r,B=e.c,U=e.ag,$=e.ah,q=e.ai,D=e.q,F=e.aj,G=e.ak,M=e.l,H=e.g,K=e.an,Y=e.ao,W=e.m,J=e.ap,Q=e.J,X=e.aq,Z=e.ar,ee=e.i,te=e.as,ne=e.$,re=e.at,ae=e.au,ie=e.a2,oe=e.n,ue=e.av},function(e){le=e._,ce=e.a,se=e.v,fe=e.s,de=e.b,pe=e.A},function(e){ve=e.u,he=e.a},function(e){me=e.u,ge=e.a},function(e){ye=e.p},null],execute:function(){var a=["id"],be={key:0,class:"end"},_e=["innerHTML"],we=u({__name:"TranslationsViewComponent",props:{id:{},isTranslationsView:{type:Boolean},isPlaying:{type:Boolean},isLoading:{type:Boolean},chapterName:{},isBismillah:{},verses:{},audioExperience:{},pagination:{},verseTiming:{},styles:{}},emits:["update:getVerses","update:playAudio","update:modalValue"],setup:function(e,u){var J=u.emit,Q=l().getLine,X=c().params,Z=s("__bookmarksDB"),ee=Z.setStorage,te=Z.bookmarkedItems,ne=ve().getChapterName,re=f(),ae=f(),ie=d((function(){return Number(X.chapterId)})),oe=f(),ue=e,de=J,pe=function(e){var t=o(e,1)[0],n=t.isIntersecting,r=t.target,a=t.intersectionRatio;if(n&&a>=.8){var i=Number(r.getAttribute("data-verse-number"));oe.value=i}};p(i(r().mark((function e(){var t;return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:ue.audioExperience.autoScroll&&(oe.value=Number(null===(t=ue.verseTiming)||void 0===t?void 0:t.verseNumber));case 1:case"end":return e.stop()}}),e)})))),v(oe,(function(e){e&&fe("#verse-col-".concat(e),ae.value.$el,300)}));var he=function(){var e=i(r().mark((function e(t){var n;return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:te.value.push({key:"/page/".concat(t.page_number),value:{pageNumber:t.page_number,verseNumber:t.verse_number,verseText:t.text_uthmani,chapterName:null===(n=ne(t.chapter_id))||void 0===n?void 0:n.nameSimple}}),te.value.forEach((function(e){var t=e.key,n=e.value;ee(t,n)}));case 2:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),me=function(e){var t;null!==(t=ue.pagination)&&void 0!==t&&t.next_page?(de("update:getVerses",{key:ue.id,nextPage:ue.pagination.next_page}),setTimeout((function(){return e.target.complete()}),500)):e.target.complete()},ge=function(e){if(ue.verseTiming)return ue.verseTiming.wordLocation===e.location};return function(e,r){return h((g(),y("div",{class:"ion-page",id:"translations-".concat(e.id,"-").concat(ie.value)},[b(le,{"route-back-label":_(Q)("tabs.chapters"),"is-loading":e.isLoading},null,8,["route-back-label","is-loading"]),b(_(W),{class:"quran-translation-content-wapper",fullscreen:!0,scrollY:!0,ref_key:"contentRef",ref:re},{default:w((function(){return[b(_(x),{class:"ion-padding card-wrapper",ref_key:"cardRef",ref:ae},{default:w((function(){return[k("div",null,[b(_(j),{onClick:r[0]||(r[0]=function(t){return e.$emit("update:playAudio",{audioID:ie.value})}),color:"primary",class:"ion-float-right"},{default:w((function(){return[b(_(L),{color:"primary",icon:e.isPlaying?_(P):_(O)},null,8,["icon"]),b(_(E),null,{default:w((function(){return[S(T(_(Q)("quranReader.buttonPlay")),1)]})),_:1})]})),_:1}),b(_(z),{onClick:r[1]||(r[1]=function(t){return e.$emit("update:modalValue",!0)}),fill:"clear"},{default:w((function(){return[b(_(L),{icon:_(C),slot:"icon-only"},null,8,["icon"])]})),_:1})]),b(_(I),{class:"ion-text-center"},{default:w((function(){return[b(_(N),null,{default:w((function(){return[S(T(e.isBismillah),1)]})),_:1}),b(_(A),null,{default:w((function(){return[S(T(e.chapterName),1)]})),_:1})]})),_:1}),(g(!0),y(V,null,R(e.verses,(function(a){return h((g(),B(_(H),{key:a.verse_number,"data-verse-number":a.verse_number,"data-hizb-number":a.hizb_number,"data-juz-number":a.juz_number,id:"verse-col-".concat(a.verse_number)},{default:w((function(){return[b(_(U),null,{default:w((function(){return[b(_($),{class:"ion-align-items-start"},{default:w((function(){return[b(_(q),{size:"11",class:"translations-view-col"},{default:w((function(){return[(g(!0),y(V,null,R(a.words,(function(t){return g(),B(_(E),{key:t.id},{default:w((function(){return[b(_(D),{color:ge(t)?"primary":""},{default:w((function(){return["end"===t.char_type_name?(g(),y("span",be," ("+T(t.text_uthmani)+")",1)):(g(),y("h3",{key:1,style:F(e.styles)},T(t.text_uthmani),5))]})),_:2},1032,["color"])]})),_:2},1024)})),128))]})),_:2},1024),b(_(q),{size:"1",class:"action-sheet"},{default:w((function(){return[b(_(L),{icon:_(G),color:"primary",id:"open-action-sheet".concat(a.verse_number)},null,8,["icon","id"]),b(ce,{verse:a,"trigger-prop":"open-action-sheet".concat(a.verse_number),"onUpdate:bookmarked":he,"onUpdate:playVerseAudio":r[2]||(r[2]=function(r){return e.$emit("update:playAudio",function(e){for(var r=1;r<arguments.length;r++){var a=null!=arguments[r]?arguments[r]:{};r%2?t(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):t(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}({},r))})},null,8,["verse","trigger-prop"])]})),_:2},1024),b(_(q),{size:"12",class:"ion-text-left"},{default:w((function(){return[(g(!0),y(V,null,R(a.translations,(function(e){return g(),B(_(M),{key:e.id,class:"translation"},{default:w((function(){return[k("span",{innerHTML:e.text},null,8,_e)]})),_:2},1024)})),128))]})),_:2},1024)]})),_:2},1024)]})),_:2},1024)]})),_:2},1032,["data-verse-number","data-hizb-number","data-juz-number","id"])),[[_(se),[pe,{root:re.value,immediate:!1}]]])})),128))]})),_:1},512),b(_(K),{onIonInfinite:me},{default:w((function(){return[b(_(Y),{"loading-text":"Please wait...","loading-spinner":"bubbles"})]})),_:1})]})),_:1},512)],8,a)),[[m,e.isTranslationsView]])}}}),xe=["id"],ke=["id"],je=["id","data-hizb-number","data-chapter-id","data-juz-number","data-page-number","data-verse-number"],Le=["data-word-position","data-hizb-number","data-juz-number","data-chapter-id","data-page-number"],Pe={key:0,class:"end"},Oe=u({__name:"ReadingViewComponent",props:{id:{},isReadingView:{type:Boolean},isPlaying:{type:Boolean},verseTiming:{},verses:{},isLoading:{type:Boolean},pagination:{},styles:{}},emits:["update:getVerses","update:playAudio","update:surahInfo"],setup:function(e,t){var n=t.emit,r=c().params,a=ve().getChapterNameByFirstVerse,i=l().getLine,o=d((function(){return Number(r.chapterId)})),u=e,s=n,f=d((function(){if(u.verses)return u.verses.reduce((function(e,t){return(e[t.page_number]=e[t.page_number]||[]).push(t),e}),{})})),p=function(e,t){if(u.isReadingView&&u.verseTiming)return u.verseTiming.wordLocation===e&&t===u.verseTiming.verseKey},v=function(e){var t;null!==(t=u.pagination)&&void 0!==t&&t.next_page?(s("update:getVerses",{key:u.id,nextPage:u.pagination.next_page}),setTimeout((function(){return e.target.complete()}),500)):e.target.complete()};return function(e,t){return e.isReadingView?(g(),y("div",{key:0,class:"ion-page",id:"".concat(e.id,"-").concat(o.value)},[b(le,{"is-loading":e.isLoading,"route-back-label":_(i)("tabs.chapters")},null,8,["is-loading","route-back-label"]),b(_(W),null,{default:w((function(){return[(g(!0),y(V,null,R(f.value,(function(t,n){return g(),B(_(x),{class:"ion-padding",key:n,id:"row-page-".concat(n)},{default:w((function(){return[k("div",null,[b(_(j),{onClick:function(n){return e.$emit("update:playAudio",{audioID:t[0].chapter_id})},color:"primary",class:"ion-float-right"},{default:w((function(){return[b(_(L),{icon:e.isPlaying?_(P):_(O)},null,8,["icon"]),b(_(E),null,{default:w((function(){return[S(T(_(i)("quranReader.buttonPlay")),1)]})),_:1})]})),_:2},1032,["onClick"]),b(_(z),{fill:"clear",onClick:function(n){return e.$emit("update:surahInfo",t[0].chapter_id)}},{default:w((function(){return[b(_(L),{icon:_(J),slot:"icon-only"},null,8,["icon"])]})),_:2},1032,["onClick"])]),b(_(I),{class:"ion-text-center"},{default:w((function(){return[b(_(N),null,{default:w((function(){var e;return[S(T(null!==(e=_(a)(t[0]))&&void 0!==e&&e.bismillahPre?_(i)("quranReader.textBismillah"):""),1)]})),_:2},1024),b(_(A),null,{default:w((function(){var e;return[S(T(null===(e=_(a)(t[0]))||void 0===e?void 0:e.nameArabic),1)]})),_:2},1024)]})),_:2},1024),b(_(Q),{class:"ion-padding quran-reader-content-wrapper"},{default:w((function(){return[k("div",{class:"verse-col",id:"page-".concat(n),size:"12"},[(g(!0),y(V,null,R(t,(function(t){return g(),y("div",{class:"word-wrapper",key:t.id,id:"line-".concat(t.verse_number),"data-hizb-number":t.hizb_number,"data-chapter-id":t.chapter_id,"data-juz-number":t.juz_number,"data-page-number":n,"data-verse-number":t.verse_number},[(g(!0),y(V,null,R(t.words,(function(r){return g(),y("span",{key:r.id,"data-word-position":r.position,class:"","data-hizb-number":t.hizb_number,"data-juz-number":t.juz_number,"data-chapter-id":t.chapter_id,"data-page-number":n},[k("span",{class:X([p(r.location,r.verse_key)?"text-blue":"","word"])},["end"===r.char_type_name?(g(),y("div",Pe,"("+T(r.text_uthmani)+") ",1)):(g(),y("h3",{key:1,style:F(e.styles)},T(r.text_uthmani),5))],2)],8,Le)})),128))],8,je)})),128))],8,ke),b(_(q),{size:"12"},{default:w((function(){return[b(_(Z),null,{default:w((function(){return[b(_(E),{class:"m-auto"},{default:w((function(){return[S(T(_(i)("quranReader.textPage"))+" "+T(n),1)]})),_:2},1024)]})),_:2},1024)]})),_:2},1024)]})),_:2},1024)]})),_:2},1032,["id"])})),128)),b(_(K),{onIonInfinite:v},{default:w((function(){return[b(_(Y),{"loading-text":"Please wait...","loading-spinner":"bubbles"})]})),_:1})]})),_:1})],8,xe)):ee("",!0)}}}),Ee={class:"footer"};e("default",u({__name:"Chapter",setup:function(e){var t=f("translations"),n=ve(),a=me(),o=l().getLine,u=he(),s=f(),v=f(),h=ge(),m=f(),y=f(!1),x=d((function(){var e;return null===(e=n.selectedChapter)||void 0===e?void 0:e.pagination})),j=f(null),L=d((function(){var e;return null===(e=n.selectedChapterVerses)||void 0===e?void 0:e.sort((function(e,t){return e.verse_number-t.verse_number}))})),P=function(e){t.value=e.detail.value},O=c().params.chapterId;p(i(r().mark((function e(){var t,a;return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!O){e.next=10;break}if(n.selectedChapter=null,!(t=n.chaptersList.find((function(e){return e.id===Number(O)})))){e.next=10;break}if(null!==(a=t.verses)&&void 0!==a&&a.length){e.next=9;break}return e.next=7,n.getVerses(t.id,!0);case 7:e.next=10;break;case 9:n.selectedChapter=t;case 10:case"end":return e.stop()}}),e)}))));var C=function(){var e=i(r().mark((function e(t){return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,a.getAudio({audioID:t.audioID,verseKey:t.verseKey});case 2:y.value=!0;case 3:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),I=function(){var e=i(r().mark((function e(t){var a;return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!t.nextPage){e.next=4;break}if(!n.selectedChapter){e.next=4;break}return e.next=4,n.getVerses(n.selectedChapter.id,!0,null===(a=x.value)||void 0===a?void 0:a.next_page);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),N=d((function(){return{fontFamily:"var(--font-family-".concat(h.styles.value.fontFamily,")"),fontSize:"var(--font-size-".concat(h.styles.value.fontSize,")"),fontWeight:"var(--font-weight-".concat(h.styles.value.fontWeight,")")}})),A=function(){var e=i(r().mark((function e(){var t,n,a;return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,ue.create({header:ye(String(null===(t=u.selectedTranslation)||void 0===t?void 0:t.language_name)),message:null===(n=u.selectedTranslation)||void 0===n?void 0:n.author_name,id:"translation-alert",buttons:["Ok"]});case 2:return a=e.sent,e.next=5,a.present();case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();te((function(){return v.value=s.value.$el}));var V=function(){var e=i(r().mark((function e(t){return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n.getchapterInfo(t).then((function(e){j.value=e.data.chapter_info}));case 2:m.value.$el.click();case 3:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return function(e,r){return g(),B(_(oe),{"data-chapter-id":_(O),ref_key:"pageRef",ref:s},{default:w((function(){return[b(_(ie),null,{default:w((function(){return[b(_(ne),null,{default:w((function(){return[b(_(re),{value:t.value,onIonChange:P},{default:w((function(){return[b(_(ae),{value:"translations"},{default:w((function(){return[b(_(E),null,{default:w((function(){return[S(T(_(o)("tabs.translations")),1)]})),_:1})]})),_:1}),b(_(ae),{value:"reading"},{default:w((function(){return[b(_(E),null,{default:w((function(){return[S(T(_(o)("tabs.reading")),1)]})),_:1})]})),_:1})]})),_:1},8,["value"])]})),_:1})]})),_:1}),b(_(W),null,{default:w((function(){return[b(we,{id:"translations-chapters","is-loading":_(n).isLoading.verses,"is-playing":_(a).isPlaying,"is-translations-view":"translations"===t.value,"onUpdate:playAudio":C,"is-bismillah":_(n).selectedChapterBismillah,styles:N.value,verses:L.value,"chapter-name":_(n).selectedChapterName.nameArabic,"verse-timing":_(a).verseTiming,"onUpdate:getVerses":I,pagination:x.value,"onUpdate:modalValue":A,"audio-experience":_(a).audioPlayerSetting},null,8,["is-loading","is-playing","is-translations-view","is-bismillah","styles","verses","chapter-name","verse-timing","pagination","audio-experience"]),b(Oe,{id:"reading-chapters","is-reading-view":"reading"===t.value,"is-playing":_(a).isPlaying,verses:L.value,"is-loading":_(n).isLoading.verses,styles:N.value,"verse-timing":_(a).verseTiming,"onUpdate:getVerses":I,"onUpdate:surahInfo":V,pagination:x.value,"onUpdate:playAudio":C},null,8,["is-reading-view","is-playing","verses","is-loading","styles","verse-timing","pagination"]),k("div",null,[b(_(z),{ref_key:"chapterInfoModalRef",ref:m,id:"chapter-modal-info",class:"ion-hide"},null,512),b(de,{trigger:"chapter-modal-info","chapter-info":j.value,"page-el":v.value},null,8,["chapter-info","page-el"])])]})),_:1}),k("div",Ee,[b(pe,{"model-value":y.value,"onUpdate:modelValue":r[0]||(r[0]=function(e){return y.value=e})},null,8,["model-value"])])]})),_:1},8,["data-chapter-id"])}}}))}}}))}();
