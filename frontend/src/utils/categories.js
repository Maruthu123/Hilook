/* ONE place that knows every category's list page + product-detail page.
   Used by Shop, Home, ProductCard and the product detail page, so links never go out of sync. */
export const CATEGORIES = [
  { name: 'Blouses',      list: '/blouses',      model: '/blousemodel',      icon: 'fa-shirt' },
  { name: 'Chudidars',    list: '/chudidars',    model: '/chudidarmodel',    icon: 'fa-person-dress' },
  { name: 'Frocks',       list: '/frocks',       model: '/frockmodel',       icon: 'fa-child-dress' },
  { name: 'Lehengas',     list: '/lehengas',     model: '/lehengamodel',     icon: 'fa-crown' },
  { name: 'Party Wear',   list: '/party',        model: '/partymodel',       icon: 'fa-champagne-glasses' },
  { name: 'Handbags',     list: '/handbag',      model: '/handbagmodel',     icon: 'fa-bag-shopping' },
  { name: 'Slippers',     list: '/slipper',      model: '/slippermodel',     icon: 'fa-shoe-prints' },
  { name: 'Watches',      list: '/watch',        model: '/watchmodel',       icon: 'fa-clock' },
  { name: "Men's Shirts", list: '/mens-shirts',  model: '/mensshirtsmodel',  icon: 'fa-user-tie' },
  { name: "Men's Kurta",  list: '/mens-kurta',   model: '/menskurtamodel',   icon: 'fa-user' },
  { name: "Men's Pants",  list: '/mens-pants',   model: '/menspantsmodel',   icon: 'fa-user' },
];

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
const ALIAS = {
  blouse: 'Blouses', blouses: 'Blouses', chudidar: 'Chudidars', chudidars: 'Chudidars',
  frock: 'Frocks', frocks: 'Frocks', lehenga: 'Lehengas', lehengas: 'Lehengas',
  party: 'Party Wear', partywear: 'Party Wear', handbag: 'Handbags', handbags: 'Handbags',
  slipper: 'Slippers', slippers: 'Slippers', watch: 'Watches', watchs: 'Watches', watches: 'Watches',
  mensshirts: "Men's Shirts", mensshirt: "Men's Shirts", menskurta: "Men's Kurta", menspants: "Men's Pants",
};

/** "Blouse", "party wear", "mensshirts", "Men's Shirts" … → the category object (or undefined) */
export function resolveCategory(name) {
  const full = ALIAS[norm(name)];
  return CATEGORIES.find((c) => c.name === full);
}

export const modelPath = (category, productId) => `${resolveCategory(category)?.model || '/shop'}/${productId}`;
export const listPath = (category) => resolveCategory(category)?.list || '/shop';
