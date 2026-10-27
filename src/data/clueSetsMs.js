const E = (label, text) => ({
  label, lang: "ms",
  entries: text.trim().split("\n").map((l) => {
    const i = l.indexOf(":");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }),
});

export const SETS_MS = {
  ms_haiwan: E("Haiwan (Melayu)", `
KUCING: Haiwan peliharaan yang mengiau
HARIMAU: Kucing besar berjalur yang hidup di hutan
GAJAH: Haiwan darat terbesar, ada belalai
SINGA: Jantannya ada surai yang tebal
ZIRAFAH: Haiwan paling tinggi dengan leher panjang
MONYET: Suka memanjat pokok dan makan pisang
BURUNG: Haiwan bersayap dan berbulu
IKAN: Hidup dalam air dan bernafas dengan insang
KUDA: Haiwan yang boleh ditunggang
LEMBU: Haiwan ternakan yang memberi susu
KAMBING: Haiwan ternakan berjanggut yang mengembek
ARNAB: Haiwan bertelinga panjang yang melompat
RUSA: Haiwan bertanduk bercabang
BERUANG: Haiwan besar berbulu tebal yang suka madu
SERIGALA: Anjing liar yang melolong
KERBAU: Haiwan kuat yang membantu membajak sawah
ITIK: Burung yang berbunyi kuak dan pandai berenang
AYAM: Burung ternakan yang bertelur
ULAR: Reptilia panjang tanpa kaki
BUAYA: Reptilia besar bergigi tajam di sungai
PENYU: Reptilia laut bercengkerang yang bertelur di pantai
KATAK: Melompat dan berbunyi di tepi kolam
ORANGUTAN: Kera besar berbulu perang dari Borneo
BADAK: Haiwan bertanduk di hidung dan berkulit tebal
TAPIR: Haiwan hitam putih berhidung panjang di hutan
LEBAH: Serangga yang membuat madu
SEMUT: Serangga kecil yang bekerja beramai-ramai
KETAM: Haiwan laut yang berjalan menyerong
UDANG: Haiwan laut kecil berkulit keras
SOTONG: Haiwan laut lembut yang mengeluarkan dakwat
BELALANG: Serangga yang melompat jauh di padang rumput
MERAK: Burung berekor cantik berwarna-warni
BANGAU: Burung putih berkaki panjang di sawah
KAKATUA: Burung berjambul yang boleh meniru suara
HELANG: Burung pemangsa besar bermata tajam
CICAK: Reptilia kecil yang merayap di dinding
BIAWAK: Reptilia besar berlidah bercabang yang pandai berenang
`),

  ms_buah: E("Buah-buahan (Melayu)", `
EPAL: Buah bulat berwarna merah atau hijau
PISANG: Buah panjang berkulit kuning
MANGGA: Buah tropika manis berbiji besar
NANAS: Buah berduri dengan mahkota daun
DURIAN: Raja buah yang berduri dan berbau kuat
RAMBUTAN: Buah merah berbulu halus dengan isi putih
MANGGIS: Ratu buah berkulit ungu
CIKU: Buah perang berkulit nipis dan isi manis
JAMBU: Buah hijau berbiji banyak yang rangup
BETIK: Buah berisi jingga dan berbiji hitam
OREN: Buah sitrus bulat yang sama nama dengan warnanya
LIMAU: Buah sitrus yang masam
ANGGUR: Buah kecil bertandan yang boleh jadi kismis
DUKU: Buah kecil berkulit kuning dengan isi manis berair
CEMPEDAK: Buah berbau kuat, sepupu nangka
NANGKA: Buah besar berduri yang berisi ulas kuning
KELAPA: Airnya segar dan isinya dibuat santan
BELIMBING: Buah berbentuk bintang apabila dipotong
DELIMA: Buah merah dengan biji berair di dalam
KIWI: Buah perang berbulu dengan isi hijau
ALPUKAT: Buah hijau berlemak yang dibuat jus
KURMA: Buah manis yang dimakan ketika berbuka puasa
STROBERI: Buah merah berbiji di luar
TEMBIKAI: Buah besar berkulit hijau, isinya merah dan berair
SALAK: Buah berkulit bersisik seperti ular
`),

  ms_negeri: E("Negeri dan Bandar Malaysia", `
JOHOR: Negeri paling selatan di Semenanjung Malaysia
KEDAH: Terkenal sebagai jelapang padi negara
KELANTAN: Negeri yang digelar Serambi Mekah
MELAKA: Negeri bersejarah dengan kota A Famosa
SELANGOR: Negeri yang mengelilingi Kuala Lumpur
PERAK: Negeri yang ibu negerinya Ipoh
PERLIS: Negeri paling kecil di Malaysia
PAHANG: Negeri terbesar di Semenanjung Malaysia
SABAH: Negeri di bawah bayu
SARAWAK: Bumi kenyalang
TERENGGANU: Negeri di pantai timur yang ada Pulau Redang
PUTRAJAYA: Pusat pentadbiran kerajaan persekutuan
KUALALUMPUR: Ibu negara Malaysia
PULAUPINANG: Negeri yang ibu negerinya George Town
IPOH: Bandar raya Perak yang terkenal dengan kopi putih
KLANG: Bandar diraja negeri Selangor
KUANTAN: Ibu negeri Pahang
KUCHING: Ibu negeri Sarawak
KANGAR: Ibu negeri Perlis
SHAHALAM: Ibu negeri Selangor
SEREMBAN: Ibu negeri Negeri Sembilan
MIRI: Bandar minyak di Sarawak
LANGKAWI: Pulau lagenda Mahsuri di Kedah
ALORSETAR: Ibu negeri Kedah
KOTABHARU: Ibu negeri Kelantan
MUAR: Bandar di Johor yang digelar Bandar Maharani
SIBU: Bandar di Sarawak di tepi Sungai Rajang
`),
};
