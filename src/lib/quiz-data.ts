export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  topic: "Diponegoro" | "Imam Bonjol";
};

export const quizBank: QuizQuestion[] = [
  {
    topic: "Diponegoro",
    question: "Di kota mana Pangeran Diponegoro ditangkap setelah berunding dengan Jenderal De Kock?",
    options: ["Yogyakarta", "Magelang", "Semarang", "Surakarta"],
    answer: 1,
  },
  {
    topic: "Diponegoro",
    question: "Tanggal berapa Diponegoro ditangkap di Magelang?",
    options: ["20 Juli 1825", "28 Maret 1830", "11 November 1785", "8 Januari 1855"],
    answer: 1,
  },
  {
    topic: "Diponegoro",
    question: "Markas gerilya Diponegoro setelah Tegalrejo dibakar adalah…",
    options: ["Goa Selarong", "Benteng Vredeburg", "Imogiri", "Parangtritis"],
    answer: 0,
  },
  {
    topic: "Diponegoro",
    question: "Strategi Belanda untuk mempersempit ruang gerak Diponegoro disebut…",
    options: ["Tanam Paksa", "Benteng Stelsel", "Politik Pintu Terbuka", "Devide et Impera"],
    answer: 1,
  },
  {
    topic: "Diponegoro",
    question: "Diponegoro memproklamirkan diri sebagai…",
    options: ["Sultan Agung", "Erucakra / Ratu Adil", "Panembahan Senopati", "Sunan Kalijaga"],
    answer: 1,
  },
  {
    topic: "Diponegoro",
    question: "Setelah ditangkap, Diponegoro akhirnya diasingkan dan wafat di…",
    options: ["Banda Neira", "Boven Digoel", "Benteng Rotterdam, Makassar", "Ambon"],
    answer: 2,
  },
  {
    topic: "Imam Bonjol",
    question: "Tuanku Imam Bonjol berasal dari wilayah…",
    options: ["Aceh", "Sumatra Barat", "Riau", "Jambi"],
    answer: 1,
  },
  {
    topic: "Imam Bonjol",
    question: "Perang yang dipimpin Imam Bonjol melawan Belanda dikenal sebagai…",
    options: ["Perang Aceh", "Perang Padri", "Perang Banjar", "Perang Batak"],
    answer: 1,
  },
  {
    topic: "Imam Bonjol",
    question: "Tahun berapa Belanda mulai mengintervensi konflik Padri-Adat?",
    options: ["1803", "1821", "1837", "1864"],
    answer: 1,
  },
  {
    topic: "Imam Bonjol",
    question: "Plakat Puncak Pato (1837) adalah simbol…",
    options: [
      "Penyerahan kaum Padri",
      "Rekonsiliasi kaum Padri dan kaum Adat",
      "Perjanjian damai dengan Belanda",
      "Pendirian Benteng Bonjol",
    ],
    answer: 1,
  },
  {
    topic: "Imam Bonjol",
    question: "Dewan delapan ulama pemimpin gerakan Padri dikenal sebagai…",
    options: ["Wali Songo", "Harimau Nan Salapan", "Tigo Tungku Sajarangan", "Niniak Mamak"],
    answer: 1,
  },
  {
    topic: "Imam Bonjol",
    question: "Imam Bonjol ditangkap dengan tipu muslihat perundingan di…",
    options: ["Bonjol", "Palupuh", "Bukittinggi", "Padang"],
    answer: 1,
  },
  {
    topic: "Imam Bonjol",
    question: "Imam Bonjol wafat dalam pengasingan di…",
    options: ["Ambon", "Cianjur", "Pineleng, Minahasa", "Banda Neira"],
    answer: 2,
  },
  {
    topic: "Imam Bonjol",
    question: "Filosofi yang ditegaskan dalam Plakat Puncak Pato adalah…",
    options: [
      "Bhinneka Tunggal Ika",
      "Adat basandi syarak, syarak basandi Kitabullah",
      "Tut wuri handayani",
      "Gemah ripah loh jinawi",
    ],
    answer: 1,
  },
];
