import { useState, useEffect, useCallback } from 'react';
import { Search, MessageCircle, Star, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../config/api';

interface Skill {
  name: string;
  description: string;
  sessionsCompleted: number;
}

interface MatchedUser {
  _id: string;
  name: string;
  email: string;
  skillsOffered?: Skill[];
  skillsLearning?: Skill[];
  rating: number;
  reviewsCount: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface ChatResponse {
  _id: string;
  participants: Array<{_id: string, name: string, email: string}>;
  messages: Array<any>;
  sessionId?: string;
}

export default function SkillMatching() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async (skill?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching matches from:', `${API_URL}/users/providers`);
      console.log('With params:', skill ? { skill } : 'none');
      
      console.log('Fetching matches with token:', token ? 'Token exists' : 'No token');
      const response = await axios.get<MatchedUser[]>(`${API_URL}/users/providers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: skill ? { skill } : {},
        withCredentials: true
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      console.log('API Response:', response.data);
      console.log('Found users:', response.data?.length || 0);
      
      setMatchedUsers(response.data || []);
    } catch (error: unknown) {
      console.error('Error fetching matches:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        if (status === 401) {
          setError('Please log in to find skill matches');
        } else if (status === 403) {
          setError('Access denied. Please check your permissions.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Failed to fetch skill matches: ${message}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      
      setMatchedUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await fetchMatches(searchTerm.trim());
    } else {
      await fetchMatches();
    }
  }, [searchTerm, fetchMatches]);

  const startChat = useCallback(async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<ChatResponse>(`${API_URL}/chat/create`, 
        { participantId: userId },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data._id) {
        alert('Chat started! Check your Messages tab.');
        // Optionally navigate to chat: navigate(`/chat/${response.data._id}`);
      } else {
        alert('Failed to create chat');
      }
    } catch (error: unknown) {
      console.error('Error starting chat:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to start chat');
      } else {
        alert('An unexpected error occurred');
      }
    }
  }, []);

  useEffect(() => {
    console.log('SkillMatching component mounted');
    console.log('User data:', user);
    console.log('API_URL:', API_URL);
    
    // Test basic server connectivity first
    const testServerConnection = async () => {
      try {
        console.log('Testing server connection...');
        const testUrl = `${API_URL.replace('/api', '')}/health`;
        console.log('Testing URL:', testUrl);
        
        const response = await axios.get(testUrl, { 
          timeout: 5000,
          withCredentials: true 
        });
        
        console.log('Server is accessible:', response.status, response.data);
        
        // Test authentication
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Testing authenticated endpoint...');
          try {
            const authResponse = await axios.get(`${API_URL}/users/me`, {
              headers: { 'Authorization': `Bearer ${token}` },
              withCredentials: true
            });
            console.log('Authentication test successful:', authResponse.status);
            console.log('User data from /me:', authResponse.data);
          } catch (authError) {
            console.error('Authentication test failed:', authError);
          }
        } else {
          console.warn('No authentication token found');
        }
      } catch (error) {
        console.error('Server connection test failed:', error);
        if (axios.isAxiosError(error)) {
          console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            message: error.message,
            responseData: error.response?.data
          });
          
          if (error.response?.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (error.code === 'ECONNABORTED') {
            setError('Connection to server timed out. Please check your internet connection.');
          } else {
            setError(`Server error: ${error.message}`);
          }
        } else {
          setError('Failed to connect to server. Please try again later.');
        }
      }
    };
    
    testServerConnection();
    fetchMatches();
  }, [fetchMatches, user]);

  const getSkillMatches = (userSkills: Skill[]): Skill[] => {
    if (!user?.skillsLearning?.length) return [];
    
    return userSkills.filter(skill => 
      user.skillsLearning!.some(learning => 
        learning.name.toLowerCase().includes(skill.name.toLowerCase()) ||
        skill.name.toLowerCase().includes(learning.name.toLowerCase())
      )
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Search className="h-6 w-6 mr-2 text-purple-600" />
          Find Skill Partners
        </h2>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            <div className="flex items-center">
              <div className="mr-2">⚠️</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for skills (e.g., SQL, JavaScript, Guitar)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchMatches();
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300"
            >
              Show All
            </button>
          </div>
        </form>

        {/* Quick Skill Suggestions */}
        {user?.skillsLearning && user.skillsLearning.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills You Want to Learn</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsLearning.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(skill.name);
                    fetchMatches(skill.name);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full hover:from-green-200 hover:to-emerald-200 transition-colors"
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Finding matches...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedUsers.map((matchedUser) => {
              const skillMatches = getSkillMatches(matchedUser.skillsOffered || []);
              
              return (
                <div key={matchedUser._id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{matchedUser.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{matchedUser.rating.toFixed(1)}</span>
                        <span>({matchedUser.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Offered */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered:</h4>
                    <div className="space-y-2">
                      {matchedUser.skillsOffered && matchedUser.skillsOffered.length > 0 ? (
                        matchedUser.skillsOffered.map((skill, index) => (
                          <div 
                            key={index} 
                            className={`p-2 rounded-lg text-sm ${
                              skillMatches.some(match => match.name === skill.name)
                                ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="font-medium">{skill.name}</div>
                            <div className="text-xs opacity-75">{skill.sessionsCompleted} sessions completed</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 rounded-lg text-sm bg-gray-50 text-gray-500 text-center">
                          No skills added yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skill Matches Highlight */}
                  {skillMatches.length > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-700 mb-1">
                        🎯 Perfect Match!
                      </div>
                      <div className="text-xs text-green-600">
                        They can teach: {skillMatches.map(s => s.name).join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startChat(matchedUser._id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => startChat(matchedUser._id)}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Video className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && matchedUsers.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm 
                ? 'No users found with that skill. Try a different search term or click "Show All" to see everyone.' 
                : 'No users found. This might be a temporary issue - please try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}