export type Battle = {
  id: string;
  name: string;
  year: string;
  region: "java" | "sumatra";
  x: number; // % position on SVG
  y: number;
  description: string;
  outcome: string;
};

export const battles: Battle[] = [
  { id: "tegalrejo", name: "Pembakaran Tegalrejo", year: "1825", region: "java", x: 52, y: 62,
    description: "Belanda membakar kediaman Diponegoro di Tegalrejo, memicu Perang Jawa.",
    outcome: "Pemicu perang lima tahun." },
  { id: "selarong", name: "Goa Selarong", year: "1825", region: "java", x: 54, y: 68,
    description: "Markas gerilya Diponegoro di perbukitan kapur selatan Yogyakarta.",
    outcome: "Pusat komando Erucakra." },
  { id: "lengkong", name: "Pertempuran Lengkong", year: "1826", region: "java", x: 49, y: 60,
    description: "Kemenangan gerilya Diponegoro yang mempermalukan kompi Belanda.",
    outcome: "Kemenangan strategis Diponegoro." },
  { id: "gawok", name: "Pertempuran Gawok", year: "1826", region: "java", x: 56, y: 64,
    description: "Pertempuran terbuka, Diponegoro nyaris terkepung tetapi lolos.",
    outcome: "Lolos berkat manuver malam." },
  { id: "kasuran", name: "Pertempuran Kasuran", year: "1827", region: "java", x: 53, y: 60,
    description: "Skirmish berdarah saat Belanda menerapkan Benteng Stelsel.",
    outcome: "Kemenangan Pyrrhic Belanda." },
  { id: "magelang", name: "Perundingan Magelang", year: "1830", region: "java", x: 51, y: 58,
    description: "Diponegoro ditangkap dengan tipu muslihat oleh Jenderal De Kock.",
    outcome: "Akhir Perang Jawa." },
  { id: "bonjol_fort", name: "Benteng Bonjol", year: "1832", region: "sumatra", x: 22, y: 32,
    description: "Benteng utama gerakan Padri yang tiga kali jatuh dan direbut kembali.",
    outcome: "Simbol perlawanan Minang." },
  { id: "alahan", name: "Lembah Alahan Panjang", year: "1833", region: "sumatra", x: 24, y: 36,
    description: "Jaringan benteng kecil saling menopang menahan pasukan kolonial.",
    outcome: "Cermin terbalik Benteng Stelsel." },
  { id: "puncak_pato", name: "Plakat Puncak Pato", year: "1837", region: "sumatra", x: 26, y: 38,
    description: "Rekonsiliasi historis Padri & Adat: 'Adat basandi syarak…'",
    outcome: "Front bersatu melawan kolonial." },
  { id: "palupuh", name: "Tipu di Palupuh", year: "1837", region: "sumatra", x: 23, y: 34,
    description: "Imam Bonjol diundang berunding lalu ditangkap.",
    outcome: "Pengasingan ke Pineleng." },
];

export type Artifact = {
  id: string;
  name: string;
  era: string;
  hero: string;
  short: string;
  deepDive: string;
  gradient: string;
};

export const artifacts: Artifact[] = [
  { id: "keris", name: "Keris Kyai Naga Siluman", era: "abad ke-19", hero: "Diponegoro",
    short: "Keris pusaka yang diyakini menemani Pangeran Diponegoro selama gerilya.",
    deepDive: "Bilah berlekuk tiga belas, hulu kayu kemuning diukir motif naga laut. Hilang dirampas Belanda saat penangkapan Magelang 1830, dipajang berabad di Belanda, dan dipulangkan ke Indonesia pada 2020. Kini disimpan di Museum Nasional Jakarta sebagai simbol kembali pulangnya martabat sejarah.",
    gradient: "from-amber-900 to-charcoal" },
  { id: "tombak", name: "Tombak Kyai Rondhan", era: "abad ke-19", hero: "Diponegoro",
    short: "Tombak panjang dengan rantai pengait, simbol panji Erucakra.",
    deepDive: "Mata tombak berbentuk daun kelor, gagangnya terbuat dari kayu jati pilihan. Digunakan dalam pertempuran Gawok 1826. Belum kembali ke Tanah Air.",
    gradient: "from-maroon to-amber-800" },
  { id: "sorban", name: "Sorban Putih Imam Bonjol", era: "1820-an", hero: "Imam Bonjol",
    short: "Lambang kepemimpinan ulama Padri.",
    deepDive: "Sorban berukuran 4 meter dari kapas Minang, dikenakan dalam khutbah dan pertempuran. Replikanya kini dipajang di Museum Adityawarman, Padang.",
    gradient: "from-stone-200 to-stone-500" },
  { id: "naskah", name: "Naskah Tuanku nan Renceh", era: "1810-an", hero: "Imam Bonjol",
    short: "Manuskrip dakwah Padri ditulis dalam aksara Jawi.",
    deepDive: "Berisi delapan pokok pemurnian: melarang sabung ayam, judi, tuak, candu, riba, sumbang, mabuk, dan ria. Salinan tersimpan di Leiden University Library.",
    gradient: "from-amber-100 to-amber-700" },
  { id: "babad", name: "Babad Diponegoro", era: "1831–1832", hero: "Diponegoro",
    short: "Otobiografi Diponegoro yang ditulis selama pengasingan di Manado.",
    deepDive: "Ditulis dalam tembang macapat Jawa, mencatat perjalanan spiritual dan politik sang pangeran. Diakui UNESCO sebagai Memory of the World tahun 2013.",
    gradient: "from-amber-700 to-charcoal" },
  { id: "bedil", name: "Bedil Lantak Padri", era: "1820-an", hero: "Imam Bonjol",
    short: "Senapan lontak yang digunakan pasukan Padri.",
    deepDive: "Dimodifikasi dari senapan dagang Eropa, diperbaiki di bengkel-bengkel surau. Menjadi tulang punggung pertahanan Benteng Bonjol.",
    gradient: "from-stone-700 to-charcoal" },
];

export type BossId = "de_kock" | "van_den_bosch" | "baron_sloet";
export type Boss = {
  id: BossId;
  name: string;
  title: string;
  level: number;
  intro: string;
  victoryQuote: string;
  defeatQuote: string;
};

export const bosses: Boss[] = [
  { id: "de_kock", name: "Hendrik Merkus de Kock", title: "Komandan Benteng Stelsel",
    level: 0, intro: "Ia menanti Anda di Magelang dengan dalih perundingan. Pena dan pedangnya sama tajam.",
    victoryQuote: "“Anda berhasil membaca jebakan sebelum dipasang.”",
    defeatQuote: "“Sang Jenderal menyeret Anda ke pengasingan.”" },
  { id: "van_den_bosch", name: "Johannes van den Bosch", title: "Arsitek Tanam Paksa",
    level: 1, intro: "Ekonomi adalah medan perangnya. Setiap argumen menjadi pajak.",
    victoryQuote: "“Argumen Anda menumbangkan logika eksploitasi.”",
    defeatQuote: "“Kebijakannya mencekik logistik benteng Anda.”" },
  { id: "baron_sloet", name: "Baron Sloet van de Beele", title: "Gubernur Jenderal",
    level: 2, intro: "Stand-off terakhir. Hanya satu yang akan tertulis dalam babad.",
    victoryQuote: "“Tinta sejarah memilih nama Anda.”",
    defeatQuote: "“Babad ditutup dengan nama Anda di kolom kalah.”" },
];

export const levels = [
  { id: "selarong", name: "Hutan Selarong", subtitle: "Perang Jawa · Babak I",
    palette: "from-emerald-950 via-emerald-900 to-stone-900", enemyDensity: 5, supplyDensity: 4 },
  { id: "bonjol", name: "Benteng Bonjol", subtitle: "Perang Padri · Babak II",
    palette: "from-stone-800 via-amber-950 to-stone-900", enemyDensity: 6, supplyDensity: 4 },
  { id: "magelang", name: "Perundingan Magelang", subtitle: "Babak Penghabisan",
    palette: "from-slate-800 via-stone-900 to-charcoal", enemyDensity: 7, supplyDensity: 3 },
];
