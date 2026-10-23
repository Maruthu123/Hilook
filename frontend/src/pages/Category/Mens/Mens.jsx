import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import './Mens.css';

const MENS_CATS=[
  {
    label:"Men's Shirts",
    path:'/mens-shirts',
    img:'/image/shirt/shirt4.jpg',
    desc:'Formal & casual shirts'
  },
  {
    label:"Men's Coat",
    path:'/mens-Coat',
    img:'/image/coat/coat3.jpg',
    desc:'Ethnic traditional kurtas'
  },
  {
    label:"Men's Pants",
    path:'/mens-pants',
    img:'/image/pant/pant4.jpg',
    desc:'Trousers & chinos'
  },
];

export default function Mens(){
  return(
    <div className="mens-page">

      <div className="container">

        <div className="mens-hero">
          <span>Men's Collection</span>
          <h1>Modern Menswear</h1>
          <p>Discover premium ethnic & casual wear</p>
        </div>

        <div className="mens-grid">

          {MENS_CATS.map((c,i)=>(
            <motion.div
              key={c.path}
              initial={{opacity:0,scale:0.9}}
              animate={{opacity:1,scale:1}}
              transition={{delay:i*0.1}}
            >

              <Link to={c.path} className="mens-card">

                <img src={c.img} alt={c.label}/>

                <div className="mens-overlay">
                  <h3>{c.label}</h3>
                  <p>{c.desc}</p>
                  <span>Explore →</span>
                </div>

              </Link>

            </motion.div>
          ))}

        </div>

      </div>

    </div>
  );
}