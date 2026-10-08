import{r as e}from"./rolldown-runtime-hePW80VL.js";import{i as t,r as n}from"./framework-D3uuXjLH.js";import r from"./link-Da2A5GAn.js";import{r as i,t as a}from"./Icon-JXLh-nXE.js";import{n as o,t as s}from"./utils-DojpP95n.js";
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var c=e=>e.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase(),l=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),u=e=>{
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let t=l(e);return t.charAt(0).toUpperCase()+t.slice(1)},d=e(t(),1),f=(e,t)=>{
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let n=(0,d.forwardRef)(({className:n,...r},o)=>(0,d.createElement)(a,{ref:o,iconNode:t,className:i(`lucide-${c(u(e))}`,`lucide-${e}`,n),...r}));return n.displayName=u(e),n},p=f(`arrow-left`,[[`path`,{d:`m12 19-7-7 7-7`,key:`1l729n`}],[`path`,{d:`M19 12H5`,key:`x3x0zl`}]]),m=f(`arrow-right`,[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]),h=f(`circle-check`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m16 9-5.5 5.5L8 12`,key:`xofnsj`}]]),g=f(`rotate-ccw`,[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}]]),_=f(`triangle-alert`,[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`,key:`wmoenq`}],[`path`,{d:`M12 9v4`,key:`juzpu7`}],[`path`,{d:`M12 17h.01`,key:`p32p05`}]]),v=e=>typeof e==`boolean`?`${e}`:e===0?`0`:e,y=o,b=(e,t)=>n=>{
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide-react v1.38.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
if(t?.variants==null)return y(e,n?.class,n?.className);let{variants:r,defaultVariants:i}=t,a=Object.keys(r).map(e=>{let t=n?.[e],a=i?.[e];if(t===null)return null;let o=v(t)||v(a);return r[e][o]}),o=n&&Object.entries(n).reduce((e,t)=>{let[n,r]=t;return r===void 0||(e[n]=r),e},{});return y(e,a,t?.compoundVariants?.reduce((e,t)=>{let{class:n,className:r,...a}=t;return Object.entries(a).every(e=>{let[t,n]=e;return Array.isArray(n)?n.includes({...i,...o}[t]):{...i,...o}[t]===n})?[...e,n,r]:e},[]),n?.class,n?.className)},x=n(),S=b(`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold leading-none transition-colors`,{variants:{variant:{default:`border-primary/20 bg-primary text-primary-foreground shadow-sm`,secondary:`border-primary/15 bg-primary/10 text-primary`,outline:`border-border/80 bg-background/70 text-foreground`}},defaultVariants:{variant:`default`}});function C({className:e,variant:t,...n}){return(0,x.jsx)(`div`,{className:s(S({variant:t}),e),...n})}var w={neutral:{icon:`bg-primary/10 text-primary`,border:`border-primary/20`,rail:`bg-primary`,badge:`border-primary/20 bg-primary/10 text-primary`,accent:`text-primary`},warning:{icon:`bg-amber-500/10 text-amber-700 dark:text-amber-300`,border:`border-amber-500/25`,rail:`bg-amber-500`,badge:`border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300`,accent:`text-amber-700 dark:text-amber-300`},danger:{icon:`bg-destructive/10 text-destructive`,border:`border-destructive/25`,rail:`bg-destructive`,badge:`border-destructive/25 bg-destructive/10 text-destructive`,accent:`text-destructive`}};function T({eyebrow:e,title:t,description:n,icon:r,tone:i=`neutral`,actions:a,details:o}){let c=w[i];return(0,x.jsxs)(`section`,{className:s(`overflow-hidden rounded-lg border bg-card shadow-lab`,c.border),children:[(0,x.jsx)(`div`,{className:s(`h-1.5 w-full`,c.rail),"aria-hidden":`true`}),(0,x.jsxs)(`div`,{className:`grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]`,children:[(0,x.jsxs)(`div`,{className:`p-6 sm:p-8`,children:[(0,x.jsx)(`div`,{className:`flex flex-wrap items-center gap-3`,children:(0,x.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,x.jsx)(`div`,{className:s(`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg`,c.icon),children:(0,x.jsx)(r,{className:`h-5 w-5`})}),(0,x.jsx)(C,{variant:`outline`,className:s(`bg-background/70`,c.badge),children:e})]})}),(0,x.jsx)(`h1`,{className:`mt-6 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl`,children:t}),(0,x.jsx)(`p`,{className:`mt-3 max-w-2xl leading-7 text-muted-foreground`,children:n}),a?(0,x.jsx)(`div`,{className:`mt-6 flex flex-wrap gap-3 border-t pt-5`,children:a}):null]}),o?.length?(0,x.jsxs)(`div`,{className:`border-t bg-background/65 p-5 lg:border-l lg:border-t-0`,children:[(0,x.jsxs)(`div`,{className:`flex items-center gap-2 text-sm font-semibold`,children:[(0,x.jsx)(m,{className:s(`h-4 w-4`,c.accent)}),`建议路径`]}),(0,x.jsx)(`div`,{className:`mt-4 divide-y rounded-md border bg-card/70`,children:o.map(e=>(0,x.jsxs)(`div`,{className:`flex gap-3 p-4`,children:[(0,x.jsx)(h,{className:s(`mt-0.5 h-4 w-4 shrink-0`,c.accent)}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`p`,{className:`text-sm font-semibold`,children:e.label}),(0,x.jsx)(`p`,{className:`mt-1 text-sm leading-6 text-muted-foreground`,children:e.text})]})]},e.label))})]}):null]})]})}var E=Object.defineProperty,D=(e,t)=>E(e,`name`,{value:t,configurable:!0});function O(e,t){if(typeof e==`function`)return e(t);e!=null&&(e.current=t)}D(O,`setRef`);function k(...e){return t=>{let n=!1,r=e.map(e=>{let r=O(e,t);return!n&&typeof r==`function`&&(n=!0),r});if(n)return()=>{for(let t=0;t<r.length;t++){let n=r[t];typeof n==`function`?n():O(e[t],null)}}}}D(k,`composeRefs`);function A(...e){return d.useCallback(k(...e),e)}D(A,`useComposedRefs`);var j=Object.defineProperty,M=(e,t)=>j(e,`name`,{value:t,configurable:!0});function N(e){let t=d.forwardRef((t,n)=>{let{children:r,...i}=t,a=null,o=!1,s=[];H(r)&&typeof K==`function`&&(r=K(r._payload)),d.Children.forEach(r,e=>{if(B(e)){o=!0;let t=e,n=`child`in t.props?t.props.child:t.props.children;H(n)&&typeof K==`function`&&(n=K(n._payload)),a=L(t,n),s.push(a?.props?.children)}else s.push(e)}),a?a=d.cloneElement(a,void 0,s):!o&&d.Children.count(r)===1&&d.isValidElement(r)&&(a=r);let c=a?z(a):void 0,l=A(n,c);if(!a){if(r||r===0)throw Error(o?G(e):W(e));return r}let u=R(i,a.props??{});return a.type!==d.Fragment&&(u.ref=n?l:c),d.cloneElement(a,u)});return t.displayName=`${e}.Slot`,t}M(N,`createSlot`);var P=N(`Slot`),F=Symbol.for(`radix.slottable`);function I(e){let t=M(e=>`child`in e?e.children(e.child):e.children,`Slottable`);return t.displayName=`${e}.Slottable`,t.__radixId=F,t}M(I,`createSlottable`);var L=M((e,t)=>{if(`child`in e.props){let t=e.props.child;return d.isValidElement(t)?d.cloneElement(t,void 0,e.props.children(t.props.children)):null}return d.isValidElement(t)?t:null},`getSlottableElementFromSlottable`);function R(e,t){let n={...t};for(let r in t){let i=e[r],a=t[r];/^on[A-Z]/.test(r)?i&&a?n[r]=(...e)=>{let t=a(...e);return i(...e),t}:i&&(n[r]=i):r===`style`?n[r]={...i,...a}:r===`className`&&(n[r]=[i,a].filter(Boolean).join(` `))}return{...e,...n}}M(R,`mergeProps`);function z(e){let t=Object.getOwnPropertyDescriptor(e.props,`ref`)?.get,n=t&&`isReactWarning`in t&&t.isReactWarning;return n?e.ref:(t=Object.getOwnPropertyDescriptor(e,`ref`)?.get,n=t&&`isReactWarning`in t&&t.isReactWarning,n?e.props.ref:e.props.ref||e.ref)}M(z,`getElementRef`);function B(e){return d.isValidElement(e)&&typeof e.type==`function`&&`__radixId`in e.type&&e.type.__radixId===F}M(B,`isSlottable`);var V=Symbol.for(`react.lazy`);function H(e){return typeof e==`object`&&!!e&&`$$typeof`in e&&e.$$typeof===V&&`_payload`in e&&U(e._payload)}M(H,`isLazyComponent`);function U(e){return typeof e==`object`&&!!e&&`then`in e}M(U,`isPromiseLike`);var W=M(e=>`${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`,`createSlotError`),G=M(e=>`${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`,`createSlottableError`),K=d.use,q=b(`inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50`,{variants:{variant:{default:`bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lab`,outline:`border border-input bg-background hover:border-primary/35 hover:bg-primary/10 hover:text-primary`,secondary:`bg-secondary text-secondary-foreground hover:bg-secondary/80`,ghost:`shadow-none hover:bg-accent hover:text-accent-foreground`,link:`h-auto px-0 shadow-none text-primary underline-offset-4 hover:translate-y-0 hover:underline`},size:{default:`h-10 px-4 py-2`,sm:`h-9 px-3`,lg:`h-11 px-5`,icon:`h-10 w-10 px-0`}},defaultVariants:{variant:`default`,size:`default`}}),J=d.forwardRef(({className:e,variant:t,size:n,asChild:r=!1,...i},a)=>(0,x.jsx)(r?P:`button`,{className:s(q({variant:t,size:n,className:e})),ref:a,...i}));J.displayName=`Button`;function Y({error:e,reset:t}){return(0,d.useEffect)(()=>{console.error(`Application route error`,{digest:e.digest})},[e.digest]),(0,x.jsx)(`div`,{className:`relative overflow-hidden`,children:(0,x.jsx)(`div`,{className:`container flex min-h-[72vh] items-center justify-center py-12`,children:(0,x.jsx)(`div`,{className:`w-full max-w-4xl`,children:(0,x.jsx)(T,{eyebrow:`500`,title:`这间屋子暂时打不开`,description:`请求处理时出了点岔子。可以先重试一次，如果还是不行，回门厅继续逛。`,icon:_,tone:`danger`,details:[{label:`重试当前页面`,text:`适合临时网络或渲染异常，页面会重新请求数据。`},{label:`回门厅看看`,text:`离开当前失败状态，工具和随笔都还在。`}],actions:(0,x.jsxs)(x.Fragment,{children:[(0,x.jsxs)(J,{type:`button`,onClick:t,children:[(0,x.jsx)(g,{className:`h-4 w-4`}),`重试`]}),(0,x.jsx)(J,{asChild:!0,variant:`outline`,children:(0,x.jsxs)(r,{href:`/`,children:[(0,x.jsx)(p,{className:`h-4 w-4`}),`回门厅`]})})]})})})})})}export{Y as default};