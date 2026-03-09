/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowLeft, Share2, Music, Volume2, VolumeX, Camera, Download } from 'lucide-react';
import Matter from 'matter-js';
import html2canvas from 'html2canvas';

// --- CONSTANTS ---
const GAME_ASSETS = {
  bg: {
    loading: 'https://picui.ogmua.cn/s1/2026/03/09/69ae9531cd5e0.webp',
    map: 'https://picui.ogmua.cn/s1/2026/03/09/69ae92f8432d3.webp',
    intro: 'https://picui.ogmua.cn/s1/2026/03/09/69ae94b9e8524.webp',
    market: 'https://picui.ogmua.cn/s1/2026/03/09/69ae929c88f3c.webp',
    scenery: 'https://picsum.photos/seed/jiangcun_scenery_final/800/800', // 蒋村水乡美景 (Picsum)
  },
  sprites: {
    leaf: 'https://cdn-icons-png.flaticon.com/512/892/892917.png',
    ip_character: 'https://cdn-icons-png.flaticon.com/512/4392/4392525.png',
    landmark: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
    card_back: 'https://picui.ogmua.cn/s1/2026/03/09/69ae9595a27ce.webp',
    boat: 'https://picui.ogmua.cn/s1/2026/03/09/69aeb2da1a7c9.webp',
    fish: 'https://picui.ogmua.cn/s1/2026/03/09/69aeb2d670837.webp',
    shell1: 'https://picui.ogmua.cn/s1/2026/03/09/69aeb2d7817b8.webp', // 小蚌壳
    shell2: 'https://picui.ogmua.cn/s1/2026/03/09/69aeb2d632392.webp', // 大河蚌
    shell3: 'https://picui.ogmua.cn/s1/2026/03/09/69aeb2e27a680.webp', // 抛光海蠡壳
    shell4: 'https://picui.ogmua.cn/s1/2026/03/09/69aeb2e50012e.webp', // 蠡壳窗切片
    shell5: 'https://picui.ogmua.cn/s1/2026/03/09/69aeb2e693bb6.webp', // 完整的精美蠡壳窗
    cat: 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
    tree: 'https://cdn-icons-png.flaticon.com/512/489/489969.png',
    bench: 'https://cdn-icons-png.flaticon.com/512/2553/2553753.png',
    pot: 'https://cdn-icons-png.flaticon.com/512/628/628283.png',
  },
  foods: [
    { id: 'f1', name: '萝卜丝油墩子', img: 'https://picui.ogmua.cn/s1/2026/03/09/69ae963740010.webp', desc: '萝卜丝油墩子以面糊裹调味萝卜丝用专用铁模热油深炸而成。外皮金黄酥脆，内里萝卜丝清甜多汁。' },
    { id: 'f2', name: '蒋村臭豆腐', img: 'https://picui.ogmua.cn/s1/2026/03/09/69ae9674112b0.webp', desc: '蒋村臭豆腐采用传统发酵工艺与本地酱料调味，热油现炸。外皮金黄酥脆，内里软嫩多汁。' },
    { id: 'f3', name: '蒋家漾河虾', img: 'https://picui.ogmua.cn/s1/2026/03/09/69ae969d2a1e4.webp', desc: '蒋家漾河虾肉质紧实鲜甜、干净无泥腥味，多以白灼或油爆做法，最大程度保留河鲜本味，是蒋村水乡极具代表性的时令鲜货' },
    { id: 'f4', name: '银杏鸡蛋糕', img: 'https://picui.ogmua.cn/s1/2026/03/09/69ae95f6063a8.webp', desc: '银杏鸡蛋糕，是嘉善县天凝镇蒋村村的代表性非遗小吃以村内千年银杏文化冠名。' },
    { id: 'f5', name: '红烧河鳗', img: 'https://picui.ogmua.cn/s1/2026/03/09/69ae96dc86eae.webp', desc: '红烧河鳗选用鲜活河鳗，以红烧慢炖入味。肉质软糯肥嫩，酱汁浓醇鲜香，营养滋补。' },
    { id: 'f6', name: '酱爆螺蛳', img: 'https://picui.ogmua.cn/s1/2026/03/09/69ae96ee46fa2.webp', desc: '酱爆螺蛳以鲜活螺蛳为主料，用豆瓣酱、葱姜蒜大火快炒酱香浓郁、鲜辣入味，嗦起来鲜爽过瘾。' },
  ],
  audio: {
    ambient: 'https://www.soundjay.com/nature/river-1.mp3',
    match: 'https://www.soundjay.com/buttons/button-3.mp3',
  }
};

const PUZZLE_IMG = 'https://picui.ogmua.cn/s1/2026/03/09/69ada4fe76adc.webp';

const LANDMARKS = [
  { id: 1, name: '蒋村市集', x: '20%', y: '30%' },
  { id: 2, name: '蒋村水系', x: '70%', y: '25%' },
  { id: 3, name: '非遗工坊', x: '50%', y: '50%' },
  { id: 4, name: '岁月相馆', x: '30%', y: '75%' },
  { id: 5, name: '漾里会客厅', x: '75%', y: '80%' },
];

// --- Level 2: 蒋村水系捕鱼 ---
const Level2 = ({ onComplete }: { onComplete: () => void }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [score, setScore] = useState(0);
  const [showCert, setShowCert] = useState(false);
  
  // 游戏状态
  const [hook, setHook] = useState({
    angle: 0,
    length: 60,
    status: 'SWINGING' as 'SWINGING' | 'EXTENDING' | 'RETRACTING',
    caughtFishId: null as number | null
  });

  const [fishes, setFishes] = useState<{ id: number; x: number; y: number; speed: number; direction: number; width: number; height: number; active: boolean; type: number }[]>([]);

  // 辅助：记录点击位置用于转向
  const [steerDir, setSteerDir] = useState(0);

  // 初始化尺寸和鱼群
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
        
        // 初始化 12 条鱼，增加多样性
        const newFishes = Array.from({ length: 12 }).map((_, i) => ({
          id: i,
          x: Math.random() * clientWidth,
          y: 180 + Math.random() * (clientHeight - 300),
          speed: 0.3 + Math.random() * 0.7,
          direction: Math.random() > 0.5 ? 1 : -1,
          width: 30 + Math.random() * 50,
          height: 25 + Math.random() * 30,
          active: true,
          type: Math.floor(Math.random() * 4)
        }));
        setFishes(newFishes);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 游戏循环
  useEffect(() => {
    if (dimensions.width === 0) return;

    let animationFrameId: number;
    let swingDirection = 1;

    const update = () => {
      // 1. 更新鱼的位置
      setFishes(prevFishes => prevFishes.map(f => {
        if (!f.active) return f;
        let newX = f.x + f.speed * f.direction;
        let newDir = f.direction;
        if (newX > dimensions.width - f.width || newX < 0) newDir *= -1;
        return { ...f, x: newX, direction: newDir };
      }));

      // 2. 更新钩子状态
      setHook(prevHook => {
        let { angle, length, status, caughtFishId } = prevHook;

        if (status === 'SWINGING') {
          angle += 1.0 * swingDirection;
          if (angle > 70 || angle < -70) swingDirection *= -1;
        } else if (status === 'EXTENDING' || status === 'RETRACTING') {
          // 转向逻辑：发出的钩子可以改变角度
          if (steerDir !== 0) {
            angle += steerDir * 1.5;
            // 限制角度
            if (angle > 85) angle = 85;
            if (angle < -85) angle = -85;
          }

          if (status === 'EXTENDING') {
            length += 12;
            if (length > dimensions.height * 0.95) status = 'RETRACTING';
            
            // 碰撞检测
            const hookX = dimensions.width / 2 + Math.sin(angle * Math.PI / 180) * length;
            const hookY = 40 + Math.cos(angle * Math.PI / 180) * length;

            fishes.forEach(f => {
              if (f.active && !caughtFishId) {
                if (hookX > f.x && hookX < f.x + f.width && hookY > f.y && hookY < f.y + f.height) {
                  caughtFishId = f.id;
                  status = 'RETRACTING';
                }
              }
            });
          } else {
            length -= caughtFishId ? 6 : 18;
            if (length <= 60) {
              length = 60;
              status = 'SWINGING';
              if (caughtFishId !== null) {
                setScore(s => s + 1);
                setFishes(fs => fs.map(f => f.id === caughtFishId ? { ...f, active: false } : f));
                caughtFishId = null;
              }
            }
          }
        }

        return { angle, length, status, caughtFishId };
      });

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, fishes, steerDir]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const isLeft = clickX < rect.width / 2;

    if (hook.status === 'SWINGING') {
      setHook(h => ({ ...h, status: 'EXTENDING' }));
    } else {
      // 转向：点击左侧往左偏，右侧往右偏
      setSteerDir(isLeft ? -1 : 1);
    }
  };

  const handlePointerUp = () => {
    setSteerDir(0);
  };

  useEffect(() => {
    if (score >= 6) { // 增加到6条鱼通关
      setTimeout(() => setShowCert(true), 1000);
    }
  }, [score]);

  return (
    <div 
      id="level-2" 
      className="flex-1 relative overflow-hidden bg-[#1a3a3a]"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      ref={containerRef}
    >
      {/* 深海背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4a7c7a] via-[#2c3e50] to-[#1a2a3a]" />

      {/* 水下氛围：焦散光影 (Caustics) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/water/800/800')] bg-cover animate-[pulse_4s_infinite] scale-150" style={{ filter: 'contrast(150%) brightness(150%) blur(20px)' }} />
      </div>

      {/* 远景海草 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none flex justify-around items-end opacity-40">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-4 bg-[#2d4a4a] rounded-t-full"
            style={{ height: 60 + Math.random() * 60 }}
            animate={{ skewX: [-5, 5, -5] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* 气泡 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full border border-white/5"
            style={{ 
              width: Math.random() * 8 + 4, 
              height: Math.random() * 8 + 4,
              left: `${Math.random() * 100}%`,
              bottom: -20
            }}
            animate={{ 
              y: -dimensions.height - 50,
              x: [0, 15, -15, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{ 
              duration: 6 + Math.random() * 6, 
              repeat: Infinity, 
              delay: Math.random() * 8 
            }}
          />
        ))}
      </div>
      
      {/* 顶部渔船 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <img 
          src={GAME_ASSETS.sprites.boat} 
          alt="boat" 
          className="w-44 h-28 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" 
        />
      </div>

      {/* 渔网/钩子 */}
      <div 
        className="absolute top-10 left-1/2 origin-top z-10"
        style={{ 
          transform: `translateX(-50%) rotate(${-hook.angle}deg)`,
          height: `${hook.length}px`
        }}
      >
        {/* 绳索 */}
        <div className="w-0.5 h-full bg-white/60 mx-auto shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
        {/* 钩子/网 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div className="w-14 h-14 border-4 border-white/80 rounded-full border-t-transparent relative shadow-2xl backdrop-blur-[1px]">
            <div className="absolute inset-0 flex items-center justify-center">
               {hook.caughtFishId !== null && (
                 <img 
                   src={GAME_ASSETS.sprites.fish} 
                   className="w-12 h-12 animate-pulse" 
                   alt="caught" 
                   style={{ transform: `rotate(${hook.angle}deg)` }}
                 />
               )}
            </div>
          </div>
        </div>
      </div>

      {/* 鱼群 */}
      {fishes.map(f => f.active && (
        <div 
          key={f.id}
          className="absolute pointer-events-none"
          style={{ 
            left: `${f.x}px`, 
            top: `${f.y}px`,
            transform: `scaleX(${f.direction})`
          }}
        >
          <img 
            src={GAME_ASSETS.sprites.fish} 
            alt="fish" 
            style={{ width: `${f.width}px`, height: `${f.height}px`, opacity: 0.7 }}
            className="drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)]"
          />
        </div>
      ))}

      {/* 计分板 */}
      <div className="absolute top-6 left-6 bg-black/30 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-2xl z-30 border border-white/10">
        <div className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">Mission Progress</div>
        <div className="text-xl font-bold text-white font-mono tracking-tighter">
          {score} <span className="text-white/30">/</span> 6
        </div>
      </div>

      {/* 证书弹窗 */}
      <AnimatePresence>
        {showCert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a1a1a]/90 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#fdfcf0] p-10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-[10px] border-[#4a7c7a] max-w-sm w-full text-center relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-red-700 rounded-full flex items-center justify-center text-white font-bold border-8 border-[#fdfcf0] -rotate-12 shadow-2xl text-2xl font-serif">
                合格
              </div>
              <h2 className="text-4xl font-bold text-[#2c3e50] mt-10 mb-8 font-serif tracking-[0.1em]">蒋村荣誉</h2>
              <div className="border-4 border-[#4a7c7a]/20 p-8 mb-8 italic text-[#2c3e50] bg-white/40 rounded-2xl leading-relaxed">
                <p className="mb-4 text-left text-sm opacity-60">CERTIFICATE OF HERITAGE</p>
                <p className="text-3xl font-bold not-italic my-8 underline decoration-[#4a7c7a] decoration-8 underline-offset-[12px]">蒋村漫游者</p>
                <p className="text-left text-lg">在漾里水系表现卓越，正式授予</p>
                <p className="text-2xl font-bold text-[#4a7c7a] mt-6">“蒋村首席踏白船传承人”</p>
                <p className="text-right mt-4 opacity-80">荣誉称号。</p>
              </div>
              <button 
                onClick={onComplete}
                className="w-full py-5 bg-[#4a7c7a] text-white rounded-2xl font-bold shadow-2xl hover:bg-[#3a6c6a] transition-all active:scale-95 text-lg tracking-widest"
              >
                收下荣誉，继续漫游
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示文字 */}
      <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
        <div className="inline-block bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          <p className="text-white/80 text-xs tracking-[0.3em] font-light">
            点击发射 · 长按左右转向控制深度
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Level 3: 非遗工坊 | 蠡壳窗“合成大西瓜” ---
const Level3 = ({ onComplete }: { onComplete: () => void }) => {
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const engineRef = React.useRef<Matter.Engine | null>(null);
  const [score, setScore] = useState(0);
  const [showCert, setShowCert] = useState(false);
  const [nextType, setNextType] = useState(0);
  const [previewX, setPreviewX] = useState<number | null>(null);

  const EVOLUTION_CHAIN = [
    { name: '小蚌壳', size: 25, img: GAME_ASSETS.sprites.shell1 },
    { name: '大河蚌', size: 35, img: GAME_ASSETS.sprites.shell2 },
    { name: '抛光海蠡壳', size: 45, img: GAME_ASSETS.sprites.shell3 },
    { name: '蠡壳窗切片', size: 60, img: GAME_ASSETS.sprites.shell4 },
    { name: '完整的精美蠡壳窗', size: 85, img: GAME_ASSETS.sprites.shell5 }
  ];

  useEffect(() => {
    if (!sceneRef.current) return;

    const { clientWidth, clientHeight } = sceneRef.current;
    
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: clientWidth,
        height: clientHeight,
        wireframes: false,
        background: 'transparent'
      }
    });

    const runner = Matter.Runner.create();
    engineRef.current = engine;

    const ground = Matter.Bodies.rectangle(clientWidth / 2, clientHeight + 25, clientWidth, 50, { isStatic: true, render: { visible: false } });
    const leftWall = Matter.Bodies.rectangle(-25, clientHeight / 2, 50, clientHeight, { isStatic: true, render: { visible: false } });
    const rightWall = Matter.Bodies.rectangle(clientWidth + 25, clientHeight / 2, 50, clientHeight, { isStatic: true, render: { visible: false } });
    
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA as any;
        const bodyB = pair.bodyB as any;

        if (bodyA.label === bodyB.label && bodyA.label.startsWith('shell_')) {
          const level = parseInt(bodyA.label.split('_')[1]);
          if (level < EVOLUTION_CHAIN.length - 1) {
            const midX = (bodyA.position.x + bodyB.position.x) / 2;
            const midY = (bodyA.position.y + bodyB.position.y) / 2;
            
            Matter.World.remove(engine.world, [bodyA, bodyB]);
            
            const nextLevel = level + 1;
            const newShell = createShell(midX, midY, nextLevel);
            Matter.World.add(engine.world, newShell);
            
            setScore(s => s + (nextLevel + 1) * 10);
            
            if (nextLevel === EVOLUTION_CHAIN.length - 1) {
              setTimeout(() => setShowCert(true), 1000);
            }
          }
        }
      });
    });

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.World.clear(engine.world, false);
      render.canvas.remove();
    };
  }, []);

  const createShell = (x: number, y: number, level: number) => {
    const config = EVOLUTION_CHAIN[level];
    return Matter.Bodies.circle(x, y, config.size, {
      label: `shell_${level}`,
      restitution: 0.2,
      friction: 0.1,
      render: {
        sprite: {
          texture: config.img,
          xScale: (config.size * 2) / 512, // 假设图标原始大小是 512
          yScale: (config.size * 2) / 512
        }
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sceneRef.current || showCert) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = Math.max(30, Math.min(rect.width - 30, e.clientX - rect.left));
    setPreviewX(x);
  };

  const handleDrop = (e: React.MouseEvent) => {
    if (!sceneRef.current || !engineRef.current || showCert) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = Math.max(30, Math.min(rect.width - 30, e.clientX - rect.left));
    
    const newShell = createShell(x, 50, nextType);
    Matter.World.add(engineRef.current.world, newShell);
    setNextType(Math.floor(Math.random() * 3));
  };

  return (
    <div id="level-3" className="flex-1 relative overflow-hidden bg-[#f5f5f0] flex flex-col" onMouseMove={handleMouseMove} onMouseLeave={() => setPreviewX(null)} onClick={handleDrop}>
      <div className="p-6 bg-white/50 backdrop-blur-md border-b border-[#5a5a40]/10 z-10 pointer-events-none">
        <h2 className="text-xl font-bold text-[#5a5a40] tracking-widest font-serif">非遗工坊 · 蠡壳窗合成</h2>
        <p className="text-xs text-[#5a5a40]/60 mt-1">点击屏幕掉落贝壳，合成最终的精美蠡壳窗</p>
      </div>
      <div ref={sceneRef} className="flex-1 relative">
        {/* 预览贝壳 */}
        {previewX !== null && !showCert && (
          <div 
            className="absolute top-2 -translate-x-1/2 pointer-events-none opacity-50"
            style={{ left: previewX }}
          >
            <img 
              src={EVOLUTION_CHAIN[nextType].img} 
              alt="preview" 
              style={{ width: EVOLUTION_CHAIN[nextType].size * 2, height: EVOLUTION_CHAIN[nextType].size * 2 }}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-[500px] bg-dashed border-l border-dashed border-[#5a5a40]/20" />
          </div>
        )}
      </div>
      <div className="p-4 bg-white/80 border-t border-[#5a5a40]/10 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#5a5a40]/40 uppercase tracking-widest">Next</span>
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#8fb0a9] flex items-center justify-center bg-white overflow-hidden">
            <img 
              src={EVOLUTION_CHAIN[nextType].img} 
              alt="next"
              style={{ width: '80%', height: '80%', objectFit: 'contain' }}
            />
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[#5a5a40]/40 uppercase tracking-widest">Craft Score</div>
          <div className="text-xl font-bold text-[#5a5a40] font-mono">{score}</div>
        </div>
      </div>
      <AnimatePresence>
        {showCert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-[#5a5a40]/80 backdrop-blur-xl p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#fdfcf0] p-8 rounded-3xl shadow-2xl border-[8px] border-[#8fb0a9] max-w-sm w-full text-center relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold border-4 border-[#fdfcf0] rotate-6 shadow-xl text-xl font-serif">精湛</div>
              <h2 className="text-2xl font-bold text-[#5a5a40] mt-8 mb-6 font-serif tracking-widest">非遗传承</h2>
              
              {/* 视频占位符 */}
              <div className="w-full aspect-video bg-black rounded-xl mb-6 flex flex-col items-center justify-center text-white/50 text-xs overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
                <div className="z-10 flex flex-col items-center">
                  <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center mb-2">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                  </div>
                  <span>蠡壳窗工艺宣传视频</span>
                  <span className="opacity-40 mt-1">(视频加载中...)</span>
                </div>
              </div>

              <div className="border-4 border-[#8fb0a9]/10 p-6 mb-6 italic text-[#5a5a40] bg-white/50 rounded-2xl">
                <p className="text-2xl font-bold not-italic my-6 underline decoration-[#8fb0a9] decoration-8 underline-offset-8">蒋村漫游者</p>
                <p className="text-sm">成功复刻非遗技艺，正式授予</p>
                <p className="text-lg font-bold text-[#8fb0a9] mt-4">“蒋村蠡壳窗工艺大师”</p>
                <p className="text-right mt-2 opacity-60">称号。</p>
              </div>
              <button onClick={onComplete} className="w-full py-4 bg-[#8fb0a9] text-white rounded-2xl font-bold shadow-xl">传承技艺，继续漫游</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Outro Screen: 最终海报展示 ---
const OutroScreen = ({ image, onRestart }: { image: string; onRestart: () => void }) => {
  return (
    <motion.div 
      id="outro-screen" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-[#0a0a0a]/95 flex flex-col items-center justify-center p-6 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-full max-w-[340px] bg-white p-2 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)]"
      >
        <img src={image} alt="蒋村漫游海报" className="w-full rounded-2xl shadow-inner" />
        
        {/* 装饰性边框 */}
        <div className="absolute -inset-1 border border-white/20 rounded-[28px] pointer-events-none" />
      </motion.div>

      <div className="mt-8 text-center">
        <p className="text-white/80 text-sm font-serif tracking-[0.2em] mb-2 animate-pulse">
          长按保存图片 · 邀好友同游水乡
        </p>
        <div className="h-px w-12 bg-white/20 mx-auto mb-8" />
      </div>

      <button 
        onClick={onRestart}
        className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 text-sm tracking-widest"
      >
        返回大地图 <ArrowLeft size={16} />
      </button>

      {/* 底部 Logo */}
      <div className="absolute bottom-8 opacity-30 flex flex-col items-center">
        <span className="text-[10px] text-white tracking-[0.5em] uppercase">Yangli Village</span>
        <span className="text-[8px] text-white tracking-[0.2em] mt-1">漾里乡 · 蒋村漫游</span>
      </div>
    </motion.div>
  );
};

// --- Level 5: 漾里会客厅贴纸装扮 ---
const Level5 = ({ onCapture }: { onCapture: (img: string) => void }) => {
  const [placedStickers, setPlacedStickers] = useState<{ id: string; type: string; x: number; y: number; img: string }[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // 模拟动态旅行者编号
  const travelerId = useMemo(() => Math.floor(Math.random() * 2000) + 8000, []);

  const STICKER_LIBRARY = [
    { type: 'cat', img: GAME_ASSETS.sprites.cat, name: '大橘' },
    { type: 'tree', img: GAME_ASSETS.sprites.tree, name: '盆景' },
    { type: 'bench', img: GAME_ASSETS.sprites.bench, name: '竹凳' },
    { type: 'pot', img: GAME_ASSETS.sprites.pot, name: '茶壶' },
    { type: 'fish', img: GAME_ASSETS.sprites.fish, name: '鲜鱼' },
    { type: 'shell', img: GAME_ASSETS.sprites.shell5, name: '蠡壳窗' },
  ];

  const handleAddSticker = (sticker: any) => {
    const newSticker = {
      id: `sticker-${Date.now()}`,
      type: sticker.type,
      img: sticker.img,
      x: 50,
      y: 50,
    };
    setPlacedStickers([...placedStickers, newSticker]);
  };

  const handleDragEnd = (id: string, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = ((info.point.x - rect.left) / rect.width) * 100;
    const newY = ((info.point.y - rect.top) / rect.height) * 100;
    
    setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, x: newX, y: newY } : s));
  };

  const removeSticker = (id: string) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
  };

  const generatePoster = async () => {
    if (!containerRef.current) return;
    setIsCapturing(true);
    
    // 给一点时间让 UI 响应（隐藏删除按钮等）
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        scale: 3, // 提高清晰度
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      onCapture(imgData);
    } catch (err) {
      console.error('Poster generation failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div id="level-5" className="flex-1 relative overflow-hidden bg-[#f5f5f0] flex flex-col">
      <div className="p-6 bg-white/50 backdrop-blur-md border-b border-[#5a5a40]/10 z-10">
        <h2 className="text-xl font-bold text-[#5a5a40] tracking-widest font-serif">漾里会客厅 · 贴纸装扮</h2>
        <p className="text-xs text-[#5a5a40]/60 mt-1">布置你的小院，定格这段美好时光</p>
      </div>

      {/* 画布区域 */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-[#ffffff] m-4 rounded-3xl shadow-2xl overflow-hidden border-[6px] border-[#ffffff]"
        style={{ 
          backgroundImage: `url(https://picsum.photos/seed/jiangcun_yard/800/1200)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* 动态文字叠加层 */}
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <div className="bg-[rgba(255,255,255,0.8)] p-4 rounded-lg border-l-4 border-[#8fb0a9] shadow-lg">
            <p className="text-[10px] text-[rgba(90,90,64,0.6)] uppercase tracking-widest mb-1">Traveler Report</p>
            <p className="text-sm font-bold text-[#5a5a40] font-serif">你是第 <span className="text-[#8fb0a9] text-lg">{travelerId}</span> 位</p>
            <p className="text-sm font-bold text-[#5a5a40] font-serif">游览蒋村的旅行者</p>
          </div>
        </div>

        {/* 底部品牌标识 (仅在海报中更显眼) */}
        <div className="absolute bottom-8 right-8 z-20 pointer-events-none text-right">
          <p className="text-[10px] text-[#ffffff] tracking-[0.3em] font-bold" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>漾里乡 · 蒋村漫游</p>
          <p className="text-[8px] text-[rgba(255,255,255,0.8)] tracking-widest mt-1" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>JIANG CUN ROAMING</p>
        </div>

        <AnimatePresence>
          {placedStickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              drag={!isCapturing}
              dragMomentum={false}
              onDragEnd={(_, info) => handleDragEnd(sticker.id, info)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, left: `${sticker.x}%`, top: `${sticker.y}%` }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-move group"
              style={{ touchAction: 'none' }}
            >
              <img 
                src={sticker.img} 
                alt="sticker" 
                className="w-24 h-24" 
                style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }} 
              />
              {!isCapturing && (
                <button 
                  onClick={() => removeSticker(sticker.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  ×
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 素材栏 */}
      {!isCapturing && (
        <div className="bg-white/80 backdrop-blur-xl p-4 border-t border-[#5a5a40]/10">
          <div className="flex overflow-x-auto pb-2 gap-4 no-scrollbar">
            {STICKER_LIBRARY.map((item, idx) => (
              <motion.div
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAddSticker(item)}
                className="flex-shrink-0 flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-[#fdfcf0] rounded-2xl border border-[#5a5a40]/10 flex items-center justify-center p-2 shadow-sm">
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] text-[#5a5a40] mt-1 font-medium">{item.name}</span>
              </motion.div>
            ))}
          </div>
          
          <button 
            onClick={generatePoster}
            className="w-full mt-4 py-4 bg-[#5a5a40] text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            定格美好，生成海报 <Camera size={20} />
          </button>
        </div>
      )}

      {/* 生成中遮罩 */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 border-4 border-[#8fb0a9] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#5a5a40] font-serif tracking-widest animate-pulse">正在为你定格瞬间...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Level 4: 岁月相馆拼拼乐 ---
const Level4 = ({ onComplete }: { onComplete: () => void }) => {
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isWon, setIsWon] = useState(false);

  // 初始化并乱序
  useEffect(() => {
    const initial = Array.from({ length: 9 }, (_, i) => i);
    // 乱序算法
    const shuffled = [...initial].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
  }, []);

  // 计算背景坐标的函数
  const getBgPos = (originalIdx: number) => {
    const row = Math.floor(originalIdx / 3);
    const col = originalIdx % 3;
    // 3x3 网格，background-size 300% 300%
    // 偏移量计算：(col / (3-1)) * 100%
    const xPercent = col * 50;
    const yPercent = row * 50;
    return `${xPercent}% ${yPercent}%`;
  };

  const handlePieceClick = (currentIdx: number) => {
    if (isWon) return;

    if (selectedIdx === null) {
      setSelectedIdx(currentIdx);
    } else {
      if (selectedIdx === currentIdx) {
        setSelectedIdx(null);
        return;
      }

      // 交换逻辑
      const newPieces = [...pieces];
      const temp = newPieces[selectedIdx];
      newPieces[selectedIdx] = newPieces[currentIdx];
      newPieces[currentIdx] = temp;
      
      setPieces(newPieces);
      setSelectedIdx(null);

      // 校验是否恢复 0-8 顺序
      if (newPieces.every((val, i) => val === i)) {
        setIsWon(true);
      }
    }
  };

  return (
    <div id="level-4" className="flex-1 relative overflow-hidden bg-[#f5f5f0] flex flex-col">
      <div className="p-6 bg-white/50 backdrop-blur-md border-b border-[#5a5a40]/10 z-10">
        <h2 className="text-xl font-bold text-[#5a5a40] tracking-widest font-serif">岁月相馆 · 蒋村美景拼拼乐</h2>
        <p className="text-xs text-[#5a5a40]/60 mt-1">点击两块碎片互换位置，还原蒋村绝美风景</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {pieces.length === 0 ? (
          <div className="text-[#5a5a40]/40 font-serif italic">正在准备拼图...</div>
        ) : (
          <div 
            id="puzzle-board"
            className="w-[300px] h-[300px] bg-white p-1 shadow-2xl rounded-lg grid grid-cols-3 grid-rows-3 gap-1 border-2 border-[#8fb0a9]"
          >
            {pieces.map((originalIdx, currentIdx) => (
              <motion.div
                key={`${originalIdx}-${currentIdx}`}
                layout
                onClick={() => handlePieceClick(currentIdx)}
                className={`puzzle-piece relative cursor-pointer overflow-hidden rounded-sm border transition-all ${selectedIdx === currentIdx ? 'border-yellow-400 z-10 scale-105 shadow-lg border-4' : 'border-gray-100'}`}
                style={{
                  backgroundImage: `url(${PUZZLE_IMG})`,
                  backgroundSize: '300% 300%',
                  backgroundPosition: getBgPos(originalIdx),
                  backgroundColor: '#f0f0f0',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#5a5a40]/80 backdrop-blur-xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              className="bg-[#fdfcf0] p-8 rounded-3xl shadow-2xl border-[8px] border-[#8fb0a9] max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-[#8fb0a9] rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                <Share2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-[#5a5a40] mb-4 font-serif">定格美好</h2>
              <p className="text-[#5a5a40]/70 mb-8 leading-relaxed">
                你成功还原了蒋村的岁月瞬间，<br/>
                这张精美的风景照已存入你的漫游相册。
              </p>
              <button 
                onClick={onComplete} 
                className="w-full py-4 bg-[#8fb0a9] text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
              >
                收起相片，继续出发
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Level 1: 蒋村市集翻翻乐 ---
const Level1 = ({ onComplete }: { onComplete: () => void }) => {
  const [cards, setCards] = useState<{ id: string; img: string; name: string; desc: string; isFlipped: boolean; isMatched: boolean; instanceId: number }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [showDesc, setShowDesc] = useState<string | null>(null);

  // 初始化并洗牌
  useEffect(() => {
    const initialCards = [...GAME_ASSETS.foods, ...GAME_ASSETS.foods].map((food, index) => ({
      ...food,
      instanceId: index,
      isFlipped: false,
      isMatched: false,
    }));
    
    // Fisher-Yates 洗牌算法
    const shuffled = [...initialCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].id === cards[secondIndex].id) {
        // 匹配成功
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatchedCount(prev => prev + 1);
          setShowDesc(cards[firstIndex].name);
        }, 500);
      } else {
        // 匹配失败，翻回去
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div id="level1" className="flex-1 flex flex-col p-4 relative overflow-hidden" style={{ backgroundImage: `url(${GAME_ASSETS.bg.market})`, backgroundSize: 'cover' }}>
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <div className="text-center py-2 shrink-0">
          <p className="text-sm text-[#5a5a40] font-medium bg-white/60 inline-block px-4 py-1 rounded-full shadow-sm">
            寻找相同的漾里美食 ({matchedCount}/{GAME_ASSETS.foods.length})
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-1 py-2 custom-scrollbar">
          <div className="grid grid-cols-4 gap-2 pb-20">
            {cards.map((card, index) => (
              <motion.div
                key={card.instanceId}
                className="aspect-square relative cursor-pointer perspective-1000"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(index)}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d transition-transform duration-500"
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                >
                  {/* 卡背 */}
                  <div className="absolute inset-0 backface-hidden bg-[#fdfcf0] rounded-lg border border-[#8fb0a9]/30 shadow-sm flex items-center justify-center overflow-hidden">
                    <img src={GAME_ASSETS.sprites.card_back} className="w-8 h-8 opacity-40" alt="back" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                  {/* 卡面 */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-lg border border-[#8fb0a9] shadow-md overflow-hidden">
                    <img src={card.img} className="w-full h-full object-cover" alt={card.name} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] py-0.5 text-center backdrop-blur-sm truncate px-1">
                      {card.name}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 美食介绍弹窗 */}
      <AnimatePresence>
        {showDesc && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowDesc(null)}
          >
            <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-[#8fb0a9] max-w-xs text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#8fb0a9]" />
              <img 
                src={GAME_ASSETS.foods.find(f => f.name === showDesc)?.img} 
                className="w-32 h-32 mx-auto rounded-2xl mb-4 border-2 border-gray-100 shadow-sm" 
                alt={showDesc} 
              />
              <h5 className="text-xl font-bold text-[#5a5a40] mb-2">{showDesc}</h5>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {GAME_ASSETS.foods.find(f => f.name === showDesc)?.desc}
              </p>
              <button className="px-6 py-2 bg-[#8fb0a9] text-white rounded-full text-sm font-bold">知道了</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 通关提示 */}
      {matchedCount === GAME_ASSETS.foods.length && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-10 left-0 right-0 z-40 px-8"
        >
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-2 border-yellow-400 text-center">
            <h4 className="text-xl font-bold text-[#5a5a40] mb-2">市集寻味达成</h4>
            <p className="text-sm text-gray-500 mb-4">你已经认全了蒋村的特色美味。</p>
            <button 
              onClick={onComplete}
              className="w-full py-3 bg-yellow-400 text-white rounded-xl font-bold shadow-lg"
            >
              完成探索
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

type GameState = 'LOADING' | 'INTRO' | 'MAP' | 'LEVEL';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [outroImage, setOutroImage] = useState<string | null>(null);

  // 模拟加载过程
  useEffect(() => {
    if (gameState === 'LOADING') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setGameState('INTRO'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const handleEnterLevel = (id: number) => {
    setCurrentLevel(id);
    setGameState('LEVEL');
  };

  const handleBackToMap = () => {
    setCurrentLevel(null);
    setGameState('MAP');
  };

  return (
    <div className="relative w-full h-full font-sans text-[#2c3e50] select-none overflow-hidden">
      {/* 最终海报遮罩 */}
      <AnimatePresence>
        {outroImage && (
          <OutroScreen image={outroImage} onRestart={() => {
            setOutroImage(null);
            handleBackToMap();
          }} />
        )}
      </AnimatePresence>

      {/* 全局音效控制 */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-4 right-4 z-50 p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-lg"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <AnimatePresence mode="wait">
        {/* 1. 加载页 */}
        {gameState === 'LOADING' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5f5f0] z-40"
            style={{ backgroundImage: `url(${GAME_ASSETS.bg.loading})`, backgroundSize: 'cover' }}
          >
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
            <div className="relative z-10 text-center">
              <h1 className="text-3xl font-bold mb-8 tracking-widest text-[#5a5a40]">漾里乡·蒋村漫游</h1>
              <div className="w-64 h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-[#8fb0a9]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-4 text-sm text-[#5a5a40]/70 italic">正在步入水乡画卷... {progress}%</p>
            </div>
          </motion.div>
        )}

        {/* 2. 邀请函开场 */}
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#f5f5f0] z-30"
            style={{ backgroundImage: `url(${GAME_ASSETS.bg.intro})`, backgroundSize: 'cover' }}
          >
            <div className="absolute inset-0 bg-black/10" />
            
            {/* 飘落的银杏叶 */}
            <motion.div
              initial={{ y: -200, rotate: 0, opacity: 0 }}
              animate={{ y: 0, rotate: 360, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              onClick={() => setGameState('MAP')}
              className="relative cursor-pointer group"
            >
              <img src={GAME_ASSETS.sprites.leaf} alt="leaf" className="w-32 h-32 drop-shadow-2xl" />
              <motion.div 
                className="absolute top-full left-1/2 -translate-x-1/2 mt-8 p-6 bg-white/90 shadow-2xl rounded-lg border-2 border-[#5a5a40]/20 max-w-[280px] text-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <p className="text-lg leading-relaxed font-medium">
                  久在樊笼里，复得返自然。<br/>
                  <span className="text-sm text-[#8fb0a9] mt-2 block">漾里鲜向你发出邀请</span>
                </p>
                <div className="mt-4 text-xs text-gray-400 animate-pulse">点击叶片开启旅程</div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. 大地图中枢 */}
        {gameState === 'MAP' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20"
            style={{ backgroundImage: `url(${GAME_ASSETS.bg.map})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            {/* 地图装饰与氛围 */}
            <div className="absolute inset-0 water-ripple pointer-events-none" />

            {/* IP 人物动画 */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 20, opacity: 1 }}
              className="absolute bottom-10 left-10 z-30"
            >
              <img src={GAME_ASSETS.sprites.ip_character} alt="IP" className="w-24 h-24 drop-shadow-lg" />
            </motion.div>

            {/* 地标点 */}
            {LANDMARKS.map((landmark) => (
              <motion.div
                key={landmark.id}
                style={{ left: landmark.x, top: landmark.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEnterLevel(landmark.id)}
              >
                <div className="relative flex flex-col items-center">
                  <div className={`p-2 rounded-full shadow-xl ${completedLevels.includes(landmark.id) ? 'bg-yellow-400' : 'bg-white/80'} backdrop-blur-sm border-2 border-white animate-bounce`}>
                    <MapPin size={24} className={completedLevels.includes(landmark.id) ? 'text-white' : 'text-[#8fb0a9]'} />
                  </div>
                  <span className="mt-2 px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-md whitespace-nowrap">
                    {landmark.name}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* 顶部标题 */}
            <div className="absolute top-10 left-0 right-0 text-center pointer-events-none">
              <h2 className="text-2xl font-bold text-[#5a5a40] drop-shadow-sm tracking-widest">蒋村漫游地图</h2>
              <p className="text-xs text-[#5a5a40]/60 mt-1">选择一个地标开始探索</p>
            </div>

            {/* 通关报告入口 (仅在全部完成后显示) */}
            {completedLevels.length === 5 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-8 py-4 bg-[#8fb0a9] text-white rounded-full shadow-2xl font-bold text-lg border-4 border-white"
              >
                生成旅行报告
              </motion.button>
            )}
          </motion.div>
        )}

        {/* 4. 关卡容器 */}
        {gameState === 'LEVEL' && (
          <motion.div 
            key="level"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 bg-[#f5f5f0] z-50 flex flex-col"
          >
            {/* 关卡顶部栏 */}
            <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md">
              <button onClick={handleBackToMap} className="flex items-center text-[#5a5a40] font-medium">
                <ArrowLeft size={20} className="mr-1" /> 返回地图
              </button>
              <h3 className="font-bold text-lg">{LANDMARKS.find(l => l.id === currentLevel)?.name}</h3>
              <div className="w-10" /> {/* 占位平衡 */}
            </div>

            {/* 关卡内容 */}
            {currentLevel === 1 ? (
              <Level1 onComplete={() => {
                if (!completedLevels.includes(1)) {
                  setCompletedLevels([...completedLevels, 1]);
                }
                handleBackToMap();
              }} />
            ) : currentLevel === 2 ? (
              <Level2 onComplete={() => {
                if (!completedLevels.includes(2)) {
                  setCompletedLevels([...completedLevels, 2]);
                }
                handleBackToMap();
              }} />
            ) : currentLevel === 3 ? (
              <Level3 onComplete={() => {
                if (!completedLevels.includes(3)) {
                  setCompletedLevels([...completedLevels, 3]);
                }
                handleBackToMap();
              }} />
            ) : currentLevel === 4 ? (
              <Level4 onComplete={() => {
                if (!completedLevels.includes(4)) {
                  setCompletedLevels([...completedLevels, 4]);
                }
                handleBackToMap();
              }} />
            ) : currentLevel === 5 ? (
              <Level5 onCapture={(img) => {
                if (!completedLevels.includes(5)) {
                  setCompletedLevels([...completedLevels, 5]);
                }
                setOutroImage(img);
              }} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 border-4 border-dashed border-gray-300">
                  <span className="text-gray-400">游戏开发中...</span>
                </div>
                <h4 className="text-xl font-bold mb-4">即将开启：{LANDMARKS.find(l => l.id === currentLevel)?.name}</h4>
                <p className="text-gray-500 leading-relaxed">
                  这里将呈现精彩的互动玩法，<br/>
                  带你深度体验蒋村的独特魅力。
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
