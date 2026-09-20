import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-bold text-purple-700 mb-6">
        လင်းလင်းဇော်
      </h1>
      <p className="text-xl text-gray-700 mb-8">
        English နှင့် တရုတ် စာတွေကို မြန်မာလို ဘာသာပြန်ပေးတဲ့ Website
      </p>
      <Link
        href="/translate"
        className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold px-8 py-4 rounded-lg shadow-lg transition"
      >
        📖 Translate Fiction စတင်ရန်
      </Link>

      <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">🌐 Multi-Language</h3>
          <p className="text-gray-600">English နှင့် Chinese စာတွေကို မြန်မာလို ပြန်ဆိုနိုင်</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">⚡ AI Powered</h3>
          <p className="text-gray-600">Google Gemini AI ကိုအသုံးပြုပြီး တိကျစွာ ဘာသာပြန်</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">📚 Fiction Focus</h3>
          <p className="text-gray-600">ဝတ္ထု၊ ဇာတ်လမ်းများအတွက် အထူးသင့်တော်</p>
        </div>
      </div>
    </div>
  )
}
