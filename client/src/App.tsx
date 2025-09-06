// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

interface YouTubeItem {
  title: string;
  channel_title: string;
  view_count: number;
  video_url: string;
  rank: number;
  subscriber_count?: number;
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
  const [selectedTimeFilter, setSelectedTimeFilter] =
    useState<'today' | 'yesterday' | 'weekAgo'>('today');

  // ---------------- Helpers ----------------
  const generateThumbnailUrl = (videoUrl: string): string => {
    try {
      const u = new URL(videoUrl);
      let id = u.searchParams.get('v');
      if (!id && u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
      return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
    } catch {
      return '';
    }
  };

  const formatViewCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const formatDate = (s: string): string =>
    new Date(s).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

  const createDummyData = (region: string) => {
    const dummy: SnapshotData = {
      region,
      date: new Date().toISOString().split('T')[0],
      count: 10,
      items: [
        {
          title: '테스트 동영상 1 - 매우 재미있는 콘텐츠입니다',
          channel_title: '테스트 채널 1',
          view_count: 1_200_000,
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          rank: 1,
          subscriber_count: 2_500_000,
        },
        {
          title: '테스트 동영상 2 - 놀라운 발견',
          channel_title: '테스트 채널 2',
          view_count: 890_000,
          video_url: 'https://youtu.be/dQw4w9WgXcQ',
          rank: 2,
          subscriber_count: 1_800_000,
        },
        {
          title: '테스트 동영상 3 - 인기 급상승',
          channel_title: '테스트 채널 3',
          view_count: 567_000,
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          rank: 3,
          subscriber_count: 950_000,
        },
      ],
    };
    setSnapshotData(dummy);
    setSelectedDate(dummy.date);
    setIsLatestData(true);
  };

  const fetchLatestSnapshot = useCallback(async (region: string) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get<SnapshotData>(`/api/snapshots/latest?region=${region}`);
      if (data.items?.length) {
        setSnapshotData(data);
        setSelectedDate(data.date);
        setIsLatestData(true);
      } else {
        createDummyData(region);
      }
    } catch (e) {
      console.error(e);
      setError('최신 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSnapshotByDate = async (region: string, date: string) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get<SnapshotData>(`/api/snapshots/${region}/${date}`);
      if (data.items?.length) {
        setSnapshotData(data);
        setSelectedDate(date);
        setIsLatestData(false);
      } else {
        setError('해당 날짜에 데이터가 없습니다.');
      }
    } catch (e) {
      console.error(e);
      setError('해당 날짜의 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<RegionData>('/api/regions');
      setRegions(data.regions);
      if (data.regions.length) setSelectedRegion(data.regions[0]);
    } catch (e) {
      console.error(e);
      setError('지역 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegions(); }, []);
  useEffect(() => { if (selectedRegion) fetchLatestSnapshot(selectedRegion); }, [selectedRegion, fetchLatestSnapshot]);

  const handleDateChange = (date: string) => { if (date) fetchSnapshotByDate(selectedRegion, date); };
  const handleLatestData = () => { fetchLatestSnapshot(selectedRegion); setSelectedTimeFilter('today'); };
  const handleYesterday = () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    setSelectedTimeFilter('yesterday');
    handleDateChange(d.toISOString().split('T')[0]);
  };
  const handleWeekAgo = () => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    setSelectedTimeFilter('weekAgo');
    handleDateChange(d.toISOString().split('T')[0]);
  };
  const handleYouTubeClick = (url: string) => { if (url) window.open(url, '_blank'); };

  if (loading && !snapshotData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600 text-base sm:text-lg font-medium">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col py-3 lg:py-4 gap-2 sm:gap-3">
            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                YouTube Top 10
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">실시간 인기 동영상 순위</p>
            </div>

            {/* Toolbar: buttons + pickers all in one row; pickers right after '일주일 전' */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={handleLatestData}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  selectedTimeFilter === 'today'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm'
                }`}
              >
                🌟 오늘
              </button>
              <button
                onClick={handleYesterday}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  selectedTimeFilter === 'yesterday'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm'
                }`}
              >
                📅 어제
              </button>
              <button
                onClick={handleWeekAgo}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  selectedTimeFilter === 'weekAgo'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm'
                }`}
              >
                📆 일주일 전
              </button>

              {/* Spacer to keep "enough space" before pickers */}
              <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

              {/* Region picker */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="shrink-0 w-auto px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm text-sm"
                aria-label="지역 선택"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region === 'KR' ? '🇰🇷 한국' : region === 'US' ? '🇺🇸 미국' : region === 'JP' ? '🇯🇵 일본' : region}
                  </option>
                ))}
              </select>

              <div className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-white transition-colors duration-200"
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
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4 sm:p-6 shadow-lg">
            <p className="text-red-800 text-sm sm:text-base font-medium">{error}</p>
          </div>
        )}

        {snapshotData && (
          <div>
            {/* Snapshot Info */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-5 sm:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {selectedRegion === 'KR'
                      ? '🇰🇷 한국'
                      : selectedRegion === 'US'
                      ? '🇺🇸 미국'
                      : selectedRegion === 'JP'
                      ? '🇯🇵 일본'
                      : selectedRegion}{' '}
                    Top 10
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600 text-sm sm:text-base">📅 {formatDate(snapshotData.date)}</p>
                    {!isLatestData && (
                      <button
                        onClick={handleLatestData}
                        className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-full hover:bg-blue-200 transition-colors"
                      >
                        오늘로
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">총 {snapshotData.count}개 동영상</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 sm:space-y-4">
              {snapshotData.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer group"
                  onClick={() => item.video_url && handleYouTubeClick(item.video_url)}
                >
                  <div className="flex items-center p-4 sm:p-6 gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
                          text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-lg
                          ${
                            index === 0
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                              : index === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                              : index === 2
                              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                              : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                          }`}
                      >
                        {item.rank || index + 1}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={generateThumbnailUrl(item.video_url)}
                        alt={item.title}
                        className="w-24 h-16 sm:w-28 sm:h-20 object-cover rounded-lg sm:rounded-xl shadow-md group-hover:shadow-lg transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/112x80/cccccc/666666?text=No+Image';
                        }}
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg md:text-xl line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base mb-1">{item.channel_title}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <p className="text-gray-500 text-xs sm:text-sm">👁️ {formatViewCount(item.view_count)} 조회수</p>
                        {item.subscriber_count !== undefined && (
                          <p className="text-gray-500 text-xs sm:text-sm">👥 {formatViewCount(item.subscriber_count)} 구독자</p>
                        )}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0 ml-2 sm:ml-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:from-red-600 group-hover:to-red-700 transition-transform duration-300 group-hover:scale-105 shadow-lg">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-gray-600 text-base font-medium">새로운 데이터를 불러오는 중...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
