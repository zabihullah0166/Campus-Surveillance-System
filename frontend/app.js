// Important: DO NOT remove this `ErrorBoundary` component.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [activeView, setActiveView] = React.useState('live');
    const [historyFilter, setHistoryFilter] = React.useState('today');
    const [historyParams, setHistoryParams] = React.useState({});

    const handleViewChange = (view) => {
        setActiveView(view);
    };

    const handleHistoryFilterChange = (filter, params) => {
        setHistoryFilter(filter);
        setHistoryParams(params);
    };

    return (
      <div className="flex min-h-screen bg-[var(--bg-light)]" data-name="app" data-file="app.js">
        
        {/* Sidebar Navigation */}
        <Sidebar 
            activeView={activeView} 
            onViewChange={handleViewChange}
            onHistoryFilterChange={handleHistoryFilterChange}
        />

        {/* Main Content Area */}
        <main className="flex-1 ml-[var(--sidebar-width)] flex flex-col min-h-screen">
            <Header 
                title={activeView === 'live' ? 'Live Monitoring Center' : 'Historical Analysis'} 
                subtitle={activeView === 'live' ? 'Real-time surveillance feeds' : 'Review past incidents and statistics'}
            />

            <div className="flex-1 overflow-y-auto">
                {activeView === 'live' ? (
                    <LiveMonitor />
                ) : (
                    <HistoryDashboard 
                        filterType={historyFilter}
                        filterParams={historyParams}
                    />
                )}
            </div>
            
            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
                <p>&copy; 2025 University Security Department. All rights reserved. System Version 1.0.4</p>
            </footer>
        </main>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);