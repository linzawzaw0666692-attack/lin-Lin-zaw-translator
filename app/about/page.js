export default function About() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">ℹ️ အကြောင်း</h1>
      <p className="text-gray-700 mb-4 leading-relaxed">
        <strong>လင်းလင်းဇော်</strong> သည် English နှင့် တရုတ် ဘာသာဖြင့်ရေးသားထားသော
        ဝတ္ထုများ၊ ဇာတ်လမ်းများကို မြန်မာဘာသာသို့ အလွယ်တကူ ဘာသာပြန်နိုင်ရန်
        ဖန်တီးထားသော website ဖြစ်ပါသည်။
      </p>
      <p className="text-gray-700 mb-4 leading-relaxed">
        Google Gemini AI ကို အသုံးပြုထားပြီး အရည်အသွေးမြင့် ဘာသာပြန်ချက်များကို
        ရရှိနိုင်ပါသည်။
      </p>
      <h2 className="text-xl font-bold mt-6 mb-3">🚀 အသုံးပြုထားသော နည်းပညာများ</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>Next.js 14 (App Router)</li>
        <li>Tailwind CSS</li>
        <li>Google Gemini API</li>
        <li>Vercel Deployment</li>
      </ul>
    </div>
  )
}
