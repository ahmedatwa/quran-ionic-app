!function(){function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(){"use strict";/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */e=function(){return n};var r,n={},o=Object.prototype,i=o.hasOwnProperty,a=Object.defineProperty||function(t,e,r){t[e]=r.value},u="function"==typeof Symbol?Symbol:{},c=u.iterator||"@@iterator",l=u.asyncIterator||"@@asyncIterator",f=u.toStringTag||"@@toStringTag";function s(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{s({},"")}catch(r){s=function(t,e,r){return t[e]=r}}function h(t,e,r,n){var o=e&&e.prototype instanceof w?e:w,i=Object.create(o.prototype),u=new P(n||[]);return a(i,"_invoke",{value:S(t,r,u)}),i}function p(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}n.wrap=h;var v="suspendedStart",d="suspendedYield",y="executing",m="completed",g={};function w(){}function b(){}function x(){}var _={};s(_,c,(function(){return this}));var k=Object.getPrototypeOf,L=k&&k(k(T([])));L&&L!==o&&i.call(L,c)&&(_=L);var E=x.prototype=w.prototype=Object.create(_);function j(t){["next","throw","return"].forEach((function(e){s(t,e,(function(t){return this._invoke(e,t)}))}))}function O(e,r){function n(o,a,u,c){var l=p(e[o],e,a);if("throw"!==l.type){var f=l.arg,s=f.value;return s&&"object"==t(s)&&i.call(s,"__await")?r.resolve(s.__await).then((function(t){n("next",t,u,c)}),(function(t){n("throw",t,u,c)})):r.resolve(s).then((function(t){f.value=t,u(f)}),(function(t){return n("throw",t,u,c)}))}c(l.arg)}var o;a(this,"_invoke",{value:function(t,e){function i(){return new r((function(r,o){n(t,e,r,o)}))}return o=o?o.then(i,i):i()}})}function S(t,e,n){var o=v;return function(i,a){if(o===y)throw Error("Generator is already running");if(o===m){if("throw"===i)throw a;return{value:r,done:!0}}for(n.method=i,n.arg=a;;){var u=n.delegate;if(u){var c=N(u,n);if(c){if(c===g)continue;return c}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===v)throw o=m,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=y;var l=p(t,e,n);if("normal"===l.type){if(o=n.done?m:d,l.arg===g)continue;return{value:l.arg,done:n.done}}"throw"===l.type&&(o=m,n.method="throw",n.arg=l.arg)}}}function N(t,e){var n=e.method,o=t.iterator[n];if(o===r)return e.delegate=null,"throw"===n&&t.iterator.return&&(e.method="return",e.arg=r,N(t,e),"throw"===e.method)||"return"!==n&&(e.method="throw",e.arg=new TypeError("The iterator does not provide a '"+n+"' method")),g;var i=p(o,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,g;var a=i.arg;return a?a.done?(e[t.resultName]=a.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,g):a:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,g)}function G(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function I(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function P(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(G,this),this.reset(!0)}function T(e){if(e||""===e){var n=e[c];if(n)return n.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,a=function t(){for(;++o<e.length;)if(i.call(e,o))return t.value=e[o],t.done=!1,t;return t.value=r,t.done=!0,t};return a.next=a}}throw new TypeError(t(e)+" is not iterable")}return b.prototype=x,a(E,"constructor",{value:x,configurable:!0}),a(x,"constructor",{value:b,configurable:!0}),b.displayName=s(x,f,"GeneratorFunction"),n.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===b||"GeneratorFunction"===(e.displayName||e.name))},n.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,x):(t.__proto__=x,s(t,f,"GeneratorFunction")),t.prototype=Object.create(E),t},n.awrap=function(t){return{__await:t}},j(O.prototype),s(O.prototype,l,(function(){return this})),n.AsyncIterator=O,n.async=function(t,e,r,o,i){void 0===i&&(i=Promise);var a=new O(h(t,e,r,o),i);return n.isGeneratorFunction(e)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},j(E),s(E,f,"Generator"),s(E,c,(function(){return this})),s(E,"toString",(function(){return"[object Generator]"})),n.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},n.values=T,P.prototype={constructor:P,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(I),!t)for(var e in this)"t"===e.charAt(0)&&i.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(n,o){return u.type="throw",u.arg=t,e.next=n,o&&(e.method="next",e.arg=r),!!o}for(var o=this.tryEntries.length-1;o>=0;--o){var a=this.tryEntries[o],u=a.completion;if("root"===a.tryLoc)return n("end");if(a.tryLoc<=this.prev){var c=i.call(a,"catchLoc"),l=i.call(a,"finallyLoc");if(c&&l){if(this.prev<a.catchLoc)return n(a.catchLoc,!0);if(this.prev<a.finallyLoc)return n(a.finallyLoc)}else if(c){if(this.prev<a.catchLoc)return n(a.catchLoc,!0)}else{if(!l)throw Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return n(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&i.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=t,a.arg=e,o?(this.method="next",this.next=o.finallyLoc,g):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),g},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),I(r),g}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;I(r)}return o}}throw Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:T(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),g}},n}function r(t,e,r,n,o,i,a){try{var u=t[i](a),c=u.value}catch(t){return void r(t)}u.done?e(c):Promise.resolve(c).then(n,o)}function n(t){return function(){var e=this,n=arguments;return new Promise((function(o,i){var a=t.apply(e,n);function u(t){r(a,o,i,u,c,"next",t)}function c(t){r(a,o,i,u,c,"throw",t)}u(void 0)}))}}System.register(["./index-legacy-YeDwoDUQ.js","./HeaderComponent-legacy-Cf1mreTH.js","./string-legacy-lts3lsqp.js","./_plugin-vue_export-helper-legacy-Cqk5Dwm6.js"],(function(t,r){"use strict";var o,i,a,u,c,l,f,s,h,p,v,d,y,m,g,w,b,x,_,k,L,E,j,O,S,N,G,I,P,T,C,F,H,A,B,z,D,Y;return{setters:[function(t){o=t.d,i=t.u,a=t.z,u=t.A,c=t.B,l=t.C,f=t.c,s=t.w,h=t.a,p=t.o,v=t.b,d=t.D,y=t.E,m=t.G,g=t.I,w=t.H,b=t.J,x=t.k,_=t.t,k=t.i,L=t.f,E=t.r,j=t.K,O=t.g,S=t.v,N=t.L,G=t.j,I=t.s,P=t.l,T=t.M,C=t.N,F=t.O,H=t.F,A=t.m,B=t.n},function(t){z=t.H},function(t){D=t.t},function(t){Y=t._}],execute:function(){var r=document.createElement("style");r.textContent="ion-item[data-v-47a4a454]{--transition: none}.small-font[data-v-47a4a454]{font-size:x-small}ion-accordion[data-v-47a4a454]{margin:0 auto}.rtl[data-v-47a4a454]{direction:rtl}.pt-24[data-v-47a4a454]{padding-top:24px}\n",document.head.appendChild(r);var J=o({__name:"BookmarkHomeTab",setup:function(t){var r=i().getLine,o=a([]),Y=u("__bookmarksDB");c(n(e().mark((function t(){return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Y.storageLength();case 2:t.sent&&J();case 4:case"end":return t.stop()}}),t)})))),l((function(){Y.bookmarkedItems.value&&Y.bookmarkedItems.value.forEach((function(t){var e;null===(e=o.value)||void 0===e||e.push(t)}))}));var J=function(){var t;null===(t=Y.storage.value)||void 0===t||t.forEach((function(t,e){o.value.find((function(t){return t.key.includes(e)}))||o.value.push({key:e,value:t})}))},K=function(){var t=n(e().mark((function t(r){return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return o.value=o.value.filter((function(t){return t.key!==r})),t.next=3,Y.removeItem(r);case 3:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}();return function(t,e){return p(),f(h(B),null,{default:s((function(){return[v(z,{title:h(r)("bookmark.title"),icon:h(d),"is-loading":!1,search:!1},null,8,["title","icon"]),v(h(A),{fullscreen:!0,class:"ion-padding"},{default:s((function(){return[v(h(y),{slot:"fixed",onIonRefresh:e[0]||(e[0]=function(t){return e=t,void setTimeout((function(){var t;J(),null===(t=e.target)||void 0===t||t.complete()}),2e3);var e})},{default:s((function(){return[v(h(m))]})),_:1}),v(h(g),{inset:!0},{default:s((function(){return[o.value.length?k("",!0):(p(),f(h(w),{key:0},{default:s((function(){return[v(h(b),{class:"ion-text-center"},{default:s((function(){return[x(_(h(r)("bookmark.emptyContent")),1)]})),_:1})]})),_:1})),(p(!0),L(H,null,E(o.value,(function(t){return p(),f(h(j),{key:t.key},{default:s((function(){return[v(h(O),{button:"",detail:!0,"router-link":t.key},{default:s((function(){return[v(h(S),{slot:"start",icon:h(N),color:"danger"},null,8,["icon"]),v(h(G),null,{default:s((function(){return[I("h3",null,_(t.value.chapterName),1),v(h(P),{class:"rtl"},{default:s((function(){return[x(_(h(D)(t.value.verseText,50)),1)]})),_:2},1024)]})),_:2},1024),v(h(P),{slot:"end",class:"pt-24"},{default:s((function(){return[x(_(t.value.verseNumber),1)]})),_:2},1024)]})),_:2},1032,["router-link"]),v(h(T),null,{default:s((function(){return[v(h(C),{color:"danger",onClick:function(e){return K(t.key)}},{default:s((function(){return[v(h(S),{slot:"icon-only",icon:h(F)},null,8,["icon"])]})),_:2},1032,["onClick"])]})),_:2},1024)]})),_:2},1024)})),128))]})),_:1})]})),_:1})]})),_:1})}}});t("default",Y(J,[["__scopeId","data-v-47a4a454"]]))}}}))}();