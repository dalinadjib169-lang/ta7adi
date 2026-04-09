import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TeacherDashboard from './components/TeacherDashboard';
import Game from './components/Game';
import { UserProfile, Rank, Challenge } from './types';
import { generateChallengeQuestions } from './questionGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, LogIn, LogOut, User, CheckCircle2 } from 'lucide-react';
import { getRankFromPoints } from './lib/utils';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, orderBy, or } from './lib/firebase';

const TEACHER_EMAILS = ["dalinadjib169@gmail.com", "dalinadjib1990@gmail.com", "profjoujou12@gmail.com", "joujouprof12@gmail.com"];

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentGameLevel, setCurrentGameLevel] = useState<number | null>(null);
  const [showNameSetup, setShowNameSetup] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const isTeacher = TEACHER_EMAILS.includes(user.email || '');
        
        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          const updatedProfile = { ...userData, role: isTeacher ? 'teacher' : 'student' } as UserProfile;
          setProfile(updatedProfile);
          if (!updatedProfile.displayName || updatedProfile.displayName === 'بطل الرياضيات') {
            setShowNameSetup(true);
          }
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'بطل الرياضيات',
            role: isTeacher ? 'teacher' : 'student',
            points: 0,
            level: 1,
            unlockedLevels: [1],
            rank: 'worm',
            lastActive: Date.now(),
            isOnline: true,
            bonusPoints: 0,
            levelScores: {},
          };
          await setDoc(userRef, newProfile);
          if (newProfile.role === 'student') {
            await setDoc(doc(db, 'profiles', user.uid), newProfile);
          }
          setProfile(newProfile);
          if (newProfile.role === 'student') setShowNameSetup(true);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  const handleSaveName = async () => {
    if (!tempName.trim() || !profile) return;
    const updated = { ...profile, displayName: tempName.trim() };
    await updateDoc(doc(db, 'users', profile.uid), { displayName: tempName.trim() });
    if (profile.role === 'student') {
      await updateDoc(doc(db, 'profiles', profile.uid), { displayName: tempName.trim() });
    }
    setProfile(updated);
    setShowNameSetup(false);
  };

  const handleGameComplete = async (score: number) => {
    if (!profile) return;
    const newPoints = profile.points + score;
    const newRank = getRankFromPoints(newPoints);
    const updated = { ...profile, points: newPoints, rank: newRank };
    
    await updateDoc(doc(db, 'users', profile.uid), { points: newPoints, rank: newRank });
    if (profile.role === 'student') {
      await updateDoc(doc(db, 'profiles', profile.uid), { points: newPoints, rank: newRank });
    }
    setProfile(updated);
    setCurrentGameLevel(null);
  };

  const handleChallenge = async (opponent: UserProfile) => {
    if (!profile) return;
    const challengeId = `${profile.uid}_${opponent.uid}_${Date.now()}`;
    const newChallenge: Challenge = {
      id: challengeId,
      challengerId: profile.uid,
      challengerName: profile.displayName,
      challengerRank: profile.rank,
      challengedId: opponent.uid,
      challengedName: opponent.displayName,
      challengedRank: opponent.rank,
      status: 'pending',
      timestamp: Date.now(),
      questions: generateChallengeQuestions(10)
    };
    await setDoc(doc(db, 'challenges', challengeId), newChallenge);
    alert(`تم إرسال التحدي لـ ${opponent.displayName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-purple-500/30">
      <AnimatePresence>
        {!profile ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles size={80} className="text-purple-500" />
              </motion.div>
              <div className="absolute -inset-4 bg-purple-500/20 blur-3xl -z-10" />
            </div>
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">MATH QUEST <span className="text-purple-500">2AM</span></h1>
            <p className="text-slate-400 mb-12 max-w-md text-lg">مغامرة الرياضيات الكبرى لتلاميذ السنة الثانية متوسط. تحدى أصدقاءك واجمع النقاط!</p>
            <button 
              onClick={() => signInWithPopup(auth, googleProvider)}
              className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-4 hover:bg-purple-500 hover:text-white transition-all shadow-2xl shadow-white/10"
            >
              <LogIn size={24} /> الدخول عبر Google
            </button>
          </motion.div>
        ) : showNameSetup ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
          >
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center" dir="rtl">
              <User size={48} className="mx-auto mb-6 text-purple-500" />
              <h2 className="text-2xl font-black text-white mb-2">مرحباً بك يا بطل!</h2>
              <p className="text-slate-400 mb-8">أدخل اسمك الحقيقي ليظهر في قائمة المتصدرين والتحديات.</p>
              <input 
                type="text" 
                placeholder="اسمك هنا..." 
                className="w-full bg-black border border-slate-800 rounded-2xl py-4 px-6 text-white text-center text-xl mb-6 focus:border-purple-500 outline-none transition-all"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
              <button 
                onClick={handleSaveName}
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-purple-500 transition-all"
              >
                <CheckCircle2 size={20} /> حفظ والبدء
              </button>
            </div>
          </motion.div>
        ) : currentGameLevel ? (
          <Game onComplete={handleGameComplete} onCancel={() => setCurrentGameLevel(null)} />
        ) : profile.role === 'teacher' ? (
          <TeacherDashboard profile={profile} onLogout={() => signOut(auth)} />
        ) : (
          <Dashboard 
            profile={profile} 
            onStartGame={() => setCurrentGameLevel(1)} 
            onLogout={() => signOut(auth)} 
            onChallenge={handleChallenge}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
