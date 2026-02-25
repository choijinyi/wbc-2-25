import WBCAnalyzer from '@/components/WBCAnalyzer';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl font-serif">
            WBC Style Commentary Generator
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Generate comprehensive biblical exegesis in the style of the Word Biblical Commentary series.
            Includes bibliography, translation, notes, form/structure, comment, and explanation.
          </p>
        </div>
        
        <WBCAnalyzer />
        
        <footer className="text-center text-stone-500 text-sm pt-8">
          <p>Powered by Google Gemini AI. Generated content should be verified against standard scholarly resources.</p>
        </footer>
      </div>
    </main>
  );
}
