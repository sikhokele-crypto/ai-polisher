// Inside handlePolish...
const data = await response.json();
if (data.polished) {
  setPolishedPrompt(data.polished);
  setHasResult(true);
  setHistory((prev) => [
    { original: messyIdea, polished: data.polished },
    ...prev
  ]);
}

// At the bottom of return...
{history.length > 0 && (
  <div className="mt-12 w-full max-w-2xl border-t border-gray-800 pt-8">
    <h2 className="text-xl font-bold text-white mb-6">Recent Polishes</h2>
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={index} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Original</p>
          <p className="text-gray-400 mb-3">{item.original}</p>
          <p className="text-xs font-bold text-blue-500 uppercase mb-1">Polished</p>
          <p className="text-white">{item.polished}</p>
        </div>
      ))}
    </div>
  </div>
)}