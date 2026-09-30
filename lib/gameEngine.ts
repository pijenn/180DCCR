import type { Participant, SubRoundConfig, Question, GameState, Round1Phase } from "./types.ts";

export const ROUND_1_SUBROUNDS: SubRoundConfig[] = [
  { id: 1, name: "BUSINESS ANALYST", points: 20, questionCount: 3 },
  { id: 2, name: "ASSOCIATE CONSULTANT", points: 30, questionCount: 3 },
  { id: 3, name: "CONSULTANT", points: 45, questionCount: 3 },
  { id: 4, name: "SENIOR CONSULTANT", points: 65, questionCount: 3 },
  { id: 5, name: "MANAGER", points: 90, questionCount: 3 },
  { id: 6, name: "PRINCIPAL", points: 120, questionCount: 3 },
  { id: 7, name: "CRISIS ROUND", points: 130, questionCount: 1 },
  { id: 8, name: "PARTNER", points: 170, questionCount: 3 },
];

export const GOLDEN_TICKET_NAMES = [
  "Rifqi Syarifuddin Yasykur",
  "Cyka Srihana Humaera",
  "Ahmad Reva Dany Fawwaz",
];

export function isGoldenTicket(p?: Participant | null): boolean {
  if (!p) return false;
  return Boolean(
    p.isGoldenTicket ||
    p.golden_ticket ||
    (p as any).golden_pass ||
    p.status === "golden_ticket" ||
    GOLDEN_TICKET_NAMES.includes(p.name)
  );
}

export const PARTICIPANT_PHOTO_MATCHERS = [
  { match: ["theresia", "rosma"], file: "2_Theresia Rosma Exaudi.jpg.jpeg" },
  { match: ["abdullah", "shamil"], file: "Abdullah Shamil Basayev.webp" },
  { match: ["achmad", "muchtarom", "achsan"], file: "Achmad Muchtarom Achsan.jpg" },
  { match: ["ahmad", "reva"], file: "Ahmad Reva.jpeg" },
  { match: ["alvyan"], file: "Alvyan Ananta Asis.jpg" },
  { match: ["ngurah", "anak agung"], file: "Anak Agung Ngurah.jpeg" },
  { match: ["cyka"], file: "Cyka Humaera.JPG" },
  { match: ["diva"], file: "Diva Salsabilla.jpeg" },
  { match: ["fachri"], file: "Fachri Fabian.jpeg" },
  { match: ["faris", "audah", "khalilullah", "faiz"], file: "Faris Audah.jpeg" },
  { match: ["hanindita", "hanandita"], file: "Hanandita Fernanda Elsharini.JPG" },
  { match: ["hilmi"], file: "Hilmi Hidayat.webp" },
  { match: ["ihsan"], file: "Ihsan Dianta.jpeg" },
  { match: ["jesslyn"], file: "Jesslyn Callista.jpeg" },
  { match: ["kelvin"], file: "Kelvin William.jpeg" },
  { match: ["fikri", "ali fikri"], file: "Mohammad Ali Fikri.png" },
  { match: ["yafis"], file: "Muchamad Yafis (1).png" },
  { match: ["fajar"], file: "Muhammad Fajar.jpeg" },
  { match: ["nafi"], file: "Nafi Satul.webp" },
  { match: ["naufal"], file: "Naufal Arya.jpeg" },
  { match: ["nindya", "nindiya"], file: "Nindiya Aliyah.jpg" },
  { match: ["rachelle"], file: "Rachelle H.jpeg" },
  { match: ["rexelnino"], file: "Rexelnino.jpg" },
  { match: ["rifqi"], file: "Rifqi Syarifuddin (1).png" },
  { match: ["sharlyf"], file: "Sharlyf Shaquille Syani.jpg" },
  { match: ["surya", "sura"], file: "Sura Rahmat Fatahillah (1).png" }
];

export function getParticipantPhoto(name?: string | null): string {
  if (!name) return "/participants/default-avatar.svg";
  const lower = name.toLowerCase().trim();
  for (const entry of PARTICIPANT_PHOTO_MATCHERS) {
    if (entry.match.some((m) => lower.includes(m))) {
      return `/participants/${entry.file}`;
    }
  }
  return "/participants/default-avatar.svg";
}

export function getParticipantPhotoPosition(name?: string | null): string {
  if (!name) return "center 20%";
  const lower = name.toLowerCase().trim();
  // Specifically adjust position for participants whose heads get cut off if centered too low
  if (
    lower.includes("abdullah") ||
    lower.includes("shamil") ||
    lower.includes("achmad") ||
    lower.includes("muchtarom") ||
    lower.includes("sharlyf") ||
    lower.includes("shaquille") ||
    lower.includes("rexelino") ||
    lower.includes("rexelnino") ||
    lower.includes("theresia") ||
    lower.includes("rosma")
  ) {
    return "center 5%"; // Focus near the very top to preserve full head & hair
  }
  return "center 20%";
}

export const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: "p-01", name: "Rifqi Syarifuddin Yasykur", university: "Institut Teknologi Sepuluh Nopember", avatar: getParticipantPhoto("Rifqi Syarifuddin Yasykur"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", isGoldenTicket: true, golden_ticket: true, status: "golden_ticket" },
  { id: "p-02", name: "Mohammad Ali Fikri", university: "Universitas Malang", avatar: getParticipantPhoto("Mohammad Ali Fikri"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-03", name: "Cyka Srihana Humaera", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Cyka Srihana Humaera"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", isGoldenTicket: true, golden_ticket: true, status: "golden_ticket" },
  { id: "p-04", name: "Alvyan Ananta Asis", university: "Universitas Airlangga", avatar: getParticipantPhoto("Alvyan Ananta Asis"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-05", name: "Mohammad Hilmi Hidayatullah", university: "Institut Teknologi Sepuluh Nopember", avatar: getParticipantPhoto("Mohammad Hilmi Hidayatullah"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-06", name: "Diva Salsabilla", university: "Politeknik Negeri Malang", avatar: getParticipantPhoto("Diva Salsabilla"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-07", name: "Muchamad Yafis", university: "Universitas Malang", avatar: getParticipantPhoto("Muchamad Yafis"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-08", name: "Fachri Fabian", university: "Universitas Pembangunan Nasional “Veteran” Jawa Timur", avatar: getParticipantPhoto("Fachri Fabian"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-09", name: "Nafi Satul Fuadhah", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Nafi Satul Fuadhah"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-10", name: "Ngurah Oka", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Ngurah Oka"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-11", name: "Rachelle Hasiane", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Rachelle Hasiane"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-12", name: "Ihsan Dianta", university: "Institut Teknologi Sepuluh Nopember", avatar: getParticipantPhoto("Ihsan Dianta"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-13", name: "Ahmad Reva Dany Fawwaz", university: "UNAIR", avatar: getParticipantPhoto("Ahmad Reva Dany Fawwaz"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", isGoldenTicket: true, golden_ticket: true, status: "golden_ticket" },
  { id: "p-14", name: "M. Fajar Akbar Nugeraha", university: "Universitas Brawijaya", avatar: getParticipantPhoto("M. Fajar Akbar Nugeraha"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-15", name: "Surya Rahmat Fatahillah", university: "Politeknik Negeri Malang", avatar: getParticipantPhoto("Surya Rahmat Fatahillah"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-16", name: "Naufal Aryasatya", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Naufal Aryasatya"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-17", name: "Theresia Rosma Exaudi", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Theresia Rosma Exaudi"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-18", name: "Abdullah Shamil Basayev", university: "Politeknik Negeri Malang", avatar: getParticipantPhoto("Abdullah Shamil Basayev"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-19", name: "Jesslyn Callista", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Jesslyn Callista"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-20", name: "Nindya Aliyah Maulidina", university: "Universitas Pembangunan Nasional “Veteran” Jawa Timur", avatar: getParticipantPhoto("Nindya Aliyah Maulidina"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-21", name: "Sharlyf Shaquille Syani", university: "Politeknik Negeri Malang", avatar: getParticipantPhoto("Sharlyf Shaquille Syani"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-22", name: "Rexelnino Rajendra", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Rexelnino Rajendra"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-23", name: "Hanindita Fernanda Elsharini", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Hanindita Fernanda Elsharini"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-24", name: "Kelvin William", university: "Universitas Ciputra", avatar: getParticipantPhoto("Kelvin William"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-25", name: "Achmad Muchtarom Achsany", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Achmad Muchtarom Achsany"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-26", name: "Faris Audah", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Faris Audah"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
];

export function getSubRoundPointValue(subRoundIdx: number): number {
  if (subRoundIdx >= 0 && subRoundIdx < ROUND_1_SUBROUNDS.length) {
    return ROUND_1_SUBROUNDS[subRoundIdx].points;
  }
  return 0;
}

export function calculateLeaderboard(participants: Participant[]): (Participant & { rank: number })[] {
  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  return sorted.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

export function validateRound2Answer(input: string | number, target: number = 1467): boolean {
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!/^\d+$/.test(trimmed)) return false;
    return parseInt(trimmed, 10) === target;
  }
  return input === target;
}

/**
 * Format milliseconds into MM:SS for precision display (e.g. 29:59 = 29s and 59 cs)
 * For 30s timers: seconds : hundredths of a second (millisecond display requested: 29:59)
 */
export function formatTimerDisplay(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  const secStr = String(totalSeconds).padStart(2, "0");
  const msStr = String(hundredths).padStart(2, "0");
  return `${secStr}:${msStr}`;
}

/**
 * Format milliseconds into Minutes:Second:MilSec (Rootmaster countdown e.g. 05:00:00)
 */
export function formatPrecisionCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);

  const minStr = String(mins).padStart(2, "0");
  const secStr = String(secs).padStart(2, "0");
  const msStr = String(hundredths).padStart(2, "0");

  return `${minStr}:${secStr}:${msStr}`;
}

// Official 22 Gauntlet Consulting Questions for Round 1
export const SAMPLE_QUESTIONS: Question[] = [
  // Sub-round 1: BUSINESS ANALYST (3 questions - 20 pts)
  {
    id: "q-1-1",
    roundId: 1,
    subRoundId: 1,
    questionNumber: 1,
    prompt: "Sebuah kafe sedang mengevaluasi kinerja keuangannya untuk satu periode. Total pendapatan kafe pada periode tersebut adalah Rp500 juta, yang berasal dari dua kategori utama, yaitu minuman dan makanan. Sebanyak 60% dari total pendapatan berasal dari kategori minuman, dengan margin laba 40% dari pendapatan kategori minuman. Sisanya, yaitu 40% dari total pendapatan, berasal dari kategori makanan, dengan margin laba 25% dari pendapatan kategori makanan. Setiap margin laba sudah memperhitungkan seluruh biaya pada kategorinya masing-masing. Tidak ada pendapatan maupun biaya lain di luar dua kategori tersebut. Manajemen ingin mengetahui kontribusi kedua kategori terhadap keuntungan kafe secara keseluruhan. Perhatikan bahwa porsi pendapatan dan margin kedua kategori berbeda. Berapa total profit yang diperoleh kafe tersebut?",
    options: [
      { key: "A", text: "Rp155.000.000" },
      { key: "B", text: "Rp162.500.000" },
      { key: "C", text: "Rp170.000.000" },
      { key: "D", text: "Rp185.000.000" },
      { key: "E", text: "Rp200.000.000" },
      { key: "F", text: "Rp212.500.000" },
    ],
    correctAnswer: "C",
  },
  {
    id: "q-1-2",
    roundId: 1,
    subRoundId: 1,
    questionNumber: 2,
    prompt: "Sebuah perusahaan yang menjual satu jenis produk melakukan penyesuaian harga. Harga jual per unit dinaikkan sebesar 10%. Setelah kenaikan tersebut, volume penjualan dalam unit turun sebesar 8% dibandingkan sebelum kenaikan harga. Selama periode yang sama, fixed cost perusahaan tidak berubah, dan variable cost per unit juga tidak berubah. Asumsikan harga jual per unit pada kondisi awal lebih besar daripada variable cost per unit. Harga jual dan variable cost per unit pada kondisi awal bernilai positif. Tidak ada perubahan lain pada diskon, bauran produk, maupun komponen biaya lainnya. Tim manajemen ingin memahami dampak keputusan tersebut terhadap profit operasional sebelum menetapkan kebijakan harga berikutnya. Berdasarkan informasi yang diberikan, pernyataan mana yang paling tepat menggambarkan dampaknya terhadap profit?",
    options: [
      { key: "A", text: "Profit turun, karena volume penjualan berkurang" },
      { key: "B", text: "Profit naik atau turun, tergantung rasio fixed cost terhadap variable cost" },
      { key: "C", text: "Revenue naik, tetapi arah perubahan profit bergantung pada struktur biaya" },
      { key: "D", text: "Revenue dan profit tidak berubah, karena kedua efek saling meniadakan" },
      { key: "E", text: "Informasi tidak cukup untuk menentukan arah perubahan profit" },
      { key: "F", text: "Profit naik, karena revenue meningkat sementara total variable cost menurun" },
    ],
    correctAnswer: "F",
  },
  {
    id: "q-1-3",
    roundId: 1,
    subRoundId: 1,
    questionNumber: 3,
    prompt: "Seorang analis diminta memperkirakan ukuran pasar jasa laundry kiloan di Kota Malang. Hasil estimasi akan dipakai sebagai dasar diskusi awal mengenai potensi pasar tersebut. Pendekatan dinilai dengan tiga kriteria. Pertama, angka dibangun dari perilaku permintaan konsumen. Kedua, setiap asumsi dapat diuraikan dan divalidasi secara terpisah, tanpa bergantung pada satu asumsi proporsi tunggal. Ketiga, hasil akhir berupa ukuran pasar dalam nilai rupiah, bukan sekadar jumlah pengguna. Analis mempertimbangkan enam pendekatan berikut. Berdasarkan ketiga kriteria tersebut, pendekatan mana yang paling analitis dan dapat dipertanggungjawabkan?",
    options: [
      { key: "A", text: "Estimasi rumah tangga Malang, segmentasi pengguna laundry kiloan, lalu kalikan frekuensi dan nilai transaksi" },
      { key: "B", text: "Jumlah outlet laundry aktif Malang × rata-rata revenue per outlet" },
      { key: "C", text: "Populasi Malang × persentase pengguna laundry kiloan" },
      { key: "D", text: "Data industri laundry nasional × proporsi skala Kota Malang" },
      { key: "E", text: "Rata-rata revenue 10 pemilik laundry × estimasi jumlah laundry di Malang" },
      { key: "F", text: "Total pengeluaran rumah tangga Malang × proporsi pengeluaran untuk laundry" },
    ],
    correctAnswer: "A",
  },
  // Sub-round 2: ASSOCIATE CONSULTANT (3 questions - 30 pts)
  {
    id: "q-2-1",
    roundId: 1,
    subRoundId: 2,
    questionNumber: 1,
    prompt: "Sebuah startup EdTech menjual produknya dalam dua tier. Kursus Basic dijual seharga Rp150.000 per seat dengan variable cost Rp40.000 per seat. Kursus Premium dijual seharga Rp400.000 per seat dengan variable cost Rp80.000 per seat. Pada bulan ini, startup tersebut menjual 4.000 seat Basic dan 1.000 seat Premium. Fixed cost bulan ini sebesar Rp600.000.000. Fixed cost tersebut adalah total untuk seluruh bisnis, sehingga tidak perlu dialokasikan ke masing-masing tier. Anggap tidak ada biaya lain selain variable cost per seat dan fixed cost tersebut, dan perhitungan dilakukan sebelum pajak. Tim finance ingin mengetahui hasil operasional bulan ini sebelum menyusun rencana bulan berikutnya. Berapa profit atau loss startup pada bulan ini?",
    options: [
      { key: "A", text: "Loss Rp100.000.000" },
      { key: "B", text: "Loss Rp60.000.000" },
      { key: "C", text: "Profit Rp100.000.000" },
      { key: "D", text: "Profit Rp160.000.000" },
      { key: "E", text: "Profit Rp220.000.000" },
      { key: "F", text: "Profit Rp760.000.000" },
    ],
    correctAnswer: "D",
  },
  {
    id: "q-2-2",
    roundId: 1,
    subRoundId: 2,
    questionNumber: 2,
    prompt: "Sebuah perusahaan FMCG Indonesia mempertimbangkan untuk masuk ke segmen skincare premium. Data yang tersedia menunjukkan tiga hal. Pertama, pasar segmen ini tumbuh 18% YoY. Kedua, margin industri rata-rata sebesar 35%. Ketiga, tiga pemain teratas sudah menguasai 75% market share dengan loyalitas brand yang tinggi. Anggap data tersebut adalah satu-satunya informasi yang saat ini tersedia. Belum ada data tentang kapabilitas internal perusahaan untuk bersaing di segmen ini. Belum ada juga pemetaan sub-segmen yang belum dilayani pemain dominan, maupun ketersediaan target akuisisi. Manajemen meminta rekomendasi awal. Rekomendasi awal yang dimaksud adalah langkah evaluasi yang dapat dilakukan berdasarkan informasi yang sudah tersedia saat ini, tanpa melakukan riset pasar atau pengumpulan data tambahan terlebih dahulu. Langkah yang membutuhkan data baru tidak termasuk dalam rekomendasi awal. Rekomendasi awal mana yang paling tepat?",
    options: [
      { key: "A", text: "Masuk segera karena pertumbuhan pasar 18% dan margin industri 35% menarik" },
      { key: "B", text: "Menilai kapabilitas pembeda untuk bersaing di pasar yang terkonsolidasi" },
      { key: "C", text: "Masuk melalui akuisisi pemain kecil untuk mengatasi loyalitas brand" },
      { key: "D", text: "Melakukan riset pasar selama enam bulan sebelum mengambil keputusan" },
      { key: "E", text: "Menyasar sub-segmen niche yang belum dilayani tiga pemain dominan" },
      { key: "F", text: "Menunda masuk dan fokus pada segmen FMCG yang sudah dijalankan" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-2-3",
    roundId: 1,
    subRoundId: 2,
    questionNumber: 3,
    prompt: "Dalam rapat evaluasi kinerja tahunan, manajemen sebuah perusahaan membandingkan laporan laba rugi tahun ini dengan tahun sebelumnya. Revenue perusahaan naik 15% secara year-on-year. Namun, net profit, yaitu laba setelah seluruh biaya dan beban dikurangkan dari revenue, justru turun 8% pada periode yang sama. Tim analis diminta menyusun hipotesis awal yang perlu diperiksa pertama. Gunakan logika bahwa net profit adalah revenue dikurangi seluruh biaya dan beban, dan perhatikan bahwa kenaikan revenue 15% adalah fakta yang sudah diberikan. Penjelasan mana yang paling mungkin dan secara langsung menerangkan mengapa net profit turun meskipun revenue naik, sehingga perlu diperiksa pertama?",
    options: [
      { key: "A", text: "Harga jual rata-rata turun signifikan, sehingga revenue berkurang" },
      { key: "B", text: "Volume penjualan menurun, sehingga revenue berkurang" },
      { key: "C", text: "Pasar tempat perusahaan beroperasi mengalami kontraksi, sehingga permintaan berkurang" },
      { key: "D", text: "Perusahaan kehilangan pangsa pasar, sehingga penjualan berkurang" },
      { key: "E", text: "Total biaya dan beban bertambah lebih besar daripada tambahan revenue, sehingga laba menyusut" },
      { key: "F", text: "Produk utama memasuki fase decline dalam product lifecycle, sehingga penjualan menurun" },
    ],
    correctAnswer: "E",
  },
  // Sub-round 3: CONSULTANT (3 questions - 45 pts)
  {
    id: "q-3-1",
    roundId: 1,
    subRoundId: 3,
    questionNumber: 1,
    prompt: "UrbanBite adalah startup food delivery berbasis langganan. Subscriber mengatur preferensi makanan saat onboarding. Manajemen menemukan churn meningkat pada minggu ke-3 hingga ke-6, sementara CAC tinggi dan LTV tidak meningkat. Tim menemukan empat findings:\n• (P): 81% subscriber membuka email onboarding, tetapi hanya 34% menyelesaikan setup preferensi.\n• (Q): Subscriber tanpa preferensi mendapat rekomendasi menu generik.\n• (R): Repeat order minggu ke-2 dan ke-3 hanya 29% pada subscriber tanpa personalisasi, dibandingkan 74% dengan personalisasi lengkap.\n• (S): Sebagian besar churn terjadi pada minggu ke-3 hingga ke-6, bersamaan dengan tagihan bulan kedua.\n\nSusun findings berdasarkan rantai sebab-akibat, dari penyebab awal hingga dampak akhir. Temuan yang merupakan akibat harus muncul setelah penyebabnya. Anggap repeat order rendah terjadi sebelum keputusan berhenti berlangganan. Manakah urutan yang paling logis?",
    options: [
      { key: "A", text: "(S) → (R) → (Q) → (P)" },
      { key: "B", text: "(P) → (S) → (Q) → (R)" },
      { key: "C", text: "(Q) → (P) → (R) → (S)" },
      { key: "D", text: "(P) → (Q) → (R) → (S)" },
      { key: "E", text: "(R) → (Q) → (P) → (S)" },
      { key: "F", text: "(P) → (Q) → (S) → (R)" },
    ],
    correctAnswer: "D",
  },
  {
    id: "q-3-2",
    roundId: 1,
    subRoundId: 3,
    questionNumber: 2,
    prompt: "TegakBaja, produsen baja ringan, kehilangan market share dari 31% menjadi 19% dalam 18 bulan meski harga 5% lebih murah dari kompetitor. Tim menemukan empat findings:\n• (W) Developer menengah mensyaratkan SNI 2024, sedangkan TegakBaja masih memiliki SNI 2019\n• (X) TegakBaja gagal 73% tender karena tidak lolos screening dokumen, bukan karena harga\n• (Y) Manajemen menganggap SNI 2019 masih cukup sehingga tidak menganggarkan resertifikasi\n• (Z) Sales terus memberi diskon pada tender yang kalah karena mengira masalahnya adalah harga\n\nSusun findings sebagai rantai sebab-akibat, bukan sekadar urutan kejadian: mulai dari keputusan internal yang menyebabkan kesenjangan sertifikasi, lalu kesenjangan tersebut menyebabkan dampak operasional, dan akhirnya dampak tersebut memicu respons yang salah. Dalam rantai ini, kesenjangan sertifikasi harus muncul sebelum dampak operasional, dan dampak operasional harus muncul sebelum respons sales. Manakah urutan yang paling logis?",
    options: [
      { key: "A", text: "(Y) → (W) → (X) → (Z)" },
      { key: "B", text: "(X) → (Y) → (W) → (Z)" },
      { key: "C", text: "(Z) → (X) → (W) → (Y)" },
      { key: "D", text: "(W) → (Z) → (Y) → (X)" },
      { key: "E", text: "(Y) → (X) → (W) → (Z)" },
      { key: "F", text: "(W) → (Y) → (X) → (Z)" },
    ],
    correctAnswer: "A",
  },
  {
    id: "q-3-3",
    roundId: 1,
    subRoundId: 3,
    questionNumber: 3,
    prompt: "NusaTech adalah B2B SaaS manajemen inventaris UMKM. Dalam setahun, sales cycle naik dari 23 menjadi 67 hari, sementara jumlah leads dan komposisi sales team tetap. Tim menemukan:\n• (A) Tiga fitur enterprise ditambahkan ke paket standar UMKM tanpa perubahan harga\n• (B) Durasi demo naik dari 30 menjadi 78 menit karena sales menjelaskan fitur yang tidak relevan\n• (C) Setelah demo, pemilik UMKM merasa produk terlalu rumit dan meminta berdiskusi dengan tim IT, meski sebagian besar tidak memilikinya\n• (D) Proposal akhirnya membutuhkan approval dari pihak yang tidak hadir saat demo\n\nSusun findings dari keputusan produk → dampak pada demo → hambatan pelanggan → hambatan closing. Temuan yang merupakan akibat harus muncul setelah penyebabnya. Manakah urutan yang paling logis?",
    options: [
      { key: "A", text: "(B) → (A) → (C) → (D)" },
      { key: "B", text: "(C) → (A) → (B) → (D)" },
      { key: "C", text: "(A) → (C) → (B) → (D)" },
      { key: "D", text: "(D) → (C) → (B) → (A)" },
      { key: "E", text: "(A) → (B) → (D) → (C)" },
      { key: "F", text: "(A) → (B) → (C) → (D)" },
    ],
    correctAnswer: "F",
  },
  // Sub-round 4: SENIOR CONSULTANT (3 questions - 65 pts)
  {
    id: "q-4-1",
    roundId: 1,
    subRoundId: 4,
    questionNumber: 1,
    prompt: "GrainMas, produsen mi instan, mengalami penurunan EBITDA margin dari 18% menjadi 9% dalam dua tahun, meski revenue tumbuh 6% YoY. Tim menemukan:\n• (I) Kapasitas produksi naik 40% untuk mengejar pertumbuhan modern trade\n• (II) Modern trade mensyaratkan fill rate 95%, tetapi GrainMas hanya mencapai 87%\n• (III) GrainMas menggunakan lembur dan co-manufacturer dengan biaya 23% lebih tinggi\n• (IV) Co-manufacturer memakai bahan baku berbeda sehingga rejection rate naik 11%\n• (V) Biaya produksi per unit naik 31%, tetapi harga jual tidak dinaikkan karena khawatir kehilangan shelf space\n\nHipotesis harus menjelaskan kelima temuan dalam satu rantai sebab-akibat, bukan hanya satu faktor. Manakah hipotesis yang paling tepat?",
    options: [
      { key: "A", text: "Margin turun karena kapasitas naik 40% melebihi kebutuhan, sehingga biaya tetap per unit meningkat" },
      { key: "B", text: "Margin turun karena modern trade menekan harga jual sehingga biaya produksi tidak tertutup" },
      { key: "C", text: "Margin turun karena kapasitas belum memenuhi permintaan, sehingga beralih ke lembur dan co-manufacturer yang lebih mahal serta bermasalah kualitasnya, sementara kenaikan biaya tidak diteruskan ke harga" },
      { key: "D", text: "Margin turun karena rejection rate co-manufacturer naik 11%, sehingga biaya produk ditolak meningkat" },
      { key: "E", text: "Margin turun karena fill rate hanya 87%, sehingga penjualan dan laba modern trade menurun" },
      { key: "F", text: "Margin turun karena co-manufacturer 23% lebih mahal, sehingga setiap unit tambahan menekan margin" },
    ],
    correctAnswer: "C",
  },
  {
    id: "q-4-2",
    roundId: 1,
    subRoundId: 4,
    questionNumber: 2,
    prompt: "KapalSejahtera, perusahaan yang mengoperasikan kapal untuk pelanggan enterprise, mengalami kenaikan churn pelanggan enterprise dari 8% menjadi 22% dalam dua kuartal. Manajemen menelaah data internal dan hasil exit interview untuk menemukan penyebab utamanya. Data menunjukkan:\n• On-time delivery (OTD) stabil di 91% selama periode tersebut, di atas SLA 88%\n• Frekuensi kerusakan kapal tidak berubah\n• Tarif KapalSejahtera saat ini 7 hingga 12% lebih murah daripada dua kompetitor utama\n• Exit interview menunjukkan pelanggan tidak bisa mengetahui posisi kapal secara real-time dan kesulitan merencanakan operasional mereka.\n\nHipotesis yang tepat harus konsisten dengan seluruh data, termasuk indikator yang tidak berubah. Hipotesis mana yang paling tepat menjelaskan kenaikan churn?",
    options: [
      { key: "A", text: "Kompetitor melakukan predatory pricing sehingga pelanggan enterprise beralih ke tarif lebih murah" },
      { key: "B", text: "Sales kurang follow-up setelah kontrak sehingga pelanggan enterprise merasa tidak diperhatikan" },
      { key: "C", text: "OTD 91% terlalu rendah bagi pelanggan enterprise sehingga mereka beralih ke penyedia lain" },
      { key: "D", text: "Tingginya kerusakan kapal membuat jadwal pengiriman tidak dapat diprediksi" },
      { key: "E", text: "Pelanggan enterprise tidak memiliki visibilitas posisi kapal secara real-time sehingga sulit merencanakan operasional" },
      { key: "F", text: "Layanan enterprise tidak dibedakan dari SME sehingga tidak sesuai kebutuhan pelanggan besar" },
    ],
    correctAnswer: "E",
  },
  {
    id: "q-4-3",
    roundId: 1,
    subRoundId: 4,
    questionNumber: 3,
    prompt: "ClearPath Diagnostics memiliki 23 klinik di Jawa. Selama tiga tahun terakhir revenue stagnan, meskipun jumlah pasien baru tumbuh 9% per tahun. Manajemen meminta tim menyusun satu hipotesis utama yang mampu menjelaskan seluruh temuan, bukan hanya sebagian. Tim menemukan:\n• Revenue per patient turun 34%\n• Return visit rate hanya 18%, dibandingkan 51% di industri\n• Kontribusi layanan premium turun dari 29% menjadi 11% dari total visit\n• 67% revenue berasal dari layanan dasar bermargin rendah\n\nHipotesis mana yang paling mampu menjelaskan seluruh temuan tersebut?",
    options: [
      { key: "A", text: "ClearPath membuka terlalu banyak cabang sehingga kualitas layanan dan loyalitas pasien menurun" },
      { key: "B", text: "ClearPath tidak mendorong pasien layanan dasar beralih ke layanan lanjutan dan kembali berkunjung, sehingga banyak pasien hanya memakai satu layanan lalu tidak kembali" },
      { key: "C", text: "Biaya akuisisi pasien terlalu besar sehingga anggaran retensi berkurang dan pasien lama tidak dihubungi" },
      { key: "D", text: "Kompetitor mengambil segmen premium sehingga ClearPath bergantung pada layanan dasar bermargin rendah" },
      { key: "E", text: "Jumlah dokter spesialis tidak cukup sehingga pasien layanan lanjutan harus dirujuk ke tempat lain" },
      { key: "F", text: "Harga layanan premium terlalu tinggi sehingga pasien memilih layanan dasar atau kompetitor" },
    ],
    correctAnswer: "B",
  },
  // Sub-round 5: MANAGER (3 questions - 90 pts)
  {
    id: "q-5-1",
    roundId: 1,
    subRoundId: 5,
    questionNumber: 1,
    prompt: "PT Arunika Logistik Indonesia — Berdasarkan bar chart margin kontribusi dan biaya operasional per kategori, profit operasional kategori Laut, yang dihitung dari selisih margin kontribusi dan biaya operasional, lebih besar dibandingkan profit operasional kategori Intermodal pada tahun fiskal 2023.",
    imageUrl: "/soal/Soal_13.png",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-5-2",
    roundId: 1,
    subRoundId: 5,
    questionNumber: 2,
    prompt: "PT Arunika Logistik Indonesia — Berdasarkan grafik garis, segmen Warehousing tidak hanya memiliki rentang fluktuasi paling sempit, tetapi juga nilai pertumbuhan tertingginya lebih rendah dibandingkan nilai pertumbuhan terendah segmen Last Mile sepanjang 2023.",
    imageUrl: "/soal/Soal 14.png",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
    ],
    correctAnswer: "A",
  },
  {
    id: "q-5-3",
    roundId: 1,
    subRoundId: 5,
    questionNumber: 3,
    prompt: "PT Arunika Logistik Indonesia — Scatter plot menunjukkan hubungan antara tingkat utilisasi armada (%) dan biaya per km (Rp ribu) untuk 20 unit truk kategori Medium pada Q2 2023. Setiap titik pada grafik mewakili satu unit armada. Berdasarkan grafik, setiap unit dengan utilisasi di atas 80% memiliki biaya per km di bawah Rp3,0 ribu.",
    imageUrl: "/soal/Soal_15.png",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
    ],
    correctAnswer: "B",
  },
  // Sub-round 6: PRINCIPAL (3 questions - 120 pts)
  {
    id: "q-6-1",
    roundId: 1,
    subRoundId: 6,
    questionNumber: 1,
    prompt: "PT Arunika Logistik Indonesia — Diketahui EBITDA 2022 sebesar Rp130 juta. Pada 2023, fuel cost merupakan faktor negatif yang nilainya sama besar dengan faktor positif Revenue Uplift. Jika fuel cost tersebut berhasil dikurangi sebesar 50% pada 2024 sementara faktor lainnya tetap pada level 2023, apakah EBITDA 2024 yang diproyeksikan akan lebih tinggi daripada EBITDA 2022?",
    imageUrl: "/soal/Soal_16.png",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-6-2",
    roundId: 1,
    subRoundId: 6,
    questionNumber: 2,
    prompt: "PT Arunika Logistik Indonesia — Area chart bertumpuk menunjukkan revenue segmen Enterprise, SME, dan Spot dari Q1 2022 sampai Q4 2023. Segmen Spot mewakili klien yang tidak memiliki kontrak. Berdasarkan grafik, revenue absolut segmen Spot mengalami penurunan secara konsisten dari kuartal ke kuartal sepanjang periode tersebut.",
    imageUrl: "/soal/Soal_17.png",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-6-3",
    roundId: 1,
    subRoundId: 6,
    questionNumber: 3,
    prompt: "PT Arunika Logistik Indonesia — Gunakan nilai yang terbaca dari sumbu grafik sesuai satuan masing-masing. Jika CLV dihitung dengan rumus CLV = nilai kontrak rata-rata ÷ churn rate, maka CLV segmen Enterprise lebih dari 10 kali CLV segmen Spot.",
    imageUrl: "/soal/Soal_18.png",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
    ],
    correctAnswer: "A",
  },
  // Sub-round 7: CRISIS ROUND (1 question - 130 pts)
  {
    id: "q-7-1",
    roundId: 1,
    subRoundId: 7,
    questionNumber: 1,
    prompt: "Sebuah klien kehilangan pelanggan yang menyumbang 30% dari total revenue. Cash runway klien tersisa 6 bulan. Tim konsultan menemukan tiga opsi. Opsi pertama, menghemat biaya Rp12 miliar dengan risiko menurunkan kapasitas operasional. Opsi kedua, menghemat Rp8 miliar tanpa mengganggu operasi inti. Opsi ketiga, menggunakan Rp5 miliar untuk mempertahankan kapasitas yang berpotensi memulihkan sebagian revenue dalam 4 bulan. Besarnya pemulihan revenue belum pasti dan belum dapat dihitung saat ini. Tidak ada informasi mengenai ketersediaan atau biaya pendanaan eksternal, sehingga rekomendasi tidak boleh bergantung padanya. Sebagai konsultan, Anda harus menyeimbangkan runway, keberlanjutan operasi inti, dan peluang pemulihan revenue. Kombinasi tindakan dan pertimbangan finansial mana yang paling tepat?",
    options: [
      { key: "A", text: "Ambil saving Rp12 miliar untuk memaksimalkan runway, dengan menerima penurunan kapasitas dan tanpa investasi recovery" },
      { key: "B", text: "Ambil saving Rp8 miliar lalu gunakan seluruh Rp5 miliar untuk recovery tanpa evaluasi, agar revenue segera pulih" },
      { key: "C", text: "Gunakan Rp5 miliar untuk recovery tanpa saving, lalu tutup kebutuhan kas berikutnya dengan utang baru" },
      { key: "D", text: "Ambil saving Rp8 miliar tanpa mengganggu operasi inti, lalu cairkan Rp5 miliar untuk recovery bertahap sesuai indikator revenue." },
      { key: "E", text: "Ambil saving Rp12 miliar lebih dahulu, lalu pulihkan kapasitas dan investasi recovery jika kas dan revenue membaik" },
      { key: "F", text: "Pertahankan seluruh operasi dan recovery dengan utang baru tanpa melakukan saving." },
    ],
    correctAnswer: "D",
  },
  // Sub-round 8: PARTNER (3 questions - 170 pts each)
  {
    id: "q-8-1",
    roundId: 1,
    subRoundId: 8,
    questionNumber: 1,
    prompt: "Sebuah perusahaan retail mengalami penurunan margin setelah mempercepat ekspansi omnichannel. Manajemen mempertimbangkan menghentikan ekspansi sementara, tetapi data menunjukkan toko baru tetap meningkatkan akuisisi pelanggan. Di sisi lain, investasi digital mulai menekan biaya operasional. Kondisi ini menciptakan trade-off antara pertumbuhan dan margin, serta antara melanjutkan ekspansi dengan memastikan kesiapan operasional dan finansial. Kombinasi yang tepat harus memuat trade-offs yang didukung oleh kondisi tersebut dan possibilities yang konsisten dengan ketiga data secara bersamaan: margin turun, toko baru menambah pelanggan, dan digitalisasi menekan biaya. Pilihan yang possibilities-nya bertentangan dengan salah satu data harus dieliminasi.",
    options: [
      { key: "A", text: "Pelanggan baru vs lama, digital vs fisik, revenue vs cost. Percepat toko, tingkatkan akuisisi, kurangi variasi produk" },
      { key: "B", text: "Margin vs volume, teknologi vs operasi, ekspansi vs kontrol. Kurangi toko, pertahankan digital, fokus pelanggan lama" },
      { key: "C", text: "Revenue vs profit, teknologi vs tenaga kerja, ekspansi vs stabilitas. Naikkan harga, kurangi promosi pelanggan baru, tunda investasi teknologi" },
      { key: "D", text: "Growth vs margin, online vs offline, cost vs revenue. Hentikan ekspansi, kurangi investasi digital, fokus toko fisik" },
      { key: "E", text: "Revenue vs cost, fisik vs digital, ekspansi vs efisiensi. Maksimalkan revenue, digitalisasi semua kanal, evaluasi margin di akhir" },
      { key: "F", text: "Growth vs margin, ekspansi vs efisiensi, speed vs readiness. Prioritaskan lokasi/kanal terbaik, optimalkan digitalisasi, uji ekspansi bertahap" },
    ],
    correctAnswer: "F",
  },
  {
    id: "q-8-2",
    roundId: 1,
    subRoundId: 8,
    questionNumber: 2,
    prompt: "Sebuah bank ingin meluncurkan layanan digital untuk segmen mass market. Pilot menunjukkan adopsi tinggi, tetapi sebagian besar pengguna hanya memakai fitur dasar. Memperluas fitur dapat meningkatkan engagement, namun juga meningkatkan kompleksitas dan kebutuhan support. Sementara itu, bank memiliki peluang menggunakan data transaksi untuk menawarkan produk tambahan. Sebagai konsultan, Anda diminta menyusun kombinasi yang seimbang. Trade-offs harus berasal dari kondisi tersebut, dan possibilities harus menjawab trade-offs itu tanpa mengabaikan adopsi yang sudah tinggi, kompleksitas, kebutuhan support, maupun peluang data. Kombinasi trade-offs dan possibilities mana yang paling tepat?",
    options: [
      { key: "A", text: "Basic vs advanced, digital vs cabang, engagement vs revenue. Tambah semua fitur, kurangi cabang, agresifkan cross-selling" },
      { key: "B", text: "Features vs usability, engagement vs complexity, personalization vs governance. Prioritaskan kebutuhan utama, gunakan data relevan, tambah fitur bertahap" },
      { key: "C", text: "Growth vs support cost, personalization vs privacy, simplicity vs innovation. Batasi fitur di pilot, hentikan data, pertahankan aplikasi" },
      { key: "D", text: "Adoption vs profit, support vs automation, data vs experience. Kurangi support, tambah automation, tingkatkan penjualan tambahan" },
      { key: "E", text: "Simplicity vs customization, data vs security, adoption vs complexity. Samakan pengalaman, batasi data, tambah fitur bertahap" },
      { key: "F", text: "Engagement vs complexity, data vs governance, innovation vs support. Maksimalkan fitur, kumpulkan data, tambah support sesuai kebutuhan" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-8-3",
    roundId: 1,
    subRoundId: 8,
    questionNumber: 3,
    prompt: "Sebuah perusahaan manufaktur menghadapi tekanan dari pelanggan untuk menurunkan harga sekaligus meningkatkan keberlanjutan produknya. Perusahaan memiliki tiga inisiatif yang dapat dipertimbangkan: mengganti pemasok dengan yang lebih murah, berinvestasi dalam proses produksi yang lebih efisien, atau mempertahankan pemasok saat ini untuk menjaga kualitas. Tidak semua inisiatif dapat dilakukan sekaligus. Sebagai konsultan, Anda diminta memilih kombinasi yang menjawab kedua tekanan pelanggan, yaitu harga dan keberlanjutan, tanpa mengorbankan salah satunya. Trade-offs harus berasal dari kondisi tersebut, dan possibilities harus konsisten dengan trade-offs itu serta dengan batasan sumber daya. Kombinasi trade-offs dan possibilities mana yang paling tepat?",
    options: [
      { key: "A", text: "Cost vs resilience, sustainability vs margin, quality vs flexibility. Investasi efisiensi, tambah pemasok bertahap, jadikan sustainability nilai jual" },
      { key: "B", text: "Price vs quality, sustainability vs profit, switching vs stability. Ganti pemasok termurah, turunkan kualitas, tunda sustainability" },
      { key: "C", text: "Cost vs sustainability, quality vs flexibility, margin vs investment. Tekan harga pemasok, pertahankan produksi, batasi sustainability pada produk premium" },
      { key: "D", text: "Supplier cost vs quality, efficiency vs investment, sustainability vs speed. Ganti pemasok, kurangi investasi teknologi, tunda sustainability" },
      { key: "E", text: "Margin vs efficiency, stability vs cost, sustainability vs speed. Turunkan biaya, evaluasi investasi nanti, pertahankan semua pemasok" },
      { key: "F", text: "Price vs sustainability, efficiency vs risk, flexibility vs consistency. Kejar biaya terendah, ubah produksi sekaligus, buka semua pemasok tanpa seleksi" },
    ],
    correctAnswer: "A",
  },
];

export interface RoundEliminationConfig {
  round: number;
  name: string;
  startingCount: number;
  advancingCount: number;
  eliminatedCount: number;
  description: string;
}

export const ROUND_ELIMINATIONS: Record<number, RoundEliminationConfig> = {
  1: {
    round: 1,
    name: "The Gauntlet",
    startingCount: 23,
    advancingCount: 18,
    eliminatedCount: 5,
    description: "23 Peserta Awal → 18 Peserta Lolos (5 Tereliminasi)",
  },
  2: {
    round: 2,
    name: "Capital Conquest",
    startingCount: 18,
    advancingCount: 15,
    eliminatedCount: 3,
    description: "18 Peserta → 15 Peserta Lolos (3 Tereliminasi)",
  },
  3: {
    round: 3,
    name: "Rootmaster",
    startingCount: 15,
    advancingCount: 12,
    eliminatedCount: 3,
    description: "15 Peserta → 12 Peserta Lolos (3 Tereliminasi)",
  },
  4: {
    round: 4,
    name: "Sacred Handoff",
    startingCount: 12,
    advancingCount: 9,
    eliminatedCount: 3,
    description: "12 Peserta (3 Golden Ticket Masuk) → 9 Peserta Lolos (3 Tereliminasi)",
  },
  5: {
    round: 5,
    name: "Pressure Chamber",
    startingCount: 9,
    advancingCount: 5,
    eliminatedCount: 4,
    description: "9 Peserta → 5 Peserta Lolos (4 Tereliminasi)",
  },
  6: {
    round: 6,
    name: "Executive Pitch",
    startingCount: 5,
    advancingCount: 5,
    eliminatedCount: 0,
    description: "5 Peserta Final (Juara 1, 2, 3, Harapan 1 & 2)",
  },
};

export function isParticipantEliminated(p: Participant): boolean {
  return p.eliminatedInRound !== undefined && p.eliminatedInRound !== null;
}

export function isParticipantActiveInRound(p: Participant, roundNum: number): boolean {
  // If eliminated in any round strictly prior to roundNum (e.g. eliminated in R1, and we are in R2), they are NOT active
  if (p.eliminatedInRound !== undefined && p.eliminatedInRound !== null && p.eliminatedInRound < roundNum) {
    return false;
  }
  // If marked eliminated in the current round or status is eliminated, exclude
  if (p.eliminatedInRound !== undefined && p.eliminatedInRound !== null && p.eliminatedInRound <= roundNum && p.status === "eliminated") {
    return false;
  }
  // Golden ticket holders do not participate in Rounds 1-3
  if (roundNum <= 3 && isGoldenTicket(p)) {
    return false;
  }
  return true;
}

export function getActiveRoundParticipants(
  participants: Participant[],
  roundNum: number
): Participant[] {
  return participants.filter((p) => isParticipantActiveInRound(p, roundNum));
}

export function eliminateParticipant(
  participants: Participant[],
  participantId: string,
  roundNum: number
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      return { ...p, status: "eliminated", eliminatedInRound: roundNum };
    }
    return p;
  });
}

export function reinstateParticipant(
  participants: Participant[],
  participantId: string
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      return {
        ...p,
        status: isGoldenTicket(p) ? "golden_ticket" : "active",
        eliminatedInRound: null,
      };
    }
    return p;
  });
}

export function autoAdvanceTopScorers(
  participants: Participant[],
  roundNum: number,
  targetAdvancingCount: number
): Participant[] {
  const eligible = getActiveRoundParticipants(participants, roundNum);
  const sorted = [...eligible].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  const advancingIds = new Set(sorted.slice(0, targetAdvancingCount).map((p) => p.id));
  const eligibleIds = new Set(eligible.map((p) => p.id));

  return participants.map((p) => {
    if (!eligibleIds.has(p.id)) return p;
    if (advancingIds.has(p.id)) {
      return { ...p, status: "active", eliminatedInRound: null };
    }
    return { ...p, status: "eliminated", eliminatedInRound: roundNum };
  });
}

export function getInitialGameState(): GameState {
  const regularParticipants = DEFAULT_PARTICIPANTS.filter((p) => !p.isGoldenTicket);
  const top9Names = regularParticipants.slice(0, 9).map((p) => p.name);
  const top5Names = regularParticipants.slice(0, 5).map((p) => p.name);

  return {
    currentRound: 1,
    subRoundIndex: 0,
    questionIndex: 0,
    round1Phase: "idle",
    round1TimeRemainingMs: 120000,
    round1TimerRunning: false,

    round2TargetAnswer: 1467,
    round2IsOpen: true,
    round2ShowLeaderboard: false,

    round3TimeRemainingMs: 300000, // 5 minutes default
    round3TimerRunning: false,
    round3InitialMs: 300000,
    round3ShowLeaderboard: false,

    round4SpinNames: top9Names,
    round4SelectedWinner: null,
    round4TimeRemainingMs: 300000,
    round4TimerRunning: false,
    round4ShowLeaderboard: false,

    round5SpinNames: top9Names,
    round5SelectedWinner: null,
    round5TimeRemainingMs: 60000,
    round5TimerRunning: false,
    round5GameEnded: false,
    round5ShowLeaderboard: false,
    round5ViewMode: "wheel",

    round6SpinNames: top5Names,
    round6SelectedWinner: null,
    round6TimeRemainingMs: 180000,
    round6TimerRunning: false,
    round6GameEnded: false,
    round6ShowLeaderboard: false,
    round6ViewMode: "wheel",

    participants: DEFAULT_PARTICIPANTS,
    soundEnabled: true,
    lastUpdated: Date.now(),
  };
}

export function applyScoreChange(
  participants: Participant[],
  participantId: string,
  delta: number,
  currentRound: number = 1
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      const newScore = Math.max(0, p.score + delta);
      const roundScores = { ...(p.roundScores || {}) };
      roundScores[currentRound] = Math.max(0, (roundScores[currentRound] || 0) + delta);

      let point_gauntlet = p.point_gauntlet ?? roundScores[1] ?? (currentRound === 1 ? newScore : 0);
      let point_rootmaster = p.point_rootmaster ?? roundScores[3] ?? 0;

      if (currentRound === 1) {
        point_gauntlet = Math.max(0, point_gauntlet + delta);
      } else if (currentRound === 3) {
        point_rootmaster = Math.max(0, point_rootmaster + delta);
      }

      return {
        ...p,
        score: newScore,
        roundScores,
        point_gauntlet,
        point_rootmaster,
      };
    }
    return p;
  });
}

export function setManualScore(
  participants: Participant[],
  participantId: string,
  newScore: number,
  currentRound: number = 1
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      const clampedScore = Math.max(0, newScore);
      const delta = clampedScore - p.score;
      const roundScores = { ...(p.roundScores || {}) };
      roundScores[currentRound] = Math.max(0, (roundScores[currentRound] || 0) + delta);

      let point_gauntlet = p.point_gauntlet ?? (currentRound === 1 ? clampedScore : 0);
      let point_rootmaster = p.point_rootmaster ?? (currentRound === 3 ? (roundScores[3] || 0) : 0);

      if (currentRound === 1) {
        point_gauntlet = clampedScore;
      } else if (currentRound === 3) {
        point_rootmaster = Math.max(0, point_rootmaster + delta);
      }

      return {
        ...p,
        score: clampedScore,
        roundScores,
        point_gauntlet,
        point_rootmaster,
      };
    }
    return p;
  });
}

export function updateRound2Status(
  participants: Participant[],
  participantId: string,
  status: "pending" | "passed" | "failed"
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      return {
        ...p,
        round2Status: status,
        passedAt: status === "passed" ? (p.passedAt || Date.now()) : undefined,
      };
    }
    return p;
  });
}

export function searchParticipants(participants: Participant[], query: string): Participant[] {
  if (!query || !query.trim()) return participants;
  const q = query.trim().toLowerCase();
  return participants.filter(
    (p) => p.name.toLowerCase().includes(q) || p.university.toLowerCase().includes(q)
  );
}

export function getNextQuestionState(
  subRoundIndex: number,
  questionIndex: number
): { subRoundIndex: number; questionIndex: number; isCompleted: boolean } {
  const currentSubRound = ROUND_1_SUBROUNDS[subRoundIndex] || ROUND_1_SUBROUNDS[0];
  if (questionIndex + 1 < currentSubRound.questionCount) {
    return {
      subRoundIndex,
      questionIndex: questionIndex + 1,
      isCompleted: false,
    };
  }
  if (subRoundIndex + 1 < ROUND_1_SUBROUNDS.length) {
    return {
      subRoundIndex: subRoundIndex + 1,
      questionIndex: 0,
      isCompleted: false,
    };
  }
  return {
    subRoundIndex,
    questionIndex,
    isCompleted: true,
  };
}

export function getPrevQuestionState(
  subRoundIndex: number,
  questionIndex: number
): { subRoundIndex: number; questionIndex: number } {
  if (questionIndex > 0) {
    return {
      subRoundIndex,
      questionIndex: questionIndex - 1,
    };
  }
  if (subRoundIndex > 0) {
    const prevSubRound = ROUND_1_SUBROUNDS[subRoundIndex - 1];
    return {
      subRoundIndex: subRoundIndex - 1,
      questionIndex: prevSubRound.questionCount - 1,
    };
  }
  return { subRoundIndex: 0, questionIndex: 0 };
}

export function getNextRound1Phase(
  currentPhase: Round1Phase,
  isEndOfSubRound: boolean = true
): Round1Phase {
  switch (currentPhase) {
    case "idle":
    case "question_timer":
    case "preview":
      return "question_options";
    case "question_options":
    case "answering":
      return "correct_answer";
    case "correct_answer":
      return isEndOfSubRound ? "leaderboard" : "question_timer";
    case "leaderboard":
      return "question_timer";
    default:
      return "question_timer";
  }
}

export function getPrevRound1Phase(currentPhase: Round1Phase): Round1Phase {
  switch (currentPhase) {
    case "leaderboard":
      return "correct_answer";
    case "correct_answer":
      return "question_options";
    case "question_options":
    case "answering":
      return "question_timer";
    case "question_timer":
    case "preview":
    case "idle":
      return "idle";
    default:
      return "question_timer";
  }
}

