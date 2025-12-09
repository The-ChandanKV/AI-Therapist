import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MoodType = 'Calm' | 'Happy' | 'Anxious' | 'Sad' | 'Energetic' | 'Stressed';

interface MoodEffectsProps {
    mood: MoodType;
}

const MoodEffects: React.FC<MoodEffectsProps> = ({ mood }) => {
    // Memoize mood configuration to prevent re-calculations during renders
    const particles = useMemo(() => {
        switch (mood) {
            case 'Calm':
                return Array.from({ length: 5 }).map((_, i) => ({
                    id: i,
                    size: Math.random() * 150 + 100,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    duration: Math.random() * 10 + 15,
                    type: 'circle'
                }));
            case 'Happy':
                return Array.from({ length: 12 }).map((_, i) => ({
                    id: i,
                    size: Math.random() * 60 + 30,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    duration: Math.random() * 2 + 2,
                    type: 'star'
                }));
            case 'Anxious':
                return Array.from({ length: 20 }).map((_, i) => ({
                    id: i,
                    size: Math.random() * 20 + 5,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    duration: Math.random() * 0.5 + 0.5,
                    type: 'dot'
                }));
            case 'Sad':
                return Array.from({ length: 15 }).map((_, i) => ({
                    id: i,
                    size: Math.random() * 6 + 2,
                    x: Math.random() * 100,
                    y: -10, // Start above screen
                    duration: Math.random() * 3 + 2,
                    type: 'rain'
                }));
            case 'Energetic':
                return Array.from({ length: 8 }).map((_, i) => ({
                    id: i,
                    size: Math.random() * 200 + 100,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    duration: Math.random() * 3 + 1,
                    type: 'burst'
                }));
            case 'Stressed':
                return Array.from({ length: 3 }).map((_, i) => ({
                    id: i,
                    size: Math.random() * 400 + 200,
                    x: 50,
                    y: 50,
                    duration: 4,
                    type: 'pulse'
                }));
            default:
                return [];
        }
    }, [mood]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={mood}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="w-full h-full relative"
                >
                    {particles.map((particle) => {
                        // Define unique animation properties for each mood type
                        let animateProps = {};
                        let initialProps = {};
                        let styleProps: any = {
                            position: 'absolute',
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                        };

                        if (particle.type === 'circle') { // Calm
                            styleProps = {
                                ...styleProps,
                                width: particle.size,
                                height: particle.size,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                filter: 'blur(40px)',
                            };
                            animateProps = {
                                x: [0, 50, -50, 0],
                                y: [0, -50, 50, 0],
                                scale: [1, 1.2, 1],
                            };
                        } else if (particle.type === 'star') { // Happy
                            styleProps = {
                                ...styleProps,
                                width: particle.size,
                                height: particle.size,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(255,240,150,0.6) 0%, rgba(255,255,255,0) 70%)',
                            };
                            animateProps = {
                                y: [0, -30, 0],
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                            };
                        } else if (particle.type === 'dot') { // Anxious
                            styleProps = {
                                ...styleProps,
                                width: particle.size,
                                height: particle.size,
                                borderRadius: '50%',
                                background: 'rgba(100, 116, 139, 0.4)',
                            };
                            animateProps = {
                                x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
                                y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
                            };
                        } else if (particle.type === 'rain') { // Sad
                            styleProps = {
                                ...styleProps,
                                left: `${particle.x}%`, // Random horizontal position
                                top: -20, // Start above
                                width: 2,
                                height: particle.size * 5,
                                background: 'rgba(255, 255, 255, 0.4)',
                            };
                            initialProps = { top: -50 };
                            animateProps = {
                                top: ['0%', '110%'], // Fall through screen
                            };
                            // Override mapped y for rain to make it fall
                        } else if (particle.type === 'burst') { // Energetic
                            styleProps = {
                                ...styleProps,
                                width: particle.size,
                                height: particle.size,
                                background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
                                borderRadius: '50%',
                            };
                            animateProps = {
                                scale: [0, 1.5, 0],
                                opacity: [0, 0.8, 0],
                            };
                        } else if (particle.type === 'pulse') { // Stressed
                            styleProps = {
                                ...styleProps,
                                left: '50%',
                                top: '50%',
                                x: '-50%',
                                y: '-50%',
                                width: particle.size,
                                height: particle.size,
                                borderRadius: '50%',
                                border: '2px solid rgba(255, 100, 100, 0.2)',
                                background: 'transparent',
                            };
                            animateProps = {
                                scale: [1, 1.5],
                                opacity: [0.5, 0],
                            };
                        }

                        return (
                            <motion.div
                                key={particle.id}
                                style={styleProps}
                                initial={initialProps}
                                animate={animateProps}
                                transition={{
                                    duration: particle.duration,
                                    display: 'infinity',
                                    repeat: Infinity,
                                    ease: particle.type === 'dot' ? 'linear' : 'easeInOut',
                                    repeatType: particle.type === 'burst' || particle.type === 'pulse' || particle.type === 'rain' ? 'loop' : 'mirror'
                                }}
                            />
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default MoodEffects;
