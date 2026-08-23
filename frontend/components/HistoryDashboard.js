function HistoryDashboard({ filterType, filterParams }) {
    const canvasRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
        if (!canvasRef.current || !window.ChartJS) return;

        // Destroy previous chart
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        
        // Mock data selection based on filter
        let labels = [];
        let data = [];
        let label = 'Detections';

        if (filterType === 'today') {
            labels = STATS_DATA.today.labels;
            data = STATS_DATA.today.data;
            label = "Today's Incidents";
        } else if (filterType === 'week') {
            labels = STATS_DATA.week.labels;
            data = STATS_DATA.week.data;
            label = "Weekly Trend";
        } else if (filterType === 'month' || filterType === 'semester') {
            labels = STATS_DATA.month.labels;
            data = STATS_DATA.month.data;
            label = "Monthly Overview";
        } else {
            labels = ['00:00', '06:00', '12:00', '18:00'];
            data = [2, 5, 12, 8];
            label = "Hourly Activity";
        }

        chartInstance.current = new window.ChartJS(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: '#3b82f6',
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [filterType, filterParams]);

    const getTitle = () => {
        switch(filterType) {
            case 'today': return "Today's Activity Report";
            case 'week': return "Weekly Analysis";
            case 'month': return "Monthly Summary";
            case 'year': return "Annual Report";
            case 'semester': return `Semester Report (${filterParams?.start || '?'} - ${filterParams?.end || '?'})`;
            case 'specific_date': return `Report for ${filterParams?.date || 'Selected Date'}`;
            default: return "Historical Data";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">{getTitle()}</h3>
                    <button className="btn btn-outline text-sm border border-slate-300 hover:bg-slate-50">
                        <div className="icon-download w-4 h-4"></div> Export PDF
                    </button>
                </div>
                
                <div className="h-64 w-full">
                    <canvas ref={canvasRef}></canvas>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card">
                    <p className="text-sm text-slate-500 font-medium uppercase">Total Detections</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">124</p>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                        <div className="icon-trending-up w-4 h-4"></div>
                        <span>+12% from previous period</span>
                    </div>
                </div>
                <div className="card">
                    <p className="text-sm text-slate-500 font-medium uppercase">Most Frequent Type</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">Smoking</p>
                    <p className="text-sm text-slate-400 mt-2">45 incidents recorded</p>
                </div>
                <div className="card">
                    <p className="text-sm text-slate-500 font-medium uppercase">Fines Generated</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">$3,450</p>
                    <div className="flex items-center gap-1 mt-2 text-slate-500 text-sm">
                        <div className="icon-file-text w-4 h-4"></div>
                        <span>85 challans issued</span>
                    </div>
                </div>
            </div>

            {/* Detailed Table for History */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">Detailed Incident Log</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Infraction</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Student Info</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono">#INC-209</td>
                            <td className="px-4 py-3">2023-10-24 14:30</td>
                            <td className="px-4 py-3"><span className="text-red-600 font-medium">Fighting</span></td>
                            <td className="px-4 py-3">Sports Complex</td>
                            <td className="px-4 py-3">John Doe (CS-22)</td>
                            <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Resolved</span></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono">#INC-208</td>
                            <td className="px-4 py-3">2023-10-24 11:15</td>
                            <td className="px-4 py-3"><span className="text-orange-600 font-medium">Smoking</span></td>
                            <td className="px-4 py-3">Behind Library</td>
                            <td className="px-4 py-3">Unknown</td>
                            <td className="px-4 py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">Investigating</span></td>
                        </tr>
                         <tr className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono">#INC-207</td>
                            <td className="px-4 py-3">2023-10-23 09:45</td>
                            <td className="px-4 py-3"><span className="text-blue-600 font-medium">Littering</span></td>
                            <td className="px-4 py-3">Main Corridor</td>
                            <td className="px-4 py-3">Jane Smith (EE-23)</td>
                            <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Fined</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}