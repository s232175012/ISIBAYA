const WHATSAPP_NUMBER = "27720628542";
const ADMIN_USERNAME = "isibaya";
const ADMIN_PASSWORD = "farm2026";

const firebaseConfig = {
  apiKey: "AIzaSyClJ0ov7uK_DUvz2iiOwZk4t4uLf58wfg8",
  authDomain: "complicated-41f0a.firebaseapp.com",
  projectId: "complicated-41f0a",
  storageBucket: "complicated-41f0a.firebasestorage.app",
  messagingSenderId: "708397354616",
  appId: "1:708397354616:web:8187acce98d9cea4d0678d"
};

function toggleMenu(){ document.getElementById('mobileNav').classList.toggle('open'); }

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let productsData = [];
let isAdminLogged = false;
let pendingImageBase64 = null;

// LOAD ONLY YOUR IMAGES - NO UNSPLASH
db.collection("isibaya_livestock").onSnapshot(snap=>{
  if(snap.empty){
    const starter=[
      {id:1,name:"Brahman Cattle",price:7500,stock:15,image:"images/brama1.png"},
      {id:2,name:"Brahman Cattle",price:4000,stock:12,image:"images/brama2.png"},
    ];
    starter.forEach(p=>db.collection("isibaya_livestock").doc(String(p.id)).set(p));
  }else{
    productsData=snap.docs.map(d=>d.data()).sort((a,b)=>a.id-b.id);
    render(); if(isAdminLogged) refreshAdminList();
  }
});

document.addEventListener('DOMContentLoaded',()=>{
  const f=document.getElementById('newFile');
  if(f) f.addEventListener('change',e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        const maxW=700; let w=img.width,h=img.height;
        if(w>maxW){h=h*(maxW/w); w=maxW;}
        canvas.width=w; canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        pendingImageBase64=canvas.toDataURL('image/jpeg',0.65);
        const prev=document.getElementById('previewImg');
        prev.src=pendingImageBase64; prev.style.display='block';
      }; img.src=ev.target.result;
    }; reader.readAsDataURL(file);
  });
});

function render(){
  const c=document.getElementById('products');
  if(!c) return;
  c.innerHTML="";
  productsData.forEach(p=>{
    c.innerHTML+=`<div class="card"><img src="${p.image}" alt="${p.name}" onerror="this.src='images/farmLogo.jpeg'"><div class="card-body"><h3>${p.name}</h3><div class="price">From R${p.price}</div><span class="in">${p.stock} Available ✅</span><div style="margin-top:auto;padding-top:10px"><a class="btn" style="padding:10px 12px;font-size:12px;width:100%" href="https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Isibaya%20I%20want%20${encodeURIComponent(p.name)}%20-%20R${p.price}">Enquire WhatsApp</a></div></div></div>`;
  });
}
function closeModal(id){document.getElementById(id).classList.add('hidden')}
function openAdminLogin(){if(isAdminLogged){document.getElementById('adminModal').classList.remove('hidden');return;}document.getElementById('adminLoginModal').classList.remove('hidden');}
function doAdminLogin(){
  const u=document.getElementById('adminUser').value.trim();
  const p=document.getElementById('adminPass').value.trim();
  if(u===ADMIN_USERNAME && p===ADMIN_PASSWORD){
    isAdminLogged=true; closeModal('adminLoginModal');
    document.getElementById('adminWelcome').innerText="— Welcome "+u;
    document.getElementById('adminModal').classList.remove('hidden'); refreshAdminList();
  }else{document.getElementById('loginError').innerText="Wrong username or password"}
}
function refreshAdminList(){
  document.getElementById('adminList').innerHTML=productsData.map(p=>`
    <div style="display:flex;gap:8px;align-items:center;border:2px solid #111;padding:8px;border-radius:10px;margin:6px 0">
      <img src="${p.image}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1.5px solid #111">
      <div style="flex:1"><b>${p.name}</b><br><small>${p.stock} left • R${p.price}</small></div>
      <button onclick="updateStock(${p.id},-1)" style="padding:8px 10px;border:2px solid #111;border-radius:8px">-</button>
      <button onclick="updateStock(${p.id},1)" style="padding:8px 10px;border:2px solid #111;border-radius:8px">+</button>
      <button onclick="deleteProduct(${p.id})" style="color:red;border:none;background:none;font-size:20px">🗑️</button>
    </div>`).join('');
}
async function updateStock(id,d){const p=productsData.find(x=>x.id==id);await db.collection("isibaya_livestock").doc(String(id)).update({stock:Math.max(0,p.stock+d)});}
async function addNewProduct(){
  const name=document.getElementById('newName').value.trim();
  const price=parseInt(document.getElementById('newPrice').value)||0;
  const stock=parseInt(document.getElementById('newStock').value)||0;
  if(!name||!pendingImageBase64){alert("Name + Photo needed");return;}
  const id=Date.now();
  await db.collection("isibaya_livestock").doc(String(id)).set({id,name,price,stock,image:pendingImageBase64});
  document.getElementById('newName').value="";document.getElementById('newPrice').value="";document.getElementById('newStock').value="";document.getElementById('newFile').value="";document.getElementById('previewImg').style.display="none";pendingImageBase64=null;
  alert("Saved! 🔥");
}
async function deleteProduct(id){if(!confirm("Delete this item?"))return; await db.collection("isibaya_livestock").doc(String(id)).delete();}
function adminLogout(){isAdminLogged=false;closeModal('adminModal')}
function sendWA(e){e.preventDefault();let n=document.getElementById('qName').value;let p=document.getElementById('qPhone').value;let need=document.getElementById('qNeed').value;let m=document.getElementById('qMsg').value;let t=`Hello Isibaya 🐄%0AName: ${n}%0APhone: ${p}%0ANeed: ${need}%0AMsg: ${m}`;window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${t}`,'_blank');}
document.addEventListener('click',(e)=>{const nav=document.getElementById('mobileNav');const ham=document.querySelector('.hamburger');if(nav&&nav.classList.contains('open')&&!nav.contains(e.target)&&!ham.contains(e.target)){nav.classList.remove('open');}});