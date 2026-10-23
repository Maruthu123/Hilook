import React from 'react';
import {BrowserRouter,Routes,Route,useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';
import ScrollReveal from './components/ScrollReveal';
import {CartProvider} from './context/CartContext';
import {AuthProvider} from './context/AuthContext';
import {WishlistProvider} from './context/WishlistContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollTop from './components/ScrollTop';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import Login from './pages/Auth/Login';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import SizeChart from './pages/SizeChart/SizeChart';

import AdminDashboard from './pages/Admin/AdminDashboard';

import Blouse from "./pages/SizeChart/SizeContent/blouse";
import CommonSize from "./pages/SizeChart/SizeContent/CommonSize";
import PencilChart from "./pages/SizeChart/SizeContent/PencilChart";
import KurtiChart from "./pages/SizeChart/SizeContent/KurtiChart";
import AnarkaliChart from "./pages/SizeChart/SizeContent/AnarkaliChart";
import AlineChart from "./pages/SizeChart/SizeContent/AlineChart";
import GownChart from "./pages/SizeChart/SizeContent/GownChart";
import SareeChart from "./pages/SizeChart/SizeContent/SareeChart";
import FishChart from "./pages/SizeChart/SizeContent/FishChart";
import LehengaChart from "./pages/SizeChart/SizeContent/LehengaChart";

// Women's categories
import Chudidars from './pages/Category/Chudidars/Chudidars';
import ChudidarModel from './pages/Category/Chudidars/ChudidarModel';
import Blouses from './pages/Category/Blouses/Blouses';
import BlouseModel from './pages/Category/Blouses/BlouseModel';
import Frocks from './pages/Category/Frocks/Frocks';
import CategoryModel from './pages/Category/CategoryModel';
import Lehengas from './pages/Category/Lehengas/Lehengas';
import Party from './pages/Category/Party/Party';
import Handbag from './pages/Category/Handbag/Handbags';
import Slipper from './pages/Category/Slipper/Slippers';
import Watch from './pages/Category/Watch/Watchs';

// Men's categories
import Mens from './pages/Category/Mens/Mens';
import MensShirts from './pages/Category/Mens/MensShirts';
import MensKurta from './pages/Category/Mens/MensKurta';
import MensPants from './pages/Category/Mens/MensPants';

import Account from './pages/MyProfile/Account/Account';
import Orders from './pages/MyProfile/Orders/Orders';
import Wishlist from './pages/MyProfile/Wishlist/Wishlist';
import HappyCustomer from "./pages/HappyCustomer/HappyCustomer";
import SchoolUniform from "./pages/SchoolUniform/SchoolUniform";
function AppInner(){
  const{pathname}=useLocation();
  const noFooter=pathname.startsWith('/admin');
  return(
    <>
      <ScrollTop/>
      <ScrollReveal/>
      <Navbar/>
      <motion.div key={pathname} className="page-shell" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.45,ease:[0.22,1,0.36,1]}}>
      <Routes>
        <Route path="/blouse" element={<Blouse />} />
        <Route path="/common-size" element={<CommonSize />} />
        <Route path="/pencil-size-chart" element={<PencilChart />} />
        <Route path="/kurti-size-chart" element={<KurtiChart />} />
        <Route path="/anarkali-chart" element={<AnarkaliChart />} />
        <Route path="/aline-chart" element={<AlineChart />} />
        <Route path="/gown-chart" element={<GownChart />} />
        <Route path="/saree-char" element={<SareeChart />} />
        <Route path="/saree-chart" element={<SareeChart />} />
        <Route path="/fish-chart" element={<FishChart />} />
        <Route path="/lehenga-chart" element={<LehengaChart />} />
        <Route path="/" element={<Home/>}/>
        <Route path="/shop" element={<Shop/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/size-chart" element={<SizeChart/>}/>

        {/* Women's */}
        <Route path="/chudidars" element={<Chudidars/>}/>
        <Route path="/chudidarmodel/:id" element={<ChudidarModel/>}/>
        <Route path="/blouses" element={<Blouses/>}/>
        <Route path="/blouses/:type" element={<Blouses/>}/>
        <Route path="/blousemodel/:id" element={<BlouseModel/>}/>
        <Route path="/frocks" element={<Frocks/>}/>
        <Route path="/frockmodel/:id" element={<CategoryModel cat="Frocks" path="frocks"/>}/>
        <Route path="/lehengas" element={<Lehengas/>}/>
        <Route path="/lehengamodel/:id" element={<CategoryModel cat="Lehengas" path="lehengas"/>}/>
        <Route path="/party" element={<Party/>}/>
        <Route path="/partymodel/:id" element={<CategoryModel cat="Party Wear" path="party"/>}/>
        <Route path="/handbag" element={<Handbag/>}/>
        <Route path="/handbagmodel/:id" element={<CategoryModel cat="Handbags" path="handbag"/>}/>
        <Route path="/slipper" element={<Slipper/>}/>
        <Route path="/slippermodel/:id" element={<CategoryModel cat="Slippers" path="slipper"/>}/>
        <Route path="/watch" element={<Watch/>}/>
        <Route path="/watchmodel/:id" element={<CategoryModel cat="Watchs" path="watch"/>}/>

        {/* Men's */}
        <Route path="/mens" element={<Mens/>}/>
        <Route path="/mens-shirts" element={<MensShirts/>}/>
        <Route path="/mensshirtsmodel/:id" element={<CategoryModel cat="Men's Shirts" path="mensshirts"/>}/>
        <Route path="/mens-kurta" element={<MensKurta/>}/>
        <Route path="/menskurtamodel/:id" element={<CategoryModel cat="Men's Kurta" path="menskurta"/>}/>
        <Route path="/mens-pants" element={<MensPants/>}/>
        <Route path="/menspantsmodel/:id" element={<CategoryModel cat="Men's Pants" path="menspants"/>}/>

        {/* Profile */}
        <Route path="/account" element={<ProtectedRoute><Account/></ProtectedRoute>}/>
        <Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
        <Route path="/track-order" element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
        <Route path="/wishlist" element={<Wishlist/>}/>

        {/* Admin — only the admin account can open this (everybody else is sent to the login page) */}
        <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboard/></ProtectedRoute>}/>

        <Route path="/happycustomer" element={<HappyCustomer />} />
      <Route path="/schooluniform" element={<SchoolUniform />} />
      </Routes>
      </motion.div>
      {!noFooter&&<Footer/>}
    </>
  );
}

export default function App(){
  return(
    <AuthProvider><CartProvider><WishlistProvider>
      {/* future flags — React Router v7 warnings போகும் */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppInner/>
      </BrowserRouter>
    </WishlistProvider></CartProvider></AuthProvider>
  );
}