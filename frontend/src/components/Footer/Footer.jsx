
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft-inner container">

        {/* BRAND */}
        <div className="ft-brand">
          <Link to="/" className="ft-brand-name">
            <span className="ft-brand-icon">✦</span>
            <span>
              HI Look
              <strong>Nisha Boutique</strong>
            </span>
          </Link>

          <p className="ft-tagline">
            Elegance in every stitch. Discover beautiful styles,
            handcrafted fashion and timeless designs from Tamil Nadu.
          </p>

          <div className="ft-socials">
            <a
              href="https://wa.me/918144372323"
              target="_blank"
              rel="noreferrer"
              className="ft-social ft-wa"
            >
              <i className="fa-brands fa-whatsapp"></i>
              WhatsApp
            </a>

            <a
              href="https://www.instagram.com/nishaa_hilook/"
              target="_blank"
              rel="noreferrer"
              className="ft-social ft-ig"
            >
              <i className="fa-brands fa-instagram"></i>
              Instagram
            </a>
          </div>

          <div className="ft-trust">
            <span>✧ Carefully Selected Styles</span>
            <span>✧ Fashion With Elegance</span>
          </div>
        </div>

        {/* COLLECTIONS */}
        <div className="ft-col">
          <span className="ft-kicker">EXPLORE</span>
          <h4>Our Collections</h4>

          <Link to="/shop">Shop All <span>↗</span></Link>
          <Link to="/chudidars">Chudidars <span>↗</span></Link>
          <Link to="/blouses">Blouses <span>↗</span></Link>
          <Link to="/frocks">Frocks <span>↗</span></Link>
          <Link to="/lehengas">Lehengas <span>↗</span></Link>
          <Link to="/party">Party Wear <span>↗</span></Link>
          <Link to="/handbag">Handbags <span>↗</span></Link>
          <Link to="/slipper">Slippers <span>↗</span></Link>
          <Link to="/watch">Watches <span>↗</span></Link>
        </div>

        {/* QUICK LINKS */}
        <div className="ft-col">
          <span className="ft-kicker">YOUR ACCOUNT</span>
          <h4>Quick Access</h4>

          <Link to="/about">About Us <span>↗</span></Link>
          <Link to="/contact">Contact Us <span>↗</span></Link>
          <Link to="/size-chart">Size Guide <span>↗</span></Link>
          <Link to="/cart">Shopping Cart <span>↗</span></Link>
          <Link to="/wishlist">Wishlist <span>↗</span></Link>
          <Link to="/orders">My Orders <span>↗</span></Link>
        </div>

        {/* CONTACT */}
        <div className="ft-contact-box">
          <span className="ft-kicker">WE ARE HERE FOR YOU</span>
          <h4>Let's Connect</h4>

          <div className="ft-info">
            <span className="ft-info-icon">
              <i className="fa-solid fa-location-dot"></i>
            </span>
            <p>
              No.1 LR Complex, Ranga Nagar 4th Cross,
              Sunder Nagar, KK Nagar, Trichy.
            </p>
          </div>

          <a className="ft-info" href="tel:+918144372323">
            <span className="ft-info-icon">
              <i className="fa-solid fa-phone"></i>
            </span>
            <span>+91 8144372323</span>
          </a>

          <a
            className="ft-info"
           href="https://mail.google.com/mail/?view=cm&fs=1&to=boutiquehilook965@gmail.com"
          >
            <span className="ft-info-icon">
              <i className="fa-solid fa-envelope"></i>
            </span>
            <span className="ft-email">
              boutiquehilook965@gmail.com
            </span>
          </a>

          <div className="ft-hours">
            <i className="fa-regular fa-clock"></i>
            <span>Monday – Saturday</span>
            <strong>08 AM – 10 PM</strong>
          </div>

          <a
            href="https://wa.me/918144372323?text=Hi%21%20I%20want%20to%20customize%20a%20dress."
            target="_blank"
            rel="noreferrer"
            className="ft-wa-cta"
          >
            <i className="fa-brands fa-whatsapp"></i>
            Chat with Our Team
            <span>↗</span>
          </a>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="ft-bottom">
        <div className="container ft-bottom-inner">
          <p className="ft-copy">
            © {new Date().getFullYear()}{" "}
            <span>Nexora Solution</span> – Thiruchuli.
            All rights reserved.
            <br />
            Made with <span className="ft-heart">♥</span> for fashion lovers.
          </p>

          <div className="ft-bottom-links">
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms of Service</Link>
            <Link to="/size-chart">Size Guide</Link>
          </div>

          <a href="#root" className="ft-top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
