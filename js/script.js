// ====== RESPONSIVE SCALE (320x180 base, integer upscaling) ======
(() => {
  const BASE_WIDTH = 320;
  const BASE_HEIGHT = 180;
  const root = document.documentElement;
  if (!root) return;

  const updateScale = () => {
    const rawScale = Math.min(window.innerWidth / BASE_WIDTH, window.innerHeight / BASE_HEIGHT);
    const scale = rawScale < 1 ? rawScale : Math.max(1, Math.floor(rawScale));
    root.style.setProperty('--scale', String(scale));
  };

  window.addEventListener('resize', updateScale);
  window.addEventListener('orientationchange', updateScale);
  updateScale();
})();

// ====== INTRO LOGO: HIDE AFTER ~2s ======
window.addEventListener('load', () => {
  const intro = document.getElementById('intro-screen');
  if (!intro) return;
  const isQuickIntro = document.body.classList.contains('about-page');
  const introDuration = isQuickIntro ? 2000 : 3000;
  setTimeout(() => {
    intro.style.display = 'none';
  }, introDuration);
});

// ====== DOOR TOGGLE ======
(() => {
  const door = document.getElementById('door');
  const hitbox = document.getElementById('door-hit');
  if (!door || !hitbox) return;
  let open = false;
  let autoControl = true;
  let doorCloseTimeout = null;

  const setDoor = (isOpen) => {
    door.src = isOpen ? 'assets/door-open.png' : 'assets/door-closed.png';
    open = isOpen;
  };

  const scheduleAutoClose = (delayMs) => {
    setTimeout(() => {
      if (!autoControl) return;
      setDoor(false);
      autoControl = false;
    }, delayMs);
  };

  setDoor(true);
  scheduleAutoClose(6000);
  scheduleAutoClose(6000);

  const clearDoorTimeout = () => {
    if (doorCloseTimeout) {
      clearTimeout(doorCloseTimeout);
      doorCloseTimeout = null;
    }
  };

  const openDoor = () => {
    autoControl = false;
    clearDoorTimeout();
    setDoor(true);
  };

  const closeDoor = () => {
    autoControl = false;
    clearDoorTimeout();
    setDoor(false);
  };

  const openDoorFor = (duration = 2000) => {
    openDoor();
    doorCloseTimeout = setTimeout(() => {
      closeDoor();
    }, duration);
  };

  hitbox.addEventListener('click', (event) => {
    event.stopPropagation();
    if (open) {
      closeDoor();
    } else {
      openDoor();
    }
  });

  window.doorController = {
    open: openDoor,
    close: closeDoor,
    openFor: openDoorFor
  };
})();

// ====== TV POWER-UP SEQUENCE ======
(() => {
  const tv = document.getElementById('tv');
  const trigger = document.getElementById('tv-hit') || tv;
  if (!tv || !trigger) return;

  const IDLE_SRC = 'assets/tv.png';
  const FRAMES = [
    { src: 'assets/tv-on-one.png', duration: 1000 },
    { src: 'assets/tv-on-two.png', duration: 500 },
    { src: 'assets/tv-on-three.png', duration: 500 },
    { src: 'assets/tv-on-four.png', duration: 2000 }
  ];

  const timeouts = new Set();
  let running = false;

  const clearScheduledFrames = () => {
    timeouts.forEach((id) => clearTimeout(id));
    timeouts.clear();
  };

  const resetTv = () => {
    clearScheduledFrames();
    tv.src = IDLE_SRC;
    running = false;
  };

  trigger.addEventListener('click', () => {
    if (running) return;
    running = true;

    let delay = 0;
    FRAMES.forEach(({ src, duration }) => {
      const timeoutId = setTimeout(() => {
        tv.src = src;
        timeouts.delete(timeoutId);
      }, delay);
      timeouts.add(timeoutId);
      delay += duration;
    });

    const resetId = setTimeout(() => {
      timeouts.delete(resetId);
      resetTv();
    }, delay);
    timeouts.add(resetId);
  });
})();

// ====== MAXIE PORTRAIT WINK ======
(() => {
  const portrait = document.getElementById('maxie-portrait');
  const hitbox = document.getElementById('maxie-hit');
  if (!portrait || !hitbox) return;

  const ORIGINAL_SRC = 'assets/maxie-portrait.png';
  const WINK_SRC = 'assets/maxie-portrait-winking.png';
  let timeoutId = null;

  const showOriginal = () => {
    portrait.src = ORIGINAL_SRC;
    timeoutId = null;
  };

  hitbox.addEventListener('click', () => {
    portrait.src = WINK_SRC;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(showOriginal, 1000);
  });
})();

// ====== SC LOGO → SHOW TROJAN ======
(() => {
  const logo = document.getElementById('sc-logo');
  const hitbox = document.getElementById('sc-hit');
  const trojan = document.getElementById('trojan');
  if (!logo || !trojan || !hitbox) return;

  const frames = [
    { delay: 0, src: 'assets/trojan.png' },
    { delay: 1000, src: 'assets/trojan-peace.png' },
    { delay: 2000, src: 'assets/trojan-speech.png' }
  ];
  const finalFrameHoldMs = 3000;

  const timeouts = new Set();

  const clearFrameTimeouts = () => {
    timeouts.forEach((id) => clearTimeout(id));
    timeouts.clear();
  };

  const hideTrojan = () => {
    clearFrameTimeouts();
    trojan.style.display = 'none';
    trojan.src = frames[0].src;
  };

  hitbox.addEventListener('click', (event) => {
    event.stopPropagation();
    trojan.style.display = 'block';
    clearFrameTimeouts();
    trojan.src = frames[0].src;

    frames.forEach(({ delay, src }) => {
      const id = setTimeout(() => {
        trojan.src = src;
        timeouts.delete(id);
      }, delay);
      timeouts.add(id);
    });

    const hideDelay = frames[frames.length - 1].delay + finalFrameHoldMs;
    const hideId = setTimeout(() => {
      timeouts.delete(hideId);
      hideTrojan();
    }, hideDelay);
    timeouts.add(hideId);
  });
})();

// ====== BEEHIVE PORTRAIT → SUMMON BEE ======
(() => {
  const portrait = document.getElementById('beehive-portrait');
  const hitbox = document.getElementById('beehive-hit');
  const bee = document.getElementById('bee');
  if (!portrait || !hitbox || !bee) return;

  let flying = false;

  const resetBee = () => {
    bee.classList.remove('flying');
    bee.style.transform = '';
    flying = false;
    if (bee.classList.contains('dancing')) {
      bee.style.display = 'block';
      return;
    }
    bee.style.display = 'none';
  };

  bee.addEventListener('animationend', (event) => {
    if (event.animationName !== 'bee-flight') return;
    resetBee();
  });

  hitbox.addEventListener('click', () => {
    if (flying) return;
    flying = true;
    bee.style.display = 'block';
    bee.classList.remove('flying');
    void bee.offsetWidth; // restart animation
    bee.classList.add('flying');
  });
})();

// ====== SHAKA STATUE PSYCHEDELIC TRIP ======
(() => {
  const shaka = document.getElementById('shaka-statue');
  const hitbox = document.getElementById('shaka-hit');
  if (!shaka || !hitbox) return;

  let active = false;

  hitbox.addEventListener('click', () => {
    if (active) return;
    active = true;

    if (window.doorController && typeof window.doorController.openFor === 'function') {
      window.doorController.openFor(2000);
    }

    const wasDancing = shaka.classList.contains('dancing');
    if (wasDancing) shaka.classList.remove('dancing');

    shaka.classList.add('psychedelic');

    setTimeout(() => {
      shaka.classList.remove('psychedelic');
      if (wasDancing && !shaka.classList.contains('dancing')) {
        shaka.classList.add('dancing');
      }
      active = false;
    }, 4000);
  });
})();

// ====== COCKATOO PORTRAIT SPEECH BUBBLES ======
(() => {
  const portrait = document.getElementById('cockatoo-portrait');
  const hitbox = document.getElementById('cockatoo-hit');
  if (!portrait || !hitbox) return;

  const frames = [
    { src: 'assets/cockatoo-speech-one.png', duration: 3000 },
    { src: 'assets/cockatoo-speech-two.png', duration: 1000 },
    { src: 'assets/cockatoo-speech-three.png', duration: 1000 },
    { src: 'assets/cockatoo-speech-four.png', duration: 2000 }
  ];

  const BASE_SRC = 'assets/cockatoo-portrait.png';
  const SPEECH_FIVE_SRC = 'assets/cockatoo-speech-five.png';
  let busy = false;
  let timers = [];
  let pulseTimerId = null;
  let pulsing = true;

  const startPulse = () => {
    if (!pulsing) return;
    portrait.classList.add('cockatoo-pulse');
    pulseTimerId = setInterval(() => {
      if (!pulsing) return;
      portrait.classList.remove('cockatoo-pulse');
      void portrait.offsetWidth;
      portrait.classList.add('cockatoo-pulse');
    }, 3000);
  };

  const stopPulse = () => {
    pulsing = false;
    portrait.classList.remove('cockatoo-pulse');
    if (pulseTimerId) {
      clearInterval(pulseTimerId);
      pulseTimerId = null;
    }
  };

  const clearTimers = () => {
    timers.forEach((id) => clearTimeout(id));
    timers = [];
  };

  const reset = () => {
    portrait.src = BASE_SRC;
    portrait.style.filter = '';
    busy = false;
    stopPulse();
  };

  const playSequence = () => {
    if (busy) return;
    busy = true;
    clearTimers();
    stopPulse();

    let elapsed = 0;
    frames.forEach(({ src, duration }) => {
      const id = setTimeout(() => {
        portrait.src = src;
        portrait.style.filter = '';
      }, elapsed);
      timers.push(id);
      elapsed += duration;
    });

    const totalFrameDuration = frames.reduce((sum, frame) => sum + frame.duration, 0);
    const resetToBaseId = setTimeout(() => {
      portrait.src = BASE_SRC;
      portrait.style.filter = '';
    }, totalFrameDuration);
    timers.push(resetToBaseId);

    const speechFiveDelay = 3000;
    const speechFiveStart = totalFrameDuration + speechFiveDelay;

  const speechFiveId = setTimeout(() => {
    portrait.src = SPEECH_FIVE_SRC;
    portrait.style.filter = '';
    portrait.classList.add('cockatoo-speech-five');
  }, speechFiveStart);
  timers.push(speechFiveId);

  const resetAfterSpeechFiveId = setTimeout(() => {
    portrait.classList.remove('cockatoo-speech-five');
    reset();
  }, speechFiveStart + 2000);
  timers.push(resetAfterSpeechFiveId);
  };

  hitbox.addEventListener('click', playSequence);
  portrait.addEventListener('click', playSequence);

  startPulse();
})();

// ====== PLANT BLOOM & MUSIC CYCLE ======
(() => {
  const plant = document.getElementById('plant');
  const hitbox = document.getElementById('plant-hit');
  const flowerHit = document.getElementById('flower-hit');
  if (!plant || !hitbox) return;

  const DEFAULT_SRC = 'assets/plant.png';
  const bloomSequence = [
    { src: 'assets/plant-mid-flower.png', duration: 1000 },
    { src: 'assets/plant-flowered.png', duration: 2000 },
    { src: 'assets/plant-dance-one.png', duration: 500 },
    { src: 'assets/plant-dance-two.png', duration: 500 },
    { src: 'assets/plant-dance-one.png', duration: 500 },
    { src: 'assets/plant-flowered.png', duration: 500 },
    { src: 'assets/plant-dance-one.png', duration: 500 },
    { src: 'assets/plant-dance-two.png', duration: 500 },
    { src: 'assets/plant-dance-one.png', duration: 500 },
    { src: 'assets/plant-flowered.png', duration: 500 },
    { src: 'assets/plant-mid-flower.png', duration: 500 }
  ];

  const musicFrames = [
    'assets/plant-flowered.png',
    'assets/plant-dance-one.png',
    'assets/plant-dance-two.png',
    'assets/plant-dance-one.png'
  ];

  let bloomTimers = [];
  let musicIntervalId = null;
  let musicFrameIndex = 0;
  let mode = 'idle';

  const setPlantSrc = (src) => {
    plant.src = src;
  };

  const clearBloomTimers = (reset = true) => {
    bloomTimers.forEach((id) => clearTimeout(id));
    bloomTimers = [];
    if (mode === 'bloom') {
      if (reset) setPlantSrc(DEFAULT_SRC);
      mode = 'idle';
    }
  };

  const stopMusicLoop = () => {
    if (musicIntervalId) {
      clearInterval(musicIntervalId);
      musicIntervalId = null;
    }
  };

  const startMusicCycle = (beatSeconds = 0.5) => {
    const speedFactor = 1.25; // 25% slower than default
    const interval = Math.max(200, Math.round(beatSeconds * 1000 * speedFactor));
    clearBloomTimers(false);
    stopMusicLoop();
    musicFrameIndex = 0;
    mode = 'music';
    setPlantSrc(musicFrames[musicFrameIndex]);
    plant.classList.add('dancing');
    plant.style.setProperty('--plant-dance-duration', `${Math.max(0.2, beatSeconds * speedFactor)}s`);
    musicIntervalId = setInterval(() => {
      musicFrameIndex = (musicFrameIndex + 1) % musicFrames.length;
      setPlantSrc(musicFrames[musicFrameIndex]);
    }, interval);
  };

  const stopMusicCycle = () => {
    stopMusicLoop();
    if (mode === 'music') {
      plant.classList.remove('dancing');
      plant.style.removeProperty('--plant-dance-duration');
      mode = 'idle';
      setPlantSrc(DEFAULT_SRC);
    }
  };

  const triggerBloom = (event) => {
    if (event) event.stopPropagation();
    if (mode === 'music') return;
    clearBloomTimers();
    if (bloomSequence.length === 0) return;

    mode = 'bloom';
    setPlantSrc(bloomSequence[0].src);
    let elapsed = bloomSequence[0].duration;

    for (let i = 1; i < bloomSequence.length; i += 1) {
      const { src, duration } = bloomSequence[i];
      const id = setTimeout(() => {
        if (mode !== 'bloom') return;
        setPlantSrc(src);
        bloomTimers = bloomTimers.filter((timerId) => timerId !== id);
      }, elapsed);
      bloomTimers.push(id);
      elapsed += duration;
    }

    const resetId = setTimeout(() => {
      if (mode !== 'bloom') return;
      setPlantSrc(DEFAULT_SRC);
      mode = 'idle';
      bloomTimers = bloomTimers.filter((timerId) => timerId !== resetId);
    }, elapsed);
    bloomTimers.push(resetId);
  };

  hitbox.addEventListener('click', triggerBloom);
  if (flowerHit) flowerHit.addEventListener('click', triggerBloom);

  window.plantController = {
    startMusicCycle,
    stopMusicCycle
  };
})();

// ====== RUBIK'S CUBE CYCLE ======
(() => {
  const cube = document.getElementById('rubiks-cube');
  const hitbox = document.getElementById('rubiks-hit');
  if (!cube || !hitbox) return;

  const frames = [
    'assets/rubiks-cube.png',
    'assets/rubiks-cube-one.png',
    'assets/rubiks-cube-two.png',
    'assets/rubiks-cube-three.png',
    'assets/rubiks-cube-four.png'
  ];

  let index = 0;

  hitbox.addEventListener('click', () => {
    index = (index + 1) % frames.length;
    cube.src = frames[index];
  });
})();

// ====== SKULL DEMON + FIRE ======
(() => {
  const skull = document.getElementById('skull');
  const hitbox = document.getElementById('skull-hit');
  const fire = document.getElementById('skull-fire');
  if (!skull || !hitbox) return;

  const BASE_SRC = 'assets/skull.png';
  const DEMON_SRC = 'assets/skull-demon.png';
  const FIRE_FRAMES = [
    'assets/fire-one.png',
    'assets/fire-two.png',
    'assets/fire-three.png',
    'assets/fire-four.png',
    'assets/fire-five.png',
    'assets/fire-six.png',
    'assets/fire-seven.png',
    'assets/fire-eight.png'
  ];
  const SKULL_FILTERS = [
    'hue-rotate(0deg) saturate(110%)',
    'hue-rotate(60deg) saturate(140%)',
    'hue-rotate(120deg) saturate(170%)',
    'hue-rotate(180deg) saturate(200%)',
    'hue-rotate(240deg) saturate(170%)',
    'hue-rotate(300deg) saturate(150%)',
    'hue-rotate(360deg) saturate(120%)',
    'hue-rotate(420deg) saturate(150%)'
  ];
  const DISPLAY_DURATION = 4000; // ms
  const FRAME_DURATION = 120; // ms

  const state = {
    manualTimer: null,
    fireInterval: null,
    frameIndex: 0,
    manualActive: false,
    musicActive: false
  };

  const getLightsFilter = () => (document.body.classList.contains('lights-off') ? 'brightness(0.9)' : '');

  const applySkullFilter = (effectFilter) => {
    const base = getLightsFilter();
    const combined = effectFilter ? (base ? `${base} ${effectFilter}` : effectFilter) : base;
    if (combined) {
      skull.style.filter = combined;
    } else {
      skull.style.removeProperty('filter');
    }
  };

  applySkullFilter('');

  const updateFire = () => {
    if (!fire) return;
    const shouldRun = state.manualActive || state.musicActive;
    if (shouldRun) {
      if (!state.fireInterval) {
        state.frameIndex = 0;
        fire.src = FIRE_FRAMES[state.frameIndex];
        fire.style.display = 'block';
        applySkullFilter(SKULL_FILTERS[state.frameIndex % SKULL_FILTERS.length]);
        state.fireInterval = setInterval(() => {
          state.frameIndex = (state.frameIndex + 1) % FIRE_FRAMES.length;
          fire.src = FIRE_FRAMES[state.frameIndex];
          applySkullFilter(SKULL_FILTERS[state.frameIndex % SKULL_FILTERS.length]);
        }, FRAME_DURATION);
      }
    } else {
      if (state.fireInterval) {
        clearInterval(state.fireInterval);
        state.fireInterval = null;
      }
      fire.style.display = 'none';
      applySkullFilter('');
    }
  };

  const stopManual = () => {
    state.manualActive = false;
    if (state.manualTimer) {
      clearTimeout(state.manualTimer);
      state.manualTimer = null;
    }
    skull.src = BASE_SRC;
    updateFire();
  };

  hitbox.addEventListener('click', () => {
    state.manualActive = true;
    skull.src = DEMON_SRC;
    updateFire();
    if (state.manualTimer) clearTimeout(state.manualTimer);
    state.manualTimer = setTimeout(stopManual, DISPLAY_DURATION);
  });

  const controller = {
    startMusic: () => {
      state.musicActive = true;
      skull.classList.add('music-active');
      updateFire();
    },
    stopMusic: () => {
      state.musicActive = false;
      skull.classList.remove('music-active');
      updateFire();
      if (!state.manualActive) {
        skull.src = BASE_SRC;
      }
    },
    updateLights: () => {
      if (state.fireInterval || state.manualActive || state.musicActive) {
        applySkullFilter(SKULL_FILTERS[state.frameIndex % SKULL_FILTERS.length]);
      } else {
        applySkullFilter('');
      }
    }
  };

  window.skullFire = controller;
})();

// ====== BANANA PORTRAIT SEQUENCE ======
(() => {
  const banana = document.getElementById('banana-portrait');
  const hitbox = document.getElementById('banana-hit');
  const overlay = document.getElementById('banana-portrait-dance');
  if (!banana || !hitbox || !overlay) return;

  const BASE_SRC = 'assets/banana-portrait.png';
  const FRAMES = [
    'assets/banana-one.png',
    'assets/banana-two.png',
    'assets/banana-three.png',
    'assets/banana-four.png',
    'assets/banana-five.png',
    'assets/banana-six.png',
    'assets/banana-seven.png',
    'assets/banana-eight.png'
  ];
  const FRAME_DURATION = 200; // ms
  const REPEAT_COUNT = 2;
  const FILTERS = [
    'hue-rotate(0deg) saturate(130%)',
    'hue-rotate(45deg) saturate(150%)',
    'hue-rotate(90deg) saturate(170%)',
    'hue-rotate(135deg) saturate(200%)',
    'hue-rotate(180deg) saturate(170%)',
    'hue-rotate(225deg) saturate(150%)',
    'hue-rotate(270deg) saturate(140%)',
    'hue-rotate(315deg) saturate(160%)'
  ];

  const state = {
    manualActive: false,
    manualTimers: [],
    musicActive: false,
    loopInterval: null,
    frameIndex: 0
  };

  const getLightsFilter = () => (document.body.classList.contains('lights-off') ? 'brightness(0.9)' : '');

  const setFilters = (colorFilter) => {
    const baseFilter = getLightsFilter();
    if (baseFilter) {
      banana.style.filter = baseFilter;
    } else {
      banana.style.removeProperty('filter');
    }
    const overlayFilter = colorFilter ? (baseFilter ? `${baseFilter} ${colorFilter}` : colorFilter) : baseFilter;
    if (overlay.style.display === 'block' && overlayFilter) {
      overlay.style.filter = overlayFilter;
    } else {
      overlay.style.removeProperty('filter');
    }
  };

  const showOverlay = () => {
    overlay.style.display = 'block';
  };

  const hideOverlay = () => {
    overlay.style.display = 'none';
    overlay.src = BASE_SRC;
    overlay.style.removeProperty('filter');
  };

  banana.style.display = 'block';
  setFilters('');

  const applyFrame = (index) => {
    state.frameIndex = index % FRAMES.length;
    showOverlay();
    overlay.src = FRAMES[state.frameIndex];
    if (state.musicActive) {
      setFilters(FILTERS[state.frameIndex]);
    } else {
      setFilters('');
    }
  };

  const startLoop = () => {
    if (state.loopInterval) return;
    showOverlay();
    applyFrame(state.frameIndex);
    state.loopInterval = setInterval(() => {
      state.frameIndex = (state.frameIndex + 1) % FRAMES.length;
      applyFrame(state.frameIndex);
    }, FRAME_DURATION);
  };

  const stopLoop = () => {
    if (!state.loopInterval) return;
    clearInterval(state.loopInterval);
    state.loopInterval = null;
    if (!state.manualActive && !state.musicActive) {
      setFilters('');
      hideOverlay();
      banana.src = BASE_SRC;
    }
  };

  const stopManual = () => {
    state.manualActive = false;
    state.manualTimers.forEach(clearTimeout);
    state.manualTimers = [];
    if (state.musicActive) {
      state.frameIndex = 0;
      startLoop();
    } else {
      stopLoop();
      banana.src = BASE_SRC;
      setFilters('');
      hideOverlay();
      state.frameIndex = 0;
    }
  };

  const handleClick = () => {
    if (state.manualActive) return;
    state.manualActive = true;
    stopLoop();
    state.frameIndex = 0;
    applyFrame(0);

    const totalFrames = FRAMES.length * REPEAT_COUNT;

    for (let cycle = 0; cycle < REPEAT_COUNT; cycle += 1) {
      FRAMES.forEach((src, index) => {
        const frameNumber = cycle * FRAMES.length + index;
        const id = setTimeout(() => {
          applyFrame(index);
        }, FRAME_DURATION * frameNumber);
        state.manualTimers.push(id);
      });
    }

    const resetId = setTimeout(stopManual, FRAME_DURATION * totalFrames);
    state.manualTimers.push(resetId);
  };

  hitbox.addEventListener('click', handleClick);

  const controller = {
    startMusic: () => {
      state.musicActive = true;
      if (!state.manualActive) {
        state.frameIndex = 0;
        startLoop();
      }
    },
    stopMusic: () => {
      state.musicActive = false;
      if (!state.manualActive) {
        stopLoop();
        banana.src = BASE_SRC;
        setFilters('');
        hideOverlay();
        state.frameIndex = 0;
      }
    },
    updateLights: () => {
      if (state.musicActive) {
        applyFrame(state.frameIndex);
      } else if (!state.manualActive) {
        setFilters('');
        hideOverlay();
        banana.src = BASE_SRC;
      } else {
        setFilters('');
      }
    }
  };

  window.bananaController = controller;
})();

// ====== HEART MWAH SEQUENCE ======
(() => {
  const heart = document.getElementById('heart');
  const hitbox = document.getElementById('heart-hit');
  const door = document.getElementById('door');
  if (!heart || !hitbox) return;

  const BASE_SRC = 'assets/heart.png';
  const DOOR_OPEN_SRC = 'assets/door-open.png';
  const DOOR_MWAH_SRC = 'assets/mwah-one.png';
  const FRAMES = [
    { src: 'assets/mwah-one.png', repeat: 2, duration: 180 },
    { src: 'assets/mwah-two.png', repeat: 2, duration: 180 },
    { src: 'assets/mwah-three.png', repeat: 2, duration: 180 },
    { src: 'assets/mwah-four.png', repeat: 2, duration: 180 },
    { src: 'assets/mwah-five.png', repeat: 2, duration: 180 },
    { src: 'assets/mwah-six.png', repeat: 2, duration: 180 },
    { src: 'assets/mwah-seven.png', repeat: 2, duration: 180 },
    { src: 'assets/mwah-eight.png', repeat: 1, duration: 2000 }
  ];

  let active = false;
  let timers = [];
  let restoreDoorAfterSequence = false;

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const resetHeart = () => {
    heart.src = BASE_SRC;
    clearTimers();
    active = false;
    if (restoreDoorAfterSequence && door) {
      door.src = DOOR_OPEN_SRC;
      restoreDoorAfterSequence = false;
    }
  };

  hitbox.addEventListener('click', (event) => {
    event.stopPropagation();
    if (active) return;
    active = true;
    clearTimers();

    if (door && door.src.includes(DOOR_OPEN_SRC)) {
      door.src = DOOR_MWAH_SRC;
      restoreDoorAfterSequence = true;
    }

    let elapsed = 0;

    FRAMES.forEach(({ src, repeat, duration }) => {
      const loops = Math.max(1, repeat);
      const frameDuration = duration;

      for (let i = 0; i < loops; i += 1) {
        const id = setTimeout(() => {
          heart.src = src;
        }, elapsed);
        timers.push(id);
        elapsed += frameDuration;
      }
    });

    const resetId = setTimeout(resetHeart, elapsed);
    timers.push(resetId);
  });
})();

// ====== GREEN MAN DANCE ======
(() => {
  const greenMan = document.getElementById('green-man');
  const greenManHit = document.getElementById('green-man-hit');
  if (!greenMan || !greenManHit) return;

  const BASE_SRC = 'assets/green-man.png';
  const FRAMES = [
    'assets/green-man-dance-one.png',
    'assets/green-man-dance-two.png',
    'assets/green-man-dance-three.png',
    'assets/green-man-dance-four.png',
    'assets/green-man-dance-five.png'
  ];
  const FRAME_DURATION = 500;

  let active = false;
  let timeouts = [];
  let loopTimeout = null;
  let looping = false;

  const clearTimers = () => {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  };

  const reset = () => {
    greenMan.src = BASE_SRC;
    active = false;
    clearTimers();
  };

  const playSequence = (onComplete) => {
    clearTimers();
    let elapsed = 0;

    FRAMES.forEach((src) => {
      const id = setTimeout(() => {
        greenMan.src = src;
      }, elapsed);
      timeouts.push(id);
      elapsed += FRAME_DURATION;
    });

    const resetId = setTimeout(() => {
      reset();
      if (typeof onComplete === 'function') onComplete();
    }, elapsed);
    timeouts.push(resetId);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    if (active || looping) return;
    active = true;
    playSequence(() => {
      active = false;
    });
  };

  const startLoop = () => {
    if (looping) return;
    looping = true;
    const runLoop = () => {
      if (!looping) return;
      active = true;
      playSequence(() => {
        active = false;
        if (looping) {
          loopTimeout = setTimeout(runLoop, 0);
        }
      });
    };
    runLoop();
  };

  const stopLoop = () => {
    looping = false;
    if (loopTimeout) {
      clearTimeout(loopTimeout);
      loopTimeout = null;
    }
    reset();
  };

  greenManHit.addEventListener('click', handleClick);
  greenMan.addEventListener('click', handleClick);

  window.greenManController = {
    startLoop,
    stopLoop
  };
})();

// ====== HOT DOG DANCE ======
(() => {
  const hotDog = document.getElementById('hot-dog');
  const overlay = document.getElementById('hot-dog-dance');
  const hotDogSignHit = document.getElementById('hot-dog-sign-hit');
  const hotDogPortraitHit = document.getElementById('hot-dog-portrait-hit');
  if (!hotDog || !overlay || !hotDogSignHit) return;

  const BASE_SRC = 'assets/hot-dog-sign.png';
  const FRAMES = [
    'assets/hot-dog-dance-one.png',
    'assets/hot-dog-dance-two.png',
    'assets/hot-dog-dance-three.png',
    'assets/hot-dog-dance-four.png',
    'assets/hot-dog-dance-five.png',
    'assets/hot-dog-dance-six.png',
    'assets/hot-dog-dance-seven.png'
  ];
  const FRAME_DURATION = 500;
  const FILTERS = [
    'hue-rotate(0deg) saturate(130%)',
    'hue-rotate(45deg) saturate(150%)',
    'hue-rotate(90deg) saturate(170%)',
    'hue-rotate(135deg) saturate(200%)',
    'hue-rotate(180deg) saturate(170%)',
    'hue-rotate(225deg) saturate(150%)',
    'hue-rotate(270deg) saturate(140%)'
  ];
  const REPEAT_COUNT = 2;

  let manualActive = false;
  let manualTimers = [];
  let loopInterval = null;
  let frameIndex = 0;
  let musicActive = false;

  const getLightsFilter = () => (document.body.classList.contains('lights-off') ? 'brightness(0.9)' : '');

  const clearManualTimers = () => {
    manualTimers.forEach(clearTimeout);
    manualTimers = [];
  };

  const applyBaseFilter = () => {
    const baseFilter = getLightsFilter();
    if (baseFilter) {
      hotDog.style.filter = baseFilter;
    } else {
      hotDog.style.removeProperty('filter');
    }
  };

  const showOverlay = () => {
    overlay.style.display = 'block';
  };

  const hideOverlay = () => {
    overlay.style.display = 'none';
    overlay.src = BASE_SRC;
    overlay.style.removeProperty('filter');
    applyBaseFilter();
  };

  const applyFrame = (index) => {
    frameIndex = index % FRAMES.length;
    showOverlay();
    overlay.src = FRAMES[frameIndex];
    applyBaseFilter();
    const shouldColor = musicActive;
    const baseFilter = getLightsFilter();
    if (shouldColor) {
      const color = FILTERS[frameIndex % FILTERS.length];
      overlay.style.filter = baseFilter ? `${baseFilter} ${color}` : color;
    } else if (baseFilter) {
      overlay.style.filter = baseFilter;
    } else {
      overlay.style.removeProperty('filter');
    }
  };

  const startLoop = () => {
    if (loopInterval) return;
    musicActive = true;
    applyFrame(frameIndex);
    loopInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % FRAMES.length;
      applyFrame(frameIndex);
    }, FRAME_DURATION);
  };

  const stopLoop = () => {
    musicActive = false;
    if (!loopInterval) return;
    clearInterval(loopInterval);
    loopInterval = null;
    if (!manualActive) {
      hideOverlay();
    }
  };

  const finishManual = (shouldResume) => {
    manualActive = false;
    clearManualTimers();
    if (shouldResume) {
      startLoop();
    } else {
      hideOverlay();
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    if (manualActive) return;
    manualActive = true;

    const resumeLoop = musicActive;
    if (resumeLoop) stopLoop();

    clearManualTimers();
    showOverlay();

    let elapsed = 0;

    for (let pass = 0; pass < REPEAT_COUNT; pass += 1) {
      FRAMES.forEach((src, idx) => {
        const id = setTimeout(() => {
          frameIndex = idx % FRAMES.length;
          showOverlay();
          overlay.src = FRAMES[frameIndex];
          applyBaseFilter();
          if (musicActive) {
            const color = FILTERS[frameIndex % FILTERS.length];
            const baseFilter = getLightsFilter();
            overlay.style.filter = baseFilter ? `${baseFilter} ${color}` : color;
          } else {
            overlay.style.removeProperty('filter');
          }
        }, elapsed);
        manualTimers.push(id);
        elapsed += FRAME_DURATION;
      });
    }

    const resetId = setTimeout(() => finishManual(resumeLoop), elapsed);
    manualTimers.push(resetId);
  };

  hotDogSignHit.addEventListener('click', handleClick);
  if (hotDogPortraitHit) hotDogPortraitHit.addEventListener('click', handleClick);

  window.hotDogController = {
    startLoop,
    stopLoop,
    updateLights: () => {
      applyBaseFilter();
      if (overlay.style.display === 'block') {
        const baseFilter = getLightsFilter();
        if (musicActive || manualActive) {
          const color = FILTERS[frameIndex % FILTERS.length];
          overlay.style.filter = baseFilter ? `${baseFilter} ${color}` : color;
        } else if (baseFilter) {
          overlay.style.filter = baseFilter;
        } else {
          overlay.style.removeProperty('filter');
        }
      }
    }
  };
})();

// ====== DANCING DUDES ======
(() => {
  const base = document.getElementById('dancing-dudes-one');
  const overlay = document.getElementById('dancing-dudes-dance');
  const hitbox = document.getElementById('dancing-dudes-hit');
  if (!base || !overlay || !hitbox) return;

  const BASE_SRC = 'assets/dancing-dudes-one.png';
  const FRAMES = [
    'assets/dancing-dudes-two.png',
    'assets/dancing-dudes-three.png',
    'assets/dancing-dudes-four.png',
    'assets/dancing-dudes-five.png',
    'assets/dancing-dudes-six.png',
    'assets/dancing-dudes-seven.png',
    'assets/dancing-dudes-eight.png',
    'assets/dancing-dudes-nine.png',
    'assets/dancing-dudes-ten.png',
    'assets/dancing-dudes-eleven.png',
    'assets/dancing-dudes-twelve.png',
    'assets/dancing-dudes-thirteen.png',
    'assets/dancing-dudes-fourteen.png'
  ];
  const FRAME_DURATION = 500;

  let manualActive = false;
  let manualTimers = [];
  let loopInterval = null;
  let frameIndex = 0;

  const clearManualTimers = () => {
    manualTimers.forEach(clearTimeout);
    manualTimers = [];
  };

  const showOverlay = () => { overlay.style.display = 'block'; };
  const hideOverlay = () => { overlay.style.display = 'none'; overlay.src = BASE_SRC; };

  const applyFrame = (idx) => {
    frameIndex = idx % FRAMES.length;
    showOverlay();
    overlay.src = FRAMES[frameIndex];
  };

  const startLoop = () => {
    if (loopInterval) return;
    applyFrame(frameIndex);
    loopInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % FRAMES.length;
      applyFrame(frameIndex);
    }, FRAME_DURATION);
  };

  const stopLoop = () => {
    if (!loopInterval) return;
    clearInterval(loopInterval);
    loopInterval = null;
    if (!manualActive) hideOverlay();
  };

  const finishManual = (resume) => {
    manualActive = false;
    clearManualTimers();
    if (resume) startLoop();
    else hideOverlay();
  };

  const handleClick = (event) => {
    event.stopPropagation();
    if (manualActive) return;
    const resume = !!loopInterval;
    if (resume) stopLoop();
    manualActive = true;
    clearManualTimers();
    showOverlay();

    let elapsed = 0;
    FRAMES.forEach((src, idx) => {
      const id = setTimeout(() => {
        overlay.src = FRAMES[idx];
      }, elapsed);
      manualTimers.push(id);
      elapsed += FRAME_DURATION;
    });

    const resetId = setTimeout(() => finishManual(resume), elapsed);
    manualTimers.push(resetId);
  };

  hitbox.addEventListener('click', handleClick);

  window.dancingDudesController = {
    startLoop,
    stopLoop
  };
})();

// ====== DOG BARKING ======
(() => {
  const dog = document.getElementById('dog');
  const hitbox = document.getElementById('dog-hit');
  if (!dog || !hitbox) return;

  let barking = false;

  dog.addEventListener('animationend', (event) => {
    if (event.animationName !== 'dog-bark') return;
    dog.classList.remove('barking');
    const shouldDance = dog.dataset.wasDancing === 'true';
    delete dog.dataset.wasDancing;
    if (shouldDance) dog.classList.add('dancing');
    barking = false;
  });

  hitbox.addEventListener('click', () => {
    if (barking) return;
    barking = true;
    const wasDancing = dog.classList.contains('dancing');
    dog.dataset.wasDancing = wasDancing ? 'true' : 'false';
    if (wasDancing) dog.classList.remove('dancing');
    dog.classList.remove('barking');
    void dog.offsetWidth; // restart animation
    dog.classList.add('barking');
  });
})();

// ====== LIGHT SWITCH (brightness + glow + layering) ======
(() => {
  const bg = document.getElementById('background');
  const lightSwitch = document.getElementById('light-switch');
  const hitbox = document.getElementById('light-switch-hit');
  const glow = document.getElementById('light-glow');
  if (!bg || !lightSwitch || !hitbox || !glow) return;

  let lightsOn = true;

  const syncGlowCycle = () => {
    const controls = window.glowCycleControls;
    window.__lightsOnState = lightsOn;
    if (!controls) return;
    if (lightsOn) {
      controls.enable();
    } else {
      controls.disable();
    }
  };

  const applyState = () => {
    bg.style.filter = lightsOn ? 'brightness(110%)' : 'brightness(100%)';
    glow.style.display = lightsOn ? 'block' : 'none';
    lightSwitch.style.zIndex = '1';
    document.body.classList.toggle('lights-on', lightsOn);
    document.body.classList.toggle('lights-off', !lightsOn);
    const bananaController = window.bananaController;
    if (bananaController && typeof bananaController.updateLights === 'function') {
      bananaController.updateLights();
    }
    const hotDogController = window.hotDogController;
    if (hotDogController && typeof hotDogController.updateLights === 'function') {
      hotDogController.updateLights();
    }
    const skullFire = window.skullFire;
    if (skullFire && typeof skullFire.updateLights === 'function') {
      skullFire.updateLights();
    }
    syncGlowCycle();
  };

  applyState();

  hitbox.addEventListener('click', () => {
    lightsOn = !lightsOn;
    applyState();
  });
})();

// ====== CD MUSIC (local audio toggle + disco lights) ======
(() => {
  const cd = document.getElementById('cd');
  const hitbox = document.getElementById('cd-hit');
  const disco = document.getElementById('disco-lights');
  const stage = document.getElementById('game-container');
  const dog = document.getElementById('dog');
  const oscar = document.getElementById('oscar-statue');
  const shaka = document.getElementById('shaka-statue');
  const bee = document.getElementById('bee');
  const discoBall = document.getElementById('disco-ball');
  const dumbell = document.getElementById('dumbell');
  const plantController = window.plantController;
  const bananaController = window.bananaController;
  const greenManController = window.greenManController;
  const hotDogController = window.hotDogController;
  const dancingDudesController = window.dancingDudesController;
  const skullFire = window.skullFire;
  const audio = document.getElementById('cd-audio') || new Audio('assets/theme.mp3');
  if (!cd || !hitbox || !audio || !stage) return;

  audio.loop = true;

  const START_OFFSET_SECONDS = 3;
  const DOG_DANCE_BPM = 120;
  const beatDuration = 60 / DOG_DANCE_BPM;
  const ensureStartOffset = () => {
    const { duration, currentTime } = audio;
    if (!Number.isFinite(duration)) return;
    const target = duration > START_OFFSET_SECONDS ? START_OFFSET_SECONDS : 0;
    const near = (value, compare) => Math.abs(value - compare) < 0.05;
    if (currentTime <= 0.05 || (Number.isFinite(duration) && near(currentTime, duration))) {
      audio.currentTime = target;
    }
  };

  if (audio.readyState >= 1) {
    ensureStartOffset();
  } else {
    const handleMetadata = () => {
      ensureStartOffset();
      audio.removeEventListener('loadedmetadata', handleMetadata);
    };
    audio.addEventListener('loadedmetadata', handleMetadata);
  }

  let playing = false;

  let danceTimer = null;
  let discoBallTimer = null;
  const discoFrames = [
    'assets/disco-ball-one.png',
    'assets/disco-ball-two.png',
    'assets/disco-ball-three.png',
    'assets/disco-ball-four.png'
  ];
  let discoIndex = 0;

  const startDiscoBall = () => {
    if (!discoBall) return;
    discoIndex = 0;
    discoBall.src = discoFrames[discoIndex];
    discoBall.style.display = 'block';
    if (discoBallTimer) clearInterval(discoBallTimer);
    discoBallTimer = setInterval(() => {
      discoIndex = (discoIndex + 1) % discoFrames.length;
      discoBall.src = discoFrames[discoIndex];
    }, 1000);
  };

  const stopDiscoBall = () => {
    if (discoBallTimer) {
      clearInterval(discoBallTimer);
      discoBallTimer = null;
    }
    if (discoBall) {
      discoBall.style.display = 'none';
      discoIndex = 0;
      discoBall.src = discoFrames[0];
    }
  };

  const startDancing = () => {
    if (disco) disco.classList.add('active');
    stage.classList.add('dimmed');
    if (discoBall) {
      discoBall.style.setProperty('--dog-beat-duration', `${beatDuration}s`);
      discoBall.style.setProperty('--dog-beat-multiplier', '2');
      discoBall.classList.add('dancing');
    }
    startDiscoBall();
    if (dog) {
      dog.style.setProperty('--dog-beat-duration', `${beatDuration}s`);
      dog.style.setProperty('--dog-beat-multiplier', '2');
      dog.classList.remove('dancing');
      void dog.offsetWidth;
      dog.classList.add('dancing');
    }
    if (oscar) {
      oscar.style.setProperty('--dog-beat-duration', `${beatDuration}s`);
      oscar.style.setProperty('--dog-beat-multiplier', '2');
      oscar.classList.remove('dancing');
      void oscar.offsetWidth;
      oscar.classList.add('dancing');
    }
    if (bee) {
      bee.style.display = 'block';
      bee.classList.remove('dancing');
      void bee.offsetWidth;
      bee.classList.add('dancing');
    }
    if (plantController) {
      plantController.startMusicCycle(beatDuration);
    }
    if (bananaController) bananaController.startMusic();
    if (greenManController) greenManController.startLoop();
    if (hotDogController) hotDogController.startLoop();
    if (dancingDudesController) dancingDudesController.startLoop();
    if (skullFire) skullFire.startMusic();
    danceTimer = null;
  };

  const stopDancing = () => {
    if (dog) dog.classList.remove('dancing');
    if (oscar) oscar.classList.remove('dancing');
    if (discoBall) discoBall.classList.remove('dancing');
    stopDiscoBall();
    if (bee) {
      bee.classList.remove('dancing');
      if (!bee.classList.contains('flying')) {
        bee.style.display = 'none';
      }
    }
    if (plantController) plantController.stopMusicCycle();
    if (bananaController) bananaController.stopMusic();
    if (greenManController) greenManController.stopLoop();
    if (hotDogController) hotDogController.stopLoop();
    if (dancingDudesController) dancingDudesController.stopLoop();
    if (skullFire) skullFire.stopMusic();
    if (disco) disco.classList.remove('active');
    stage.classList.remove('dimmed');
    if (danceTimer) {
      clearTimeout(danceTimer);
      danceTimer = null;
    }
  };

  hitbox.addEventListener('click', () => {
    if (!playing) {
      ensureStartOffset();
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
      cd.classList.add('spinning');
      cd.style.animationPlayState = 'running';
      if (disco) disco.classList.add('active');
      stage.classList.add('dimmed');
      startDiscoBall();
      stopDancing();
      danceTimer = setTimeout(startDancing, 2000);
      playing = true;
      return;
    }

    playing = false;
    audio.pause();
    cd.style.animationPlayState = 'paused';
    stopDancing();
  });

  audio.addEventListener('ended', () => {
    playing = false;
    cd.style.animationPlayState = 'paused';
    stopDancing();
  });
})();

// ====== DUMBELL → GAINS SEQUENCE ======
(() => {
  if (!document.body.classList.contains('home-page')) return;
  const dumbell = document.getElementById('dumbell');
  const trigger = document.getElementById('dumbell-hit') || dumbell;
  if (!dumbell || !trigger) return;

  const ORIGINAL_SRC = 'assets/dumbell.png';
  const overlayIds = ['gains-one', 'gains-two', 'gains-three', 'gains-four', 'gains-five', 'gains-six'];
  const overlays = overlayIds.map((id) => document.getElementById(id));
  const haveOverlays = overlays.every(Boolean);
  const sequence = [
    { src: 'assets/gains-one.png', duration: 500 },
    { src: 'assets/gains-two.png', duration: 500 },
    { src: 'assets/gains-three.png', duration: 500 },
    { src: 'assets/gains-four.png', duration: 500 },
    { src: 'assets/gains-five.png', duration: 500 },
    { src: 'assets/gains-six.png', duration: 1000 }
  ];

  let busy = false;
  let timeouts = [];
  const clearTimers = () => { timeouts.forEach(id => clearTimeout(id)); timeouts = []; };
  const hideOverlays = () => { overlays.forEach((el) => { if (el) el.style.display = 'none'; }); };
  const resetState = () => {
    if (haveOverlays) {
      hideOverlays();
    } else {
      dumbell.src = ORIGINAL_SRC;
    }
    busy = false;
  };

  const run = () => {
    busy = true;
    clearTimers();
    if (haveOverlays) {
      hideOverlays();
    }
    let t = 0;
    sequence.forEach(({ src, duration }, index) => {
      const id = setTimeout(() => {
        if (haveOverlays) {
          overlays.forEach((el, i) => {
            if (!el) return;
            el.style.display = i === index ? 'block' : 'none';
          });
        } else {
          dumbell.src = src;
        }
      }, t);
      timeouts.push(id);
      t += duration;
    });
    const resetId = setTimeout(() => {
      resetState();
    }, t);
    timeouts.push(resetId);
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (busy) return;
    const door = document.getElementById('door');
    const DOOR_OPEN_SRC = 'assets/door-open.png';
    if (door && door.src.includes(DOOR_OPEN_SRC)) {
      door.src = 'assets/door-closed.png';
    }
    run();
  });
})();

// ====== CATEGORY LABEL GLOWS ======
(() => {
  const CYCLE_IDS = ['writing', 'directing', 'animation', 'production-design'];
  const signs = new Map();
  CYCLE_IDS.forEach((id) => {
    const base = document.getElementById(id);
    const glow = document.getElementById(`${id}-glow`);
    if (base && glow) {
      signs.set(id, { base, glow });
    }
  });

  const hits = document.querySelectorAll('.category-hit');
  const manualHits = new Set();
  const cycleOrder = CYCLE_IDS.filter((id) => signs.has(id));

  const CYCLE_DURATION_MS = 1000;
  let cycleIndex = 0;
  let cycleTimer = null;
  let cycleActive = false;
  let autoCycleEnabled = false;

  const setGlowVisibility = (id, visible) => {
    const sign = signs.get(id);
    if (!sign) return;
    sign.glow.classList.toggle('is-visible', visible);
    sign.base.classList.toggle('glow-active', visible);
  };

  const hideAllGlows = () => {
    signs.forEach(({ glow, base }) => {
      glow.classList.remove('is-visible');
      base.classList.remove('glow-active');
    });
  };

  const stopCycle = () => {
    if (cycleTimer) {
      clearTimeout(cycleTimer);
      cycleTimer = null;
    }
    cycleActive = false;
  };

  const stepCycle = () => {
    if (!autoCycleEnabled || manualHits.size > 0 || cycleOrder.length === 0) {
      cycleActive = false;
      return;
    }

    cycleActive = true;
    const id = cycleOrder[cycleIndex];
    hideAllGlows();
    setGlowVisibility(id, true);

    cycleTimer = setTimeout(() => {
      if (manualHits.size > 0 || !autoCycleEnabled) {
        cycleTimer = null;
        cycleActive = false;
        return;
      }
      setGlowVisibility(id, false);
      cycleIndex = (cycleIndex + 1) % cycleOrder.length;
      stepCycle();
    }, CYCLE_DURATION_MS);
  };

  const startCycle = () => {
    if (!autoCycleEnabled || cycleActive || manualHits.size > 0 || cycleOrder.length === 0) return;
    stepCycle();
  };

  const pauseForManual = (hit) => {
    manualHits.add(hit);
    stopCycle();
  };

  const resumeFromManual = (hit) => {
    manualHits.delete(hit);
    if (manualHits.size === 0) {
      hideAllGlows();
      startCycle();
    }
  };

  hits.forEach((hit) => {
    const targetId = hit.dataset.target;
    if (!targetId || !signs.has(targetId)) return;

    const showManual = () => {
      pauseForManual(hit);
      hideAllGlows();
      setGlowVisibility(targetId, true);
    };

    const hideManual = () => {
      setGlowVisibility(targetId, false);
      resumeFromManual(hit);
    };

    hit.addEventListener('mouseenter', showManual);
    hit.addEventListener('mouseleave', hideManual);
    hit.addEventListener('focus', showManual);
    hit.addEventListener('blur', hideManual);
    hit.addEventListener('touchstart', showManual, { passive: true });
    hit.addEventListener('touchend', hideManual, { passive: true });
    hit.addEventListener('touchcancel', hideManual, { passive: true });

    hit.addEventListener('click', () => {
      hideManual();
      const link = hit.dataset.link;
      if (!link) return;
      if (/^https?:/i.test(link)) {
        window.open(link, '_blank');
      } else {
        window.location.href = link;
      }
    });
  });

  const enableAutoCycle = () => {
    if (cycleOrder.length === 0) return;
    autoCycleEnabled = true;
    startCycle();
  };

  const disableAutoCycle = () => {
    autoCycleEnabled = false;
    stopCycle();
    hideAllGlows();
  };

  if (cycleOrder.length > 0) {
    hideAllGlows();
  }

  window.glowCycleControls = {
    enable: enableAutoCycle,
    disable: disableAutoCycle
  };

  if (typeof window.__lightsOnState === 'boolean') {
    if (window.__lightsOnState) {
      enableAutoCycle();
    } else {
      disableAutoCycle();
    }
  }
})();

// ====== BOTTOM ICONS ======
(() => {
  const mailHit = document.getElementById('mail-hit');
  const phoneHit = document.getElementById('phone-hit');
  const igHit = document.getElementById('instagram-hit');
  const vimeoHit = document.getElementById('vimeo-hit');

  if (mailHit)  mailHit.addEventListener('click',  () => window.location.href = 'mailto:alexrhhoney@gmail.com'); // or: 'mailto:you@email.com'
  if (phoneHit) phoneHit.addEventListener('click', () => window.location.href = 'contact.html'); // or: 'tel:+61...'
  if (igHit)    igHit.addEventListener('click',    () => window.open('https://www.instagram.com/sauvignonblancpink/', '_blank'));
  if (vimeoHit) vimeoHit.addEventListener('click', () => window.open('https://vimeo.com/YOUR_USERNAME', '_blank'));
})();

// ====== ABOUT PAGE LIGHT SWITCH ======
(() => {
  if (!document.body.classList.contains('about-page')) return;

  const lightSwitch = document.getElementById('light-switch');
  const lightSwitchHit = document.getElementById('light-switch-hit');
  const glow = document.getElementById('about-light-glow');
  if (!lightSwitch || !lightSwitchHit || !glow) return;

  let glowVisible = true;

  const sequenceIds = ['bio-one', 'bio-two', 'bio-three', 'bio-four', 'shrug-emoji'];
  const sequenceEls = sequenceIds
    .map((id) => document.getElementById(id))
    .filter((el) => el);
  let sequenceDelay = 1000;

  sequenceEls.forEach((el) => {
    el.classList.remove('is-visible');
    setTimeout(() => {
      el.style.display = 'block';
      requestAnimationFrame(() => {
        el.classList.add('is-visible');
      });
    }, sequenceDelay);
    sequenceDelay += 500;
  });

  const sprayCan = document.getElementById('spray-can');
  const sprayCanHit = document.getElementById('spray-can-hit');
  const graffiti = document.getElementById('graffiti');
  const soapBucket = document.getElementById('soap-bucket');
  const soapBucketHit = document.getElementById('soap-bucket-hit');
  const homeLogo = document.getElementById('home-logo');

  if (graffiti) {
    graffiti.addEventListener('animationend', (event) => {
      if (event.animationName === 'graffiti-spray') {
        graffiti.classList.remove('graffiti-animate');
        graffiti.style.opacity = '1';
        graffiti.style.clipPath = 'inset(0 0 0 0)';
        return;
      }

      if (event.animationName === 'graffiti-erase') {
        graffiti.classList.remove('graffiti-erasing');
        graffiti.classList.remove('graffiti-visible');
        graffiti.style.opacity = '0';
        graffiti.style.clipPath = 'inset(0 100% 0 0)';
      }
    });
  }

  if (sprayCan && sprayCanHit) {
    let shaking = false;
    let hopTimerId = null;

    const triggerHop = () => {
      if (shaking) return;
      sprayCan.classList.remove('spray-can-hop');
      void sprayCan.offsetWidth;
      sprayCan.classList.add('spray-can-hop');
    };

    const stopHopTimer = () => {
      if (hopTimerId) {
        clearInterval(hopTimerId);
        hopTimerId = null;
      }
    };

    const stopAutoHop = () => {
      stopHopTimer();
      sprayCan.classList.remove('spray-can-hop');
    };

    const startAutoHop = () => {
      triggerHop();
      hopTimerId = setInterval(triggerHop, 4000);
    };

    startAutoHop();

    sprayCan.addEventListener('animationend', (event) => {
      if (event.animationName === 'spray-can-shake') {
        sprayCan.classList.remove('spray-can-shake');
        shaking = false;
        return;
      }
      if (event.animationName === 'spray-can-hop') {
        sprayCan.classList.remove('spray-can-hop');
      }
    });

    sprayCanHit.addEventListener('click', () => {
      if (shaking) return;
      stopAutoHop();
      shaking = true;
      sprayCan.classList.remove('spray-can-shake');
      sprayCan.classList.remove('spray-can-hop');
      void sprayCan.offsetWidth; // restart animation
      sprayCan.classList.add('spray-can-shake');
      if (graffiti) {
        graffiti.classList.add('graffiti-visible');
        graffiti.classList.remove('graffiti-animate');
        graffiti.classList.remove('graffiti-erasing');
        graffiti.style.opacity = '0';
        graffiti.style.clipPath = 'inset(0 100% 0 0)';
        void graffiti.offsetWidth; // restart animation
        graffiti.classList.add('graffiti-animate');
      }
    });
  }

  if (soapBucket && soapBucketHit) {
    let bouncing = false;

    soapBucket.addEventListener('animationend', (event) => {
      if (event.animationName !== 'soap-bucket-bounce') return;
      soapBucket.classList.remove('soap-bucket-bounce');
      bouncing = false;
    });

    soapBucketHit.addEventListener('click', () => {
      if (!bouncing) {
        bouncing = true;
        soapBucket.classList.remove('soap-bucket-bounce');
        void soapBucket.offsetWidth; // restart
        soapBucket.classList.add('soap-bucket-bounce');
      }

      if (graffiti && graffiti.classList.contains('graffiti-visible')) {
        graffiti.classList.remove('graffiti-animate');
        graffiti.classList.remove('graffiti-erasing');
        graffiti.style.opacity = '1';
        graffiti.style.clipPath = 'inset(0 0 0 0)';
        void graffiti.offsetWidth;
        graffiti.classList.add('graffiti-erasing');
      }
    });
  }

  const cactus = document.getElementById('cactus-mad');
  const cactusHit = document.getElementById('cactus-hit');
  if (cactus && cactusHit) {
    const overlayIds = [
      'cactus-mad-one',
      'cactus-mad-two',
      'cactus-mad-three',
      'cactus-mad-four'
    ];
    const durations = [2000, 2000, 2000, 3000];
    const overlays = overlayIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    let stateIndex = 0;
    let cactusTimeoutId = null;

    const hideAllOverlays = () => {
      overlays.forEach((overlay) => overlay.classList.remove('is-visible'));
    };

    cactusHit.addEventListener('click', () => {
      if (overlays.length === 0) return;

      hideAllOverlays();

      const overlay = overlays[stateIndex % overlays.length];
      const duration = durations[stateIndex % durations.length];
      stateIndex += 1;

      overlay.classList.add('is-visible');

      if (cactusTimeoutId) clearTimeout(cactusTimeoutId);
      cactusTimeoutId = setTimeout(() => {
        overlay.classList.remove('is-visible');
        cactusTimeoutId = null;
      }, duration);
    });
  }

  const kookaburra = document.getElementById('kookaburra');
  const kookaburraHit = document.getElementById('kookaburra-hit');
  if (kookaburra && kookaburraHit) {
    const STILL_SRC = 'assets/kookaburra.png';
    const TURN_SRC = 'assets/kookaburra-turn.png';
    let revertTimeoutId = null;

    const showStill = () => {
      kookaburra.src = STILL_SRC;
      revertTimeoutId = null;
    };

    kookaburraHit.addEventListener('click', () => {
      kookaburra.src = TURN_SRC;
      if (revertTimeoutId) clearTimeout(revertTimeoutId);
      revertTimeoutId = setTimeout(showStill, 2000);
    });
  }

  const apply = () => {
    glow.style.display = glowVisible ? 'block' : 'none';
    document.body.classList.toggle('lights-on', glowVisible);
    if (homeLogo) {
      homeLogo.style.display = glowVisible ? 'block' : 'none';
    }
  };

  const toggleLights = () => {
    glowVisible = !glowVisible;
    apply();
  };

  apply();

  lightSwitchHit.addEventListener('click', () => {
    toggleLights();
  });
})();

// ====== CREDITS PAGE LIGHT SWITCH ======
(() => {
  if (!document.body.classList.contains('credits-page')) return;

  const lightSwitch = document.getElementById('light-switch');
  const glow = document.getElementById('light-switch-glow');
  const stringLightsGlow = document.getElementById('credits-string-lights-glow');
  const funStuffGlow = document.getElementById('credits-fun-stuff-glow');
  const featuresGlowOne = document.getElementById('credits-features-glow-one');
  const featuresGlowTwo = document.getElementById('credits-features-glow-two');
  const digitalGlowOne = document.getElementById('credits-digital-glow-one');
  const digitalGlowTwo = document.getElementById('credits-digital-glow-two');
  const shortsGlowOne = document.getElementById('credits-shorts-glow-one');
  const shortsGlowTwo = document.getElementById('credits-shorts-glow-two');
  const hitbox = document.getElementById('light-switch-hit');
  if (!lightSwitch || !glow || !hitbox) return;

  const createBlinkCycle = (element, duration) => {
    if (!element) return { start: () => {}, stop: () => {} };
    let active = false;
    let timeoutId = null;

    const run = () => {
      if (!active) return;
      element.classList.toggle('is-visible');
      timeoutId = setTimeout(run, duration);
    };

    return {
      start() {
        if (active) return;
        active = true;
        element.classList.add('is-visible');
        timeoutId = setTimeout(run, duration);
      },
      stop() {
        if (!active) return;
        active = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        element.classList.remove('is-visible');
      }
    };
  };

  const createTwoFrameCycle = (first, second, firstDuration, secondDuration) => {
    if (!first || !second) return { start: () => {}, stop: () => {} };
    let active = false;
    let timeoutId = null;

    const schedule = (index) => {
      if (!active) return;
      if (index === 0) {
        first.classList.add('is-visible');
        second.classList.remove('is-visible');
        timeoutId = setTimeout(() => schedule(1), firstDuration);
      } else {
        second.classList.add('is-visible');
        first.classList.remove('is-visible');
        timeoutId = setTimeout(() => schedule(0), secondDuration);
      }
    };

    return {
      start() {
        if (active) return;
        active = true;
        schedule(0);
      },
      stop() {
        if (!active) return;
        active = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        first.classList.remove('is-visible');
        second.classList.remove('is-visible');
      }
    };
  };

  const funCycle = (() => {
    if (!funStuffGlow) return { start: () => {}, stop: () => {} };
    let active = false;
    let timeoutId = null;
    let visible = false;

    const setVisible = (isVisible) => {
      visible = isVisible;
      funStuffGlow.classList.toggle('is-visible', visible);
    };

    const toggle = () => {
      if (!active) return;
      setVisible(!visible);
      timeoutId = setTimeout(toggle, 1000);
    };

    return {
      start() {
        if (active) return;
        active = true;
        setVisible(true);
        timeoutId = setTimeout(toggle, 1000);
      },
      stop() {
        if (!active) return;
        active = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        setVisible(false);
      }
    };
  })();
  const featuresCycle = createTwoFrameCycle(featuresGlowOne, featuresGlowTwo, 1000, 1000);
  const digitalCycle = createTwoFrameCycle(digitalGlowOne, digitalGlowTwo, 1000, 1000);
  const shortsCycle = createTwoFrameCycle(shortsGlowOne, shortsGlowTwo, 1000, 1000);

  let glowVisible = document.body.classList.contains('lights-on');

  const apply = () => {
    glow.style.display = glowVisible ? 'block' : 'none';
    if (stringLightsGlow) {
      stringLightsGlow.style.display = glowVisible ? 'block' : 'none';
    }
    document.body.classList.toggle('lights-on', glowVisible);
    if (glowVisible) {
      funCycle.start();
      featuresCycle.start();
      digitalCycle.start();
      shortsCycle.start();
    } else {
      funCycle.stop();
      featuresCycle.stop();
      digitalCycle.stop();
      shortsCycle.stop();
    }
  };

  apply();

  hitbox.addEventListener('click', () => {
    glowVisible = !glowVisible;
    apply();
  });
})();

// ====== CREDITS PAGE ME LEANING SPEECH ======
(() => {
  if (!document.body.classList.contains('credits-page')) return;

  const figure = document.getElementById('me-leaning');
  const hitbox = document.getElementById('me-leaning-hit');
  if (!figure || !hitbox) return;

  const BASE_SRC = 'assets/me-leaning.png';
  const FRAMES = [
    { src: 'assets/me-leaning-speech-one.png', duration: 2000 },
    { src: 'assets/me-leaning-speech-two.png', duration: 2000 }
  ];

  let active = false;
  let timers = [];

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const reset = () => {
    figure.src = BASE_SRC;
    clearTimers();
    active = false;
  };

  hitbox.addEventListener('click', (event) => {
    event.stopPropagation();
    if (active) return;
    active = true;
    clearTimers();

    let elapsed = 0;

    FRAMES.forEach(({ src, duration }) => {
      const id = setTimeout(() => {
        figure.src = src;
      }, elapsed);
      timers.push(id);
      elapsed += duration;
    });

  const resetId = setTimeout(reset, elapsed);
  timers.push(resetId);
});
})();

// ====== CREDITS OVERLAYS (FEATURES / SHORTS / DIGITAL) ======
(() => {
  if (!document.body.classList.contains('credits-page')) return;

  const overlays = [];

  const updateOverlayState = () => {
    const anyOpen = overlays.some(o => o.isOpen && o.isOpen());
    document.body.classList.toggle('credits-overlay-open', !!anyOpen);
  };

  const registerOverlay = (hitId, listId, closeId) => {
    const hit = document.getElementById(hitId);
    const list = document.getElementById(listId);
    const close = document.getElementById(closeId);
    if (!hit || !list || !close) return;

    const isOpen = () => list.style.display === 'block';

    const hide = () => {
      list.style.display = 'none';
      close.style.display = 'none';
      updateOverlayState();
    };

    const show = () => {
      overlays.forEach((overlay) => {
        if (overlay.hide !== hide) overlay.hide();
      });
      list.style.display = 'block';
      close.style.display = 'block';
      updateOverlayState();
    };

    hide();

    hit.addEventListener('click', (event) => {
      event.stopPropagation();
      if (list.style.display === 'block') {
        hide();
      } else {
        show();
      }
    });

    close.addEventListener('click', (event) => {
      event.stopPropagation();
      hide();
    });

    list.addEventListener('click', (event) => event.stopPropagation());

    overlays.push({ hide, isOpen });
    updateOverlayState();
  };

  registerOverlay('credits-features-hit', 'features-credits-list', 'features-x');
  registerOverlay('credits-shorts-hit', 'shorts-credits-list', 'shorts-x');
  registerOverlay('credits-digital-hit', 'digital-content-credits', 'digital-content-x');
  registerOverlay('credits-fun-stuff-hit', 'fun-stuff-credits', 'fun-stuff-x');
})();

// ====== CLOUD NAV ======
(() => {
  const to = (id, href) => {
    const el = document.getElementById(`${id}-hit`) || document.getElementById(id);
    if (el) el.addEventListener('click', () => window.location.href = href);
  };
  to('nav-home', 'index.html');
  to('nav-about', 'about.html');
  to('nav-gallery', 'gallery.html');
  to('nav-credits', 'credits.html');
})();

// ====== CREDITS: MAGPIES CLICK SEQUENCE ======
(() => {
  if (!document.body.classList.contains('credits-page')) return;
  const magpies = document.getElementById('magpies');
  const overlay = document.getElementById('magpies-overlay');
  const dim = document.getElementById('credits-dim');
  const trigger = document.getElementById('magpies-hit') || magpies;
  if (!magpies || !trigger) return;

  const baseSrc = 'assets/magpies.png';
  const seq = [
    // 0: first click -> one (2s), base (1s), onepointfive (1s)
    () => chain([
      { src: 'assets/magpie-speech-one.png', ms: 2000 },
      { src: baseSrc, ms: 1000 },
      { src: 'assets/magpie-speech-onepointfive.png', ms: 1000 }
    ]),
    // 1: second click -> two (2s)
    () => chain([{ src: 'assets/magpie-speech-two.png', ms: 2000 }]),
    // 2: third click -> three (2s), threepointfive (2s)
    () => chain([
      { src: 'assets/magpie-speech-three.png', ms: 2000 },
      { src: 'assets/magpie-speech-threepointfive.png', ms: 2000 }
    ]),
    // 3: fourth click -> four (1s)
    () => chain([{ src: 'assets/magpie-speech-four.png', ms: 1000 }]),
    // 4: fifth click -> five (2s)
    () => chain([{ src: 'assets/magpie-speech-five.png', ms: 2000 }]),
    // 5: sixth click -> special complex sequence (updated)
    () => specialSequence()
  ];

  let stage = 0;
  let busy = false;
  let timers = [];

  function clearTimers() {
    timers.forEach(t => clearTimeout(t));
    timers = [];
    document.body.classList.remove('earthquake');
  }

  function chain(steps) {
    busy = true;
    clearTimers();
    let t = 0;
    steps.forEach((step, i) => {
      const showT = setTimeout(() => {
        magpies.classList.remove('stop-grow');
        magpies.classList.remove('stop-shake');
        magpies.style.transform = '';
        magpies.src = step.src;
      }, t);
      timers.push(showT);
      t += step.ms;
    });
    const doneT = setTimeout(() => {
      magpies.classList.remove('stop-grow');
      magpies.classList.remove('stop-shake');
      magpies.style.transform = '';
      magpies.src = baseSrc;
      busy = false;
      stage = (stage + 1) % seq.length;
    }, t);
    timers.push(doneT);
  }

  function specialSequence() {
    busy = true;
    clearTimers();
    let t = 0;
    const add = (cb, delay) => { const id = setTimeout(cb, t); timers.push(id); t += delay; };

    // fivepointfive (2s)
    add(() => { resetEffects(); magpies.src = 'assets/magpie-speech-fivepointfive.png'; }, 0);
    add(() => {}, 3000);
    // back to base
    add(() => { resetEffects(); magpies.src = baseSrc; if (overlay) overlay.style.display = 'none'; }, 0);
    add(() => {
      document.body.classList.remove('earthquake');
      document.body.classList.add('earthquake');
      const quakeOffId = setTimeout(() => {
        document.body.classList.remove('earthquake');
      }, 1000);
      timers.push(quakeOffId);
    }, 0);
    add(() => {}, 1000);
    // mum (2s) — flies in from top like landing
    add(() => {
      resetEffects();
      if (overlay) {
        overlay.src = 'assets/magpie-mum.png';
        overlay.style.display = 'block';
        overlay.classList.remove('mum-landing');
        void overlay.offsetWidth; // reflow to restart animation
        overlay.classList.add('mum-landing');
      } else {
        magpies.src = 'assets/magpie-mum.png';
      }
    }, 0);
    add(() => {}, 2000);
    // stop: grow (1s), then shake 3s; dim the scene while active
    add(() => {
      if (overlay) { overlay.src = 'assets/magpie-stop.png'; overlay.style.display = 'block'; }
      else { magpies.src = 'assets/magpie-stop.png'; }
      const el = overlay || magpies;
      // ensure no residual landing animation
      el.classList.remove('mum-landing');
      el.classList.remove('stop-grow');
      el.classList.remove('stop-shake');
      void el.offsetWidth;
      el.classList.add('stop-grow');
      if (dim) dim.style.display = 'block';
    }, 0);
    add(() => {
      const el = overlay || magpies;
      el.classList.remove('stop-grow');
      void el.offsetWidth;
      el.classList.add('stop-shake');
    }, 2000);
    add(() => { // end shake, then drongo with hard cut and undim scene
      const el = overlay || magpies;
      el.classList.remove('stop-shake');
      el.style.transform = '';
      if (dim) dim.style.display = 'none';
      if (overlay) {
        overlay.classList.remove('mum-landing');
        overlay.src = 'assets/magpie-drongo.png';
        overlay.style.display = 'block';
      } else {
        magpies.src = 'assets/magpie-drongo.png';
      }
      el.classList.remove('drongo-fly-away');
      void el.offsetWidth;
      el.classList.add('drongo-fly-away');
    }, 2000);
    add(() => {}, 2000);
    // back to base
    add(() => { resetEffects(); magpies.src = baseSrc; if (overlay) overlay.style.display = 'none'; if (dim) dim.style.display = 'none'; }, 0);
    add(() => {}, 0);

    // then six (2s), seven (2s), eight (2s)
    add(() => { resetEffects(); magpies.src = 'assets/magpie-speech-six.png'; }, 0);
    add(() => {}, 2000);
    add(() => { resetEffects(); magpies.src = 'assets/magpie-speech-seven.png'; }, 0);
    add(() => {}, 2000);
    add(() => { resetEffects(); magpies.src = 'assets/magpie-speech-eight.png'; }, 0);
    add(() => {}, 2000);

    // finish
    add(() => {
      resetEffects();
      magpies.src = baseSrc;
      busy = false;
      stage = (stage + 1) % seq.length;
    }, 0);
  }

  function resetEffects() {
    [overlay, magpies].forEach((el) => {
      if (!el) return;
      el.classList.remove('stop-grow');
      el.classList.remove('stop-shake');
      el.classList.remove('drongo-fade');
      el.classList.remove('drongo-fly-away');
      el.classList.remove('mum-landing');
      el.style.transform = '';
    });
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (busy) return; // ignore clicks during an active sequence
    const fn = seq[stage] || (() => {});
    fn();
  });
})();

// ====== GALLERY PAGE LIGHT SWITCH ======
(() => {
  if (!document.body.classList.contains('gallery-page')) return;

  const lightSwitch = document.getElementById('light-switch');
  const glow = document.getElementById('gallery-light-glow');
  const frames = [
    document.getElementById('stills-glow-one'),
    document.getElementById('stills-glow-two'),
    document.getElementById('stills-glow-three'),
    document.getElementById('stills-glow-four')
  ].filter(Boolean);
  const hitbox = document.getElementById('light-switch-hit');
  if (!lightSwitch || !glow || !hitbox) return;

  let lightsOn = true;
  let cycleTimer = null;
  let stepIndex = 0;
  // Sequence: one (1s), two (1s), three (1s), nothing (1s), four (1s), nothing (1s)
  const sequence = [0, 1, 2, null, 3, null];

  const hideAllFrames = () => {
    frames.forEach(f => { if (f) f.style.display = 'none'; });
  };

  const showFrame = (i) => {
    hideAllFrames();
    const f = frames[i % frames.length];
    if (f) f.style.display = 'block';
  };

  const showStep = (step) => {
    if (step === null) {
      hideAllFrames();
    } else {
      showFrame(step);
    }
  };

  const startCycle = () => {
    if (cycleTimer || frames.length === 0) return;
    stepIndex = 0;
    showStep(sequence[stepIndex]);
    cycleTimer = setInterval(() => {
      stepIndex = (stepIndex + 1) % sequence.length;
      showStep(sequence[stepIndex]);
    }, 1000);
  };

  const stopCycle = () => {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }
    hideAllFrames();
  };

  const apply = () => {
    glow.style.display = lightsOn ? 'block' : 'none';
    if (lightsOn) {
      startCycle();
    } else {
      stopCycle();
    }
  };

  // initialize state
  hideAllFrames();
  apply();

  hitbox.addEventListener('click', () => {
    lightsOn = !lightsOn;
    apply();
  });
})();

// ====== GALLERY: CONSTRUCTION GLOW LOOP ======
(() => {
  if (!document.body.classList.contains('gallery-page')) return;

  const frames = [
    document.getElementById('construction-glow-one'),
    document.getElementById('construction-glow-two')
  ];

  if (frames.some((el) => !el)) return;

  const DURATION_MS = 2000;
  let index = 0;

  const showFrame = (i) => {
    frames.forEach((el, idx) => {
      if (!el) return;
      el.style.display = idx === i ? 'block' : 'none';
    });
  };

  showFrame(index);
  setInterval(() => {
    index = (index + 1) % frames.length;
    showFrame(index);
  }, DURATION_MS);
})();

// ====== GALLERY: BEA & KATE SLIDESHOW MODAL ======
(() => {
  if (!document.body.classList.contains('gallery-page')) return;

  const modal = document.getElementById('bea-modal');
  const img = document.getElementById('bea-slide');
  const prev = document.getElementById('bea-prev');
  const next = document.getElementById('bea-next');
  const closeBtn = document.getElementById('bea-close');
  const indicator = document.getElementById('bea-indicator');
  if (!modal || !img || !prev || !next || !closeBtn || !indicator) return;

  const slides = [
    { id: 'gallery-sexy-nurse', hitId: 'gallery-sexy-nurse-hit', src: 'assets/sexy-nurse.png' },
    { id: 'gallery-hhbd', hitId: 'gallery-hhbd-hit', src: 'assets/hhbd.png' },
    { id: 'gallery-bros', hitId: 'gallery-bros-hit', src: 'assets/bros.png' },
    { id: 'gallery-mr-floof', hitId: 'gallery-mr-floof-hit', src: 'assets/mr-floof.png' },
    { id: 'gallery-bea-and-kate', hitId: 'gallery-bea-and-kate-hit', src: 'assets/bea-and-kate.png' },
    { id: 'gallery-moderator', hitId: 'gallery-moderator-hit', src: 'assets/moderator.png' },
    { id: 'gallery-misc', hitId: 'gallery-misc-hit', src: 'assets/misc.png' }
  ].filter((slide) => !!slide.src);

  slides.forEach(({ src }) => { const i = new Image(); i.src = src; });

  let idx = 0;
  const hasSlides = slides.length > 0;

  const show = (i) => {
    if (!hasSlides) return;
    idx = (i + slides.length) % slides.length;
    img.src = slides[idx].src;
    indicator.textContent = `${idx + 1} / ${slides.length}`;
  };

  const openModal = (startIndex) => {
    if (!hasSlides) return;
    if (typeof startIndex === 'number' && Number.isFinite(startIndex)) {
      idx = (startIndex + slides.length) % slides.length;
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    show(idx);
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const registerTrigger = (elementId, index) => {
    if (!hasSlides || index < 0) return;
    const el = document.getElementById(elementId);
    if (!el) return;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      openModal(index);
    });
  };

  slides.forEach((slide, index) => {
    registerTrigger(slide.id, index);
    if (slide.hitId) registerTrigger(slide.hitId, index);
  });

  closeBtn.addEventListener('click', closeModal);
  prev.addEventListener('click', () => show(idx - 1));
  next.addEventListener('click', () => show(idx + 1));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') return closeModal();
    if (e.key === 'ArrowRight') return show(idx + 1);
    if (e.key === 'ArrowLeft') return show(idx - 1);
  });

  // Basic swipe support
  let startX = null;
  modal.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
  modal.addEventListener('touchend', (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) show(idx + 1); else show(idx - 1);
    }
    startX = null;
  });
})();
