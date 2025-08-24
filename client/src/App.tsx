import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

interface YouTubeItem {
    title: string;
    channel_title: string;
    view_count: number;
    video_url: string;
    rank: number;
    subscriber_count?: number;  // 구독자 수 추가
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
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isLatestData, setIsLatestData] = useState<boolean>(true);
    const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('today'); // 'today', 'yesterday', 'weekAgo'

    // YouTube video ID에서 썸네일 URL 생성
    const generateThumbnailUrl = (videoUrl: string): string => {
        try {
            const url = new URL(videoUrl);
            const videoId = url.searchParams.get('v');
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
        } catch (e) {
            console.error('Invalid YouTube URL:', videoUrl);
        }
        return '';
    };

    // 조회수를 읽기 쉬운 형식으로 변환
    const formatViewCount = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    // 날짜를 읽기 쉬운 형식으로 변환
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    // 더미 데이터 생성 함수
    const createDummyData = (region: string) => {
        const dummyData: SnapshotData = {
            region: region,
            date: new Date().toISOString().split('T')[0],
            count: 10,
            items: [
                {
                    title: "테스트 동영상 1 - 매우 재미있는 콘텐츠입니다",
                    channel_title: "테스트 채널 1",
                    view_count: 1200000,
                    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    rank: 1,
                    subscriber_count: 2500000
                },
                {
                    title: "테스트 동영상 2 - 놀라운 발견",
                    channel_title: "테스트 채널 2",
                    view_count: 890000,
                    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    rank: 2,
                    subscriber_count: 1800000
                },
                {
                    title: "테스트 동영상 3 - 인기 급상승",
                    channel_title: "테스트 채널 3",
                    view_count: 567000,
                    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    rank: 3,
                    subscriber_count: 950000
                }
            ]
        };
        setSnapshotData(dummyData);
        setSelectedDate(dummyData.date);
        setIsLatestData(true);
    };

    const fetchLatestSnapshot = useCallback(async (region: string) => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching latest snapshot for region:', region);
            const response = await axios.get<SnapshotData>(`/api/snapshots/latest?region=${region}`);
            console.log('Latest snapshot response:', response.data);

            if (response.data.items && response.data.items.length > 0) {
                setSnapshotData(response.data);
                setSelectedDate(response.data.date);
                setIsLatestData(true);
            } else {
                // 더미 데이터 사용
                createDummyData(region);
            }
        } catch (err) {
            console.error('Error fetching latest snapshot:', err);
            setError('최신 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSnapshotByDate = async (region: string, date: string) => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching snapshot for region:', region, 'date:', date);
            const response = await axios.get<SnapshotData>(`/api/snapshots/${region}/${date}`);
            console.log('Date snapshot response:', response.data);

            if (response.data.items && response.data.items.length > 0) {
                setSnapshotData(response.data);
                setSelectedDate(date);
                setIsLatestData(false);
            } else {
                setError('해당 날짜에 데이터가 없습니다.');
            }
        } catch (err) {
            console.error('Error fetching snapshot by date:', err);
            setError('해당 날짜의 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchRegions();
    }, []);

    useEffect(() => {
        if (selectedRegion) {
            fetchLatestSnapshot(selectedRegion);
        }
    }, [selectedRegion, fetchLatestSnapshot]);

    const handleRegionChange = (region: string) => {
        setSelectedRegion(region);
    };

    const handleDateChange = (date: string) => {
        if (date) {
            fetchSnapshotByDate(selectedRegion, date);
        }
    };

    const handleLatestData = () => {
        fetchLatestSnapshot(selectedRegion);
        setSelectedTimeFilter('today');
    };

    const handleYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        handleDateChange(yesterdayStr);
        setSelectedTimeFilter('yesterday');
    };

    const handleWeekAgo = () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        handleDateChange(weekAgoStr);
        setSelectedTimeFilter('weekAgo');
    };

    const handleYouTubeClick = (url: string) => {
        console.log('handleYouTubeClick called with url:', url);
        if (url) {
            console.log('Opening URL in new tab:', url);
            window.open(url, '_blank');
        } else {
            console.log('No URL provided, cannot open');
        }
    };

    if (loading && !snapshotData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-600 text-lg font-medium">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 space-y-3 lg:space-y-0">
                        {/* Left side: Title and quick selection buttons */}
                        <div className="flex flex-col space-y-3">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    YouTube Top 10
                                </h1>
                                <p className="text-gray-600 text-sm">실시간 인기 동영상 순위</p>
                            </div>
                            
                            {/* 빠른 선택 버튼들 */}
                            <div className="flex flex-wrap items-center space-x-2">
                                <button
                                    onClick={handleLatestData}
                                    className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm ${selectedTimeFilter === 'today'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm'
                                        }`}
                                >
                                    🌟 오늘
                                </button>
                                <button
                                    onClick={handleYesterday}
                                    className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm ${selectedTimeFilter === 'yesterday'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm'
                                        }`}
                                >
                                    📅 어제
                                </button>
                                <button
                                    onClick={handleWeekAgo}
                                    className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm ${selectedTimeFilter === 'weekAgo'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm'
                                        }`}
                                >
                                    📆 일주일 전
                                </button>
                            </div>
                        </div>

                        {/* Right side: Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            {/* 지역 선택 */}
                            <select
                                value={selectedRegion}
                                onChange={(e) => handleRegionChange(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm text-sm"
                            >
                                {regions.map((region) => (
                                    <option key={region} value={region}>
                                        {region === 'KR' ? '🇰🇷 한국' : region === 'US' ? '🇺🇸 미국' : region === 'JP' ? '🇯🇵 일본' : region}
                                    </option>
                                ))}
                            </select>

                            {/* 날짜 선택 */}
                            <div className="relative">
                                <div
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-white transition-colors duration-200"
                                    onClick={() => {
                                        const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                                        if (dateInput) {
                                            dateInput.showPicker();
                                        }
                                    }}
                                >
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none cursor-pointer text-sm"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center">
                            <div className="text-red-400">
                                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {snapshotData && (
                    <div>
                        {/* Snapshot Info */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {selectedRegion === 'KR' ? '🇰🇷 한국' : selectedRegion === 'US' ? '🇺🇸 미국' : selectedRegion === 'JP' ? '🇯🇵 일본' : selectedRegion} Top 10
                                    </h2>
                                    <div className="flex items-center space-x-3 mt-2">
                                        <p className="text-gray-600 text-lg">
                                            📅 {formatDate(snapshotData.date)}
                                        </p>
                                        {!isLatestData && (
                                            <button
                                                onClick={handleLatestData}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition-colors duration-200"
                                            >
                                                오늘로
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">총 {snapshotData.count}개 동영상</p>
                                </div>
                            </div>
                        </div>

                        {/* YouTube Items List */}
                        <div className="space-y-4">
                            {snapshotData.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                                    onClick={() => {
                                        console.log('Item clicked:', index, item);
                                        console.log('Item video_url:', item.video_url);
                                        if (item.video_url) {
                                            handleYouTubeClick(item.video_url);
                                        } else {
                                            console.log('No video_url available for item:', index);
                                        }
                                    }}
                                >
                                    <div className="flex items-center p-6">
                                        {/* 순위 */}
                                        <div className="flex-shrink-0 mr-6">
                                            <span className={`inline-flex items-center justify-center w-16 h-16 text-xl font-bold rounded-2xl shadow-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                                        'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                                                }`}>
                                                {item.rank || index + 1}
                                            </span>
                                        </div>

                                        {/* 썸네일 */}
                                        <div className="flex-shrink-0 mr-6">
                                            <img
                                                src={generateThumbnailUrl(item.video_url)}
                                                alt={item.title}
                                                className="w-28 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://via.placeholder.com/112x80/cccccc/666666?text=No+Image';
                                                }}
                                            />
                                        </div>

                                        {/* 동영상 정보 */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-xl line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 text-base mb-2">{item.channel_title}</p>
                                            <p className="text-gray-500 text-sm">👁️ {formatViewCount(item.view_count)} 조회수</p>
                                            {item.subscriber_count !== undefined && (
                                                <p className="text-gray-500 text-sm">👥 {formatViewCount(item.subscriber_count)} 구독자</p>
                                            )}
                                        </div>

                                        {/* YouTube 링크 아이콘 */}
                                        <div className="flex-shrink-0 ml-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600 text-lg font-medium">새로운 데이터를 불러오는 중...</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
