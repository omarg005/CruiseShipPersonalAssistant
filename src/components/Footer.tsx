export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur text-xs text-slate-600">
      <div className="max-w-6xl mx-auto px-4 py-3">
        © {new Date().getFullYear()} MV Horizon · Cruise Onboard Booking Demo
      </div>
    </footer>
  );
}


