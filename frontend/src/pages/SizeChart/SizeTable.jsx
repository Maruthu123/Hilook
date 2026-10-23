import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CHARTS } from './sizeData';
import './SizeTable.css';

const TIPS = [
  ['Bust', 'Measure around the fullest part of your chest.'],
  ['Waist', 'Measure around the narrowest part of your waist.'],
  ['Hip', 'Measure around the fullest part of your hips.'],
  ['Length', 'Measure from the shoulder / waist down to where you want it to end.'],
];

/* One shared, themed size-chart page. <SizeTable chart="blouse" /> */
export default function SizeTable({ chart }) {
  const c = CHARTS[chart];
  const [col, setCol] = useState(null);
  if (!c) return null;
  return (
    <div className="szt-pg">
      <div className="szt-wrap">
        <Link to="/size-chart" className="szt-back"><i className="fa-solid fa-arrow-left" /> All size charts</Link>
        <motion.div className="szt-head" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <span className="szt-icon"><i className={`fa-solid ${c.icon}`} /></span>
          <h1>{c.title}</h1>
          <p>All measurements are in <b>inches</b>. Tap a size to highlight its column.</p>
        </motion.div>

        <motion.div className="szt-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="szt-scroll">
            <table className="szt-table">
              <thead>
                <tr>
                  <th className="szt-sticky">Measurement</th>
                  {c.sizes.map((s, i) => <th key={s} className={col === i ? 'hl' : ''} onClick={() => setCol(col === i ? null : i)}>{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {c.rows.map((r) => (
                  <tr key={r.label}>
                    <td className="szt-sticky">{r.label}</td>
                    {r.values.map((v, i) => <td key={i} className={col === i ? 'hl' : ''}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="szt-tips">
          {TIPS.map(([t, d], i) => (
            <motion.div key={t} className="szt-tip" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <b>{t}</b><span>{d}</span>
            </motion.div>
          ))}
        </div>
        <p className="szt-note">Between two sizes? Choose the larger one, or <Link to="/contact">contact us</Link> for custom stitching.</p>
      </div>
    </div>
  );
}
