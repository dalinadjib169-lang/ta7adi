import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Swords, Brain, LogOut, Gift, User, Star, Shield, Trash2 } from 'lucide-react';
import { UserProfile, Challenge } from '../types';
import { db, collection, query, orderBy, limit, onSnapshot, where, doc, deleteDoc, updateDoc } from '../lib/firebase';
import { getRankIcon, getRankNameAr, cn } from '../lib/utils';

interface DashboardProps {
  profile: UserProfile;
  onStartGame: () => void;
  onLogout: () => void;
  onChallenge: (user: UserProfile) => void;
}

export default function Dashboard({ profile, onStartGame, onLogout, onChallenge }: DashboardProps) {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    // Leaderboard: Students only, ordered by points
    const q = query(
      collection(db, 'profiles'),
      where('role', '==', 'student'),
      orderBy('points', 'desc'),
      limit(10)
    );
    return onSnapshot(q, (snap) => {
      const users: UserProfile[] = [];
      snap.forEach(doc => users.push(doc.data() as UserProfile));
      setLeaderboard(users);
    });
  }, []);

  useEffect(() => {
    // Listen for challenges where user is involved
    const q = query(
      collection(db, 'challenges'),
      where('status', 'in', ['pending', 'accepted', 'playing']),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const docs: Challenge[] = [];
      snap.forEach(d => {
        const data = d.data() as Challenge;
        if (data.challengerId === profile.uid || data.challengedId === profile.uid) {
          docs.push(data);
        }
      });
      setChallenges(docs);
    });
  }, [profile.uid]);

  return (
    <div className="p-4 md:p-8 text-white max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
            {getRankIcon(profile.rank)}
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {profile.displayName}
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-normal">
                {getRankNameAr(profile.rank)}
              </span>
            </h2>
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Star size={14} fill="currentColor" />
              <span>{profile.points} نقطة</span>
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Action */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartGame}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-3xl mb-8 flex justify-between items-center shadow-xl shadow-purple-900/20 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-right relative z-10">
          <h2 className="text-2xl font-black mb-1">ابدأ رحلة الرياضيات</h2>
          <p className="opacity-80 text-sm">تحدى نفسك واجمع النقاط لتصل لرتبة التنين</p>
        </div>
        <Brain size={48} className="relative z-10 opacity-80 group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* Challenges Section */}
      <AnimatePresence>
        {challenges.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2 px-2">
              <Swords size={20} className="text-red-500" /> التحديات النشطة
            </h3>
            {challenges.map(challenge => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={challenge.id}
                className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="text-sm opacity-70">
                    {challenge.challengerId === profile.uid ? 'أنت تحديت' : 'تحدي من'}
                  </p>
                  <p className="font-bold">
                    {challenge.challengerId === profile.uid ? challenge.challengedName : challenge.challengerName}
                  </p>
                </div>
                <div className="flex gap-2">
                  {challenge.status === 'pending' && challenge.challengedId === profile.uid && (
                    <button className="bg-green-600 px-4 py-2 rounded-xl text-sm font-bold">قبول</button>
                  )}
                  <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                    {challenge.status === 'pending' ? 'بانتظار الرد' : 'جاري اللعب'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Leaderboard */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" /> لوحة المتصدرين
          </h3>
          <span className="text-xs text-slate-500">أفضل 10 تلاميذ</span>
        </div>
        
        <div className="space-y-3">
          {leaderboard.map((user, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={user.uid}
              className={cn(
                "flex justify-between items-center p-4 rounded-2xl transition-all",
                user.uid === profile.uid ? "bg-purple-600/20 border border-purple-500/30" : "bg-slate-800/40 hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-6 text-center font-black",
                  i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-slate-600"
                )}>
                  {i + 1}
                </span>
                <span className="text-xl">{getRankIcon(user.rank)}</span>
                <span className="font-bold truncate max-w-[120px] md:max-w-none">{user.displayName}</span>
                {user.uid === profile.uid && <span className="text-[10px] bg-purple-500 px-1.5 py-0.5 rounded text-white">أنت</span>}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-purple-400 font-black text-sm">{user.points}</p>
                  <p className="text-[10px] text-slate-500">نقطة</p>
                </div>
                {user.uid !== profile.uid && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onChallenge(user)}
                    className="w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all border border-red-500/20"
                  >
                    <Swords size={18} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
