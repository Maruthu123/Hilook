/* ALL size-chart numbers live here (inches). Every chart page renders through <SizeTable/>,
   so colours, spacing and alignment are identical everywhere. Edit numbers in this one file. */
const S12 = ["XS","S","M","L","XL","2XL","3XL","4XL","5XL","6XL","7XL","8XL"];
const BUST = [34,36,38,40,42,44,46,48,50,52,54,56];
const WAIST_T = [28,30,32,34,36,38,40,42,44,46,48,50];
const HIP_T = [36,38,40,42,44,46,48,50,52,54,56,58];
const SHOULDER = [13.5,14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19];
const WAIST_B = [26,28,30,32,34,36,38,40,42,44,46,48];
const HIP_B = [34,36,38,40,42,44,46,48,50,52,54,56];
const BRA = ["30A&30B","30C&D/32A","32C&D/34A","34C&D/36A","36C&D/38A","38C&D/40A","40C&D/42A","42C&D/44A","44C&D/46A","46C&D/48A","48C&D/50A","50C&D/52A"];

export const CHARTS = {
  blouse: { title: 'Blouse Size Chart', icon: 'fa-shirt', sizes: S12, rows: [
    { label: 'Bust', values: BUST }, { label: 'Shoulder', values: [13.5,14,14.5,15,15.5,16,16.5,17,17.25,17.5,17.75,18] },
    { label: 'V Neck', values: [6,6,6,6.5,6.5,7,7,7,7.5,7.5,8,8] }, { label: 'Boat Neck', values: Array(12).fill(3.5) },
    { label: 'Normal Neck', values: [5.5,5.5,5.5,5.5,6,6,6,6,6.25,6.25,6.5,6.5] }, { label: 'Full Sleeve', values: Array(12).fill(20) },
    { label: '3/4 Sleeve', values: Array(12).fill(15) }, { label: 'Elbow Sleeve', values: Array(12).fill(12.5) },
    { label: 'Short Sleeve', values: Array(12).fill(5) },
    { label: 'Bra Size', values: ['30A / 30B','30C / 32A','32C / 34A','34C / 36A','36C / 38A','38C / 40A','40C / 42A','42C / 44A','44C / 46A','46C / 48A','48C / 50A','50C / 52A'] },
  ]},
  common: { title: 'Common Size Chart', icon: 'fa-ruler-combined', sizes: ['XS','S','M','L','XL','2XL','3XL','4XL'], rows: [
    { label: 'Length', values: Array(8).fill('-') }, { label: 'Bust', values: [34,36,38,40,42,44,46,48] },
    { label: 'Shoulder', values: [13.5,14,14.5,15,15.5,16,16.5,17] }, { label: 'V Neck', values: [6,6,6,6.5,6.5,7,7,7] },
    { label: 'Boat Neck', values: Array(8).fill(3.5) }, { label: 'Normal Neck', values: [5.5,5.5,5.5,5.5,5.5,6,6,6] },
    { label: 'Full Sleeve', values: Array(8).fill(20) }, { label: '3/4th Sleeve', values: Array(8).fill(15) },
    { label: 'Elbow Sleeve', values: Array(8).fill(12.5) }, { label: 'Short Sleeve', values: Array(8).fill(5) },
    { label: 'Bra Size', values: BRA.slice(0, 8) },
  ]},
  pencil: { title: 'Pencil Bottom Size Chart', icon: 'fa-ruler-vertical', sizes: S12, rows: [
    { label: 'Waist', values: WAIST_B }, { label: 'Hip', values: HIP_B }, { label: 'Thigh', values: [20,21,22,23,24,25,26,27,28,29,30,31] },
    { label: 'Knee', values: [14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19,19.5] }, { label: 'Length', values: [37,38,38,39,39,40,40,41,41,42,42,43] },
  ]},
  kurti: { title: 'Kurti Size Chart', icon: 'fa-person-dress', sizes: S12, rows: [
    { label: 'Bust', values: BUST }, { label: 'Shoulder', values: SHOULDER },
    { label: 'Normal Neck', values: [5.5,5.5,5.5,5.5,6,6,6,6,6.5,6.5,6.5,6.5] },
    { label: 'Elbow Sleeve', values: [12.5,12.5,12.5,12.5,12.5,12.5,12.5,12.5,13,13,13,13] }, { label: 'Bra Size', values: BRA },
  ]},
  anarkali: { title: 'Anarkali Size Chart', icon: 'fa-wand-magic-sparkles', sizes: S12, rows: [
    { label: 'Bust', values: BUST }, { label: 'Waist', values: WAIST_T }, { label: 'Shoulder', values: SHOULDER },
    { label: 'Length', values: [50,51,52,53,54,55,55,56,57,58,58,59] },
  ]},
  aline: { title: 'A-Line Size Chart', icon: 'fa-vest', sizes: S12, rows: [
    { label: 'Bust', values: BUST }, { label: 'Waist', values: WAIST_T }, { label: 'Hip', values: HIP_T },
    { label: 'Length', values: [48,49,50,51,52,53,54,55,56,57,58,59] },
  ]},
  gown: { title: 'Gown Size Chart', icon: 'fa-crown', sizes: S12, rows: [
    { label: 'Bust', values: BUST }, { label: 'Waist', values: WAIST_T }, { label: 'Hip', values: HIP_T },
    { label: 'Length', values: [55,56,57,58,59,60,60,61,62,63,64,65] },
  ]},
  saree: { title: 'Saree & Skirt Size Chart', icon: 'fa-gem', sizes: S12, rows: [
    { label: 'Waist', values: WAIST_B }, { label: 'Hip', values: HIP_B }, { label: 'Skirt Length', values: [38,39,39,40,40,41,41,42,42,43,43,44] },
  ]},
  fish: { title: 'Fish Cut Size Chart', icon: 'fa-fish', sizes: S12, rows: [
    { label: 'Waist', values: WAIST_B }, { label: 'Hip', values: HIP_B },
    { label: 'Knee', values: [14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19,19.5] }, { label: 'Length', values: [39,40,41,42,43,44,45,46,47,48,49,50] },
  ]},
  lehenga: { title: 'Lehenga Size Chart', icon: 'fa-star', sizes: S12, rows: [
    { label: 'Waist', values: WAIST_B }, { label: 'Hip', values: HIP_B }, { label: 'Length', values: [40,41,42,43,44,45,45,46,46,47,47,48] },
  ]},
};
