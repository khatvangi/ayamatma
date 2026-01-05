(() => {
  const root = document.documentElement;
  const storage = window.localStorage;
  const THEME_KEY = 'ayamatma-theme';
  const DEV_KEY = 'ayamatma-show-devanagari';
  const IAST_KEY = 'ayamatma-show-iast';

  const getBool = (value, fallback) => {
    if (value === null || value === undefined) return fallback;
    return value === 'true';
  };

  const setDataset = (key, value) => {
    root.dataset[key] = value ? 'true' : 'false';
  };

  const updateVerseButtons = (name, value) => {
    document
      .querySelectorAll(`[data-verse-toggle="${name}"]`)
      .forEach((button) => button.setAttribute('aria-pressed', String(value)));
  };

  const initThemeToggle = () => {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    const setTheme = (theme) => {
      root.dataset.theme = theme;
      storage.setItem(THEME_KEY, theme);
      toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
      toggle.setAttribute('aria-pressed', String(theme === 'light'));
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    };

    const savedTheme = storage.getItem(THEME_KEY) || 'dark';
    setTheme(savedTheme);

    toggle.addEventListener('click', () => {
      const current = root.dataset.theme || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  };

  const initVerseToggles = () => {
    const showDevanagari = getBool(storage.getItem(DEV_KEY), true);
    const showIast = getBool(storage.getItem(IAST_KEY), true);

    setDataset('showDevanagari', showDevanagari);
    setDataset('showIast', showIast);
    updateVerseButtons('devanagari', showDevanagari);
    updateVerseButtons('iast', showIast);

    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-verse-toggle]');
      if (!button) return;
      const target = button.getAttribute('data-verse-toggle');
      if (target === 'devanagari') {
        const nextValue = !(root.dataset.showDevanagari === 'true');
        storage.setItem(DEV_KEY, String(nextValue));
        setDataset('showDevanagari', nextValue);
        updateVerseButtons('devanagari', nextValue);
      }
      if (target === 'iast') {
        const nextValue = !(root.dataset.showIast === 'true');
        storage.setItem(IAST_KEY, String(nextValue));
        setDataset('showIast', nextValue);
        updateVerseButtons('iast', nextValue);
      }
    });
  };

  const initAudioPlayers = () => {
    document.querySelectorAll('[data-audio-player]').forEach((player) => {
      const audio = player.querySelector('audio');
      const rate = player.querySelector('[data-audio-rate]');
      if (!audio || !rate) return;

      rate.addEventListener('change', (event) => {
        const value = Number(event.target.value);
        audio.playbackRate = Number.isNaN(value) ? 1 : value;
      });
    });
  };

  initThemeToggle();
  initVerseToggles();
  initAudioPlayers();
})();
