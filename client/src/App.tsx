import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface YouTubeItem {
    title: string;
    channel: string;
    channel_title?: string;      // 채널명 (더 자세한 정보)
    subscriber_count?: number;  // 구독자 수
    view_count: number;
    thumbnail_url?: string;
    video_url?: string;
}

interface SnapshotData {
    region: string;
    date: string;
    count: number;
    items: YouTubeItem[];
}

interface RegionData {
    regions: string[];
}

function App() {
    const [regions, setRegions] = useState<string[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            setLoading(true);
            console.log('Fetching regions...');
            const response = await axios.get<RegionData>('/api/regions');
            console.log('Regions response:', response.data);
            setRegions(response.data.regions);
            if (response.data.regions.length > 0) {
                setSelectedRegion(response.data.regions[0]);
            }
        } catch (err) {
            console.error('Error fetching regions:', err);
            setError('지역 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestSnapshot = async (region: string) => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching snapshot for region:', region);
            const response = await axios.get<SnapshotData>(`/api/snapshots/latest?region=${region}`);
            console.log('Snapshot response:', response.data);

            // 테스트용 더미 데이터 (실제 데이터가 없을 때)
            if (!response.data.items || response.data.items.length === 0) {
                console.log('No items found, using dummy data for testing');
                const dummyData: SnapshotData = {
                    region: region,
                    date: new Date().toISOString().split('T')[0],
                    count: 10,
                    items: [
                        {
                            title: "테스트 동영상 1 - 매우 재미있는 콘텐츠입니다",
                            channel: "테스트 채널 1",
                            channel_title: "테스트 채널 1",
                            subscriber_count: 2500000,
                            view_count: 1200000,
                            thumbnail_url: "https://via.placeholder.com/240x160/ff0000/ffffff?text=Video+1",
                            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        },
                        {
                            title: "테스트 동영상 2 - 놀라운 발견",
                            channel: "테스트 채널 2",
                            channel_title: "테스트 채널 2",
                            subscriber_count: 1800000,
                            view_count: 890000,
                            thumbnail_url: "https://via.placeholder.com/240x160/00ff00/ffffff?text=Video+2",
                            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        },
                        {
                            title: "테스트 동영상 3 - 인기 급상승",
                            channel: "테스트 채널 3",
                            channel_title: "테스트 채널 3",
                            subscriber_count: 950000,
                            view_count: 567000,
                            thumbnail_url: "https://via.placeholder.com/240x160/0000ff/ffffff?text=Video+3",
                            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        }
                    ]
                };
                setSnapshotData(dummyData);
            } else {
                setSnapshotData(response.data);
            }
        } catch (err) {
            console.error('Error fetching snapshot:', err);
            setError('스냅샷 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedRegion) {
            fetchLatestSnapshot(selectedRegion);
        }
    }, [selectedRegion]);

    const handleRegionChange = (region: string) => {
        setSelectedRegion(region);
    };

    const handleYouTubeClick = (url: string) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    if (loading && !snapshotData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">YouTube Top 10</h1>
                            <p className="text-gray-600">실시간 인기 동영상 순위</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedRegion}
                                onChange={(e) => handleRegionChange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                {regions.map((region) => (
                                    <option key={region} value={region}>
                                        {region === 'KR' ? '한국' : region === 'US' ? '미국' : region === 'JP' ? '일본' : region}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="text-red-400">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {snapshotData && (
                    <div>
                        {/* Snapshot Info */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        {selectedRegion === 'KR' ? '한국' : selectedRegion === 'US' ? '미국' : selectedRegion === 'JP' ? '일본' : selectedRegion} Top 10
                                    </h2>
                                    <p className="text-gray-600">업데이트: {snapshotData.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">총 {snapshotData.count}개 동영상</p>
                                </div>
                            </div>
                        </div>

                        {/* YouTube Items List - 일렬로 표시 */}
                        <div className="space-y-4">
                            {snapshotData.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
                                    onClick={() => item.video_url && handleYouTubeClick(item.video_url)}
                                >
                                    <div className="flex items-center p-4">
                                        {/* 순위 */}
                                        <div className="flex-shrink-0 mr-4">
                                            <span className={`inline-flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-primary-100 text-primary-800'
                                                }`}>
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* 썸네일 */}
                                        <div className="flex-shrink-0 mr-4">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt={item.title}
                                                    className="w-24 h-16 object-cover rounded-md"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'https://via.placeholder.com/96x64/cccccc/666666?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-24 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* 동영상 정보 */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 text-lg line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-1">
                                                {item.channel_title || item.channel}
                                            </p>
                                            <div className="flex items-center space-x-4 text-gray-500 text-xs">
                                                <span>{item.view_count.toLocaleString()} 조회수</span>
                                                {item.subscriber_count && (
                                                    <span>{item.subscriber_count.toLocaleString()} 구독자</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* YouTube 링크 아이콘 */}
                                        <div className="flex-shrink-0 ml-4">
                                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2.003 2.833h15.994l-1.154 7.51L10 9.167l-6.843 1.176L2.003 2.833zM0 2.833C0 1.5.831.5 1.833.5h16.334C19.169.5 20 1.5 20 2.833v14.334C20 18.5 19.169 19.5 18.167 19.5H1.833C.831 19.5 0 18.5 0 17.167V2.833z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading && snapshotData && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">새로운 데이터를 불러오는 중...</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
