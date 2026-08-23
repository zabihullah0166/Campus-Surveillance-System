function LiveMonitor() {
    try {
        const [selectedCamera, setSelectedCamera] = React.useState('all');

        // Filter cameras if one is selected
        const displayedCameras = selectedCamera === 'all' 
            ? CAMERAS 
            : CAMERAS.filter(c => c.id === parseInt(selectedCamera));

        return (
            <div className="p-6 space-y-6">
                {/* Camera Selection Toolbar */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-slate-600">Select Feed:</label>
                        <select 
                            className="input-field max-w-xs"
                            value={selectedCamera}
                            onChange={(e) => setSelectedCamera(e.target.value)}
                        >
                            <option value="all">View All Cameras</option>
                            {CAMERAS.map(cam => (
                                <option key={cam.id} value={cam.id}>{cam.name} ({cam.location})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-primary text-sm">
                            <div className="icon-plus w-4 h-4"></div> Add Camera
                        </button>
                    </div>
                </div>

                {/* Camera Grid */}
                <div className={`grid gap-6 ${selectedCamera === 'all' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2' : 'grid-cols-1'}`}>
                    {displayedCameras.map(cam => (
                        <div key={cam.id} className="bg-slate-900 rounded-xl overflow-hidden shadow-lg relative group aspect-video">
                            {/* Camera Header Overlay */}
                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3 flex justify-between items-start z-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <span className="text-white text-xs font-mono font-bold uppercase tracking-wider">REC</span>
                                    </div>
                                    <h3 className="text-white text-sm font-medium mt-1">{cam.name}</h3>
                                </div>
                                <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-mono">
                                    {new Date().toLocaleTimeString()}
                                </div>
                            </div>

                            {/* Simulated Feed Image */}
                            <img src={cam.image} alt={cam.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                            {/* Simulated Detection Box (Just for visual effect on one camera) */}
                            {cam.id === 1 && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-48 border-2 border-red-500 rounded bg-red-500/10 flex flex-col items-center justify-end pb-2">
                                    <div className="bg-red-600 text-white text-[10px] px-1 py-0.5 rounded font-bold uppercase">Prohibited Action</div>
                                </div>
                            )}

                            {/* Camera Footer Controls */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-slate-300 text-xs">{cam.location}</span>
                                <div className="flex gap-2">
                                    <button className="p-1.5 bg-slate-700/50 hover:bg-slate-600 rounded text-white" title="Take Snapshot">
                                        <div className="icon-camera w-4 h-4"></div>
                                    </button>
                                    <button className="p-1.5 bg-slate-700/50 hover:bg-slate-600 rounded text-white" title="Expand">
                                        <div className="icon-maximize w-4 h-4"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Detections List (Below cameras for quick view) */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Live Incident Log</h3>
                        <span className="text-xs text-slate-500">Auto-updating...</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Identified ID</th>
                                    <th className="px-4 py-3">Severity</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {RECENT_INCIDENTS.map((incident) => (
                                    <tr key={incident.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-slate-600">{incident.time}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{incident.type}</td>
                                        <td className="px-4 py-3 text-slate-600">{incident.location}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">{incident.studentId}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                incident.severity === 'high' ? 'bg-red-100 text-red-700' : 
                                                incident.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {incident.severity.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-red-600 text-xs font-semibold">Pending Review</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('LiveMonitor error:', error);
        return <div className="p-4 text-red-500">Live Monitor Error</div>;
    }
}