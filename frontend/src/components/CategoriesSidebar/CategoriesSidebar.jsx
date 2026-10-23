import React,{useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import './CategoriesSidebar.css';

const WOMEN_CATS=[
  {label:'All Products',path:'/shop',icon:'fa-solid fa-store'},
  {label:'Chudidars',path:'/chudidars',icon:'fa-solid fa-shirt'},
  {label:'Blouses',path:'/blouses',icon:'fa-solid fa-vest'},
  {label:'Frocks',path:'/frocks',icon:'fa-solid fa-person-dress'},
  {label:'Lehengas',path:'/lehengas',icon:'fa-solid fa-star'},
  {label:'Party Wear',path:'/party',icon:'fa-solid fa-wand-magic-sparkles'},
  {label:'Handbags',path:'/handbag',icon:'fa-solid fa-bag-shopping'},
  {label:'Slippers',path:'/slipper',icon:'fa-solid fa-shoe-prints'},
  {label:'Watches',path:'/watch',icon:'fa-solid fa-clock'},
];
const MENS_CATS=[
  {label:"Men's Shirts",path:'/mens-shirts',icon:'fa-solid fa-shirt'},
  {label:"Men's Kurta",path:'/mens-kurta',icon:'fa-solid fa-user-tie'},
  {label:"Men's Pants",path:'/mens-pants',icon:'fa-solid fa-socks'},
];

export default function CategoriesSidebar(){
  const{pathname}=useLocation();
  const[mensOpen,setMensOpen]=useState(pathname.startsWith('/mens'));
  return(
    <aside className="cat-sidebar">
      <div className="cat-sidebar-inner">
        <h3>Women's</h3>
        {WOMEN_CATS.map(c=>(
          <Link key={c.path} to={c.path} className={`cat-sidebar-link ${pathname===c.path?'active':''}`}>
            <i className={c.icon}/> {c.label}
          </Link>
        ))}
        <div className="cat-section-divider"/>
        <button className="cat-mens-toggle" onClick={()=>setMensOpen(o=>!o)}>
          <span>👔 Men's</span>
          <i className={`fa-solid fa-chevron-${mensOpen?'up':'down'}`} style={{fontSize:11}}/>
        </button>
        {mensOpen&&MENS_CATS.map(c=>(
          <Link key={c.path} to={c.path} className={`cat-sidebar-link mens ${pathname===c.path?'active':''}`}>
            <i className={c.icon}/> {c.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
