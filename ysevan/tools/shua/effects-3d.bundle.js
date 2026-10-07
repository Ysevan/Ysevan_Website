/*!
 * 刷刷 3D 点缀的发布产物：effects-3d.js（场景）+ three 按需子集 + GSAP 核心，
 * 由 scripts/build-3d-vendor.mjs 用 esbuild 打成一个经典脚本（IIFE），全局名 __shuaFx3d。
 * 勿手改：改场景请改 effects-3d.js 后重跑构建脚本。下文的 @license 注释为第三方原文。
 */
var __shuaFx3d=(()=>{var Ns=Object.defineProperty;var md=Object.getOwnPropertyDescriptor;var gd=Object.getOwnPropertyNames;var _d=Object.prototype.hasOwnProperty;var vd=(e,t)=>{for(var r in t)Ns(e,r,{get:t[r],enumerable:!0})},xd=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of gd(t))!_d.call(e,a)&&a!==r&&Ns(e,a,{get:()=>t[a],enumerable:!(i=md(t,a))||i.enumerable});return e};var Sd=e=>xd(Ns({},"__esModule",{value:!0}),e);var MS={};vd(MS,{createFx:()=>fd});/*!
 * 刷刷 3D 点缀用的 three.js 按需子集：three@0.186.0，共 17 个符号。
 * 由 scripts/build-3d-vendor.mjs 用 esbuild 打包，未改动 three 的代码；
 * 下文的 @license 注释为 three.js 原文。three.js 以 MIT 许可发布，全文如下：
 *
 * The MIT License
 *
 * Copyright © 2010-2026 three.js authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *//**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var yd=0,au=1,Md=2,Jn=1,Td=2,Ha=3,Oi=0,nr=1,Pr=2,ri=0,Xa=1,nu=2,su=3,ou=4,Ed=5,ca=100,bd=101,wd=102,Ad=103,Rd=104,Cd=200,Pd=201,Ld=202,Nd=203,hh=204,ch=205,Dd=206,Ud=207,Id=208,Od=209,Fd=210,zd=211,Bd=212,kd=213,Vd=214,_o=0,vo=1,xo=2,Ya=3,So=4,yo=5,Mo=6,To=7,dh=0,Hd=1,Gd=2,Vr=0,ph=1,fh=2,mh=3,gh=4,_h=5,vh=6,xh=7,Sh=300,Fi=301,_a=302,Ds=303,Us=304,cs=306,Eo=1e3,ti=1001,bo=1002,Yt=1003,Wd=1004,bn=1005,Qt=1006,Is=1007,Di=1008,Sr=1009,yh=1010,Mh=1011,Ka=1012,ul=1013,Hr=1014,Br=1015,Gr=1016,hl=1017,cl=1018,Ja=1020,Th=35902,Eh=35899,bh=1021,wh=1022,Lr=1023,ni=1026,Ui=1027,ds=1028,dl=1029,zi=1030,pl=1031,fl=1033,Zn=33776,$n=33777,Qn=33778,es=33779,wo=35840,Ao=35841,Ro=35842,Co=35843,Po=36196,Lo=37492,No=37496,Do=37488,Uo=37489,as=37490,Io=37491,Oo=37808,Fo=37809,zo=37810,Bo=37811,ko=37812,Vo=37813,Ho=37814,Go=37815,Wo=37816,Xo=37817,qo=37818,jo=37819,Yo=37820,Ko=37821,Jo=36492,Zo=36494,$o=36495,Qo=36283,el=36284,ns=36285,tl=36286,ss=2300,rl=2301,Os=2302,lu=2303,uu=2400,hu=2401,cu=2402,Xd=3200,du=0,qd=1,xi="",xr="srgb",os="srgb-linear",ls="linear",xt="srgb",Fs=7680,jd=519,Yd=512,Kd=513,Jd=514,ml=515,Zd=516,$d=517,gl=518,Qd=519,ep=35044,pu="300 es",kr=2e3,us=2001;function tp(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function rp(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function hs(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function ip(){let e=hs("canvas");return e.style.display="block",e}var fu={},va=null;function mu(...e){let t="THREE."+e.shift();va?va("log",t,...e):console.log(t,...e)}function Ah(e){let t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){let r=e[1];r&&r.isStackTrace?e[0]+=" "+r.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function Je(...e){e=Ah(e);let t="THREE."+e.shift();if(va)va("warn",t,...e);else{let r=e[0];r&&r.isStackTrace?console.warn(r.getError(t)):console.warn(t,...e)}}function Qe(...e){e=Ah(e);let t="THREE."+e.shift();if(va)va("error",t,...e);else{let r=e[0];r&&r.isStackTrace?console.error(r.getError(t)):console.error(t,...e)}}function ma(...e){let t=e.join(" ");t in fu||(fu[t]=!0,Je(...e))}function ap(e,t,r){return new Promise(function(i,a){function n(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:a();break;case e.TIMEOUT_EXPIRED:setTimeout(n,r);break;default:i()}}setTimeout(n,r)})}var np={[_o]:vo,[xo]:Mo,[So]:To,[Ya]:yo,[vo]:_o,[Mo]:xo,[To]:So,[yo]:Ya},ki=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){let r=this._listeners;return r===void 0?!1:r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){let r=this._listeners;if(r===void 0)return;let i=r[e];if(i!==void 0){let a=i.indexOf(t);a!==-1&&i.splice(a,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let r=t[e.type];if(r!==void 0){e.target=this;let i=r.slice(0);for(let a=0,n=i.length;a<n;a++)i[a].call(this,e);e.target=null}}},Zt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],zs=Math.PI/180,il=180/Math.PI;function ya(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Zt[e&255]+Zt[e>>8&255]+Zt[e>>16&255]+Zt[e>>24&255]+"-"+Zt[t&255]+Zt[t>>8&255]+"-"+Zt[t>>16&15|64]+Zt[t>>24&255]+"-"+Zt[r&63|128]+Zt[r>>8&255]+"-"+Zt[r>>16&255]+Zt[r>>24&255]+Zt[i&255]+Zt[i>>8&255]+Zt[i>>16&255]+Zt[i>>24&255]).toLowerCase()}function ct(e,t,r){return Math.max(t,Math.min(r,e))}function sp(e,t){return(e%t+t)%t}function Bs(e,t,r){return(1-r)*e+r*t}function Ua(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ar(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Rh=class{constructor(t=0,r=0){this.x=t,this.y=r}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,r){return this.x=t,this.y=r,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,r){switch(t){case 0:this.x=r;break;case 1:this.y=r;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,r){return this.x=t.x+r.x,this.y=t.y+r.y,this}addScaledVector(t,r){return this.x+=t.x*r,this.y+=t.y*r,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,r){return this.x=t.x-r.x,this.y=t.y-r.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let r=this.x,i=this.y,a=t.elements;return this.x=a[0]*r+a[3]*i+a[6],this.y=a[1]*r+a[4]*i+a[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,r){return this.x=ct(this.x,t.x,r.x),this.y=ct(this.y,t.y,r.y),this}clampScalar(t,r){return this.x=ct(this.x,t,r),this.y=ct(this.y,t,r),this}clampLength(t,r){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ct(i,t,r))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let r=Math.sqrt(this.lengthSq()*t.lengthSq());if(r===0)return Math.PI/2;let i=this.dot(t)/r;return Math.acos(ct(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let r=this.x-t.x,i=this.y-t.y;return r*r+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,r){return this.x+=(t.x-this.x)*r,this.y+=(t.y-this.y)*r,this}lerpVectors(t,r,i){return this.x=t.x+(r.x-t.x)*i,this.y=t.y+(r.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,r=0){return this.x=t[r],this.y=t[r+1],this}toArray(t=[],r=0){return t[r]=this.x,t[r+1]=this.y,t}fromBufferAttribute(t,r){return this.x=t.getX(r),this.y=t.getY(r),this}rotateAround(t,r){let i=Math.cos(r),a=Math.sin(r),n=this.x-t.x,s=this.y-t.y;return this.x=n*i-s*a+t.x,this.y=n*a+s*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Rh.prototype.isVector2=!0;var Me=Rh,Vi=class{constructor(e=0,t=0,r=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=i}static slerpFlat(e,t,r,i,a,n,s){let o=r[i+0],l=r[i+1],u=r[i+2],h=r[i+3],d=a[n+0],c=a[n+1],f=a[n+2],g=a[n+3];if(h!==g||o!==d||l!==c||u!==f){let v=o*d+l*c+u*f+h*g;v<0&&(d=-d,c=-c,f=-f,g=-g,v=-v);let m=1-s;if(v<.9995){let p=Math.acos(v),b=Math.sin(p);m=Math.sin(m*p)/b,s=Math.sin(s*p)/b,o=o*m+d*s,l=l*m+c*s,u=u*m+f*s,h=h*m+g*s}else{o=o*m+d*s,l=l*m+c*s,u=u*m+f*s,h=h*m+g*s;let p=1/Math.sqrt(o*o+l*l+u*u+h*h);o*=p,l*=p,u*=p,h*=p}}e[t]=o,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,r,i,a,n){let s=r[i],o=r[i+1],l=r[i+2],u=r[i+3],h=a[n],d=a[n+1],c=a[n+2],f=a[n+3];return e[t]=s*f+u*h+o*c-l*d,e[t+1]=o*f+u*d+l*h-s*c,e[t+2]=l*f+u*c+s*d-o*h,e[t+3]=u*f-s*h-o*d-l*c,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,i){return this._x=e,this._y=t,this._z=r,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let r=e._x,i=e._y,a=e._z,n=e._order,s=Math.cos,o=Math.sin,l=s(r/2),u=s(i/2),h=s(a/2),d=o(r/2),c=o(i/2),f=o(a/2);switch(n){case"XYZ":this._x=d*u*h+l*c*f,this._y=l*c*h-d*u*f,this._z=l*u*f+d*c*h,this._w=l*u*h-d*c*f;break;case"YXZ":this._x=d*u*h+l*c*f,this._y=l*c*h-d*u*f,this._z=l*u*f-d*c*h,this._w=l*u*h+d*c*f;break;case"ZXY":this._x=d*u*h-l*c*f,this._y=l*c*h+d*u*f,this._z=l*u*f+d*c*h,this._w=l*u*h-d*c*f;break;case"ZYX":this._x=d*u*h-l*c*f,this._y=l*c*h+d*u*f,this._z=l*u*f-d*c*h,this._w=l*u*h+d*c*f;break;case"YZX":this._x=d*u*h+l*c*f,this._y=l*c*h+d*u*f,this._z=l*u*f-d*c*h,this._w=l*u*h-d*c*f;break;case"XZY":this._x=d*u*h-l*c*f,this._y=l*c*h-d*u*f,this._z=l*u*f+d*c*h,this._w=l*u*h+d*c*f;break;default:Je("Quaternion: .setFromEuler() encountered an unknown order: "+n)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let r=t/2,i=Math.sin(r);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,r=t[0],i=t[4],a=t[8],n=t[1],s=t[5],o=t[9],l=t[2],u=t[6],h=t[10],d=r+s+h;if(d>0){let c=.5/Math.sqrt(d+1);this._w=.25/c,this._x=(u-o)*c,this._y=(a-l)*c,this._z=(n-i)*c}else if(r>s&&r>h){let c=2*Math.sqrt(1+r-s-h);this._w=(u-o)/c,this._x=.25*c,this._y=(i+n)/c,this._z=(a+l)/c}else if(s>h){let c=2*Math.sqrt(1+s-r-h);this._w=(a-l)/c,this._x=(i+n)/c,this._y=.25*c,this._z=(o+u)/c}else{let c=2*Math.sqrt(1+h-r-s);this._w=(n-i)/c,this._x=(a+l)/c,this._y=(o+u)/c,this._z=.25*c}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<1e-8?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ct(this.dot(e),-1,1)))}rotateTowards(e,t){let r=this.angleTo(e);if(r===0)return this;let i=Math.min(1,t/r);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let r=e._x,i=e._y,a=e._z,n=e._w,s=t._x,o=t._y,l=t._z,u=t._w;return this._x=r*u+n*s+i*l-a*o,this._y=i*u+n*o+a*s-r*l,this._z=a*u+n*l+r*o-i*s,this._w=n*u-r*s-i*o-a*l,this._onChangeCallback(),this}slerp(e,t){let r=e._x,i=e._y,a=e._z,n=e._w,s=this.dot(e);s<0&&(r=-r,i=-i,a=-a,n=-n,s=-s);let o=1-t;if(s<.9995){let l=Math.acos(s),u=Math.sin(l);o=Math.sin(o*l)/u,t=Math.sin(t*l)/u,this._x=this._x*o+r*t,this._y=this._y*o+i*t,this._z=this._z*o+a*t,this._w=this._w*o+n*t,this._onChangeCallback()}else this._x=this._x*o+r*t,this._y=this._y*o+i*t,this._z=this._z*o+a*t,this._w=this._w*o+n*t,this.normalize();return this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),i=Math.sqrt(1-r),a=Math.sqrt(r);return this.set(i*Math.sin(e),i*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Ch=class{constructor(t=0,r=0,i=0){this.x=t,this.y=r,this.z=i}set(t,r,i){return i===void 0&&(i=this.z),this.x=t,this.y=r,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,r){switch(t){case 0:this.x=r;break;case 1:this.y=r;break;case 2:this.z=r;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,r){return this.x=t.x+r.x,this.y=t.y+r.y,this.z=t.z+r.z,this}addScaledVector(t,r){return this.x+=t.x*r,this.y+=t.y*r,this.z+=t.z*r,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,r){return this.x=t.x-r.x,this.y=t.y-r.y,this.z=t.z-r.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,r){return this.x=t.x*r.x,this.y=t.y*r.y,this.z=t.z*r.z,this}applyEuler(t){return this.applyQuaternion(gu.setFromEuler(t))}applyAxisAngle(t,r){return this.applyQuaternion(gu.setFromAxisAngle(t,r))}applyMatrix3(t){let r=this.x,i=this.y,a=this.z,n=t.elements;return this.x=n[0]*r+n[3]*i+n[6]*a,this.y=n[1]*r+n[4]*i+n[7]*a,this.z=n[2]*r+n[5]*i+n[8]*a,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let r=this.x,i=this.y,a=this.z,n=t.elements,s=1/(n[3]*r+n[7]*i+n[11]*a+n[15]);return this.x=(n[0]*r+n[4]*i+n[8]*a+n[12])*s,this.y=(n[1]*r+n[5]*i+n[9]*a+n[13])*s,this.z=(n[2]*r+n[6]*i+n[10]*a+n[14])*s,this}applyQuaternion(t){let r=this.x,i=this.y,a=this.z,n=t.x,s=t.y,o=t.z,l=t.w,u=2*(s*a-o*i),h=2*(o*r-n*a),d=2*(n*i-s*r);return this.x=r+l*u+s*d-o*h,this.y=i+l*h+o*u-n*d,this.z=a+l*d+n*h-s*u,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let r=this.x,i=this.y,a=this.z,n=t.elements;return this.x=n[0]*r+n[4]*i+n[8]*a,this.y=n[1]*r+n[5]*i+n[9]*a,this.z=n[2]*r+n[6]*i+n[10]*a,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,r){return this.x=ct(this.x,t.x,r.x),this.y=ct(this.y,t.y,r.y),this.z=ct(this.z,t.z,r.z),this}clampScalar(t,r){return this.x=ct(this.x,t,r),this.y=ct(this.y,t,r),this.z=ct(this.z,t,r),this}clampLength(t,r){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ct(i,t,r))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,r){return this.x+=(t.x-this.x)*r,this.y+=(t.y-this.y)*r,this.z+=(t.z-this.z)*r,this}lerpVectors(t,r,i){return this.x=t.x+(r.x-t.x)*i,this.y=t.y+(r.y-t.y)*i,this.z=t.z+(r.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,r){let i=t.x,a=t.y,n=t.z,s=r.x,o=r.y,l=r.z;return this.x=a*l-n*o,this.y=n*s-i*l,this.z=i*o-a*s,this}projectOnVector(t){let r=t.lengthSq();if(r===0)return this.set(0,0,0);let i=t.dot(this)/r;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return ks.copy(this).projectOnVector(t),this.sub(ks)}reflect(t){return this.sub(ks.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let r=Math.sqrt(this.lengthSq()*t.lengthSq());if(r===0)return Math.PI/2;let i=this.dot(t)/r;return Math.acos(ct(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let r=this.x-t.x,i=this.y-t.y,a=this.z-t.z;return r*r+i*i+a*a}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,r,i){let a=Math.sin(r)*t;return this.x=a*Math.sin(i),this.y=Math.cos(r)*t,this.z=a*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,r,i){return this.x=t*Math.sin(r),this.y=i,this.z=t*Math.cos(r),this}setFromMatrixPosition(t){let r=t.elements;return this.x=r[12],this.y=r[13],this.z=r[14],this}setFromMatrixScale(t){let r=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),a=this.setFromMatrixColumn(t,2).length();return this.x=r,this.y=i,this.z=a,this}setFromMatrixColumn(t,r){return this.fromArray(t.elements,r*4)}setFromMatrix3Column(t,r){return this.fromArray(t.elements,r*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,r=0){return this.x=t[r],this.y=t[r+1],this.z=t[r+2],this}toArray(t=[],r=0){return t[r]=this.x,t[r+1]=this.y,t[r+2]=this.z,t}fromBufferAttribute(t,r){return this.x=t.getX(r),this.y=t.getY(r),this.z=t.getZ(r),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,r=Math.random()*2-1,i=Math.sqrt(1-r*r);return this.x=i*Math.cos(t),this.y=r,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ch.prototype.isVector3=!0;var z=Ch,ks=new z,gu=new Vi,Ph=class{constructor(t,r,i,a,n,s,o,l,u){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,r,i,a,n,s,o,l,u)}set(t,r,i,a,n,s,o,l,u){let h=this.elements;return h[0]=t,h[1]=a,h[2]=o,h[3]=r,h[4]=n,h[5]=l,h[6]=i,h[7]=s,h[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let r=this.elements,i=t.elements;return r[0]=i[0],r[1]=i[1],r[2]=i[2],r[3]=i[3],r[4]=i[4],r[5]=i[5],r[6]=i[6],r[7]=i[7],r[8]=i[8],this}extractBasis(t,r,i){return t.setFromMatrix3Column(this,0),r.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let r=t.elements;return this.set(r[0],r[4],r[8],r[1],r[5],r[9],r[2],r[6],r[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,r){let i=t.elements,a=r.elements,n=this.elements,s=i[0],o=i[3],l=i[6],u=i[1],h=i[4],d=i[7],c=i[2],f=i[5],g=i[8],v=a[0],m=a[3],p=a[6],b=a[1],w=a[4],y=a[7],E=a[2],C=a[5],R=a[8];return n[0]=s*v+o*b+l*E,n[3]=s*m+o*w+l*C,n[6]=s*p+o*y+l*R,n[1]=u*v+h*b+d*E,n[4]=u*m+h*w+d*C,n[7]=u*p+h*y+d*R,n[2]=c*v+f*b+g*E,n[5]=c*m+f*w+g*C,n[8]=c*p+f*y+g*R,this}multiplyScalar(t){let r=this.elements;return r[0]*=t,r[3]*=t,r[6]*=t,r[1]*=t,r[4]*=t,r[7]*=t,r[2]*=t,r[5]*=t,r[8]*=t,this}determinant(){let t=this.elements,r=t[0],i=t[1],a=t[2],n=t[3],s=t[4],o=t[5],l=t[6],u=t[7],h=t[8];return r*s*h-r*o*u-i*n*h+i*o*l+a*n*u-a*s*l}invert(){let t=this.elements,r=t[0],i=t[1],a=t[2],n=t[3],s=t[4],o=t[5],l=t[6],u=t[7],h=t[8],d=h*s-o*u,c=o*l-h*n,f=u*n-s*l,g=r*d+i*c+a*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/g;return t[0]=d*v,t[1]=(a*u-h*i)*v,t[2]=(o*i-a*s)*v,t[3]=c*v,t[4]=(h*r-a*l)*v,t[5]=(a*n-o*r)*v,t[6]=f*v,t[7]=(i*l-u*r)*v,t[8]=(s*r-i*n)*v,this}transpose(){let t,r=this.elements;return t=r[1],r[1]=r[3],r[3]=t,t=r[2],r[2]=r[6],r[6]=t,t=r[5],r[5]=r[7],r[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let r=this.elements;return t[0]=r[0],t[1]=r[3],t[2]=r[6],t[3]=r[1],t[4]=r[4],t[5]=r[7],t[6]=r[2],t[7]=r[5],t[8]=r[8],this}setUvTransform(t,r,i,a,n,s,o){let l=Math.cos(n),u=Math.sin(n);return this.set(i*l,i*u,-i*(l*s+u*o)+s+t,-a*u,a*l,-a*(-u*s+l*o)+o+r,0,0,1),this}scale(t,r){return ma("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Vs.makeScale(t,r)),this}rotate(t){return ma("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Vs.makeRotation(-t)),this}translate(t,r){return ma("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Vs.makeTranslation(t,r)),this}makeTranslation(t,r){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,r,0,0,1),this}makeRotation(t){let r=Math.cos(t),i=Math.sin(t);return this.set(r,-i,0,i,r,0,0,0,1),this}makeScale(t,r){return this.set(t,0,0,0,r,0,0,0,1),this}equals(t){let r=this.elements,i=t.elements;for(let a=0;a<9;a++)if(r[a]!==i[a])return!1;return!0}fromArray(t,r=0){for(let i=0;i<9;i++)this.elements[i]=t[i+r];return this}toArray(t=[],r=0){let i=this.elements;return t[r]=i[0],t[r+1]=i[1],t[r+2]=i[2],t[r+3]=i[3],t[r+4]=i[4],t[r+5]=i[5],t[r+6]=i[6],t[r+7]=i[7],t[r+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Ph.prototype.isMatrix3=!0;var at=Ph,Vs=new at,_u=new at().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),vu=new at().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function op(){let e={enabled:!0,workingColorSpace:os,spaces:{},convert:function(a,n,s){return this.enabled===!1||n===s||!n||!s||(this.spaces[n].transfer===xt&&(a.r=ii(a.r),a.g=ii(a.g),a.b=ii(a.b)),this.spaces[n].primaries!==this.spaces[s].primaries&&(a.applyMatrix3(this.spaces[n].toXYZ),a.applyMatrix3(this.spaces[s].fromXYZ)),this.spaces[s].transfer===xt&&(a.r=ga(a.r),a.g=ga(a.g),a.b=ga(a.b))),a},workingToColorSpace:function(a,n){return this.convert(a,this.workingColorSpace,n)},colorSpaceToWorking:function(a,n){return this.convert(a,n,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===xi?ls:this.spaces[a].transfer},getToneMappingMode:function(a){return this.spaces[a].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(a,n=this.workingColorSpace){return a.fromArray(this.spaces[n].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,n,s){return a.copy(this.spaces[n].toXYZ).multiply(this.spaces[s].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(a,n){return ma("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(a,n)},toWorkingColorSpace:function(a,n){return ma("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(a,n)}},t=[.64,.33,.3,.6,.15,.06],r=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[os]:{primaries:t,whitePoint:i,transfer:ls,toXYZ:_u,fromXYZ:vu,luminanceCoefficients:r,workingColorSpaceConfig:{unpackColorSpace:xr},outputColorSpaceConfig:{drawingBufferColorSpace:xr}},[xr]:{primaries:t,whitePoint:i,transfer:xt,toXYZ:_u,fromXYZ:vu,luminanceCoefficients:r,outputColorSpaceConfig:{drawingBufferColorSpace:xr}}}),e}var dt=op();function ii(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function ga(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var Zi,lp=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let r;if(e instanceof HTMLCanvasElement)r=e;else{Zi===void 0&&(Zi=hs("canvas")),Zi.width=e.width,Zi.height=e.height;let i=Zi.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),r=Zi}return r.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=hs("canvas");t.width=e.width,t.height=e.height;let r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);let i=r.getImageData(0,0,e.width,e.height),a=i.data;for(let n=0;n<a.length;n++)a[n]=ii(a[n]/255)*255;return r.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor(ii(t[r]/255)*255):t[r]=ii(t[r]);return{data:t,width:e.width,height:e.height}}else return Je("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},up=0,_l=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:up++}),this.uuid=ya(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let r={uuid:this.uuid,url:""},i=this.data;if(i!==null){let a;if(Array.isArray(i)){a=[];for(let n=0,s=i.length;n<s;n++)i[n].isDataTexture?a.push(Hs(i[n].image)):a.push(Hs(i[n]))}else a=Hs(i);r.url=a}return t||(e.images[this.uuid]=r),r}};function Hs(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?lp.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(Je("Texture: Unable to serialize Texture."),{})}var hp=0,Gs=new z,yr=class ts extends ki{constructor(t=ts.DEFAULT_IMAGE,r=ts.DEFAULT_MAPPING,i=ti,a=ti,n=Qt,s=Di,o=Lr,l=Sr,u=ts.DEFAULT_ANISOTROPY,h=xi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:hp++}),this.uuid=ya(),this.name="",this.source=new _l(t),this.mipmaps=[],this.mapping=r,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=n,this.minFilter=s,this.anisotropy=u,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Me(0,0),this.repeat=new Me(1,1),this.center=new Me(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new at,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Gs).x}get height(){return this.source.getSize(Gs).y}get depth(){return this.source.getSize(Gs).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,r){this.updateRanges.push({start:t,count:r})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let r in t){let i=t[r];if(i===void 0){Je(`Texture.setValues(): parameter '${r}' has value of undefined.`);continue}let a=this[r];if(a===void 0){Je(`Texture.setValues(): property '${r}' does not exist.`);continue}a&&i&&a.isVector2&&i.isVector2||a&&i&&a.isVector3&&i.isVector3||a&&i&&a.isMatrix3&&i.isMatrix3?a.copy(i):this[r]=i}}toJSON(t){let r=t===void 0||typeof t=="string";if(!r&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),r||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Sh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Eo:t.x=t.x-Math.floor(t.x);break;case ti:t.x=t.x<0?0:1;break;case bo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Eo:t.y=t.y-Math.floor(t.y);break;case ti:t.y=t.y<0?0:1;break;case bo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};yr.DEFAULT_IMAGE=null;yr.DEFAULT_MAPPING=Sh;yr.DEFAULT_ANISOTROPY=1;var Lh=class{constructor(t=0,r=0,i=0,a=1){this.x=t,this.y=r,this.z=i,this.w=a}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,r,i,a){return this.x=t,this.y=r,this.z=i,this.w=a,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,r){switch(t){case 0:this.x=r;break;case 1:this.y=r;break;case 2:this.z=r;break;case 3:this.w=r;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,r){return this.x=t.x+r.x,this.y=t.y+r.y,this.z=t.z+r.z,this.w=t.w+r.w,this}addScaledVector(t,r){return this.x+=t.x*r,this.y+=t.y*r,this.z+=t.z*r,this.w+=t.w*r,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,r){return this.x=t.x-r.x,this.y=t.y-r.y,this.z=t.z-r.z,this.w=t.w-r.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let r=this.x,i=this.y,a=this.z,n=this.w,s=t.elements;return this.x=s[0]*r+s[4]*i+s[8]*a+s[12]*n,this.y=s[1]*r+s[5]*i+s[9]*a+s[13]*n,this.z=s[2]*r+s[6]*i+s[10]*a+s[14]*n,this.w=s[3]*r+s[7]*i+s[11]*a+s[15]*n,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let r=Math.sqrt(1-t.w*t.w);return r<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/r,this.y=t.y/r,this.z=t.z/r),this}setAxisAngleFromRotationMatrix(t){let r,i,a,n,s=t.elements,o=s[0],l=s[4],u=s[8],h=s[1],d=s[5],c=s[9],f=s[2],g=s[6],v=s[10];if(Math.abs(l-h)<.01&&Math.abs(u-f)<.01&&Math.abs(c-g)<.01){if(Math.abs(l+h)<.1&&Math.abs(u+f)<.1&&Math.abs(c+g)<.1&&Math.abs(o+d+v-3)<.1)return this.set(1,0,0,0),this;r=Math.PI;let p=(o+1)/2,b=(d+1)/2,w=(v+1)/2,y=(l+h)/4,E=(u+f)/4,C=(c+g)/4;return p>b&&p>w?p<.01?(i=0,a=.707106781,n=.707106781):(i=Math.sqrt(p),a=y/i,n=E/i):b>w?b<.01?(i=.707106781,a=0,n=.707106781):(a=Math.sqrt(b),i=y/a,n=C/a):w<.01?(i=.707106781,a=.707106781,n=0):(n=Math.sqrt(w),i=E/n,a=C/n),this.set(i,a,n,r),this}let m=Math.sqrt((g-c)*(g-c)+(u-f)*(u-f)+(h-l)*(h-l));return Math.abs(m)<.001&&(m=1),this.x=(g-c)/m,this.y=(u-f)/m,this.z=(h-l)/m,this.w=Math.acos((o+d+v-1)/2),this}setFromMatrixPosition(t){let r=t.elements;return this.x=r[12],this.y=r[13],this.z=r[14],this.w=r[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,r){return this.x=ct(this.x,t.x,r.x),this.y=ct(this.y,t.y,r.y),this.z=ct(this.z,t.z,r.z),this.w=ct(this.w,t.w,r.w),this}clampScalar(t,r){return this.x=ct(this.x,t,r),this.y=ct(this.y,t,r),this.z=ct(this.z,t,r),this.w=ct(this.w,t,r),this}clampLength(t,r){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ct(i,t,r))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,r){return this.x+=(t.x-this.x)*r,this.y+=(t.y-this.y)*r,this.z+=(t.z-this.z)*r,this.w+=(t.w-this.w)*r,this}lerpVectors(t,r,i){return this.x=t.x+(r.x-t.x)*i,this.y=t.y+(r.y-t.y)*i,this.z=t.z+(r.z-t.z)*i,this.w=t.w+(r.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,r=0){return this.x=t[r],this.y=t[r+1],this.z=t[r+2],this.w=t[r+3],this}toArray(t=[],r=0){return t[r]=this.x,t[r+1]=this.y,t[r+2]=this.z,t[r+3]=this.w,t}fromBufferAttribute(t,r){return this.x=t.getX(r),this.y=t.getY(r),this.z=t.getZ(r),this.w=t.getW(r),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Lh.prototype.isVector4=!0;var Pt=Lh,cp=class extends ki{constructor(e=1,t=1,r={}){super(),r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Qt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},r),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=r.depth,this.scissor=new Pt(0,0,e,t),this.scissorTest=!1,this.viewport=new Pt(0,0,e,t),this.textures=[];let i={width:e,height:t,depth:r.depth},a=new yr(i),n=r.count;for(let s=0;s<n;s++)this.textures[s]=a.clone(),this.textures[s].isRenderTargetTexture=!0,this.textures[s].renderTarget=this;this._setTextureOptions(r),this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveColorBuffer=r.resolveColorBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this.storeMultisampledColorBuffer=r.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=r.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=r.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples,this.multiview=r.multiview,this.useArrayDepthTexture=r.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Qt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let r=0;r<this.textures.length;r++)this.textures[r].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let i=0,a=this.textures.length;i<a;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=r,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,r=e.textures.length;t<r;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new _l(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Nr=class extends cp{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}},Nh=class extends yr{constructor(e=null,t=1,r=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:i},this.magFilter=Yt,this.minFilter=Yt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},dp=class extends yr{constructor(e=null,t=1,r=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:i},this.magFilter=Yt,this.minFilter=Yt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Dh=class Uh{constructor(t,r,i,a,n,s,o,l,u,h,d,c,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,r,i,a,n,s,o,l,u,h,d,c,f,g,v,m)}set(t,r,i,a,n,s,o,l,u,h,d,c,f,g,v,m){let p=this.elements;return p[0]=t,p[4]=r,p[8]=i,p[12]=a,p[1]=n,p[5]=s,p[9]=o,p[13]=l,p[2]=u,p[6]=h,p[10]=d,p[14]=c,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Uh().fromArray(this.elements)}copy(t){let r=this.elements,i=t.elements;return r[0]=i[0],r[1]=i[1],r[2]=i[2],r[3]=i[3],r[4]=i[4],r[5]=i[5],r[6]=i[6],r[7]=i[7],r[8]=i[8],r[9]=i[9],r[10]=i[10],r[11]=i[11],r[12]=i[12],r[13]=i[13],r[14]=i[14],r[15]=i[15],this}copyPosition(t){let r=this.elements,i=t.elements;return r[12]=i[12],r[13]=i[13],r[14]=i[14],this}setFromMatrix3(t){let r=t.elements;return this.set(r[0],r[3],r[6],0,r[1],r[4],r[7],0,r[2],r[5],r[8],0,0,0,0,1),this}extractBasis(t,r,i){return this.determinantAffine()===0?(t.set(1,0,0),r.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),r.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,r,i){return this.set(t.x,r.x,i.x,0,t.y,r.y,i.y,0,t.z,r.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let r=this.elements,i=t.elements,a=1/$i.setFromMatrixColumn(t,0).length(),n=1/$i.setFromMatrixColumn(t,1).length(),s=1/$i.setFromMatrixColumn(t,2).length();return r[0]=i[0]*a,r[1]=i[1]*a,r[2]=i[2]*a,r[3]=0,r[4]=i[4]*n,r[5]=i[5]*n,r[6]=i[6]*n,r[7]=0,r[8]=i[8]*s,r[9]=i[9]*s,r[10]=i[10]*s,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,this}makeRotationFromEuler(t){let r=this.elements,i=t.x,a=t.y,n=t.z,s=Math.cos(i),o=Math.sin(i),l=Math.cos(a),u=Math.sin(a),h=Math.cos(n),d=Math.sin(n);if(t.order==="XYZ"){let c=s*h,f=s*d,g=o*h,v=o*d;r[0]=l*h,r[4]=-l*d,r[8]=u,r[1]=f+g*u,r[5]=c-v*u,r[9]=-o*l,r[2]=v-c*u,r[6]=g+f*u,r[10]=s*l}else if(t.order==="YXZ"){let c=l*h,f=l*d,g=u*h,v=u*d;r[0]=c+v*o,r[4]=g*o-f,r[8]=s*u,r[1]=s*d,r[5]=s*h,r[9]=-o,r[2]=f*o-g,r[6]=v+c*o,r[10]=s*l}else if(t.order==="ZXY"){let c=l*h,f=l*d,g=u*h,v=u*d;r[0]=c-v*o,r[4]=-s*d,r[8]=g+f*o,r[1]=f+g*o,r[5]=s*h,r[9]=v-c*o,r[2]=-s*u,r[6]=o,r[10]=s*l}else if(t.order==="ZYX"){let c=s*h,f=s*d,g=o*h,v=o*d;r[0]=l*h,r[4]=g*u-f,r[8]=c*u+v,r[1]=l*d,r[5]=v*u+c,r[9]=f*u-g,r[2]=-u,r[6]=o*l,r[10]=s*l}else if(t.order==="YZX"){let c=s*l,f=s*u,g=o*l,v=o*u;r[0]=l*h,r[4]=v-c*d,r[8]=g*d+f,r[1]=d,r[5]=s*h,r[9]=-o*h,r[2]=-u*h,r[6]=f*d+g,r[10]=c-v*d}else if(t.order==="XZY"){let c=s*l,f=s*u,g=o*l,v=o*u;r[0]=l*h,r[4]=-d,r[8]=u*h,r[1]=c*d+v,r[5]=s*h,r[9]=f*d-g,r[2]=g*d-f,r[6]=o*h,r[10]=v*d+c}return r[3]=0,r[7]=0,r[11]=0,r[12]=0,r[13]=0,r[14]=0,r[15]=1,this}makeRotationFromQuaternion(t){return this.compose(pp,t,fp)}lookAt(t,r,i){let a=this.elements;return ur.subVectors(t,r),ur.lengthSq()===0&&(ur.z=1),ur.normalize(),pi.crossVectors(i,ur),pi.lengthSq()===0&&(Math.abs(i.z)===1?ur.x+=1e-4:ur.z+=1e-4,ur.normalize(),pi.crossVectors(i,ur)),pi.normalize(),wn.crossVectors(ur,pi),a[0]=pi.x,a[4]=wn.x,a[8]=ur.x,a[1]=pi.y,a[5]=wn.y,a[9]=ur.y,a[2]=pi.z,a[6]=wn.z,a[10]=ur.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,r){let i=t.elements,a=r.elements,n=this.elements,s=i[0],o=i[4],l=i[8],u=i[12],h=i[1],d=i[5],c=i[9],f=i[13],g=i[2],v=i[6],m=i[10],p=i[14],b=i[3],w=i[7],y=i[11],E=i[15],C=a[0],R=a[4],_=a[8],T=a[12],H=a[1],N=a[5],F=a[9],q=a[13],A=a[2],O=a[6],j=a[10],G=a[14],ce=a[3],X=a[7],Y=a[11],ee=a[15];return n[0]=s*C+o*H+l*A+u*ce,n[4]=s*R+o*N+l*O+u*X,n[8]=s*_+o*F+l*j+u*Y,n[12]=s*T+o*q+l*G+u*ee,n[1]=h*C+d*H+c*A+f*ce,n[5]=h*R+d*N+c*O+f*X,n[9]=h*_+d*F+c*j+f*Y,n[13]=h*T+d*q+c*G+f*ee,n[2]=g*C+v*H+m*A+p*ce,n[6]=g*R+v*N+m*O+p*X,n[10]=g*_+v*F+m*j+p*Y,n[14]=g*T+v*q+m*G+p*ee,n[3]=b*C+w*H+y*A+E*ce,n[7]=b*R+w*N+y*O+E*X,n[11]=b*_+w*F+y*j+E*Y,n[15]=b*T+w*q+y*G+E*ee,this}multiplyScalar(t){let r=this.elements;return r[0]*=t,r[4]*=t,r[8]*=t,r[12]*=t,r[1]*=t,r[5]*=t,r[9]*=t,r[13]*=t,r[2]*=t,r[6]*=t,r[10]*=t,r[14]*=t,r[3]*=t,r[7]*=t,r[11]*=t,r[15]*=t,this}determinant(){let t=this.elements,r=t[0],i=t[4],a=t[8],n=t[12],s=t[1],o=t[5],l=t[9],u=t[13],h=t[2],d=t[6],c=t[10],f=t[14],g=t[3],v=t[7],m=t[11],p=t[15],b=l*f-u*c,w=o*f-u*d,y=o*c-l*d,E=s*f-u*h,C=s*c-l*h,R=s*d-o*h;return r*(v*b-m*w+p*y)-i*(g*b-m*E+p*C)+a*(g*w-v*E+p*R)-n*(g*y-v*C+m*R)}determinantAffine(){let t=this.elements,r=t[0],i=t[4],a=t[8],n=t[1],s=t[5],o=t[9],l=t[2],u=t[6],h=t[10];return r*(s*h-o*u)-i*(n*h-o*l)+a*(n*u-s*l)}transpose(){let t=this.elements,r;return r=t[1],t[1]=t[4],t[4]=r,r=t[2],t[2]=t[8],t[8]=r,r=t[6],t[6]=t[9],t[9]=r,r=t[3],t[3]=t[12],t[12]=r,r=t[7],t[7]=t[13],t[13]=r,r=t[11],t[11]=t[14],t[14]=r,this}setPosition(t,r,i){let a=this.elements;return t.isVector3?(a[12]=t.x,a[13]=t.y,a[14]=t.z):(a[12]=t,a[13]=r,a[14]=i),this}invert(){let t=this.elements,r=t[0],i=t[1],a=t[2],n=t[3],s=t[4],o=t[5],l=t[6],u=t[7],h=t[8],d=t[9],c=t[10],f=t[11],g=t[12],v=t[13],m=t[14],p=t[15],b=r*o-i*s,w=r*l-a*s,y=r*u-n*s,E=i*l-a*o,C=i*u-n*o,R=a*u-n*l,_=h*v-d*g,T=h*m-c*g,H=h*p-f*g,N=d*m-c*v,F=d*p-f*v,q=c*p-f*m,A=b*q-w*F+y*N+E*H-C*T+R*_;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/A;return t[0]=(o*q-l*F+u*N)*O,t[1]=(a*F-i*q-n*N)*O,t[2]=(v*R-m*C+p*E)*O,t[3]=(c*C-d*R-f*E)*O,t[4]=(l*H-s*q-u*T)*O,t[5]=(r*q-a*H+n*T)*O,t[6]=(m*y-g*R-p*w)*O,t[7]=(h*R-c*y+f*w)*O,t[8]=(s*F-o*H+u*_)*O,t[9]=(i*H-r*F-n*_)*O,t[10]=(g*C-v*y+p*b)*O,t[11]=(d*y-h*C-f*b)*O,t[12]=(o*T-s*N-l*_)*O,t[13]=(r*N-i*T+a*_)*O,t[14]=(v*w-g*E-m*b)*O,t[15]=(h*E-d*w+c*b)*O,this}scale(t){let r=this.elements,i=t.x,a=t.y,n=t.z;return r[0]*=i,r[4]*=a,r[8]*=n,r[1]*=i,r[5]*=a,r[9]*=n,r[2]*=i,r[6]*=a,r[10]*=n,r[3]*=i,r[7]*=a,r[11]*=n,this}getMaxScaleOnAxis(){let t=this.elements,r=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],a=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(r,i,a))}makeTranslation(t,r,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,r,0,0,1,i,0,0,0,1),this}makeRotationX(t){let r=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,r,-i,0,0,i,r,0,0,0,0,1),this}makeRotationY(t){let r=Math.cos(t),i=Math.sin(t);return this.set(r,0,i,0,0,1,0,0,-i,0,r,0,0,0,0,1),this}makeRotationZ(t){let r=Math.cos(t),i=Math.sin(t);return this.set(r,-i,0,0,i,r,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,r){let i=Math.cos(r),a=Math.sin(r),n=1-i,s=t.x,o=t.y,l=t.z,u=n*s,h=n*o;return this.set(u*s+i,u*o-a*l,u*l+a*o,0,u*o+a*l,h*o+i,h*l-a*s,0,u*l-a*o,h*l+a*s,n*l*l+i,0,0,0,0,1),this}makeScale(t,r,i){return this.set(t,0,0,0,0,r,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,r,i,a,n,s){return this.set(1,i,n,0,t,1,s,0,r,a,1,0,0,0,0,1),this}compose(t,r,i){let a=this.elements,n=r._x,s=r._y,o=r._z,l=r._w,u=n+n,h=s+s,d=o+o,c=n*u,f=n*h,g=n*d,v=s*h,m=s*d,p=o*d,b=l*u,w=l*h,y=l*d,E=i.x,C=i.y,R=i.z;return a[0]=(1-(v+p))*E,a[1]=(f+y)*E,a[2]=(g-w)*E,a[3]=0,a[4]=(f-y)*C,a[5]=(1-(c+p))*C,a[6]=(m+b)*C,a[7]=0,a[8]=(g+w)*R,a[9]=(m-b)*R,a[10]=(1-(c+v))*R,a[11]=0,a[12]=t.x,a[13]=t.y,a[14]=t.z,a[15]=1,this}decompose(t,r,i){let a=this.elements;t.x=a[12],t.y=a[13],t.z=a[14];let n=this.determinantAffine();if(n===0)return i.set(1,1,1),r.identity(),this;let s=$i.set(a[0],a[1],a[2]).length(),o=$i.set(a[4],a[5],a[6]).length(),l=$i.set(a[8],a[9],a[10]).length();n<0&&(s=-s),Ar.copy(this);let u=1/s,h=1/o,d=1/l;return Ar.elements[0]*=u,Ar.elements[1]*=u,Ar.elements[2]*=u,Ar.elements[4]*=h,Ar.elements[5]*=h,Ar.elements[6]*=h,Ar.elements[8]*=d,Ar.elements[9]*=d,Ar.elements[10]*=d,r.setFromRotationMatrix(Ar),i.x=s,i.y=o,i.z=l,this}makePerspective(t,r,i,a,n,s,o=kr,l=!1){let u=this.elements,h=2*n/(r-t),d=2*n/(i-a),c=(r+t)/(r-t),f=(i+a)/(i-a),g,v;if(l)g=n/(s-n),v=s*n/(s-n);else if(o===kr)g=-(s+n)/(s-n),v=-2*s*n/(s-n);else if(o===us)g=-s/(s-n),v=-s*n/(s-n);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return u[0]=h,u[4]=0,u[8]=c,u[12]=0,u[1]=0,u[5]=d,u[9]=f,u[13]=0,u[2]=0,u[6]=0,u[10]=g,u[14]=v,u[3]=0,u[7]=0,u[11]=-1,u[15]=0,this}makeOrthographic(t,r,i,a,n,s,o=kr,l=!1){let u=this.elements,h=2/(r-t),d=2/(i-a),c=-(r+t)/(r-t),f=-(i+a)/(i-a),g,v;if(l)g=1/(s-n),v=s/(s-n);else if(o===kr)g=-2/(s-n),v=-(s+n)/(s-n);else if(o===us)g=-1/(s-n),v=-n/(s-n);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return u[0]=h,u[4]=0,u[8]=0,u[12]=c,u[1]=0,u[5]=d,u[9]=0,u[13]=f,u[2]=0,u[6]=0,u[10]=g,u[14]=v,u[3]=0,u[7]=0,u[11]=0,u[15]=1,this}equals(t){let r=this.elements,i=t.elements;for(let a=0;a<16;a++)if(r[a]!==i[a])return!1;return!0}fromArray(t,r=0){for(let i=0;i<16;i++)this.elements[i]=t[i+r];return this}toArray(t=[],r=0){let i=this.elements;return t[r]=i[0],t[r+1]=i[1],t[r+2]=i[2],t[r+3]=i[3],t[r+4]=i[4],t[r+5]=i[5],t[r+6]=i[6],t[r+7]=i[7],t[r+8]=i[8],t[r+9]=i[9],t[r+10]=i[10],t[r+11]=i[11],t[r+12]=i[12],t[r+13]=i[13],t[r+14]=i[14],t[r+15]=i[15],t}};Dh.prototype.isMatrix4=!0;var Wt=Dh,$i=new z,Ar=new Wt,pp=new z(0,0,0),fp=new z(1,1,1),pi=new z,wn=new z,ur=new z,xu=new Wt,Su=new Vi,Za=class Ih{constructor(t=0,r=0,i=0,a=Ih.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=r,this._z=i,this._order=a}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,r,i,a=this._order){return this._x=t,this._y=r,this._z=i,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,r=this._order,i=!0){let a=t.elements,n=a[0],s=a[4],o=a[8],l=a[1],u=a[5],h=a[9],d=a[2],c=a[6],f=a[10];switch(r){case"XYZ":this._y=Math.asin(ct(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-s,n)):(this._x=Math.atan2(c,u),this._z=0);break;case"YXZ":this._x=Math.asin(-ct(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-d,n),this._z=0);break;case"ZXY":this._x=Math.asin(ct(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-s,u)):(this._y=0,this._z=Math.atan2(l,n));break;case"ZYX":this._y=Math.asin(-ct(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(c,f),this._z=Math.atan2(l,n)):(this._x=0,this._z=Math.atan2(-s,u));break;case"YZX":this._z=Math.asin(ct(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,u),this._y=Math.atan2(-d,n)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-ct(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(c,u),this._y=Math.atan2(o,n)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Je("Euler: .setFromRotationMatrix() encountered an unknown order: "+r)}return this._order=r,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,r,i){return xu.makeRotationFromQuaternion(t),this.setFromRotationMatrix(xu,r,i)}setFromVector3(t,r=this._order){return this.set(t.x,t.y,t.z,r)}reorder(t){return Su.setFromEuler(this),this.setFromQuaternion(Su,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],r=0){return t[r]=this._x,t[r+1]=this._y,t[r+2]=this._z,t[r+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Za.DEFAULT_ORDER="XYZ";var Oh=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},mp=0,yu=new z,Qi=new Vi,Jr=new Wt,An=new z,Ia=new z,gp=new z,_p=new Vi,Mu=new z(1,0,0),Tu=new z(0,1,0),Eu=new z(0,0,1),bu={type:"added"},vp={type:"removed"},ea={type:"childadded",child:null},Ws={type:"childremoved",child:null},si=class rs extends ki{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mp++}),this.uuid=ya(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=rs.DEFAULT_UP.clone();let t=new z,r=new Za,i=new Vi,a=new z(1,1,1);function n(){i.setFromEuler(r,!1)}function s(){r.setFromQuaternion(i,void 0,!1)}r._onChange(n),i._onChange(s),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:r},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new Wt},normalMatrix:{value:new at}}),this.matrix=new Wt,this.matrixWorld=new Wt,this.matrixAutoUpdate=rs.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=rs.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Oh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,r){this.quaternion.setFromAxisAngle(t,r)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,r){return Qi.setFromAxisAngle(t,r),this.quaternion.multiply(Qi),this}rotateOnWorldAxis(t,r){return Qi.setFromAxisAngle(t,r),this.quaternion.premultiply(Qi),this}rotateX(t){return this.rotateOnAxis(Mu,t)}rotateY(t){return this.rotateOnAxis(Tu,t)}rotateZ(t){return this.rotateOnAxis(Eu,t)}translateOnAxis(t,r){return yu.copy(t).applyQuaternion(this.quaternion),this.position.add(yu.multiplyScalar(r)),this}translateX(t){return this.translateOnAxis(Mu,t)}translateY(t){return this.translateOnAxis(Tu,t)}translateZ(t){return this.translateOnAxis(Eu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Jr.copy(this.matrixWorld).invert())}lookAt(t,r,i){t.isVector3?An.copy(t):An.set(t,r,i);let a=this.parent;this.updateWorldMatrix(!0,!1),Ia.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jr.lookAt(Ia,An,this.up):Jr.lookAt(An,Ia,this.up),this.quaternion.setFromRotationMatrix(Jr),a&&(Jr.extractRotation(a.matrixWorld),Qi.setFromRotationMatrix(Jr),this.quaternion.premultiply(Qi.invert()))}add(t){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.add(arguments[r]);return this}return t===this?(Qe("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(bu),ea.child=t,this.dispatchEvent(ea),ea.child=null):Qe("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let r=this.children.indexOf(t);return r!==-1&&(t.parent=null,this.children.splice(r,1),t.dispatchEvent(vp),Ws.child=t,this.dispatchEvent(Ws),Ws.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Jr.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Jr.multiply(t.parent.matrixWorld)),t.applyMatrix4(Jr),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(bu),ea.child=t,this.dispatchEvent(ea),ea.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,r){if(this[t]===r)return this;for(let i=0,a=this.children.length;i<a;i++){let n=this.children[i].getObjectByProperty(t,r);if(n!==void 0)return n}}getObjectsByProperty(t,r,i=[]){this[t]===r&&i.push(this);let a=this.children;for(let n=0,s=a.length;n<s;n++)a[n].getObjectsByProperty(t,r,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ia,t,gp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ia,_p,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let r=this.matrixWorld.elements;return t.set(r[8],r[9],r[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].traverseVisible(t)}traverseAncestors(t){let r=this.parent;r!==null&&(t(r),r.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let r=t.x,i=t.y,a=t.z,n=this.matrix.elements;n[12]+=r-n[0]*r-n[4]*i-n[8]*a,n[13]+=i-n[1]*r-n[5]*i-n[9]*a,n[14]+=a-n[2]*r-n[6]*i-n[10]*a}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].updateMatrixWorld(t)}updateWorldMatrix(t,r,i=!1){let a=this.parent;if(t===!0&&a!==null&&a.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),r===!0){let n=this.children;for(let s=0,o=n.length;s<o;s++)n[s].updateWorldMatrix(!1,!0,i)}}toJSON(t){let r=t===void 0||typeof t=="string",i={};r&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let a={};a.uuid=this.uuid,a.type=this.type,a.name=this.name,a.castShadow=this.castShadow,a.receiveShadow=this.receiveShadow,a.visible=this.visible,a.frustumCulled=this.frustumCulled,a.renderOrder=this.renderOrder,a.static=this.static,a.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.pivot!==null&&(a.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(a.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(a.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),a.instanceInfo=this._instanceInfo.map(o=>({...o})),a.availableInstanceIds=this._availableInstanceIds.slice(),a.availableGeometryIds=this._availableGeometryIds.slice(),a.nextIndexStart=this._nextIndexStart,a.nextVertexStart=this._nextVertexStart,a.geometryCount=this._geometryCount,a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.matricesTexture=this._matricesTexture.toJSON(t),a.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(a.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(a.boundingBox=this.boundingBox.toJSON()));function n(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=n(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let u=0,h=l.length;u<h;u++){let d=l[u];n(t.shapes,d)}else n(t.shapes,l)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(n(t.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,u=this.material.length;l<u;l++)o.push(n(t.materials,this.material[l]));a.material=o}else a.material=n(t.materials,this.material);if(this.children.length>0){a.children=[];for(let o=0;o<this.children.length;o++)a.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){a.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];a.animations.push(n(t.animations,l))}}if(r){let o=s(t.geometries),l=s(t.materials),u=s(t.textures),h=s(t.images),d=s(t.shapes),c=s(t.skeletons),f=s(t.animations),g=s(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),u.length>0&&(i.textures=u),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),c.length>0&&(i.skeletons=c),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=a,i;function s(o){let l=[];for(let u in o){let h=o[u];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,r=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),r===!0)for(let i=0;i<t.children.length;i++){let a=t.children[i];this.add(a.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};si.DEFAULT_UP=new z(0,1,0);si.DEFAULT_MATRIX_AUTO_UPDATE=!0;si.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ii=class extends si{constructor(){super(),this.isGroup=!0,this.type="Group"}},xp={type:"move"},Xs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ii,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ii,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ii,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new z,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let i=null,a=null,n=null,s=this._targetRay,o=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){n=!0;for(let g of e.hand.values()){let v=t.getJointPose(g,r),m=this._getHandJoint(l,g);v!==null&&(m.matrix.fromArray(v.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=v.radius),m.visible=v!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),c=.02,f=.005;l.inputState.pinching&&d>c+f?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=c-f&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else o!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,r),a!==null&&(o.matrix.fromArray(a.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,a.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(a.linearVelocity)):o.hasLinearVelocity=!1,a.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(a.angularVelocity)):o.hasAngularVelocity=!1,o.eventsEnabled&&o.dispatchEvent({type:"gripUpdated",data:e,target:this})));s!==null&&(i=t.getPose(e.targetRaySpace,r),i===null&&a!==null&&(i=a),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,this.dispatchEvent(xp)))}return s!==null&&(s.visible=i!==null),o!==null&&(o.visible=a!==null),l!==null&&(l.visible=n!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let r=new Ii;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}},Fh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},fi={h:0,s:0,l:0},Rn={h:0,s:0,l:0};function qs(e,t,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?e+(t-e)*6*r:r<1/2?t:r<2/3?e+(t-e)*6*(2/3-r):e}var lt=class{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=xr){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.colorSpaceToWorking(this,t),this}setRGB(e,t,r,i=dt.workingColorSpace){return this.r=e,this.g=t,this.b=r,dt.colorSpaceToWorking(this,i),this}setHSL(e,t,r,i=dt.workingColorSpace){if(e=sp(e,1),t=ct(t,0,1),r=ct(r,0,1),t===0)this.r=this.g=this.b=r;else{let a=r<=.5?r*(1+t):r+t-r*t,n=2*r-a;this.r=qs(n,a,e+1/3),this.g=qs(n,a,e),this.b=qs(n,a,e-1/3)}return dt.colorSpaceToWorking(this,i),this}setStyle(e,t=xr){function r(a){a!==void 0&&parseFloat(a)<1&&Je("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let a,n=i[1],s=i[2];switch(n){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return r(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return r(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return r(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:Je("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let a=i[1],n=a.length;if(n===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(n===6)return this.setHex(parseInt(a,16),t);Je("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=xr){let r=Fh[e.toLowerCase()];return r!==void 0?this.setHex(r,t):Je("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ii(e.r),this.g=ii(e.g),this.b=ii(e.b),this}copyLinearToSRGB(e){return this.r=ga(e.r),this.g=ga(e.g),this.b=ga(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=xr){return dt.workingToColorSpace($t.copy(this),e),Math.round(ct($t.r*255,0,255))*65536+Math.round(ct($t.g*255,0,255))*256+Math.round(ct($t.b*255,0,255))}getHexString(e=xr){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.workingToColorSpace($t.copy(this),t);let r=$t.r,i=$t.g,a=$t.b,n=Math.max(r,i,a),s=Math.min(r,i,a),o,l,u=(s+n)/2;if(s===n)o=0,l=0;else{let h=n-s;switch(l=u<=.5?h/(n+s):h/(2-n-s),n){case r:o=(i-a)/h+(i<a?6:0);break;case i:o=(a-r)/h+2;break;case a:o=(r-i)/h+4;break}o/=6}return e.h=o,e.s=l,e.l=u,e}getRGB(e,t=dt.workingColorSpace){return dt.workingToColorSpace($t.copy(this),t),e.r=$t.r,e.g=$t.g,e.b=$t.b,e}getStyle(e=xr){dt.workingToColorSpace($t.copy(this),e);let t=$t.r,r=$t.g,i=$t.b;return e!==xr?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(i*255)})`}offsetHSL(e,t,r){return this.getHSL(fi),this.setHSL(fi.h+e,fi.s+t,fi.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(fi),e.getHSL(Rn);let r=Bs(fi.h,Rn.h,t),i=Bs(fi.s,Rn.s,t),a=Bs(fi.l,Rn.l,t);return this.setHSL(r,i,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,r=this.g,i=this.b,a=e.elements;return this.r=a[0]*t+a[3]*r+a[6]*i,this.g=a[1]*t+a[4]*r+a[7]*i,this.b=a[2]*t+a[5]*r+a[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},$t=new lt;lt.NAMES=Fh;var vl=class extends si{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Za,this.environmentIntensity=1,this.environmentRotation=new Za,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Rr=new z,Zr=new z,js=new z,$r=new z,ta=new z,ra=new z,wu=new z,Ys=new z,Ks=new z,Js=new z,Zs=new Pt,$s=new Pt,Qs=new Pt,Oa=class da{constructor(t=new z,r=new z,i=new z){this.a=t,this.b=r,this.c=i}static getNormal(t,r,i,a){a.subVectors(i,r),Rr.subVectors(t,r),a.cross(Rr);let n=a.lengthSq();return n>0?a.multiplyScalar(1/Math.sqrt(n)):a.set(0,0,0)}static getBarycoord(t,r,i,a,n){Rr.subVectors(a,r),Zr.subVectors(i,r),js.subVectors(t,r);let s=Rr.dot(Rr),o=Rr.dot(Zr),l=Rr.dot(js),u=Zr.dot(Zr),h=Zr.dot(js),d=s*u-o*o;if(d===0)return n.set(0,0,0),null;let c=1/d,f=(u*l-o*h)*c,g=(s*h-o*l)*c;return n.set(1-f-g,g,f)}static containsPoint(t,r,i,a){return this.getBarycoord(t,r,i,a,$r)===null?!1:$r.x>=0&&$r.y>=0&&$r.x+$r.y<=1}static getInterpolation(t,r,i,a,n,s,o,l){return this.getBarycoord(t,r,i,a,$r)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(n,$r.x),l.addScaledVector(s,$r.y),l.addScaledVector(o,$r.z),l)}static getInterpolatedAttribute(t,r,i,a,n,s){return Zs.setScalar(0),$s.setScalar(0),Qs.setScalar(0),Zs.fromBufferAttribute(t,r),$s.fromBufferAttribute(t,i),Qs.fromBufferAttribute(t,a),s.setScalar(0),s.addScaledVector(Zs,n.x),s.addScaledVector($s,n.y),s.addScaledVector(Qs,n.z),s}static isFrontFacing(t,r,i,a){return Rr.subVectors(i,r),Zr.subVectors(t,r),Rr.cross(Zr).dot(a)<0}set(t,r,i){return this.a.copy(t),this.b.copy(r),this.c.copy(i),this}setFromPointsAndIndices(t,r,i,a){return this.a.copy(t[r]),this.b.copy(t[i]),this.c.copy(t[a]),this}setFromAttributeAndIndices(t,r,i,a){return this.a.fromBufferAttribute(t,r),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,a),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Rr.subVectors(this.c,this.b),Zr.subVectors(this.a,this.b),Rr.cross(Zr).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return da.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,r){return da.getBarycoord(t,this.a,this.b,this.c,r)}getInterpolation(t,r,i,a,n){return da.getInterpolation(t,this.a,this.b,this.c,r,i,a,n)}containsPoint(t){return da.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return da.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,r){let i=this.a,a=this.b,n=this.c,s,o;ta.subVectors(a,i),ra.subVectors(n,i),Ys.subVectors(t,i);let l=ta.dot(Ys),u=ra.dot(Ys);if(l<=0&&u<=0)return r.copy(i);Ks.subVectors(t,a);let h=ta.dot(Ks),d=ra.dot(Ks);if(h>=0&&d<=h)return r.copy(a);let c=l*d-h*u;if(c<=0&&l>=0&&h<=0)return s=l/(l-h),r.copy(i).addScaledVector(ta,s);Js.subVectors(t,n);let f=ta.dot(Js),g=ra.dot(Js);if(g>=0&&f<=g)return r.copy(n);let v=f*u-l*g;if(v<=0&&u>=0&&g<=0)return o=u/(u-g),r.copy(i).addScaledVector(ra,o);let m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return wu.subVectors(n,a),o=(d-h)/(d-h+(f-g)),r.copy(a).addScaledVector(wu,o);let p=1/(m+v+c);return s=v*p,o=c*p,r.copy(i).addScaledVector(ta,s).addScaledVector(ra,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},rn=class{constructor(e=new z(1/0,1/0,1/0),t=new z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(Cr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(Cr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let r=Cr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let r=e.geometry;if(r!==void 0){let a=r.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let n=0,s=a.count;n<s;n++)e.isMesh===!0?e.getVertexPosition(n,Cr):Cr.fromBufferAttribute(a,n),Cr.applyMatrix4(e.matrixWorld),this.expandByPoint(Cr);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Cn.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),Cn.copy(r.boundingBox)),Cn.applyMatrix4(e.matrixWorld),this.union(Cn)}let i=e.children;for(let a=0,n=i.length;a<n;a++)this.expandByObject(i[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Cr),Cr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Fa),Pn.subVectors(this.max,Fa),ia.subVectors(e.a,Fa),aa.subVectors(e.b,Fa),na.subVectors(e.c,Fa),mi.subVectors(aa,ia),gi.subVectors(na,aa),Ri.subVectors(ia,na);let t=[0,-mi.z,mi.y,0,-gi.z,gi.y,0,-Ri.z,Ri.y,mi.z,0,-mi.x,gi.z,0,-gi.x,Ri.z,0,-Ri.x,-mi.y,mi.x,0,-gi.y,gi.x,0,-Ri.y,Ri.x,0];return!eo(t,ia,aa,na,Pn)||(t=[1,0,0,0,1,0,0,0,1],!eo(t,ia,aa,na,Pn))?!1:(Ln.crossVectors(mi,gi),t=[Ln.x,Ln.y,Ln.z],eo(t,ia,aa,na,Pn))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Cr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Cr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Qr=[new z,new z,new z,new z,new z,new z,new z,new z],Cr=new z,Cn=new rn,ia=new z,aa=new z,na=new z,mi=new z,gi=new z,Ri=new z,Fa=new z,Pn=new z,Ln=new z,Ci=new z;function eo(e,t,r,i,a){for(let n=0,s=e.length-3;n<=s;n+=3){Ci.fromArray(e,n);let o=a.x*Math.abs(Ci.x)+a.y*Math.abs(Ci.y)+a.z*Math.abs(Ci.z),l=t.dot(Ci),u=r.dot(Ci),h=i.dot(Ci);if(Math.max(-Math.max(l,u,h),Math.min(l,u,h))>o)return!1}return!0}var Vt=new z,Nn=new Me,Sp=0,ai=class extends ki{constructor(e,t,r=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Sp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=ep,this.updateRanges=[],this.gpuType=Br,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let i=0,a=this.itemSize;i<a;i++)this.array[e+i]=t.array[r+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)Nn.fromBufferAttribute(this,t),Nn.applyMatrix3(e),this.setXY(t,Nn.x,Nn.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)Vt.fromBufferAttribute(this,t),Vt.applyMatrix3(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)Vt.fromBufferAttribute(this,t),Vt.applyMatrix4(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)Vt.fromBufferAttribute(this,t),Vt.applyNormalMatrix(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)Vt.fromBufferAttribute(this,t),Vt.transformDirection(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=Ua(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=ar(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ua(t,this.array)),t}setX(e,t){return this.normalized&&(t=ar(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ua(t,this.array)),t}setY(e,t){return this.normalized&&(t=ar(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ua(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ar(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ua(t,this.array)),t}setW(e,t){return this.normalized&&(t=ar(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=ar(t,this.array),r=ar(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,i){return e*=this.itemSize,this.normalized&&(t=ar(t,this.array),r=ar(r,this.array),i=ar(i,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=i,this}setXYZW(e,t,r,i,a){return e*=this.itemSize,this.normalized&&(t=ar(t,this.array),r=ar(r,this.array),i=ar(i,this.array),a=ar(a,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=i,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}},zh=class extends ai{constructor(e,t,r){super(new Uint16Array(e),t,r)}},Bh=class extends ai{constructor(e,t,r){super(new Uint32Array(e),t,r)}},Dr=class extends ai{constructor(e,t,r){super(new Float32Array(e),t,r)}},yp=new rn,za=new z,to=new z,xl=class{constructor(e=new z,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let r=this.center;t!==void 0?r.copy(t):yp.setFromPoints(e).getCenter(r);let i=0;for(let a=0,n=e.length;a<n;a++)i=Math.max(i,r.distanceToSquared(e[a]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;za.subVectors(e,this.center);let t=za.lengthSq();if(t>this.radius*this.radius){let r=Math.sqrt(t),i=(r-this.radius)*.5;this.center.addScaledVector(za,i/r),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(to.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(za.copy(e.center).add(to)),this.expandByPoint(za.copy(e.center).sub(to))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Mp=0,vr=new Wt,ro=new si,sa=new z,hr=new rn,Ba=new rn,jt=new z,Si=class kh extends ki{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Mp++}),this.uuid=ya(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(tp(t)?Bh:zh)(t,1):this.index=t,this}setIndirect(t,r=0){return this.indirect=t,this.indirectOffset=r,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,r){return this.attributes[t]=r,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,r,i=0){this.groups.push({start:t,count:r,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,r){this.drawRange.start=t,this.drawRange.count=r}applyMatrix4(t){let r=this.attributes.position;r!==void 0&&(r.applyMatrix4(t),r.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let n=new at().getNormalMatrix(t);i.applyNormalMatrix(n),i.needsUpdate=!0}let a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(t),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return vr.makeRotationFromQuaternion(t),this.applyMatrix4(vr),this}rotateX(t){return vr.makeRotationX(t),this.applyMatrix4(vr),this}rotateY(t){return vr.makeRotationY(t),this.applyMatrix4(vr),this}rotateZ(t){return vr.makeRotationZ(t),this.applyMatrix4(vr),this}translate(t,r,i){return vr.makeTranslation(t,r,i),this.applyMatrix4(vr),this}scale(t,r,i){return vr.makeScale(t,r,i),this.applyMatrix4(vr),this}lookAt(t){return ro.lookAt(t),ro.updateMatrix(),this.applyMatrix4(ro.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(sa).negate(),this.translate(sa.x,sa.y,sa.z),this}setFromPoints(t){let r=this.getAttribute("position");if(r===void 0){let i=[];for(let a=0,n=t.length;a<n;a++){let s=t[a];i.push(s.x,s.y,s.z||0)}this.setAttribute("position",new Dr(i,3))}else{let i=Math.min(t.length,r.count);for(let a=0;a<i;a++){let n=t[a];r.setXYZ(a,n.x,n.y,n.z||0)}t.length>r.count&&Je("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),r.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new rn);let t=this.attributes.position,r=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new z(-1/0,-1/0,-1/0),new z(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),r)for(let i=0,a=r.length;i<a;i++){let n=r[i];hr.setFromBufferAttribute(n),this.morphTargetsRelative?(jt.addVectors(this.boundingBox.min,hr.min),this.boundingBox.expandByPoint(jt),jt.addVectors(this.boundingBox.max,hr.max),this.boundingBox.expandByPoint(jt)):(this.boundingBox.expandByPoint(hr.min),this.boundingBox.expandByPoint(hr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Qe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xl);let t=this.attributes.position,r=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new z,1/0);return}if(t){let i=this.boundingSphere.center;if(hr.setFromBufferAttribute(t),r)for(let n=0,s=r.length;n<s;n++){let o=r[n];Ba.setFromBufferAttribute(o),this.morphTargetsRelative?(jt.addVectors(hr.min,Ba.min),hr.expandByPoint(jt),jt.addVectors(hr.max,Ba.max),hr.expandByPoint(jt)):(hr.expandByPoint(Ba.min),hr.expandByPoint(Ba.max))}hr.getCenter(i);let a=0;for(let n=0,s=t.count;n<s;n++)jt.fromBufferAttribute(t,n),a=Math.max(a,i.distanceToSquared(jt));if(r)for(let n=0,s=r.length;n<s;n++){let o=r[n],l=this.morphTargetsRelative;for(let u=0,h=o.count;u<h;u++)jt.fromBufferAttribute(o,u),l&&(sa.fromBufferAttribute(t,u),jt.add(sa)),a=Math.max(a,i.distanceToSquared(jt))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&Qe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,r=this.attributes;if(t===null||r.position===void 0||r.normal===void 0||r.uv===void 0){Qe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=r.position,a=r.normal,n=r.uv,s=this.getAttribute("tangent");(s===void 0||s.count!==i.count)&&(s=new ai(new Float32Array(4*i.count),4),this.setAttribute("tangent",s));let o=[],l=[];for(let _=0;_<i.count;_++)o[_]=new z,l[_]=new z;let u=new z,h=new z,d=new z,c=new Me,f=new Me,g=new Me,v=new z,m=new z;function p(_,T,H){u.fromBufferAttribute(i,_),h.fromBufferAttribute(i,T),d.fromBufferAttribute(i,H),c.fromBufferAttribute(n,_),f.fromBufferAttribute(n,T),g.fromBufferAttribute(n,H),h.sub(u),d.sub(u),f.sub(c),g.sub(c);let N=1/(f.x*g.y-g.x*f.y);isFinite(N)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(N),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(N),o[_].add(v),o[T].add(v),o[H].add(v),l[_].add(m),l[T].add(m),l[H].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let _=0,T=b.length;_<T;++_){let H=b[_],N=H.start,F=H.count;for(let q=N,A=N+F;q<A;q+=3)p(t.getX(q+0),t.getX(q+1),t.getX(q+2))}let w=new z,y=new z,E=new z,C=new z;function R(_){E.fromBufferAttribute(a,_),C.copy(E);let T=o[_];w.copy(T),w.sub(E.multiplyScalar(E.dot(T))).normalize(),y.crossVectors(C,T);let H=y.dot(l[_])<0?-1:1;s.setXYZW(_,w.x,w.y,w.z,H)}for(let _=0,T=b.length;_<T;++_){let H=b[_],N=H.start,F=H.count;for(let q=N,A=N+F;q<A;q+=3)R(t.getX(q+0)),R(t.getX(q+1)),R(t.getX(q+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,r=this.getAttribute("position");if(r!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==r.count)i=new ai(new Float32Array(r.count*3),3),this.setAttribute("normal",i);else for(let c=0,f=i.count;c<f;c++)i.setXYZ(c,0,0,0);let a=new z,n=new z,s=new z,o=new z,l=new z,u=new z,h=new z,d=new z;if(t)for(let c=0,f=t.count;c<f;c+=3){let g=t.getX(c+0),v=t.getX(c+1),m=t.getX(c+2);a.fromBufferAttribute(r,g),n.fromBufferAttribute(r,v),s.fromBufferAttribute(r,m),h.subVectors(s,n),d.subVectors(a,n),h.cross(d),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,v),u.fromBufferAttribute(i,m),o.add(h),l.add(h),u.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(m,u.x,u.y,u.z)}else for(let c=0,f=r.count;c<f;c+=3)a.fromBufferAttribute(r,c+0),n.fromBufferAttribute(r,c+1),s.fromBufferAttribute(r,c+2),h.subVectors(s,n),d.subVectors(a,n),h.cross(d),i.setXYZ(c+0,h.x,h.y,h.z),i.setXYZ(c+1,h.x,h.y,h.z),i.setXYZ(c+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let r=0,i=t.count;r<i;r++)jt.fromBufferAttribute(t,r),jt.normalize(),t.setXYZ(r,jt.x,jt.y,jt.z)}toNonIndexed(){function t(o,l){let u=o.array,h=o.itemSize,d=o.normalized,c=new u.constructor(l.length*h),f=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*h;for(let p=0;p<h;p++)c[g++]=u[f++]}return new ai(c,h,d)}if(this.index===null)return Je("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let r=new kh,i=this.index.array,a=this.attributes;for(let o in a){let l=a[o],u=t(l,i);r.setAttribute(o,u)}let n=this.morphAttributes;for(let o in n){let l=[],u=n[o];for(let h=0,d=u.length;h<d;h++){let c=u[h],f=t(c,i);l.push(f)}r.morphAttributes[o]=l}r.morphTargetsRelative=this.morphTargetsRelative;let s=this.groups;for(let o=0,l=s.length;o<l;o++){let u=s[o];r.addGroup(u.start,u.count,u.materialIndex)}return r}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let u in l)l[u]!==void 0&&(t[u]=l[u]);return t}t.data={attributes:{}};let r=this.index;r!==null&&(t.data.index={type:r.array.constructor.name,array:Array.prototype.slice.call(r.array)});let i=this.attributes;for(let l in i){let u=i[l];t.data.attributes[l]=u.toJSON(t.data)}let a={},n=!1;for(let l in this.morphAttributes){let u=this.morphAttributes[l],h=[];for(let d=0,c=u.length;d<c;d++){let f=u[d];h.push(f.toJSON(t.data))}h.length>0&&(a[l]=h,n=!0)}n&&(t.data.morphAttributes=a,t.data.morphTargetsRelative=this.morphTargetsRelative);let s=this.groups;s.length>0&&(t.data.groups=JSON.parse(JSON.stringify(s)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let r={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let a=t.attributes;for(let u in a){let h=a[u];this.setAttribute(u,h.clone(r))}let n=t.morphAttributes;for(let u in n){let h=[],d=n[u];for(let c=0,f=d.length;c<f;c++)h.push(d[c].clone(r));this.morphAttributes[u]=h}this.morphTargetsRelative=t.morphTargetsRelative;let s=t.groups;for(let u=0,h=s.length;u<h;u++){let d=s[u];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},io=new z,Tp=new z,Ep=new at,vi=class{constructor(e=new z(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,i){return this.normal.set(e,t,r),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){let i=io.subVectors(r,t).cross(Tp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,r=!0){let i=e.delta(io),a=this.normal.dot(i);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let n=-(e.start.dot(this.normal)+this.constant)/a;return r===!0&&(n<0||n>1)?null:t.copy(e.start).addScaledVector(i,n)}intersectsLine(e){let t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let r=t||Ep.getNormalMatrix(e),i=this.coplanarPoint(io).applyMatrix4(e),a=this.normal.applyMatrix3(r).normalize();return this.constant=-i.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},bp=0,ps=class extends ki{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:bp++}),this.uuid=ya(),this.name="",this.type="Material",this.blending=Xa,this.side=Oi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=hh,this.blendDst=ch,this.blendEquation=ca,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new lt(0,0,0),this.blendAlpha=0,this.depthFunc=Ya,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fs,this.stencilZFail=Fs,this.stencilZPass=Fs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let r=e[t];if(r===void 0){Je(`Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){Je(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(r):i&&i.isVector2&&r&&r.isVector2||i&&i.isEuler&&r&&r.isEuler||i&&i.isVector3&&r&&r.isVector3?i.copy(r):this[t]=r}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let r={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,r.blending=this.blending,r.side=this.side,r.shadowSide=this.shadowSide,r.vertexColors=this.vertexColors,r.opacity=this.opacity,r.transparent=this.transparent,r.blendSrc=this.blendSrc,r.blendDst=this.blendDst,r.blendEquation=this.blendEquation,r.blendSrcAlpha=this.blendSrcAlpha,r.blendDstAlpha=this.blendDstAlpha,r.blendEquationAlpha=this.blendEquationAlpha,r.blendColor=this.blendColor.getHex(),r.blendAlpha=this.blendAlpha,r.depthFunc=this.depthFunc,r.depthTest=this.depthTest,r.depthWrite=this.depthWrite,r.colorWrite=this.colorWrite,r.clipIntersection=this.clipIntersection,r.clipShadows=this.clipShadows,r.stencilWriteMask=this.stencilWriteMask,r.stencilFunc=this.stencilFunc,r.stencilRef=this.stencilRef,r.stencilFuncMask=this.stencilFuncMask,r.stencilFail=this.stencilFail,r.stencilZFail=this.stencilZFail,r.stencilZPass=this.stencilZPass,r.stencilWrite=this.stencilWrite,r.polygonOffset=this.polygonOffset,r.polygonOffsetFactor=this.polygonOffsetFactor,r.polygonOffsetUnits=this.polygonOffsetUnits,r.dithering=this.dithering,r.alphaTest=this.alphaTest,r.alphaHash=this.alphaHash,r.alphaToCoverage=this.alphaToCoverage,r.premultipliedAlpha=this.premultipliedAlpha,r.forceSinglePass=this.forceSinglePass,r.allowOverride=this.allowOverride,r.visible=this.visible,r.toneMapped=this.toneMapped,r.name=this.name,this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(r.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(r.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(r.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(r.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(r.rotation=this.rotation),this.depthPacking!==void 0&&(r.depthPacking=this.depthPacking),this.linewidth!==void 0&&(r.linewidth=this.linewidth),this.linecap!==void 0&&(r.linecap=this.linecap),this.linejoin!==void 0&&(r.linejoin=this.linejoin),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.wireframe!==void 0&&(r.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(r.flatShading=this.flatShading),this.fog!==void 0&&(r.fog=this.fog),Object.keys(this.userData).length>0&&(r.userData=this.userData);function i(a){let n=[];for(let s in a){let o=a[s];delete o.metadata,n.push(o)}return n}if(t){let a=i(e.textures),n=i(e.images);a.length>0&&(r.textures=a),n.length>0&&(r.images=n)}return r}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new lt().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(r=>new vi().fromJSON(r))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let r=e.normalScale;Array.isArray(r)===!1&&(r=[r,r]),this.normalScale=new Me().fromArray(r)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Me().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,r=null;if(t!==null){let i=t.length;r=new Array(i);for(let a=0;a!==i;++a)r[a]=t[a].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ei=new z,ao=new z,Dn=new z,Un=new z,wp=class{constructor(e=new z,t=new z(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ei.copy(this.origin).addScaledVector(this.direction,t),ei.distanceToSquared(e))}distanceSqToSegment(e,t,r,i){ao.copy(e).add(t).multiplyScalar(.5),Dn.copy(t).sub(e).normalize(),Un.copy(this.origin).sub(ao);let a=e.distanceTo(t)*.5,n=-this.direction.dot(Dn),s=Un.dot(this.direction),o=-Un.dot(Dn),l=Un.lengthSq(),u=Math.abs(1-n*n),h,d,c,f;if(u>0)if(h=n*o-s,d=n*s-o,f=a*u,h>=0)if(d>=-f)if(d<=f){let g=1/u;h*=g,d*=g,c=h*(h+n*d+2*s)+d*(n*h+d+2*o)+l}else d=a,h=Math.max(0,-(n*d+s)),c=-h*h+d*(d+2*o)+l;else d=-a,h=Math.max(0,-(n*d+s)),c=-h*h+d*(d+2*o)+l;else d<=-f?(h=Math.max(0,-(-n*a+s)),d=h>0?-a:Math.min(Math.max(-a,-o),a),c=-h*h+d*(d+2*o)+l):d<=f?(h=0,d=Math.min(Math.max(-a,-o),a),c=d*(d+2*o)+l):(h=Math.max(0,-(n*a+s)),d=h>0?a:Math.min(Math.max(-a,-o),a),c=-h*h+d*(d+2*o)+l);else d=n>0?-a:a,h=Math.max(0,-(n*d+s)),c=-h*h+d*(d+2*o)+l;return r&&r.copy(this.origin).addScaledVector(this.direction,h),i&&i.copy(ao).addScaledVector(Dn,d),c}intersectSphere(e,t){if(e.radius<0)return null;ei.subVectors(e.center,this.origin);let r=ei.dot(this.direction),i=ei.dot(ei)-r*r,a=e.radius*e.radius;if(i>a)return null;let n=Math.sqrt(a-i),s=r-n,o=r+n;return o<0?null:s<0?this.at(o,t):this.at(s,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){let r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,i,a,n,s,o,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(r=(e.min.x-d.x)*l,i=(e.max.x-d.x)*l):(r=(e.max.x-d.x)*l,i=(e.min.x-d.x)*l),u>=0?(a=(e.min.y-d.y)*u,n=(e.max.y-d.y)*u):(a=(e.max.y-d.y)*u,n=(e.min.y-d.y)*u),r>n||a>i||((a>r||isNaN(r))&&(r=a),(n<i||isNaN(i))&&(i=n),h>=0?(s=(e.min.z-d.z)*h,o=(e.max.z-d.z)*h):(s=(e.max.z-d.z)*h,o=(e.min.z-d.z)*h),r>o||s>i)||((s>r||r!==r)&&(r=s),(o<i||i!==i)&&(i=o),i<0)?null:this.at(r>=0?r:i,t)}intersectsBox(e){return this.intersectBox(e,ei)!==null}intersectTriangle(e,t,r,i,a){let n=this.origin,s=this.direction,o=s.x,l=s.y,u=s.z,h=e.x-n.x,d=e.y-n.y,c=e.z-n.z,f=t.x-n.x,g=t.y-n.y,v=t.z-n.z,m=r.x-n.x,p=r.y-n.y,b=r.z-n.z,w=Math.abs(o),y=Math.abs(l),E=Math.abs(u),C,R,_,T,H,N,F,q,A,O,j,G;if(w>=y&&w>=E?(_=o,N=h,A=f,G=m,o>=0?(C=l,R=u,T=d,H=c,F=g,q=v,O=p,j=b):(C=u,R=l,T=c,H=d,F=v,q=g,O=b,j=p)):y>=E?(_=l,N=d,A=g,G=p,l>=0?(C=u,R=o,T=c,H=h,F=v,q=f,O=b,j=m):(C=o,R=u,T=h,H=c,F=f,q=v,O=m,j=b)):(_=u,N=c,A=v,G=b,u>=0?(C=o,R=l,T=h,H=d,F=f,q=g,O=m,j=p):(C=l,R=o,T=d,H=h,F=g,q=f,O=p,j=m)),_===0)return null;let ce=C/_,X=R/_,Y=1/_,ee=T-ce*N,Ge=H-X*N,we=F-ce*A,gt=q-X*A,Ze=O-ce*G,J=j-X*G,re=Ze*gt-J*we,oe=ee*J-Ge*Ze,Pe=we*Ge-gt*ee;if(i){if(re<0||oe<0||Pe<0)return null}else if((re<0||oe<0||Pe<0)&&(re>0||oe>0||Pe>0))return null;let Ne=re+oe+Pe;if(Ne===0)return null;let pe=Y*(re*N+oe*A+Pe*G);return(Ne>0?pe<0:pe>0)?null:this.at(pe/Ne,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Vh=class extends ps{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new lt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Za,this.combine=dh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Au=new Wt,Pi=new wp,In=new xl,Ru=new z,On=new z,Fn=new z,zn=new z,no=new z,Bn=new z,Cu=new z,kn=new z,sr=class extends si{constructor(e=new Si,t=new Vh){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let r=e[t[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,a=r.length;i<a;i++){let n=r[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[n]=i}}}}getVertexPosition(e,t){let r=this.geometry,i=r.attributes.position,a=r.morphAttributes.position,n=r.morphTargetsRelative;t.fromBufferAttribute(i,e);let s=this.morphTargetInfluences;if(a&&s){Bn.set(0,0,0);for(let o=0,l=a.length;o<l;o++){let u=s[o],h=a[o];u!==0&&(no.fromBufferAttribute(h,e),n?Bn.addScaledVector(no,u):Bn.addScaledVector(no.sub(t),u))}t.add(Bn)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let r=this.geometry,i=this.material,a=this.matrixWorld;i!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),In.copy(r.boundingSphere),In.applyMatrix4(a),Pi.copy(e.ray).recast(e.near),!(In.containsPoint(Pi.origin)===!1&&(Pi.intersectSphere(In,Ru)===null||Pi.origin.distanceToSquared(Ru)>(e.far-e.near)**2))&&(Au.copy(a).invert(),Pi.copy(e.ray).applyMatrix4(Au),!(r.boundingBox!==null&&Pi.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,Pi)))}_computeIntersections(e,t,r){let i,a=this.geometry,n=this.material,s=a.index,o=a.attributes.position,l=a.attributes.uv,u=a.attributes.uv1,h=a.attributes.normal,d=a.groups,c=a.drawRange;if(s!==null)if(Array.isArray(n))for(let f=0,g=d.length;f<g;f++){let v=d[f],m=n[v.materialIndex],p=Math.max(v.start,c.start),b=Math.min(s.count,Math.min(v.start+v.count,c.start+c.count));for(let w=p,y=b;w<y;w+=3){let E=s.getX(w),C=s.getX(w+1),R=s.getX(w+2);i=Vn(this,m,e,r,l,u,h,E,C,R),i&&(i.faceIndex=Math.floor(w/3),i.face.materialIndex=v.materialIndex,t.push(i))}}else{let f=Math.max(0,c.start),g=Math.min(s.count,c.start+c.count);for(let v=f,m=g;v<m;v+=3){let p=s.getX(v),b=s.getX(v+1),w=s.getX(v+2);i=Vn(this,n,e,r,l,u,h,p,b,w),i&&(i.faceIndex=Math.floor(v/3),t.push(i))}}else if(o!==void 0)if(Array.isArray(n))for(let f=0,g=d.length;f<g;f++){let v=d[f],m=n[v.materialIndex],p=Math.max(v.start,c.start),b=Math.min(o.count,Math.min(v.start+v.count,c.start+c.count));for(let w=p,y=b;w<y;w+=3){let E=w,C=w+1,R=w+2;i=Vn(this,m,e,r,l,u,h,E,C,R),i&&(i.faceIndex=Math.floor(w/3),i.face.materialIndex=v.materialIndex,t.push(i))}}else{let f=Math.max(0,c.start),g=Math.min(o.count,c.start+c.count);for(let v=f,m=g;v<m;v+=3){let p=v,b=v+1,w=v+2;i=Vn(this,n,e,r,l,u,h,p,b,w),i&&(i.faceIndex=Math.floor(v/3),t.push(i))}}}};function Ap(e,t,r,i,a,n,s,o){let l;if(t.side===nr?l=i.intersectTriangle(s,n,a,!0,o):l=i.intersectTriangle(a,n,s,t.side===Oi,o),l===null)return null;kn.copy(o),kn.applyMatrix4(e.matrixWorld);let u=r.ray.origin.distanceTo(kn);return u<r.near||u>r.far?null:{distance:u,point:kn.clone(),object:e}}function Vn(e,t,r,i,a,n,s,o,l,u){e.getVertexPosition(o,On),e.getVertexPosition(l,Fn),e.getVertexPosition(u,zn);let h=Ap(e,t,r,i,On,Fn,zn,Cu);if(h){let d=new z;Oa.getBarycoord(Cu,On,Fn,zn,d),a&&(h.uv=Oa.getInterpolatedAttribute(a,o,l,u,d,new Me)),n&&(h.uv1=Oa.getInterpolatedAttribute(n,o,l,u,d,new Me)),s&&(h.normal=Oa.getInterpolatedAttribute(s,o,l,u,d,new z),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let c={a:o,b:l,c:u,normal:new z,materialIndex:0};Oa.getNormal(On,Fn,zn,c.normal),h.face=c,h.barycoord=d}return h}var Rp=class extends yr{constructor(e=null,t=1,r=1,i,a,n,s,o,l=Yt,u=Yt,h,d){super(null,n,s,o,l,u,i,a,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Li=new xl,Cp=new Me(.5,.5),Hn=new z,Hh=class{constructor(e=new vi,t=new vi,r=new vi,i=new vi,a=new vi,n=new vi){this.planes=[e,t,r,i,a,n]}set(e,t,r,i,a,n){let s=this.planes;return s[0].copy(e),s[1].copy(t),s[2].copy(r),s[3].copy(i),s[4].copy(a),s[5].copy(n),this}copy(e){let t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=kr,r=!1){let i=this.planes,a=e.elements,n=a[0],s=a[1],o=a[2],l=a[3],u=a[4],h=a[5],d=a[6],c=a[7],f=a[8],g=a[9],v=a[10],m=a[11],p=a[12],b=a[13],w=a[14],y=a[15];if(i[0].setComponents(l-n,c-u,m-f,y-p).normalize(),i[1].setComponents(l+n,c+u,m+f,y+p).normalize(),i[2].setComponents(l+s,c+h,m+g,y+b).normalize(),i[3].setComponents(l-s,c-h,m-g,y-b).normalize(),r)i[4].setComponents(o,d,v,w).normalize(),i[5].setComponents(l-o,c-d,m-v,y-w).normalize();else if(i[4].setComponents(l-o,c-d,m-v,y-w).normalize(),t===kr)i[5].setComponents(l+o,c+d,m+v,y+w).normalize();else if(t===us)i[5].setComponents(o,d,v,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Li.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Li.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Li)}intersectsSprite(e){Li.center.set(0,0,0);let t=Cp.distanceTo(e.center);return Li.radius=.7071067811865476+t,Li.applyMatrix4(e.matrixWorld),this.intersectsSphere(Li)}intersectsSphere(e){let t=this.planes,r=e.center,i=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(r)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let r=0;r<6;r++){let i=t[r];if(Hn.x=i.normal.x>0?e.max.x:e.min.x,Hn.y=i.normal.y>0?e.max.y:e.min.y,Hn.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Hn)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Gh=class extends yr{constructor(e=[],t=Fi,r,i,a,n,s,o,l,u){super(e,t,r,i,a,n,s,o,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Wh=class extends yr{constructor(e,t,r,i,a,n,s,o,l){super(e,t,r,i,a,n,s,o,l),this.isCanvasTexture=!0,this.needsUpdate=!0}},$a=class extends yr{constructor(e,t,r=Hr,i,a,n,s=Yt,o=Yt,l,u=ni,h=1){if(u!==ni&&u!==Ui)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:h};super(d,i,a,n,s,o,u,r,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new _l(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Pp=class extends $a{constructor(e,t=Hr,r=Fi,i,a,n=Yt,s=Yt,o,l=ni){let u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,r,i,a,n,s,o,l),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Xh=class extends yr{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Sl=class qh extends Si{constructor(t=1,r=1,i=1,a=1,n=1,s=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:r,depth:i,widthSegments:a,heightSegments:n,depthSegments:s};let o=this;a=Math.floor(a),n=Math.floor(n),s=Math.floor(s);let l=[],u=[],h=[],d=[],c=0,f=0;g("z","y","x",-1,-1,i,r,t,s,n,0),g("z","y","x",1,-1,i,r,-t,s,n,1),g("x","z","y",1,1,t,i,r,a,s,2),g("x","z","y",1,-1,t,i,-r,a,s,3),g("x","y","z",1,-1,t,r,i,a,n,4),g("x","y","z",-1,-1,t,r,-i,a,n,5),this.setIndex(l),this.setAttribute("position",new Dr(u,3)),this.setAttribute("normal",new Dr(h,3)),this.setAttribute("uv",new Dr(d,2));function g(v,m,p,b,w,y,E,C,R,_,T){let H=y/R,N=E/_,F=y/2,q=E/2,A=C/2,O=R+1,j=_+1,G=0,ce=0,X=new z;for(let Y=0;Y<j;Y++){let ee=Y*N-q;for(let Ge=0;Ge<O;Ge++){let we=Ge*H-F;X[v]=we*b,X[m]=ee*w,X[p]=A,u.push(X.x,X.y,X.z),X[v]=0,X[m]=0,X[p]=C>0?1:-1,h.push(X.x,X.y,X.z),d.push(Ge/R),d.push(1-Y/_),G+=1}}for(let Y=0;Y<_;Y++)for(let ee=0;ee<R;ee++){let Ge=c+ee+O*Y,we=c+ee+O*(Y+1),gt=c+(ee+1)+O*(Y+1),Ze=c+(ee+1)+O*Y;l.push(Ge,we,Ze),l.push(we,gt,Ze),ce+=6}o.addGroup(f,ce,T),f+=ce,c+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qh(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Wr=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Je("Curve: .getPoint() not implemented.")}getPointAt(e,t){let r=this.getUtoTmapping(e);return this.getPoint(r,t)}getPoints(e=5){let t=[];for(let r=0;r<=e;r++)t.push(this.getPoint(r/e));return t}getSpacedPoints(e=5){let t=[];for(let r=0;r<=e;r++)t.push(this.getPointAt(r/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],r,i=this.getPoint(0),a=0;t.push(0);for(let n=1;n<=e;n++)r=this.getPoint(n/e),a+=r.distanceTo(i),t.push(a),i=r;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let r=this.getLengths(),i=0,a=r.length,n;t?n=t:n=e*r[a-1];let s=0,o=a-1,l;for(;s<=o;)if(i=Math.floor(s+(o-s)/2),l=r[i]-n,l<0)s=i+1;else if(l>0)o=i-1;else{o=i;break}if(i=o,r[i]===n)return i/(a-1);let u=r[i],h=r[i+1]-u,d=(n-u)/h;return(i+d)/(a-1)}getTangent(e,t){let r=e-1e-4,i=e+1e-4;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),n=this.getPoint(i),s=t||(a.isVector2?new Me:new z);return s.copy(n).sub(a).normalize(),s}getTangentAt(e,t){let r=this.getUtoTmapping(e);return this.getTangent(r,t)}computeFrenetFrames(e,t=!1){let r=new z,i=[],a=[],n=[],s=new z,o=new Wt;for(let c=0;c<=e;c++){let f=c/e;i[c]=this.getTangentAt(f,new z)}a[0]=new z,n[0]=new z;let l=Number.MAX_VALUE,u=Math.abs(i[0].x),h=Math.abs(i[0].y),d=Math.abs(i[0].z);u<=l&&(l=u,r.set(1,0,0)),h<=l&&(l=h,r.set(0,1,0)),d<=l&&r.set(0,0,1),s.crossVectors(i[0],r).normalize(),a[0].crossVectors(i[0],s),n[0].crossVectors(i[0],a[0]);for(let c=1;c<=e;c++){if(a[c]=a[c-1].clone(),n[c]=n[c-1].clone(),s.crossVectors(i[c-1],i[c]),s.length()>Number.EPSILON){s.normalize();let f=Math.acos(ct(i[c-1].dot(i[c]),-1,1));a[c].applyMatrix4(o.makeRotationAxis(s,f))}n[c].crossVectors(i[c],a[c])}if(t===!0){let c=Math.acos(ct(a[0].dot(a[e]),-1,1));c/=e,i[0].dot(s.crossVectors(a[0],a[e]))>0&&(c=-c);for(let f=1;f<=e;f++)a[f].applyMatrix4(o.makeRotationAxis(i[f],c*f)),n[f].crossVectors(i[f],a[f])}return{tangents:i,normals:a,binormals:n}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},yl=class extends Wr{constructor(e=0,t=0,r=1,i=1,a=0,n=Math.PI*2,s=!1,o=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=r,this.yRadius=i,this.aStartAngle=a,this.aEndAngle=n,this.aClockwise=s,this.aRotation=o}getPoint(e,t=new Me){let r=t,i=Math.PI*2,a=this.aEndAngle-this.aStartAngle,n=Math.abs(a)<Number.EPSILON;for(;a<0;)a+=i;for(;a>i;)a-=i;a<Number.EPSILON&&(n?a=0:a=i),this.aClockwise===!0&&!n&&(a===i?a=-i:a=a-i);let s=this.aStartAngle+e*a,o=this.aX+this.xRadius*Math.cos(s),l=this.aY+this.yRadius*Math.sin(s);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=o-this.aX,c=l-this.aY;o=d*u-c*h+this.aX,l=d*h+c*u+this.aY}return r.set(o,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Lp=class extends yl{constructor(e,t,r,i,a,n){super(e,t,r,r,i,a,n),this.isArcCurve=!0,this.type="ArcCurve"}};function Ml(){let e=0,t=0,r=0,i=0;function a(n,s,o,l){e=n,t=o,r=-3*n+3*s-2*o-l,i=2*n-2*s+o+l}return{initCatmullRom:function(n,s,o,l,u){a(s,o,u*(o-n),u*(l-s))},initNonuniformCatmullRom:function(n,s,o,l,u,h,d){let c=(s-n)/u-(o-n)/(u+h)+(o-s)/h,f=(o-s)/h-(l-s)/(h+d)+(l-o)/d;c*=h,f*=h,a(s,o,c,f)},calc:function(n){let s=n*n,o=s*n;return e+t*n+r*s+i*o}}}var Pu=new z,Lu=new z,so=new Ml,oo=new Ml,lo=new Ml,Np=class extends Wr{constructor(e=[],t=!1,r="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=r,this.tension=i}getPoint(e,t=new z){let r=t,i=this.points,a=i.length,n=(a-(this.closed?0:1))*e,s=Math.floor(n),o=n-s;this.closed?s+=s>0?0:(Math.floor(Math.abs(s)/a)+1)*a:o===0&&s===a-1&&(s=a-2,o=1);let l,u;this.closed||s>0?l=i[(s-1)%a]:(Lu.subVectors(i[0],i[1]).add(i[0]),l=Lu);let h=i[s%a],d=i[(s+1)%a];if(this.closed||s+2<a?u=i[(s+2)%a]:(Pu.subVectors(i[a-1],i[a-2]).add(i[a-1]),u=Pu),this.curveType==="centripetal"||this.curveType==="chordal"){let c=this.curveType==="chordal"?.5:.25,f=Math.pow(l.distanceToSquared(h),c),g=Math.pow(h.distanceToSquared(d),c),v=Math.pow(d.distanceToSquared(u),c);g<1e-4&&(g=1),f<1e-4&&(f=g),v<1e-4&&(v=g),so.initNonuniformCatmullRom(l.x,h.x,d.x,u.x,f,g,v),oo.initNonuniformCatmullRom(l.y,h.y,d.y,u.y,f,g,v),lo.initNonuniformCatmullRom(l.z,h.z,d.z,u.z,f,g,v)}else this.curveType==="catmullrom"&&(so.initCatmullRom(l.x,h.x,d.x,u.x,this.tension),oo.initCatmullRom(l.y,h.y,d.y,u.y,this.tension),lo.initCatmullRom(l.z,h.z,d.z,u.z,this.tension));return r.set(so.calc(o),oo.calc(o),lo.calc(o)),r}copy(e){super.copy(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,r=this.points.length;t<r;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){let i=e.points[t];this.points.push(new z().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Nu(e,t,r,i,a){let n=(i-t)*.5,s=(a-r)*.5,o=e*e,l=e*o;return(2*r-2*i+n+s)*l+(-3*r+3*i-2*n-s)*o+n*e+r}function Dp(e,t){let r=1-e;return r*r*t}function Up(e,t){return 2*(1-e)*e*t}function Ip(e,t){return e*e*t}function qa(e,t,r,i){return Dp(e,t)+Up(e,r)+Ip(e,i)}function Op(e,t){let r=1-e;return r*r*r*t}function Fp(e,t){let r=1-e;return 3*r*r*e*t}function zp(e,t){return 3*(1-e)*e*e*t}function Bp(e,t){return e*e*e*t}function ja(e,t,r,i,a){return Op(e,t)+Fp(e,r)+zp(e,i)+Bp(e,a)}var Hi=class extends Wr{constructor(e=new Me,t=new Me,r=new Me,i=new Me){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=r,this.v3=i}getPoint(e,t=new Me){let r=t,i=this.v0,a=this.v1,n=this.v2,s=this.v3;return r.set(ja(e,i.x,a.x,n.x,s.x),ja(e,i.y,a.y,n.y,s.y)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},kp=class extends Wr{constructor(e=new z,t=new z,r=new z,i=new z){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=r,this.v3=i}getPoint(e,t=new z){let r=t,i=this.v0,a=this.v1,n=this.v2,s=this.v3;return r.set(ja(e,i.x,a.x,n.x,s.x),ja(e,i.y,a.y,n.y,s.y),ja(e,i.z,a.z,n.z,s.z)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},jh=class extends Wr{constructor(e=new Me,t=new Me){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Me){let r=t;return e===1?r.copy(this.v2):(r.copy(this.v2).sub(this.v1),r.multiplyScalar(e).add(this.v1)),r}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Me){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Vp=class extends Wr{constructor(e=new z,t=new z){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new z){let r=t;return e===1?r.copy(this.v2):(r.copy(this.v2).sub(this.v1),r.multiplyScalar(e).add(this.v1)),r}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new z){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Yh=class extends Wr{constructor(e=new Me,t=new Me,r=new Me){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=r}getPoint(e,t=new Me){let r=t,i=this.v0,a=this.v1,n=this.v2;return r.set(qa(e,i.x,a.x,n.x),qa(e,i.y,a.y,n.y)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Hp=class extends Wr{constructor(e=new z,t=new z,r=new z){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=r}getPoint(e,t=new z){let r=t,i=this.v0,a=this.v1,n=this.v2;return r.set(qa(e,i.x,a.x,n.x),qa(e,i.y,a.y,n.y),qa(e,i.z,a.z,n.z)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Kh=class extends Wr{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Me){let r=t,i=this.points,a=(i.length-1)*e,n=Math.floor(a),s=a-n,o=i[n===0?n:n-1],l=i[n],u=i[n>i.length-2?i.length-1:n+1],h=i[n>i.length-3?i.length-1:n+2];return r.set(Nu(s,o.x,l.x,u.x,h.x),Nu(s,o.y,l.y,u.y,h.y)),r}copy(e){super.copy(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,r=this.points.length;t<r;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){let i=e.points[t];this.points.push(new Me().fromArray(i))}return this}},al=Object.freeze({__proto__:null,ArcCurve:Lp,CatmullRomCurve3:Np,CubicBezierCurve:Hi,CubicBezierCurve3:kp,EllipseCurve:yl,LineCurve:jh,LineCurve3:Vp,QuadraticBezierCurve:Yh,QuadraticBezierCurve3:Hp,SplineCurve:Kh}),Gp=class extends Wr{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let r=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new al[r](t,e))}return this}getPoint(e,t){let r=e*this.getLength(),i=this.getCurveLengths(),a=0;for(;a<i.length;){if(i[a]>=r){let n=i[a]-r,s=this.curves[a],o=s.getLength(),l=o===0?0:1-n/o;return s.getPointAt(l,t)}a++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let r=0,i=this.curves.length;r<i;r++)t+=this.curves[r].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let r=0;r<=e;r++)t.push(this.getPoint(r/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],r;for(let i=0,a=this.curves;i<a.length;i++){let n=a[i],s=n.isEllipseCurve?e*2:n.isLineCurve||n.isLineCurve3?1:n.isSplineCurve?e*n.points.length:e,o=n.getPoints(s);for(let l=0;l<o.length;l++){let u=o[l];r&&r.equals(u)||(t.push(u),r=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,r=e.curves.length;t<r;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,r=this.curves.length;t<r;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,r=e.curves.length;t<r;t++){let i=e.curves[t];this.curves.push(new al[i.type]().fromJSON(i))}return this}},Du=class extends Gp{constructor(e){super(),this.type="Path",this.currentPoint=new Me,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,r=e.length;t<r;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let r=new jh(this.currentPoint.clone(),new Me(e,t));return this.curves.push(r),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,r,i){let a=new Yh(this.currentPoint.clone(),new Me(e,t),new Me(r,i));return this.curves.push(a),this.currentPoint.set(r,i),this}bezierCurveTo(e,t,r,i,a,n){let s=new Hi(this.currentPoint.clone(),new Me(e,t),new Me(r,i),new Me(a,n));return this.curves.push(s),this.currentPoint.set(a,n),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),r=new Kh(t);return this.curves.push(r),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,r,i,a,n){let s=this.currentPoint.x,o=this.currentPoint.y;return this.absarc(e+s,t+o,r,i,a,n),this}absarc(e,t,r,i,a,n){return this.absellipse(e,t,r,r,i,a,n),this}ellipse(e,t,r,i,a,n,s,o){let l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,r,i,a,n,s,o),this}absellipse(e,t,r,i,a,n,s,o){let l=new yl(e,t,r,i,a,n,s,o);if(this.curves.length>0){let h=l.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(l);let u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Tl=class extends Du{constructor(e){super(e),this.uuid=ya(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let r=0,i=this.holes.length;r<i;r++)t[r]=this.holes[r].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,r=e.holes.length;t<r;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,r=this.holes.length;t<r;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,r=e.holes.length;t<r;t++){let i=e.holes[t];this.holes.push(new Du().fromJSON(i))}return this}};function Wp(e,t,r=2){let i=t&&t.length,a=i?t[0]*r:e.length,n=Jh(e,0,a,r,!0),s=[];if(!n||n.next===n.prev)return s;let o,l,u;if(i&&(n=Kp(e,t,n,r)),e.length>80*r){o=e[0],l=e[1];let h=o,d=l;for(let c=r;c<a;c+=r){let f=e[c],g=e[c+1];f<o&&(o=f),g<l&&(l=g),f>h&&(h=f),g>d&&(d=g)}u=Math.max(h-o,d-l),u=u!==0?32767/u:0}return Qa(n,s,r,o,l,u,0),s}function Jh(e,t,r,i,a){let n;if(a===of(e,t,r,i)>0)for(let s=t;s<r;s+=i)n=Uu(s/i|0,e[s],e[s+1],n);else for(let s=r-i;s>=t;s-=i)n=Uu(s/i|0,e[s],e[s+1],n);return n&&xa(n,n.next)&&(tn(n),n=n.next),n}function Bi(e,t){if(!e)return e;t||(t=e);let r=e,i;do if(i=!1,!r.steiner&&(xa(r,r.next)||Lt(r.prev,r,r.next)===0)){if(tn(r),r=t=r.prev,r===r.next)break;i=!0}else r=r.next;while(i||r!==t);return t}function Qa(e,t,r,i,a,n,s){if(!e)return;!s&&n&&ef(e,i,a,n);let o=e;for(;e.prev!==e.next;){let l=e.prev,u=e.next;if(n?qp(e,i,a,n):Xp(e)){t.push(l.i,e.i,u.i),tn(e),e=u.next,o=u.next;continue}if(e=u,e===o){s?s===1?(e=jp(Bi(e),t),Qa(e,t,r,i,a,n,2)):s===2&&Yp(e,t,r,i,a,n):Qa(Bi(e),t,r,i,a,n,1);break}}}function Xp(e){let t=e.prev,r=e,i=e.next;if(Lt(t,r,i)>=0)return!1;let a=t.x,n=r.x,s=i.x,o=t.y,l=r.y,u=i.y,h=Math.min(a,n,s),d=Math.min(o,l,u),c=Math.max(a,n,s),f=Math.max(o,l,u),g=i.next;for(;g!==t;){if(g.x>=h&&g.x<=c&&g.y>=d&&g.y<=f&&Ga(a,o,n,l,s,u,g.x,g.y)&&Lt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function qp(e,t,r,i){let a=e.prev,n=e,s=e.next;if(Lt(a,n,s)>=0)return!1;let o=a.x,l=n.x,u=s.x,h=a.y,d=n.y,c=s.y,f=Math.min(o,l,u),g=Math.min(h,d,c),v=Math.max(o,l,u),m=Math.max(h,d,c),p=nl(f,g,t,r,i),b=nl(v,m,t,r,i),w=e.prevZ,y=e.nextZ;for(;w&&w.z>=p&&y&&y.z<=b;){if(w.x>=f&&w.x<=v&&w.y>=g&&w.y<=m&&w!==a&&w!==s&&Ga(o,h,l,d,u,c,w.x,w.y)&&Lt(w.prev,w,w.next)>=0||(w=w.prevZ,y.x>=f&&y.x<=v&&y.y>=g&&y.y<=m&&y!==a&&y!==s&&Ga(o,h,l,d,u,c,y.x,y.y)&&Lt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;w&&w.z>=p;){if(w.x>=f&&w.x<=v&&w.y>=g&&w.y<=m&&w!==a&&w!==s&&Ga(o,h,l,d,u,c,w.x,w.y)&&Lt(w.prev,w,w.next)>=0)return!1;w=w.prevZ}for(;y&&y.z<=b;){if(y.x>=f&&y.x<=v&&y.y>=g&&y.y<=m&&y!==a&&y!==s&&Ga(o,h,l,d,u,c,y.x,y.y)&&Lt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function jp(e,t){let r=e;do{let i=r.prev,a=r.next.next;!xa(i,a)&&$h(i,r,r.next,a)&&en(i,a)&&en(a,i)&&(t.push(i.i,r.i,a.i),tn(r),tn(r.next),r=e=a),r=r.next}while(r!==e);return Bi(r)}function Yp(e,t,r,i,a,n){let s=e;do{let o=s.next.next;for(;o!==s.prev;){if(s.i!==o.i&&af(s,o)){let l=Qh(s,o);s=Bi(s,s.next),l=Bi(l,l.next),Qa(s,t,r,i,a,n,0),Qa(l,t,r,i,a,n,0);return}o=o.next}s=s.next}while(s!==e)}function Kp(e,t,r,i){let a=[];for(let n=0,s=t.length;n<s;n++){let o=t[n]*i,l=n<s-1?t[n+1]*i:e.length,u=Jh(e,o,l,i,!1);u===u.next&&(u.steiner=!0),a.push(rf(u))}a.sort(Jp);for(let n=0;n<a.length;n++)r=Zp(a[n],r);return r}function Jp(e,t){let r=e.x-t.x;if(r===0&&(r=e.y-t.y,r===0)){let i=(e.next.y-e.y)/(e.next.x-e.x),a=(t.next.y-t.y)/(t.next.x-t.x);r=i-a}return r}function Zp(e,t){let r=$p(e,t);if(!r)return t;let i=Qh(r,e);return Bi(i,i.next),Bi(r,r.next)}function $p(e,t){let r=t,i=e.x,a=e.y,n=-1/0,s;if(xa(e,r))return r;do{if(xa(e,r.next))return r.next;if(a<=r.y&&a>=r.next.y&&r.next.y!==r.y){let d=r.x+(a-r.y)*(r.next.x-r.x)/(r.next.y-r.y);if(d<=i&&d>n&&(n=d,s=r.x<r.next.x?r:r.next,d===i))return s}r=r.next}while(r!==t);if(!s)return null;let o=s,l=s.x,u=s.y,h=1/0;r=s;do{if(i>=r.x&&r.x>=l&&i!==r.x&&Zh(a<u?i:n,a,l,u,a<u?n:i,a,r.x,r.y)){let d=Math.abs(a-r.y)/(i-r.x);en(r,e)&&(d<h||d===h&&(r.x>s.x||r.x===s.x&&Qp(s,r)))&&(s=r,h=d)}r=r.next}while(r!==o);return s}function Qp(e,t){return Lt(e.prev,e,t.prev)<0&&Lt(t.next,e,e.next)<0}function ef(e,t,r,i){let a=e;do a.z===0&&(a.z=nl(a.x,a.y,t,r,i)),a.prevZ=a.prev,a.nextZ=a.next,a=a.next;while(a!==e);a.prevZ.nextZ=null,a.prevZ=null,tf(a)}function tf(e){let t,r=1;do{let i=e,a;e=null;let n=null;for(t=0;i;){t++;let s=i,o=0;for(let u=0;u<r&&(o++,s=s.nextZ,!!s);u++);let l=r;for(;o>0||l>0&&s;)o!==0&&(l===0||!s||i.z<=s.z)?(a=i,i=i.nextZ,o--):(a=s,s=s.nextZ,l--),n?n.nextZ=a:e=a,a.prevZ=n,n=a;i=s}n.nextZ=null,r*=2}while(t>1);return e}function nl(e,t,r,i,a){return e=(e-r)*a|0,t=(t-i)*a|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function rf(e){let t=e,r=e;do(t.x<r.x||t.x===r.x&&t.y<r.y)&&(r=t),t=t.next;while(t!==e);return r}function Zh(e,t,r,i,a,n,s,o){return(a-s)*(t-o)>=(e-s)*(n-o)&&(e-s)*(i-o)>=(r-s)*(t-o)&&(r-s)*(n-o)>=(a-s)*(i-o)}function Ga(e,t,r,i,a,n,s,o){return!(e===s&&t===o)&&Zh(e,t,r,i,a,n,s,o)}function af(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!nf(e,t)&&(en(e,t)&&en(t,e)&&sf(e,t)&&(Lt(e.prev,e,t.prev)||Lt(e,t.prev,t))||xa(e,t)&&Lt(e.prev,e,e.next)>0&&Lt(t.prev,t,t.next)>0)}function Lt(e,t,r){return(t.y-e.y)*(r.x-t.x)-(t.x-e.x)*(r.y-t.y)}function xa(e,t){return e.x===t.x&&e.y===t.y}function $h(e,t,r,i){let a=Wn(Lt(e,t,r)),n=Wn(Lt(e,t,i)),s=Wn(Lt(r,i,e)),o=Wn(Lt(r,i,t));return!!(a!==n&&s!==o||a===0&&Gn(e,r,t)||n===0&&Gn(e,i,t)||s===0&&Gn(r,e,i)||o===0&&Gn(r,t,i))}function Gn(e,t,r){return t.x<=Math.max(e.x,r.x)&&t.x>=Math.min(e.x,r.x)&&t.y<=Math.max(e.y,r.y)&&t.y>=Math.min(e.y,r.y)}function Wn(e){return e>0?1:e<0?-1:0}function nf(e,t){let r=e;do{if(r.i!==e.i&&r.next.i!==e.i&&r.i!==t.i&&r.next.i!==t.i&&$h(r,r.next,e,t))return!0;r=r.next}while(r!==e);return!1}function en(e,t){return Lt(e.prev,e,e.next)<0?Lt(e,t,e.next)>=0&&Lt(e,e.prev,t)>=0:Lt(e,t,e.prev)<0||Lt(e,e.next,t)<0}function sf(e,t){let r=e,i=!1,a=(e.x+t.x)/2,n=(e.y+t.y)/2;do r.y>n!=r.next.y>n&&r.next.y!==r.y&&a<(r.next.x-r.x)*(n-r.y)/(r.next.y-r.y)+r.x&&(i=!i),r=r.next;while(r!==e);return i}function Qh(e,t){let r=sl(e.i,e.x,e.y),i=sl(t.i,t.x,t.y),a=e.next,n=t.prev;return e.next=t,t.prev=e,r.next=a,a.prev=r,i.next=r,r.prev=i,n.next=i,i.prev=n,i}function Uu(e,t,r,i){let a=sl(e,t,r);return i?(a.next=i.next,a.prev=i,i.next.prev=a,i.next=a):(a.prev=a,a.next=a),a}function tn(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function sl(e,t,r){return{i:e,x:t,y:r,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function of(e,t,r,i){let a=0;for(let n=t,s=r-i;n<r;n+=i)a+=(e[s]-e[n])*(e[n+1]+e[s+1]),s=n;return a}var lf=class{static triangulate(e,t,r=2){return Wp(e,t,r)}},Xn=class ec{static area(t){let r=t.length,i=0;for(let a=r-1,n=0;n<r;a=n++)i+=t[a].x*t[n].y-t[n].x*t[a].y;return i*.5}static isClockWise(t){return ec.area(t)<0}static triangulateShape(t,r){let i=[],a=[],n=[];Iu(t),Ou(i,t);let s=t.length;r.forEach(Iu);for(let l=0;l<r.length;l++)a.push(s),s+=r[l].length,Ou(i,r[l]);let o=lf.triangulate(i,a);for(let l=0;l<o.length;l+=3)n.push(o.slice(l,l+3));return n}};function Iu(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function Ou(e,t){for(let r=0;r<t.length;r++)e.push(t[r].x),e.push(t[r].y)}var tc=class rc extends Si{constructor(t=new Tl([new Me(.5,.5),new Me(-.5,.5),new Me(-.5,-.5),new Me(.5,-.5)]),r={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:r},t=Array.isArray(t)?t:[t];let i=this,a=[],n=[];for(let o=0,l=t.length;o<l;o++){let u=t[o];s(u)}this.setAttribute("position",new Dr(a,3)),this.setAttribute("uv",new Dr(n,2)),this.computeVertexNormals();function s(o){let l=[],u=r.curveSegments!==void 0?r.curveSegments:12,h=r.steps!==void 0?r.steps:1,d=r.depth!==void 0?r.depth:1,c=r.bevelEnabled!==void 0?r.bevelEnabled:!0,f=r.bevelThickness!==void 0?r.bevelThickness:.2,g=r.bevelSize!==void 0?r.bevelSize:f-.1,v=r.bevelOffset!==void 0?r.bevelOffset:0,m=r.bevelSegments!==void 0?r.bevelSegments:3,p=r.extrudePath,b=r.UVGenerator!==void 0?r.UVGenerator:uf,w,y=!1,E,C,R,_;if(p){w=p.getSpacedPoints(h),y=!0,c=!1;let te=p.isCatmullRomCurve3?p.closed:!1;E=p.computeFrenetFrames(h,te),C=new z,R=new z,_=new z}c||(m=0,f=0,g=0,v=0);let T=o.extractPoints(u),H=T.shape,N=T.holes;if(!Xn.isClockWise(H)){H=H.reverse();for(let te=0,Z=N.length;te<Z;te++){let se=N[te];Xn.isClockWise(se)&&(N[te]=se.reverse())}}function F(te){let Z=10000000000000001e-36,se=te[0];for(let Te=1;Te<=te.length;Te++){let ve=Te%te.length,Ue=te[ve],Fe=Ue.x-se.x,et=Ue.y-se.y,it=Fe*Fe+et*et,L=Math.max(Math.abs(Ue.x),Math.abs(Ue.y),Math.abs(se.x),Math.abs(se.y)),vt=Z*L*L;if(it<=vt){te.splice(ve,1),Te--;continue}se=Ue}}F(H),N.forEach(F);let q=N.length,A=H;for(let te=0;te<q;te++){let Z=N[te];H=H.concat(Z)}function O(te,Z,se){return Z||Qe("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(Z,se)}let j=H.length;function G(te,Z,se){let Te,ve,Ue,Fe=te.x-Z.x,et=te.y-Z.y,it=se.x-te.x,L=se.y-te.y,vt=Fe*Fe+et*et,ut=Fe*L-et*it;if(Math.abs(ut)>Number.EPSILON){let nt=Math.sqrt(vt),M=Math.sqrt(it*it+L*L),S=Z.x-et/nt,D=Z.y+Fe/nt,W=se.x-L/M,$=se.y+it/M,_e=((W-S)*L-($-D)*it)/(Fe*L-et*it);Te=S+Fe*_e-te.x,ve=D+et*_e-te.y;let xe=Te*Te+ve*ve;if(xe<=2)return new Me(Te,ve);Ue=Math.sqrt(xe/2)}else{let nt=!1;Fe>Number.EPSILON?it>Number.EPSILON&&(nt=!0):Fe<-Number.EPSILON?it<-Number.EPSILON&&(nt=!0):Math.sign(et)===Math.sign(L)&&(nt=!0),nt?(Te=-et,ve=Fe,Ue=Math.sqrt(vt)):(Te=Fe,ve=et,Ue=Math.sqrt(vt/2))}return new Me(Te/Ue,ve/Ue)}let ce=[];for(let te=0,Z=A.length,se=Z-1,Te=te+1;te<Z;te++,se++,Te++)se===Z&&(se=0),Te===Z&&(Te=0),ce[te]=G(A[te],A[se],A[Te]);let X=[],Y,ee=ce.concat();for(let te=0,Z=q;te<Z;te++){let se=N[te];Y=[];for(let Te=0,ve=se.length,Ue=ve-1,Fe=Te+1;Te<ve;Te++,Ue++,Fe++)Ue===ve&&(Ue=0),Fe===ve&&(Fe=0),Y[Te]=G(se[Te],se[Ue],se[Fe]);X.push(Y),ee=ee.concat(Y)}let Ge;if(m===0)Ge=Xn.triangulateShape(A,N);else{let te=[],Z=[];for(let se=0;se<m;se++){let Te=se/m,ve=f*Math.cos(Te*Math.PI/2),Ue=g*Math.sin(Te*Math.PI/2)+v;for(let Fe=0,et=A.length;Fe<et;Fe++){let it=O(A[Fe],ce[Fe],Ue);oe(it.x,it.y,-ve),Te===0&&te.push(it)}for(let Fe=0,et=q;Fe<et;Fe++){let it=N[Fe];Y=X[Fe];let L=[];for(let vt=0,ut=it.length;vt<ut;vt++){let nt=O(it[vt],Y[vt],Ue);oe(nt.x,nt.y,-ve),Te===0&&L.push(nt)}Te===0&&Z.push(L)}}Ge=Xn.triangulateShape(te,Z)}let we=Ge.length,gt=g+v;for(let te=0;te<j;te++){let Z=c?O(H[te],ee[te],gt):H[te];y?(R.copy(E.normals[0]).multiplyScalar(Z.x),C.copy(E.binormals[0]).multiplyScalar(Z.y),_.copy(w[0]).add(R).add(C),oe(_.x,_.y,_.z)):oe(Z.x,Z.y,0)}for(let te=1;te<=h;te++)for(let Z=0;Z<j;Z++){let se=c?O(H[Z],ee[Z],gt):H[Z];y?(R.copy(E.normals[te]).multiplyScalar(se.x),C.copy(E.binormals[te]).multiplyScalar(se.y),_.copy(w[te]).add(R).add(C),oe(_.x,_.y,_.z)):oe(se.x,se.y,d/h*te)}for(let te=m-1;te>=0;te--){let Z=te/m,se=f*Math.cos(Z*Math.PI/2),Te=g*Math.sin(Z*Math.PI/2)+v;for(let ve=0,Ue=A.length;ve<Ue;ve++){let Fe=O(A[ve],ce[ve],Te);oe(Fe.x,Fe.y,d+se)}for(let ve=0,Ue=N.length;ve<Ue;ve++){let Fe=N[ve];Y=X[ve];for(let et=0,it=Fe.length;et<it;et++){let L=O(Fe[et],Y[et],Te);y?oe(L.x,L.y+w[h-1].y,w[h-1].x+se):oe(L.x,L.y,d+se)}}}Ze(),J();function Ze(){let te=a.length/3;if(c){let Z=0,se=j*Z;for(let Te=0;Te<we;Te++){let ve=Ge[Te];Pe(ve[2]+se,ve[1]+se,ve[0]+se)}Z=h+m*2,se=j*Z;for(let Te=0;Te<we;Te++){let ve=Ge[Te];Pe(ve[0]+se,ve[1]+se,ve[2]+se)}}else{for(let Z=0;Z<we;Z++){let se=Ge[Z];Pe(se[2],se[1],se[0])}for(let Z=0;Z<we;Z++){let se=Ge[Z];Pe(se[0]+j*h,se[1]+j*h,se[2]+j*h)}}i.addGroup(te,a.length/3-te,0)}function J(){let te=a.length/3,Z=0;re(A,Z),Z+=A.length;for(let se=0,Te=N.length;se<Te;se++){let ve=N[se];re(ve,Z),Z+=ve.length}i.addGroup(te,a.length/3-te,1)}function re(te,Z){let se=te.length;for(;--se>=0;){let Te=se,ve=se-1;ve<0&&(ve=te.length-1);for(let Ue=0,Fe=h+m*2;Ue<Fe;Ue++){let et=j*Ue,it=j*(Ue+1),L=Z+Te+et,vt=Z+ve+et,ut=Z+ve+it,nt=Z+Te+it;Ne(L,vt,ut,nt)}}}function oe(te,Z,se){l.push(te),l.push(Z),l.push(se)}function Pe(te,Z,se){pe(te),pe(Z),pe(se);let Te=a.length/3,ve=b.generateTopUV(i,a,Te-3,Te-2,Te-1);ke(ve[0]),ke(ve[1]),ke(ve[2])}function Ne(te,Z,se,Te){pe(te),pe(Z),pe(Te),pe(Z),pe(se),pe(Te);let ve=a.length/3,Ue=b.generateSideWallUV(i,a,ve-6,ve-3,ve-2,ve-1);ke(Ue[0]),ke(Ue[1]),ke(Ue[3]),ke(Ue[1]),ke(Ue[2]),ke(Ue[3])}function pe(te){a.push(l[te*3+0]),a.push(l[te*3+1]),a.push(l[te*3+2])}function ke(te){n.push(te.x),n.push(te.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),r=this.parameters.shapes,i=this.parameters.options;return hf(r,i,t)}static fromJSON(t,r){let i=[];for(let n=0,s=t.shapes.length;n<s;n++){let o=r[t.shapes[n]];i.push(o)}let a=t.options.extrudePath;return a!==void 0&&(t.options.extrudePath=new al[a.type]().fromJSON(a)),new rc(i,t.options)}},uf={generateTopUV:function(e,t,r,i,a){let n=t[r*3],s=t[r*3+1],o=t[i*3],l=t[i*3+1],u=t[a*3],h=t[a*3+1];return[new Me(n,s),new Me(o,l),new Me(u,h)]},generateSideWallUV:function(e,t,r,i,a,n){let s=t[r*3],o=t[r*3+1],l=t[r*3+2],u=t[i*3],h=t[i*3+1],d=t[i*3+2],c=t[a*3],f=t[a*3+1],g=t[a*3+2],v=t[n*3],m=t[n*3+1],p=t[n*3+2];return Math.abs(o-h)<Math.abs(s-u)?[new Me(s,1-l),new Me(u,1-d),new Me(c,1-g),new Me(v,1-p)]:[new Me(o,1-l),new Me(h,1-d),new Me(f,1-g),new Me(m,1-p)]}};function hf(e,t,r){if(r.shapes=[],Array.isArray(e))for(let i=0,a=e.length;i<a;i++){let n=e[i];r.shapes.push(n.uuid)}else r.shapes.push(e.uuid);return r.options=Object.assign({},t),t.extrudePath!==void 0&&(r.options.extrudePath=t.extrudePath.toJSON()),r}var an=class ic extends Si{constructor(t=1,r=1,i=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:r,widthSegments:i,heightSegments:a};let n=t/2,s=r/2,o=Math.floor(i),l=Math.floor(a),u=o+1,h=l+1,d=t/o,c=r/l,f=[],g=[],v=[],m=[];for(let p=0;p<h;p++){let b=p*c-s;for(let w=0;w<u;w++){let y=w*d-n;g.push(y,-b,0),v.push(0,0,1),m.push(w/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<o;b++){let w=b+u*p,y=b+u*(p+1),E=b+1+u*(p+1),C=b+1+u*p;f.push(w,y,C),f.push(y,E,C)}this.setIndex(f),this.setAttribute("position",new Dr(g,3)),this.setAttribute("normal",new Dr(v,3)),this.setAttribute("uv",new Dr(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ic(t.width,t.height,t.widthSegments,t.heightSegments)}};function Sa(e){let t={};for(let r in e){t[r]={};for(let i in e[r]){let a=e[r][i];if(Fu(a))a.isRenderTargetTexture?(Je("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[r][i]=null):t[r][i]=a.clone();else if(Array.isArray(a))if(Fu(a[0])){let n=[];for(let s=0,o=a.length;s<o;s++)n[s]=a[s].clone();t[r][i]=n}else t[r][i]=a.slice();else t[r][i]=a}}return t}function ir(e){let t={};for(let r=0;r<e.length;r++){let i=Sa(e[r]);for(let a in i)t[a]=i[a]}return t}function Fu(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function cf(e){let t=[];for(let r=0;r<e.length;r++)t.push(e[r].clone());return t}function ac(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:dt.workingColorSpace}var df={clone:Sa,merge:ir},pf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ff=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,dr=class extends ps{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=pf,this.fragmentShader=ff,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Sa(e.uniforms),this.uniformsGroups=cf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let r={};for(let i in this.extensions)this.extensions[i]===!0&&(r[i]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let r in e.uniforms){let i=e.uniforms[r];switch(this.uniforms[r]={},i.type){case"t":this.uniforms[r].value=t[i.value]||null;break;case"c":this.uniforms[r].value=new lt().setHex(i.value);break;case"v2":this.uniforms[r].value=new Me().fromArray(i.value);break;case"v3":this.uniforms[r].value=new z().fromArray(i.value);break;case"v4":this.uniforms[r].value=new Pt().fromArray(i.value);break;case"m3":this.uniforms[r].value=new at().fromArray(i.value);break;case"m4":this.uniforms[r].value=new Wt().fromArray(i.value);break;default:this.uniforms[r].value=i.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let r in e.extensions)this.extensions[r]=e.extensions[r];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},mf=class extends dr{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},gf=class extends ps{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Xd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},_f=class extends ps{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function oa(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}function uo(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var nn=class{constructor(e,t,r,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(r),this.sampleValues=t,this.valueSize=r,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,r=this._cachedIndex,i=t[r],a=t[r-1];r:{e:{let n;t:{i:if(!(e<i)){for(let s=r+2;;){if(i===void 0){if(e<a)break i;return r=t.length,this._cachedIndex=r,this.copySampleValue_(r-1)}if(r===s)break;if(a=i,i=t[++r],e<i)break e}n=t.length;break t}if(!(e>=a)){let s=t[1];e<s&&(r=2,a=s);for(let o=r-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===o)break;if(i=a,a=t[--r-1],e>=a)break e}n=r,r=0;break t}break r}for(;r<n;){let s=r+n>>>1;e<t[s]?n=s:r=s+1}if(i=t[r],a=t[r-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return r=t.length,this._cachedIndex=r,this.copySampleValue_(r-1)}this._cachedIndex=r,this.intervalChanged_(r,a,i)}return this.interpolate_(r,a,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,r=this.sampleValues,i=this.valueSize,a=e*i;for(let n=0;n!==i;++n)t[n]=r[a+n];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},vf=class extends nn{constructor(e,t,r,i){super(e,t,r,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:uu,endingEnd:uu}}intervalChanged_(e,t,r){let i=this.parameterPositions,a=e-2,n=e+1,s=i[a],o=i[n];if(s===void 0)switch(this.getSettings_().endingStart){case hu:a=e,s=2*t-r;break;case cu:a=i.length-2,s=t+i[a]-i[a+1];break;default:a=e,s=r}if(o===void 0)switch(this.getSettings_().endingEnd){case hu:n=e,o=2*r-t;break;case cu:n=1,o=r+i[1]-i[0];break;default:n=e-1,o=t}let l=(r-t)*.5,u=this.valueSize;this._weightPrev=l/(t-s),this._weightNext=l/(o-r),this._offsetPrev=a*u,this._offsetNext=n*u}interpolate_(e,t,r,i){let a=this.resultBuffer,n=this.sampleValues,s=this.valueSize,o=e*s,l=o-s,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,c=this._weightNext,f=(r-t)/(i-t),g=f*f,v=g*f,m=-d*v+2*d*g-d*f,p=(1+d)*v+(-1.5-2*d)*g+(-.5+d)*f+1,b=(-1-c)*v+(1.5+c)*g+.5*f,w=c*v-c*g;for(let y=0;y!==s;++y)a[y]=m*n[u+y]+p*n[l+y]+b*n[o+y]+w*n[h+y];return a}},xf=class extends nn{constructor(e,t,r,i){super(e,t,r,i)}interpolate_(e,t,r,i){let a=this.resultBuffer,n=this.sampleValues,s=this.valueSize,o=e*s,l=o-s,u=(r-t)/(i-t),h=1-u;for(let d=0;d!==s;++d)a[d]=n[l+d]*h+n[o+d]*u;return a}},Sf=class extends nn{constructor(e,t,r,i){super(e,t,r,i)}interpolate_(e){return this.copySampleValue_(e-1)}},yf=class extends nn{interpolate_(e,t,r,i){let a=this.resultBuffer,n=this.sampleValues,s=this.valueSize,o=e*s,l=o-s,u=this.inTangents,h=this.outTangents;if(!u||!h){let f=(r-t)/(i-t),g=1-f;for(let v=0;v!==s;++v)a[v]=n[l+v]*g+n[o+v]*f;return a}let d=s*2,c=e-1;for(let f=0;f!==s;++f){let g=n[l+f],v=n[o+f],m=c*d+f*2,p=h[m],b=h[m+1],w=e*d+f*2,y=u[w],E=u[w+1],C=Tf(r,t,p,y,i);a[f]=nc(C,g,b,E,v)}return a}};function nc(e,t,r,i,a){let n=1-e;return n*n*n*t+3*n*n*e*r+3*n*e*e*i+e*e*e*a}function Mf(e,t,r,i,a){let n=1-e;return 3*n*n*(r-t)+6*n*e*(i-r)+3*e*e*(a-i)}function Tf(e,t,r,i,a){let n=(e-t)/(a-t);for(let s=0;s<8;s++){let o=nc(n,t,r,i,a)-e;if(Math.abs(o)<1e-10)break;let l=Mf(n,t,r,i,a);if(Math.abs(l)<1e-10)break;n=Math.max(0,Math.min(1,n-o/l))}return n}var Xr=class{constructor(e,t,r,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=oa(t,this.TimeBufferType),this.values=oa(r,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,r;if(t.toJSON!==this.toJSON)r=t.toJSON(e);else{r={name:e.name,times:oa(e.times,Array),values:oa(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(r.interpolation=i),uo(e.settings)&&(r.settings={inTangents:oa(e.settings.inTangents,Array),outTangents:oa(e.settings.outTangents,Array)})}return r.type=e.ValueTypeName,r}InterpolantFactoryMethodDiscrete(e){return new Sf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new xf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new vf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new yf(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case ss:t=this.InterpolantFactoryMethodDiscrete;break;case rl:t=this.InterpolantFactoryMethodLinear;break;case Os:t=this.InterpolantFactoryMethodSmooth;break;case lu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let r="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(r);return Je("KeyframeTrack:",r),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ss;case this.InterpolantFactoryMethodLinear:return rl;case this.InterpolantFactoryMethodSmooth:return Os;case this.InterpolantFactoryMethodBezier:return lu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let r=0,i=t.length;r!==i;++r)t[r]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let r=0,i=t.length;r!==i;++r)t[r]*=e;uo(this.settings)&&(zu(this.settings.inTangents,e),zu(this.settings.outTangents,e))}return this}trim(e,t){let r=this.times,i=r.length,a=0,n=i-1;for(;a!==i&&r[a]<e;)++a;for(;n!==-1&&r[n]>t;)--n;if(++n,a!==0||n!==i){a>=n&&(n=Math.max(n,1),a=n-1);let s=this.getValueSize();this.times=r.slice(a,n),this.values=this.values.slice(a*s,n*s)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Qe("KeyframeTrack: Invalid value size in track.",this),e=!1);let r=this.times,i=this.values,a=r.length;a===0&&(Qe("KeyframeTrack: Track is empty.",this),e=!1);let n=null;for(let s=0;s!==a;s++){let o=r[s];if(typeof o=="number"&&isNaN(o)){Qe("KeyframeTrack: Time is not a valid number.",this,s,o),e=!1;break}if(n!==null&&n>o){Qe("KeyframeTrack: Out of order keys.",this,s,o,n),e=!1;break}n=o}if(i!==void 0&&rp(i))for(let s=0,o=i.length;s!==o;++s){let l=i[s];if(isNaN(l)){Qe("KeyframeTrack: Value is not a valid number.",this,s,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),r=this.getValueSize(),i=this.getInterpolation()===Os,a=e.length-1,n=1;for(let s=1;s<a;++s){let o=!1,l=e[s],u=e[s+1];if(l!==u&&(s!==1||l!==e[0]))if(i)o=!0;else{let h=s*r,d=h-r,c=h+r;for(let f=0;f!==r;++f){let g=t[h+f];if(g!==t[d+f]||g!==t[c+f]){o=!0;break}}}if(o){if(s!==n){e[n]=e[s];let h=s*r,d=n*r;for(let c=0;c!==r;++c)t[d+c]=t[h+c]}++n}}if(a>0){e[n]=e[a];for(let s=a*r,o=n*r,l=0;l!==r;++l)t[o+l]=t[s+l];++n}return n!==e.length?(this.times=e.slice(0,n),this.values=t.slice(0,n*r)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),r=this.constructor,i=new r(this.name,e,t);return i.createInterpolant=this.createInterpolant,uo(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function zu(e,t){for(let r=0,i=e.length;r!==i;r+=2)e[r]*=t}Xr.prototype.ValueTypeName="";Xr.prototype.TimeBufferType=Float32Array;Xr.prototype.ValueBufferType=Float32Array;Xr.prototype.DefaultInterpolation=rl;var sn=class extends Xr{constructor(e,t,r){super(e,t,r)}};sn.prototype.ValueTypeName="bool";sn.prototype.ValueBufferType=Array;sn.prototype.DefaultInterpolation=ss;sn.prototype.InterpolantFactoryMethodLinear=void 0;sn.prototype.InterpolantFactoryMethodSmooth=void 0;var Ef=class extends Xr{constructor(e,t,r,i){super(e,t,r,i)}};Ef.prototype.ValueTypeName="color";var bf=class extends Xr{constructor(e,t,r,i){super(e,t,r,i)}};bf.prototype.ValueTypeName="number";var wf=class extends nn{constructor(e,t,r,i){super(e,t,r,i)}interpolate_(e,t,r,i){let a=this.resultBuffer,n=this.sampleValues,s=this.valueSize,o=(r-t)/(i-t),l=e*s;for(let u=l+s;l!==u;l+=4)Vi.slerpFlat(a,0,n,l-s,n,l,o);return a}},sc=class extends Xr{constructor(e,t,r,i){super(e,t,r,i)}InterpolantFactoryMethodLinear(e){return new wf(this.times,this.values,this.getValueSize(),e)}};sc.prototype.ValueTypeName="quaternion";sc.prototype.InterpolantFactoryMethodSmooth=void 0;var on=class extends Xr{constructor(e,t,r){super(e,t,r)}};on.prototype.ValueTypeName="string";on.prototype.ValueBufferType=Array;on.prototype.DefaultInterpolation=ss;on.prototype.InterpolantFactoryMethodLinear=void 0;on.prototype.InterpolantFactoryMethodSmooth=void 0;var Af=class extends Xr{constructor(e,t,r,i){super(e,t,r,i)}};Af.prototype.ValueTypeName="vector";var Rf=class{constructor(e,t,r){let i=this,a=!1,n=0,s=0,o,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=r,this._abortController=null,this.itemStart=function(u){s++,a===!1&&i.onStart!==void 0&&i.onStart(u,n,s),a=!0},this.itemEnd=function(u){n++,i.onProgress!==void 0&&i.onProgress(u,n,s),n===s&&(a=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),o?o(u):u},this.setURLModifier=function(u){return o=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){let c=l[h],f=l[h+1];if(c.global&&(c.lastIndex=0),c.test(u))return f}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Cf=new Rf,Pf=class{constructor(e){this.manager=e!==void 0?e:Cf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let r=this;return new Promise(function(i,a){r.load(e,i,t,a)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Pf.DEFAULT_MATERIAL_NAME="__DEFAULT";var qn=new z,jn=new Vi,Or=new z,oc=class extends si{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Wt,this.projectionMatrix=new Wt,this.projectionMatrixInverse=new Wt,this.coordinateSystem=kr,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(qn,jn,Or),Or.x===1&&Or.y===1&&Or.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(qn,jn,Or.set(1,1,1)).invert()}updateWorldMatrix(e,t,r=!1){super.updateWorldMatrix(e,t,r),this.matrixWorld.decompose(qn,jn,Or),Or.x===1&&Or.y===1&&Or.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(qn,jn,Or.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},_i=new z,Bu=new Me,ku=new Me,cr=class extends oc{constructor(e=50,t=1,r=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=il*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(zs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return il*2*Math.atan(Math.tan(zs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){_i.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(_i.x,_i.y).multiplyScalar(-e/_i.z),_i.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(_i.x,_i.y).multiplyScalar(-e/_i.z)}getViewSize(e,t){return this.getViewBounds(e,Bu,ku),t.subVectors(ku,Bu)}setViewOffset(e,t,r,i,a,n){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=i,this.view.width=a,this.view.height=n,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(zs*.5*this.fov)/this.zoom,r=2*t,i=this.aspect*r,a=-.5*i,n=this.view;if(this.view!==null&&this.view.enabled){let o=n.fullWidth,l=n.fullHeight;a+=n.offsetX*i/o,t-=n.offsetY*r/l,i*=n.width/o,r*=n.height/l}let s=this.filmOffset;s!==0&&(a+=e*s/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+i,t,t-r,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},lc=class extends oc{constructor(e=-1,t=1,r=1,i=-1,a=.1,n=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=i,this.near=a,this.far=n,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,i,a,n){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=i,this.view.width=a,this.view.height=n,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,i=(this.top+this.bottom)/2,a=r-e,n=r+e,s=i+t,o=i-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=l*this.view.offsetX,n=a+l*this.view.width,s-=u*this.view.offsetY,o=s-u*this.view.height}this.projectionMatrix.makeOrthographic(a,n,s,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},la=-90,ua=1,Lf=class extends si{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new cr(la,ua,e,t);i.layers=this.layers,this.add(i);let a=new cr(la,ua,e,t);a.layers=this.layers,this.add(a);let n=new cr(la,ua,e,t);n.layers=this.layers,this.add(n);let s=new cr(la,ua,e,t);s.layers=this.layers,this.add(s);let o=new cr(la,ua,e,t);o.layers=this.layers,this.add(o);let l=new cr(la,ua,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[r,i,a,n,s,o]=t;for(let l of t)this.remove(l);if(e===kr)r.up.set(0,1,0),r.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),n.up.set(0,0,1),n.lookAt(0,-1,0),s.up.set(0,1,0),s.lookAt(0,0,1),o.up.set(0,1,0),o.lookAt(0,0,-1);else if(e===us)r.up.set(0,-1,0),r.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),n.up.set(0,0,-1),n.lookAt(0,-1,0),s.up.set(0,-1,0),s.lookAt(0,0,1),o.up.set(0,-1,0),o.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:r,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[a,n,s,o,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),c=e.getActiveMipmapLevel(),f=e.xr.enabled;e.xr.enabled=!1;let g=r.texture.generateMipmaps;r.texture.generateMipmaps=!1;let v=!1;e.isWebGLRenderer===!0?v=e.state.buffers.depth.getReversed():v=e.reversedDepthBuffer,e.setRenderTarget(r,0,i),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(r,1,i),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,n),e.setRenderTarget(r,2,i),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(r,3,i),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(r,4,i),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),r.texture.generateMipmaps=g,e.setRenderTarget(r,5,i),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,d,c),e.xr.enabled=f,r.texture.needsPMREMUpdate=!0}},Nf=class extends cr{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},El="\\[\\]\\.:\\/",Df=new RegExp("["+El+"]","g"),bl="[^"+El+"]",Uf="[^"+El.replace("\\.","")+"]",If=/((?:WC+[\/:])*)/.source.replace("WC",bl),Of=/(WCOD+)?/.source.replace("WCOD",Uf),Ff=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",bl),zf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",bl),Bf=new RegExp("^"+If+Of+Ff+zf+"$"),kf=["material","materials","bones","map"],Vf=class{constructor(e,t,r){let i=r||Ot.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let r=this._targetGroup.nCachedObjects_,i=this._bindings[r];i!==void 0&&i.getValue(e,t)}setValue(e,t){let r=this._bindings;for(let i=this._targetGroup.nCachedObjects_,a=r.length;i!==a;++i)r[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,r=e.length;t!==r;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,r=e.length;t!==r;++t)e[t].unbind()}},Ot=class pa{constructor(t,r,i){this.path=r,this.parsedPath=i||pa.parseTrackName(r),this.node=pa.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,r,i){return t&&t.isAnimationObjectGroup?new pa.Composite(t,r,i):new pa(t,r,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Df,"")}static parseTrackName(t){let r=Bf.exec(t);if(r===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:r[2],objectName:r[3],objectIndex:r[4],propertyName:r[5],propertyIndex:r[6]},a=i.nodeName&&i.nodeName.lastIndexOf(".");if(a!==void 0&&a!==-1){let n=i.nodeName.substring(a+1);kf.indexOf(n)!==-1&&(i.nodeName=i.nodeName.substring(0,a),i.objectName=n)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,r){if(r===void 0||r===""||r==="."||r===-1||r===t.name||r===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(r);if(i!==void 0)return i}if(t.children){let i=function(n){for(let s=0;s<n.length;s++){let o=n[s];if(o.name===r||o.uuid===r)return o;let l=i(o.children);if(l)return l}return null},a=i(t.children);if(a)return a}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,r){t[r]=this.targetObject[this.propertyName]}_getValue_array(t,r){let i=this.resolvedProperty;for(let a=0,n=i.length;a!==n;++a)t[r++]=i[a]}_getValue_arrayElement(t,r){t[r]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,r){this.resolvedProperty.toArray(t,r)}_setValue_direct(t,r){this.targetObject[this.propertyName]=t[r]}_setValue_direct_setNeedsUpdate(t,r){this.targetObject[this.propertyName]=t[r],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,r){this.targetObject[this.propertyName]=t[r],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,r){let i=this.resolvedProperty;for(let a=0,n=i.length;a!==n;++a)i[a]=t[r++]}_setValue_array_setNeedsUpdate(t,r){let i=this.resolvedProperty;for(let a=0,n=i.length;a!==n;++a)i[a]=t[r++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,r){let i=this.resolvedProperty;for(let a=0,n=i.length;a!==n;++a)i[a]=t[r++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,r){this.resolvedProperty[this.propertyIndex]=t[r]}_setValue_arrayElement_setNeedsUpdate(t,r){this.resolvedProperty[this.propertyIndex]=t[r],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,r){this.resolvedProperty[this.propertyIndex]=t[r],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,r){this.resolvedProperty.fromArray(t,r)}_setValue_fromArray_setNeedsUpdate(t,r){this.resolvedProperty.fromArray(t,r),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,r){this.resolvedProperty.fromArray(t,r),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,r){this.bind(),this.getValue(t,r)}_setValue_unbound(t,r){this.bind(),this.setValue(t,r)}bind(){let t=this.node,r=this.parsedPath,i=r.objectName,a=r.propertyName,n=r.propertyIndex;if(t||(t=pa.findNode(this.rootNode,r.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Je("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let u=r.objectIndex;switch(i){case"materials":if(!t.material){Qe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Qe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Qe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===u){u=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Qe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Qe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Qe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(u!==void 0){if(t[u]===void 0){Qe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[u]}}let s=t[a];if(s===void 0){let u=r.nodeName;Qe("PropertyBinding: Trying to update property for track: "+u+"."+a+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(n!==void 0){if(a==="morphTargetInfluences"){if(!t.geometry){Qe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Qe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[n]!==void 0&&(n=t.morphTargetDictionary[n])}l=this.BindingType.ArrayElement,this.resolvedProperty=s,this.propertyIndex=n}else s.fromArray!==void 0&&s.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=s):Array.isArray(s)?(l=this.BindingType.EntireArray,this.resolvedProperty=s):this.propertyName=a;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ot.Composite=Vf;Ot.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ot.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ot.prototype.GetterByBindingType=[Ot.prototype._getValue_direct,Ot.prototype._getValue_array,Ot.prototype._getValue_arrayElement,Ot.prototype._getValue_toArray];Ot.prototype.SetterByBindingTypeAndVersioning=[[Ot.prototype._setValue_direct,Ot.prototype._setValue_direct_setNeedsUpdate,Ot.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_array,Ot.prototype._setValue_array_setNeedsUpdate,Ot.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_arrayElement,Ot.prototype._setValue_arrayElement_setNeedsUpdate,Ot.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_fromArray,Ot.prototype._setValue_fromArray_setNeedsUpdate,Ot.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var RS=new Float32Array(1),Hf=class{constructor(t,r,i,a){this.elements=[1,0,0,1],t!==void 0&&this.set(t,r,i,a)}identity(){return this.set(1,0,0,1),this}fromArray(t,r=0){for(let i=0;i<4;i++)this.elements[i]=t[i+r];return this}set(t,r,i,a){let n=this.elements;return n[0]=t,n[2]=r,n[1]=i,n[3]=a,this}};Hf.prototype.isMatrix2=!0;function Vu(e,t,r,i){let a=Gf(i);switch(r){case bh:return e*t;case ds:return e*t/a.components*a.byteLength;case dl:return e*t/a.components*a.byteLength;case zi:return e*t*2/a.components*a.byteLength;case pl:return e*t*2/a.components*a.byteLength;case wh:return e*t*3/a.components*a.byteLength;case Lr:return e*t*4/a.components*a.byteLength;case fl:return e*t*4/a.components*a.byteLength;case Zn:case $n:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Qn:case es:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ao:case Co:return Math.max(e,16)*Math.max(t,8)/4;case wo:case Ro:return Math.max(e,8)*Math.max(t,8)/2;case Po:case Lo:case Do:case Uo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case No:case as:case Io:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Oo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Fo:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case zo:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Bo:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ko:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Vo:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Ho:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Go:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Wo:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Xo:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case qo:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case jo:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Yo:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ko:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Jo:case Zo:case $o:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Qo:case el:return Math.ceil(e/4)*Math.ceil(t/4)*8;case ns:case tl:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${r} format.`)}function Gf(e){switch(e){case Sr:case yh:return{byteLength:1,components:1};case Ka:case Mh:case Gr:return{byteLength:2,components:1};case hl:case cl:return{byteLength:2,components:4};case Hr:case ul:case Br:return{byteLength:4,components:1};case Th:case Eh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Je("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");/**
* @license
* Copyright 2010-2026 Three.js Authors
* SPDX-License-Identifier: MIT
*/function uc(){let e=null,t=!1,r=null,i=null;function a(n,s){i=e.requestAnimationFrame(a),r(n,s)}return{start:function(){t!==!0&&r!==null&&e!==null&&(i=e.requestAnimationFrame(a),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(n){r=n},setContext:function(n){e=n}}}function Wf(e){let t=new WeakMap;function r(o,l){let u=o.array,h=o.usage,d=u.byteLength,c=e.createBuffer();e.bindBuffer(l,c),e.bufferData(l,u,h),o.onUploadCallback();let f;if(u instanceof Float32Array)f=e.FLOAT;else if(typeof Float16Array<"u"&&u instanceof Float16Array)f=e.HALF_FLOAT;else if(u instanceof Uint16Array)o.isFloat16BufferAttribute?f=e.HALF_FLOAT:f=e.UNSIGNED_SHORT;else if(u instanceof Int16Array)f=e.SHORT;else if(u instanceof Uint32Array)f=e.UNSIGNED_INT;else if(u instanceof Int32Array)f=e.INT;else if(u instanceof Int8Array)f=e.BYTE;else if(u instanceof Uint8Array)f=e.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)f=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:c,type:f,bytesPerElement:u.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,u){let h=l.array,d=l.updateRanges;if(e.bindBuffer(u,o),d.length===0)e.bufferSubData(u,0,h);else{d.sort((f,g)=>f.start-g.start);let c=0;for(let f=1;f<d.length;f++){let g=d[c],v=d[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++c,d[c]=v)}d.length=c+1;for(let f=0,g=d.length;f<g;f++){let v=d[f];e.bufferSubData(u,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function a(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function n(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}function s(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let u=t.get(o);if(u===void 0)t.set(o,r(o,l));else if(u.version<o.version){if(u.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(u.buffer,o,l),u.version=o.version}}return{get:a,remove:n,update:s}}var Xf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,qf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,jf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Yf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Kf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Jf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Zf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,$f=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Qf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,em=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,tm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,rm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,im=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,am=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,nm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,sm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,om=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,lm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,um=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,cm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,dm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,pm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,fm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,mm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,gm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,_m=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,vm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,xm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Sm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ym="gl_FragColor = linearToOutputTexel( gl_FragColor );",Mm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Tm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Em=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,bm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,wm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Am=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Rm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Cm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Pm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Lm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Nm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Dm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Um=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Im=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Om=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Fm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,zm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Bm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,km=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Vm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Hm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Gm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Wm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Xm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,qm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,jm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Ym=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Km=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Jm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Zm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,$m=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Qm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,eg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,tg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,rg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ig=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ag=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ng=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,sg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,og=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,lg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ug=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,hg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,cg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,fg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,mg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,gg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,_g=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,vg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,xg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Sg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,yg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Mg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Tg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Eg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,bg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,wg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ag=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Rg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Cg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Pg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Lg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ng=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Dg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ug=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Ig=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Og=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Fg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,zg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Bg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,kg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Vg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Hg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Gg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Wg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Xg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,qg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Yg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,$g=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Qg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,e_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,t_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,r_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,i_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,a_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,n_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,s_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,o_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,l_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,u_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,h_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,c_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,d_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,p_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,f_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,m_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,g_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,__=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,v_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,x_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,S_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,y_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,M_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,T_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,E_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ot={alphahash_fragment:Xf,alphahash_pars_fragment:qf,alphamap_fragment:jf,alphamap_pars_fragment:Yf,alphatest_fragment:Kf,alphatest_pars_fragment:Jf,aomap_fragment:Zf,aomap_pars_fragment:$f,batching_pars_vertex:Qf,batching_vertex:em,begin_vertex:tm,beginnormal_vertex:rm,bsdfs:im,iridescence_fragment:am,bumpmap_pars_fragment:nm,clipping_planes_fragment:sm,clipping_planes_pars_fragment:om,clipping_planes_pars_vertex:lm,clipping_planes_vertex:um,color_fragment:hm,color_pars_fragment:cm,color_pars_vertex:dm,color_vertex:pm,common:fm,cube_uv_reflection_fragment:mm,defaultnormal_vertex:gm,displacementmap_pars_vertex:_m,displacementmap_vertex:vm,emissivemap_fragment:xm,emissivemap_pars_fragment:Sm,colorspace_fragment:ym,colorspace_pars_fragment:Mm,envmap_fragment:Tm,envmap_common_pars_fragment:Em,envmap_pars_fragment:bm,envmap_pars_vertex:wm,envmap_physical_pars_fragment:Fm,envmap_vertex:Am,fog_vertex:Rm,fog_pars_vertex:Cm,fog_fragment:Pm,fog_pars_fragment:Lm,gradientmap_pars_fragment:Nm,lightmap_pars_fragment:Dm,lights_lambert_fragment:Um,lights_lambert_pars_fragment:Im,lights_pars_begin:Om,lights_toon_fragment:zm,lights_toon_pars_fragment:Bm,lights_phong_fragment:km,lights_phong_pars_fragment:Vm,lights_physical_fragment:Hm,lights_physical_pars_fragment:Gm,lights_fragment_begin:Wm,lights_fragment_maps:Xm,lights_fragment_end:qm,lightprobes_pars_fragment:jm,logdepthbuf_fragment:Ym,logdepthbuf_pars_fragment:Km,logdepthbuf_pars_vertex:Jm,logdepthbuf_vertex:Zm,map_fragment:$m,map_pars_fragment:Qm,map_particle_fragment:eg,map_particle_pars_fragment:tg,metalnessmap_fragment:rg,metalnessmap_pars_fragment:ig,morphinstance_vertex:ag,morphcolor_vertex:ng,morphnormal_vertex:sg,morphtarget_pars_vertex:og,morphtarget_vertex:lg,normal_fragment_begin:ug,normal_fragment_maps:hg,normal_pars_fragment:cg,normal_pars_vertex:dg,normal_vertex:pg,normalmap_pars_fragment:fg,clearcoat_normal_fragment_begin:mg,clearcoat_normal_fragment_maps:gg,clearcoat_pars_fragment:_g,iridescence_pars_fragment:vg,opaque_fragment:xg,packing:Sg,premultiplied_alpha_fragment:yg,project_vertex:Mg,dithering_fragment:Tg,dithering_pars_fragment:Eg,roughnessmap_fragment:bg,roughnessmap_pars_fragment:wg,shadowmap_pars_fragment:Ag,shadowmap_pars_vertex:Rg,shadowmap_vertex:Cg,shadowmask_pars_fragment:Pg,skinbase_vertex:Lg,skinning_pars_vertex:Ng,skinning_vertex:Dg,skinnormal_vertex:Ug,specularmap_fragment:Ig,specularmap_pars_fragment:Og,tonemapping_fragment:Fg,tonemapping_pars_fragment:zg,transmission_fragment:Bg,transmission_pars_fragment:kg,uv_pars_fragment:Vg,uv_pars_vertex:Hg,uv_vertex:Gg,worldpos_vertex:Wg,background_vert:Xg,background_frag:qg,backgroundCube_vert:jg,backgroundCube_frag:Yg,cube_vert:Kg,cube_frag:Jg,depth_vert:Zg,depth_frag:$g,distance_vert:Qg,distance_frag:e_,equirect_vert:t_,equirect_frag:r_,linedashed_vert:i_,linedashed_frag:a_,meshbasic_vert:n_,meshbasic_frag:s_,meshlambert_vert:o_,meshlambert_frag:l_,meshmatcap_vert:u_,meshmatcap_frag:h_,meshnormal_vert:c_,meshnormal_frag:d_,meshphong_vert:p_,meshphong_frag:f_,meshphysical_vert:m_,meshphysical_frag:g_,meshtoon_vert:__,meshtoon_frag:v_,points_vert:x_,points_frag:S_,shadow_vert:y_,shadow_frag:M_,sprite_vert:T_,sprite_frag:E_},ye={common:{diffuse:{value:new lt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new at}},envmap:{envMap:{value:null},envMapRotation:{value:new at},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new at}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new at}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new at},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new at},normalScale:{value:new Me(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new at},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new at}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new at}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new at}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new lt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new z},probesMax:{value:new z},probesResolution:{value:new z}},points:{diffuse:{value:new lt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0},uvTransform:{value:new at}},sprite:{diffuse:{value:new lt(16777215)},opacity:{value:1},center:{value:new Me(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}}},zr={basic:{uniforms:ir([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.fog]),vertexShader:ot.meshbasic_vert,fragmentShader:ot.meshbasic_frag},lambert:{uniforms:ir([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new lt(0)},envMapIntensity:{value:1}}]),vertexShader:ot.meshlambert_vert,fragmentShader:ot.meshlambert_frag},phong:{uniforms:ir([ye.common,ye.specularmap,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,ye.lights,{emissive:{value:new lt(0)},specular:{value:new lt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ot.meshphong_vert,fragmentShader:ot.meshphong_frag},standard:{uniforms:ir([ye.common,ye.envmap,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.roughnessmap,ye.metalnessmap,ye.fog,ye.lights,{emissive:{value:new lt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ot.meshphysical_vert,fragmentShader:ot.meshphysical_frag},toon:{uniforms:ir([ye.common,ye.aomap,ye.lightmap,ye.emissivemap,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.gradientmap,ye.fog,ye.lights,{emissive:{value:new lt(0)}}]),vertexShader:ot.meshtoon_vert,fragmentShader:ot.meshtoon_frag},matcap:{uniforms:ir([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,ye.fog,{matcap:{value:null}}]),vertexShader:ot.meshmatcap_vert,fragmentShader:ot.meshmatcap_frag},points:{uniforms:ir([ye.points,ye.fog]),vertexShader:ot.points_vert,fragmentShader:ot.points_frag},dashed:{uniforms:ir([ye.common,ye.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ot.linedashed_vert,fragmentShader:ot.linedashed_frag},depth:{uniforms:ir([ye.common,ye.displacementmap]),vertexShader:ot.depth_vert,fragmentShader:ot.depth_frag},normal:{uniforms:ir([ye.common,ye.bumpmap,ye.normalmap,ye.displacementmap,{opacity:{value:1}}]),vertexShader:ot.meshnormal_vert,fragmentShader:ot.meshnormal_frag},sprite:{uniforms:ir([ye.sprite,ye.fog]),vertexShader:ot.sprite_vert,fragmentShader:ot.sprite_frag},background:{uniforms:{uvTransform:{value:new at},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ot.background_vert,fragmentShader:ot.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new at}},vertexShader:ot.backgroundCube_vert,fragmentShader:ot.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ot.cube_vert,fragmentShader:ot.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ot.equirect_vert,fragmentShader:ot.equirect_frag},distance:{uniforms:ir([ye.common,ye.displacementmap,{referencePosition:{value:new z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ot.distance_vert,fragmentShader:ot.distance_frag},shadow:{uniforms:ir([ye.lights,ye.fog,{color:{value:new lt(0)},opacity:{value:1}}]),vertexShader:ot.shadow_vert,fragmentShader:ot.shadow_frag}};zr.physical={uniforms:ir([zr.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new at},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new at},clearcoatNormalScale:{value:new Me(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new at},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new at},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new at},sheen:{value:0},sheenColor:{value:new lt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new at},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new at},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new at},transmissionSamplerSize:{value:new Me},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new at},attenuationDistance:{value:0},attenuationColor:{value:new lt(0)},specularColor:{value:new lt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new at},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new at},anisotropyVector:{value:new Me},anisotropyMap:{value:null},anisotropyMapTransform:{value:new at}}]),vertexShader:ot.meshphysical_vert,fragmentShader:ot.meshphysical_frag};var Yn={r:0,b:0,g:0},b_=new Wt,hc=new at;hc.set(-1,0,0,0,1,0,0,0,1);function w_(e,t,r,i,a,n){let s=new lt(0),o=a===!0?0:1,l,u,h=null,d=0,c=null;function f(b){let w=b.isScene===!0?b.background:null;if(w&&w.isTexture){let y=b.backgroundBlurriness>0;w=t.get(w,y)}return w}function g(b){let w=!1,y=f(b);y===null?m(s,o):y&&y.isColor&&(m(y,1),w=!0);let E=e.xr.getEnvironmentBlendMode();E==="additive"?r.buffers.color.setClear(0,0,0,1,n):E==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,n),(e.autoClear||w)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function v(b,w){let y=f(w);y&&(y.isCubeTexture||y.mapping===cs)?(u===void 0&&(u=new sr(new Sl(1,1,1),new dr({name:"BackgroundCubeMaterial",uniforms:Sa(zr.backgroundCube.uniforms),vertexShader:zr.backgroundCube.vertexShader,fragmentShader:zr.backgroundCube.fragmentShader,side:nr,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,C,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),u.material.uniforms.envMap.value=y,u.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(b_.makeRotationFromEuler(w.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&u.material.uniforms.backgroundRotation.value.premultiply(hc),u.material.toneMapped=dt.getTransfer(y.colorSpace)!==xt,(h!==y||d!==y.version||c!==e.toneMapping)&&(u.material.needsUpdate=!0,h=y,d=y.version,c=e.toneMapping),u.layers.enableAll(),b.unshift(u,u.geometry,u.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new sr(new an(2,2),new dr({name:"BackgroundMaterial",uniforms:Sa(zr.background.uniforms),vertexShader:zr.background.vertexShader,fragmentShader:zr.background.fragmentShader,side:Oi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.toneMapped=dt.getTransfer(y.colorSpace)!==xt,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||d!==y.version||c!==e.toneMapping)&&(l.material.needsUpdate=!0,h=y,d=y.version,c=e.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function m(b,w){b.getRGB(Yn,ac(e)),r.buffers.color.setClear(Yn.r,Yn.g,Yn.b,w,n)}function p(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(b,w=1){s.set(b),o=w,m(s,o)},getClearAlpha:function(){return o},setClearAlpha:function(b){o=b,m(s,o)},render:g,addToRenderList:v,dispose:p}}function A_(e,t){let r=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},a=c(null),n=a,s=!1;function o(N,F,q,A,O){let j=!1,G=d(N,A,q,F);n!==G&&(n=G,u(n.object)),j=f(N,A,q,O),j&&g(N,A,q,O),O!==null&&t.update(O,e.ELEMENT_ARRAY_BUFFER),(j||s)&&(s=!1,y(N,F,q,A),O!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(O).buffer))}function l(){return e.createVertexArray()}function u(N){return e.bindVertexArray(N)}function h(N){return e.deleteVertexArray(N)}function d(N,F,q,A){let O=A.wireframe===!0,j=i[F.id];j===void 0&&(j={},i[F.id]=j);let G=N.isInstancedMesh===!0?N.id:0,ce=j[G];ce===void 0&&(ce={},j[G]=ce);let X=ce[q.id];X===void 0&&(X={},ce[q.id]=X);let Y=X[O];return Y===void 0&&(Y=c(l()),X[O]=Y),Y}function c(N){let F=[],q=[],A=[];for(let O=0;O<r;O++)F[O]=0,q[O]=0,A[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:q,attributeDivisors:A,object:N,attributes:{},index:null}}function f(N,F,q,A){let O=n.attributes,j=F.attributes,G=0,ce=q.getAttributes();for(let X in ce)if(ce[X].location>=0){let Y=O[X],ee=j[X];if(ee===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(ee=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(ee=N.instanceColor)),Y===void 0||Y.attribute!==ee||ee&&Y.data!==ee.data)return!0;G++}return n.attributesNum!==G||n.index!==A}function g(N,F,q,A){let O={},j=F.attributes,G=0,ce=q.getAttributes();for(let X in ce)if(ce[X].location>=0){let Y=j[X];Y===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(Y=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(Y=N.instanceColor));let ee={};ee.attribute=Y,Y&&Y.data&&(ee.data=Y.data),O[X]=ee,G++}n.attributes=O,n.attributesNum=G,n.index=A}function v(){let N=n.newAttributes;for(let F=0,q=N.length;F<q;F++)N[F]=0}function m(N){p(N,0)}function p(N,F){let q=n.newAttributes,A=n.enabledAttributes,O=n.attributeDivisors;q[N]=1,A[N]===0&&(e.enableVertexAttribArray(N),A[N]=1),O[N]!==F&&(e.vertexAttribDivisor(N,F),O[N]=F)}function b(){let N=n.newAttributes,F=n.enabledAttributes;for(let q=0,A=F.length;q<A;q++)F[q]!==N[q]&&(e.disableVertexAttribArray(q),F[q]=0)}function w(N,F,q,A,O,j,G){G===!0?e.vertexAttribIPointer(N,F,q,O,j):e.vertexAttribPointer(N,F,q,A,O,j)}function y(N,F,q,A){v();let O=A.attributes,j=q.getAttributes(),G=F.defaultAttributeValues;for(let ce in j){let X=j[ce];if(X.location>=0){let Y=O[ce];if(Y===void 0&&(ce==="instanceMatrix"&&N.instanceMatrix&&(Y=N.instanceMatrix),ce==="instanceColor"&&N.instanceColor&&(Y=N.instanceColor)),Y!==void 0){let ee=Y.normalized,Ge=Y.itemSize,we=t.get(Y);if(we===void 0)continue;let gt=we.buffer,Ze=we.type,J=we.bytesPerElement,re=Ze===e.INT||Ze===e.UNSIGNED_INT||Y.gpuType===ul;if(Y.isInterleavedBufferAttribute){let oe=Y.data,Pe=oe.stride,Ne=Y.offset;if(oe.isInstancedInterleavedBuffer){for(let pe=0;pe<X.locationSize;pe++)p(X.location+pe,oe.meshPerAttribute);N.isInstancedMesh!==!0&&A._maxInstanceCount===void 0&&(A._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let pe=0;pe<X.locationSize;pe++)m(X.location+pe);e.bindBuffer(e.ARRAY_BUFFER,gt);for(let pe=0;pe<X.locationSize;pe++)w(X.location+pe,Ge/X.locationSize,Ze,ee,Pe*J,(Ne+Ge/X.locationSize*pe)*J,re)}else{if(Y.isInstancedBufferAttribute){for(let oe=0;oe<X.locationSize;oe++)p(X.location+oe,Y.meshPerAttribute);N.isInstancedMesh!==!0&&A._maxInstanceCount===void 0&&(A._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let oe=0;oe<X.locationSize;oe++)m(X.location+oe);e.bindBuffer(e.ARRAY_BUFFER,gt);for(let oe=0;oe<X.locationSize;oe++)w(X.location+oe,Ge/X.locationSize,Ze,ee,Ge*J,Ge/X.locationSize*oe*J,re)}}else if(G!==void 0){let ee=G[ce];if(ee!==void 0)switch(ee.length){case 2:e.vertexAttrib2fv(X.location,ee);break;case 3:e.vertexAttrib3fv(X.location,ee);break;case 4:e.vertexAttrib4fv(X.location,ee);break;default:e.vertexAttrib1fv(X.location,ee)}}}}b()}function E(){T();for(let N in i){let F=i[N];for(let q in F){let A=F[q];for(let O in A){let j=A[O];for(let G in j)h(j[G].object),delete j[G];delete A[O]}}delete i[N]}}function C(N){if(i[N.id]===void 0)return;let F=i[N.id];for(let q in F){let A=F[q];for(let O in A){let j=A[O];for(let G in j)h(j[G].object),delete j[G];delete A[O]}}delete i[N.id]}function R(N){for(let F in i){let q=i[F];for(let A in q){let O=q[A];if(O[N.id]===void 0)continue;let j=O[N.id];for(let G in j)h(j[G].object),delete j[G];delete O[N.id]}}}function _(N){for(let F in i){let q=i[F],A=N.isInstancedMesh===!0?N.id:0,O=q[A];if(O!==void 0){for(let j in O){let G=O[j];for(let ce in G)h(G[ce].object),delete G[ce];delete O[j]}delete q[A],Object.keys(q).length===0&&delete i[F]}}}function T(){H(),s=!0,n!==a&&(n=a,u(n.object))}function H(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:o,reset:T,resetDefaultState:H,dispose:E,releaseStatesOfGeometry:C,releaseStatesOfObject:_,releaseStatesOfProgram:R,initAttributes:v,enableAttribute:m,disableUnusedAttributes:b}}function R_(e,t,r){let i;function a(l){i=l}function n(l,u){e.drawArrays(i,l,u),r.update(u,i,1)}function s(l,u,h){h!==0&&(e.drawArraysInstanced(i,l,u,h),r.update(u,i,h))}function o(l,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,u,0,h);let d=0;for(let c=0;c<h;c++)d+=u[c];r.update(d,i,1)}this.setMode=a,this.render=n,this.renderInstances=s,this.renderMultiDraw=o}function C_(e,t,r,i){let a;function n(){if(a!==void 0)return a;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");a=e.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function s(R){return!(R!==Lr&&i.convert(R)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let _=R===Gr&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==Sr&&R!==Br&&!_&&i.convert(R)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=r.precision!==void 0?r.precision:"highp",h=l(u);h!==u&&(Je("WebGLRenderer:",u,"not supported, using",h,"instead."),u=h);let d=r.logarithmicDepthBuffer===!0,c=r.reversedDepthBuffer===!0&&t.has("EXT_clip_control");r.reversedDepthBuffer===!0&&c===!1&&Je("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),g=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=e.getParameter(e.MAX_TEXTURE_SIZE),m=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),p=e.getParameter(e.MAX_VERTEX_ATTRIBS),b=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),w=e.getParameter(e.MAX_VARYING_VECTORS),y=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),E=e.getParameter(e.MAX_SAMPLES),C=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:n,getMaxPrecision:l,textureFormatReadable:s,textureTypeReadable:o,precision:u,logarithmicDepthBuffer:d,reversedDepthBuffer:c,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:b,maxVaryings:w,maxFragmentUniforms:y,maxSamples:E,samples:C}}function P_(e){let t=this,r=null,i=0,a=!1,n=!1,s=new vi,o=new at,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,c){let f=d.length!==0||c||i!==0||a;return a=c,i=d.length,f},this.beginShadows=function(){n=!0,h(null)},this.endShadows=function(){n=!1},this.setGlobalState=function(d,c){r=h(d,c,0)},this.setState=function(d,c,f){let g=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=e.get(d);if(!a||g===null||g.length===0||n&&!m)n?h(null):u();else{let b=n?0:i,w=b*4,y=p.clippingState||null;l.value=y,y=h(g,c,w,f);for(let E=0;E!==w;++E)y[E]=r[E];p.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function u(){l.value!==r&&(l.value=r,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(d,c,f,g){let v=d!==null?d.length:0,m=null;if(v!==0){if(m=l.value,g!==!0||m===null){let p=f+v*4,b=c.matrixWorldInverse;o.getNormalMatrix(b),(m===null||m.length<p)&&(m=new Float32Array(p));for(let w=0,y=f;w!==v;++w,y+=4)s.copy(d[w]).applyMatrix4(b,o),s.normal.toArray(m,y),m[y+3]=s.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}var fa=4,L_=6,N_=20,D_=256,ka=new lc,Hu=new lt,ho=null,co=0,po=0,fo=!1,U_=new z,Ni=new z,Gu=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,r=.1,i=100,a={}){let{size:n=256,position:s=U_}=a;ho=this._renderer.getRenderTarget(),co=this._renderer.getActiveCubeFace(),po=this._renderer.getActiveMipmapLevel(),fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(n);let o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,r,i,o,s),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ho,co,po),this._renderer.xr.enabled=fo,e.scissorTest=!1,ha(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Fi||e.mapping===_a?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ho=this._renderer.getRenderTarget(),co=this._renderer.getActiveCubeFace(),po=this._renderer.getActiveMipmapLevel(),fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:Qt,minFilter:Qt,generateMipmaps:!1,type:Gr,format:Lr,colorSpace:os,depthBuffer:!1},i=Wu(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Wu(e,t,r);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=I_(a)),this._blurMaterial=F_(a,e,t),this._ggxMaterial=O_(a,e,t)}return i}_compileMaterial(e){let t=new sr(new Si,e);this._renderer.compile(t,ka)}_sceneToCubeUV(e,t,r,i,a){let n=new cr(90,1,t,r),s=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],l=this._renderer,u=l.autoClear,h=l.toneMapping;l.getClearColor(Hu),l.toneMapping=Vr,l.autoClear=!1,l.state.buffers.depth.getReversed()&&(l.setRenderTarget(i),l.clearDepth(),l.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new sr(new Sl,new Vh({name:"PMREM.Background",side:nr,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,c=d.material,f=!1,g=e.background;g?g.isColor&&(c.color.copy(g),e.background=null,f=!0):(c.color.copy(Hu),f=!0);for(let v=0;v<6;v++){let m=v%3;m===0?(n.up.set(0,s[v],0),n.position.set(a.x,a.y,a.z),n.lookAt(a.x+o[v],a.y,a.z)):m===1?(n.up.set(0,0,s[v]),n.position.set(a.x,a.y,a.z),n.lookAt(a.x,a.y+o[v],a.z)):(n.up.set(0,s[v],0),n.position.set(a.x,a.y,a.z),n.lookAt(a.x,a.y,a.z+o[v]));let p=this._cubeSize;ha(i,m*p,v>2?p:0,p,p),l.setRenderTarget(i),f&&l.render(d,n),l.render(e,n)}l.toneMapping=h,l.autoClear=u,e.background=g}_textureToCubeUV(e,t){let r=this._renderer,i=e.mapping===Fi||e.mapping===_a;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=qu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xu());let a=i?this._cubemapMaterial:this._equirectMaterial,n=this._lodMeshes[0];n.material=a;let s=a.uniforms;s.envMap.value=e;let o=this._cubeSize;ha(t,0,0,3*o,2*o),r.setRenderTarget(t),r.render(n,ka)}_applyPMREM(e){let t=this._renderer,r=t.autoClear;t.autoClear=!1;let i=this._lodMeshes.length;for(let a=1;a<i;a++)this._applyGGXFilter(e,a-1,a);t.autoClear=r}_applyGGXFilter(e,t,r){let i=this._renderer,a=this._pingPongRenderTarget,n=this._ggxMaterial,s=this._lodMeshes[r];s.material=n;let o=n.uniforms,l=r/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(l*l-u*u),d=l*1.25,c=h*d,{_lodMax:f}=this,g=this._sizeLods[r],v=3*g*(r>f-fa?r-f+fa:0),m=4*(this._cubeSize-g);o.envMap.value=e.texture,o.roughness.value=c,o.mipInt.value=f-t,ha(a,v,m,3*g,2*g),i.setRenderTarget(a),i.render(s,ka),o.envMap.value=a.texture,o.roughness.value=0,o.mipInt.value=f-r,ha(e,v,m,3*g,2*g),i.setRenderTarget(e),i.render(s,ka)}_blur(e,t,r,i){let a=this._pingPongRenderTarget,n=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(e,a,t,r,n),this._blurPass(a,e,r,r,n)}_blurPass(e,t,r,i,a){let n=this._renderer,s=this._blurMaterial,o=this._lodMeshes[i];o.material=s;let l=s.uniforms;l.envMap.value=e.texture,l.sigma.value=a,l.mipInt.value=this._lodMax-r;let u=this._sizeLods[i],h=3*u*(i>this._lodMax-fa?i-this._lodMax+fa:0),d=4*(this._cubeSize-u);ha(t,h,d,3*u,2*u),n.setRenderTarget(t),n.render(o,ka)}};function I_(e){let t=[],r=[],i=e,a=e-fa+1+L_;for(let n=0;n<a;n++){let s=Math.pow(2,i);t.push(s);let o=1/(s-2),l=-o,u=1+o,h=[l,l,u,l,u,u,l,l,u,u,l,u],d=6,c=6,f=3,g=new Float32Array(f*c*d),v=new Float32Array(f*c*d);for(let p=0;p<d;p++){let b=p%3*2/3-1,w=p>2?0:-1,y=[b,w,0,b+2/3,w,0,b+2/3,w+1,0,b,w,0,b+2/3,w+1,0,b,w+1,0];g.set(y,f*c*p);for(let E=0;E<c;E++){let C=h[E*2]*2-1,R=h[E*2+1]*2-1;p===0?Ni.set(1,R,C):p===1?Ni.set(-C,1,-R):p===2?Ni.set(-C,R,1):p===3?Ni.set(-1,R,-C):p===4?Ni.set(-C,-1,R):Ni.set(C,R,-1),Ni.toArray(v,(p*c+E)*f)}}let m=new Si;m.setAttribute("position",new ai(g,f)),m.setAttribute("outputDirection",new ai(v,f)),r.push(new sr(m,null)),i>fa&&i--}return{lodMeshes:r,sizeLods:t}}function Wu(e,t,r){let i=new Nr(e,t,r);return i.texture.mapping=cs,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ha(e,t,r,i,a){e.viewport.set(t,r,i,a),e.scissor.set(t,r,i,a)}function O_(e,t,r){return new dr({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:D_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/r,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:fs(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function F_(e,t,r){return new dr({name:"SphericalGaussianBlur",defines:{SAMPLES:N_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/r,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:fs(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function Xu(){return new dr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:fs(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function qu(){return new dr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:fs(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function fs(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var cc=class extends Nr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let r={width:e,height:e,depth:1},i=[r,r,r,r,r,r];this.texture=new Gh(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Sl(5,5,5),a=new dr({name:"CubemapFromEquirect",uniforms:Sa(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:nr,blending:ri});a.uniforms.tEquirect.value=t;let n=new sr(i,a),s=t.minFilter;return t.minFilter===Di&&(t.minFilter=Qt),new Lf(1,10,this).update(e,n),t.minFilter=s,n.geometry.dispose(),n.material.dispose(),this}clear(e,t=!0,r=!0,i=!0){let a=e.getRenderTarget();for(let n=0;n<6;n++)e.setRenderTarget(this,n),e.clear(t,r,i);e.setRenderTarget(a)}};function z_(e){let t=new WeakMap,r=new WeakMap,i=null;function a(c,f=!1){return c==null?null:f?s(c):n(c)}function n(c){if(c&&c.isTexture){let f=c.mapping;if(f===Ds||f===Us)if(t.has(c)){let g=t.get(c).texture;return o(g,c.mapping)}else{let g=c.image;if(g&&g.height>0){let v=new cc(g.height);return v.fromEquirectangularTexture(e,c),t.set(c,v),c.addEventListener("dispose",u),o(v.texture,c.mapping)}else return null}}return c}function s(c){if(c&&c.isTexture){let f=c.mapping,g=f===Ds||f===Us,v=f===Fi||f===_a;if(g||v){let m=r.get(c),p=m!==void 0?m.texture.pmremVersion:0;if(c.isRenderTargetTexture&&c.pmremVersion!==p)return i===null&&(i=new Gu(e)),m=g?i.fromEquirectangular(c,m):i.fromCubemap(c,m),m.texture.pmremVersion=c.pmremVersion,r.set(c,m),m.texture;if(m!==void 0)return m.texture;{let b=c.image;return g&&b&&b.height>0||v&&b&&l(b)?(i===null&&(i=new Gu(e)),m=g?i.fromEquirectangular(c):i.fromCubemap(c),m.texture.pmremVersion=c.pmremVersion,r.set(c,m),c.addEventListener("dispose",h),m.texture):null}}}return c}function o(c,f){return f===Ds?c.mapping=Fi:f===Us&&(c.mapping=_a),c}function l(c){let f=0,g=6;for(let v=0;v<g;v++)c[v]!==void 0&&f++;return f===g}function u(c){let f=c.target;f.removeEventListener("dispose",u);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(c){let f=c.target;f.removeEventListener("dispose",h);let g=r.get(f);g!==void 0&&(r.delete(f),g.dispose())}function d(){t=new WeakMap,r=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:a,dispose:d}}function B_(e){let t={};function r(i){if(t[i]!==void 0)return t[i];let a=e.getExtension(i);return t[i]=a,a}return{has:function(i){return r(i)!==null},init:function(){r("EXT_color_buffer_float"),r("WEBGL_clip_cull_distance"),r("OES_texture_float_linear"),r("EXT_color_buffer_half_float"),r("WEBGL_multisampled_render_to_texture"),r("WEBGL_render_shared_exponent")},get:function(i){let a=r(i);return a===null&&ma("WebGLRenderer: "+i+" extension not supported."),a}}}function k_(e,t,r,i){let a={},n=new WeakMap;function s(d){let c=d.target;c.index!==null&&t.remove(c.index);for(let g in c.attributes)t.remove(c.attributes[g]);c.removeEventListener("dispose",s),delete a[c.id];let f=n.get(c);f&&(t.remove(f),n.delete(c)),i.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,r.memory.geometries--}function o(d,c){return a[c.id]===!0||(c.addEventListener("dispose",s),a[c.id]=!0,r.memory.geometries++),c}function l(d){let c=d.attributes;for(let f in c)t.update(c[f],e.ARRAY_BUFFER)}function u(d){let c=[],f=d.index,g=d.attributes.position,v=0;if(g===void 0)return;if(f!==null){let b=f.array;v=f.version;for(let w=0,y=b.length;w<y;w+=3){let E=b[w+0],C=b[w+1],R=b[w+2];c.push(E,C,C,R,R,E)}}else{let b=g.array;v=g.version;for(let w=0,y=b.length/3-1;w<y;w+=3){let E=w+0,C=w+1,R=w+2;c.push(E,C,C,R,R,E)}}let m=new(g.count>=65535?Bh:zh)(c,1);m.version=v;let p=n.get(d);p&&t.remove(p),n.set(d,m)}function h(d){let c=n.get(d);if(c){let f=d.index;f!==null&&c.version<f.version&&u(d)}else u(d);return n.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function V_(e,t,r){let i;function a(d){i=d}let n,s;function o(d){n=d.type,s=d.bytesPerElement}function l(d,c){e.drawElements(i,c,n,d*s),r.update(c,i,1)}function u(d,c,f){f!==0&&(e.drawElementsInstanced(i,c,n,d*s,f),r.update(c,i,f))}function h(d,c,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,c,0,n,d,0,f);let g=0;for(let v=0;v<f;v++)g+=c[v];r.update(g,i,1)}this.setMode=a,this.setIndex=o,this.render=l,this.renderInstances=u,this.renderMultiDraw=h}function H_(e){let t={geometries:0,textures:0},r={frame:0,calls:0,triangles:0,points:0,lines:0};function i(n,s,o){switch(r.calls++,s){case e.TRIANGLES:r.triangles+=o*(n/3);break;case e.LINES:r.lines+=o*(n/2);break;case e.LINE_STRIP:r.lines+=o*(n-1);break;case e.LINE_LOOP:r.lines+=o*n;break;case e.POINTS:r.points+=o*n;break;default:Qe("WebGLInfo: Unknown draw mode:",s);break}}function a(){r.calls=0,r.triangles=0,r.points=0,r.lines=0}return{memory:t,render:r,programs:null,autoReset:!0,reset:a,update:i}}function G_(e,t,r){let i=new WeakMap,a=new Pt;function n(s,o,l){let u=s.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,c=i.get(o);if(c===void 0||c.count!==d){let f=function(){_.dispose(),i.delete(o),o.removeEventListener("dispose",f)};c!==void 0&&c.texture.dispose();let g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],b=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],y=0;g===!0&&(y=1),v===!0&&(y=2),m===!0&&(y=3);let E=o.attributes.position.count*y,C=1;E>t.maxTextureSize&&(C=Math.ceil(E/t.maxTextureSize),E=t.maxTextureSize);let R=new Float32Array(E*C*4*d),_=new Nh(R,E,C,d);_.type=Br,_.needsUpdate=!0;let T=y*4;for(let H=0;H<d;H++){let N=p[H],F=b[H],q=w[H],A=E*C*4*H;for(let O=0;O<N.count;O++){let j=O*T;g===!0&&(a.fromBufferAttribute(N,O),R[A+j+0]=a.x,R[A+j+1]=a.y,R[A+j+2]=a.z,R[A+j+3]=0),v===!0&&(a.fromBufferAttribute(F,O),R[A+j+4]=a.x,R[A+j+5]=a.y,R[A+j+6]=a.z,R[A+j+7]=0),m===!0&&(a.fromBufferAttribute(q,O),R[A+j+8]=a.x,R[A+j+9]=a.y,R[A+j+10]=a.z,R[A+j+11]=q.itemSize===4?a.w:1)}}c={count:d,texture:_,size:new Me(E,C)},i.set(o,c),o.addEventListener("dispose",f)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",s.morphTexture,r);else{let f=0;for(let v=0;v<u.length;v++)f+=u[v];let g=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(e,"morphTargetBaseInfluence",g),l.getUniforms().setValue(e,"morphTargetInfluences",u)}l.getUniforms().setValue(e,"morphTargetsTexture",c.texture,r),l.getUniforms().setValue(e,"morphTargetsTextureSize",c.size)}return{update:n}}function W_(e,t,r,i,a){let n=new WeakMap;function s(u){let h=a.render.frame,d=u.geometry,c=t.get(u,d);if(n.get(c)!==h&&(t.update(c),n.set(c,h)),u.isInstancedMesh&&(u.hasEventListener("dispose",l)===!1&&u.addEventListener("dispose",l),n.get(u)!==h&&(r.update(u.instanceMatrix,e.ARRAY_BUFFER),u.instanceColor!==null&&r.update(u.instanceColor,e.ARRAY_BUFFER),n.set(u,h))),u.isSkinnedMesh){let f=u.skeleton;n.get(f)!==h&&(f.update(),n.set(f,h))}return c}function o(){n=new WeakMap}function l(u){let h=u.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),r.remove(h.instanceMatrix),h.instanceColor!==null&&r.remove(h.instanceColor)}return{update:s,dispose:o}}var X_={[ph]:"LINEAR_TONE_MAPPING",[fh]:"REINHARD_TONE_MAPPING",[mh]:"CINEON_TONE_MAPPING",[gh]:"ACES_FILMIC_TONE_MAPPING",[vh]:"AGX_TONE_MAPPING",[xh]:"NEUTRAL_TONE_MAPPING",[_h]:"CUSTOM_TONE_MAPPING"};function q_(e,t,r,i,a,n){let s=new Nr(t,r,{type:e,depthBuffer:a,stencilBuffer:n,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,u=new Si;u.setAttribute("position",new Dr([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new Dr([0,2,0,0,2,0],2));let h=new mf({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new sr(u,h),c=new lc(-1,1,1,-1,0,1),f=null,g=null,v=!1,m,p=null,b=[],w=!1;this.setSize=function(y,E){s.setSize(y,E),o!==null&&o.setSize(y,E),l!==null&&l.setSize(y,E);for(let C=0;C<b.length;C++){let R=b[C];R.setSize&&R.setSize(y,E)}},this.setEffects=function(y){b=y,w=b.length>0&&b[0].isRenderPass===!0;let E=s.width,C=s.height;b.length>0&&o===null&&(o=new Nr(E,C,{type:Gr,depthBuffer:!1,stencilBuffer:!1}),l=new Nr(E,C,{type:Gr,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<b.length;R++){let _=b[R];_.setSize&&_.setSize(E,C)}},this.begin=function(y,E){if(v||y.toneMapping===Vr&&b.length===0)return!1;if(p=E,E!==null){let C=E.width,R=E.height;(s.width!==C||s.height!==R)&&this.setSize(C,R)}return w===!1&&y.setRenderTarget(s),m=y.toneMapping,y.toneMapping=Vr,!0},this.hasRenderPass=function(){return w},this.end=function(y,E){y.toneMapping=m,v=!0;let C=s,R=o;for(let _=0;_<b.length;_++){let T=b[_];T.enabled!==!1&&(T.render(y,R,C,E),T.needsSwap!==!1&&(C=R,R=R===o?l:o))}if(f!==y.outputColorSpace||g!==y.toneMapping){f=y.outputColorSpace,g=y.toneMapping,h.defines={},dt.getTransfer(f)===xt&&(h.defines.SRGB_TRANSFER="");let _=X_[g];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=C.texture,y.setRenderTarget(p),y.render(d,c),p=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){s.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),h.dispose()}}var dc=new yr,ol=new $a(1,1),pc=new Nh,fc=new dp,mc=new Gh,ju=[],Yu=[],Ku=new Float32Array(16),Ju=new Float32Array(9),Zu=new Float32Array(4);function Ma(e,t,r){let i=e[0];if(i<=0||i>0)return e;let a=t*r,n=ju[a];if(n===void 0&&(n=new Float32Array(a),ju[a]=n),t!==0){i.toArray(n,0);for(let s=1,o=0;s!==t;++s)o+=r,e[s].toArray(n,o)}return n}function Xt(e,t){if(e.length!==t.length)return!1;for(let r=0,i=e.length;r<i;r++)if(e[r]!==t[r])return!1;return!0}function qt(e,t){for(let r=0,i=t.length;r<i;r++)e[r]=t[r]}function ms(e,t){let r=Yu[t];r===void 0&&(r=new Int32Array(t),Yu[t]=r);for(let i=0;i!==t;++i)r[i]=e.allocateTextureUnit();return r}function j_(e,t){let r=this.cache;r[0]!==t&&(e.uniform1f(this.addr,t),r[0]=t)}function Y_(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),r[0]=t.x,r[1]=t.y);else{if(Xt(r,t))return;e.uniform2fv(this.addr,t),qt(r,t)}}function K_(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),r[0]=t.x,r[1]=t.y,r[2]=t.z);else if(t.r!==void 0)(r[0]!==t.r||r[1]!==t.g||r[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),r[0]=t.r,r[1]=t.g,r[2]=t.b);else{if(Xt(r,t))return;e.uniform3fv(this.addr,t),qt(r,t)}}function J_(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z||r[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),r[0]=t.x,r[1]=t.y,r[2]=t.z,r[3]=t.w);else{if(Xt(r,t))return;e.uniform4fv(this.addr,t),qt(r,t)}}function Z_(e,t){let r=this.cache,i=t.elements;if(i===void 0){if(Xt(r,t))return;e.uniformMatrix2fv(this.addr,!1,t),qt(r,t)}else{if(Xt(r,i))return;Zu.set(i),e.uniformMatrix2fv(this.addr,!1,Zu),qt(r,i)}}function $_(e,t){let r=this.cache,i=t.elements;if(i===void 0){if(Xt(r,t))return;e.uniformMatrix3fv(this.addr,!1,t),qt(r,t)}else{if(Xt(r,i))return;Ju.set(i),e.uniformMatrix3fv(this.addr,!1,Ju),qt(r,i)}}function Q_(e,t){let r=this.cache,i=t.elements;if(i===void 0){if(Xt(r,t))return;e.uniformMatrix4fv(this.addr,!1,t),qt(r,t)}else{if(Xt(r,i))return;Ku.set(i),e.uniformMatrix4fv(this.addr,!1,Ku),qt(r,i)}}function e0(e,t){let r=this.cache;r[0]!==t&&(e.uniform1i(this.addr,t),r[0]=t)}function t0(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),r[0]=t.x,r[1]=t.y);else{if(Xt(r,t))return;e.uniform2iv(this.addr,t),qt(r,t)}}function r0(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),r[0]=t.x,r[1]=t.y,r[2]=t.z);else{if(Xt(r,t))return;e.uniform3iv(this.addr,t),qt(r,t)}}function i0(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z||r[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),r[0]=t.x,r[1]=t.y,r[2]=t.z,r[3]=t.w);else{if(Xt(r,t))return;e.uniform4iv(this.addr,t),qt(r,t)}}function a0(e,t){let r=this.cache;r[0]!==t&&(e.uniform1ui(this.addr,t),r[0]=t)}function n0(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),r[0]=t.x,r[1]=t.y);else{if(Xt(r,t))return;e.uniform2uiv(this.addr,t),qt(r,t)}}function s0(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),r[0]=t.x,r[1]=t.y,r[2]=t.z);else{if(Xt(r,t))return;e.uniform3uiv(this.addr,t),qt(r,t)}}function o0(e,t){let r=this.cache;if(t.x!==void 0)(r[0]!==t.x||r[1]!==t.y||r[2]!==t.z||r[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),r[0]=t.x,r[1]=t.y,r[2]=t.z,r[3]=t.w);else{if(Xt(r,t))return;e.uniform4uiv(this.addr,t),qt(r,t)}}function l0(e,t,r){let i=this.cache,a=r.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a);let n;this.type===e.SAMPLER_2D_SHADOW?(ol.compareFunction=r.isReversedDepthBuffer()?gl:ml,n=ol):n=dc,r.setTexture2D(t||n,a)}function u0(e,t,r){let i=this.cache,a=r.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),r.setTexture3D(t||fc,a)}function h0(e,t,r){let i=this.cache,a=r.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),r.setTextureCube(t||mc,a)}function c0(e,t,r){let i=this.cache,a=r.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),r.setTexture2DArray(t||pc,a)}function d0(e){switch(e){case 5126:return j_;case 35664:return Y_;case 35665:return K_;case 35666:return J_;case 35674:return Z_;case 35675:return $_;case 35676:return Q_;case 5124:case 35670:return e0;case 35667:case 35671:return t0;case 35668:case 35672:return r0;case 35669:case 35673:return i0;case 5125:return a0;case 36294:return n0;case 36295:return s0;case 36296:return o0;case 35678:case 36198:case 36298:case 36306:case 35682:return l0;case 35679:case 36299:case 36307:return u0;case 35680:case 36300:case 36308:case 36293:return h0;case 36289:case 36303:case 36311:case 36292:return c0}}function p0(e,t){e.uniform1fv(this.addr,t)}function f0(e,t){let r=Ma(t,this.size,2);e.uniform2fv(this.addr,r)}function m0(e,t){let r=Ma(t,this.size,3);e.uniform3fv(this.addr,r)}function g0(e,t){let r=Ma(t,this.size,4);e.uniform4fv(this.addr,r)}function _0(e,t){let r=Ma(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,r)}function v0(e,t){let r=Ma(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,r)}function x0(e,t){let r=Ma(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,r)}function S0(e,t){e.uniform1iv(this.addr,t)}function y0(e,t){e.uniform2iv(this.addr,t)}function M0(e,t){e.uniform3iv(this.addr,t)}function T0(e,t){e.uniform4iv(this.addr,t)}function E0(e,t){e.uniform1uiv(this.addr,t)}function b0(e,t){e.uniform2uiv(this.addr,t)}function w0(e,t){e.uniform3uiv(this.addr,t)}function A0(e,t){e.uniform4uiv(this.addr,t)}function R0(e,t,r){let i=this.cache,a=t.length,n=ms(r,a);Xt(i,n)||(e.uniform1iv(this.addr,n),qt(i,n));let s;this.type===e.SAMPLER_2D_SHADOW?s=ol:s=dc;for(let o=0;o!==a;++o)r.setTexture2D(t[o]||s,n[o])}function C0(e,t,r){let i=this.cache,a=t.length,n=ms(r,a);Xt(i,n)||(e.uniform1iv(this.addr,n),qt(i,n));for(let s=0;s!==a;++s)r.setTexture3D(t[s]||fc,n[s])}function P0(e,t,r){let i=this.cache,a=t.length,n=ms(r,a);Xt(i,n)||(e.uniform1iv(this.addr,n),qt(i,n));for(let s=0;s!==a;++s)r.setTextureCube(t[s]||mc,n[s])}function L0(e,t,r){let i=this.cache,a=t.length,n=ms(r,a);Xt(i,n)||(e.uniform1iv(this.addr,n),qt(i,n));for(let s=0;s!==a;++s)r.setTexture2DArray(t[s]||pc,n[s])}function N0(e){switch(e){case 5126:return p0;case 35664:return f0;case 35665:return m0;case 35666:return g0;case 35674:return _0;case 35675:return v0;case 35676:return x0;case 5124:case 35670:return S0;case 35667:case 35671:return y0;case 35668:case 35672:return M0;case 35669:case 35673:return T0;case 5125:return E0;case 36294:return b0;case 36295:return w0;case 36296:return A0;case 35678:case 36198:case 36298:case 36306:case 35682:return R0;case 35679:case 36299:case 36307:return C0;case 35680:case 36300:case 36308:case 36293:return P0;case 36289:case 36303:case 36311:case 36292:return L0}}var D0=class{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=d0(t.type)}},U0=class{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=N0(t.type)}},I0=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){let i=this.seq;for(let a=0,n=i.length;a!==n;++a){let s=i[a];s.setValue(e,t[s.id],r)}}},mo=/(\w+)(\])?(\[|\.)?/g;function $u(e,t){e.seq.push(t),e.map[t.id]=t}function O0(e,t,r){let i=e.name,a=i.length;for(mo.lastIndex=0;;){let n=mo.exec(i),s=mo.lastIndex,o=n[1],l=n[2]==="]",u=n[3];if(l&&(o=o|0),u===void 0||u==="["&&s+2===a){$u(r,u===void 0?new D0(o,e,t):new U0(o,e,t));break}else{let h=r.map[o];h===void 0&&(h=new I0(o),$u(r,h)),r=h}}}var is=class{constructor(e,t){this.seq=[],this.map={};let r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let n=0;n<r;++n){let s=e.getActiveUniform(t,n),o=e.getUniformLocation(t,s.name);O0(s,o,this)}let i=[],a=[];for(let n of this.seq)n.type===e.SAMPLER_2D_SHADOW||n.type===e.SAMPLER_CUBE_SHADOW||n.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(n):a.push(n);i.length>0&&(this.seq=i.concat(a))}setValue(e,t,r,i){let a=this.map[t];a!==void 0&&a.setValue(e,r,i)}setOptional(e,t,r){let i=t[r];i!==void 0&&this.setValue(e,r,i)}static upload(e,t,r,i){for(let a=0,n=t.length;a!==n;++a){let s=t[a],o=r[s.id];o.needsUpdate!==!1&&s.setValue(e,o.value,i)}}static seqWithValue(e,t){let r=[];for(let i=0,a=e.length;i!==a;++i){let n=e[i];n.id in t&&r.push(n)}return r}};function Qu(e,t,r){let i=e.createShader(t);return e.shaderSource(i,r),e.compileShader(i),i}var F0=37297,z0=0;function B0(e,t){let r=e.split(`
`),i=[],a=Math.max(t-6,0),n=Math.min(t+6,r.length);for(let s=a;s<n;s++){let o=s+1;i.push(`${o===t?">":" "} ${o}: ${r[s]}`)}return i.join(`
`)}var eh=new at;function k0(e){dt._getMatrix(eh,dt.workingColorSpace,e);let t=`mat3( ${eh.elements.map(r=>r.toFixed(4))} )`;switch(dt.getTransfer(e)){case ls:return[t,"LinearTransferOETF"];case xt:return[t,"sRGBTransferOETF"];default:return Je("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function th(e,t,r){let i=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let n=/ERROR: 0:(\d+)/.exec(a);if(n){let s=parseInt(n[1]);return r.toUpperCase()+`

`+a+`

`+B0(e.getShaderSource(t),s)}else return a}function V0(e,t){let r=k0(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${r[1]}( vec4( value.rgb * ${r[0]}, value.a ) );`,"}"].join(`
`)}var H0={[ph]:"Linear",[fh]:"Reinhard",[mh]:"Cineon",[gh]:"ACESFilmic",[vh]:"AgX",[xh]:"Neutral",[_h]:"Custom"};function G0(e,t){let r=H0[t];return r===void 0?(Je("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+r+"ToneMapping( color ); }"}var Kn=new z;function W0(){dt.getLuminanceCoefficients(Kn);let e=Kn.x.toFixed(4),t=Kn.y.toFixed(4),r=Kn.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${r} );`,"	return dot( weights, rgb );","}"].join(`
`)}function X0(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Wa).join(`
`)}function q0(e){let t=[];for(let r in e){let i=e[r];i!==!1&&t.push("#define "+r+" "+i)}return t.join(`
`)}function j0(e,t){let r={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let a=0;a<i;a++){let n=e.getActiveAttrib(t,a),s=n.name,o=1;n.type===e.FLOAT_MAT2&&(o=2),n.type===e.FLOAT_MAT3&&(o=3),n.type===e.FLOAT_MAT4&&(o=4),r[s]={type:n.type,location:e.getAttribLocation(t,s),locationSize:o}}return r}function Wa(e){return e!==""}function rh(e,t){let r=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,r).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ih(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Y0=/^[ \t]*#include +<([\w\d./]+)>/gm;function ll(e){return e.replace(Y0,J0)}var K0=new Map;function J0(e,t){let r=ot[t];if(r===void 0){let i=K0.get(t);if(i!==void 0)r=ot[i],Je('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return ll(r)}var Z0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ah(e){return e.replace(Z0,$0)}function $0(e,t,r,i){let a="";for(let n=parseInt(t);n<parseInt(r);n++)a+=i.replace(/\[\s*i\s*\]/g,"[ "+n+" ]").replace(/UNROLLED_LOOP_INDEX/g,n);return a}function nh(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Q0={[Jn]:"SHADOWMAP_TYPE_PCF",[Ha]:"SHADOWMAP_TYPE_VSM"};function ev(e){return Q0[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var tv={[Fi]:"ENVMAP_TYPE_CUBE",[_a]:"ENVMAP_TYPE_CUBE",[cs]:"ENVMAP_TYPE_CUBE_UV"};function rv(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":tv[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var iv={[_a]:"ENVMAP_MODE_REFRACTION"};function av(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":iv[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var nv={[dh]:"ENVMAP_BLENDING_MULTIPLY",[Hd]:"ENVMAP_BLENDING_MIX",[Gd]:"ENVMAP_BLENDING_ADD"};function sv(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":nv[e.combine]||"ENVMAP_BLENDING_NONE"}function ov(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let r=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,r),112)),texelHeight:i,maxMip:r}}function lv(e,t,r,i){let a=e.getContext(),n=r.defines,s=r.vertexShader,o=r.fragmentShader,l=ev(r),u=rv(r),h=av(r),d=sv(r),c=ov(r),f=X0(r),g=q0(n),v=a.createProgram(),m,p,b=r.glslVersion?"#version "+r.glslVersion+`
`:"";r.isRawShaderMaterial?(m=["#define SHADER_TYPE "+r.shaderType,"#define SHADER_NAME "+r.shaderName,g].filter(Wa).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+r.shaderType,"#define SHADER_NAME "+r.shaderName,g].filter(Wa).join(`
`),p.length>0&&(p+=`
`)):(m=[nh(r),"#define SHADER_TYPE "+r.shaderType,"#define SHADER_NAME "+r.shaderName,g,r.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",r.batching?"#define USE_BATCHING":"",r.batchingColor?"#define USE_BATCHING_COLOR":"",r.instancing?"#define USE_INSTANCING":"",r.instancingColor?"#define USE_INSTANCING_COLOR":"",r.instancingMorph?"#define USE_INSTANCING_MORPH":"",r.useFog&&r.fog?"#define USE_FOG":"",r.useFog&&r.fogExp2?"#define FOG_EXP2":"",r.map?"#define USE_MAP":"",r.envMap?"#define USE_ENVMAP":"",r.envMap?"#define "+h:"",r.lightMap?"#define USE_LIGHTMAP":"",r.aoMap?"#define USE_AOMAP":"",r.bumpMap?"#define USE_BUMPMAP":"",r.normalMap?"#define USE_NORMALMAP":"",r.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",r.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",r.displacementMap?"#define USE_DISPLACEMENTMAP":"",r.emissiveMap?"#define USE_EMISSIVEMAP":"",r.anisotropy?"#define USE_ANISOTROPY":"",r.anisotropyMap?"#define USE_ANISOTROPYMAP":"",r.clearcoatMap?"#define USE_CLEARCOATMAP":"",r.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",r.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",r.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",r.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",r.specularMap?"#define USE_SPECULARMAP":"",r.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",r.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",r.roughnessMap?"#define USE_ROUGHNESSMAP":"",r.metalnessMap?"#define USE_METALNESSMAP":"",r.alphaMap?"#define USE_ALPHAMAP":"",r.alphaHash?"#define USE_ALPHAHASH":"",r.transmission?"#define USE_TRANSMISSION":"",r.transmissionMap?"#define USE_TRANSMISSIONMAP":"",r.thicknessMap?"#define USE_THICKNESSMAP":"",r.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",r.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",r.mapUv?"#define MAP_UV "+r.mapUv:"",r.alphaMapUv?"#define ALPHAMAP_UV "+r.alphaMapUv:"",r.lightMapUv?"#define LIGHTMAP_UV "+r.lightMapUv:"",r.aoMapUv?"#define AOMAP_UV "+r.aoMapUv:"",r.emissiveMapUv?"#define EMISSIVEMAP_UV "+r.emissiveMapUv:"",r.bumpMapUv?"#define BUMPMAP_UV "+r.bumpMapUv:"",r.normalMapUv?"#define NORMALMAP_UV "+r.normalMapUv:"",r.displacementMapUv?"#define DISPLACEMENTMAP_UV "+r.displacementMapUv:"",r.metalnessMapUv?"#define METALNESSMAP_UV "+r.metalnessMapUv:"",r.roughnessMapUv?"#define ROUGHNESSMAP_UV "+r.roughnessMapUv:"",r.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+r.anisotropyMapUv:"",r.clearcoatMapUv?"#define CLEARCOATMAP_UV "+r.clearcoatMapUv:"",r.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+r.clearcoatNormalMapUv:"",r.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+r.clearcoatRoughnessMapUv:"",r.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+r.iridescenceMapUv:"",r.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+r.iridescenceThicknessMapUv:"",r.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+r.sheenColorMapUv:"",r.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+r.sheenRoughnessMapUv:"",r.specularMapUv?"#define SPECULARMAP_UV "+r.specularMapUv:"",r.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+r.specularColorMapUv:"",r.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+r.specularIntensityMapUv:"",r.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+r.transmissionMapUv:"",r.thicknessMapUv?"#define THICKNESSMAP_UV "+r.thicknessMapUv:"",r.vertexTangents&&r.flatShading===!1?"#define USE_TANGENT":"",r.vertexNormals?"#define HAS_NORMAL":"",r.vertexColors?"#define USE_COLOR":"",r.vertexAlphas?"#define USE_COLOR_ALPHA":"",r.vertexUv1s?"#define USE_UV1":"",r.vertexUv2s?"#define USE_UV2":"",r.vertexUv3s?"#define USE_UV3":"",r.pointsUvs?"#define USE_POINTS_UV":"",r.flatShading?"#define FLAT_SHADED":"",r.skinning?"#define USE_SKINNING":"",r.morphTargets?"#define USE_MORPHTARGETS":"",r.morphNormals&&r.flatShading===!1?"#define USE_MORPHNORMALS":"",r.morphColors?"#define USE_MORPHCOLORS":"",r.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+r.morphTextureStride:"",r.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+r.morphTargetsCount:"",r.doubleSided?"#define DOUBLE_SIDED":"",r.flipSided?"#define FLIP_SIDED":"",r.shadowMapEnabled?"#define USE_SHADOWMAP":"",r.shadowMapEnabled?"#define "+l:"",r.sizeAttenuation?"#define USE_SIZEATTENUATION":"",r.numLightProbes>0?"#define USE_LIGHT_PROBES":"",r.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",r.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Wa).join(`
`),p=[nh(r),"#define SHADER_TYPE "+r.shaderType,"#define SHADER_NAME "+r.shaderName,g,r.useFog&&r.fog?"#define USE_FOG":"",r.useFog&&r.fogExp2?"#define FOG_EXP2":"",r.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",r.map?"#define USE_MAP":"",r.matcap?"#define USE_MATCAP":"",r.envMap?"#define USE_ENVMAP":"",r.envMap?"#define "+u:"",r.envMap?"#define "+h:"",r.envMap?"#define "+d:"",c?"#define CUBEUV_TEXEL_WIDTH "+c.texelWidth:"",c?"#define CUBEUV_TEXEL_HEIGHT "+c.texelHeight:"",c?"#define CUBEUV_MAX_MIP "+c.maxMip+".0":"",r.lightMap?"#define USE_LIGHTMAP":"",r.aoMap?"#define USE_AOMAP":"",r.bumpMap?"#define USE_BUMPMAP":"",r.normalMap?"#define USE_NORMALMAP":"",r.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",r.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",r.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",r.emissiveMap?"#define USE_EMISSIVEMAP":"",r.anisotropy?"#define USE_ANISOTROPY":"",r.anisotropyMap?"#define USE_ANISOTROPYMAP":"",r.clearcoat?"#define USE_CLEARCOAT":"",r.clearcoatMap?"#define USE_CLEARCOATMAP":"",r.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",r.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",r.dispersion?"#define USE_DISPERSION":"",r.retroreflection?"#define USE_RETROREFLECTION":"",r.iridescence?"#define USE_IRIDESCENCE":"",r.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",r.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",r.specularMap?"#define USE_SPECULARMAP":"",r.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",r.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",r.roughnessMap?"#define USE_ROUGHNESSMAP":"",r.metalnessMap?"#define USE_METALNESSMAP":"",r.alphaMap?"#define USE_ALPHAMAP":"",r.alphaTest?"#define USE_ALPHATEST":"",r.alphaHash?"#define USE_ALPHAHASH":"",r.sheen?"#define USE_SHEEN":"",r.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",r.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",r.transmission?"#define USE_TRANSMISSION":"",r.transmissionMap?"#define USE_TRANSMISSIONMAP":"",r.thicknessMap?"#define USE_THICKNESSMAP":"",r.vertexTangents&&r.flatShading===!1?"#define USE_TANGENT":"",r.vertexColors||r.instancingColor?"#define USE_COLOR":"",r.vertexAlphas||r.batchingColor?"#define USE_COLOR_ALPHA":"",r.vertexUv1s?"#define USE_UV1":"",r.vertexUv2s?"#define USE_UV2":"",r.vertexUv3s?"#define USE_UV3":"",r.pointsUvs?"#define USE_POINTS_UV":"",r.gradientMap?"#define USE_GRADIENTMAP":"",r.flatShading?"#define FLAT_SHADED":"",r.doubleSided?"#define DOUBLE_SIDED":"",r.flipSided?"#define FLIP_SIDED":"",r.shadowMapEnabled?"#define USE_SHADOWMAP":"",r.shadowMapEnabled?"#define "+l:"",r.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",r.numLightProbes>0?"#define USE_LIGHT_PROBES":"",r.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",r.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",r.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",r.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",r.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",r.toneMapping!==Vr?"#define TONE_MAPPING":"",r.toneMapping!==Vr?ot.tonemapping_pars_fragment:"",r.toneMapping!==Vr?G0("toneMapping",r.toneMapping):"",r.dithering?"#define DITHERING":"",r.opaque?"#define OPAQUE":"",ot.colorspace_pars_fragment,V0("linearToOutputTexel",r.outputColorSpace),W0(),r.useDepthPacking?"#define DEPTH_PACKING "+r.depthPacking:"",`
`].filter(Wa).join(`
`)),s=ll(s),s=rh(s,r),s=ih(s,r),o=ll(o),o=rh(o,r),o=ih(o,r),s=ah(s),o=ah(o),r.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",r.glslVersion===pu?"":"layout(location = 0) out highp vec4 pc_fragColor;",r.glslVersion===pu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let w=b+m+s,y=b+p+o,E=Qu(a,a.VERTEX_SHADER,w),C=Qu(a,a.FRAGMENT_SHADER,y);a.attachShader(v,E),a.attachShader(v,C),r.index0AttributeName!==void 0?a.bindAttribLocation(v,0,r.index0AttributeName):r.hasPositionAttribute===!0&&a.bindAttribLocation(v,0,"position"),a.linkProgram(v);function R(N){if(e.debug.checkShaderErrors){let F=a.getProgramInfoLog(v)||"",q=a.getShaderInfoLog(E)||"",A=a.getShaderInfoLog(C)||"",O=F.trim(),j=q.trim(),G=A.trim(),ce=!0,X=!0;if(a.getProgramParameter(v,a.LINK_STATUS)===!1)if(ce=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(a,v,E,C);else{let Y=th(a,E,"vertex"),ee=th(a,C,"fragment");Qe("WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(v,a.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+O+`
`+Y+`
`+ee)}else O!==""?Je("WebGLProgram: Program Info Log:",O):(j===""||G==="")&&(X=!1);X&&(N.diagnostics={runnable:ce,programLog:O,vertexShader:{log:j,prefix:m},fragmentShader:{log:G,prefix:p}})}a.deleteShader(E),a.deleteShader(C),_=new is(a,v),T=j0(a,v)}let _;this.getUniforms=function(){return _===void 0&&R(this),_};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let H=r.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return H===!1&&(H=a.getProgramParameter(v,F0)),H},this.destroy=function(){i.releaseStatesOfProgram(this),a.deleteProgram(v),this.program=void 0},this.type=r.shaderType,this.name=r.shaderName,this.id=z0++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=E,this.fragmentShader=C,this}var uv=0,hv=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,r){let i=this._getShaderCacheForMaterial(e);return i.has(t)===!1&&(i.add(t),t.usedTimes++),i.has(r)===!1&&(i.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){let t=this.shaderCache,r=t.get(e);return r===void 0&&(r=new cv(e),t.set(e,r)),r}},cv=class{constructor(e){this.id=uv++,this.code=e,this.usedTimes=0}};function dv(e){return e===zi||e===as||e===ns}function pv(e,t,r,i,a,n){let s=new Oh,o=new hv,l=new Set,u=[],h=new Map,d=i.logarithmicDepthBuffer,c=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function v(_,T,H,N,F,q){let A=N.fog,O=F.geometry,j=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?N.environment:null,G=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,ce=t.get(_.envMap||j,G),X=ce&&ce.mapping===cs?ce.image.height:null,Y=f[_.type];_.precision!==null&&(c=i.getMaxPrecision(_.precision),c!==_.precision&&Je("WebGLProgram.getParameters:",_.precision,"not supported, using",c,"instead."));let ee=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Ge=ee!==void 0?ee.length:0,we=0;O.morphAttributes.position!==void 0&&(we=1),O.morphAttributes.normal!==void 0&&(we=2),O.morphAttributes.color!==void 0&&(we=3);let gt,Ze,J,re;if(Y){let Ut=zr[Y];gt=Ut.vertexShader,Ze=Ut.fragmentShader}else{gt=_.vertexShader,Ze=_.fragmentShader;let Ut=o.getVertexShaderStage(_),_t=o.getFragmentShaderStage(_);o.update(_,Ut,_t),J=Ut.id,re=_t.id}let oe=e.getRenderTarget(),Pe=e.state.buffers.depth.getReversed(),Ne=F.isInstancedMesh===!0,pe=F.isBatchedMesh===!0,ke=!!_.map,te=!!_.matcap,Z=!!ce,se=!!_.aoMap,Te=!!_.lightMap,ve=!!_.bumpMap&&_.wireframe===!1,Ue=!!_.normalMap,Fe=!!_.displacementMap,et=!!_.emissiveMap,it=!!_.metalnessMap,L=!!_.roughnessMap,vt=_.anisotropy>0,ut=_.clearcoat>0,nt=_.dispersion>0,M=_.retroreflectivity>0,S=_.iridescence>0,D=_.sheen>0,W=_.transmission>0,$=vt&&!!_.anisotropyMap,_e=ut&&!!_.clearcoatMap,xe=ut&&!!_.clearcoatNormalMap,I=ut&&!!_.clearcoatRoughnessMap,me=S&&!!_.iridescenceMap,Se=S&&!!_.iridescenceThicknessMap,De=D&&!!_.sheenColorMap,he=D&&!!_.sheenRoughnessMap,ze=!!_.specularMap,Ve=!!_.specularColorMap,$e=!!_.specularIntensityMap,mt=W&&!!_.transmissionMap,U=W&&!!_.thicknessMap,Q=!!_.gradientMap,ne=!!_.alphaMap,Ae=_.alphaTest>0,Re=!!_.alphaHash,le=!!_.extensions,Ee=Vr;_.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(Ee=e.toneMapping);let We={shaderID:Y,shaderType:_.type,shaderName:_.name,vertexShader:gt,fragmentShader:Ze,defines:_.defines,customVertexShaderID:J,customFragmentShaderID:re,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:c,batching:pe,batchingColor:pe&&F._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&F.instanceColor!==null,instancingMorph:Ne&&F.morphTexture!==null,outputColorSpace:oe===null?e.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:dt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:ke,matcap:te,envMap:Z,envMapMode:Z&&ce.mapping,envMapCubeUVHeight:X,aoMap:se,lightMap:Te,bumpMap:ve,normalMap:Ue,displacementMap:Fe,emissiveMap:et,normalMapObjectSpace:Ue&&_.normalMapType===qd,normalMapTangentSpace:Ue&&_.normalMapType===du,packedNormalMap:Ue&&_.normalMapType===du&&dv(_.normalMap.format),metalnessMap:it,roughnessMap:L,anisotropy:vt,anisotropyMap:$,clearcoat:ut,clearcoatMap:_e,clearcoatNormalMap:xe,clearcoatRoughnessMap:I,dispersion:nt,retroreflection:M,iridescence:S,iridescenceMap:me,iridescenceThicknessMap:Se,sheen:D,sheenColorMap:De,sheenRoughnessMap:he,specularMap:ze,specularColorMap:Ve,specularIntensityMap:$e,transmission:W,transmissionMap:mt,thicknessMap:U,gradientMap:Q,opaque:_.transparent===!1&&_.blending===Xa&&_.alphaToCoverage===!1,alphaMap:ne,alphaTest:Ae,alphaHash:Re,combine:_.combine,mapUv:ke&&g(_.map.channel),aoMapUv:se&&g(_.aoMap.channel),lightMapUv:Te&&g(_.lightMap.channel),bumpMapUv:ve&&g(_.bumpMap.channel),normalMapUv:Ue&&g(_.normalMap.channel),displacementMapUv:Fe&&g(_.displacementMap.channel),emissiveMapUv:et&&g(_.emissiveMap.channel),metalnessMapUv:it&&g(_.metalnessMap.channel),roughnessMapUv:L&&g(_.roughnessMap.channel),anisotropyMapUv:$&&g(_.anisotropyMap.channel),clearcoatMapUv:_e&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:xe&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:I&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:De&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:he&&g(_.sheenRoughnessMap.channel),specularMapUv:ze&&g(_.specularMap.channel),specularColorMapUv:Ve&&g(_.specularColorMap.channel),specularIntensityMapUv:$e&&g(_.specularIntensityMap.channel),transmissionMapUv:mt&&g(_.transmissionMap.channel),thicknessMapUv:U&&g(_.thicknessMap.channel),alphaMapUv:ne&&g(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Ue||vt),vertexNormals:!!O.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!O.attributes.uv&&(ke||ne),fog:!!A,useFog:_.fog===!0,fogExp2:!!A&&A.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||O.attributes.normal===void 0&&Ue===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Pe,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Ge,morphTextureStride:we,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:q.length,numClippingPlanes:n.numPlanes,numClipIntersection:n.numIntersection,dithering:_.dithering,shadowMapEnabled:e.shadowMap.enabled&&H.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ee,decodeVideoTexture:ke&&_.map.isVideoTexture===!0&&dt.getTransfer(_.map.colorSpace)===xt,decodeVideoTextureEmissive:et&&_.emissiveMap.isVideoTexture===!0&&dt.getTransfer(_.emissiveMap.colorSpace)===xt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Pr,flipSided:_.side===nr,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:le&&_.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(le&&_.extensions.multiDraw===!0||pe)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return We.vertexUv1s=l.has(1),We.vertexUv2s=l.has(2),We.vertexUv3s=l.has(3),l.clear(),We}function m(_){let T=[];if(_.shaderID?T.push(_.shaderID):(T.push(_.customVertexShaderID),T.push(_.customFragmentShaderID)),_.defines!==void 0)for(let H in _.defines)T.push(H),T.push(_.defines[H]);return _.isRawShaderMaterial===!1&&(p(T,_),b(T,_),T.push(e.outputColorSpace)),T.push(_.customProgramCacheKey),T.join()}function p(_,T){_.push(T.precision),_.push(T.outputColorSpace),_.push(T.envMapMode),_.push(T.envMapCubeUVHeight),_.push(T.mapUv),_.push(T.alphaMapUv),_.push(T.lightMapUv),_.push(T.aoMapUv),_.push(T.bumpMapUv),_.push(T.normalMapUv),_.push(T.displacementMapUv),_.push(T.emissiveMapUv),_.push(T.metalnessMapUv),_.push(T.roughnessMapUv),_.push(T.anisotropyMapUv),_.push(T.clearcoatMapUv),_.push(T.clearcoatNormalMapUv),_.push(T.clearcoatRoughnessMapUv),_.push(T.iridescenceMapUv),_.push(T.iridescenceThicknessMapUv),_.push(T.sheenColorMapUv),_.push(T.sheenRoughnessMapUv),_.push(T.specularMapUv),_.push(T.specularColorMapUv),_.push(T.specularIntensityMapUv),_.push(T.transmissionMapUv),_.push(T.thicknessMapUv),_.push(T.combine),_.push(T.fogExp2),_.push(T.sizeAttenuation),_.push(T.morphTargetsCount),_.push(T.morphAttributeCount),_.push(T.numSunLights),_.push(T.numDirLights),_.push(T.numPointLights),_.push(T.numSpotLights),_.push(T.numSpotLightMaps),_.push(T.numHemiLights),_.push(T.numRectAreaLights),_.push(T.numSunLightShadows),_.push(T.numDirLightShadows),_.push(T.numPointLightShadows),_.push(T.numSpotLightShadows),_.push(T.numSpotLightShadowsWithMaps),_.push(T.numLightProbes),_.push(T.shadowMapType),_.push(T.toneMapping),_.push(T.numClippingPlanes),_.push(T.numClipIntersection),_.push(T.depthPacking)}function b(_,T){s.disableAll(),T.instancing&&s.enable(0),T.instancingColor&&s.enable(1),T.instancingMorph&&s.enable(2),T.matcap&&s.enable(3),T.envMap&&s.enable(4),T.normalMapObjectSpace&&s.enable(5),T.normalMapTangentSpace&&s.enable(6),T.clearcoat&&s.enable(7),T.iridescence&&s.enable(8),T.alphaTest&&s.enable(9),T.vertexColors&&s.enable(10),T.vertexAlphas&&s.enable(11),T.vertexUv1s&&s.enable(12),T.vertexUv2s&&s.enable(13),T.vertexUv3s&&s.enable(14),T.vertexTangents&&s.enable(15),T.anisotropy&&s.enable(16),T.alphaHash&&s.enable(17),T.batching&&s.enable(18),T.dispersion&&s.enable(19),T.retroreflection&&s.enable(24),T.batchingColor&&s.enable(20),T.gradientMap&&s.enable(21),T.packedNormalMap&&s.enable(22),T.vertexNormals&&s.enable(23),_.push(s.mask),s.disableAll(),T.fog&&s.enable(0),T.useFog&&s.enable(1),T.flatShading&&s.enable(2),T.logarithmicDepthBuffer&&s.enable(3),T.reversedDepthBuffer&&s.enable(4),T.skinning&&s.enable(5),T.morphTargets&&s.enable(6),T.morphNormals&&s.enable(7),T.morphColors&&s.enable(8),T.premultipliedAlpha&&s.enable(9),T.shadowMapEnabled&&s.enable(10),T.doubleSided&&s.enable(11),T.flipSided&&s.enable(12),T.useDepthPacking&&s.enable(13),T.dithering&&s.enable(14),T.transmission&&s.enable(15),T.sheen&&s.enable(16),T.opaque&&s.enable(17),T.pointsUvs&&s.enable(18),T.decodeVideoTexture&&s.enable(19),T.decodeVideoTextureEmissive&&s.enable(20),T.alphaToCoverage&&s.enable(21),T.numLightProbeGrids>0&&s.enable(22),T.hasPositionAttribute&&s.enable(23),_.push(s.mask)}function w(_){let T=f[_.type],H;if(T){let N=zr[T];H=df.clone(N.uniforms)}else H=_.uniforms;return H}function y(_,T){let H=h.get(T);return H!==void 0?++H.usedTimes:(H=new lv(e,T,_,a),u.push(H),h.set(T,H)),H}function E(_){if(--_.usedTimes===0){let T=u.indexOf(_);u[T]=u[u.length-1],u.pop(),h.delete(_.cacheKey),_.destroy()}}function C(_){o.remove(_)}function R(){o.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:w,acquireProgram:y,releaseProgram:E,releaseShaderCache:C,programs:u,dispose:R}}function fv(){let e=new WeakMap;function t(s){return e.has(s)}function r(s){let o=e.get(s);return o===void 0&&(o={},e.set(s,o)),o}function i(s){e.delete(s)}function a(s,o,l){e.get(s)[o]=l}function n(){e=new WeakMap}return{has:t,get:r,remove:i,update:a,dispose:n}}function mv(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function sh(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function oh(){let e=[],t=0,r=[],i=[],a=[];function n(){t=0,r.length=0,i.length=0,a.length=0}function s(c){let f=0;return c.isInstancedMesh&&(f+=2),c.isSkinnedMesh&&(f+=1),f}function o(c,f,g,v,m,p){let b=e[t];return b===void 0?(b={id:c.id,object:c,geometry:f,material:g,materialVariant:s(c),groupOrder:v,renderOrder:c.renderOrder,z:m,group:p},e[t]=b):(b.id=c.id,b.object=c,b.geometry=f,b.material=g,b.materialVariant=s(c),b.groupOrder=v,b.renderOrder=c.renderOrder,b.z=m,b.group=p),t++,b}function l(c,f,g,v,m,p,b){b.reversedDepth===!0&&(m=-m);let w=o(c,f,g,v,m,p);g.transmission>0?i.push(w):g.transparent===!0?a.push(w):r.push(w)}function u(c,f,g,v,m,p){let b=o(c,f,g,v,m,p);g.transmission>0?i.unshift(b):g.transparent===!0?a.unshift(b):r.unshift(b)}function h(c,f){r.length>1&&r.sort(c||mv),i.length>1&&i.sort(f||sh),a.length>1&&a.sort(f||sh)}function d(){for(let c=t,f=e.length;c<f;c++){let g=e[c];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:r,transmissive:i,transparent:a,init:n,push:l,unshift:u,finish:d,sort:h}}function gv(){let e=new WeakMap;function t(i,a){let n=e.get(i),s;return n===void 0?(s=new oh,e.set(i,[s])):a>=n.length?(s=new oh,n.push(s)):s=n[a],s}function r(){e=new WeakMap}return{get:t,dispose:r}}function _v(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let r;switch(t.type){case"SunLight":case"DirectionalLight":r={direction:new z,color:new lt};break;case"SpotLight":r={position:new z,direction:new z,color:new lt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":r={position:new z,color:new lt,distance:0,decay:0};break;case"HemisphereLight":r={direction:new z,skyColor:new lt,groundColor:new lt};break;case"RectAreaLight":r={color:new lt,position:new z,halfWidth:new z,halfHeight:new z};break}return e[t.id]=r,r}}}function vv(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let r;switch(t.type){case"SunLight":case"DirectionalLight":r={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me};break;case"SpotLight":r={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me};break;case"PointLight":r={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=r,r}}}var xv=0;function Sv(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function yv(e){let t=new _v,r=vv(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)i.probe.push(new z);let a=new z,n=new Wt,s=new Wt;function o(u){let h=0,d=0,c=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,b=0,w=0,y=0,E=0,C=0,R=0,_=0,T=0,H=0;u.sort(Sv);for(let F=0,q=u.length;F<q;F++){let A=u[F],O=A.color,j=A.intensity,G=A.distance,ce=null;if(A.shadow&&A.shadow.map&&(A.shadow.map.texture.format===zi?ce=A.shadow.map.texture:ce=A.shadow.map.depthTexture||A.shadow.map.texture),A.isAmbientLight)h+=O.r*j,d+=O.g*j,c+=O.b*j;else if(A.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(A.sh.coefficients[X],j);H++}else if(A.isSunLight){let X=t.get(A);if(X.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){let Y=A.shadow,ee=r.get(A);ee.shadowIntensity=Y.intensity,ee.shadowBias=Y.bias,ee.shadowNormalBias=Y.normalBias,ee.shadowRadius=Y.radius,ee.shadowMapSize.copy(Y.mapSize).multiply(Y.getFrameExtents()),i.sunShadow[g]=ee,i.sunShadowMap[g]=ce;let Ge=Y.getViewportCount();for(let we=0;we<Ge;we++)i.sunShadowMatrix[v+we]=Y.getMatrix(we),i.sunShadowCascade[v+we]=Y._cascadeData[we];v+=Ge,g++}i.sun[f]=X,f++}else if(A.isDirectionalLight){let X=t.get(A);if(X.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){let Y=A.shadow,ee=r.get(A);ee.shadowIntensity=Y.intensity,ee.shadowBias=Y.bias,ee.shadowNormalBias=Y.normalBias,ee.shadowRadius=Y.radius,ee.shadowMapSize=Y.mapSize,i.directionalShadow[m]=ee,i.directionalShadowMap[m]=ce,i.directionalShadowMatrix[m]=A.shadow.matrix,E++}i.directional[m]=X,m++}else if(A.isSpotLight){let X=t.get(A);X.position.setFromMatrixPosition(A.matrixWorld),X.color.copy(O).multiplyScalar(j),X.distance=G,X.coneCos=Math.cos(A.angle),X.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),X.decay=A.decay,i.spot[b]=X;let Y=A.shadow;if(A.map&&(i.spotLightMap[_]=A.map,_++,Y.updateMatrices(A),A.castShadow&&T++),i.spotLightMatrix[b]=Y.matrix,A.castShadow){let ee=r.get(A);ee.shadowIntensity=Y.intensity,ee.shadowBias=Y.bias,ee.shadowNormalBias=Y.normalBias,ee.shadowRadius=Y.radius,ee.shadowMapSize=Y.mapSize,i.spotShadow[b]=ee,i.spotShadowMap[b]=ce,R++}b++}else if(A.isRectAreaLight){let X=t.get(A);X.color.copy(O).multiplyScalar(j),X.halfWidth.set(A.width*.5,0,0),X.halfHeight.set(0,A.height*.5,0),i.rectArea[w]=X,w++}else if(A.isPointLight){let X=t.get(A);if(X.color.copy(A.color).multiplyScalar(A.intensity),X.distance=A.distance,X.decay=A.decay,A.castShadow){let Y=A.shadow,ee=r.get(A);ee.shadowIntensity=Y.intensity,ee.shadowBias=Y.bias,ee.shadowNormalBias=Y.normalBias,ee.shadowRadius=Y.radius,ee.shadowMapSize=Y.mapSize,ee.shadowCameraNear=Y.camera.near,ee.shadowCameraFar=Y.camera.far,i.pointShadow[p]=ee,i.pointShadowMap[p]=ce,i.pointShadowMatrix[p]=A.shadow.matrix,C++}i.point[p]=X,p++}else if(A.isHemisphereLight){let X=t.get(A);X.skyColor.copy(A.color).multiplyScalar(j),X.groundColor.copy(A.groundColor).multiplyScalar(j),i.hemi[y]=X,y++}}w>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ye.LTC_FLOAT_1,i.rectAreaLTC2=ye.LTC_FLOAT_2):(i.rectAreaLTC1=ye.LTC_HALF_1,i.rectAreaLTC2=ye.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=c;let N=i.hash;(N.sunLength!==f||N.directionalLength!==m||N.pointLength!==p||N.spotLength!==b||N.rectAreaLength!==w||N.hemiLength!==y||N.numSunShadows!==g||N.numDirectionalShadows!==E||N.numPointShadows!==C||N.numSpotShadows!==R||N.numSpotMaps!==_||N.numLightProbes!==H)&&(i.sun.length=f,i.directional.length=m,i.spot.length=b,i.rectArea.length=w,i.point.length=p,i.hemi.length=y,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=v,i.sunShadowCascade.length=v,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.directionalShadowMatrix.length=E,i.pointShadow.length=C,i.pointShadowMap.length=C,i.pointShadowMatrix.length=C,i.spotShadow.length=R,i.spotShadowMap.length=R,i.spotLightMatrix.length=R+_-T,i.spotLightMap.length=_,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=H,N.sunLength=f,N.directionalLength=m,N.pointLength=p,N.spotLength=b,N.rectAreaLength=w,N.hemiLength=y,N.numSunShadows=g,N.numDirectionalShadows=E,N.numPointShadows=C,N.numSpotShadows=R,N.numSpotMaps=_,N.numLightProbes=H,i.version=xv++)}function l(u,h){let d=0,c=0,f=0,g=0,v=0,m=0,p=h.matrixWorldInverse;for(let b=0,w=u.length;b<w;b++){let y=u[b];if(y.isSunLight){let E=i.sun[d];E.direction.setFromMatrixPosition(y.matrixWorld),E.direction.transformDirection(p),d++}else if(y.isDirectionalLight){let E=i.directional[c];E.direction.setFromMatrixPosition(y.matrixWorld),a.setFromMatrixPosition(y.target.matrixWorld),E.direction.sub(a),E.direction.transformDirection(p),c++}else if(y.isSpotLight){let E=i.spot[g];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(y.matrixWorld),a.setFromMatrixPosition(y.target.matrixWorld),E.direction.sub(a),E.direction.transformDirection(p),g++}else if(y.isRectAreaLight){let E=i.rectArea[v];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),s.identity(),n.copy(y.matrixWorld),n.premultiply(p),s.extractRotation(n),E.halfWidth.set(y.width*.5,0,0),E.halfHeight.set(0,y.height*.5,0),E.halfWidth.applyMatrix4(s),E.halfHeight.applyMatrix4(s),v++}else if(y.isPointLight){let E=i.point[f];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),f++}else if(y.isHemisphereLight){let E=i.hemi[m];E.direction.setFromMatrixPosition(y.matrixWorld),E.direction.transformDirection(p),m++}}}return{setup:o,setupView:l,state:i}}function lh(e){let t=new yv(e),r=[],i=[],a=[];function n(c){d.camera=c,r.length=0,i.length=0,a.length=0}function s(c){r.push(c)}function o(c){i.push(c)}function l(c){a.push(c)}function u(){t.setup(r)}function h(c){t.setupView(r,c)}let d={lightsArray:r,shadowsArray:i,lightProbeGridArray:a,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:n,state:d,setupLights:u,setupLightsView:h,pushLight:s,pushShadow:o,pushLightProbeGrid:l}}function Mv(e){let t=new WeakMap;function r(a,n=0){let s=t.get(a),o;return s===void 0?(o=new lh(e),t.set(a,[o])):n>=s.length?(o=new lh(e),s.push(o)):o=s[n],o}function i(){t=new WeakMap}return{get:r,dispose:i}}var Tv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ev=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,bv=[new z(1,0,0),new z(-1,0,0),new z(0,1,0),new z(0,-1,0),new z(0,0,1),new z(0,0,-1)],wv=[new z(0,-1,0),new z(0,-1,0),new z(0,0,1),new z(0,0,-1),new z(0,-1,0),new z(0,-1,0)],uh=new Wt,Va=new z,go=new z;function Av(e,t,r){let i=new Hh,a=new Me,n=new Me,s=new Pt,o=new gf,l=new _f,u={},h=r.maxTextureSize,d={[Oi]:nr,[nr]:Oi,[Pr]:Pr},c=new dr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Me},radius:{value:4}},vertexShader:Tv,fragmentShader:Ev}),f=c.clone();f.defines.HORIZONTAL_PASS=1;let g=new Si;g.setAttribute("position",new ai(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new sr(g,c),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Jn;let p=this.type;this.render=function(C,R,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;this.type===Td&&(Je("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Jn);let T=e.getRenderTarget(),H=e.getActiveCubeFace(),N=e.getActiveMipmapLevel(),F=e.state;F.setBlending(ri),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let q=p!==this.type;q&&R.traverse(function(A){A.material&&(Array.isArray(A.material)?A.material.forEach(O=>O.needsUpdate=!0):A.material.needsUpdate=!0)});for(let A=0,O=C.length;A<O;A++){let j=C[A],G=j.shadow;if(G===void 0){Je("WebGLShadowMap:",j,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;a.copy(G.mapSize);let ce=G.getFrameExtents();a.multiply(ce),n.copy(G.mapSize),(a.x>h||a.y>h)&&(a.x>h&&(n.x=Math.floor(h/ce.x),a.x=n.x*ce.x,G.mapSize.x=n.x),a.y>h&&(n.y=Math.floor(h/ce.y),a.y=n.y*ce.y,G.mapSize.y=n.y));let X=e.state.buffers.depth.getReversed();if(G.camera._reversedDepth=X,G.map===null||q===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===Ha){if(j.isPointLight){Je("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new Nr(a.x,a.y,{format:zi,type:Gr,minFilter:Qt,magFilter:Qt,generateMipmaps:!1}),G.map.texture.name=j.name+".shadowMap",G.map.depthTexture=new $a(a.x,a.y,Br),G.map.depthTexture.name=j.name+".shadowMapDepth",G.map.depthTexture.format=ni,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Yt,G.map.depthTexture.magFilter=Yt}else j.isPointLight?(G.map=new cc(a.x),G.map.depthTexture=new Pp(a.x,Hr)):(G.map=new Nr(a.x,a.y),G.map.depthTexture=new $a(a.x,a.y,Hr)),G.map.depthTexture.name=j.name+".shadowMap",G.map.depthTexture.format=ni,this.type===Jn?(G.map.depthTexture.compareFunction=X?gl:ml,G.map.depthTexture.minFilter=Qt,G.map.depthTexture.magFilter=Qt):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Yt,G.map.depthTexture.magFilter=Yt);G.camera.updateProjectionMatrix()}G.map.isWebGLCubeRenderTarget!==!0&&(G.map.width!==a.x||G.map.height!==a.y)&&G.map.setSize(a.x,a.y);let Y=G.map.isWebGLCubeRenderTarget?6:G.getViewportCount();j.isPointLight!==!0&&G.updateMatrices(j,_);for(let ee=0;ee<Y;ee++){let Ge=G.getCamera(ee);if(j.isPointLight){let we=G.camera,gt=G.matrix,Ze=j.distance||we.far;Ze!==we.far&&(we.far=Ze,we.updateProjectionMatrix()),Va.setFromMatrixPosition(j.matrixWorld),we.position.copy(Va),go.copy(we.position),go.add(bv[ee]),we.up.copy(wv[ee]),we.lookAt(go),we.updateMatrixWorld(),gt.makeTranslation(-Va.x,-Va.y,-Va.z),uh.multiplyMatrices(we.projectionMatrix,we.matrixWorldInverse),G._frustum.setFromProjectionMatrix(uh,we.coordinateSystem,we.reversedDepth)}if(G.map.isWebGLCubeRenderTarget)e.setRenderTarget(G.map,ee),e.clear();else{ee===0&&(e.setRenderTarget(G.map),e.clear());let we=G.getViewport(ee);s.set(n.x*we.x,n.y*we.y,n.x*we.z,n.y*we.w),F.viewport(s)}i=G.getFrustum(ee),y(R,_,Ge,j,this.type)}G.isPointLightShadow!==!0&&this.type===Ha&&b(G,_),G.needsUpdate=!1}p=this.type,m.needsUpdate=!1,e.setRenderTarget(T,H,N)};function b(C,R){let _=t.update(v);c.defines.VSM_SAMPLES!==C.blurSamples&&(c.defines.VSM_SAMPLES=C.blurSamples,f.defines.VSM_SAMPLES=C.blurSamples,c.needsUpdate=!0,f.needsUpdate=!0),C.mapPass===null?C.mapPass=new Nr(a.x,a.y,{format:zi,type:Gr}):(C.mapPass.width!==C.map.width||C.mapPass.height!==C.map.height)&&C.mapPass.setSize(C.map.width,C.map.height),c.uniforms.shadow_pass.value=C.map.depthTexture,c.uniforms.resolution.value.set(C.map.width,C.map.height),c.uniforms.radius.value=C.radius,e.setRenderTarget(C.mapPass),e.clear(),e.renderBufferDirect(R,null,_,c,v,null),f.uniforms.shadow_pass.value=C.mapPass.texture,f.uniforms.resolution.value.set(C.map.width,C.map.height),f.uniforms.radius.value=C.radius,e.setRenderTarget(C.map),e.clear(),e.renderBufferDirect(R,null,_,f,v,null)}function w(C,R,_,T){let H=null,N=_.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(N!==void 0)H=N;else if(H=_.isPointLight===!0?l:o,e.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let F=H.uuid,q=R.uuid,A=u[F];A===void 0&&(A={},u[F]=A);let O=A[q];O===void 0&&(O=H.clone(),A[q]=O,R.addEventListener("dispose",E)),H=O}if(H.visible=R.visible,H.wireframe=R.wireframe,T===Ha?H.side=R.shadowSide!==null?R.shadowSide:R.side:H.side=R.shadowSide!==null?R.shadowSide:d[R.side],H.alphaMap=R.alphaMap,H.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,H.map=R.map,H.clipShadows=R.clipShadows,H.clippingPlanes=R.clippingPlanes,H.clipIntersection=R.clipIntersection,H.displacementMap=R.displacementMap,H.displacementScale=R.displacementScale,H.displacementBias=R.displacementBias,H.wireframeLinewidth=R.wireframeLinewidth,H.linewidth=R.linewidth,_.isPointLight===!0&&H.isMeshDistanceMaterial===!0){let F=e.properties.get(H);F.light=_}return H}function y(C,R,_,T,H){if(C.visible===!1)return;if(C.layers.test(R.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&H===Ha)&&(!C.frustumCulled||C.intersectsFrustum(i))){C.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,C.matrixWorld);let F=t.update(C),q=C.material;if(Array.isArray(q)){let A=F.groups;for(let O=0,j=A.length;O<j;O++){let G=A[O],ce=q[G.materialIndex];if(ce&&ce.visible){let X=w(C,ce,T,H);C.onBeforeShadow(e,C,R,_,F,X,G),e.renderBufferDirect(_,null,F,X,C,G),C.onAfterShadow(e,C,R,_,F,X,G)}}}else if(q.visible){let A=w(C,q,T,H);C.onBeforeShadow(e,C,R,_,F,A,null),e.renderBufferDirect(_,null,F,A,C,null),C.onAfterShadow(e,C,R,_,F,A,null)}}let N=C.children;for(let F=0,q=N.length;F<q;F++)y(N[F],R,_,T,H)}function E(C){C.target.removeEventListener("dispose",E);for(let R in u){let _=u[R],T=C.target.uuid;T in _&&(_[T].dispose(),delete _[T])}}}function Rv(e,t){function r(){let U=!1,Q=new Pt,ne=null,Ae=new Pt(0,0,0,0);return{setMask:function(Re){ne!==Re&&!U&&(e.colorMask(Re,Re,Re,Re),ne=Re)},setLocked:function(Re){U=Re},setClear:function(Re,le,Ee,We,Ut){Ut===!0&&(Re*=We,le*=We,Ee*=We),Q.set(Re,le,Ee,We),Ae.equals(Q)===!1&&(e.clearColor(Re,le,Ee,We),Ae.copy(Q))},reset:function(){U=!1,ne=null,Ae.set(-1,0,0,0)}}}function i(){let U=!1,Q=!1,ne=null,Ae=null,Re=null;return{setReversed:function(le){if(Q!==le){let Ee=t.get("EXT_clip_control");le?Ee.clipControlEXT(Ee.LOWER_LEFT_EXT,Ee.ZERO_TO_ONE_EXT):Ee.clipControlEXT(Ee.LOWER_LEFT_EXT,Ee.NEGATIVE_ONE_TO_ONE_EXT),Q=le;let We=Re;Re=null,this.setClear(We)}},getReversed:function(){return Q},setTest:function(le){le?oe(e.DEPTH_TEST):Pe(e.DEPTH_TEST)},setMask:function(le){ne!==le&&!U&&(e.depthMask(le),ne=le)},setFunc:function(le){if(Q&&(le=np[le]),Ae!==le){switch(le){case _o:e.depthFunc(e.NEVER);break;case vo:e.depthFunc(e.ALWAYS);break;case xo:e.depthFunc(e.LESS);break;case Ya:e.depthFunc(e.LEQUAL);break;case So:e.depthFunc(e.EQUAL);break;case yo:e.depthFunc(e.GEQUAL);break;case Mo:e.depthFunc(e.GREATER);break;case To:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}Ae=le}},setLocked:function(le){U=le},setClear:function(le){Re!==le&&(Re=le,Q&&(le=1-le),e.clearDepth(le))},reset:function(){U=!1,ne=null,Ae=null,Re=null,Q=!1}}}function a(){let U=!1,Q=null,ne=null,Ae=null,Re=null,le=null,Ee=null,We=null,Ut=null;return{setTest:function(_t){U||(_t?oe(e.STENCIL_TEST):Pe(e.STENCIL_TEST))},setMask:function(_t){Q!==_t&&!U&&(e.stencilMask(_t),Q=_t)},setFunc:function(_t,gr,wr){(ne!==_t||Ae!==gr||Re!==wr)&&(e.stencilFunc(_t,gr,wr),ne=_t,Ae=gr,Re=wr)},setOp:function(_t,gr,wr){(le!==_t||Ee!==gr||We!==wr)&&(e.stencilOp(_t,gr,wr),le=_t,Ee=gr,We=wr)},setLocked:function(_t){U=_t},setClear:function(_t){Ut!==_t&&(e.clearStencil(_t),Ut=_t)},reset:function(){U=!1,Q=null,ne=null,Ae=null,Re=null,le=null,Ee=null,We=null,Ut=null}}}let n=new r,s=new i,o=new a,l=new WeakMap,u=new WeakMap,h={},d={},c={},f=new WeakMap,g=[],v=null,m=!1,p=null,b=null,w=null,y=null,E=null,C=null,R=null,_=new lt(0,0,0),T=0,H=!1,N=null,F=null,q=null,A=null,O=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,ce=0,X=e.getParameter(e.VERSION);X.indexOf("WebGL")!==-1?(ce=parseFloat(/^WebGL (\d)/.exec(X)[1]),G=ce>=1):X.indexOf("OpenGL ES")!==-1&&(ce=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),G=ce>=2);let Y=null,ee={},Ge=e.getParameter(e.SCISSOR_BOX),we=e.getParameter(e.VIEWPORT),gt=new Pt().fromArray(Ge),Ze=new Pt().fromArray(we);function J(U,Q,ne,Ae){let Re=new Uint8Array(4),le=e.createTexture();e.bindTexture(U,le),e.texParameteri(U,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(U,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Ee=0;Ee<ne;Ee++)U===e.TEXTURE_3D||U===e.TEXTURE_2D_ARRAY?e.texImage3D(Q,0,e.RGBA,1,1,Ae,0,e.RGBA,e.UNSIGNED_BYTE,Re):e.texImage2D(Q+Ee,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Re);return le}let re={};re[e.TEXTURE_2D]=J(e.TEXTURE_2D,e.TEXTURE_2D,1),re[e.TEXTURE_CUBE_MAP]=J(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),re[e.TEXTURE_2D_ARRAY]=J(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),re[e.TEXTURE_3D]=J(e.TEXTURE_3D,e.TEXTURE_3D,1,1),n.setClear(0,0,0,1),s.setClear(1),o.setClear(0),oe(e.DEPTH_TEST),s.setFunc(Ya),ve(!1),Ue(au),oe(e.CULL_FACE),se(ri);function oe(U){h[U]!==!0&&(e.enable(U),h[U]=!0)}function Pe(U){h[U]!==!1&&(e.disable(U),h[U]=!1)}function Ne(U,Q){return c[U]!==Q?(e.bindFramebuffer(U,Q),c[U]=Q,U===e.DRAW_FRAMEBUFFER&&(c[e.FRAMEBUFFER]=Q),U===e.FRAMEBUFFER&&(c[e.DRAW_FRAMEBUFFER]=Q),!0):!1}function pe(U,Q){let ne=g,Ae=!1;if(U){ne=f.get(Q),ne===void 0&&(ne=[],f.set(Q,ne));let Re=U.textures;if(ne.length!==Re.length||ne[0]!==e.COLOR_ATTACHMENT0){for(let le=0,Ee=Re.length;le<Ee;le++)ne[le]=e.COLOR_ATTACHMENT0+le;ne.length=Re.length,Ae=!0}}else ne[0]!==e.BACK&&(ne[0]=e.BACK,Ae=!0);Ae&&e.drawBuffers(ne)}function ke(U){return v!==U?(e.useProgram(U),v=U,!0):!1}let te={[ca]:e.FUNC_ADD,[bd]:e.FUNC_SUBTRACT,[wd]:e.FUNC_REVERSE_SUBTRACT};te[Ad]=e.MIN,te[Rd]=e.MAX;let Z={[Cd]:e.ZERO,[Pd]:e.ONE,[Ld]:e.SRC_COLOR,[hh]:e.SRC_ALPHA,[Fd]:e.SRC_ALPHA_SATURATE,[Id]:e.DST_COLOR,[Dd]:e.DST_ALPHA,[Nd]:e.ONE_MINUS_SRC_COLOR,[ch]:e.ONE_MINUS_SRC_ALPHA,[Od]:e.ONE_MINUS_DST_COLOR,[Ud]:e.ONE_MINUS_DST_ALPHA,[zd]:e.CONSTANT_COLOR,[Bd]:e.ONE_MINUS_CONSTANT_COLOR,[kd]:e.CONSTANT_ALPHA,[Vd]:e.ONE_MINUS_CONSTANT_ALPHA};function se(U,Q,ne,Ae,Re,le,Ee,We,Ut,_t){if(U===ri){m===!0&&(Pe(e.BLEND),m=!1);return}if(m===!1&&(oe(e.BLEND),m=!0),U!==Ed){if(U!==p||_t!==H){if((b!==ca||E!==ca)&&(e.blendEquation(e.FUNC_ADD),b=ca,E=ca),_t)switch(U){case Xa:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case nu:e.blendFunc(e.ONE,e.ONE);break;case su:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case ou:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Qe("WebGLState: Invalid blending: ",U);break}else switch(U){case Xa:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case nu:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case su:Qe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ou:Qe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qe("WebGLState: Invalid blending: ",U);break}w=null,y=null,C=null,R=null,_.set(0,0,0),T=0,p=U,H=_t}return}Re=Re||Q,le=le||ne,Ee=Ee||Ae,(Q!==b||Re!==E)&&(e.blendEquationSeparate(te[Q],te[Re]),b=Q,E=Re),(ne!==w||Ae!==y||le!==C||Ee!==R)&&(e.blendFuncSeparate(Z[ne],Z[Ae],Z[le],Z[Ee]),w=ne,y=Ae,C=le,R=Ee),(We.equals(_)===!1||Ut!==T)&&(e.blendColor(We.r,We.g,We.b,Ut),_.copy(We),T=Ut),p=U,H=!1}function Te(U,Q){U.side===Pr?Pe(e.CULL_FACE):oe(e.CULL_FACE);let ne=U.side===nr;Q&&(ne=!ne),ve(ne),U.blending===Xa&&U.transparent===!1?se(ri):se(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),s.setFunc(U.depthFunc),s.setTest(U.depthTest),s.setMask(U.depthWrite),n.setMask(U.colorWrite);let Ae=U.stencilWrite;o.setTest(Ae),Ae&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),et(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?oe(e.SAMPLE_ALPHA_TO_COVERAGE):Pe(e.SAMPLE_ALPHA_TO_COVERAGE)}function ve(U){N!==U&&(U?e.frontFace(e.CW):e.frontFace(e.CCW),N=U)}function Ue(U){U!==yd?(oe(e.CULL_FACE),U!==F&&(U===au?e.cullFace(e.BACK):U===Md?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Pe(e.CULL_FACE),F=U}function Fe(U){U!==q&&(G&&e.lineWidth(U),q=U)}function et(U,Q,ne){U?(oe(e.POLYGON_OFFSET_FILL),(A!==Q||O!==ne)&&(A=Q,O=ne,s.getReversed()&&(Q=-Q),e.polygonOffset(Q,ne))):Pe(e.POLYGON_OFFSET_FILL)}function it(U){U?oe(e.SCISSOR_TEST):Pe(e.SCISSOR_TEST)}function L(U){U===void 0&&(U=e.TEXTURE0+j-1),Y!==U&&(e.activeTexture(U),Y=U)}function vt(U,Q,ne){ne===void 0&&(Y===null?ne=e.TEXTURE0+j-1:ne=Y);let Ae=ee[ne];Ae===void 0&&(Ae={type:void 0,texture:void 0},ee[ne]=Ae),(Ae.type!==U||Ae.texture!==Q)&&(Y!==ne&&(e.activeTexture(ne),Y=ne),e.bindTexture(U,Q||re[U]),Ae.type=U,Ae.texture=Q)}function ut(){let U=ee[Y];U!==void 0&&U.type!==void 0&&(e.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function nt(){try{e.compressedTexImage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function M(){try{e.compressedTexImage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function S(){try{e.texSubImage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function D(){try{e.texSubImage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function W(){try{e.compressedTexSubImage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function $(){try{e.compressedTexSubImage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function _e(){try{e.texStorage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function xe(){try{e.texStorage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function I(){try{e.texImage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function me(){try{e.texImage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function Se(U){return d[U]!==void 0?d[U]:e.getParameter(U)}function De(U,Q){d[U]!==Q&&(e.pixelStorei(U,Q),d[U]=Q)}function he(U){gt.equals(U)===!1&&(e.scissor(U.x,U.y,U.z,U.w),gt.copy(U))}function ze(U){Ze.equals(U)===!1&&(e.viewport(U.x,U.y,U.z,U.w),Ze.copy(U))}function Ve(U,Q){let ne=u.get(Q);ne===void 0&&(ne=new WeakMap,u.set(Q,ne));let Ae=ne.get(U);Ae===void 0&&(Ae=e.getUniformBlockIndex(Q,U.name),ne.set(U,Ae))}function $e(U,Q){let ne=u.get(Q).get(U);l.get(Q)!==ne&&(e.uniformBlockBinding(Q,ne,U.__bindingPointIndex),l.set(Q,ne))}function mt(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),s.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),h={},d={},Y=null,ee={},c={},f=new WeakMap,g=[],v=null,m=!1,p=null,b=null,w=null,y=null,E=null,C=null,R=null,_=new lt(0,0,0),T=0,H=!1,N=null,F=null,q=null,A=null,O=null,gt.set(0,0,e.canvas.width,e.canvas.height),Ze.set(0,0,e.canvas.width,e.canvas.height),n.reset(),s.reset(),o.reset()}return{buffers:{color:n,depth:s,stencil:o},enable:oe,disable:Pe,bindFramebuffer:Ne,drawBuffers:pe,useProgram:ke,setBlending:se,setMaterial:Te,setFlipSided:ve,setCullFace:Ue,setLineWidth:Fe,setPolygonOffset:et,setScissorTest:it,activeTexture:L,bindTexture:vt,unbindTexture:ut,compressedTexImage2D:nt,compressedTexImage3D:M,texImage2D:I,texImage3D:me,pixelStorei:De,getParameter:Se,updateUBOMapping:Ve,uniformBlockBinding:$e,texStorage2D:_e,texStorage3D:xe,texSubImage2D:S,texSubImage3D:D,compressedTexSubImage2D:W,compressedTexSubImage3D:$,scissor:he,viewport:ze,reset:mt}}function Cv(e,t,r,i,a,n,s){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Me,h=new WeakMap,d=new Set,c,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(M,S){return g?new OffscreenCanvas(M,S):hs("canvas")}function m(M,S,D){let W=1,$=nt(M);if(($.width>D||$.height>D)&&(W=D/Math.max($.width,$.height)),W<1)if(typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&M instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&M instanceof ImageBitmap||typeof VideoFrame<"u"&&M instanceof VideoFrame){let _e=Math.floor(W*$.width),xe=Math.floor(W*$.height);c===void 0&&(c=v(_e,xe));let I=S?v(_e,xe):c;return I.width=_e,I.height=xe,I.getContext("2d").drawImage(M,0,0,_e,xe),Je("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+_e+"x"+xe+")."),I}else return"data"in M&&Je("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),M;return M}function p(M){return M.generateMipmaps}function b(M){e.generateMipmap(M)}function w(M){return M.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:M.isWebGL3DRenderTarget?e.TEXTURE_3D:M.isWebGLArrayRenderTarget||M.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(M,S,D,W,$,_e=!1){if(M!==null){if(e[M]!==void 0)return e[M];Je("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+M+"'")}let xe;W&&(xe=t.get("EXT_texture_norm16"),xe||Je("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let I=S;if(S===e.RED&&(D===e.FLOAT&&(I=e.R32F),D===e.HALF_FLOAT&&(I=e.R16F),D===e.UNSIGNED_BYTE&&(I=e.R8),D===e.UNSIGNED_SHORT&&xe&&(I=xe.R16_EXT),D===e.SHORT&&xe&&(I=xe.R16_SNORM_EXT)),S===e.RED_INTEGER&&(D===e.UNSIGNED_BYTE&&(I=e.R8UI),D===e.UNSIGNED_SHORT&&(I=e.R16UI),D===e.UNSIGNED_INT&&(I=e.R32UI),D===e.BYTE&&(I=e.R8I),D===e.SHORT&&(I=e.R16I),D===e.INT&&(I=e.R32I)),S===e.RG&&(D===e.FLOAT&&(I=e.RG32F),D===e.HALF_FLOAT&&(I=e.RG16F),D===e.UNSIGNED_BYTE&&(I=e.RG8),D===e.UNSIGNED_SHORT&&xe&&(I=xe.RG16_EXT),D===e.SHORT&&xe&&(I=xe.RG16_SNORM_EXT)),S===e.RG_INTEGER&&(D===e.UNSIGNED_BYTE&&(I=e.RG8UI),D===e.UNSIGNED_SHORT&&(I=e.RG16UI),D===e.UNSIGNED_INT&&(I=e.RG32UI),D===e.BYTE&&(I=e.RG8I),D===e.SHORT&&(I=e.RG16I),D===e.INT&&(I=e.RG32I)),S===e.RGB_INTEGER&&(D===e.UNSIGNED_BYTE&&(I=e.RGB8UI),D===e.UNSIGNED_SHORT&&(I=e.RGB16UI),D===e.UNSIGNED_INT&&(I=e.RGB32UI),D===e.BYTE&&(I=e.RGB8I),D===e.SHORT&&(I=e.RGB16I),D===e.INT&&(I=e.RGB32I)),S===e.RGBA_INTEGER&&(D===e.UNSIGNED_BYTE&&(I=e.RGBA8UI),D===e.UNSIGNED_SHORT&&(I=e.RGBA16UI),D===e.UNSIGNED_INT&&(I=e.RGBA32UI),D===e.BYTE&&(I=e.RGBA8I),D===e.SHORT&&(I=e.RGBA16I),D===e.INT&&(I=e.RGBA32I)),S===e.RGB&&(D===e.UNSIGNED_SHORT&&xe&&(I=xe.RGB16_EXT),D===e.SHORT&&xe&&(I=xe.RGB16_SNORM_EXT),D===e.UNSIGNED_INT_5_9_9_9_REV&&(I=e.RGB9_E5),D===e.UNSIGNED_INT_10F_11F_11F_REV&&(I=e.R11F_G11F_B10F)),S===e.RGBA){let me=_e?ls:dt.getTransfer($);D===e.FLOAT&&(I=e.RGBA32F),D===e.HALF_FLOAT&&(I=e.RGBA16F),D===e.UNSIGNED_BYTE&&(I=me===xt?e.SRGB8_ALPHA8:e.RGBA8),D===e.UNSIGNED_SHORT&&xe&&(I=xe.RGBA16_EXT),D===e.SHORT&&xe&&(I=xe.RGBA16_SNORM_EXT),D===e.UNSIGNED_SHORT_4_4_4_4&&(I=e.RGBA4),D===e.UNSIGNED_SHORT_5_5_5_1&&(I=e.RGB5_A1)}return(I===e.R16F||I===e.R32F||I===e.RG16F||I===e.RG32F||I===e.RGBA16F||I===e.RGBA32F)&&t.get("EXT_color_buffer_float"),I}function E(M,S){let D;return M?S===null||S===Hr||S===Ja?D=e.DEPTH24_STENCIL8:S===Br?D=e.DEPTH32F_STENCIL8:S===Ka&&(D=e.DEPTH24_STENCIL8,Je("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Hr||S===Ja?D=e.DEPTH_COMPONENT24:S===Br?D=e.DEPTH_COMPONENT32F:S===Ka&&(D=e.DEPTH_COMPONENT16),D}function C(M,S){return p(M)===!0||M.isFramebufferTexture&&M.minFilter!==Yt&&M.minFilter!==Qt?Math.log2(Math.max(S.width,S.height))+1:M.mipmaps!==void 0&&M.mipmaps.length>0?M.mipmaps.length:M.isCompressedTexture&&Array.isArray(M.image)?S.mipmaps.length:1}function R(M){let S=M.target;S.removeEventListener("dispose",R),T(S),S.isVideoTexture&&h.delete(S),S.isHTMLTexture&&d.delete(S)}function _(M){let S=M.target;S.removeEventListener("dispose",_),N(S)}function T(M){let S=i.get(M);if(S.__webglInit===void 0)return;let D=M.source,W=f.get(D);if(W){let $=W[S.__cacheKey];$.usedTimes--,$.usedTimes===0&&H(M),Object.keys(W).length===0&&f.delete(D)}i.remove(M)}function H(M){let S=i.get(M);e.deleteTexture(S.__webglTexture);let D=M.source,W=f.get(D);delete W[S.__cacheKey],s.memory.textures--}function N(M){let S=i.get(M);if(M.depthTexture&&(M.depthTexture.dispose(),i.remove(M.depthTexture)),M.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(S.__webglFramebuffer[W]))for(let $=0;$<S.__webglFramebuffer[W].length;$++)e.deleteFramebuffer(S.__webglFramebuffer[W][$]);else e.deleteFramebuffer(S.__webglFramebuffer[W]);S.__webglDepthbuffer&&e.deleteRenderbuffer(S.__webglDepthbuffer[W])}else{if(Array.isArray(S.__webglFramebuffer))for(let W=0;W<S.__webglFramebuffer.length;W++)e.deleteFramebuffer(S.__webglFramebuffer[W]);else e.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&e.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&e.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let W=0;W<S.__webglColorRenderbuffer.length;W++)S.__webglColorRenderbuffer[W]&&e.deleteRenderbuffer(S.__webglColorRenderbuffer[W]);S.__webglDepthRenderbuffer&&e.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let D=M.textures;for(let W=0,$=D.length;W<$;W++){let _e=i.get(D[W]);_e.__webglTexture&&(e.deleteTexture(_e.__webglTexture),s.memory.textures--),i.remove(D[W])}i.remove(M)}let F=0;function q(){F=0}function A(){return F}function O(M){F=M}function j(){let M=F;return M>=a.maxTextures&&Je("WebGLTextures: Trying to use "+(M+1)+" texture units while this GPU supports only "+a.maxTextures),F+=1,M}function G(M){let S=[];return S.push(M.wrapS),S.push(M.wrapT),S.push(M.wrapR||0),S.push(M.magFilter),S.push(M.minFilter),S.push(M.anisotropy),S.push(M.internalFormat),S.push(M.format),S.push(M.type),S.push(M.generateMipmaps),S.push(M.premultiplyAlpha),S.push(M.flipY),S.push(M.unpackAlignment),S.push(M.colorSpace),S.join()}function ce(M,S){let D=i.get(M);if(M.isVideoTexture&&vt(M),M.isRenderTargetTexture===!1&&M.isExternalTexture!==!0&&M.version>0&&D.__version!==M.version){let W=M.image;if(W===null)Je("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Je("WebGLRenderer: Texture marked for update but image is incomplete");else{Pe(D,M,S);return}}else M.isExternalTexture&&(D.__webglTexture=M.sourceTexture?M.sourceTexture:null);r.bindTexture(e.TEXTURE_2D,D.__webglTexture,e.TEXTURE0+S)}function X(M,S){let D=i.get(M);if(M.isRenderTargetTexture===!1&&M.version>0&&D.__version!==M.version){Pe(D,M,S);return}else M.isExternalTexture&&(D.__webglTexture=M.sourceTexture?M.sourceTexture:null);r.bindTexture(e.TEXTURE_2D_ARRAY,D.__webglTexture,e.TEXTURE0+S)}function Y(M,S){let D=i.get(M);if(M.isRenderTargetTexture===!1&&M.version>0&&D.__version!==M.version){Pe(D,M,S);return}r.bindTexture(e.TEXTURE_3D,D.__webglTexture,e.TEXTURE0+S)}function ee(M,S){let D=i.get(M);if(M.isCubeDepthTexture!==!0&&M.version>0&&D.__version!==M.version){Ne(D,M,S);return}r.bindTexture(e.TEXTURE_CUBE_MAP,D.__webglTexture,e.TEXTURE0+S)}let Ge={[Eo]:e.REPEAT,[ti]:e.CLAMP_TO_EDGE,[bo]:e.MIRRORED_REPEAT},we={[Yt]:e.NEAREST,[Wd]:e.NEAREST_MIPMAP_NEAREST,[bn]:e.NEAREST_MIPMAP_LINEAR,[Qt]:e.LINEAR,[Is]:e.LINEAR_MIPMAP_NEAREST,[Di]:e.LINEAR_MIPMAP_LINEAR},gt={[Yd]:e.NEVER,[Qd]:e.ALWAYS,[Kd]:e.LESS,[ml]:e.LEQUAL,[Jd]:e.EQUAL,[gl]:e.GEQUAL,[Zd]:e.GREATER,[$d]:e.NOTEQUAL};function Ze(M,S){if(S.type===Br&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===Qt||S.magFilter===Is||S.magFilter===bn||S.magFilter===Di||S.minFilter===Qt||S.minFilter===Is||S.minFilter===bn||S.minFilter===Di)&&Je("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(M,e.TEXTURE_WRAP_S,Ge[S.wrapS]),e.texParameteri(M,e.TEXTURE_WRAP_T,Ge[S.wrapT]),(M===e.TEXTURE_3D||M===e.TEXTURE_2D_ARRAY)&&e.texParameteri(M,e.TEXTURE_WRAP_R,Ge[S.wrapR]),e.texParameteri(M,e.TEXTURE_MAG_FILTER,we[S.magFilter]),e.texParameteri(M,e.TEXTURE_MIN_FILTER,we[S.minFilter]),S.compareFunction&&(e.texParameteri(M,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(M,e.TEXTURE_COMPARE_FUNC,gt[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Yt||S.minFilter!==bn&&S.minFilter!==Di||S.type===Br&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){let D=t.get("EXT_texture_filter_anisotropic");e.texParameterf(M,D.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,a.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function J(M,S){let D=!1;M.__webglInit===void 0&&(M.__webglInit=!0,S.addEventListener("dispose",R));let W=S.source,$=f.get(W);$===void 0&&($={},f.set(W,$));let _e=G(S);if(_e!==M.__cacheKey){$[_e]===void 0&&($[_e]={texture:e.createTexture(),usedTimes:0},s.memory.textures++,D=!0),$[_e].usedTimes++;let xe=$[M.__cacheKey];xe!==void 0&&($[M.__cacheKey].usedTimes--,xe.usedTimes===0&&H(S)),M.__cacheKey=_e,M.__webglTexture=$[_e].texture}return D}function re(M,S,D){return Math.floor(Math.floor(M/D)/S)}function oe(M,S,D,W){let $=M.updateRanges;if($.length===0)r.texSubImage2D(e.TEXTURE_2D,0,0,0,S.width,S.height,D,W,S.data);else{$.sort((Se,De)=>Se.start-De.start);let _e=0;for(let Se=1;Se<$.length;Se++){let De=$[_e],he=$[Se],ze=De.start+De.count,Ve=re(he.start,S.width,4),$e=re(De.start,S.width,4);he.start<=ze+1&&Ve===$e&&re(he.start+he.count-1,S.width,4)===Ve?De.count=Math.max(De.count,he.start+he.count-De.start):(++_e,$[_e]=he)}$.length=_e+1;let xe=r.getParameter(e.UNPACK_ROW_LENGTH),I=r.getParameter(e.UNPACK_SKIP_PIXELS),me=r.getParameter(e.UNPACK_SKIP_ROWS);r.pixelStorei(e.UNPACK_ROW_LENGTH,S.width);for(let Se=0,De=$.length;Se<De;Se++){let he=$[Se],ze=Math.floor(he.start/4),Ve=Math.ceil(he.count/4),$e=ze%S.width,mt=Math.floor(ze/S.width),U=Ve;r.pixelStorei(e.UNPACK_SKIP_PIXELS,$e),r.pixelStorei(e.UNPACK_SKIP_ROWS,mt),r.texSubImage2D(e.TEXTURE_2D,0,$e,mt,U,1,D,W,S.data)}M.clearUpdateRanges(),r.pixelStorei(e.UNPACK_ROW_LENGTH,xe),r.pixelStorei(e.UNPACK_SKIP_PIXELS,I),r.pixelStorei(e.UNPACK_SKIP_ROWS,me)}}function Pe(M,S,D){let W=e.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(W=e.TEXTURE_2D_ARRAY),S.isData3DTexture&&(W=e.TEXTURE_3D);let $=J(M,S),_e=S.source;r.bindTexture(W,M.__webglTexture,e.TEXTURE0+D);let xe=i.get(_e);if(_e.version!==xe.__version||$===!0){if(r.activeTexture(e.TEXTURE0+D),!(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)){let Q=dt.getPrimaries(dt.workingColorSpace),ne=S.colorSpace===xi?null:dt.getPrimaries(S.colorSpace),Ae=S.colorSpace===xi||Q===ne?e.NONE:e.BROWSER_DEFAULT_WEBGL;r.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae)}r.pixelStorei(e.UNPACK_ALIGNMENT,S.unpackAlignment);let I=m(S.image,!1,a.maxTextureSize);I=ut(S,I);let me=n.convert(S.format,S.colorSpace),Se=n.convert(S.type),De=y(S.internalFormat,me,Se,S.normalized,S.colorSpace,S.isVideoTexture);Ze(W,S);let he,ze=S.mipmaps,Ve=S.isVideoTexture!==!0,$e=xe.__version===void 0||$===!0,mt=_e.dataReady,U=C(S,I);if(S.isDepthTexture)De=E(S.format===Ui,S.type),$e&&(Ve?r.texStorage2D(e.TEXTURE_2D,1,De,I.width,I.height):r.texImage2D(e.TEXTURE_2D,0,De,I.width,I.height,0,me,Se,null));else if(S.isDataTexture)if(ze.length>0){Ve&&$e&&r.texStorage2D(e.TEXTURE_2D,U,De,ze[0].width,ze[0].height);for(let Q=0,ne=ze.length;Q<ne;Q++)he=ze[Q],Ve?mt&&r.texSubImage2D(e.TEXTURE_2D,Q,0,0,he.width,he.height,me,Se,he.data):r.texImage2D(e.TEXTURE_2D,Q,De,he.width,he.height,0,me,Se,he.data);S.generateMipmaps=!1}else Ve?($e&&r.texStorage2D(e.TEXTURE_2D,U,De,I.width,I.height),mt&&oe(S,I,me,Se)):r.texImage2D(e.TEXTURE_2D,0,De,I.width,I.height,0,me,Se,I.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Ve&&$e&&r.texStorage3D(e.TEXTURE_2D_ARRAY,U,De,ze[0].width,ze[0].height,I.depth);for(let Q=0,ne=ze.length;Q<ne;Q++)if(he=ze[Q],S.format!==Lr)if(me!==null)if(Ve){if(mt)if(S.layerUpdates.size>0){let Ae=Vu(he.width,he.height,S.format,S.type);for(let Re of S.layerUpdates){let le=he.data.subarray(Re*Ae/he.data.BYTES_PER_ELEMENT,(Re+1)*Ae/he.data.BYTES_PER_ELEMENT);r.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,Re,he.width,he.height,1,me,le)}}else r.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,he.width,he.height,I.depth,me,he.data)}else r.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Q,De,he.width,he.height,I.depth,0,he.data,0,0);else Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ve?mt&&r.texSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,he.width,he.height,I.depth,me,Se,he.data):r.texImage3D(e.TEXTURE_2D_ARRAY,Q,De,he.width,he.height,I.depth,0,me,Se,he.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{Ve&&$e&&r.texStorage2D(e.TEXTURE_2D,U,De,ze[0].width,ze[0].height);for(let Q=0,ne=ze.length;Q<ne;Q++)he=ze[Q],S.format!==Lr?me!==null?Ve?mt&&r.compressedTexSubImage2D(e.TEXTURE_2D,Q,0,0,he.width,he.height,me,he.data):r.compressedTexImage2D(e.TEXTURE_2D,Q,De,he.width,he.height,0,he.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ve?mt&&r.texSubImage2D(e.TEXTURE_2D,Q,0,0,he.width,he.height,me,Se,he.data):r.texImage2D(e.TEXTURE_2D,Q,De,he.width,he.height,0,me,Se,he.data)}else if(S.isDataArrayTexture)if(Ve){if($e&&r.texStorage3D(e.TEXTURE_2D_ARRAY,U,De,I.width,I.height,I.depth),mt)if(S.layerUpdates.size>0){let Q=Vu(I.width,I.height,S.format,S.type);for(let ne of S.layerUpdates){let Ae=I.data.subarray(ne*Q/I.data.BYTES_PER_ELEMENT,(ne+1)*Q/I.data.BYTES_PER_ELEMENT);r.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ne,I.width,I.height,1,me,Se,Ae)}S.clearLayerUpdates()}else r.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,I.width,I.height,I.depth,me,Se,I.data)}else r.texImage3D(e.TEXTURE_2D_ARRAY,0,De,I.width,I.height,I.depth,0,me,Se,I.data);else if(S.isData3DTexture)Ve?($e&&r.texStorage3D(e.TEXTURE_3D,U,De,I.width,I.height,I.depth),mt&&r.texSubImage3D(e.TEXTURE_3D,0,0,0,0,I.width,I.height,I.depth,me,Se,I.data)):r.texImage3D(e.TEXTURE_3D,0,De,I.width,I.height,I.depth,0,me,Se,I.data);else if(S.isFramebufferTexture){if($e)if(Ve)r.texStorage2D(e.TEXTURE_2D,U,De,I.width,I.height);else{let Q=I.width,ne=I.height;for(let Ae=0;Ae<U;Ae++)r.texImage2D(e.TEXTURE_2D,Ae,De,Q,ne,0,me,Se,null),Q>>=1,ne>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in e){let Q=e.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),I.parentNode!==Q){Q.appendChild(I),d.add(S),Q.onpaint=ne=>{let Ae=ne.changedElements;for(let Re of d)Ae.includes(Re.image)&&(Re.needsUpdate=!0)},Q.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,I);else{let ne=e.RGBA,Ae=e.RGBA,Re=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,ne,Ae,Re,I)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(ze.length>0){if(Ve&&$e){let Q=nt(ze[0]);r.texStorage2D(e.TEXTURE_2D,U,De,Q.width,Q.height)}for(let Q=0,ne=ze.length;Q<ne;Q++)he=ze[Q],Ve?mt&&r.texSubImage2D(e.TEXTURE_2D,Q,0,0,me,Se,he):r.texImage2D(e.TEXTURE_2D,Q,De,me,Se,he);S.generateMipmaps=!1}else if(Ve){if($e){let Q=nt(I);r.texStorage2D(e.TEXTURE_2D,U,De,Q.width,Q.height)}mt&&r.texSubImage2D(e.TEXTURE_2D,0,0,0,me,Se,I)}else r.texImage2D(e.TEXTURE_2D,0,De,me,Se,I);p(S)&&b(W),xe.__version=_e.version,S.onUpdate&&S.onUpdate(S)}M.__version=S.version}function Ne(M,S,D){if(S.image.length!==6)return;let W=J(M,S),$=S.source;r.bindTexture(e.TEXTURE_CUBE_MAP,M.__webglTexture,e.TEXTURE0+D);let _e=i.get($);if($.version!==_e.__version||W===!0){r.activeTexture(e.TEXTURE0+D);let xe=dt.getPrimaries(dt.workingColorSpace),I=S.colorSpace===xi?null:dt.getPrimaries(S.colorSpace),me=S.colorSpace===xi||xe===I?e.NONE:e.BROWSER_DEFAULT_WEBGL;r.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(e.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);let Se=S.isCompressedTexture||S.image[0].isCompressedTexture,De=S.image[0]&&S.image[0].isDataTexture,he=[];for(let le=0;le<6;le++)!Se&&!De?he[le]=m(S.image[le],!0,a.maxCubemapSize):he[le]=De?S.image[le].image:S.image[le],he[le]=ut(S,he[le]);let ze=he[0],Ve=n.convert(S.format,S.colorSpace),$e=n.convert(S.type),mt=y(S.internalFormat,Ve,$e,S.normalized,S.colorSpace),U=S.isVideoTexture!==!0,Q=_e.__version===void 0||W===!0,ne=$.dataReady,Ae=C(S,ze);Ze(e.TEXTURE_CUBE_MAP,S);let Re;if(Se){U&&Q&&r.texStorage2D(e.TEXTURE_CUBE_MAP,Ae,mt,ze.width,ze.height);for(let le=0;le<6;le++){Re=he[le].mipmaps;for(let Ee=0;Ee<Re.length;Ee++){let We=Re[Ee];S.format!==Lr?Ve!==null?U?ne&&r.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ee,0,0,We.width,We.height,Ve,We.data):r.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ee,mt,We.width,We.height,0,We.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?ne&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ee,0,0,We.width,We.height,Ve,$e,We.data):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ee,mt,We.width,We.height,0,Ve,$e,We.data)}}}else{if(Re=S.mipmaps,U&&Q){Re.length>0&&Ae++;let le=nt(he[0]);r.texStorage2D(e.TEXTURE_CUBE_MAP,Ae,mt,le.width,le.height)}for(let le=0;le<6;le++)if(De){U?ne&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,he[le].width,he[le].height,Ve,$e,he[le].data):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,mt,he[le].width,he[le].height,0,Ve,$e,he[le].data);for(let Ee=0;Ee<Re.length;Ee++){let We=Re[Ee].image[le].image;U?ne&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ee+1,0,0,We.width,We.height,Ve,$e,We.data):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ee+1,mt,We.width,We.height,0,Ve,$e,We.data)}}else{U?ne&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,Ve,$e,he[le]):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,mt,Ve,$e,he[le]);for(let Ee=0;Ee<Re.length;Ee++){let We=Re[Ee];U?ne&&r.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ee+1,0,0,Ve,$e,We.image[le]):r.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ee+1,mt,Ve,$e,We.image[le])}}}p(S)&&b(e.TEXTURE_CUBE_MAP),_e.__version=$.version,S.onUpdate&&S.onUpdate(S)}M.__version=S.version}function pe(M,S,D,W,$,_e){let xe=n.convert(D.format,D.colorSpace),I=n.convert(D.type),me=y(D.internalFormat,xe,I,D.normalized,D.colorSpace),Se=i.get(S),De=i.get(D);if(De.__renderTarget=S,!Se.__hasExternalTextures){let he=Math.max(1,S.width>>_e),ze=Math.max(1,S.height>>_e);$===e.TEXTURE_3D||$===e.TEXTURE_2D_ARRAY?r.texImage3D($,_e,me,he,ze,S.depth,0,xe,I,null):r.texImage2D($,_e,me,he,ze,0,xe,I,null)}r.bindFramebuffer(e.FRAMEBUFFER,M),L(S)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,W,$,De.__webglTexture,0,it(S)):($===e.TEXTURE_2D||$>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,W,$,De.__webglTexture,_e),r.bindFramebuffer(e.FRAMEBUFFER,null)}function ke(M,S,D){if(e.bindRenderbuffer(e.RENDERBUFFER,M),S.depthBuffer){let W=S.depthTexture,$=W&&W.isDepthTexture?W.type:null,_e=E(S.stencilBuffer,$),xe=S.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;L(S)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,it(S),_e,S.width,S.height):D?e.renderbufferStorageMultisample(e.RENDERBUFFER,it(S),_e,S.width,S.height):e.renderbufferStorage(e.RENDERBUFFER,_e,S.width,S.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,xe,e.RENDERBUFFER,M)}else{let W=S.textures;for(let $=0;$<W.length;$++){let _e=W[$],xe=n.convert(_e.format,_e.colorSpace),I=n.convert(_e.type),me=y(_e.internalFormat,xe,I,_e.normalized,_e.colorSpace);L(S)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,it(S),me,S.width,S.height):D?e.renderbufferStorageMultisample(e.RENDERBUFFER,it(S),me,S.width,S.height):e.renderbufferStorage(e.RENDERBUFFER,me,S.width,S.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function te(M,S,D){let W=S.isWebGLCubeRenderTarget===!0;if(r.bindFramebuffer(e.FRAMEBUFFER,M),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let $=i.get(S.depthTexture);if($.__renderTarget=S,(!$.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),W){if($.__webglInit===void 0&&($.__webglInit=!0,S.depthTexture.addEventListener("dispose",R)),$.__webglTexture===void 0){$.__webglTexture=e.createTexture(),r.bindTexture(e.TEXTURE_CUBE_MAP,$.__webglTexture),Ze(e.TEXTURE_CUBE_MAP,S.depthTexture);let Se=n.convert(S.depthTexture.format),De=n.convert(S.depthTexture.type),he;S.depthTexture.format===ni?he=e.DEPTH_COMPONENT24:S.depthTexture.format===Ui&&(he=e.DEPTH24_STENCIL8);for(let ze=0;ze<6;ze++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ze,0,he,S.width,S.height,0,Se,De,null)}}else ce(S.depthTexture,0);let _e=$.__webglTexture,xe=it(S),I=W?e.TEXTURE_CUBE_MAP_POSITIVE_X+D:e.TEXTURE_2D,me=S.depthTexture.format===Ui?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(S.depthTexture.format===ni)L(S)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,me,I,_e,0,xe):e.framebufferTexture2D(e.FRAMEBUFFER,me,I,_e,0);else if(S.depthTexture.format===Ui)L(S)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,me,I,_e,0,xe):e.framebufferTexture2D(e.FRAMEBUFFER,me,I,_e,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Z(M){let S=i.get(M),D=M.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==M.depthTexture){let W=M.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),W){let $=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,W.removeEventListener("dispose",$)};W.addEventListener("dispose",$),S.__depthDisposeCallback=$}S.__boundDepthTexture=W}if(M.depthTexture&&!S.__autoAllocateDepthBuffer)if(D)for(let W=0;W<6;W++)te(S.__webglFramebuffer[W],M,W);else{let W=M.texture.mipmaps;W&&W.length>0?te(S.__webglFramebuffer[0],M,0):te(S.__webglFramebuffer,M,0)}else if(D){S.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(r.bindFramebuffer(e.FRAMEBUFFER,S.__webglFramebuffer[W]),S.__webglDepthbuffer[W]===void 0)S.__webglDepthbuffer[W]=e.createRenderbuffer(),ke(S.__webglDepthbuffer[W],M,!1);else{let $=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,_e=S.__webglDepthbuffer[W];e.bindRenderbuffer(e.RENDERBUFFER,_e),e.framebufferRenderbuffer(e.FRAMEBUFFER,$,e.RENDERBUFFER,_e)}}else{let W=M.texture.mipmaps;if(W&&W.length>0?r.bindFramebuffer(e.FRAMEBUFFER,S.__webglFramebuffer[0]):r.bindFramebuffer(e.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=e.createRenderbuffer(),ke(S.__webglDepthbuffer,M,!1);else{let $=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,_e=S.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,_e),e.framebufferRenderbuffer(e.FRAMEBUFFER,$,e.RENDERBUFFER,_e)}}r.bindFramebuffer(e.FRAMEBUFFER,null)}function se(M,S,D){let W=i.get(M);S!==void 0&&pe(W.__webglFramebuffer,M,M.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),D!==void 0&&Z(M)}function Te(M){let S=M.texture,D=i.get(M),W=i.get(S);M.addEventListener("dispose",_);let $=M.textures,_e=M.isWebGLCubeRenderTarget===!0,xe=$.length>1;if(xe||(W.__webglTexture===void 0&&(W.__webglTexture=e.createTexture()),W.__version=S.version,s.memory.textures++),_e){D.__webglFramebuffer=[];for(let I=0;I<6;I++)if(S.mipmaps&&S.mipmaps.length>0){D.__webglFramebuffer[I]=[];for(let me=0;me<S.mipmaps.length;me++)D.__webglFramebuffer[I][me]=e.createFramebuffer()}else D.__webglFramebuffer[I]=e.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){D.__webglFramebuffer=[];for(let I=0;I<S.mipmaps.length;I++)D.__webglFramebuffer[I]=e.createFramebuffer()}else D.__webglFramebuffer=e.createFramebuffer();if(xe)for(let I=0,me=$.length;I<me;I++){let Se=i.get($[I]);Se.__webglTexture===void 0&&(Se.__webglTexture=e.createTexture(),s.memory.textures++)}if(M.samples>0&&L(M)===!1){D.__webglMultisampledFramebuffer=e.createFramebuffer(),D.__webglColorRenderbuffer=[],r.bindFramebuffer(e.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let I=0;I<$.length;I++){let me=$[I];D.__webglColorRenderbuffer[I]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,D.__webglColorRenderbuffer[I]);let Se=n.convert(me.format,me.colorSpace),De=n.convert(me.type),he=y(me.internalFormat,Se,De,me.normalized,me.colorSpace,M.isXRRenderTarget===!0),ze=it(M);e.renderbufferStorageMultisample(e.RENDERBUFFER,ze,he,M.width,M.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+I,e.RENDERBUFFER,D.__webglColorRenderbuffer[I])}e.bindRenderbuffer(e.RENDERBUFFER,null),M.depthBuffer&&(D.__webglDepthRenderbuffer=e.createRenderbuffer(),ke(D.__webglDepthRenderbuffer,M,!0)),r.bindFramebuffer(e.FRAMEBUFFER,null)}}if(_e){r.bindTexture(e.TEXTURE_CUBE_MAP,W.__webglTexture),Ze(e.TEXTURE_CUBE_MAP,S);for(let I=0;I<6;I++)if(S.mipmaps&&S.mipmaps.length>0)for(let me=0;me<S.mipmaps.length;me++)pe(D.__webglFramebuffer[I][me],M,S,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+I,me);else pe(D.__webglFramebuffer[I],M,S,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+I,0);p(S)&&b(e.TEXTURE_CUBE_MAP),r.unbindTexture()}else if(xe){for(let I=0,me=$.length;I<me;I++){let Se=$[I],De=i.get(Se),he=e.TEXTURE_2D;(M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)&&(he=M.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),r.bindTexture(he,De.__webglTexture),Ze(he,Se),pe(D.__webglFramebuffer,M,Se,e.COLOR_ATTACHMENT0+I,he,0),p(Se)&&b(he)}r.unbindTexture()}else{let I=e.TEXTURE_2D;if((M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)&&(I=M.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),r.bindTexture(I,W.__webglTexture),Ze(I,S),S.mipmaps&&S.mipmaps.length>0)for(let me=0;me<S.mipmaps.length;me++)pe(D.__webglFramebuffer[me],M,S,e.COLOR_ATTACHMENT0,I,me);else pe(D.__webglFramebuffer,M,S,e.COLOR_ATTACHMENT0,I,0);p(S)&&b(I),r.unbindTexture()}M.depthBuffer&&Z(M)}function ve(M){let S=M.textures;for(let D=0,W=S.length;D<W;D++){let $=S[D];if(p($)){let _e=w(M),xe=i.get($).__webglTexture;r.bindTexture(_e,xe),b(_e),r.unbindTexture()}}}let Ue=[],Fe=[];function et(M){if(M.samples>0){if(L(M)===!1){let S=M.textures,D=M.width,W=M.height,$=e.COLOR_BUFFER_BIT,_e=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,xe=i.get(M),I=S.length>1;if(I)for(let Se=0;Se<S.length;Se++)r.bindFramebuffer(e.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Se,e.RENDERBUFFER,null),r.bindFramebuffer(e.FRAMEBUFFER,xe.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Se,e.TEXTURE_2D,null,0);r.bindFramebuffer(e.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer);let me=M.texture.mipmaps;me&&me.length>0?r.bindFramebuffer(e.DRAW_FRAMEBUFFER,xe.__webglFramebuffer[0]):r.bindFramebuffer(e.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let Se=0;Se<S.length;Se++){if(M.resolveDepthBuffer&&(M.depthBuffer&&($|=e.DEPTH_BUFFER_BIT),M.stencilBuffer&&M.resolveStencilBuffer&&($|=e.STENCIL_BUFFER_BIT)),I){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,xe.__webglColorRenderbuffer[Se]);let De=i.get(S[Se]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,De,0)}e.blitFramebuffer(0,0,D,W,0,0,D,W,$,e.NEAREST),l===!0&&(Ue.length=0,Fe.length=0,Ue.push(e.COLOR_ATTACHMENT0+Se),M.depthBuffer&&M.storeMultisampledDepthBuffer===!1&&(Ue.push(_e),Fe.push(_e),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Fe)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ue))}if(r.bindFramebuffer(e.READ_FRAMEBUFFER,null),r.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),I)for(let Se=0;Se<S.length;Se++){r.bindFramebuffer(e.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Se,e.RENDERBUFFER,xe.__webglColorRenderbuffer[Se]);let De=i.get(S[Se]).__webglTexture;r.bindFramebuffer(e.FRAMEBUFFER,xe.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Se,e.TEXTURE_2D,De,0)}r.bindFramebuffer(e.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}else if(M.depthBuffer&&M.storeMultisampledDepthBuffer===!1&&l){let S=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[S])}}}function it(M){return Math.min(a.maxSamples,M.samples)}function L(M){let S=i.get(M);return M.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function vt(M){let S=s.render.frame;h.get(M)!==S&&(h.set(M,S),M.update())}function ut(M,S){let D=M.colorSpace,W=M.format,$=M.type;return M.isCompressedTexture===!0||M.isVideoTexture===!0||D!==os&&D!==xi&&(dt.getTransfer(D)===xt?(W!==Lr||$!==Sr)&&Je("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qe("WebGLTextures: Unsupported texture color space:",D)),S}function nt(M){return typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement?(u.width=M.naturalWidth||M.width,u.height=M.naturalHeight||M.height):typeof VideoFrame<"u"&&M instanceof VideoFrame?(u.width=M.displayWidth,u.height=M.displayHeight):(u.width=M.width,u.height=M.height),u}this.allocateTextureUnit=j,this.resetTextureUnits=q,this.getTextureUnits=A,this.setTextureUnits=O,this.setTexture2D=ce,this.setTexture2DArray=X,this.setTexture3D=Y,this.setTextureCube=ee,this.rebindTextures=se,this.setupRenderTarget=Te,this.updateRenderTargetMipmap=ve,this.updateMultisampleRenderTarget=et,this.setupDepthRenderbuffer=Z,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=L,this.isReversedDepthBuffer=function(){return r.buffers.depth.getReversed()}}function Pv(e,t){function r(i,a=xi){let n,s=dt.getTransfer(a);if(i===Sr)return e.UNSIGNED_BYTE;if(i===hl)return e.UNSIGNED_SHORT_4_4_4_4;if(i===cl)return e.UNSIGNED_SHORT_5_5_5_1;if(i===Th)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===Eh)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===yh)return e.BYTE;if(i===Mh)return e.SHORT;if(i===Ka)return e.UNSIGNED_SHORT;if(i===ul)return e.INT;if(i===Hr)return e.UNSIGNED_INT;if(i===Br)return e.FLOAT;if(i===Gr)return e.HALF_FLOAT;if(i===bh)return e.ALPHA;if(i===wh)return e.RGB;if(i===Lr)return e.RGBA;if(i===ni)return e.DEPTH_COMPONENT;if(i===Ui)return e.DEPTH_STENCIL;if(i===ds)return e.RED;if(i===dl)return e.RED_INTEGER;if(i===zi)return e.RG;if(i===pl)return e.RG_INTEGER;if(i===fl)return e.RGBA_INTEGER;if(i===Zn||i===$n||i===Qn||i===es)if(s===xt)if(n=t.get("WEBGL_compressed_texture_s3tc_srgb"),n!==null){if(i===Zn)return n.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===$n)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Qn)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===es)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(n=t.get("WEBGL_compressed_texture_s3tc"),n!==null){if(i===Zn)return n.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===$n)return n.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Qn)return n.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===es)return n.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===wo||i===Ao||i===Ro||i===Co)if(n=t.get("WEBGL_compressed_texture_pvrtc"),n!==null){if(i===wo)return n.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ao)return n.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ro)return n.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Co)return n.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Po||i===Lo||i===No||i===Do||i===Uo||i===as||i===Io)if(n=t.get("WEBGL_compressed_texture_etc"),n!==null){if(i===Po||i===Lo)return s===xt?n.COMPRESSED_SRGB8_ETC2:n.COMPRESSED_RGB8_ETC2;if(i===No)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:n.COMPRESSED_RGBA8_ETC2_EAC;if(i===Do)return n.COMPRESSED_R11_EAC;if(i===Uo)return n.COMPRESSED_SIGNED_R11_EAC;if(i===as)return n.COMPRESSED_RG11_EAC;if(i===Io)return n.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Oo||i===Fo||i===zo||i===Bo||i===ko||i===Vo||i===Ho||i===Go||i===Wo||i===Xo||i===qo||i===jo||i===Yo||i===Ko)if(n=t.get("WEBGL_compressed_texture_astc"),n!==null){if(i===Oo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:n.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Fo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:n.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===zo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:n.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Bo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:n.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ko)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:n.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Vo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:n.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ho)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:n.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Go)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:n.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Wo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:n.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Xo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:n.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===qo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:n.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===jo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:n.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Yo)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:n.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Ko)return s===xt?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:n.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Jo||i===Zo||i===$o)if(n=t.get("EXT_texture_compression_bptc"),n!==null){if(i===Jo)return s===xt?n.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:n.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Zo)return n.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===$o)return n.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Qo||i===el||i===ns||i===tl)if(n=t.get("EXT_texture_compression_rgtc"),n!==null){if(i===Qo)return n.COMPRESSED_RED_RGTC1_EXT;if(i===el)return n.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ns)return n.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===tl)return n.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ja?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:r}}var Lv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Nv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Dv=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let r=new Xh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,r=new dr({vertexShader:Lv,fragmentShader:Nv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new sr(new an(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Uv=class extends ki{constructor(e,t){super();let r=this,i=null,a=1,n=null,s="local-floor",o=1,l=null,u=null,h=null,d=null,c=null,f=null,g=typeof XRWebGLBinding<"u",v=new Dv,m={},p=t.getContextAttributes(),b=null,w=null,y=[],E=[],C=new Me,R=null,_=null,T=new cr;T.viewport=new Pt;let H=new cr;H.viewport=new Pt;let N=[T,H],F=new Nf,q=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let re=y[J];return re===void 0&&(re=new Xs,y[J]=re),re.getTargetRaySpace()},this.getControllerGrip=function(J){let re=y[J];return re===void 0&&(re=new Xs,y[J]=re),re.getGripSpace()},this.getHand=function(J){let re=y[J];return re===void 0&&(re=new Xs,y[J]=re),re.getHandSpace()};function O(J){let re=E.indexOf(J.inputSource);if(re===-1)return;let oe=y[re];oe!==void 0&&(oe.update(J.inputSource,J.frame,l||n),oe.dispatchEvent({type:J.type,data:J.inputSource}))}function j(){i.removeEventListener("select",O),i.removeEventListener("selectstart",O),i.removeEventListener("selectend",O),i.removeEventListener("squeeze",O),i.removeEventListener("squeezestart",O),i.removeEventListener("squeezeend",O),i.removeEventListener("end",j),i.removeEventListener("inputsourceschange",G);for(let J=0;J<y.length;J++){let re=E[J];re!==null&&(E[J]=null,y[J].disconnect(re))}q=null,A=null,v.reset();for(let J in m)delete m[J];if(e.setRenderTarget(b),c=null,d=null,h=null,i=null,w=null,Ze.stop(),r.isPresenting=!1,e.setPixelRatio(R),e.setSize(C.width,C.height,!1),_!==null){let J=_.camera;J.fov=_.fov,J.zoom=_.zoom,J.updateProjectionMatrix(),_=null}r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){a=J,r.isPresenting===!0&&Je("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){s=J,r.isPresenting===!0&&Je("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||n},this.setReferenceSpace=function(J){l=J},this.getBaseLayer=function(){return d!==null?d:c},this.getBinding=function(){return h===null&&g&&(h=new XRWebGLBinding(i,t)),h},this.getFrame=function(){return f},this.getSession=function(){return i},this.setSession=async function(J){if(i=J,i!==null){if(b=e.getRenderTarget(),i.addEventListener("select",O),i.addEventListener("selectstart",O),i.addEventListener("selectend",O),i.addEventListener("squeeze",O),i.addEventListener("squeezestart",O),i.addEventListener("squeezeend",O),i.addEventListener("end",j),i.addEventListener("inputsourceschange",G),p.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(C),g&&"createProjectionLayer"in XRWebGLBinding.prototype){let re=null,oe=null,Pe=null;p.depth&&(Pe=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,re=p.stencil?Ui:ni,oe=p.stencil?Ja:Hr);let Ne={colorFormat:t.RGBA8,depthFormat:Pe,scaleFactor:a};h=this.getBinding(),d=h.createProjectionLayer(Ne),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),w=new Nr(d.textureWidth,d.textureHeight,{format:Lr,type:Sr,depthTexture:new $a(d.textureWidth,d.textureHeight,oe,void 0,void 0,void 0,void 0,void 0,void 0,re),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let re={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:a};c=new XRWebGLLayer(i,t,re),i.updateRenderState({baseLayer:c}),e.setPixelRatio(1),e.setSize(c.framebufferWidth,c.framebufferHeight,!1),w=new Nr(c.framebufferWidth,c.framebufferHeight,{format:Lr,type:Sr,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil,resolveDepthBuffer:c.ignoreDepthValues===!1,resolveStencilBuffer:c.ignoreDepthValues===!1,storeMultisampledDepthBuffer:c.ignoreDepthValues===!1,storeMultisampledStencilBuffer:c.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(o),l=null,n=await i.requestReferenceSpace(s),Ze.setContext(i),Ze.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function G(J){for(let re=0;re<J.removed.length;re++){let oe=J.removed[re],Pe=E.indexOf(oe);Pe>=0&&(E[Pe]=null,y[Pe].disconnect(oe))}for(let re=0;re<J.added.length;re++){let oe=J.added[re],Pe=E.indexOf(oe);if(Pe===-1){for(let pe=0;pe<y.length;pe++)if(pe>=E.length){E.push(oe),Pe=pe;break}else if(E[pe]===null){E[pe]=oe,Pe=pe;break}if(Pe===-1)break}let Ne=y[Pe];Ne&&Ne.connect(oe)}}let ce=new z,X=new z;function Y(J,re,oe){ce.setFromMatrixPosition(re.matrixWorld),X.setFromMatrixPosition(oe.matrixWorld);let Pe=ce.distanceTo(X),Ne=re.projectionMatrix.elements,pe=oe.projectionMatrix.elements,ke=Ne[14]/(Ne[10]-1),te=Ne[14]/(Ne[10]+1),Z=(Ne[9]+1)/Ne[5],se=(Ne[9]-1)/Ne[5],Te=(Ne[8]-1)/Ne[0],ve=(pe[8]+1)/pe[0],Ue=ke*Te,Fe=ke*ve,et=Pe/(-Te+ve),it=et*-Te;if(re.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(it),J.translateZ(et),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Ne[10]===-1)J.projectionMatrix.copy(re.projectionMatrix),J.projectionMatrixInverse.copy(re.projectionMatrixInverse);else{let L=ke+et,vt=te+et,ut=Ue-it,nt=Fe+(Pe-it),M=Z*te/vt*L,S=se*te/vt*L;J.projectionMatrix.makePerspective(ut,nt,M,S,L,vt),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function ee(J,re){re===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(re.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(i===null)return;let re=J.near,oe=J.far;v.texture!==null&&(v.depthNear>0&&(re=v.depthNear),v.depthFar>0&&(oe=v.depthFar)),F.near=H.near=T.near=re,F.far=H.far=T.far=oe,(q!==F.near||A!==F.far)&&(i.updateRenderState({depthNear:F.near,depthFar:F.far}),q=F.near,A=F.far),F.layers.mask=J.layers.mask|6,T.layers.mask=F.layers.mask&-5,H.layers.mask=F.layers.mask&-3;let Pe=J.parent,Ne=F.cameras;ee(F,Pe);for(let pe=0;pe<Ne.length;pe++)ee(Ne[pe],Pe);Ne.length===2?Y(F,T,H):F.projectionMatrix.copy(T.projectionMatrix),_===null&&J.isPerspectiveCamera&&(_={camera:J,fov:J.fov,zoom:J.zoom}),Ge(J,F,Pe)};function Ge(J,re,oe){oe===null?J.matrix.copy(re.matrixWorld):(J.matrix.copy(oe.matrixWorld),J.matrix.invert(),J.matrix.multiply(re.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(re.projectionMatrix),J.projectionMatrixInverse.copy(re.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=il*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(d===null&&c===null))return o},this.setFoveation=function(J){o=J,d!==null&&(d.fixedFoveation=J),c!==null&&c.fixedFoveation!==void 0&&(c.fixedFoveation=J)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(F)},this.getCameraTexture=function(J){return m[J]};let we=null;function gt(J,re){if(u=re.getViewerPose(l||n),f=re,u!==null){let oe=u.views;c!==null&&(e.setRenderTargetFramebuffer(w,c.framebuffer),e.setRenderTarget(w));let Pe=!1;oe.length!==F.cameras.length&&(F.cameras.length=0,Pe=!0);for(let pe=0;pe<oe.length;pe++){let ke=oe[pe],te=null;if(c!==null)te=c.getViewport(ke);else{let se=h.getViewSubImage(d,ke);te=se.viewport,pe===0&&(e.setRenderTargetTextures(w,se.colorTexture,se.depthStencilTexture),e.setRenderTarget(w))}let Z=N[pe];Z===void 0&&(Z=new cr,Z.layers.enable(pe),Z.viewport=new Pt,N[pe]=Z),Z.matrix.fromArray(ke.transform.matrix),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.projectionMatrix.fromArray(ke.projectionMatrix),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert(),Z.viewport.set(te.x,te.y,te.width,te.height),pe===0&&(F.matrix.copy(Z.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),Pe===!0&&F.cameras.push(Z)}let Ne=i.enabledFeatures;if(Ne&&Ne.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&g){h=r.getBinding();let pe=h.getDepthInformation(oe[0]);pe&&pe.isValid&&pe.texture&&v.init(pe,i.renderState)}if(Ne&&Ne.includes("camera-access")&&g){e.state.unbindTexture(),h=r.getBinding();for(let pe=0;pe<oe.length;pe++){let ke=oe[pe].camera;if(ke){let te=m[ke];te||(te=new Xh,m[ke]=te);let Z=h.getCameraImage(ke);te.sourceTexture=Z}}}}for(let oe=0;oe<y.length;oe++){let Pe=E[oe],Ne=y[oe];Pe!==null&&Ne!==void 0&&Ne.update(Pe,re,l||n)}we&&we(J,re),re.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:re}),f=null}let Ze=new uc;Ze.setAnimationLoop(gt),this.setAnimationLoop=function(J){we=J},this.dispose=function(){}}},Iv=new Wt,gc=new at;gc.set(-1,0,0,0,1,0,0,0,1);function Ov(e,t){function r(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,ac(e)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function a(m,p,b,w,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?n(m,p):p.isMeshLambertMaterial?(n(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(n(m,p),d(m,p)):p.isMeshPhongMaterial?(n(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(n(m,p),c(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(n(m,p),g(m,p)):p.isMeshDepthMaterial?n(m,p):p.isMeshDistanceMaterial?(n(m,p),v(m,p)):p.isMeshNormalMaterial?n(m,p):p.isLineBasicMaterial?(s(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,b,w):p.isSpriteMaterial?u(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function n(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,r(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,r(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,r(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===nr&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,r(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===nr&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,r(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,r(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,r(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let b=t.get(p),w=b.envMap,y=b.envMapRotation;w&&(m.envMap.value=w,m.envMapRotation.value.setFromMatrix4(Iv.makeRotationFromEuler(y)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(gc),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,r(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,r(p.aoMap,m.aoMapTransform))}function s(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,r(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,b,w){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*b,m.scale.value=w*.5,p.map&&(m.map.value=p.map,r(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,r(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,r(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,r(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function c(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,r(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,r(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,b){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,r(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,r(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,r(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,r(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,r(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===nr&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,r(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,r(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,r(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,r(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,r(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,r(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,r(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){let b=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:a}}function Fv(e,t,r,i){let a={},n={},s=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,E){let C=E.program;i.uniformBlockBinding(y,C)}function u(y,E){let C=a[y.id];C===void 0&&(m(y),C=h(y),a[y.id]=C,y.addEventListener("dispose",b));let R=E.program;i.updateUBOMapping(y,R);let _=t.render.frame;n[y.id]!==_&&(c(y),n[y.id]=_)}function h(y){let E=d();y.__bindingPointIndex=E;let C=e.createBuffer(),R=y.__size,_=y.usage;return e.bindBuffer(e.UNIFORM_BUFFER,C),e.bufferData(e.UNIFORM_BUFFER,R,_),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,E,C),C}function d(){for(let y=0;y<o;y++)if(s.indexOf(y)===-1)return s.push(y),y;return Qe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function c(y){let E=a[y.id],C=y.uniforms,R=y.__cache;e.bindBuffer(e.UNIFORM_BUFFER,E);for(let _=0,T=C.length;_<T;_++){let H=C[_];if(Array.isArray(H))for(let N=0,F=H.length;N<F;N++)f(H[N],_,N,R);else f(H,_,0,R)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function f(y,E,C,R){if(v(y,E,C,R)===!0){let _=y.__offset,T=y.value;if(Array.isArray(T)){let H=0;for(let N=0;N<T.length;N++){let F=T[N],q=p(F);g(F,y.__data,H),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(H+=q.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(T,y.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,_,y.__data)}}function g(y,E,C){typeof y=="number"||typeof y=="boolean"?E[0]=y:y.isMatrix3?(E[0]=y.elements[0],E[1]=y.elements[1],E[2]=y.elements[2],E[3]=0,E[4]=y.elements[3],E[5]=y.elements[4],E[6]=y.elements[5],E[7]=0,E[8]=y.elements[6],E[9]=y.elements[7],E[10]=y.elements[8],E[11]=0):ArrayBuffer.isView(y)?E.set(new y.constructor(y.buffer,y.byteOffset,E.length)):y.toArray(E,C)}function v(y,E,C,R){let _=y.value,T=E+"_"+C;if(R[T]===void 0)return typeof _=="number"||typeof _=="boolean"?R[T]=_:ArrayBuffer.isView(_)?R[T]=_.slice():R[T]=_.clone(),!0;{let H=R[T];if(typeof _=="number"||typeof _=="boolean"){if(H!==_)return R[T]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(H.equals(_)===!1)return H.copy(_),!0}}return!1}function m(y){let E=y.uniforms,C=0,R=16;for(let T=0,H=E.length;T<H;T++){let N=Array.isArray(E[T])?E[T]:[E[T]];for(let F=0,q=N.length;F<q;F++){let A=N[F],O=Array.isArray(A.value)?A.value:[A.value];for(let j=0,G=O.length;j<G;j++){let ce=O[j],X=p(ce),Y=C%R,ee=Y%X.boundary,Ge=Y+ee;C+=ee,Ge!==0&&R-Ge<X.storage&&(C+=R-Ge),A.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),A.__offset=C,C+=X.storage}}}let _=C%R;return _>0&&(C+=R-_),y.__size=C,y.__cache={},this}function p(y){let E={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(E.boundary=4,E.storage=4):y.isVector2?(E.boundary=8,E.storage=8):y.isVector3||y.isColor?(E.boundary=16,E.storage=12):y.isVector4?(E.boundary=16,E.storage=16):y.isMatrix3?(E.boundary=48,E.storage=48):y.isMatrix4?(E.boundary=64,E.storage=64):y.isTexture?Je("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(E.boundary=16,E.storage=y.byteLength):Je("WebGLRenderer: Unsupported uniform value type.",y),E}function b(y){let E=y.target;E.removeEventListener("dispose",b);let C=s.indexOf(E.__bindingPointIndex);s.splice(C,1),e.deleteBuffer(a[E.id]),delete a[E.id],delete n[E.id]}function w(){for(let y in a)e.deleteBuffer(a[y]);s=[],a={},n={}}return{bind:l,update:u,dispose:w}}var zv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Fr=null;function Bv(){return Fr===null&&(Fr=new Rp(zv,16,16,zi,Gr),Fr.name="DFG_LUT",Fr.minFilter=Qt,Fr.magFilter=Qt,Fr.wrapS=ti,Fr.wrapT=ti,Fr.generateMipmaps=!1,Fr.needsUpdate=!0),Fr}var _c=class{constructor(e={}){let{canvas:t=ip(),context:r=null,depth:i=!0,stencil:a=!1,alpha:n=!1,antialias:s=!1,premultipliedAlpha:o=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1,outputBufferType:c=Sr}=e;this.isWebGLRenderer=!0;let f;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=r.getContextAttributes().alpha}else f=n;let g=c,v=new Set([fl,pl,dl]),m=new Set([Sr,Hr,Ka,Ja,hl,cl]),p=new Uint32Array(4),b=new Int32Array(4),w=new z,y=null,E=null,C=[],R=[],_=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Vr,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,H=!1,N=null,F=null,q=null,A=null;this._outputColorSpace=xr;let O=0,j=0,G=null,ce=-1,X=null,Y=new Pt,ee=new Pt,Ge=null,we=new lt(0),gt=0,Ze=t.width,J=t.height,re=1,oe=null,Pe=null,Ne=new Pt(0,0,Ze,J),pe=new Pt(0,0,Ze,J),ke=!1,te=new Hh,Z=!1,se=!1,Te=new Wt,ve=new z,Ue=new Pt,Fe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},et=!1;function it(){return G===null?re:1}let L=r;function vt(x,P){return t.getContext(x,P)}let ut,nt,M,S,D,W,$,_e,xe,I,me,Se,De,he,ze,Ve,$e,mt,U,Q,ne,Ae,Re;try{let x={alpha:!0,depth:i,stencil:a,antialias:s,premultipliedAlpha:o,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r186"),t.addEventListener("webglcontextlost",We,!1),t.addEventListener("webglcontextrestored",Ut,!1),t.addEventListener("webglcontextcreationerror",_t,!1),L===null){let P="webgl2";if(L=vt(P,x),L===null)throw vt(P)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}le()}catch(x){throw t.removeEventListener("webglcontextlost",We,!1),t.removeEventListener("webglcontextrestored",Ut,!1),t.removeEventListener("webglcontextcreationerror",_t,!1),Qe("WebGLRenderer: "+x.message),x}function le(){ut=new B_(L),ut.init(),ne=new Pv(L,ut),nt=new C_(L,ut,e,ne),M=new Rv(L,ut),nt.reversedDepthBuffer&&d&&M.buffers.depth.setReversed(!0),F=L.createFramebuffer(),q=L.createFramebuffer(),A=L.createFramebuffer(),S=new H_(L),D=new fv,W=new Cv(L,ut,M,D,nt,ne,S),$=new z_(T),_e=new Wf(L),Ae=new A_(L,_e),xe=new k_(L,_e,S,Ae),I=new W_(L,xe,_e,Ae,S),mt=new G_(L,nt,W),ze=new P_(D),me=new pv(T,$,ut,nt,Ae,ze),Se=new Ov(T,D),De=new gv,he=new Mv(ut),$e=new w_(T,$,M,I,f,o),Ve=new Av(T,I,nt),Re=new Fv(L,S,nt,M),U=new R_(L,ut,S),Q=new V_(L,ut,S),S.programs=me.programs,T.capabilities=nt,T.extensions=ut,T.properties=D,T.renderLists=De,T.shadowMap=Ve,T.state=M,T.info=S}g!==Sr&&(_=new q_(g,t.width,t.height,s,i,a));let Ee=new Uv(T,L);this.xr=Ee,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let x=ut.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){let x=ut.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return re},this.setPixelRatio=function(x){x!==void 0&&(re=x,this.setSize(Ze,J,!1))},this.getSize=function(x){return x.set(Ze,J)},this.setSize=function(x,P,k=!0){if(Ee.isPresenting){Je("WebGLRenderer: Can't change size while VR device is presenting.");return}Ze=x,J=P,t.width=Math.floor(x*re),t.height=Math.floor(P*re),k===!0&&(t.style.width=x+"px",t.style.height=P+"px"),_!==null&&_.setSize(t.width,t.height),this.setViewport(0,0,x,P)},this.getDrawingBufferSize=function(x){return x.set(Ze*re,J*re).floor()},this.setDrawingBufferSize=function(x,P,k){Ze=x,J=P,re=k,t.width=Math.floor(x*k),t.height=Math.floor(P*k),this.setViewport(0,0,x,P)},this.setEffects=function(x){if(g===Sr){Qe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(x){for(let P=0;P<x.length;P++)if(x[P].isOutputPass===!0){Je("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}_.setEffects(x||[])},this.getCurrentViewport=function(x){return x.copy(Y)},this.getViewport=function(x){return x.copy(Ne)},this.setViewport=function(x,P,k,V){x.isVector4?Ne.set(x.x,x.y,x.z,x.w):Ne.set(x,P,k,V),M.viewport(Y.copy(Ne).multiplyScalar(re).round())},this.getScissor=function(x){return x.copy(pe)},this.setScissor=function(x,P,k,V){x.isVector4?pe.set(x.x,x.y,x.z,x.w):pe.set(x,P,k,V),M.scissor(ee.copy(pe).multiplyScalar(re).round())},this.getScissorTest=function(){return ke},this.setScissorTest=function(x){M.setScissorTest(ke=x)},this.setOpaqueSort=function(x){oe=x},this.setTransparentSort=function(x){Pe=x},this.getClearColor=function(x){return x.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor(...arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha(...arguments)},this.clear=function(x=!0,P=!0,k=!0){let V=0;if(x){let B=!1;if(G!==null){let ge=G.texture.format;B=v.has(ge)}if(B){let ge=G.texture.type,be=m.has(ge),Ce=$e.getClearColor(),Ie=$e.getClearAlpha(),Ke=Ce.r,ht=Ce.g,ft=Ce.b;be?(p[0]=Ke,p[1]=ht,p[2]=ft,p[3]=Ie,L.clearBufferuiv(L.COLOR,0,p)):(b[0]=Ke,b[1]=ht,b[2]=ft,b[3]=Ie,L.clearBufferiv(L.COLOR,0,b))}else V|=L.COLOR_BUFFER_BIT}P&&(V|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),k&&(V|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&L.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(x){x.setRenderer(this),N=x},this.dispose=function(){t.removeEventListener("webglcontextlost",We,!1),t.removeEventListener("webglcontextrestored",Ut,!1),t.removeEventListener("webglcontextcreationerror",_t,!1),$e.dispose(),De.dispose(),he.dispose(),D.dispose(),$.dispose(),I.dispose(),Ae.dispose(),Re.dispose(),me.dispose(),Ee.dispose(),Ee.removeEventListener("sessionstart",ue),Ee.removeEventListener("sessionend",je),Le.stop()};function We(x){x.preventDefault(),mu("WebGLRenderer: Context Lost."),H=!0}function Ut(){mu("WebGLRenderer: Context Restored."),H=!1;let x=S.autoReset,P=Ve.enabled,k=Ve.autoUpdate,V=Ve.needsUpdate,B=Ve.type;le(),S.autoReset=x,Ve.enabled=P,Ve.autoUpdate=k,Ve.needsUpdate=V,Ve.type=B}function _t(x){Qe("WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function gr(x){let P=x.target;P.removeEventListener("dispose",gr),wr(P)}function wr(x){Tn(x),D.remove(x)}function Tn(x){let P=D.get(x).programs;P!==void 0&&(P.forEach(function(k){me.releaseProgram(k)}),x.isShaderMaterial&&me.releaseShaderCache(x))}this.renderBufferDirect=function(x,P,k,V,B,ge){P===null&&(P=Fe);let be=B.isMesh&&B.matrixWorld.determinantAffine()<0,Ce=rt(x,P,k,V,B);M.setMaterial(V,be);let Ie=k.index,Ke=1;if(V.wireframe===!0){if(Ie=xe.getWireframeAttribute(k),Ie===void 0)return;Ke=2}let ht=k.drawRange,ft=k.attributes.position,Be=ht.start*Ke,St=(ht.start+ht.count)*Ke;ge!==null&&(Be=Math.max(Be,ge.start*Ke),St=Math.min(St,(ge.start+ge.count)*Ke)),Ie!==null?(Be=Math.max(Be,0),St=Math.min(St,Ie.count)):ft!=null&&(Be=Math.max(Be,0),St=Math.min(St,ft.count));let kt=St-Be;if(kt<0||kt===1/0)return;Ae.setup(B,V,Ce,k,Ie);let At,Rt=U;if(Ie!==null&&(At=_e.get(Ie),Rt=Q,Rt.setIndex(At)),B.isMesh)V.wireframe===!0?(M.setLineWidth(V.wireframeLinewidth*it()),Rt.setMode(L.LINES)):Rt.setMode(L.TRIANGLES);else if(B.isLine){let It=V.linewidth;It===void 0&&(It=1),M.setLineWidth(It*it()),B.isLineSegments?Rt.setMode(L.LINES):B.isLineLoop?Rt.setMode(L.LINE_LOOP):Rt.setMode(L.LINE_STRIP)}else B.isPoints?Rt.setMode(L.POINTS):B.isSprite&&Rt.setMode(L.TRIANGLES);if(B.isBatchedMesh)if(ut.get("WEBGL_multi_draw"))Rt.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{let It=B._multiDrawStarts,Oe=B._multiDrawCounts,rr=B._multiDrawCount,Ai=Ie?_e.get(Ie).bytesPerElement:1,_r=D.get(V).currentProgram.getUniforms();for(let Ir=0;Ir<rr;Ir++)_r.setValue(L,"_gl_DrawID",Ir),Rt.render(It[Ir]/Ai,Oe[Ir])}else if(B.isInstancedMesh)Rt.renderInstances(Be,kt,B.count);else if(k.isInstancedBufferGeometry){let It=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,Oe=Math.min(k.instanceCount,It);Rt.renderInstances(Be,kt,Oe)}else Rt.render(Be,kt)};function Yi(x,P,k,V){N!==null&&x.isNodeMaterial&&N.setObject(V,x),Z===!0&&ze.setState(x,k,!1),x.transparent===!0&&x.side===Pr&&x.forceSinglePass===!1?(x.side=nr,x.needsUpdate=!0,ae(x,P,V),x.side=Oi,x.needsUpdate=!0,ae(x,P,V),x.side=Pr):ae(x,P,V)}this.compile=function(x,P,k=null){k===null&&(k=x),N!==null&&N.renderStart(x,P,k),E=he.get(k),E.init(P),R.push(E),k.traverseVisible(function(B){B.isLight&&B.layers.test(P.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),x!==k&&x.traverseVisible(function(B){B.isLight&&B.layers.test(P.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),E.setupLights(),N!==null&&N.updateLights(E.state.lightsArray),se=this.localClippingEnabled,Z=ze.init(this.clippingPlanes,se),Z===!0&&ze.setGlobalState(this.clippingPlanes,P),N!==null&&Ve.render(E.state.shadowsArray,k,P);let V=new Set;return x.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;let ge=B.material;if(ge)if(Array.isArray(ge))for(let be=0;be<ge.length;be++){let Ce=ge[be];Yi(Ce,k,P,B),V.add(Ce)}else Yi(ge,k,P,B),V.add(ge)}),E=R.pop(),N!==null&&N.renderEnd(),V},this.compileAsync=function(x,P,k=null){let V=this.compile(x,P,k);return new Promise(B=>{function ge(){if(V.forEach(function(be){let Ce=D.get(be).currentProgram;(Ce===void 0||Ce.isReady())&&V.delete(be)}),V.size===0){B(x);return}setTimeout(ge,10)}ut.get("KHR_parallel_shader_compile")!==null?ge():setTimeout(ge,10)})};let En=null;function K(x){En&&En(x)}function ue(){Le.stop()}function je(){Le.start()}let Le=new uc;Le.setAnimationLoop(K),typeof self<"u"&&Le.setContext(self),this.setAnimationLoop=function(x){En=x,Ee.setAnimationLoop(x),x===null?Le.stop():Le.start()},Ee.addEventListener("sessionstart",ue),Ee.addEventListener("sessionend",je),this.render=function(x,P){if(P!==void 0&&P.isCamera!==!0){Qe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(H===!0)return;N!==null&&N.renderStart(x,P);let k=Ee.enabled===!0&&Ee.isPresenting===!0,V=_!==null&&(G===null||k)&&_.begin(T,G);if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),P.parent===null&&P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),Ee.enabled===!0&&Ee.isPresenting===!0&&(_===null||_.isCompositing()===!1)&&(Ee.cameraAutoUpdate===!0&&Ee.updateCamera(P),P=Ee.getCamera()),x.isScene===!0&&x.onBeforeRender(T,x,P,G),E=he.get(x,R.length),E.init(P),E.state.textureUnits=W.getTextureUnits(),R.push(E),Te.multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),te.setFromProjectionMatrix(Te,kr,P.reversedDepth),se=this.localClippingEnabled,Z=ze.init(this.clippingPlanes,se),y=De.get(x,C.length),y.init(),C.push(y),Ee.enabled===!0&&Ee.isPresenting===!0){let ge=T.xr.getDepthSensingMesh();ge!==null&&ie(ge,P,-1/0,T.sortObjects)}ie(x,P,0,T.sortObjects),y.finish(),N!==null&&N.updateLights(E.state.lightsArray),T.sortObjects===!0&&y.sort(oe,Pe),et=Ee.enabled===!1||Ee.isPresenting===!1||Ee.hasDepthSensing()===!1,et&&$e.addToRenderList(y,x),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Z===!0&&ze.beginShadows();let B=E.state.shadowsArray;if(Ve.render(B,x,P),Z===!0&&ze.endShadows(),(V&&_.hasRenderPass())===!1){let ge=y.opaque,be=y.transmissive;if(E.setupLights(),P.isArrayCamera){let Ce=P.cameras;if(be.length>0)for(let Ie=0,Ke=Ce.length;Ie<Ke;Ie++){let ht=Ce[Ie];st(ge,be,x,ht)}et&&$e.render(x);for(let Ie=0,Ke=Ce.length;Ie<Ke;Ie++){let ht=Ce[Ie];fe(y,x,ht,ht.viewport)}}else be.length>0&&st(ge,be,x,P),et&&$e.render(x),fe(y,x,P)}G!==null&&j===0&&(W.updateMultisampleRenderTarget(G),W.updateRenderTargetMipmap(G)),V&&_.end(T),x.isScene===!0&&x.onAfterRender(T,x,P),Ae.resetDefaultState(),ce=-1,X=null,R.pop(),R.length>0?(E=R[R.length-1],W.setTextureUnits(E.state.textureUnits),Z===!0&&ze.setGlobalState(T.clippingPlanes,E.state.camera)):E=null,C.pop(),C.length>0?y=C[C.length-1]:y=null,N!==null&&N.renderEnd()};function ie(x,P,k,V){if(x.visible===!1)return;if(x.layers.test(P.layers)){if(x.isGroup)k=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(P);else if(x.isLightProbeGrid)E.pushLightProbeGrid(x);else if(x.isLight)E.pushLight(x),x.castShadow&&E.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||x.intersectsFrustum(te)){V&&Ue.setFromMatrixPosition(x.matrixWorld).applyMatrix4(Te);let ge=I.update(x),be=x.material;be.visible&&y.push(x,ge,be,k,Ue.z,null,P)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||x.intersectsFrustum(te))){let ge=I.update(x),be=x.material;if(V&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),Ue.copy(x.boundingSphere.center)):(ge.boundingSphere===null&&ge.computeBoundingSphere(),Ue.copy(ge.boundingSphere.center)),Ue.applyMatrix4(x.matrixWorld).applyMatrix4(Te)),Array.isArray(be)){let Ce=ge.groups;for(let Ie=0,Ke=Ce.length;Ie<Ke;Ie++){let ht=Ce[Ie],ft=be[ht.materialIndex];ft&&ft.visible&&y.push(x,ge,ft,k,Ue.z,ht,P)}}else be.visible&&y.push(x,ge,be,k,Ue.z,null,P)}}let B=x.children;for(let ge=0,be=B.length;ge<be;ge++)ie(B[ge],P,k,V)}function fe(x,P,k,V){let{opaque:B,transmissive:ge,transparent:be}=x;E.setupLightsView(k),Z===!0&&ze.setGlobalState(T.clippingPlanes,k),V&&M.viewport(Y.copy(V)),B.length>0&&tt(B,P,k),ge.length>0&&tt(ge,P,k),be.length>0&&tt(be,P,k),M.buffers.depth.setTest(!0),M.buffers.depth.setMask(!0),M.buffers.color.setMask(!0),M.setPolygonOffset(!1)}function st(x,P,k,V){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[V.id]===void 0){let ft=ut.has("EXT_color_buffer_half_float")||ut.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[V.id]=new Nr(1,1,{generateMipmaps:!0,type:ft?Gr:Sr,minFilter:Di,samples:Math.max(4,nt.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:dt.workingColorSpace})}let B=E.state.transmissionRenderTarget[V.id],ge=V.viewport||Y;B.setSize(ge.z*T.transmissionResolutionScale,ge.w*T.transmissionResolutionScale);let be=T.getRenderTarget(),Ce=T.getActiveCubeFace(),Ie=T.getActiveMipmapLevel();T.setRenderTarget(B),T.getClearColor(we),gt=T.getClearAlpha(),gt<1&&T.setClearColor(16777215,.5),T.clear(),et&&$e.render(k);let Ke=T.toneMapping;T.toneMapping=Vr;let ht=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),E.setupLightsView(V),Z===!0&&ze.setGlobalState(T.clippingPlanes,V),tt(x,k,V),W.updateMultisampleRenderTarget(B),W.updateRenderTargetMipmap(B),ut.has("WEBGL_multisampled_render_to_texture")===!1){let ft=!1;for(let Be=0,St=P.length;Be<St;Be++){let kt=P[Be],{object:At,geometry:Rt,material:It,group:Oe}=kt;if(It.side===Pr&&At.layers.test(V.layers)){let rr=It.side;It.side=nr,It.needsUpdate=!0,de(At,k,V,Rt,It,Oe),It.side=rr,It.needsUpdate=!0,ft=!0}}ft===!0&&(W.updateMultisampleRenderTarget(B),W.updateRenderTargetMipmap(B))}T.setRenderTarget(be,Ce,Ie),T.setClearColor(we,gt),ht!==void 0&&(V.viewport=ht),T.toneMapping=Ke}function tt(x,P,k){let V=P.isScene===!0?P.overrideMaterial:null;for(let B=0,ge=x.length;B<ge;B++){let be=x[B],{object:Ce,geometry:Ie,group:Ke}=be,ht=be.material;ht.allowOverride===!0&&V!==null&&(ht=V),Ce.layers.test(k.layers)&&de(Ce,P,k,Ie,ht,Ke)}}function de(x,P,k,V,B,ge){N!==null&&B.isNodeMaterial&&N.setObject(x,B),x.onBeforeRender(T,P,k,V,B,ge),x.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),B.onBeforeRender(T,P,k,V,x,ge),B.transparent===!0&&B.side===Pr&&B.forceSinglePass===!1?(B.side=nr,B.needsUpdate=!0,T.renderBufferDirect(k,P,V,B,x,ge),B.side=Oi,B.needsUpdate=!0,T.renderBufferDirect(k,P,V,B,x,ge),B.side=Pr):T.renderBufferDirect(k,P,V,B,x,ge),x.onAfterRender(T,P,k,V,B,ge)}function ae(x,P,k){P.isScene!==!0&&(P=Fe);let V=D.get(x),B=E.state.lights,ge=E.state.shadowsArray,be=B.state.version,Ce=me.getParameters(x,B.state,ge,P,k,E.state.lightProbeGridArray),Ie=me.getProgramCacheKey(Ce),Ke=V.programs;V.environment=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?P.environment:null,V.fog=P.fog;let ht=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap;V.envMap=$.get(x.envMap||V.environment,ht),V.envMapRotation=V.environment!==null&&x.envMap===null?P.environmentRotation:x.envMapRotation,Ke===void 0&&(x.addEventListener("dispose",gr),Ke=new Map,V.programs=Ke);let ft=Ke.get(Ie);if(ft!==void 0){if(V.currentProgram===ft&&V.lightsStateVersion===be)return Xe(x,Ce),ft}else Ce.uniforms=me.getUniforms(x),N!==null&&x.isNodeMaterial&&N.build(x,k,Ce),x.onBeforeCompile(Ce,T),ft=me.acquireProgram(Ce,Ie),Ke.set(Ie,ft),V.uniforms=Ce.uniforms;let Be=V.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(Be.clippingPlanes=ze.uniform),Xe(x,Ce),V.needsLights=He(x),V.lightsStateVersion=be,V.needsLights&&(Be.ambientLightColor.value=B.state.ambient,Be.lightProbe.value=B.state.probe,Be.sunLights.value=B.state.sun,Be.sunLightShadows.value=B.state.sunShadow,Be.directionalLights.value=B.state.directional,Be.directionalLightShadows.value=B.state.directionalShadow,Be.spotLights.value=B.state.spot,Be.spotLightShadows.value=B.state.spotShadow,Be.rectAreaLights.value=B.state.rectArea,Be.ltc_1.value=B.state.rectAreaLTC1,Be.ltc_2.value=B.state.rectAreaLTC2,Be.pointLights.value=B.state.point,Be.pointLightShadows.value=B.state.pointShadow,Be.hemisphereLights.value=B.state.hemi,Be.sunShadowMatrix.value=B.state.sunShadowMatrix,Be.sunShadowCascade.value=B.state.sunShadowCascade,Be.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Be.spotLightMatrix.value=B.state.spotLightMatrix,Be.spotLightMap.value=B.state.spotLightMap,Be.pointShadowMatrix.value=B.state.pointShadowMatrix),V.lightProbeGrid=E.state.lightProbeGridArray.length>0,V.currentProgram=ft,V.uniformsList=null,ft}function Ye(x){if(x.uniformsList===null){let P=x.currentProgram.getUniforms();x.uniformsList=is.seqWithValue(P.seq,x.uniforms)}return x.uniformsList}function Xe(x,P){let k=D.get(x);k.outputColorSpace=P.outputColorSpace,k.batching=P.batching,k.batchingColor=P.batchingColor,k.instancing=P.instancing,k.instancingColor=P.instancingColor,k.instancingMorph=P.instancingMorph,k.skinning=P.skinning,k.morphTargets=P.morphTargets,k.morphNormals=P.morphNormals,k.morphColors=P.morphColors,k.morphTargetsCount=P.morphTargetsCount,k.numClippingPlanes=P.numClippingPlanes,k.numIntersection=P.numClipIntersection,k.vertexAlphas=P.vertexAlphas,k.vertexTangents=P.vertexTangents,k.toneMapping=P.toneMapping}function qe(x,P){if(x.length===0)return null;if(x.length===1)return x[0].texture!==null?x[0]:null;w.setFromMatrixPosition(P.matrixWorld);for(let k=0,V=x.length;k<V;k++){let B=x[k];if(B.texture!==null&&B.boundingBox.containsPoint(w))return B}return null}function rt(x,P,k,V,B){P.isScene!==!0&&(P=Fe),W.resetTextureUnits();let ge=P.fog,be=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?P.environment:null,Ce=G===null?T.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:dt.workingColorSpace,Ie=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Ke=$.get(V.envMap||be,Ie),ht=V.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,ft=!!k.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Be=!!k.morphAttributes.position,St=!!k.morphAttributes.normal,kt=!!k.morphAttributes.color,At=Vr;V.toneMapped&&(G===null||G.isXRRenderTarget===!0)&&(At=T.toneMapping);let Rt=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,It=Rt!==void 0?Rt.length:0,Oe=D.get(V),rr=E.state.lights;if(Z===!0&&(se===!0||x!==X)){let Mt=x===X&&V.id===ce;ze.setState(V,x,Mt)}let Ai=!1;V.version===Oe.__version?(Oe.needsLights&&Oe.lightsStateVersion!==rr.state.version||Oe.outputColorSpace!==Ce||B.isBatchedMesh&&Oe.batching===!1||!B.isBatchedMesh&&Oe.batching===!0||B.isBatchedMesh&&Oe.batchingColor===!0&&B._colorsTexture===null||B.isBatchedMesh&&Oe.batchingColor===!1&&B._colorsTexture!==null||B.isInstancedMesh&&Oe.instancing===!1||!B.isInstancedMesh&&Oe.instancing===!0||B.isSkinnedMesh&&Oe.skinning===!1||!B.isSkinnedMesh&&Oe.skinning===!0||B.isInstancedMesh&&Oe.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&Oe.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&Oe.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&Oe.instancingMorph===!1&&B.morphTexture!==null||Oe.envMap!==Ke||V.fog===!0&&Oe.fog!==ge||Oe.numClippingPlanes!==void 0&&(Oe.numClippingPlanes!==ze.numPlanes||Oe.numIntersection!==ze.numIntersection)||Oe.vertexAlphas!==ht||Oe.vertexTangents!==ft||Oe.morphTargets!==Be||Oe.morphNormals!==St||Oe.morphColors!==kt||Oe.toneMapping!==At||Oe.morphTargetsCount!==It||!!Oe.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(Ai=!0):(Ai=!0,Oe.__version=V.version);let _r=Oe.currentProgram;Ai===!0&&(_r=ae(V,P,B),N&&V.isNodeMaterial&&N.onUpdateProgram(V,_r,Oe));let Ir=!1,ci=!1,Ki=!1,yt=_r.getUniforms(),zt=Oe.uniforms;if(M.useProgram(_r.program)&&(Ir=!0,ci=!0,Ki=!0),V.id!==ce&&(ce=V.id,ci=!0),Oe.needsLights){let Mt=qe(E.state.lightProbeGridArray,B);Oe.lightProbeGrid!==Mt&&(Oe.lightProbeGrid=Mt,ci=!0)}if(Ir||X!==x){M.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),yt.setValue(L,"projectionMatrix",x.projectionMatrix),yt.setValue(L,"viewMatrix",x.matrixWorldInverse);let Mt=yt.map.cameraPosition;Mt!==void 0&&Mt.setValue(L,ve.setFromMatrixPosition(x.matrixWorld)),nt.logarithmicDepthBuffer&&yt.setValue(L,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&yt.setValue(L,"isOrthographic",x.isOrthographicCamera===!0),X!==x&&(X=x,ci=!0,Ki=!0)}if(Oe.needsLights&&(rr.state.sunShadowMap.length>0&&yt.setValue(L,"sunShadowMap",rr.state.sunShadowMap,W),rr.state.directionalShadowMap.length>0&&yt.setValue(L,"directionalShadowMap",rr.state.directionalShadowMap,W),rr.state.spotShadowMap.length>0&&yt.setValue(L,"spotShadowMap",rr.state.spotShadowMap,W),rr.state.pointShadowMap.length>0&&yt.setValue(L,"pointShadowMap",rr.state.pointShadowMap,W)),B.isSkinnedMesh){yt.setOptional(L,B,"bindMatrix"),yt.setOptional(L,B,"bindMatrixInverse");let Mt=B.skeleton;Mt&&(Mt.boneTexture===null&&Mt.computeBoneTexture(),yt.setValue(L,"boneTexture",Mt.boneTexture,W))}B.isBatchedMesh&&(yt.setOptional(L,B,"batchingTexture"),yt.setValue(L,"batchingTexture",B._matricesTexture,W),yt.setOptional(L,B,"batchingIdTexture"),yt.setValue(L,"batchingIdTexture",B._indirectTexture,W),yt.setOptional(L,B,"batchingColorTexture"),B._colorsTexture!==null&&yt.setValue(L,"batchingColorTexture",B._colorsTexture,W));let di=k.morphAttributes;if((di.position!==void 0||di.normal!==void 0||di.color!==void 0)&&mt.update(B,k,_r),(ci||Oe.receiveShadow!==B.receiveShadow)&&(Oe.receiveShadow=B.receiveShadow,yt.setValue(L,"receiveShadow",B.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&P.environment!==null&&(zt.envMapIntensity.value=P.environmentIntensity),zt.dfgLUT!==void 0&&(zt.dfgLUT.value=Bv()),ci){if(yt.setValue(L,"toneMappingExposure",T.toneMappingExposure),Oe.needsLights&&Tt(zt,Ki),ge&&V.fog===!0&&Se.refreshFogUniforms(zt,ge),Se.refreshMaterialUniforms(zt,V,re,J,E.state.transmissionRenderTarget[x.id]),Oe.needsLights&&Oe.lightProbeGrid){let Mt=Oe.lightProbeGrid;zt.probesSH.value=Mt.texture,zt.probesMin.value.copy(Mt.boundingBox.min),zt.probesMax.value.copy(Mt.boundingBox.max),zt.probesResolution.value.copy(Mt.resolution)}is.upload(L,Ye(Oe),zt,W)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(is.upload(L,Ye(Oe),zt,W),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&yt.setValue(L,"center",B.center),yt.setValue(L,"modelViewMatrix",B.modelViewMatrix),yt.setValue(L,"normalMatrix",B.normalMatrix),yt.setValue(L,"modelMatrix",B.matrixWorld),V.uniformsGroups!==void 0){let Mt=V.uniformsGroups;for(let Da=0,Ji=Mt.length;Da<Ji;Da++){let iu=Mt[Da];Re.update(iu,_r),Re.bind(iu,_r)}}return _r}function Tt(x,P){x.ambientLightColor.needsUpdate=P,x.lightProbe.needsUpdate=P,x.sunLights.needsUpdate=P,x.sunLightShadows.needsUpdate=P,x.directionalLights.needsUpdate=P,x.directionalLightShadows.needsUpdate=P,x.pointLights.needsUpdate=P,x.pointLightShadows.needsUpdate=P,x.spotLights.needsUpdate=P,x.spotLightShadows.needsUpdate=P,x.rectAreaLights.needsUpdate=P,x.hemisphereLights.needsUpdate=P}function He(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return O},this.getActiveMipmapLevel=function(){return j},this.getRenderTarget=function(){return G},this.setRenderTargetTextures=function(x,P,k){let V=D.get(x);V.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),D.get(x.texture).__webglTexture=P,D.get(x.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:k,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,P){let k=D.get(x);k.__webglFramebuffer=P,k.__useDefaultFramebuffer=P===void 0},this.setRenderTarget=function(x,P=0,k=0){G=x,O=P,j=k;let V=null,B=!1,ge=!1;if(x){let be=D.get(x);if(be.__useDefaultFramebuffer!==void 0){M.bindFramebuffer(L.FRAMEBUFFER,be.__webglFramebuffer),Y.copy(x.viewport),ee.copy(x.scissor),Ge=x.scissorTest,M.viewport(Y),M.scissor(ee),M.setScissorTest(Ge),ce=-1;return}else if(be.__webglFramebuffer===void 0)W.setupRenderTarget(x);else if(be.__hasExternalTextures)W.rebindTextures(x,D.get(x.texture).__webglTexture,D.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){let Ke=x.depthTexture;if(be.__boundDepthTexture!==Ke){if(Ke!==null&&D.has(Ke)&&(x.width!==Ke.image.width||x.height!==Ke.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");W.setupDepthRenderbuffer(x)}}let Ce=x.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(ge=!0);let Ie=D.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Ie[P])?V=Ie[P][k]:V=Ie[P],B=!0):x.samples>0&&W.useMultisampledRTT(x)===!1?V=D.get(x).__webglMultisampledFramebuffer:Array.isArray(Ie)?V=Ie[k]:V=Ie,Y.copy(x.viewport),ee.copy(x.scissor),Ge=x.scissorTest}else Y.copy(Ne).multiplyScalar(re).floor(),ee.copy(pe).multiplyScalar(re).floor(),Ge=ke;if(k!==0&&(V=F),M.bindFramebuffer(L.FRAMEBUFFER,V)&&M.drawBuffers(x,V),M.viewport(Y),M.scissor(ee),M.setScissorTest(Ge),B){let be=D.get(x.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+P,be.__webglTexture,k)}else if(ge){let be=P;for(let Ce=0;Ce<x.textures.length;Ce++){let Ie=D.get(x.textures[Ce]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Ce,Ie.__webglTexture,k,be)}}else if(x!==null&&k!==0){let be=D.get(x.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,be.__webglTexture,k)}ce=-1};function Bt(x){let P=D.get(x);return(P.__readFormat!==x.format||P.__readType!==x.type)&&(P.__readFormat=x.format,P.__readType=x.type,P.__formatReadable=nt.textureFormatReadable(x.format),P.__typeReadable=nt.textureTypeReadable(x.type)),P}this.readRenderTargetPixels=function(x,P,k,V,B,ge,be,Ce=0){if(!(x&&x.isWebGLRenderTarget)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ie=D.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&be!==void 0&&(Ie=Ie[be]),Ie){M.bindFramebuffer(L.FRAMEBUFFER,Ie);try{let Ke=x.textures[Ce],ht=Ke.format,ft=Ke.type;x.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ce);let Be=Bt(Ke);if(Be.__formatReadable===!1){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Be.__typeReadable===!1){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}P>=0&&P<=x.width-V&&k>=0&&k<=x.height-B&&L.readPixels(P,k,V,B,ne.convert(ht),ne.convert(ft),ge)}finally{let Ke=G!==null?D.get(G).__webglFramebuffer:null;M.bindFramebuffer(L.FRAMEBUFFER,Ke)}}},this.readRenderTargetPixelsAsync=async function(x,P,k,V,B,ge,be,Ce=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ie=D.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&be!==void 0&&(Ie=Ie[be]),Ie)if(P>=0&&P<=x.width-V&&k>=0&&k<=x.height-B){M.bindFramebuffer(L.FRAMEBUFFER,Ie);let Ke=x.textures[Ce],ht=Ke.format,ft=Ke.type;x.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ce);let Be=Bt(Ke);if(Be.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Be.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let St=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,St),L.bufferData(L.PIXEL_PACK_BUFFER,ge.byteLength,L.STREAM_READ),L.readPixels(P,k,V,B,ne.convert(ht),ne.convert(ft),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let kt=G!==null?D.get(G).__webglFramebuffer:null;M.bindFramebuffer(L.FRAMEBUFFER,kt);let At=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await ap(L,At,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,St),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,ge),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(St),L.deleteSync(At),ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,P=null,k=0){let V=Math.pow(2,-k),B=Math.floor(x.image.width*V),ge=Math.floor(x.image.height*V),be=P!==null?P.x:0,Ce=P!==null?P.y:0;W.setTexture2D(x,0),L.copyTexSubImage2D(L.TEXTURE_2D,k,0,0,be,Ce,B,ge),M.unbindTexture()},this.copyTextureToTexture=function(x,P,k=null,V=null,B=0,ge=0){let be,Ce,Ie,Ke,ht,ft,Be,St,kt,At=x.isCompressedTexture?x.mipmaps[ge]:x.image;if(k!==null)be=k.max.x-k.min.x,Ce=k.max.y-k.min.y,Ie=k.isBox3?k.max.z-k.min.z:1,Ke=k.min.x,ht=k.min.y,ft=k.isBox3?k.min.z:0;else{let zt=Math.pow(2,-B);be=Math.floor(At.width*zt),Ce=Math.floor(At.height*zt),x.isDataArrayTexture?Ie=At.depth:x.isData3DTexture?Ie=Math.floor(At.depth*zt):Ie=1,Ke=0,ht=0,ft=0}V!==null?(Be=V.x,St=V.y,kt=V.z):(Be=0,St=0,kt=0);let Rt=ne.convert(P.format),It=ne.convert(P.type),Oe;P.isData3DTexture?(W.setTexture3D(P,0),Oe=L.TEXTURE_3D):P.isDataArrayTexture||P.isCompressedArrayTexture?(W.setTexture2DArray(P,0),Oe=L.TEXTURE_2D_ARRAY):(W.setTexture2D(P,0),Oe=L.TEXTURE_2D),M.activeTexture(L.TEXTURE0),M.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,P.flipY),M.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),M.pixelStorei(L.UNPACK_ALIGNMENT,P.unpackAlignment);let rr=M.getParameter(L.UNPACK_ROW_LENGTH),Ai=M.getParameter(L.UNPACK_IMAGE_HEIGHT),_r=M.getParameter(L.UNPACK_SKIP_PIXELS),Ir=M.getParameter(L.UNPACK_SKIP_ROWS),ci=M.getParameter(L.UNPACK_SKIP_IMAGES);M.pixelStorei(L.UNPACK_ROW_LENGTH,At.width),M.pixelStorei(L.UNPACK_IMAGE_HEIGHT,At.height),M.pixelStorei(L.UNPACK_SKIP_PIXELS,Ke),M.pixelStorei(L.UNPACK_SKIP_ROWS,ht),M.pixelStorei(L.UNPACK_SKIP_IMAGES,ft);let Ki=x.isDataArrayTexture||x.isData3DTexture,yt=P.isDataArrayTexture||P.isData3DTexture;if(x.isDepthTexture){let zt=D.get(x),di=D.get(P),Mt=D.get(zt.__renderTarget),Da=D.get(di.__renderTarget);M.bindFramebuffer(L.READ_FRAMEBUFFER,Mt.__webglFramebuffer),M.bindFramebuffer(L.DRAW_FRAMEBUFFER,Da.__webglFramebuffer);for(let Ji=0;Ji<Ie;Ji++)Ki&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,D.get(x).__webglTexture,B,ft+Ji),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,D.get(P).__webglTexture,ge,kt+Ji)),L.blitFramebuffer(Ke,ht,be,Ce,Be,St,be,Ce,L.DEPTH_BUFFER_BIT,L.NEAREST);M.bindFramebuffer(L.READ_FRAMEBUFFER,null),M.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(B!==0||x.isRenderTargetTexture||D.has(x)){let zt=D.get(x),di=D.get(P);M.bindFramebuffer(L.READ_FRAMEBUFFER,q),M.bindFramebuffer(L.DRAW_FRAMEBUFFER,A);for(let Mt=0;Mt<Ie;Mt++)Ki?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,zt.__webglTexture,B,ft+Mt):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,zt.__webglTexture,B),yt?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,di.__webglTexture,ge,kt+Mt):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,di.__webglTexture,ge),B!==0?L.blitFramebuffer(Ke,ht,be,Ce,Be,St,be,Ce,L.COLOR_BUFFER_BIT,L.NEAREST):yt?L.copyTexSubImage3D(Oe,ge,Be,St,kt+Mt,Ke,ht,be,Ce):L.copyTexSubImage2D(Oe,ge,Be,St,Ke,ht,be,Ce);M.bindFramebuffer(L.READ_FRAMEBUFFER,null),M.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else yt?x.isDataTexture||x.isData3DTexture?L.texSubImage3D(Oe,ge,Be,St,kt,be,Ce,Ie,Rt,It,At.data):P.isCompressedArrayTexture?L.compressedTexSubImage3D(Oe,ge,Be,St,kt,be,Ce,Ie,Rt,At.data):L.texSubImage3D(Oe,ge,Be,St,kt,be,Ce,Ie,Rt,It,At):x.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,ge,Be,St,be,Ce,Rt,It,At.data):x.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,ge,Be,St,At.width,At.height,Rt,At.data):L.texSubImage2D(L.TEXTURE_2D,ge,Be,St,be,Ce,Rt,It,At);M.pixelStorei(L.UNPACK_ROW_LENGTH,rr),M.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ai),M.pixelStorei(L.UNPACK_SKIP_PIXELS,_r),M.pixelStorei(L.UNPACK_SKIP_ROWS,Ir),M.pixelStorei(L.UNPACK_SKIP_IMAGES,ci),ge===0&&P.generateMipmaps&&L.generateMipmap(Oe),M.unbindTexture()},this.initRenderTarget=function(x){D.get(x).__webglFramebuffer===void 0&&W.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?W.setTextureCube(x,0):x.isData3DTexture?W.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?W.setTexture2DArray(x,0):W.setTexture2D(x,0),M.unbindTexture()},this.resetState=function(){O=0,j=0,G=null,M.reset(),Ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return kr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=dt._getUnpackColorSpace()}};/*!
 * 刷刷 3D 点缀用的 GSAP 核心：gsap@3.15.0 的 gsap-core.js（不含 CSSPlugin 与插件）。
 * 由 scripts/build-3d-vendor.mjs 用 esbuild 重新打包为 ES module，未改动 GSAP 的代码；
 * 下文 GreenSock 的 @license 版权声明为原文，使用条款见 https://gsap.com/standard-license
 */function oi(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function wc(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.__proto__=t}/*!
 * GSAP 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/var ba={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},fn={duration:.5,overwrite:!1,delay:0},Gl,Kt,Ct,Er=1e8,bt=1/Er,Dl=Math.PI*2,kv=Dl/4,Vv=0,Ac=Math.sqrt,Hv=Math.cos,Gv=Math.sin,tr=function(e){return typeof e=="string"},Ft=function(e){return typeof e=="function"},li=function(e){return typeof e=="number"},Rc=function(e){return typeof e>"u"},Yr=function(e){return typeof e=="object"},lr=function(e){return e!==!1},Wl=function(){return typeof window<"u"},gs=function(e){return Ft(e)||tr(e)},Cc=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},er=Array.isArray,Wv=/random\([^)]+\)/g,Xv=/,\s*/g,vc=/(?:-?\.?\d|\.)+/gi,qv=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,Pc=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,wl=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,jv=/[+-]=-?[.\d]+/,Yv=/[^,'"\[\]\s]+/gi,Kv=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,Dt,qr,Ul,Xl,fr={},Ss={},Lc,Nc=function(e){return(Ss=wa(e,fr))&&Jt},Dc=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},mn=function(e,t){return!t&&console.warn(e)},Uc=function(e,t){return e&&(fr[e]=t)&&Ss&&(Ss[e]=t)||fr},gn=function(){return 0},Jv={suppressEvents:!0,isStart:!0,kill:!1},_s={suppressEvents:!0,kill:!1},Zv={suppressEvents:!0},ql={},Mi=[],Il={},Ic,Tr={},Al={},xc=30,vs=[],jl="",Yl=function(e){var t=e[0],r,i;if(Yr(t)||Ft(t)||(e=[e]),!(r=(t._gsap||{}).harness)){for(i=vs.length;i--&&!vs[i].targetTest(t););r=vs[i]}for(i=e.length;i--;)e[i]&&(e[i]._gsap||(e[i]._gsap=new bx(e[i],r)))||e.splice(i,1);return e},hn=function(e){return e._gsap||Yl(br(e))[0]._gsap},$v=function(e,t,r){return(r=e[t])&&Ft(r)?e[t]():Rc(r)&&e.getAttribute&&e.getAttribute(t)||r},ui=function(e,t){return(e=e.split(",")).forEach(t)||e},Qv=function(e){return Math.round(e*1e5)/1e5||0},Nt=function(e){return Math.round(e*1e7)/1e7||0},Oc=function(e,t){var r=t.charAt(0),i=parseFloat(t.substr(2));return e=parseFloat(e),r==="+"?e+i:r==="-"?e-i:r==="*"?e*i:e/i},ex=function(e,t){for(var r=t.length,i=0;e.indexOf(t[i])<0&&++i<r;);return i<r},ys=function(){var e=Mi.length,t=Mi.slice(0),r,i;for(Il={},Mi.length=0,r=0;r<e;r++)i=t[r],i&&i._lazy&&(i.render(i._lazy[0],i._lazy[1],!0)._lazy=0)},Kl=function(e){return!!(e._initted||e._startAt||e.add)},Fc=function(e,t,r,i){Mi.length&&!Kt&&ys(),e.render(t,r,i||!!(Kt&&t<0&&Kl(e))),Mi.length&&!Kt&&ys()},zc=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(Yv).length<2?t:tr(e)?e.trim():e},Bc=function(e){return e},mr=function(e,t){for(var r in t)r in e||(e[r]=t[r]);return e},tx=function(e){return function(t,r){for(var i in r)i in t||i==="duration"&&e||i==="ease"||(t[i]=r[i])}},wa=function(e,t){for(var r in t)e[r]=t[r];return e},Sc=function e(t,r){for(var i in r)i!=="__proto__"&&i!=="constructor"&&i!=="prototype"&&(t[i]=Yr(r[i])?e(t[i]||(t[i]={}),r[i]):r[i]);return t},Ms=function(e,t){var r={},i;for(i in e)i in t||(r[i]=e[i]);return r},cn=function(e){var t=e.parent||Dt,r=e.keyframes?tx(er(e.keyframes)):mr;if(lr(e.inherit))for(;t;)r(e,t.vars.defaults),t=t.parent||t._dp;return e},rx=function(e,t){for(var r=e.length,i=r===t.length;i&&r--&&e[r]===t[r];);return r<0},kc=function(e,t,r,i,a){r===void 0&&(r="_first"),i===void 0&&(i="_last");var n=e[i],s;if(a)for(s=t[a];n&&n[a]>s;)n=n._prev;return n?(t._next=n._next,n._next=t):(t._next=e[r],e[r]=t),t._next?t._next._prev=t:e[i]=t,t._prev=n,t.parent=t._dp=e,t},bs=function(e,t,r,i){r===void 0&&(r="_first"),i===void 0&&(i="_last");var a=t._prev,n=t._next;a?a._next=n:e[r]===t&&(e[r]=n),n?n._prev=a:e[i]===t&&(e[i]=a),t._next=t._prev=t.parent=null},Ti=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},Gi=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var r=e;r;)r._dirty=1,r=r.parent;return e},ix=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},Ol=function(e,t,r,i){return e._startAt&&(Kt?e._startAt.revert(_s):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,i))},ax=function e(t){return!t||t._ts&&e(t.parent)},yc=function(e){return e._repeat?Aa(e._tTime,e=e.duration()+e._rDelay)*e:0},Aa=function(e,t){var r=Math.floor(e=Nt(e/t));return e&&r===e?r-1:r},Ts=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},ws=function(e){return e._end=Nt(e._start+(e._tDur/Math.abs(e._ts||e._rts||bt)||0))},As=function(e,t){var r=e._dp;return r&&r.smoothChildTiming&&e._ts&&(e._start=Nt(r._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),ws(e),r._dirty||Gi(r,e)),e},Vc=function(e,t){var r;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(r=Ts(e.rawTime(),t),(!t._dur||xn(0,t.totalDuration(),r)-t._tTime>bt)&&t.render(r,!0)),Gi(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(r=e;r._dp;)r.rawTime()>=0&&r.totalTime(r._tTime),r=r._dp;e._zTime=-bt}},jr=function(e,t,r,i){return t.parent&&Ti(t),t._start=Nt((li(r)?r:r||e!==Dt?Mr(e,r,t):e._time)+t._delay),t._end=Nt(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),kc(e,t,"_first","_last",e._sort?"_start":0),Fl(t)||(e._recent=t),i||Vc(e,t),e._ts<0&&As(e,e._tTime),e},Hc=function(e,t){return(fr.ScrollTrigger||Dc("scrollTrigger",t))&&fr.ScrollTrigger.create(t,e)},Gc=function(e,t,r,i,a){if($l(e,t,a),!e._initted)return 1;if(!r&&e._pt&&!Kt&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&Ic!==Ur.frame)return Mi.push(e),e._lazy=[a,i],1},nx=function e(t){var r=t.parent;return r&&r._ts&&r._initted&&!r._lock&&(r.rawTime()<0||e(r))},Fl=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},sx=function(e,t,r,i){var a=e.ratio,n=t<0||!t&&(!e._start&&nx(e)&&!(!e._initted&&Fl(e))||(e._ts<0||e._dp._ts<0)&&!Fl(e))?0:1,s=e._rDelay,o=0,l,u,h;if(s&&e._repeat&&(o=xn(0,e._tDur,t),u=Aa(o,s),e._yoyo&&u&1&&(n=1-n),u!==Aa(e._tTime,s)&&(a=1-n,e.vars.repeatRefresh&&e._initted&&e.invalidate())),n!==a||Kt||i||e._zTime===bt||!t&&e._zTime){if(!e._initted&&Gc(e,t,i,r,o))return;for(h=e._zTime,e._zTime=t||(r?bt:0),r||(r=t&&!h),e.ratio=n,e._from&&(n=1-n),e._time=0,e._tTime=o,l=e._pt;l;)l.r(n,l.d),l=l._next;t<0&&Ol(e,t,r,!0),e._onUpdate&&!r&&pr(e,"onUpdate"),o&&e._repeat&&!r&&e.parent&&pr(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===n&&(n&&Ti(e,1),!r&&!Kt&&(pr(e,n?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},ox=function(e,t,r){var i;if(r>t)for(i=e._first;i&&i._start<=r;){if(i.data==="isPause"&&i._start>t)return i;i=i._next}else for(i=e._last;i&&i._start>=r;){if(i.data==="isPause"&&i._start<t)return i;i=i._prev}},Ra=function(e,t,r,i){var a=e._repeat,n=Nt(t)||0,s=e._tTime/e._tDur;return s&&!i&&(e._time*=n/e._dur),e._dur=n,e._tDur=a?a<0?1e10:Nt(n*(a+1)+e._rDelay*a):n,s>0&&!i&&As(e,e._tTime=e._tDur*s),e.parent&&ws(e),r||Gi(e.parent,e),e},Mc=function(e){return e instanceof or?Gi(e):Ra(e,e._dur)},lx={_start:0,endTime:gn,totalDuration:gn},Mr=function e(t,r,i){var a=t.labels,n=t._recent||lx,s=t.duration()>=Er?n.endTime(!1):t._dur,o,l,u;return tr(r)&&(isNaN(r)||r in a)?(l=r.charAt(0),u=r.substr(-1)==="%",o=r.indexOf("="),l==="<"||l===">"?(o>=0&&(r=r.replace(/=/,"")),(l==="<"?n._start:n.endTime(n._repeat>=0))+(parseFloat(r.substr(1))||0)*(u?(o<0?n:i).totalDuration()/100:1)):o<0?(r in a||(a[r]=s),a[r]):(l=parseFloat(r.charAt(o-1)+r.substr(o+1)),u&&i&&(l=l/100*(er(i)?i[0]:i).totalDuration()),o>1?e(t,r.substr(0,o-1),i)+l:s+l)):r==null?s:+r},dn=function(e,t,r){var i=li(t[1]),a=(i?2:1)+(e<2?0:1),n=t[a],s,o;if(i&&(n.duration=t[1]),n.parent=r,e){for(s=n,o=r;o&&!("immediateRender"in s);)s=o.vars.defaults||{},o=lr(o.vars.inherit)&&o.parent;n.immediateRender=lr(s.immediateRender),e<2?n.runBackwards=1:n.startAt=t[a-1]}return new Ht(t[0],n,t[a+1])},bi=function(e,t){return e||e===0?t(e):t},xn=function(e,t,r){return r<e?e:r>t?t:r},Ei=function(e,t){return!tr(e)||!(t=Kv.exec(e))?"":t[1]},ux=function(e,t,r){return bi(r,function(i){return xn(e,t,i)})},zl=[].slice,Wc=function(e,t){return e&&Yr(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&Yr(e[0]))&&!e.nodeType&&e!==qr},hx=function(e,t,r){return r===void 0&&(r=[]),e.forEach(function(i){var a;return tr(i)&&!t||Wc(i,1)?(a=r).push.apply(a,br(i)):r.push(i)})||r},br=function(e,t,r){return Ct&&!t&&Ct.selector?Ct.selector(e):tr(e)&&!r&&(Ul||!Ca())?zl.call((t||Xl).querySelectorAll(e),0):er(e)?hx(e,r):Wc(e)?zl.call(e,0):e?[e]:[]},Bl=function(e){return e=br(e)[0]||mn("Invalid scope")||{},function(t){var r=e.current||e.nativeElement||e;return br(t,r.querySelectorAll?r:r===e?mn("Invalid scope")||Xl.createElement("div"):e)}},Xc=function(e){return e.sort(function(){return .5-Math.random()})},qc=function(e){if(Ft(e))return e;var t=Yr(e)?e:{each:e},r=Wi(t.ease),i=t.from||0,a=parseFloat(t.base)||0,n={},s=i>0&&i<1,o=isNaN(i)||s,l=t.axis,u=i,h=i;return tr(i)?u=h={center:.5,edges:.5,end:1}[i]||0:!s&&o&&(u=i[0],h=i[1]),function(d,c,f){var g=(f||t).length,v=n[g],m,p,b,w,y,E,C,R,_;if(!v){if(_=t.grid==="auto"?0:(t.grid||[1,Er])[1],!_){for(C=-Er;C<(C=f[_++].getBoundingClientRect().left)&&_<g;);_<g&&_--}for(v=n[g]=[],m=o?Math.min(_,g)*u-.5:i%_,p=_===Er?0:o?g*h/_-.5:i/_|0,C=0,R=Er,E=0;E<g;E++)b=E%_-m,w=p-(E/_|0),v[E]=y=l?Math.abs(l==="y"?w:b):Ac(b*b+w*w),y>C&&(C=y),y<R&&(R=y);i==="random"&&Xc(v),v.max=C-R,v.min=R,v.v=g=(parseFloat(t.amount)||parseFloat(t.each)*(_>g?g-1:l?l==="y"?g/_:_:Math.max(_,g/_))||0)*(i==="edges"?-1:1),v.b=g<0?a-g:a,v.u=Ei(t.amount||t.each)||0,r=r&&g<0?Ex(r):r}return g=(v[d]-v.min)/v.max||0,Nt(v.b+(r?r(g):g)*v.v)+v.u}},kl=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(r){var i=Nt(Math.round(parseFloat(r)/e)*e*t);return(i-i%1)/t+(li(r)?0:Ei(r))}},jc=function(e,t){var r=er(e),i,a;return!r&&Yr(e)&&(i=r=e.radius||Er,e.values?(e=br(e.values),(a=!li(e[0]))&&(i*=i)):e=kl(e.increment)),bi(t,r?Ft(e)?function(n){return a=e(n),Math.abs(a-n)<=i?a:n}:function(n){for(var s=parseFloat(a?n.x:n),o=parseFloat(a?n.y:0),l=Er,u=0,h=e.length,d,c;h--;)a?(d=e[h].x-s,c=e[h].y-o,d=d*d+c*c):d=Math.abs(e[h]-s),d<l&&(l=d,u=h);return u=!i||l<=i?e[u]:n,a||u===n||li(n)?u:u+Ei(n)}:kl(e))},Yc=function(e,t,r,i){return bi(er(e)?!t:r===!0?!!(r=0):!i,function(){return er(e)?e[~~(Math.random()*e.length)]:(r=r||1e-5)&&(i=r<1?Math.pow(10,(r+"").length-2):1)&&Math.floor(Math.round((e-r/2+Math.random()*(t-e+r*.99))/r)*r*i)/i})},cx=function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(i){return t.reduce(function(a,n){return n(a)},i)}},dx=function(e,t){return function(r){return e(parseFloat(r))+(t||Ei(r))}},px=function(e,t,r){return Jc(e,t,0,1,r)},Kc=function(e,t,r){return bi(r,function(i){return e[~~t(i)]})},fx=function e(t,r,i){var a=r-t;return er(t)?Kc(t,e(0,t.length),r):bi(i,function(n){return(a+(n-t)%a)%a+t})},mx=function e(t,r,i){var a=r-t,n=a*2;return er(t)?Kc(t,e(0,t.length-1),r):bi(i,function(s){return s=(n+(s-t)%n)%n||0,t+(s>a?n-s:s)})},Jl=function(e){return e.replace(Wv,function(t){var r=t.indexOf("[")+1,i=t.substring(r||7,r?t.indexOf("]"):t.length-1).split(Xv);return Yc(r?i:+i[0],r?0:+i[1],+i[2]||1e-5)})},Jc=function(e,t,r,i,a){var n=t-e,s=i-r;return bi(a,function(o){return r+((o-e)/n*s||0)})},gx=function e(t,r,i,a){var n=isNaN(t+r)?0:function(f){return(1-f)*t+f*r};if(!n){var s=tr(t),o={},l,u,h,d,c;if(i===!0&&(a=1)&&(i=null),s)t={p:t},r={p:r};else if(er(t)&&!er(r)){for(h=[],d=t.length,c=d-2,u=1;u<d;u++)h.push(e(t[u-1],t[u]));d--,n=function(f){f*=d;var g=Math.min(c,~~f);return h[g](f-g)},i=r}else a||(t=wa(er(t)?[]:{},t));if(!h){for(l in r)Zl.call(o,t,l,"get",r[l]);n=function(f){return eu(f,o)||(s?t.p:t)}}}return bi(i,n)},Tc=function(e,t,r){var i=e.labels,a=Er,n,s,o;for(n in i)s=i[n]-t,s<0==!!r&&s&&a>(s=Math.abs(s))&&(o=n,a=s);return o},pr=function(e,t,r){var i=e.vars,a=i[t],n=Ct,s=e._ctx,o,l,u;if(a)return o=i[t+"Params"],l=i.callbackScope||e,r&&Mi.length&&ys(),s&&(Ct=s),u=o?a.apply(l,o):a.call(l),Ct=n,u},ln=function(e){return Ti(e),e.scrollTrigger&&e.scrollTrigger.kill(!!Kt),e.progress()<1&&pr(e,"onInterrupt"),e},Ta,Zc=[],$c=function(e){if(e)if(e=!e.name&&e.default||e,Wl()||e.headless){var t=e.name,r=Ft(e),i=t&&!r&&e.init?function(){this._props=[]}:e,a={init:gn,render:eu,add:Zl,kill:Fx,modifier:Ox,rawVars:0},n={targetTest:0,get:0,getSetter:nd,aliases:{},register:0};if(Ca(),e!==i){if(Tr[t])return;mr(i,mr(Ms(e,a),n)),wa(i.prototype,wa(a,Ms(e,n))),Tr[i.prop=t]=i,e.targetTest&&(vs.push(i),ql[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}Uc(t,i),e.register&&e.register(Jt,i,Pa)}else Zc.push(e)},Et=255,un={aqua:[0,Et,Et],lime:[0,Et,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,Et],navy:[0,0,128],white:[Et,Et,Et],olive:[128,128,0],yellow:[Et,Et,0],orange:[Et,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[Et,0,0],pink:[Et,192,203],cyan:[0,Et,Et],transparent:[Et,Et,Et,0]},Rl=function(e,t,r){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(r-t)*e*6:e<.5?r:e*3<2?t+(r-t)*(2/3-e)*6:t)*Et+.5|0},Qc=function(e,t,r){var i=e?li(e)?[e>>16,e>>8&Et,e&Et]:0:un.black,a,n,s,o,l,u,h,d,c,f;if(!i){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),un[e])i=un[e];else if(e.charAt(0)==="#"){if(e.length<6&&(a=e.charAt(1),n=e.charAt(2),s=e.charAt(3),e="#"+a+a+n+n+s+s+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return i=parseInt(e.substr(1,6),16),[i>>16,i>>8&Et,i&Et,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),i=[e>>16,e>>8&Et,e&Et]}else if(e.substr(0,3)==="hsl"){if(i=f=e.match(vc),!t)o=+i[0]%360/360,l=+i[1]/100,u=+i[2]/100,n=u<=.5?u*(l+1):u+l-u*l,a=u*2-n,i.length>3&&(i[3]*=1),i[0]=Rl(o+1/3,a,n),i[1]=Rl(o,a,n),i[2]=Rl(o-1/3,a,n);else if(~e.indexOf("="))return i=e.match(qv),r&&i.length<4&&(i[3]=1),i}else i=e.match(vc)||un.transparent;i=i.map(Number)}return t&&!f&&(a=i[0]/Et,n=i[1]/Et,s=i[2]/Et,h=Math.max(a,n,s),d=Math.min(a,n,s),u=(h+d)/2,h===d?o=l=0:(c=h-d,l=u>.5?c/(2-h-d):c/(h+d),o=h===a?(n-s)/c+(n<s?6:0):h===n?(s-a)/c+2:(a-n)/c+4,o*=60),i[0]=~~(o+.5),i[1]=~~(l*100+.5),i[2]=~~(u*100+.5)),r&&i.length<4&&(i[3]=1),i},ed=function(e){var t=[],r=[],i=-1;return e.split(Ea).forEach(function(a){var n=a.match(Pc)||[];t.push.apply(t,n),r.push(i+=n.length+1)}),t.c=r,t},Ec=function(e,t,r){var i="",a=(e+i).match(Ea),n=t?"hsla(":"rgba(",s=0,o,l,u,h;if(!a)return e;if(a=a.map(function(d){return(d=Qc(d,t,1))&&n+(t?d[0]+","+d[1]+"%,"+d[2]+"%,"+d[3]:d.join(","))+")"}),r&&(u=ed(e),o=r.c,o.join(i)!==u.c.join(i)))for(l=e.replace(Ea,"1").split(Pc),h=l.length-1;s<h;s++)i+=l[s]+(~o.indexOf(s)?a.shift()||n+"0,0,0,0)":(u.length?u:a.length?a:r).shift());if(!l)for(l=e.split(Ea),h=l.length-1;s<h;s++)i+=l[s]+a[s];return i+l[h]},Ea=(function(){var e="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",t;for(t in un)e+="|"+t+"\\b";return new RegExp(e+")","gi")})(),_x=/hsl[a]?\(/,vx=function(e){var t=e.join(" "),r;if(Ea.lastIndex=0,Ea.test(t))return r=_x.test(t),e[1]=Ec(e[1],r),e[0]=Ec(e[0],r,ed(e[1])),!0},_n,Ur=(function(){var e=Date.now,t=500,r=33,i=e(),a=i,n=1e3/240,s=n,o=[],l,u,h,d,c,f,g=function v(m){var p=e()-a,b=m===!0,w,y,E,C;if((p>t||p<0)&&(i+=p-r),a+=p,E=a-i,w=E-s,(w>0||b)&&(C=++d.frame,c=E-d.time*1e3,d.time=E=E/1e3,s+=w+(w>=n?4:n-w),y=1),b||(l=u(v)),y)for(f=0;f<o.length;f++)o[f](E,c,C,m)};return d={time:0,frame:0,tick:function(){g(!0)},deltaRatio:function(v){return c/(1e3/(v||60))},wake:function(){Lc&&(!Ul&&Wl()&&(qr=Ul=window,Xl=qr.document||{},fr.gsap=Jt,(qr.gsapVersions||(qr.gsapVersions=[])).push(Jt.version),Nc(Ss||qr.GreenSockGlobals||!qr.gsap&&qr||{}),Zc.forEach($c)),h=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&d.sleep(),u=h||function(v){return setTimeout(v,s-d.time*1e3+1|0)},_n=1,g(2))},sleep:function(){(h?cancelAnimationFrame:clearTimeout)(l),_n=0,u=gn},lagSmoothing:function(v,m){t=v||1/0,r=Math.min(m||33,t)},fps:function(v){n=1e3/(v||240),s=d.time*1e3+n},add:function(v,m,p){var b=m?function(w,y,E,C){v(w,y,E,C),d.remove(b)}:v;return d.remove(v),o[p?"unshift":"push"](b),Ca(),b},remove:function(v,m){~(m=o.indexOf(v))&&o.splice(m,1)&&f>=m&&f--},_listeners:o},d})(),Ca=function(){return!_n&&Ur.wake()},pt={},xx=/^[\d.\-M][\d.\-,\s]/,Sx=/["']/g,yx=function(e){for(var t={},r=e.substr(1,e.length-3).split(":"),i=r[0],a=1,n=r.length,s,o,l;a<n;a++)o=r[a],s=a!==n-1?o.lastIndexOf(","):o.length,l=o.substr(0,s),t[i]=isNaN(l)?l.replace(Sx,"").trim():+l,i=o.substr(s+1).trim();return t},Mx=function(e){var t=e.indexOf("(")+1,r=e.indexOf(")"),i=e.indexOf("(",t);return e.substring(t,~i&&i<r?e.indexOf(")",r+1):r)},Tx=function(e){var t=(e+"").split("("),r=pt[t[0]];return r&&t.length>1&&r.config?r.config.apply(null,~e.indexOf("{")?[yx(t[1])]:Mx(e).split(",").map(zc)):pt._CE&&xx.test(e)?pt._CE("",e):r},Ex=function(e){return function(t){return 1-e(1-t)}},Wi=function(e,t){return e&&(Ft(e)?e:pt[e]||Tx(e))||t},qi=function(e,t,r,i){r===void 0&&(r=function(s){return 1-t(1-s)}),i===void 0&&(i=function(s){return s<.5?t(s*2)/2:1-t((1-s)*2)/2});var a={easeIn:t,easeOut:r,easeInOut:i},n;return ui(e,function(s){pt[s]=fr[s]=a,pt[n=s.toLowerCase()]=r;for(var o in a)pt[n+(o==="easeIn"?".in":o==="easeOut"?".out":".inOut")]=pt[s+"."+o]=a[o]}),a},td=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},Cl=function e(t,r,i){var a=r>=1?r:1,n=(i||(t?.3:.45))/(r<1?r:1),s=n/Dl*(Math.asin(1/a)||0),o=function(u){return u===1?1:a*Math.pow(2,-10*u)*Gv((u-s)*n)+1},l=t==="out"?o:t==="in"?function(u){return 1-o(1-u)}:td(o);return n=Dl/n,l.config=function(u,h){return e(t,u,h)},l},Pl=function e(t,r){r===void 0&&(r=1.70158);var i=function(n){return n?--n*n*((r+1)*n+r)+1:0},a=t==="out"?i:t==="in"?function(n){return 1-i(1-n)}:td(i);return a.config=function(n){return e(t,n)},a};ui("Linear,Quad,Cubic,Quart,Quint,Strong",function(e,t){var r=t<5?t+1:t;qi(e+",Power"+(r-1),t?function(i){return Math.pow(i,r)}:function(i){return i},function(i){return 1-Math.pow(1-i,r)},function(i){return i<.5?Math.pow(i*2,r)/2:1-Math.pow((1-i)*2,r)/2})});pt.Linear.easeNone=pt.none=pt.Linear.easeIn;qi("Elastic",Cl("in"),Cl("out"),Cl());(function(e,t){var r=1/t,i=2*r,a=2.5*r,n=function(s){return s<r?e*s*s:s<i?e*Math.pow(s-1.5/t,2)+.75:s<a?e*(s-=2.25/t)*s+.9375:e*Math.pow(s-2.625/t,2)+.984375};qi("Bounce",function(s){return 1-n(1-s)},n)})(7.5625,2.75);qi("Expo",function(e){return Math.pow(2,10*(e-1))*e+e*e*e*e*e*e*(1-e)});qi("Circ",function(e){return-(Ac(1-e*e)-1)});qi("Sine",function(e){return e===1?1:-Hv(e*kv)+1});qi("Back",Pl("in"),Pl("out"),Pl());pt.SteppedEase=pt.steps=fr.SteppedEase={config:function(e,t){e===void 0&&(e=1);var r=1/e,i=e+(t?0:1),a=t?1:0,n=1-bt;return function(s){return((i*xn(0,n,s)|0)+a)*r}}};fn.ease=pt["quad.out"];ui("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(e){return jl+=e+","+e+"Params,"});var bx=function(e,t){this.id=Vv++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:$v,this.set=t?t.getSetter:nd},vn=(function(){function e(r){this.vars=r,this._delay=+r.delay||0,(this._repeat=r.repeat===1/0?-2:r.repeat||0)&&(this._rDelay=r.repeatDelay||0,this._yoyo=!!r.yoyo||!!r.yoyoEase),this._ts=1,Ra(this,+r.duration,1,1),this.data=r.data,Ct&&(this._ctx=Ct,Ct.data.push(this)),_n||Ur.wake()}var t=e.prototype;return t.delay=function(r){return r||r===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+r-this._delay),this._delay=r,this):this._delay},t.duration=function(r){return arguments.length?this.totalDuration(this._repeat>0?r+(r+this._rDelay)*this._repeat:r):this.totalDuration()&&this._dur},t.totalDuration=function(r){return arguments.length?(this._dirty=0,Ra(this,this._repeat<0?r:(r-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},t.totalTime=function(r,i){if(Ca(),!arguments.length)return this._tTime;var a=this._dp;if(a&&a.smoothChildTiming&&this._ts){for(As(this,r),!a._dp||a.parent||Vc(a,this);a&&a.parent;)a.parent._time!==a._start+(a._ts>=0?a._tTime/a._ts:(a.totalDuration()-a._tTime)/-a._ts)&&a.totalTime(a._tTime,!0),a=a.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&r<this._tDur||this._ts<0&&r>0||!this._tDur&&!r)&&jr(this._dp,this,this._start-this._delay)}return(this._tTime!==r||!this._dur&&!i||this._initted&&Math.abs(this._zTime)===bt||!this._initted&&this._dur&&r||!r&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=r),Fc(this,r,i)),this},t.time=function(r,i){return arguments.length?this.totalTime(Math.min(this.totalDuration(),r+yc(this))%(this._dur+this._rDelay)||(r?this._dur:0),i):this._time},t.totalProgress=function(r,i){return arguments.length?this.totalTime(this.totalDuration()*r,i):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},t.progress=function(r,i){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-r:r)+yc(this),i):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},t.iteration=function(r,i){var a=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(r-1)*a,i):this._repeat?Aa(this._tTime,a)+1:1},t.timeScale=function(r,i){if(!arguments.length)return this._rts===-bt?0:this._rts;if(this._rts===r)return this;var a=this.parent&&this._ts?Ts(this.parent._time,this):this._tTime;return this._rts=+r||0,this._ts=this._ps||r===-bt?0:this._rts,this.totalTime(xn(-Math.abs(this._delay),this.totalDuration(),a),i!==!1),ws(this),ix(this)},t.paused=function(r){return arguments.length?(this._ps!==r&&(this._ps=r,r?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(Ca(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==bt&&(this._tTime-=bt)))),this):this._ps},t.startTime=function(r){if(arguments.length){this._start=Nt(r);var i=this.parent||this._dp;return i&&(i._sort||!this.parent)&&jr(i,this,this._start-this._delay),this}return this._start},t.endTime=function(r){return this._start+(lr(r)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},t.rawTime=function(r){var i=this.parent||this._dp;return i?r&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Ts(i.rawTime(r),this):this._tTime:this._tTime},t.revert=function(r){r===void 0&&(r=Zv);var i=Kt;return Kt=r,Kl(this)&&(this.timeline&&this.timeline.revert(r),this.totalTime(-.01,r.suppressEvents)),this.data!=="nested"&&r.kill!==!1&&this.kill(),Kt=i,this},t.globalTime=function(r){for(var i=this,a=arguments.length?r:i.rawTime();i;)a=i._start+a/(Math.abs(i._ts)||1),i=i._dp;return!this.parent&&this._sat?this._sat.globalTime(r):a},t.repeat=function(r){return arguments.length?(this._repeat=r===1/0?-2:r,Mc(this)):this._repeat===-2?1/0:this._repeat},t.repeatDelay=function(r){if(arguments.length){var i=this._time;return this._rDelay=r,Mc(this),i?this.time(i):this}return this._rDelay},t.yoyo=function(r){return arguments.length?(this._yoyo=r,this):this._yoyo},t.seek=function(r,i){return this.totalTime(Mr(this,r),lr(i))},t.restart=function(r,i){return this.play().totalTime(r?-this._delay:0,lr(i)),this._dur||(this._zTime=-bt),this},t.play=function(r,i){return r!=null&&this.seek(r,i),this.reversed(!1).paused(!1)},t.reverse=function(r,i){return r!=null&&this.seek(r||this.totalDuration(),i),this.reversed(!0).paused(!1)},t.pause=function(r,i){return r!=null&&this.seek(r,i),this.paused(!0)},t.resume=function(){return this.paused(!1)},t.reversed=function(r){return arguments.length?(!!r!==this.reversed()&&this.timeScale(-this._rts||(r?-bt:0)),this):this._rts<0},t.invalidate=function(){return this._initted=this._act=0,this._zTime=-bt,this},t.isActive=function(){var r=this.parent||this._dp,i=this._start,a;return!!(!r||this._ts&&this._initted&&r.isActive()&&(a=r.rawTime(!0))>=i&&a<this.endTime(!0)-bt)},t.eventCallback=function(r,i,a){var n=this.vars;return arguments.length>1?(i?(n[r]=i,a&&(n[r+"Params"]=a),r==="onUpdate"&&(this._onUpdate=i)):delete n[r],this):n[r]},t.then=function(r){var i=this,a=i._prom;return new Promise(function(n){var s=Ft(r)?r:Bc,o=function(){var l=i.then;i.then=null,a&&a(),Ft(s)&&(s=s(i))&&(s.then||s===i)&&(i.then=l),n(s),i.then=l};i._initted&&i.totalProgress()===1&&i._ts>=0||!i._tTime&&i._ts<0?o():i._prom=o})},t.kill=function(){ln(this)},e})();mr(vn.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-bt,_prom:0,_ps:!1,_rts:1});var or=(function(e){wc(t,e);function t(i,a){var n;return i===void 0&&(i={}),n=e.call(this,i)||this,n.labels={},n.smoothChildTiming=!!i.smoothChildTiming,n.autoRemoveChildren=!!i.autoRemoveChildren,n._sort=lr(i.sortChildren),Dt&&jr(i.parent||Dt,oi(n),a),i.reversed&&n.reverse(),i.paused&&n.paused(!0),i.scrollTrigger&&Hc(oi(n),i.scrollTrigger),n}var r=t.prototype;return r.to=function(i,a,n){return dn(0,arguments,this),this},r.from=function(i,a,n){return dn(1,arguments,this),this},r.fromTo=function(i,a,n,s){return dn(2,arguments,this),this},r.set=function(i,a,n){return a.duration=0,a.parent=this,cn(a).repeatDelay||(a.repeat=0),a.immediateRender=!!a.immediateRender,new Ht(i,a,Mr(this,n),1),this},r.call=function(i,a,n){return jr(this,Ht.delayedCall(0,i,a),n)},r.staggerTo=function(i,a,n,s,o,l,u){return n.duration=a,n.stagger=n.stagger||s,n.onComplete=l,n.onCompleteParams=u,n.parent=this,new Ht(i,n,Mr(this,o)),this},r.staggerFrom=function(i,a,n,s,o,l,u){return n.runBackwards=1,cn(n).immediateRender=lr(n.immediateRender),this.staggerTo(i,a,n,s,o,l,u)},r.staggerFromTo=function(i,a,n,s,o,l,u,h){return s.startAt=n,cn(s).immediateRender=lr(s.immediateRender),this.staggerTo(i,a,s,o,l,u,h)},r.render=function(i,a,n){var s=this._time,o=this._dirty?this.totalDuration():this._tDur,l=this._dur,u=i<=0?0:Nt(i),h=this._zTime<0!=i<0&&(this._initted||!l),d,c,f,g,v,m,p,b,w,y,E,C;if(this!==Dt&&u>o&&i>=0&&(u=o),u!==this._tTime||n||h){if(s!==this._time&&l&&(u+=this._time-s,i+=this._time-s),d=u,w=this._start,b=this._ts,m=!b,h&&(l||(s=this._zTime),(i||!a)&&(this._zTime=i)),this._repeat){if(E=this._yoyo,v=l+this._rDelay,this._repeat<-1&&i<0)return this.totalTime(v*100+i,a,n);if(d=Nt(u%v),u===o?(g=this._repeat,d=l):(y=Nt(u/v),g=~~y,g&&g===y&&(d=l,g--),d>l&&(d=l)),y=Aa(this._tTime,v),!s&&this._tTime&&y!==g&&this._tTime-y*v-this._dur<=0&&(y=g),E&&g&1&&(d=l-d,C=1),g!==y&&!this._lock){var R=E&&y&1,_=R===(E&&g&1);if(g<y&&(R=!R),s=R?0:u%l?l:u,this._lock=1,this.render(s||(C?0:Nt(g*v)),a,!l)._lock=0,this._tTime=u,!a&&this.parent&&pr(this,"onRepeat"),this.vars.repeatRefresh&&!C&&(this.invalidate()._lock=1,y=g),s&&s!==this._time||m!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(l=this._dur,o=this._tDur,_&&(this._lock=2,s=R?l:-1e-4,this.render(s,!0),this.vars.repeatRefresh&&!C&&this.invalidate()),this._lock=0,!this._ts&&!m)return this}}if(this._hasPause&&!this._forcing&&this._lock<2&&(p=ox(this,Nt(s),Nt(d)),p&&(u-=d-(d=p._start))),this._tTime=u,this._time=d,this._act=!!b,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=i,s=0),!s&&u&&l&&!a&&!y&&(pr(this,"onStart"),this._tTime!==u))return this;if(d>=s&&i>=0)for(c=this._first;c;){if(f=c._next,(c._act||d>=c._start)&&c._ts&&p!==c){if(c.parent!==this)return this.render(i,a,n);if(c.render(c._ts>0?(d-c._start)*c._ts:(c._dirty?c.totalDuration():c._tDur)+(d-c._start)*c._ts,a,n),d!==this._time||!this._ts&&!m){p=0,f&&(u+=this._zTime=-bt);break}}c=f}else{c=this._last;for(var T=i<0?i:d;c;){if(f=c._prev,(c._act||T<=c._end)&&c._ts&&p!==c){if(c.parent!==this)return this.render(i,a,n);if(c.render(c._ts>0?(T-c._start)*c._ts:(c._dirty?c.totalDuration():c._tDur)+(T-c._start)*c._ts,a,n||Kt&&Kl(c)),d!==this._time||!this._ts&&!m){p=0,f&&(u+=this._zTime=T?-bt:bt);break}}c=f}}if(p&&!a&&(this.pause(),p.render(d>=s?0:-bt)._zTime=d>=s?1:-1,this._ts))return this._start=w,ws(this),this.render(i,a,n);this._onUpdate&&!a&&pr(this,"onUpdate",!0),(u===o&&this._tTime>=this.totalDuration()||!u&&s)&&(w===this._start||Math.abs(b)!==Math.abs(this._ts))&&(this._lock||((i||!l)&&(u===o&&this._ts>0||!u&&this._ts<0)&&Ti(this,1),!a&&!(i<0&&!s)&&(u||s||!o)&&(pr(this,u===o&&i>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(u<o&&this.timeScale()>0)&&this._prom())))}return this},r.add=function(i,a){var n=this;if(li(a)||(a=Mr(this,a,i)),!(i instanceof vn)){if(er(i))return i.forEach(function(s){return n.add(s,a)}),this;if(tr(i))return this.addLabel(i,a);if(Ft(i))i=Ht.delayedCall(0,i);else return this}return this!==i?jr(this,i,a):this},r.getChildren=function(i,a,n,s){i===void 0&&(i=!0),a===void 0&&(a=!0),n===void 0&&(n=!0),s===void 0&&(s=-Er);for(var o=[],l=this._first;l;)l._start>=s&&(l instanceof Ht?a&&o.push(l):(n&&o.push(l),i&&o.push.apply(o,l.getChildren(!0,a,n)))),l=l._next;return o},r.getById=function(i){for(var a=this.getChildren(1,1,1),n=a.length;n--;)if(a[n].vars.id===i)return a[n]},r.remove=function(i){return tr(i)?this.removeLabel(i):Ft(i)?this.killTweensOf(i):(i.parent===this&&bs(this,i),i===this._recent&&(this._recent=this._last),Gi(this))},r.totalTime=function(i,a){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=Nt(Ur.time-(this._ts>0?i/this._ts:(this.totalDuration()-i)/-this._ts))),e.prototype.totalTime.call(this,i,a),this._forcing=0,this):this._tTime},r.addLabel=function(i,a){return this.labels[i]=Mr(this,a),this},r.removeLabel=function(i){return delete this.labels[i],this},r.addPause=function(i,a,n){var s=Ht.delayedCall(0,a||gn,n);return s.data="isPause",this._hasPause=1,jr(this,s,Mr(this,i))},r.removePause=function(i){var a=this._first;for(i=Mr(this,i);a;)a._start===i&&a.data==="isPause"&&Ti(a),a=a._next},r.killTweensOf=function(i,a,n){for(var s=this.getTweensOf(i,n),o=s.length;o--;)yi!==s[o]&&s[o].kill(i,a);return this},r.getTweensOf=function(i,a){for(var n=[],s=br(i),o=this._first,l=li(a),u;o;)o instanceof Ht?ex(o._targets,s)&&(l?(!yi||o._initted&&o._ts)&&o.globalTime(0)<=a&&o.globalTime(o.totalDuration())>a:!a||o.isActive())&&n.push(o):(u=o.getTweensOf(s,a)).length&&n.push.apply(n,u),o=o._next;return n},r.tweenTo=function(i,a){a=a||{};var n=this,s=Mr(n,i),o=a,l=o.startAt,u=o.onStart,h=o.onStartParams,d=o.immediateRender,c,f=Ht.to(n,mr({ease:a.ease||"none",lazy:!1,immediateRender:!1,time:s,overwrite:"auto",duration:a.duration||Math.abs((s-(l&&"time"in l?l.time:n._time))/n.timeScale())||bt,onStart:function(){if(n.pause(),!c){var g=a.duration||Math.abs((s-(l&&"time"in l?l.time:n._time))/n.timeScale());f._dur!==g&&Ra(f,g,0,1).render(f._time,!0,!0),c=1}u&&u.apply(f,h||[])}},a));return d?f.render(0):f},r.tweenFromTo=function(i,a,n){return this.tweenTo(a,mr({startAt:{time:Mr(this,i)}},n))},r.recent=function(){return this._recent},r.nextLabel=function(i){return i===void 0&&(i=this._time),Tc(this,Mr(this,i))},r.previousLabel=function(i){return i===void 0&&(i=this._time),Tc(this,Mr(this,i),1)},r.currentLabel=function(i){return arguments.length?this.seek(i,!0):this.previousLabel(this._time+bt)},r.shiftChildren=function(i,a,n){n===void 0&&(n=0);var s=this._first,o=this.labels,l;for(i=Nt(i);s;)s._start>=n&&(s._start+=i,s._end+=i),s=s._next;if(a)for(l in o)o[l]>=n&&(o[l]+=i);return Gi(this)},r.invalidate=function(i){var a=this._first;for(this._lock=0;a;)a.invalidate(i),a=a._next;return e.prototype.invalidate.call(this,i)},r.clear=function(i){i===void 0&&(i=!0);for(var a=this._first,n;a;)n=a._next,this.remove(a),a=n;return this._dp&&(this._time=this._tTime=this._pTime=0),i&&(this.labels={}),Gi(this)},r.totalDuration=function(i){var a=0,n=this,s=n._last,o=Er,l,u,h;if(arguments.length)return n.timeScale((n._repeat<0?n.duration():n.totalDuration())/(n.reversed()?-i:i));if(n._dirty){for(h=n.parent;s;)l=s._prev,s._dirty&&s.totalDuration(),u=s._start,u>o&&n._sort&&s._ts&&!n._lock?(n._lock=1,jr(n,s,u-s._delay,1)._lock=0):o=u,u<0&&s._ts&&(a-=u,(!h&&!n._dp||h&&h.smoothChildTiming)&&(n._start+=Nt(u/n._ts),n._time-=u,n._tTime-=u),n.shiftChildren(-u,!1,-1/0),o=0),s._end>a&&s._ts&&(a=s._end),s=l;Ra(n,n===Dt&&n._time>a?n._time:a,1,1),n._dirty=0}return n._tDur},t.updateRoot=function(i){if(Dt._ts&&(Fc(Dt,Ts(i,Dt)),Ic=Ur.frame),Ur.frame>=xc){xc+=ba.autoSleep||120;var a=Dt._first;if((!a||!a._ts)&&ba.autoSleep&&Ur._listeners.length<2){for(;a&&!a._ts;)a=a._next;a||Ur.sleep()}}},t})(vn);mr(or.prototype,{_lock:0,_hasPause:0,_forcing:0});var wx=function(e,t,r,i,a,n,s){var o=new Pa(this._pt,e,t,0,1,Ix,null,a),l=0,u=0,h,d,c,f,g,v,m,p;for(o.b=r,o.e=i,r+="",i+="",(m=~i.indexOf("random("))&&(i=Jl(i)),n&&(p=[r,i],n(p,e,t),r=p[0],i=p[1]),d=r.match(wl)||[];h=wl.exec(i);)f=h[0],g=i.substring(l,h.index),c?c=(c+1)%5:g.substr(-5)==="rgba("&&(c=1),f!==d[u++]&&(v=parseFloat(d[u-1])||0,o._pt={_next:o._pt,p:g||u===1?g:",",s:v,c:f.charAt(1)==="="?Oc(v,f)-v:parseFloat(f)-v,m:c&&c<4?Math.round:0},l=wl.lastIndex);return o.c=l<i.length?i.substring(l,i.length):"",o.fp=s,(jv.test(i)||m)&&(o.e=0),this._pt=o,o},Zl=function(e,t,r,i,a,n,s,o,l,u){Ft(i)&&(i=i(a||0,e,n));var h=e[t],d=r!=="get"?r:Ft(h)?l?e[t.indexOf("set")||!Ft(e["get"+t.substr(3)])?t:"get"+t.substr(3)](l):e[t]():h,c=Ft(h)?l?Nx:ad:Ql,f;if(tr(i)&&(~i.indexOf("random(")&&(i=Jl(i)),i.charAt(1)==="="&&(f=Oc(d,i)+(Ei(d)||0),(f||f===0)&&(i=f))),!u||d!==i||Vl)return!isNaN(d*i)&&i!==""?(f=new Pa(this._pt,e,t,+d||0,i-(d||0),typeof h=="boolean"?Ux:sd,0,c),l&&(f.fp=l),s&&f.modifier(s,this,e),this._pt=f):(!h&&!(t in e)&&Dc(t,i),wx.call(this,e,t,d,i,c,o||ba.stringFilter,l))},Ax=function(e,t,r,i,a){if(Ft(e)&&(e=pn(e,a,t,r,i)),!Yr(e)||e.style&&e.nodeType||er(e)||Cc(e))return tr(e)?pn(e,a,t,r,i):e;var n={},s;for(s in e)n[s]=pn(e[s],a,t,r,i);return n},Rx=function(e,t,r,i,a,n){var s,o,l,u;if(Tr[e]&&(s=new Tr[e]).init(a,s.rawVars?t[e]:Ax(t[e],i,a,n,r),r,i,n)!==!1&&(r._pt=o=new Pa(r._pt,a,e,0,1,s.render,s,0,s.priority),r!==Ta))for(l=r._ptLookup[r._targets.indexOf(a)],u=s._props.length;u--;)l[s._props[u]]=o;return s},yi,Vl,$l=function e(t,r,i){var a=t.vars,n=a.ease,s=a.startAt,o=a.immediateRender,l=a.lazy,u=a.onUpdate,h=a.runBackwards,d=a.yoyoEase,c=a.keyframes,f=a.autoRevert,g=t._dur,v=t._startAt,m=t._targets,p=t.parent,b=p&&p.data==="nested"?p.vars.targets:m,w=t._overwrite==="auto"&&!Gl,y=t.timeline,E=a.easeReverse||d,C,R,_,T,H,N,F,q,A,O,j,G,ce;if(y&&(!c||!n)&&(n="none"),t._ease=Wi(n,fn.ease),t._rEase=E&&(Wi(E)||t._ease),t._from=!y&&!!a.runBackwards,t._from&&(t.ratio=1),!y||c&&!a.stagger){if(q=m[0]?hn(m[0]).harness:0,G=q&&a[q.prop],C=Ms(a,ql),v&&(v._zTime<0&&v.progress(1),r<0&&h&&o&&!f?v.render(-1,!0):v.revert(h&&g?_s:Jv),v._lazy=0),s){if(Ti(t._startAt=Ht.set(m,mr({data:"isStart",overwrite:!1,parent:p,immediateRender:!0,lazy:!v&&lr(l),startAt:null,delay:0,onUpdate:u&&function(){return pr(t,"onUpdate")},stagger:0},s))),t._startAt._dp=0,t._startAt._sat=t,r<0&&(Kt||!o&&!f)&&t._startAt.revert(_s),o&&g&&r<=0&&i<=0){r&&(t._zTime=r);return}}else if(h&&g&&!v){if(r&&(o=!1),_=mr({overwrite:!1,data:"isFromStart",lazy:o&&!v&&lr(l),immediateRender:o,stagger:0,parent:p},C),G&&(_[q.prop]=G),Ti(t._startAt=Ht.set(m,_)),t._startAt._dp=0,t._startAt._sat=t,r<0&&(Kt?t._startAt.revert(_s):t._startAt.render(-1,!0)),t._zTime=r,!o)e(t._startAt,bt,bt);else if(!r)return}for(t._pt=t._ptCache=0,l=g&&lr(l)||l&&!g,R=0;R<m.length;R++){if(H=m[R],F=H._gsap||Yl(m)[R]._gsap,t._ptLookup[R]=O={},Il[F.id]&&Mi.length&&ys(),j=b===m?R:b.indexOf(H),q&&(A=new q).init(H,G||C,t,j,b)!==!1&&(t._pt=T=new Pa(t._pt,H,A.name,0,1,A.render,A,0,A.priority),A._props.forEach(function(X){O[X]=T}),A.priority&&(N=1)),!q||G)for(_ in C)Tr[_]&&(A=Rx(_,C,t,j,H,b))?A.priority&&(N=1):O[_]=T=Zl.call(t,H,_,"get",C[_],j,b,0,a.stringFilter);t._op&&t._op[R]&&t.kill(H,t._op[R]),w&&t._pt&&(yi=t,Dt.killTweensOf(H,O,t.globalTime(r)),ce=!t.parent,yi=0),t._pt&&l&&(Il[F.id]=1)}N&&Bx(t),t._onInit&&t._onInit(t)}t._onUpdate=u,t._initted=(!t._op||t._pt)&&!ce,c&&r<=0&&y.render(Er,!0,!0)},Cx=function(e,t,r,i,a,n,s,o){var l=(e._pt&&e._ptCache||(e._ptCache={}))[t],u,h,d,c;if(!l)for(l=e._ptCache[t]=[],d=e._ptLookup,c=e._targets.length;c--;){if(u=d[c][t],u&&u.d&&u.d._pt)for(u=u.d._pt;u&&u.p!==t&&u.fp!==t;)u=u._next;if(!u)return Vl=1,e.vars[t]="+=0",$l(e,s),Vl=0,o?mn(t+" not eligible for reset. Try splitting into individual properties"):1;l.push(u)}for(c=l.length;c--;)h=l[c],u=h._pt||h,u.s=(i||i===0)&&!a?i:u.s+(i||0)+n*u.c,u.c=r-u.s,h.e&&(h.e=Qv(r)+Ei(h.e)),h.b&&(h.b=u.s+Ei(h.b))},Px=function(e,t){var r=e[0]?hn(e[0]).harness:0,i=r&&r.aliases,a,n,s,o;if(!i)return t;a=wa({},t);for(n in i)if(n in a)for(o=i[n].split(","),s=o.length;s--;)a[o[s]]=a[n];return a},Lx=function(e,t,r,i){var a=t.ease||i||"power1.inOut",n,s;if(er(t))s=r[e]||(r[e]=[]),t.forEach(function(o,l){return s.push({t:l/(t.length-1)*100,v:o,e:a})});else for(n in t)s=r[n]||(r[n]=[]),n==="ease"||s.push({t:parseFloat(e),v:t[n],e:a})},pn=function(e,t,r,i,a){return Ft(e)?e.call(t,r,i,a):tr(e)&&~e.indexOf("random(")?Jl(e):e},rd=jl+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert",id={};ui(rd+",id,stagger,delay,duration,paused,scrollTrigger",function(e){return id[e]=1});var Ht=(function(e){wc(t,e);function t(i,a,n,s){var o;typeof a=="number"&&(n.duration=a,a=n,n=null),o=e.call(this,s?a:cn(a))||this;var l=o.vars,u=l.duration,h=l.delay,d=l.immediateRender,c=l.stagger,f=l.overwrite,g=l.keyframes,v=l.defaults,m=l.scrollTrigger,p=a.parent||Dt,b=(er(i)||Cc(i)?li(i[0]):"length"in a)?[i]:br(i),w,y,E,C,R,_,T,H;if(o._targets=b.length?Yl(b):mn("GSAP target "+i+" not found. https://gsap.com",!ba.nullTargetWarn)||[],o._ptLookup=[],o._overwrite=f,g||c||gs(u)||gs(h)){a=o.vars;var N=a.easeReverse||a.yoyoEase;if(w=o.timeline=new or({data:"nested",defaults:v||{},targets:p&&p.data==="nested"?p.vars.targets:b}),w.kill(),w.parent=w._dp=oi(o),w._start=0,c||gs(u)||gs(h)){if(C=b.length,T=c&&qc(c),Yr(c))for(R in c)~rd.indexOf(R)&&(H||(H={}),H[R]=c[R]);for(y=0;y<C;y++)E=Ms(a,id),E.stagger=0,N&&(E.easeReverse=N),H&&wa(E,H),_=b[y],E.duration=+pn(u,oi(o),y,_,b),E.delay=(+pn(h,oi(o),y,_,b)||0)-o._delay,!c&&C===1&&E.delay&&(o._delay=h=E.delay,o._start+=h,E.delay=0),w.to(_,E,T?T(y,_,b):0),w._ease=pt.none;w.duration()?u=h=0:o.timeline=0}else if(g){cn(mr(w.vars.defaults,{ease:"none"})),w._ease=Wi(g.ease||a.ease||"none");var F=0,q,A,O;if(er(g))g.forEach(function(j){return w.to(b,j,">")}),w.duration();else{E={};for(R in g)R==="ease"||R==="easeEach"||Lx(R,g[R],E,g.easeEach);for(R in E)for(q=E[R].sort(function(j,G){return j.t-G.t}),F=0,y=0;y<q.length;y++)A=q[y],O={ease:A.e,duration:(A.t-(y?q[y-1].t:0))/100*u},O[R]=A.v,w.to(b,O,F),F+=O.duration;w.duration()<u&&w.to({},{duration:u-w.duration()})}}u||o.duration(u=w.duration())}else o.timeline=0;return f===!0&&!Gl&&(yi=oi(o),Dt.killTweensOf(b),yi=0),jr(p,oi(o),n),a.reversed&&o.reverse(),a.paused&&o.paused(!0),(d||!u&&!g&&o._start===Nt(p._time)&&lr(d)&&ax(oi(o))&&p.data!=="nested")&&(o._tTime=-bt,o.render(Math.max(0,-h)||0)),m&&Hc(oi(o),m),o}var r=t.prototype;return r.render=function(i,a,n){var s=this._time,o=this._tDur,l=this._dur,u=i<0,h=i>o-bt&&!u?o:i<bt?0:i,d,c,f,g,v,m,p,b;if(!l)sx(this,i,a,n);else if(h!==this._tTime||!i||n||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==u||this._lazy){if(d=h,b=this.timeline,this._repeat){if(g=l+this._rDelay,this._repeat<-1&&u)return this.totalTime(g*100+i,a,n);if(d=Nt(h%g),h===o?(f=this._repeat,d=l):(v=Nt(h/g),f=~~v,f&&f===v?(d=l,f--):d>l&&(d=l)),m=this._yoyo&&f&1,m&&(d=l-d),v=Aa(this._tTime,g),d===s&&!n&&this._initted&&f===v)return this._tTime=h,this;f!==v&&this.vars.repeatRefresh&&!m&&!this._lock&&d!==g&&this._initted&&(this._lock=n=1,this.render(Nt(g*f),!0).invalidate()._lock=0)}if(!this._initted){if(Gc(this,u?i:d,n,a,h))return this._tTime=0,this;if(s!==this._time&&!(n&&this.vars.repeatRefresh&&f!==v))return this;if(l!==this._dur)return this.render(i,a,n)}if(this._rEase){var w=d<s;if(w!==this._inv){var y=w?s:l-s;this._inv=w,this._from&&(this.ratio=1-this.ratio),this._invRatio=this.ratio,this._invTime=s,this._invRecip=y?(w?-1:1)/y:0,this._invScale=w?-this.ratio:1-this.ratio,this._invEase=w?this._rEase:this._ease}this.ratio=p=this._invRatio+this._invScale*this._invEase((d-this._invTime)*this._invRecip)}else this.ratio=p=this._ease(d/l);if(this._from&&(this.ratio=p=1-p),this._tTime=h,this._time=d,!this._act&&this._ts&&(this._act=1,this._lazy=0),!s&&h&&!a&&!v&&(pr(this,"onStart"),this._tTime!==h))return this;for(c=this._pt;c;)c.r(p,c.d),c=c._next;b&&b.render(i<0?i:b._dur*b._ease(d/this._dur),a,n)||this._startAt&&(this._zTime=i),this._onUpdate&&!a&&(u&&Ol(this,i,a,n),pr(this,"onUpdate")),this._repeat&&f!==v&&this.vars.onRepeat&&!a&&this.parent&&pr(this,"onRepeat"),(h===this._tDur||!h)&&this._tTime===h&&(u&&!this._onUpdate&&Ol(this,i,!0,!0),(i||!l)&&(h===this._tDur&&this._ts>0||!h&&this._ts<0)&&Ti(this,1),!a&&!(u&&!s)&&(h||s||m)&&(pr(this,h===o?"onComplete":"onReverseComplete",!0),this._prom&&!(h<o&&this.timeScale()>0)&&this._prom()))}return this},r.targets=function(){return this._targets},r.invalidate=function(i){return(!i||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(i),e.prototype.invalidate.call(this,i)},r.resetTo=function(i,a,n,s,o){_n||Ur.wake(),this._ts||this.play();var l=Math.min(this._dur,(this._dp._time-this._start)*this._ts),u;return this._initted||$l(this,l),u=this._ease(l/this._dur),Cx(this,i,a,n,s,u,l,o)?this.resetTo(i,a,n,s,1):(As(this,0),this.parent||kc(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},r.kill=function(i,a){if(a===void 0&&(a="all"),!i&&(!a||a==="all"))return this._lazy=this._pt=0,this.parent?ln(this):this.scrollTrigger&&this.scrollTrigger.kill(!!Kt),this;if(this.timeline){var n=this.timeline.totalDuration();return this.timeline.killTweensOf(i,a,yi&&yi.vars.overwrite!==!0)._first||ln(this),this.parent&&n!==this.timeline.totalDuration()&&Ra(this,this._dur*this.timeline._tDur/n,0,1),this}var s=this._targets,o=i?br(i):s,l=this._ptLookup,u=this._pt,h,d,c,f,g,v,m;if((!a||a==="all")&&rx(s,o))return a==="all"&&(this._pt=0),ln(this);for(h=this._op=this._op||[],a!=="all"&&(tr(a)&&(g={},ui(a,function(p){return g[p]=1}),a=g),a=Px(s,a)),m=s.length;m--;)if(~o.indexOf(s[m])){d=l[m],a==="all"?(h[m]=a,f=d,c={}):(c=h[m]=h[m]||{},f=a);for(g in f)v=d&&d[g],v&&((!("kill"in v.d)||v.d.kill(g)===!0)&&bs(this,v,"_pt"),delete d[g]),c!=="all"&&(c[g]=1)}return this._initted&&!this._pt&&u&&ln(this),this},t.to=function(i,a){return new t(i,a,arguments[2])},t.from=function(i,a){return dn(1,arguments)},t.delayedCall=function(i,a,n,s){return new t(a,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:i,onComplete:a,onReverseComplete:a,onCompleteParams:n,onReverseCompleteParams:n,callbackScope:s})},t.fromTo=function(i,a,n){return dn(2,arguments)},t.set=function(i,a){return a.duration=0,a.repeatDelay||(a.repeat=0),new t(i,a)},t.killTweensOf=function(i,a,n){return Dt.killTweensOf(i,a,n)},t})(vn);mr(Ht.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});ui("staggerTo,staggerFrom,staggerFromTo",function(e){Ht[e]=function(){var t=new or,r=zl.call(arguments,0);return r.splice(e==="staggerFromTo"?5:4,0,0),t[e].apply(t,r)}});var Ql=function(e,t,r){return e[t]=r},ad=function(e,t,r){return e[t](r)},Nx=function(e,t,r,i){return e[t](i.fp,r)},Dx=function(e,t,r){return e.setAttribute(t,r)},nd=function(e,t){return Ft(e[t])?ad:Rc(e[t])&&e.setAttribute?Dx:Ql},sd=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},Ux=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},Ix=function(e,t){var r=t._pt,i="";if(!e&&t.b)i=t.b;else if(e===1&&t.e)i=t.e;else{for(;r;)i=r.p+(r.m?r.m(r.s+r.c*e):Math.round((r.s+r.c*e)*1e4)/1e4)+i,r=r._next;i+=t.c}t.set(t.t,t.p,i,t)},eu=function(e,t){for(var r=t._pt;r;)r.r(e,r.d),r=r._next},Ox=function(e,t,r,i){for(var a=this._pt,n;a;)n=a._next,a.p===i&&a.modifier(e,t,r),a=n},Fx=function(e){for(var t=this._pt,r,i;t;)i=t._next,t.p===e&&!t.op||t.op===e?bs(this,t,"_pt"):t.dep||(r=1),t=i;return!r},zx=function(e,t,r,i){i.mSet(e,t,i.m.call(i.tween,r,i.mt),i)},Bx=function(e){for(var t=e._pt,r,i,a,n;t;){for(r=t._next,i=a;i&&i.pr>t.pr;)i=i._next;(t._prev=i?i._prev:n)?t._prev._next=t:a=t,(t._next=i)?i._prev=t:n=t,t=r}e._pt=a},Pa=(function(){function e(r,i,a,n,s,o,l,u,h){this.t=i,this.s=n,this.c=s,this.p=a,this.r=o||sd,this.d=l||this,this.set=u||Ql,this.pr=h||0,this._next=r,r&&(r._prev=this)}var t=e.prototype;return t.modifier=function(r,i,a){this.mSet=this.mSet||this.set,this.set=zx,this.m=r,this.mt=a,this.tween=i},e})();ui(jl+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse",function(e){return ql[e]=1});fr.TweenMax=fr.TweenLite=Ht;fr.TimelineLite=fr.TimelineMax=or;Dt=new or({sortChildren:!1,defaults:fn,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});ba.stringFilter=vx;var Xi=[],xs={},kx=[],bc=0,Vx=0,Ll=function(e){return(xs[e]||kx).map(function(t){return t()})},Hl=function(){var e=Date.now(),t=[];e-bc>2&&(Ll("matchMediaInit"),Xi.forEach(function(r){var i=r.queries,a=r.conditions,n,s,o,l;for(s in i)n=qr.matchMedia(i[s]).matches,n&&(o=1),n!==a[s]&&(a[s]=n,l=1);l&&(r.revert(),o&&t.push(r))}),Ll("matchMediaRevert"),t.forEach(function(r){return r.onMatch(r,function(i){return r.add(null,i)})}),bc=e,Ll("matchMedia"))},od=(function(){function e(r,i){this.selector=i&&Bl(i),this.data=[],this._r=[],this.isReverted=!1,this.id=Vx++,r&&this.add(r)}var t=e.prototype;return t.add=function(r,i,a){Ft(r)&&(a=i,i=r,r=Ft);var n=this,s=function(){var o=Ct,l=n.selector,u;return o&&o!==n&&o.data.push(n),a&&(n.selector=Bl(a)),Ct=n,u=i.apply(n,arguments),Ft(u)&&n._r.push(u),Ct=o,n.selector=l,n.isReverted=!1,u};return n.last=s,r===Ft?s(n,function(o){return n.add(null,o)}):r?n[r]=s:s},t.ignore=function(r){var i=Ct;Ct=null,r(this),Ct=i},t.getTweens=function(){var r=[];return this.data.forEach(function(i){return i instanceof e?r.push.apply(r,i.getTweens()):i instanceof Ht&&!(i.parent&&i.parent.data==="nested")&&r.push(i)}),r},t.clear=function(){this._r.length=this.data.length=0},t.kill=function(r,i){var a=this;if(r?(function(){for(var s=a.getTweens(),o=a.data.length,l;o--;)l=a.data[o],l.data==="isFlip"&&(l.revert(),l.getChildren(!0,!0,!1).forEach(function(u){return s.splice(s.indexOf(u),1)}));for(s.map(function(u){return{g:u._dur||u._delay||u._sat&&!u._sat.vars.immediateRender?u.globalTime(0):-1/0,t:u}}).sort(function(u,h){return h.g-u.g||-1/0}).forEach(function(u){return u.t.revert(r)}),o=a.data.length;o--;)l=a.data[o],l instanceof or?l.data!=="nested"&&(l.scrollTrigger&&l.scrollTrigger.revert(),l.kill()):!(l instanceof Ht)&&l.revert&&l.revert(r);a._r.forEach(function(u){return u(r,a)}),a.isReverted=!0})():this.data.forEach(function(s){return s.kill&&s.kill()}),this.clear(),i)for(var n=Xi.length;n--;)Xi[n].id===this.id&&Xi.splice(n,1)},t.revert=function(r){this.kill(r||{})},e})(),Hx=(function(){function e(r){this.contexts=[],this.scope=r,Ct&&Ct.data.push(this)}var t=e.prototype;return t.add=function(r,i,a){Yr(r)||(r={matches:r});var n=new od(0,a||this.scope),s=n.conditions={},o,l,u;Ct&&!n.selector&&(n.selector=Ct.selector),this.contexts.push(n),i=n.add("onMatch",i),n.queries=r;for(l in r)l==="all"?u=1:(o=qr.matchMedia(r[l]),o&&(Xi.indexOf(n)<0&&Xi.push(n),(s[l]=o.matches)&&(u=1),o.addListener?o.addListener(Hl):o.addEventListener("change",Hl)));return u&&i(n,function(h){return n.add(null,h)}),this},t.revert=function(r){this.kill(r||{})},t.kill=function(r){this.contexts.forEach(function(i){return i.kill(r,!0)})},e})(),Es={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];t.forEach(function(i){return $c(i)})},timeline:function(e){return new or(e)},getTweensOf:function(e,t){return Dt.getTweensOf(e,t)},getProperty:function(e,t,r,i){tr(e)&&(e=br(e)[0]);var a=hn(e||{}).get,n=r?Bc:zc;return r==="native"&&(r=""),e&&(t?n((Tr[t]&&Tr[t].get||a)(e,t,r,i)):function(s,o,l){return n((Tr[s]&&Tr[s].get||a)(e,s,o,l))})},quickSetter:function(e,t,r){if(e=br(e),e.length>1){var i=e.map(function(u){return Jt.quickSetter(u,t,r)}),a=i.length;return function(u){for(var h=a;h--;)i[h](u)}}e=e[0]||{};var n=Tr[t],s=hn(e),o=s.harness&&(s.harness.aliases||{})[t]||t,l=n?function(u){var h=new n;Ta._pt=0,h.init(e,r?u+r:u,Ta,0,[e]),h.render(1,h),Ta._pt&&eu(1,Ta)}:s.set(e,o);return n?l:function(u){return l(e,o,r?u+r:u,s,1)}},quickTo:function(e,t,r){var i,a=Jt.to(e,mr((i={},i[t]="+=0.1",i.paused=!0,i.stagger=0,i),r||{})),n=function(s,o,l){return a.resetTo(t,s,o,l)};return n.tween=a,n},isTweening:function(e){return Dt.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=Wi(e.ease,fn.ease)),Sc(fn,e||{})},config:function(e){return Sc(ba,e||{})},registerEffect:function(e){var t=e.name,r=e.effect,i=e.plugins,a=e.defaults,n=e.extendTimeline;(i||"").split(",").forEach(function(s){return s&&!Tr[s]&&!fr[s]&&mn(t+" effect requires "+s+" plugin.")}),Al[t]=function(s,o,l){return r(br(s),mr(o||{},a),l)},n&&(or.prototype[t]=function(s,o,l){return this.add(Al[t](s,Yr(o)?o:(l=o)&&{},this),l)})},registerEase:function(e,t){pt[e]=Wi(t)},parseEase:function(e,t){return arguments.length?Wi(e,t):pt},getById:function(e){return Dt.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var r=new or(e),i,a;for(r.smoothChildTiming=lr(e.smoothChildTiming),Dt.remove(r),r._dp=0,r._time=r._tTime=Dt._time,i=Dt._first;i;)a=i._next,(t||!(!i._dur&&i instanceof Ht&&i.vars.onComplete===i._targets[0]))&&jr(r,i,i._start-i._delay),i=a;return jr(Dt,r,0),r},context:function(e,t){return e?new od(e,t):Ct},matchMedia:function(e){return new Hx(e)},matchMediaRefresh:function(){return Xi.forEach(function(e){var t=e.conditions,r,i;for(i in t)t[i]&&(t[i]=!1,r=1);r&&e.revert()})||Hl()},addEventListener:function(e,t){var r=xs[e]||(xs[e]=[]);~r.indexOf(t)||r.push(t)},removeEventListener:function(e,t){var r=xs[e],i=r&&r.indexOf(t);i>=0&&r.splice(i,1)},utils:{wrap:fx,wrapYoyo:mx,distribute:qc,random:Yc,snap:jc,normalize:px,getUnit:Ei,clamp:ux,splitColor:Qc,toArray:br,selector:Bl,mapRange:Jc,pipe:cx,unitize:dx,interpolate:gx,shuffle:Xc},install:Nc,effects:Al,ticker:Ur,updateRoot:or.updateRoot,plugins:Tr,globalTimeline:Dt,core:{PropTween:Pa,globals:Uc,Tween:Ht,Timeline:or,Animation:vn,getCache:hn,_removeLinkedListItem:bs,reverting:function(){return Kt},context:function(e){return e&&Ct&&(Ct.data.push(e),e._ctx=Ct),Ct},suppressOverwrites:function(e){return Gl=e}}};ui("to,from,fromTo,delayedCall,set,killTweensOf",function(e){return Es[e]=Ht[e]});Ur.add(or.updateRoot);Ta=Es.to({},{duration:0});var Gx=function(e,t){for(var r=e._pt;r&&r.p!==t&&r.op!==t&&r.fp!==t;)r=r._next;return r},Wx=function(e,t){var r=e._targets,i,a,n;for(i in t)for(a=r.length;a--;)n=e._ptLookup[a][i],n&&(n=n.d)&&(n._pt&&(n=Gx(n,i)),n&&n.modifier&&n.modifier(t[i],e,r[a],i))},Nl=function(e,t){return{name:e,headless:1,rawVars:1,init:function(r,i,a){a._onInit=function(n){var s,o;if(tr(i)&&(s={},ui(i,function(l){return s[l]=1}),i=s),t){s={};for(o in i)s[o]=t(i[o]);i=s}Wx(n,i)}}}},Jt=Es.registerPlugin({name:"attr",init:function(e,t,r,i,a){var n,s,o;this.tween=r;for(n in t)o=e.getAttribute(n)||"",s=this.add(e,"setAttribute",(o||0)+"",t[n],i,a,0,0,n),s.op=n,s.b=o,this._props.push(n)},render:function(e,t){for(var r=t._pt;r;)Kt?r.set(r.t,r.p,r.b,r):r.r(e,r.d),r=r._next}},{name:"endArray",headless:1,init:function(e,t){for(var r=t.length;r--;)this.add(e,r,e[r]||0,t[r],0,0,0,0,0,1)}},Nl("roundProps",kl),Nl("modifiers"),Nl("snap",jc))||Es;Ht.version=or.version=Jt.version="3.15.0";Lc=1;Wl()&&Ca();var ny=pt.Power0,sy=pt.Power1,oy=pt.Power2,ly=pt.Power3,uy=pt.Power4,hy=pt.Linear,cy=pt.Quad,dy=pt.Cubic,py=pt.Quart,fy=pt.Quint,my=pt.Strong,gy=pt.Elastic,_y=pt.Back,vy=pt.SteppedEase,xy=pt.Bounce,Sy=pt.Sine,yy=pt.Expo,My=pt.Circ;var ld='"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',Xx="#FFFFFF",qx="#F6F7FB",jx="#D9DEEA",Yx="#B4232C",Kx="#1C1C1E",Jx="#6E8A93",Zx="#4A4D35",$x="#07090B",Qx={high:1.75,balanced:1.25,soft:1},eS={high:[512,384],balanced:[384,288],soft:[384,288]},La={maxEdgePx:640,frameIntervalMs:1e3/30},tS=4,Kr=1.2,ji=.9,pd=.2,Na=16,rS={high:.55,balanced:.55,soft:.6},iS=.05,aS=30,nS=120,sS=50,oS={high:1,balanced:1,soft:2},ud=40,lS={high:250,balanced:250,soft:1e3},uS=150,hS=6,cS=8,dS=12,wi=Math.PI/180,pS=`
varying vec3 vLocal;
varying vec3 vObjNormal;
varying vec3 vNormal;

void main() {
  vLocal = position;
  vObjNormal = normal;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,fS=`
uniform vec3 uColor;
uniform vec3 uSideColor;
uniform float uEdgePx;
uniform float uGrain;
uniform float uGrainScale;
uniform float uDpr;
uniform vec3 uBayTint;
uniform float uOpacity;

uniform sampler2D uMap;
uniform float uUseMap;
uniform vec3 uTextInk;

uniform vec4 uLineRect;
uniform vec4 uLineSpec;
uniform vec3 uLineInk;

uniform vec3 uCard;
uniform float uInkGrow;
uniform float uInkFace;
uniform float uInkWidth;
uniform float uInkGap;
uniform vec3 uInkColor;
uniform vec2 uInkPts[${Na}];
uniform float uInkAcc[${Na}];

varying vec3 vLocal;
varying vec3 vObjNormal;
varying vec3 vNormal;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

/* 淡墨横线：像一道手写的题，每行长短不一，首行短一点当题干。线宽按屏幕像素算。 */
float lines(vec2 uv, vec2 fw) {
  if (uLineSpec.x < 0.5) return 0.0;
  vec2 q = (uv - uLineRect.xy) / (uLineRect.zw - uLineRect.xy);
  if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return 0.0;
  float rows = uLineSpec.x;
  float t = (1.0 - q.y) * rows;
  float row = floor(t);
  float len = row < 0.5 ? 0.46 : 0.62 + 0.36 * hash(vec2(row, uLineSpec.z));
  if (row > rows - 1.5) len *= 0.55;
  float along = 1.0 - smoothstep(len - 0.012, len, q.x);
  float dy = abs(fract(t) - 0.5) / rows * (uLineRect.w - uLineRect.y);
  float px = dy / fw.y;
  float halfWidth = uLineSpec.y * uDpr;
  return along * (1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, px));
}

/* 笔画：按弧长只画到 uInkGrow 那一段，笔头是圆的。uInkGap 那一段是提笔（叉的两笔之间），只占时间不落墨。 */
float ink(vec2 p, float px) {
  float written = uInkGrow * uInkAcc[${Na-1}];
  float best = 1e3;
  for (int i = 0; i < ${Na-1}; i++) {
    float from = uInkAcc[i];
    float to = uInkAcc[i + 1];
    if (written <= from) break;
    if (float(i) == uInkGap) continue;
    vec2 a = uInkPts[i];
    vec2 b = mix(a, uInkPts[i + 1], clamp((written - from) / max(to - from, 1e-5), 0.0, 1.0));
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
    best = min(best, length(pa - ba * h));
  }
  return 1.0 - smoothstep(uInkWidth - px, uInkWidth + px, best);
}

void main() {
  vec2 suv = vLocal.xy / (2.0 * uCard.xy) + 0.5;
  float sd = -sdRoundRect(vLocal.xy, uCard.xy, uCard.z);
  float sdw = max(fwidth(sd), 1e-6);
  vec2 fw = max(fwidth(suv), vec2(1e-6));

  /* 1 = 正面，-1 = 背面，0 = 纸边 */
  float face = vObjNormal.z > 0.5 ? (gl_FrontFacing ? 1.0 : -1.0) : (vObjNormal.z < -0.5 ? -1.0 : 0.0);
  vec3 col = face == 0.0 ? uSideColor : uColor;

  /*
   * 卡面字是单通道覆盖率（R8 贴图），背面镜像着采样，两面读起来都是正的。采样放在分支外：
   * mipmap 靠相邻像素求导，放进按像素走的分支是未定义行为。
   * 字和纸在 sRGB 空间里混：浏览器画字就是这么混的，线性空间里混出来的字会发虚发细。
   */
  float cover = texture2D(uMap, vec2(face < -0.5 ? 1.0 - suv.x : suv.x, suv.y)).r;
  bool onMap = (face > 0.5 && uUseMap > 0.5) || (face < -0.5 && uUseMap > 1.5);
  if (onMap) {
    col = pow(mix(pow(col, vec3(0.4545)), uTextInk, cover), vec3(2.2));
  }
  if (face > 0.5) {
    col = mix(col, uLineInk, lines(suv, fw) * uLineSpec.w);
  }

  if (uInkGrow > 0.0 && face != 0.0 && (uInkFace == 0.0 || face == uInkFace)) {
    vec2 p = face > 0.0 ? vLocal.xy : vec2(-vLocal.x, vLocal.y);
    col = mix(col, uInkColor, ink(p, sdw * 1.2));
  }

  /* 平涂三档 + 背光冷影。光从左上前方来，固定在观者一侧。 */
  vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  float lambert = dot(n, normalize(vec3(-0.42, 0.72, 0.55)));
  float toMid = smoothstep(-0.08, 0.1, lambert);
  float toLit = smoothstep(0.34, 0.5, lambert);
  col *= mix(0.8, mix(0.915, 1.0, toLit), toMid);
  col *= mix(vec3(1.0), uBayTint, (1.0 - toMid) * 0.34 + (1.0 - toLit) * 0.08);

  /* 纸纹：纤维方向拉长的两层值噪声。频率按屏幕像素定，卡再小也不闪成噪点。 */
  if (uGrain > 0.5) {
    vec2 gp = (vLocal.xy + vLocal.zz * 1.3) * uGrainScale;
    float fiber = noise(gp * vec2(1.0, 0.3)) * 0.6 + noise(gp * 2.1 + 7.0) * 0.4;
    col *= 1.0 + (fiber - 0.5) * 0.06;
  }

  /* 颜料边：贴边一道深线，再往里一层很淡的晕，都按屏幕像素算宽度 */
  float edgeDist = face == 0.0 ? 0.0 : sd / sdw;
  float rim = 1.0 - smoothstep(0.0, uEdgePx * uDpr, edgeDist);
  float halo = 1.0 - smoothstep(0.0, uEdgePx * uDpr * 5.0, edgeDist);
  col *= 1.0 - rim * 0.13 - halo * 0.045;

  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`,mS=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,gS=`
uniform vec3 uColor;
uniform float uAlpha;
uniform float uPow;
uniform float uCore;
varying vec2 vUv;
void main() {
  vec2 q = abs(vUv * 2.0 - 1.0) + 1e-4;
  float r = pow(pow(q.x, uPow) + pow(q.y, uPow), 1.0 / uPow);
  float a = uAlpha * pow(1.0 - smoothstep(uCore, 1.0, r), 1.4);
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`,yn=e=>e*e*(3-2*e),Mn=e=>e<0?0:e>1?1:e,hi=(e,t,r)=>Math.min(r,Math.max(t,e)),wt=(e,t,r)=>e+(t-e)*r,Gt=(e,t,r)=>yn(Mn((e-t)/(r-t))),hd=e=>{let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)};function _S(){let e=new Tl,t=-Kr,r=Kr,i=-ji,a=ji,n=pd;return e.moveTo(t+n,i),e.lineTo(r-n,i),e.absarc(r-n,i+n,n,-Math.PI/2,0,!1),e.lineTo(r,a-n),e.absarc(r-n,a-n,n,0,Math.PI/2,!1),e.lineTo(t+n,a),e.absarc(t+n,a-n,n,Math.PI/2,Math.PI,!1),e.lineTo(t,i+n),e.absarc(t+n,i+n,n,Math.PI,Math.PI*1.5,!1),e}function ru(e,t,r){let i=[0];for(let a=1;a<e.length;a+=1){let n=a-1===t?i[a-1]*r:e[a].distanceTo(e[a-1]);i.push(i[a-1]+n)}return{points:e,acc:i,gap:t}}function tu(e,t,r){let i=r/8.2,a=(u,h)=>new Me(e+(u-21.5)*i,t+(22-h)*i),n=new Hi(a(17.4,22.6),a(18.7,23.6),a(19.5,24.5),a(20,25.3)),s=new Hi(a(20,25.3),a(21.6,22.6),a(23.4,20.4),a(25.6,18.7)),o=n.getSpacedPoints(5),l=s.getSpacedPoints(Na-o.length).slice(1);return ru([...o,...l],-1,0)}function vS(e,t,r){let i=r/2,a=(o,l)=>new Me(e+o*i,t+l*i),n=new Hi(a(-.95,.9),a(-.35,.36),a(.2,-.22),a(.92,-.96)).getSpacedPoints(7),s=new Hi(a(.9,.96),a(.4,.3),a(-.25,-.34),a(-.86,-.92)).getSpacedPoints(7);return ru([...n,...s],7,.35)}var xS=/[⺀-鿿가-힯豈-﫿＀-￯]/u,cd=/[A-Za-z0-9._%'’-]+|[\s\S]/gu;function SS(e){if(typeof Intl>"u"||typeof Intl.Segmenter!="function")return e.match(cd)||[];let t=[],r=!1;for(let{segment:i}of new Intl.Segmenter("zh",{granularity:"word"}).segment(e))xS.test(i)?(t.push(...i.match(cd)),r=!1):/^\s+$/.test(i)?(t.push(" "),r=!1):r?t[t.length-1]+=i:(t.push(i),r=!0);return t}function yS(e,t,r,i){let a=h=>e.measureText(h).width<=r,n=[],s="",o=()=>{n.push(s.trimEnd()),s=""};for(let h of SS(String(t??"").replace(/\s+/g," ").trim()))if(!(!s&&h===" ")){if(a(s+h)){s+=h;continue}if(s&&o(),h!==" "){if(a(h)){s=h;continue}for(let d of Array.from(h))s&&!a(s+d)&&o(),s+=d}}if(s&&o(),n.length<=i)return n;let l=n.slice(0,i),u=Array.from(l[i-1]);for(;u.length&&!a(`${u.join("").trimEnd()}…`);)u.pop();return l[i-1]=`${u.join("").trimEnd()}…`,l}function Rs(e,t){e.position.set(t.x,t.y,t.z),e.rotation.set(0,t.flip||0,t.tilt||0),e.scale.setScalar(t.scale||1)}function dd(e,t,r){return{x:wt(e.x,t.x,r),y:wt(e.y,t.y,r),z:wt(e.z,t.z,r),tilt:wt(e.tilt||0,t.tilt||0,r),flip:wt(e.flip||0,t.flip||0,r),scale:wt(e.scale||1,t.scale||1,r)}}var Cs=[[.05,-.03,2.5],[-.17,.1,-5.5],[.14,.07,4.5],[-.07,-.1,-2.5],[.09,.12,1.5],[-.13,-.02,-4],[.03,-.12,3],[-.04,.05,-1]],Ps=[1.5,-2,2.5,-1,2,-2.5,1];function Ls(e,t){let r=hi(e,0,Cs.length-1),i=Math.floor(r),a=Math.min(i+1,Cs.length-1),n=r-i,s=Cs[i],o=Cs[a],l=1+t*1.1;return{x:wt(s[0],o[0],n)*l,y:wt(s[1],o[1],n)*l,z:-e*(.05+t*.07),tilt:wt(s[2],o[2],n)*wi*(1+t*.6),flip:0,scale:1}}function Sn(e){let t=hi(e,0,Ps.length-1),r=Math.floor(t),i=Math.min(r+1,Ps.length-1);return{x:(e-2)*.06,y:-(e-2)*.07,z:-e*.075,tilt:wt(Ps[r],Ps[i],t-r)*wi,flip:0,scale:1}}async function fd({canvas:e,context:t,tier:r,onFail:i,onTier:a}){let n=r==="soft"?"soft":r==="balanced"?"balanced":"high",s=n==="soft",o=!1,l=!1,u=!1,h=new _c({canvas:e,context:t,alpha:!0,antialias:!s,premultipliedAlpha:!0});h.debug.onShaderError=()=>{u=!0},h.setClearColor(0,0),h.setPixelRatio(d(0,0)),e.classList.add("fx-canvas"),e.setAttribute("aria-hidden","true");function d(K,ue){let je=Math.min(window.devicePixelRatio||1,Qx[n]),Le=Math.max(K,ue);return s&&Le>0?Math.min(je,La.maxEdgePx/Le):je}let c=new lt(Jx),f=Math.max(c.r,c.g,c.b),g={uGrain:{value:n==="high"?1:0},uGrainScale:{value:60},uDpr:{value:h.getPixelRatio()},uBayTint:{value:new z(c.r/f,c.g/f,c.b/f)}},v={paper:new lt(Xx),paperSoft:new lt(qx),edge:new lt(jx),brand:new lt(Yx),ink:new lt(Kx),shadowLight:new lt(Zx),shadowDark:new lt($x),text:new z(46/255,45/255,40/255)},m=ru(Array.from({length:Na},()=>new Me),-1,0),p=new vl,b=new cr(20,1,.1,100);function w(K){let ue=K.lines||null;return new dr({vertexShader:pS,fragmentShader:fS,side:Pr,transparent:!0,uniforms:{uGrain:g.uGrain,uGrainScale:g.uGrainScale,uDpr:g.uDpr,uBayTint:g.uBayTint,uColor:{value:K.color},uSideColor:{value:v.edge},uEdgePx:{value:K.edgePx??1.2},uOpacity:{value:1},uMap:{value:K.map||null},uUseMap:{value:K.map?2:0},uTextInk:{value:v.text},uLineRect:{value:new Pt(...ue?ue.rect:[0,0,1,1])},uLineSpec:{value:new Pt(ue?ue.rows:0,ue?ue.widthPx:.7,ue?ue.seed:0,ue?ue.alpha:0)},uLineInk:{value:v.ink},uCard:{value:new z(Kr,ji,pd)},uInkGrow:{value:0},uInkFace:{value:1},uInkWidth:{value:.06},uInkGap:{value:-1},uInkColor:{value:v.brand},uInkPts:{value:m.points},uInkAcc:{value:m.acc}}})}function y(K,ue,je,Le,ie){let fe=K.uniforms;fe.uInkPts.value=ue.points,fe.uInkAcc.value=ue.acc,fe.uInkGap.value=ue.gap,fe.uInkColor.value=je,fe.uInkFace.value=Le,fe.uInkWidth.value=ie,fe.uInkGrow.value=0}function E(K,ue,je,Le){return new dr({vertexShader:mS,fragmentShader:gS,transparent:!0,depthWrite:!1,uniforms:{uColor:{value:K},uAlpha:{value:ue},uPow:{value:je},uCore:{value:Le}}})}let C=new vl,R=new an(.2,.2),_=new sr(R,w({color:v.paper,lines:{rect:[0,0,1,1],rows:3,widthPx:.7,seed:1,alpha:.2}})),T=new sr(R,E(v.shadowLight,.2,2,0));_.frustumCulled=!1,T.frustumCulled=!1,C.add(_,T),b.position.set(0,0,5),b.updateProjectionMatrix();let H=!1,N=null,F=K=>{if(K.preventDefault(),!H){N&&N(new Error("context-lost"));return}Z("context-lost")};e.addEventListener("webglcontextlost",F);let q=0;try{if(await Promise.race([h.compileAsync(C,b),new Promise((K,ue)=>{N=ue,q=window.setTimeout(()=>ue(new Error("预编译超时")),1e4)})]),h.render(C,b),h.clear(),u)throw new Error("着色器编译失败")}catch(K){throw e.removeEventListener("webglcontextlost",F),R.dispose(),_.material.dispose(),T.material.dispose(),h.dispose(),K}finally{window.clearTimeout(q),N=null}H=!0,h.debug.onShaderError=()=>Z("error");let A=null,O=null,j=!1,G=!1,ce=!0,X=0,Y=0,ee=0,Ge=0,we=[],gt=new Me,Ze=new Map,J=window.matchMedia("(hover: hover) and (pointer: fine)"),re=null,oe=!1,Pe=null,Ne=null,pe=null,ke=null,te=!1;function Z(K){l||o||(l=!0,Fe(),window.setTimeout(()=>{try{typeof i=="function"&&i(K)}catch{}},0))}let se=K=>function(...je){if(!(l||o))try{return K.apply(this,je)}catch{Z("error");return}},Te=K=>(...ue)=>{if(!(l||o)){X+=1;try{return K(...ue)}catch{Z("error");return}finally{X-=1}}};function ve(){G=!0,Ue()}function Ue(){j||l||o||!A||(j=!0,Jt.ticker.add(et))}function Fe(){j&&Jt.ticker.remove(et),j=!1,Y=0,ee=0}function et(){if(!(X>0)){if(l||o||!A||document.hidden){Fe();return}try{if(ce&&!L()){Fe();return}if(A.prepare&&A.prepare(),!G){Fe();return}if(s&&La.frameIntervalMs>0){let K=performance.now();if(ee&&K<ee-tS)return;ee=ee&&K-ee<La.frameIntervalMs?ee+La.frameIntervalMs:K+La.frameIntervalMs}G=!1,A.apply(),h.render(p,b),it()}catch{Z("error")}}}function it(){let K=performance.now();if(Y){let ie=K-Y;ie<lS[n]&&(we.push(ie),we.length>ud&&we.shift())}if(Y=K,we.length<ud)return;let ue=0;for(let ie=0;ie<we.length;ie+=1)ue+=we[ie];let je=ue>0?we.length/ue*1e3:0,Le=1e3/La.frameIntervalMs;if(n!=="soft"){let ie=we.slice().sort((st,tt)=>st-tt),fe=ie[Math.max(0,Math.ceil(ie.length*iS)-1)];Le=Math.min(nS,Math.max(aS,1e3/fe))}if(je>=Math.min(Le*rS[n],sS)){Ge=0;return}if(we.length=0,Ge+=1,!(Ge<oS[n])){if(Ge=0,n!=="high"){Z("slow");return}n="balanced",g.uGrain.value=0,ce=!0,G=!0;try{typeof a=="function"&&a("balanced")}catch{}}}function L(){let K=e.clientWidth,ue=e.clientHeight;if(!K||!ue||!e.isConnected)return!1;ce=!1;let je=d(K,ue);h.getPixelRatio()!==je&&h.setPixelRatio(je),h.getSize(gt),(gt.x!==K||gt.y!==ue)&&h.setSize(K,ue,!1),g.uDpr.value=je;let Le=A.frame(K,ue),ie=2*Math.max(Le.cx,K-Le.cx,1),fe=2*Math.max(Le.cy,ue-Le.cy,1);if(b.fov=2*Math.atan(fe/Le.ppu/2/Le.distance)*180/Math.PI,b.aspect=ie/fe,b.near=Math.max(.1,Le.distance-8),b.far=Le.distance+8,b.position.set(0,0,Le.distance),b.setViewOffset(ie,fe,ie/2-Le.cx,fe/2-Le.cy,K,ue),b.updateProjectionMatrix(),g.uGrainScale.value=Le.ppu*je/1.4,A.rig&&O){let st=O.getBoundingClientRect();A.rig.docTop=st.top+window.scrollY,A.rig.docHeight=st.height,A.rig.leanReady||(A.rig.leanReady=!0,A.rig.state.lean=W(A.rig))}return G=!0,!0}function vt(K){let ue=`${n}:${K}`,je=Ze.get(ue);return je||(je=new tc(_S(),{depth:K,bevelEnabled:!1,curveSegments:n==="high"?8:4}),je.translate(0,0,-K/2),Ze.set(ue,je)),je}function ut(){for(let K of Ze.values())K.dispose();Ze.clear()}function nt(K,ue){let je=new sr(K,ue);return je.rotation.order="ZYX",je}function M(K,ue,je){let Le=new sr(new an(2*Kr*K,2*ji*K),E(ue,je,3,.85/K));return Le.renderOrder=-1,Le}function S(K,ue){K&&(K.parent&&K.parent.remove(K),ue&&K.geometry.dispose(),K.material.dispose())}function D(K){let ue=new Ii,je=new Ii;ue.add(je),p.add(ue);let Le={x:0,y:0,lean:0},ie=(st,tt)=>Jt.quickTo(Le,st,{duration:tt,ease:"sine.out",onUpdate:ve}),fe={root:ue,tilt:je,state:Le,docTop:0,docHeight:1,leanReady:!1,toX:ie("x",.7),toY:ie("y",.7),toLean:ie("lean",.55),apply(){je.rotation.x=K-Le.y*.14-Le.lean*.42,je.rotation.y=Le.x*.2},dispose(){fe.toX.tween.kill(),fe.toY.tween.kill(),fe.toLean.tween.kill(),p.remove(ue)}};return fe}function W(K){return Mn(window.scrollY/Math.max(K.docTop+K.docHeight,1))}let $=se(()=>{A&&A.rig&&A.rig.toLean(W(A.rig))}),_e=se(K=>{if(!A||!A.rig||!A.focus||!re)return;let ue=re.getBoundingClientRect(),je=e.getBoundingClientRect(),Le=(K.clientX-(je.left+A.focus.cx))/Math.max(ue.width*.5,1),ie=(je.top+A.focus.cy-K.clientY)/Math.max(ue.height*.5,1);A.rig.toX(hi(Le,-1,1)),A.rig.toY(hi(ie,-1,1))}),xe=se(()=>{!A||!A.rig||(A.rig.toX(0),A.rig.toY(0))});function I(K){let ue=K&&O?O.parentElement:null;re!==ue&&(re&&(re.removeEventListener("pointermove",_e),re.removeEventListener("pointerleave",xe)),re=null,ue&&J.matches&&(re=ue,ue.addEventListener("pointermove",_e,{passive:!0}),ue.addEventListener("pointerleave",xe,{passive:!0}))),K&&!oe?(window.addEventListener("scroll",$,{passive:!0}),oe=!0):!K&&oe&&(window.removeEventListener("scroll",$),oe=!1)}function me(){Pe&&Pe.kill();let K={v:0};e.style.opacity="0",Pe=Jt.to(K,{v:1,duration:.35,ease:"sine.inOut",onUpdate:se(()=>{e.style.opacity=String(K.v)}),onComplete:se(()=>{e.style.opacity="",Pe=null})})}function Se(){return Ne||(Ne=document.createElement("canvas")),Ne}function De(K,ue){return Se(),Ne.width!==K&&(Ne.width=K),Ne.height!==ue&&(Ne.height=ue),Ne.getContext("2d")}function he(K){let[ue,je]=K.labelSize,Le=De(ue,je),ie=ue/512,fe=44*ie;Le.fillStyle="#000",Le.fillRect(0,0,ue,je),Le.textBaseline="alphabetic",Le.fillStyle="#fff",Le.font=`700 ${Math.round(50*ie)}px ${ld}`,yS(Le,K.bank.name,ue-fe*2,3).forEach((st,tt)=>{Le.fillText(st,fe,fe+48*ie+tt*66*ie)}),Le.fillStyle="rgb(179, 179, 179)",Le.font=`400 ${Math.round(36*ie)}px ${ld}`,Le.fillText(`${Math.max(0,Math.round(Number(K.bank.count)||0))}道`,fe,je-fe),K.texture.image=Ne,K.texture.needsUpdate=!0,h.initTexture(K.texture)}function ze(){let K=D(-.22),ue=M(1.32,v.shadowDark,.62);K.tilt.add(ue);let je=vt(.024),Le=tu(.74,-.5,.52),ie={kind:"home",rig:K,cards:[],order:[],currentId:null,onSwitch:null,swipe:null,ink:{v:0},inkTween:null,pendingLabels:new Set,focus:null,frame(fe,st){let tt=Math.max(st-48,60),de=hi(Math.min(fe*.56,tt*.62*(Kr/ji)),72,176);return ie.focus={cx:fe/2,cy:tt/2+4},{cx:ie.focus.cx,cy:ie.focus.cy,ppu:de/(2*Kr),distance:12}},prepare(){if(ie.pendingLabels.size){for(let fe of ie.pendingLabels)he(fe);ie.pendingLabels.clear(),G=!0}},makeCard(fe,st){let tt=new Wh(Se());tt.format=ds;let de=w({color:st%2?v.paperSoft:v.paper,map:tt,edgePx:1.3});y(de,Le,v.brand,0,.042);let ae=nt(je,de);K.tilt.add(ae);let Ye={id:String(fe.id),bank:fe,texture:tt,material:de,mesh:ae,flip:0,labelSize:eS[n]};return ie.pendingLabels.add(Ye),Ye},clearCards(){ie.finishSwipe();for(let fe of ie.cards)S(fe.mesh,!1),fe.texture.dispose();ie.cards=[],ie.order=[],ie.pendingLabels.clear()},update(fe){ie.onSwitch=typeof fe.onSwitch=="function"?fe.onSwitch:null;let st=(Array.isArray(fe.banks)?fe.banks:[]).filter(Xe=>Xe&&Xe.id!=null),tt=fe.currentId==null?null:String(fe.currentId),de=st.find(Xe=>String(Xe.id)===tt)||null,ae=(de?[de,...st.filter(Xe=>Xe!==de)]:st).slice(0,cS);if(!(ae.length===ie.cards.length&&ae.every(Xe=>ie.cards.some(qe=>qe.id===String(Xe.id)))))ie.clearCards(),ie.cards=ae.map((Xe,qe)=>ie.makeCard(Xe,qe)),ie.order=ie.cards.slice(),ie.currentId=tt,ie.growInk(.3);else{for(let Xe of ae){let qe=ie.cards.find(rt=>rt.id===String(Xe.id));(qe.bank.name!==Xe.name||Number(qe.bank.count)!==Number(Xe.count))&&ie.pendingLabels.add(qe),qe.bank=Xe}if(tt!==ie.currentId){ie.currentId=tt;let Xe=ie.cards.find(qe=>qe.id===tt);Xe&&ie.order[0]!==Xe&&(ie.finishSwipe(),ie.order=[Xe,...ie.order.filter(qe=>qe!==Xe)]),ie.growInk(.05)}}ie.syncSwitch(),ve()},growInk(fe){ie.inkTween&&ie.inkTween.kill(),ie.ink.v=0,ie.inkTween=Jt.to(ie.ink,{v:1,duration:.5,delay:fe,ease:"none",onUpdate:ve})},currentCard(){return ie.cards.find(fe=>fe.id===ie.currentId)||null},syncSwitch(){if(!ke)return;let fe=ie.order[0],st=!!(fe&&fe.id!==ie.currentId&&ie.onSwitch);ke.hidden=!st,st&&ke.setAttribute("aria-label",`切换到题库：${fe.bank.name}`)},flip(){if(!ie.order.length)return;ie.finishSwipe();let fe=ie.order.shift();ie.order.push(fe);let st={card:fe,t:0,flipFrom:fe.flip,tween:null};st.tween=Jt.to(st,{t:1,duration:.62,ease:"none",onUpdate:ve,onComplete:se(()=>ie.endSwipe(st))}),ie.swipe=st,ie.syncSwitch()},finishSwipe(){let fe=ie.swipe;fe&&(fe.tween.progress(1),fe.tween.kill(),ie.endSwipe(fe))},endSwipe(fe){ie.swipe===fe&&(fe.card.flip=fe.flipFrom-Math.PI<=-2*Math.PI+1e-6?0:fe.flipFrom-Math.PI,ie.swipe=null,ve())},switchToTop(){let fe=ie.order[0];!fe||fe.id===ie.currentId||!ie.onSwitch||(te=document.activeElement===ke,ie.onSwitch(fe.bank.id))},swipePose(fe,st,tt,de){let ae=Gt(fe,0,.45),Ye=Gt(fe,.42,.66),Xe=Gt(fe,.62,1),qe=Ls(0,tt),rt=Ls(st,tt);return{x:wt(wt(qe.x,qe.x-1.05,ae),rt.x,Xe),y:wt(wt(qe.y,qe.y+.16,ae),rt.y,Xe),z:wt(qe.z+Math.sin(Math.PI*Mn(fe/.5))*.55,rt.z-.05*(1-Xe),Ye),flip:de-Math.PI*Gt(fe,.04,.5),tilt:wt(wt(qe.tilt,-10*wi,ae),rt.tilt,Xe),scale:1}},apply(){K.apply();let fe=K.state.lean,st=ie.order.length,tt=ie.swipe,de=tt?Gt(tt.t,.36,.92):1,ae=ie.currentCard();ie.order.forEach((Ye,Xe)=>{let qe;tt&&Ye===tt.card?qe=ie.swipePose(tt.t,st-1,fe,tt.flipFrom):(qe=Ls(Xe+(tt?1-de:0),fe),qe.flip=Ye.flip),Rs(Ye.mesh,qe),Ye.material.uniforms.uInkGrow.value=Ye===ae?ie.ink.v:0}),ue.visible=st>0,ue.position.set(.12,-.18,Ls(Math.max(st-1,0),fe).z-.12),ue.scale.setScalar(1+fe*.18)},dispose(){ie.clearCards(),ie.inkTween&&ie.inkTween.kill(),S(ue,!0),K.dispose()}};return ie}function Ve(){pe||(pe=document.createElement("button"),pe.type="button",pe.className="fx-flip",pe.setAttribute("aria-label","翻看下一个题库"),ke=document.createElement("button"),ke.type="button",ke.className="fx-switch",ke.hidden=!0,ke.textContent="切换到这个题库",pe.addEventListener("click",$e),ke.addEventListener("click",mt))}let $e=Te(()=>{A&&A.kind==="home"&&A.flip()}),mt=Te(()=>{A&&A.kind==="home"&&A.switchToTop()});function U(){pe&&pe.remove(),ke&&ke.remove()}function Q(K){let ue=D(-.42),je=vt(.06),Le=M(1.4,v.shadowLight,.22);Le.position.set(.14,-.26,-.55),ue.tilt.add(Le);let ie=tu(0,.02,1.5),fe=vS(0,0,1.08),st=[],tt=0,de={kind:"quiz",rig:null,sessionId:K.sessionId,index:Number(K.index)||0,total:Number(K.total)||0,mode:K.mode,stack:[],anim:null,lastAnimAt:-1/0,answered:null,frame(ae,Ye){let Xe=e.getBoundingClientRect(),qe=O.getBoundingClientRect(),rt=qe.left+qe.width/2-Xe.left,Tt=qe.top+qe.height/2-Xe.top,He=Math.max(20,Math.min(qe.width*.74,qe.height*.74*(Kr/ji)));return{cx:rt,cy:Tt,ppu:He/(2*Kr),distance:20}},acquire(){let ae=st.pop();if(!ae){tt+=1;let Ye=w({color:tt%2?v.paper:v.paperSoft,edgePx:1,lines:{rect:[.16,.34,.84,.78],rows:3,widthPx:.55,seed:tt*3+1,alpha:.3}});ae={material:Ye,mesh:nt(je,Ye)},ue.tilt.add(ae.mesh)}return ae.material.uniforms.uInkGrow.value=0,ae.material.uniforms.uOpacity.value=1,ae.mesh.visible=!0,ae},release(ae){ae.mesh.visible=!1,ae.material.uniforms.uInkGrow.value=0,st.push(ae)},target(){return hi(de.total-de.index,0,hS)},reconcile(ae){for(;de.stack.length>ae;)de.release(de.stack.pop());for(;de.stack.length<ae;)de.stack.push(de.acquire())},canAnimate(){let ae=performance.now();return ae-de.lastAnimAt<uS?!1:(de.lastAnimAt=ae,!0)},start(ae,Ye,Xe,qe){let rt={kind:ae,card:Ye,t:0,tween:null,...qe};rt.tween=Jt.to(rt,{t:1,duration:Xe,ease:"none",onUpdate:ve,onComplete:se(()=>de.land(rt))}),de.anim=rt},finish(){let ae=de.anim;ae&&(ae.tween.progress(1),ae.tween.kill(),de.land(ae))},land(ae){de.anim===ae&&(de.anim=null,ae.kind==="correct"||ae.kind==="away"?de.release(ae.card):ae.kind==="wrong"&&(ae.card.material.uniforms.uInkGrow.value=0),ve())},deal(){de.reconcile(de.target()),de.stack.length&&de.canAnimate()&&de.start("deal",null,.3+(de.stack.length-1)*.04,{}),ve()},go(ae){let Ye=Number(ae.index)||0;de.total=Number(ae.total)||0,de.mode=ae.mode;let Xe=Ye-de.index;if(Xe===0){de.anim||de.reconcile(de.target());return}de.finish();let qe=de.answered;if(de.index=Ye,de.answered=null,Xe===1&&!qe&&de.stack.length){let rt=de.stack.shift();de.reconcile(de.target()),de.canAnimate()?de.start("away",rt,.42,{}):de.release(rt)}else if(Xe===-1){let rt=de.acquire();de.stack.unshift(rt),de.reconcile(de.target()),de.stack[0]===rt&&de.canAnimate()&&de.start("back",rt,.42,{})}else de.reconcile(de.target());ve()},answer(ae){if(de.mode==="exam"||de.mode==="review"||de.answered||!de.stack.length)return;de.finish(),de.answered=ae?"correct":"wrong";let Ye=de.stack.shift();ae?y(Ye.material,ie,v.brand,-1,.14):(y(Ye.material,fe,v.ink,-1,.1),de.stack.push(Ye)),de.canAnimate()?de.start(ae?"correct":"wrong",Ye,ae?.72:.78,{}):ae&&de.release(Ye),ve()},answerPose(ae,Ye,Xe,qe){let rt=ae.t,Tt=Gt(rt,0,.26),He={x:wt(Ye.x,.12,Tt),y:Ye.y+.3*Tt,z:Ye.z+1.5*Tt,flip:-Math.PI*Gt(rt,.04,.32),tilt:wt(Ye.tilt,2*wi,Tt),scale:1+.12*Tt,opacity:1};if(ae.card.material.uniforms.uInkGrow.value=Gt(rt,.28,.55),ae.kind==="correct"){let k=Gt(rt,.58,1);return He.x+=2.6*k,He.y+=.7*k,He.z+=.3*k,He.tilt+=12*wi*k,He.opacity=1-Gt(rt,.6,.92),He}let Bt=Gt(rt,.54,.72),x=Gt(rt,.7,.82),P=Gt(rt,.8,1);return He.y=wt(wt(He.y,2.1,Bt),Xe.y,P),He.z=wt(wt(He.z,.12,Bt),Xe.z-.06*(1-P),x),He.x=wt(He.x,Xe.x,P),He.scale=wt(He.scale,1,Bt),He.tilt=wt(He.tilt,Xe.tilt,P),He.flip=wt(He.flip,qe?-2*Math.PI:-Math.PI,P),He},awayPose(ae,Ye){return{x:Ye.x+2.4*ae,y:Ye.y+2*ae,z:Ye.z+.6*ae,tilt:Ye.tilt+16*wi*ae,flip:0,scale:1,opacity:1-Gt(ae,.3,1)}},apply(){ue.apply();let ae=de.anim,Ye=de.stack.length,Xe=0;if(ae&&(ae.kind==="correct"||ae.kind==="away")&&(Xe=1-Gt(ae.t,.4,.9)),ae&&ae.kind==="wrong"&&(Xe=1-Gt(ae.t,.66,1)),ae&&ae.kind==="back"&&(Xe=-(1-Gt(ae.t,.1,.8))),de.stack.forEach((qe,rt)=>{if(ae&&qe===ae.card)return;let Tt=Sn(rt+Xe),He=1;if(ae&&ae.kind==="deal"){let Bt=(Ye-1-rt)*.04,x=Mn((ae.t*ae.tween.duration()-Bt)/.3),P=Tt,k={x:P.x+1.6,y:P.y+1.6,z:P.z+1,tilt:P.tilt+18*wi,flip:0,scale:1};Tt=dd(k,P,yn(x)),He=Gt(x,0,.35)}Rs(qe.mesh,Tt),qe.mesh.visible=He>.001,qe.material.uniforms.uOpacity.value=He}),ae&&ae.card){let qe=ae.card,rt;ae.kind==="correct"||ae.kind==="wrong"?rt=de.answerPose(ae,Sn(0),Sn(Math.max(Ye-1,0)),Ye<=1):ae.kind==="away"?rt=de.awayPose(yn(ae.t),Sn(0)):rt=de.awayPose(yn(1-ae.t),Sn(0)),Rs(qe.mesh,rt),qe.mesh.visible=rt.opacity>.001,qe.material.uniforms.uOpacity.value=rt.opacity}Le.visible=Ye>0},dispose(){de.anim&&de.anim.tween.kill(),de.anim=null;for(let ae of[...de.stack,...st])S(ae.mesh,!1);de.stack=[],st.length=0,S(Le,!0),ue.dispose()}};return de}function ne(K){let ue=D(-.5),je=vt(.024),Le=Math.max(0,Math.round(Number(K.total)||0)),ie=hi(Math.round(Number(K.correct)||0),0,Le),fe=Math.min(Le,dS),st=Le?Math.round(ie/Le*fe):0,tt={right:[],wrong:[]},de=[];for(let He=0;He<fe;He+=1){let x=Math.floor((He+1)*st/fe)>Math.floor(He*st/fe)?"right":"wrong",P=tt[x].length,k=w({color:He%2?v.paperSoft:v.paper,edgePx:1.2,lines:{rect:[.16,.36,.84,.78],rows:3,widthPx:.6,seed:He*5+2,alpha:.22}}),V=nt(je,k);V.visible=!1,ue.tilt.add(V);let B={pile:x,level:P,material:k,mesh:V,seed:He+1,delay:.1+He*.07};tt[x].push(B),de.push(B)}let ae=tt.right[tt.right.length-1]||null;ae&&y(ae.material,tu(.04,.02,1.3),v.brand,1,.085);let Ye={right:M(1.32,v.shadowLight,.22),wrong:M(1.55,v.shadowLight,.22)};ue.tilt.add(Ye.right,Ye.wrong);let Xe={t:0},qe={v:0},rt=fe?de[fe-1].delay+.45:0,Tt={kind:"summary",rig:ue,key:`${Le}|${ie}|${K.title??""}`,focus:null,spreadX:1.6,tweens:[],frame(He,Bt){let P=hi(Bt*.36,40,80)*(Kr/ji),k=P/(2*Kr);return Tt.spreadX=Math.max(P*.86,He*.17)/k,Tt.focus={cx:He/2,cy:Bt/2+6},{cx:Tt.focus.cx,cy:Tt.focus.cy,ppu:k,distance:12}},pileX(He){return!tt.right.length||!tt.wrong.length?0:He==="right"?-Tt.spreadX:Tt.spreadX},rest(He){let Bt=P=>hd(He.seed*7+P)-.5,x=He.pile==="wrong";return{x:Tt.pileX(He.pile)+Bt(1)*(x?.36:.05),y:Bt(2)*(x?.28:.05),z:He.level*.03,tilt:Bt(3)*(x?28:2.5)*wi,flip:0,scale:1}},apply(){ue.apply();let He=Xe.t*rt,Bt={right:0,wrong:0};for(let x of de){let P=Mn((He-x.delay)/.45),k=Tt.rest(x),V=be=>hd(x.seed*11+be)-.5,B={x:k.x+V(1)*.5,y:k.y+.75,z:k.z+2,tilt:k.tilt+V(2)*.5,flip:0,scale:1};Rs(x.mesh,dd(B,k,yn(P)));let ge=Gt(P,0,.4);x.mesh.visible=ge>.001,x.material.uniforms.uOpacity.value=ge,Bt[x.pile]+=Gt(P,.5,1)}ae&&(ae.material.uniforms.uInkGrow.value=qe.v);for(let x of["right","wrong"]){let P=Ye[x],k=tt[x].length;P.visible=k>0,P.position.set(Tt.pileX(x)+.12,-.16,-.08),P.material.uniforms.uAlpha.value=k?.22*(.4+.6*Bt[x]/k)*Math.min(1,Bt[x]):0}},start(){if(!fe)return;let He=Jt.to(Xe,{t:1,duration:rt,ease:"none",onUpdate:ve});Tt.tweens.push(He),ae&&Tt.tweens.push(Jt.to(qe,{v:1,duration:.5,delay:rt+.05,ease:"none",onUpdate:ve}))},dispose(){for(let He of Tt.tweens)He.kill();for(let He of de)S(He.mesh,!1);S(Ye.right,!0),S(Ye.wrong,!0),ue.dispose()}};return Tt}function Ae(K){let ue=Math.max(0,Math.round(Number(K.total)||0));return`${ue}|${hi(Math.round(Number(K.correct)||0),0,ue)}|${K.title??""}`}function Re(){if(!A)return;let K=A;A=null,Fe(),K.dispose(),ut(),t.isContextLost()||(h.setRenderTarget(null),h.clear())}function le(K){e.parentElement!==K&&K.prepend(e),O!==K&&(O=K,ce=!0)}let Ee=se(()=>{ce=!0,ve()}),We=se(()=>{document.hidden||(Y=0,A&&ve())}),Ut=new ResizeObserver(Ee);Ut.observe(e),document.addEventListener("visibilitychange",We),window.addEventListener("resize",Ee);function _t(K){Ve(),(!A||A.kind!=="home")&&(Re(),A=ze(),me()),O.append(pe,ke),A.update(K),te&&(te=!1,pe.focus({preventScroll:!0}))}function gr(K){if(U(),!A||A.kind!=="quiz"||A.sessionId!==K.sessionId){Re(),A=Q(K),A.deal();return}A.go(K)}function wr(K){U(),!(A&&A.kind==="summary"&&A.key===Ae(K))&&(Re(),A=ne(K),A.start())}function Tn(){Pe&&Pe.kill(),Pe=null,e.style.opacity=""}function Yi(){Tn(),Re(),I(!1),U(),e.remove(),O=null,ce=!0}return{show:Te((K,ue={})=>{let je=ue&&ue.slot;if(!je||!(K==="home"||K==="quiz"||K==="summary")){Yi();return}K!=="home"&&Tn(),le(je),K==="home"?_t(ue):K==="quiz"?gr(ue):wr(ue),I(K!=="quiz"&&!s),ce=!0,ve()}),hide:Te(()=>{Yi()}),answer:Te((K={})=>{A&&A.kind==="quiz"&&A.answer(!!(K&&K.correct))}),dispose(){if(o)return;let K=[()=>Yi(),()=>{o=!0,Fe()},()=>Ut.disconnect(),()=>document.removeEventListener("visibilitychange",We),()=>window.removeEventListener("resize",Ee),()=>window.removeEventListener("scroll",$),()=>{pe&&pe.removeEventListener("click",$e),ke&&ke.removeEventListener("click",mt),pe=null,ke=null},()=>{R.dispose(),_.material.dispose(),T.material.dispose()},()=>{Ne&&(Ne.width=0,Ne.height=0,Ne=null)},()=>e.removeEventListener("webglcontextlost",F),()=>e.remove(),()=>h.dispose(),()=>{t.isContextLost()||h.forceContextLoss()}];for(let ue of K)try{ue()}catch{}o=!0}}}return Sd(MS);})();
