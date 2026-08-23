const CAMERAS = [
    { id: 1, name: 'Main Gate Entrance', location: 'Gate A', status: 'active', image: '/video_feed'},
    { id: 2, name: 'Library Corridor', location: 'Block B', status: 'active', image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Cafeteria Area', location: 'Student Center', status: 'active', image: 'https://images.unsplash.com/photo-1554200876-56c2f25224fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'Parking Lot C', location: 'North Wing', status: 'active', image: 'https://images.unsplash.com/photo-1590674899505-1c5f4199bf5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

const RECENT_INCIDENTS = [
    { id: 101, type: 'Smoking', location: 'Cafeteria Area', time: '10:42 AM', studentId: 'CS-2023-045', severity: 'medium' },
    { id: 102, type: 'Littering', location: 'Library Corridor', time: '09:15 AM', studentId: 'EE-2022-112', severity: 'low' },
    { id: 103, type: 'Aggressive Behavior', location: 'Main Gate Entrance', time: 'Yesterday', studentId: 'BBA-2024-001', severity: 'high' },
    { id: 104, type: 'Prohibited Grouping', location: 'Parking Lot C', time: 'Yesterday', studentId: 'Unknown', severity: 'medium' },
];

const STATS_DATA = {
    today: { labels: ['Smoking', 'Fighting', 'Littering', 'Harassment'], data: [2, 0, 5, 1] },
    week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [12, 19, 3, 5, 2, 3, 9] },
    month: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [45, 32, 55, 40] }
};
