import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-5xl">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-3">
          လင်းလင်းဇော်
        </h1>
        <p className="text-gray-400 text-lg">
          English နှင့် တရုတ် စာတွေကို မြန်မာလို ဘာသာပြန်ပေးတဲ့ Website
        </p>
      </header>

      <Link
        href="/translate"
        className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black text-lg font-bold px-8 py-4 rounded-xl shadow-lg shadow-yellow-400/20 transition"
      >
        📖 Translate Fiction စတင်ရန်
      </Link>

      <div className="grid md:grid-cols-3 gap-5 mt-12">
        {[
          { icon: '🌐', title: 'Multi-Language', desc: 'English နှင့် Chinese စာတွေကို မြန်မာလို ပြန်ဆိုနိုင်' },
          { icon: '⚡', title: 'AI Powered', desc: 'Google Gemini AI ကိုအသုံးပြုပြီး တိကျစွာ ဘာသာပြန်' },
          { icon: '📚', title: 'Fiction Focus', desc: 'ဝတ္ထု၊ ဇာတ်လမ်းများအတွက် အထူးသင့်တော်' },
        ].map((card) => (
          <div key={card.title} className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 hover:border-yellow-400/40 transition">
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
            <p className="text-gray-400 text-sm">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
