(function () {
  if (document.getElementById('__ep-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = '__ep-overlay';
  overlay.style.cssText = `
    position: fixed; pointer-events: none; z-index: 2147483647;
    border: 2px solid #ff5252; background: rgba(255,82,82,0.1);
    transition: all 0.05s ease-out; display: none;
  `;
  document.documentElement.appendChild(overlay);

  const tooltip = document.createElement('div');
  tooltip.id = '__ep-tooltip';
  tooltip.style.cssText = `
    position: fixed; pointer-events: none; z-index: 2147483647;
    background: #1a1a1a; color: #fff; font: 12px monospace;
    padding: 4px 8px; border-radius: 4px; display: none;
  `;
  document.documentElement.appendChild(tooltip);

  const banner = document.createElement('div');
  banner.id = '__ep-banner';
  banner.textContent = 'Element Extractor: click an element to extract it (Esc to cancel)';
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
    background: #ff5252; color: #fff; font: 13px sans-serif;
    padding: 8px; text-align: center;
  `;
  document.documentElement.appendChild(banner);

  let hovered = null;

  function onMouseMove(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === hovered || el.id === '__ep-overlay') return;
    hovered = el;
    const rect = el.getBoundingClientRect();
    overlay.style.display = 'block';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';

    tooltip.style.display = 'block';
    tooltip.textContent = describeElement(el);
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = Math.max(0, rect.top - 24) + 'px';
  }

  function describeElement(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
      s += '.' + el.className.trim().split(/\s+/).join('.');
    }
    return s;
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const target = hovered || e.target;
    cleanup();
    extractAndSend(target);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') cleanup();
  }

  function cleanup() {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    overlay.remove();
    tooltip.remove();
    banner.remove();
  }

  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);

  function getCssVariables(el) {
    const vars = {};
    const computed = getComputedStyle(el);
    for (const prop of computed) {
      if (prop.startsWith('--')) vars[prop] = computed.getPropertyValue(prop).trim();
    }
    return vars;
  }

  function getMatchedRules(el) {
    const rules = [];
    for (const sheet of document.styleSheets) {
      let cssRules;
      try {
        cssRules = sheet.cssRules;
      } catch (err) {
        rules.push({ source: sheet.href || 'inline', error: 'CORS-blocked: cannot read rules' });
        continue;
      }
      if (!cssRules) continue;
      for (const rule of cssRules) {
        if (rule.selectorText) {
          try {
            if (el.matches(rule.selectorText)) {
              rules.push({ selector: rule.selectorText, cssText: rule.cssText, source: sheet.href || 'inline' });
            }
          } catch (err) {
            // invalid selector for this browser, skip
          }
        }
      }
    }
    return rules;
  }

  function extractAndSend(el) {
    const rect = el.getBoundingClientRect();
    const computed = getComputedStyle(el);
    const computedStyles = {};
    for (const prop of computed) {
      computedStyles[prop] = computed.getPropertyValue(prop);
    }

    const result = {
      identity: {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        classes: el.className && typeof el.className === 'string' ? el.className.trim().split(/\s+/) : [],
        selector: describeElement(el)
      },
      html: {
        outerHTML: el.outerHTML,
        innerHTML: el.innerHTML
      },
      computedStyles,
      matchedRules: getMatchedRules(el),
      cssVariables: getCssVariables(el),
      layout: {
        boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        offsetParent: el.offsetParent ? describeElement(el.offsetParent) : null
      },
      fonts: {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight
      },
      attributes: Array.from(el.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {}),
      url: location.href,
      extractedAt: new Date().toISOString()
    };

    const json = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(json).then(
      () => console.log('Element Extractor: copied to clipboard'),
      (err) => console.warn('Element Extractor: clipboard write failed', err)
    );

    const port = chrome.runtime.connect({ name: 'extractor' });
    port.postMessage({ type: 'RESULT', data: result });
  }
})();
