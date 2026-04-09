import React, { useState, useEffect } from 'react';
import { db, collection, query, orderBy, onSnapshot, where, doc, deleteDoc, updateDoc, limit } from '../lib/firebase';
import { Users, Swords, Trophy, LogOut, Shield, Trash2, Search, Star, ExternalLink } from 'lucide-react';
import { UserProfile, Challenge } from '../types';
import { getRankIcon, getRankNameAr } from '../lib/utils';

interface TeacherDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export default function TeacherDashboard({ profile, onLogout }: TeacherDashboardProps) {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState<'students' | 'challenges' | 'leaderboard'>('students');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubS = onSnapshot(
      query(collection(db, 'profiles'), where('role', '==', 'student'), orderBy('points', 'desc')),
      (snap) => {
        const docs: UserProfile[] = [];
        snap.forEach(d => docs.push(d.data() as UserProfile));
        setStudents(docs);
      }
    );

    const unsubC = onSnapshot(
      query(collection(db, 'challenges'), orderBy('timestamp', 'desc'), limit(50)),
      (snap) => {
        const docs: Challenge[] = [];
        snap.forEach(d => docs.push(d.data() as Challenge));
        setChallenges(docs);
      }
    );

    return () => { unsubS(); unsubC(); };
  }, []);

  const filteredStudents = students.filter(s => 
    s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteChallenge = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التحدي؟')) {
      await deleteDoc(doc(db, 'challenges', id));
    }
  };

  const handleGiveBonus = async (student: UserProfile) => {
    const amount = prompt('أدخل عدد النقاط الإضافية (مثلاً: 5):', '5');
    if (amount && !isNaN(Number(amount))) {
      const bonus = Number(amount);
      await updateDoc(doc(db, 'users', student.uid), {
        points: student.points + bonus,
        bonusPoints: (student.bonusPoints || 0) + bonus
      });
      await updateDoc(doc(db, 'profiles', student.uid), {
        points: student.points + bonus
      });
      alert(`تمت إضافة ${bonus} نقطة لـ ${student.displayName}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black">لوحة تحكم الأستاذ</h1>
            <p className="text-slate-400 text-sm">مرحباً بك، {profile.displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-500 block">إجمالي التلاميذ</span>
            <span className="font-bold">{students.length} تلميذ</span>
          </div>
          <button onClick={onLogout} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 bg-slate-900/30 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button 
          onClick={() => setActiveTab('students')}
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'students' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <Users size={18} /> التلاميذ
        </button>
        <button 
          onClick={() => setActiveTab('challenges')}
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'challenges' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <Swords size={18} /> التحديات
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'leaderboard' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <Trophy size={18} /> الترتيب
        </button>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="ابحث عن تلميذ بالاسم أو الإيميل..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:border-purple-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => (
                <div key={student.uid} className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getRankIcon(student.rank)}</div>
                      <div>
                        <h3 className="font-bold group-hover:text-purple-400 transition-colors">{student.displayName}</h3>
                        <p className="text-[10px] text-slate-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-black">{student.points}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{getRankNameAr(student.rank)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleGiveBonus(student)}
                      className="flex-1 bg-slate-800 hover:bg-purple-600 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Star size={14} /> مكافأة
                    </button>
                    <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-sm border-b border-slate-800">
                    <th className="p-4 font-bold">المتحدي</th>
                    <th className="p-4 font-bold">الخصم</th>
                    <th className="p-4 font-bold">الحالة</th>
                    <th className="p-4 font-bold">النتيجة</th>
                    <th className="p-4 font-bold">التوقيت</th>
                    <th className="p-4 font-bold">إدارة</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map(c => (
                    <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{getRankIcon(c.challengerRank || 'worm')}</span>
                          <span className="font-bold">{c.challengerName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{getRankIcon(c.challengedRank || 'worm')}</span>
                          <span className="font-bold">{c.challengedName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                          c.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          c.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-mono">
                        {c.challengerScore ?? '-'} : {c.challengedScore ?? '-'}
                      </td>
                      <td className="p-4 text-[10px] text-slate-500">
                        {new Date(c.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleDeleteChallenge(c.id)}
                          className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> ترتيب التلاميذ الرسمي
            </h2>
            <div className="space-y-3">
              {students.map((s, i) => (
                <div key={s.uid} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-black text-slate-600">{i + 1}</span>
                    <span className="text-2xl">{getRankIcon(s.rank)}</span>
                    <span className="font-bold">{s.displayName}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-purple-400 font-black">{s.points}</span>
                      <span className="text-[10px] text-slate-500 mr-1">نقطة</span>
                    </div>
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
                        style={{ width: `${Math.min(100, (s.points / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
