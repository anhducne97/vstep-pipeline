// vstep_check.js — bộ kiểm của trang "Quy trình ngữ liệu VSTEP" chạy bằng Node (không cần trình duyệt).
// Dùng đúng mã của trang (src/*.js) nên số liệu y hệt trang. Tự sinh bằng tools/build_check.py; đừng sửa tay.
"use strict";
var __fs = require("fs");
var __nullEl = null;
function __list(){ var a = []; a.item = function(){ return null; }; return a; }
var __el = function(){ return {style:{}, classList:{add(){},remove(){},toggle(){},contains(){return false;}}, setAttribute(){}, getAttribute(){return null;}, removeAttribute(){}, hasAttribute(){return false;}, appendChild(){}, removeChild(){}, insertAdjacentHTML(){}, addEventListener(){}, removeEventListener(){}, querySelector(){return null;}, querySelectorAll(){return __list();}, closest(){return null;}, contains(){return false;}, focus(){}, click(){}, getBoundingClientRect(){return {top:0,left:0,width:0,height:0};}, children:[], childNodes:[], dataset:{}, innerHTML:"", textContent:"", value:""}; };
var document = {
  getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return __list(); },
  createElement(){ return __el(); }, createTextNode(){ return __el(); }, addEventListener(){}, removeEventListener(){},
  body:__el(), documentElement:__el(), head:__el(), activeElement:null, title:"", hidden:false, visibilityState:"visible"
};
var window = globalThis; window.document = document; window.addEventListener = function(){}; window.removeEventListener = function(){};
window.__noGate = true; window.scrollTo = function(){}; window.matchMedia = function(){ return {matches:false, addEventListener(){}, addListener(){}}; };
var __store = {}; var localStorage = {getItem(k){ return k in __store ? __store[k] : null; }, setItem(k, v){ __store[k] = String(v); }, removeItem(k){ delete __store[k]; }};
var sessionStorage = {getItem(){ return null; }, setItem(){}, removeItem(){}};
var location = {hash:"", search:"", href:"", pathname:"/", origin:""}; var history = {replaceState(){}, pushState(){}};
var navigator = {userAgent:"node", clipboard:{writeText(){ return Promise.resolve(); }}, language:"vi"};
var requestAnimationFrame = function(f){ return setTimeout(f, 0); }; var alert = function(){}; var confirm = function(){ return true; };
var getComputedStyle = function(){ return {}; }; var MutationObserver = function(){ this.observe = function(){}; this.disconnect = function(){}; };
var Blob = globalThis.Blob || function(){}; var URL = globalThis.URL;
