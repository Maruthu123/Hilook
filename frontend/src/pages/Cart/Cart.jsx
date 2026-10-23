import React,{useContext,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import {CartContext} from '../../context/CartContext';
import API from '../../api';
import './Cart.css';

export default function Cart(){
  const {items,remove,updateQty,clear,total}=useContext(CartContext);
  const navigate=useNavigate();
  const [coupon,setCoupon]=useState('');
  const [discount,setDiscount]=useState(0);
  const [couponMsg,setCouponMsg]=useState('');
  const [couponErr,setCouponErr]=useState('');
  const shipping=total>=1499?0:99;
  const grand=total-discount+shipping;

  const applyCoupon=async()=>{
    setCouponMsg('');setCouponErr('');
    try{
      const{data}=await API.post('/api/coupons/validate',{code:coupon,orderAmount:total});
      setDiscount(data.discount);setCouponMsg(data.message);
    }catch(e){setCouponErr(e.response?.data?.message||'Invalid coupon');setDiscount(0);}
  };

  if(items.length===0) return(
    <div className="cart-empty">
      <div className="cart-empty-inner">
        <div className="cart-empty-icon"><i className="fa-solid fa-bag-shopping"/></div>
        <h2>Your Cart is Empty</h2>
        <p>Discover our exclusive collections and add your favourites.</p>
        <Link to="/shop" className="btn-gold">Explore Collections</Link>
      </div>
    </div>
  );

  return(
    <div className="cart-pg">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="cart-count">{items.length} item{items.length!==1?'s':''}</span>
        </div>
        <div className="cart-layout">
          <div className="cart-items">
            <AnimatePresence>
              {items.map(item=>(
                <motion.div key={`${item.id}-${item.size}-${item.color}`} className="cart-item" layout
                  initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,height:0,overflow:'hidden'}} transition={{duration:0.25}}>
                  <img src={item.image} alt={item.name} className="ci-img"/>
                  <div className="ci-info">
                    <p className="ci-name">{item.name}</p>
                    <div className="ci-meta">
                      {item.size&&<span>Size: {item.size}</span>}
                      {item.color&&<span>Color: {item.color}</span>}
                    </div>
                    {item.addons?.filter(Boolean).length>0&&<p className="ci-addons">+ {item.addons.filter(Boolean).join(', ')}</p>}
                    <div className="ci-bottom">
                      <div className="ci-qty">
                        <button onClick={()=>updateQty(item.id,item.size,item.color,item.qty-1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={()=>updateQty(item.id,item.size,item.color,item.qty+1)}>+</button>
                      </div>
                      <span className="ci-price">₹{(item.price*item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="ci-del" onClick={()=>remove(item.id,item.size,item.color,item.addons)}>
                    <i className="fa-solid fa-xmark"/>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="cart-actions-row">
              <button onClick={clear} className="clear-btn">Clear Cart</button>
              <Link to="/shop" className="continue-link">← Continue Shopping</Link>
            </div>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-lines">
              <div className="sl"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
              {discount>0&&<div className="sl sl--discount"><span>Discount</span><span>−₹{discount}</span></div>}
              <div className="sl"><span>Shipping</span><span>{shipping===0?'FREE ✓':'₹'+shipping}</span></div>
              <div className="sl sl--total"><span>Total</span><span>₹{grand.toLocaleString()}</span></div>
            </div>
            {shipping>0&&<p className="free-hint">🚚 Add ₹{(1499-total).toLocaleString()} more for FREE shipping!</p>}
            <div className="coupon-wrap">
              <p className="coupon-label">Promo Code</p>
              <div className="coupon-row">
                <input placeholder="ENTER CODE" value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} className="coupon-input"/>
                <button onClick={applyCoupon} className="coupon-apply">Apply</button>
              </div>
              {couponMsg&&<p className="coupon-ok">✓ {couponMsg}</p>}
              {couponErr&&<p className="coupon-err">✗ {couponErr}</p>}
            </div>
            <button className="checkout-go" onClick={()=>navigate('/checkout',{state:{coupon:discount>0?coupon:''}})}>
              Proceed to Checkout →
            </button>
            <p className="safe-tag"><i className="fa-solid fa-lock"/> Secure &amp; Encrypted Checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
