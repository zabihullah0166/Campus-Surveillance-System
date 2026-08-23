function Header({ title, subtitle }) {
    return (
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-40">
            <div>
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-semibold uppercase tracking-wide">System Active</span>
                </div>

                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                    <div className="icon-bell w-5 h-5"></div>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                    <div className="icon-settings w-5 h-5"></div>
                </button>
            </div>
        </header>
    );
}