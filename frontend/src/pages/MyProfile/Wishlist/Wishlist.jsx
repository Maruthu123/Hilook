import React,{useContext} from 'react';
import {Link} from 'react-router-dom';
import {WishlistContext} from '../../../context/WishlistContext';
import ProductCard from '../../../components/ProductCard/ProductCard';
import './Wishlist.css';

export default function Wishlist(){
  const {list}=useContext(WishlistContext);
  return(
    <div className="wishlist-pg">
      <div className="container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          {list.length>0&&<span className="wishlist-count">{list.length} item{list.length!==1?'s':''}</span>}
        </div>
        {list.length===0?(
          <div className="wishlist-empty">
            <i className="fa-regular fa-heart"/>
            <p style={{marginBottom:20}}>Your wishlist is empty</p>
            <Link to="/shop" className="btn-gold">Explore Collections</Link>
          </div>
        ):(
          <div className="wishlist-grid">
            {list.map(item=>(
              <ProductCard key={item.id} {...item} category={item.category||'chudidar'}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
