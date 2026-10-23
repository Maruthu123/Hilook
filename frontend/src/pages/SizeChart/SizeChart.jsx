import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./SizeChart.css";

const charts = [
  { title: "Blouse", icon: "/image/blouse.jpg", path: "/blouse" },
  { title: "Common Size", icon: "/image/common.png", path: "/common-size" },
  { title: "Pencil Bottom", icon: "/image/pencil.png", path: "/pencil-size-chart" },
  { title: "Kurti", icon: "/image/kurthi.png", path: "/kurti-size-chart" },
  { title: "Anarkali", icon: "/image/anarkali.png", path: "/anarkali-chart" },
  { title: "A-Line", icon: "/image/aline.png", path: "/aline-chart" },
  { title: "Gown", icon: "/image/gown.png", path: "/gown-chart" },
  { title: "Saree & Skirt", icon: "/image/saree.png", path: "/saree-chart" },
  { title: "Fish Cut", icon: "/image/fish.jpg", path: "/fish-chart" },
  { title: "Lehenga", icon: "/image/lehenga/lehenga1.jpeg", path: "/lehenga-chart" },
];

export default function SizeChart() {
  return (
    <div className="sizechart-container">
      <motion.div className="sizechart-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="sizechart-eyebrow">Perfect fit guide</span>
        <h1 className="sizechart-title">Size Charts</h1>
        <p>Pick a garment to see exact measurements in inches.</p>
      </motion.div>
      <div className="sizechart-grid">
        {charts.map((c, i) => (
          <motion.div key={c.path} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 5) * 0.06, duration: 0.5 }}>
            <Link to={c.path} className="sizechart-card">
              <div className="sizechart-icon"><img src={c.icon} alt={c.title} loading="lazy" /></div>
              <h3 className="sizechart-card-title">{c.title}</h3>
              <span className="sizechart-btn">View chart <i className="fa-solid fa-arrow-right" /></span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
