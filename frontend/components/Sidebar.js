function Sidebar({ activeView, onViewChange, onHistoryFilterChange }) {
    try {
        const [isHistoryOpen, setIsHistoryOpen] = React.useState(true);
        const [semesterStart, setSemesterStart] = React.useState('');
        const [semesterEnd, setSemesterEnd] = React.useState('');
        const [specificDate, setSpecificDate] = React.useState('');

        const handleHistoryClick = (filterType, params = {}) => {
            onViewChange('history');
            onHistoryFilterChange(filterType, params);
        };

        return (
            <aside className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-[var(--primary-color)] text-white flex flex-col z-50">
                <div className="p-6 border-b border-slate-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
                        <div className="icon-shield text-white text-lg"></div>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Campus Surveillance System</h1>
                        <p className="text-xs text-slate-400">Admin Console</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3">
                    <div className="mb-2">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monitoring</p>
                        <button 
                            onClick={() => onViewChange('live')}
                            className={`w-full sidebar-link ${activeView === 'live' ? 'active' : ''}`}
                        >
                            <div className="icon-cctv w-5 h-5"></div>
                            <span>Live Camera Feeds</span>
                        </button>
                    </div>

                    <div className="mt-6">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Analytics</p>
                        
                        <button 
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            className="w-full sidebar-link justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="icon-history w-5 h-5"></div>
                                <span>History Logs</span>
                            </div>
                            <div className={`icon-chevron-down w-4 h-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`}></div>
                        </button>

                        {isHistoryOpen && (
                            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                                <button onClick={() => handleHistoryClick('today')} className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                                    Today's Detections
                                </button>
                                <button onClick={() => handleHistoryClick('week')} className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                                    Week's Detections
                                </button>
                                <button onClick={() => handleHistoryClick('month')} className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                                    Month's Detections
                                </button>
                                <button onClick={() => handleHistoryClick('year')} className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                                    Yearly Report
                                </button>
                                
                                {/* Semester Filter */}
                                <div className="px-4 py-2">
                                    <p className="text-xs text-slate-500 mb-2">Semester Filter</p>
                                    <div className="space-y-2">
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-800 border border-slate-600 rounded text-xs px-2 py-1 text-slate-300 focus:border-blue-500 outline-none"
                                            onChange={(e) => setSemesterStart(e.target.value)}
                                            placeholder="Start"
                                        />
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-800 border border-slate-600 rounded text-xs px-2 py-1 text-slate-300 focus:border-blue-500 outline-none"
                                            onChange={(e) => setSemesterEnd(e.target.value)}
                                            placeholder="End"
                                        />
                                        <button 
                                            onClick={() => handleHistoryClick('semester', { start: semesterStart, end: semesterEnd })}
                                            className="w-full bg-slate-700 hover:bg-slate-600 text-xs py-1 rounded text-slate-300"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                {/* Specific Date Filter */}
                                <div className="px-4 py-2 mt-2">
                                    <p className="text-xs text-slate-500 mb-2">Specific Date</p>
                                    <div className="flex gap-1">
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-800 border border-slate-600 rounded text-xs px-2 py-1 text-slate-300 focus:border-blue-500 outline-none"
                                            onChange={(e) => setSpecificDate(e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleHistoryClick('specific_date', { date: specificDate })}
                                            className="bg-slate-700 hover:bg-slate-600 px-2 rounded text-slate-300"
                                        >
                                            <div className="icon-arrow-right w-3 h-3"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">JD</div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">Admin User</p>
                            <p className="text-xs text-slate-400 truncate">Security Head</p>
                        </div>
                        <button className="text-slate-400 hover:text-white">
                            <div className="icon-log-out w-4 h-4"></div>
                        </button>
                    </div>
                </div>
            </aside>
        );
    } catch (error) {
        console.error('Sidebar error:', error);
        return <div className="p-4 text-red-500">Navigation Error</div>;
    }
}