export type Hero = {
  id: "diponegoro" | "bonjol";
  name: string;
  title: string;
  era: string;
  region: string;
  portraitGradient: string;
  intro: string;
  sections: { heading: string; body: string }[];
  timeline: { year: string; event: string }[];
  strategy: { title: string; detail: string }[];
};

export const heroes: Hero[] = [
  {
    id: "diponegoro",
    name: "Pangeran Diponegoro",
    title: "Sang Pangeran dari Tegalrejo",
    era: "Perang Jawa · 1825 – 1830",
    region: "Yogyakarta, Tanah Jawa",
    portraitGradient: "from-maroon to-charcoal",
    intro:
      "Lahir di Yogyakarta pada 11 November 1785, Bendara Raden Mas Antawirya — kelak dikenal sebagai Pangeran Diponegoro — adalah putra sulung Sultan Hamengkubuwana III. Ia menolak takhta dan memilih hidup sederhana di Tegalrejo, mendalami agama, sastra Jawa, dan mistisisme.",
    sections: [
      {
        heading: "Masa Muda di Tegalrejo",
        body:
          "Diasuh oleh nenek buyutnya, Ratu Ageng, di pesantren Tegalrejo, Diponegoro tumbuh jauh dari intrik istana. Ia tekun mempelajari Al-Qur'an, kitab-kitab Jawi, dan tradisi sufistik. Sikap zuhud inilah yang membentuk wibawa moralnya di mata rakyat — seorang pangeran yang berbicara dengan bahasa petani.",
      },
      {
        heading: "Pemicu Perang & Patok Anjir",
        body:
          "Pada Mei 1825, pemerintah kolonial Belanda memasang patok-patok anjir di tanah leluhur Diponegoro di Tegalrejo untuk pembangunan jalan tanpa izin. Tindakan itu menjadi percikan terakhir di tengah pajak yang menindas dan kemerosotan martabat keraton. Diponegoro mencabut patok itu — dan bersamanya, mencabut perdamaian di Tanah Jawa.",
      },
      {
        heading: "Goa Selarong: Markas Sang Ratu Adil",
        body:
          "Setelah Tegalrejo dibakar pasukan Belanda pada 20 Juli 1825, Diponegoro mundur ke Goa Selarong di perbukitan kapur selatan Yogyakarta. Dari gua sederhana inilah ia memproklamirkan diri sebagai Erucakra — Ratu Adil yang dijanjikan — dan menyusun strategi perang lima tahun yang akan menguras kas kolonial Belanda hingga 25 juta gulden.",
      },
      {
        heading: "Pengkhianatan di Magelang",
        body:
          "Pada 28 Maret 1830, di bawah dalih perundingan damai bulan Ramadan, Jenderal De Kock menjebak Diponegoro di Magelang. Ia ditangkap, dibuang ke Manado, lalu ke Benteng Rotterdam di Makassar. Di sana ia menulis Babad Diponegoro hingga wafat pada 8 Januari 1855 — pena menjadi pedang terakhirnya.",
      },
    ],
    timeline: [
      { year: "1785", event: "Lahir di Yogyakarta sebagai putra Sultan Hamengkubuwana III." },
      { year: "1812", event: "Menolak diangkat sebagai putra mahkota; memilih Tegalrejo." },
      { year: "1825", event: "Pemasangan patok anjir; Tegalrejo dibakar; perang dimulai." },
      { year: "1826", event: "Kemenangan gerilya di Lengkong dan Gawok." },
      { year: "1827", event: "Belanda menerapkan strategi Benteng Stelsel oleh Jenderal De Kock." },
      { year: "1830", event: "Penangkapan di Magelang pada 28 Maret." },
      { year: "1855", event: "Wafat di Benteng Rotterdam, Makassar." },
    ],
    strategy: [
      {
        title: "Perang Gerilya Semesta",
        detail:
          "Memanfaatkan medan pegunungan, hutan jati, dan dukungan ulama-petani. Pasukan bergerak cepat dalam unit-unit kecil yang melebur ke desa setelah serangan.",
      },
      {
        title: "Legitimasi Religius",
        detail:
          "Mengangkat panji Ratu Adil dan jihad fi sabilillah, menyatukan bangsawan, kiai, dan rakyat di bawah satu narasi sakral.",
      },
      {
        title: "Jaringan Pesantren",
        detail:
          "Pesantren-pesantren menjadi simpul logistik, intelijen, dan rekrutmen — sebuah jaringan tak kasatmata yang sulit dipetakan kolonial.",
      },
    ],
  },
  {
    id: "bonjol",
    name: "Tuanku Imam Bonjol",
    title: "Singa dari Alam Minangkabau",
    era: "Perang Padri · 1803 – 1838",
    region: "Bonjol, Sumatra Barat",
    portraitGradient: "from-charcoal to-maroon",
    intro:
      "Muhammad Syahab — yang kemudian bergelar Tuanku Imam Bonjol — lahir di Bonjol pada 1772. Ulama, ahli strategi, dan pemimpin gerakan Padri yang berusaha memurnikan praktik keislaman di tanah Minangkabau, lalu berbalik menjadi panglima tertinggi melawan kolonialisme Belanda.",
    sections: [
      {
        heading: "Akar Gerakan Padri",
        body:
          "Pulang dari Mekah pada 1803, tiga haji Minang — Haji Miskin, Haji Sumanik, dan Haji Piobang — membawa semangat pembaruan Wahabi. Mereka menentang adat sabung ayam, judi, tuak, dan praktik matrilineal yang dianggap menyimpang. Tuanku Imam Bonjol bergabung dan menjadi salah satu dari delapan harimau nan salapan — dewan ulama pemimpin gerakan.",
      },
      {
        heading: "Benteng Bonjol",
        body:
          "Di lembah subur dikelilingi perbukitan, Imam Bonjol mendirikan benteng pertahanan dari tanah, bambu runcing, dan ranjau alam. Benteng Bonjol menjadi simbol perlawanan: tiga kali jatuh, tiga kali direbut kembali. Setiap dindingnya menyimpan kisah surau yang menjadi barak dan kitab yang menjadi peta perang.",
      },
      {
        heading: "Persatuan Adat & Agama",
        body:
          "Ketika Belanda mengintervensi pada 1821 dengan dalih membantu kaum Adat, Imam Bonjol melihat ancaman yang lebih besar. Ia menempa Plakat Puncak Pato (1837) — rekonsiliasi historis antara kaum Padri dan kaum Adat di bawah panji 'Adat basandi syarak, syarak basandi Kitabullah'.",
      },
      {
        heading: "Tipu Muslihat & Pengasingan",
        body:
          "Pada 28 Oktober 1837, Belanda mengundang Imam Bonjol berunding di Palupuh dengan jaminan keselamatan. Ia datang — dan ditangkap. Diasingkan ke Cianjur, lalu Ambon, lalu Manado, ia wafat di Lotak, Pineleng pada 6 November 1864. Tubuhnya dikubur jauh dari ranah Minang, namun namanya kembali ke setiap surau.",
      },
    ],
    timeline: [
      { year: "1772", event: "Lahir di Bonjol, Pasaman, Sumatra Barat." },
      { year: "1803", event: "Gerakan Padri dimulai; Imam Bonjol bergabung." },
      { year: "1821", event: "Belanda intervensi; perang berubah arah melawan kolonial." },
      { year: "1832", event: "Benteng Bonjol direbut Belanda untuk pertama kalinya." },
      { year: "1833", event: "Imam Bonjol merebut kembali benteng dalam serangan malam." },
      { year: "1837", event: "Plakat Puncak Pato; benteng jatuh untuk terakhir kalinya." },
      { year: "1864", event: "Wafat dalam pengasingan di Pineleng, Minahasa." },
    ],
    strategy: [
      {
        title: "Benteng Stelsel Minang",
        detail:
          "Jaringan benteng-benteng kecil saling menopang di sepanjang lembah Alahan Panjang — sebuah cermin terbalik dari taktik Belanda di Jawa.",
      },
      {
        title: "Diplomasi Adat-Syarak",
        detail:
          "Menyatukan dua kekuatan sosial Minang — niniak mamak dan alim ulama — menjadi satu front perlawanan yang utuh.",
      },
      {
        title: "Logistik Surau",
        detail:
          "Surau berfungsi sebagai pusat pendidikan, dapur umum, dan ruang strategi — sebuah model perang berbasis komunitas yang nyaris mandiri.",
      },
    ],
  },
];
