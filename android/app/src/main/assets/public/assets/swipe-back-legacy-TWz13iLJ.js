System.register(["./index-legacy-YeDwoDUQ.js"],(function(t,e){"use strict";var n,r,i;return{setters:[function(t){n=t.b5,r=t.b6,i=t.b7}],execute:function(){
/*!
             * (C) Ionic http://ionicframework.com - MIT License
             */
t("createSwipeBackGesture",(function(t,e,u,a,o){var c=t.ownerDocument.defaultView,s=n(t),f=function(t){return s?-t.deltaX:t.deltaX};return r({el:t,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:function(r){return s=n(t),function(t){var e=t.startX;return s?e>=c.innerWidth-50:e<=50}(r)&&e()},onStart:u,onMove:function(t){var e=f(t)/c.innerWidth;a(e)},onEnd:function(t){var e=f(t),n=c.innerWidth,r=e/n,u=function(t){return s?-t.velocityX:t.velocityX}(t),a=u>=0&&(u>.2||e>n/2),d=(a?1-r:r)*n,v=0;if(d>5){var l=d/Math.abs(u);v=Math.min(l,540)}o(a,r<=0?.01:i(0,r,.9999),v)}})}))}}}));
