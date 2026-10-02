(() => {
  const dialog = document.getElementById('donate-dialog');
  const form = document.getElementById('donate-form');
  if (!dialog || !form) return;

  const titleInput = document.getElementById('donate-title');
  const quantityInput = document.getElementById('donate-quantity');
  const addressInput = document.getElementById('donate-address');
  const locateBtn = document.getElementById('donate-locate');
  const locationStatus = document.getElementById('donate-location-status');
  const dropzone = document.getElementById('donate-dropzone');
  const fileInput = document.getElementById('donate-photo');
  const preview = document.getElementById('donate-preview');
  const dropzoneHint = document.getElementById('donate-dropzone-hint');
  const cancelBtn = document.getElementById('donate-cancel');
  const toast = document.getElementById('donate-toast');
  const countLabel = document.getElementById('donate-count');
  const titleCount = document.getElementById('donate-title-count');
  const textInputs = [titleInput, quantityInput, addressInput];

  const DRAFT_KEY = 'replate:donation-draft';
  const LISTINGS_KEY = 'replate:donations';
  const PHOTO_MAX_SIDE = 1024;
  let photoDataUrl = null;
  let coords = null;
  let toastTimer = 0;

  function readListings() {
    try {
      return JSON.parse(localStorage.getItem(LISTINGS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function updateCount() {
    if (!countLabel) return;
    const count = readListings().length;
    countLabel.textContent = count === 0
      ? 'Be the first to share a listing from this device.'
      : `You've shared ${count} listing${count === 1 ? '' : 's'} from this device.`;
  }

  // Each rule returns true when the value is fine, or the message to show under the field.
  const rules = {
    title: value => value.length >= 3 || 'Describe the food in at least 3 characters.',
    quantity: value => /\d/.test(value) || 'Add a number, e.g. "Serves 15 people".',
    address: value => value.length >= 5 || 'Add a pickup address so NGOs can find you.'
  };

  function showError(input, message) {
    document.getElementById(`${input.id}-error`).textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
  }

  function validateField(input) {
    const result = rules[input.name](input.value.trim());
    const message = result === true ? '' : result;
    showError(input, message);
    return !message;
  }

  function updateTitleCount() {
    const length = titleInput.value.length;
    titleCount.textContent = `${length} / ${titleInput.maxLength}`;
    titleCount.classList.toggle('near-limit', length > titleInput.maxLength - 10);
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        title: titleInput.value,
        quantity: quantityInput.value,
        address: addressInput.value,
        photo: photoDataUrl,
        coords
      }));
    } catch {
      /* Storage can be full or disabled (e.g. private browsing) - draft-saving is a convenience, not required. */
    }
  }

  function showPreview(dataUrl) {
    preview.src = dataUrl;
    preview.hidden = false;
    dropzoneHint.hidden = true;
  }

  function loadDraft() {
    let draft = null;
    try {
      draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    } catch {
      draft = null;
    }
    if (!draft) return;
    titleInput.value = draft.title || '';
    quantityInput.value = draft.quantity || '';
    addressInput.value = draft.address || '';
    coords = draft.coords || null;
    if (draft.photo) {
      photoDataUrl = draft.photo;
      showPreview(photoDataUrl);
    }
    updateTitleCount();
  }

  function resetFormState() {
    form.reset();
    photoDataUrl = null;
    coords = null;
    preview.hidden = true;
    preview.removeAttribute('src');
    dropzoneHint.hidden = false;
    locationStatus.textContent = '';
    textInputs.forEach(input => showError(input, ''));
    updateTitleCount();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
  }

  // Phone photos are several MB; as base64 they would overflow localStorage's ~5 MB quota,
  // so the image is scaled down to a small JPEG before it is previewed or stored.
  function shrinkImage(dataUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async event => {
      photoDataUrl = await shrinkImage(event.target.result);
      showPreview(photoDataUrl);
      saveDraft();
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

  ['dragenter', 'dragover'].forEach(type => {
    dropzone.addEventListener(type, event => {
      event.preventDefault();
      dropzone.classList.add('drag-active');
    });
  });
  ['dragleave', 'drop'].forEach(type => {
    dropzone.addEventListener(type, event => {
      event.preventDefault();
      dropzone.classList.remove('drag-active');
    });
  });
  dropzone.addEventListener('drop', event => {
    handleFile(event.dataTransfer.files && event.dataTransfer.files[0]);
  });
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });

  locateBtn.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      locationStatus.textContent = "Geolocation isn't available in this browser.";
      return;
    }
    locationStatus.textContent = 'Detecting your location…';
    navigator.geolocation.getCurrentPosition(
      position => {
        coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        locationStatus.textContent = `Location detected (±${Math.round(position.coords.accuracy)}m).`;
        if (!addressInput.value.trim()) {
          addressInput.value = `Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)} — feel free to replace with an address`;
        }
        validateField(addressInput);
        saveDraft();
      },
      () => {
        locationStatus.textContent = 'Could not detect your location — enter the pickup address manually.';
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  });

  textInputs.forEach(input => {
    const field = input.closest('.field');
    input.addEventListener('input', () => {
      saveDraft();
      // Once a field has shown an error, re-check as the user types so the message clears the moment it is fixed.
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
    // focus/blur don't bubble, so each input gets its own listeners.
    input.addEventListener('focus', () => field.classList.add('is-focused'));
    input.addEventListener('blur', () => {
      field.classList.remove('is-focused');
      if (input.value.trim()) validateField(input);
    });
  });

  titleInput.addEventListener('input', updateTitleCount);

  function openDialog() {
    loadDraft();
    textInputs.forEach(input => showError(input, ''));
    dialog.showModal();
    titleInput.focus();
  }

  document.querySelectorAll('.donate-trigger').forEach(btn => {
    btn.addEventListener('click', openDialog);
  });

  cancelBtn.addEventListener('click', () => dialog.close());

  function notify(title, body) {
    if (!('Notification' in window)) return;
    const fire = () => {
      try {
        new Notification(title, { body, icon: './assets/hero.png' });
      } catch {
        /* Some browsers (notably mobile Chrome) require a service worker for notifications; the inline toast already covers confirmation. */
      }
    };
    if (Notification.permission === 'granted') {
      fire();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') fire();
      });
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = textInputs.filter(input => !validateField(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    const listing = {
      title: titleInput.value.trim(),
      quantity: quantityInput.value.trim(),
      address: addressInput.value.trim(),
      coords,
      photo: photoDataUrl,
      postedAt: new Date().toISOString()
    };
    const listings = readListings();
    listings.push(listing);
    let saved = true;
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* Storage full or disabled - the listing is still posted for this session, just not remembered. */
      saved = false;
    }
    updateCount();
    notify('Listing posted to RePlate', `${listing.title} is now visible to nearby NGOs.`);
    dialog.close();
    resetFormState();
    showToast(saved
      ? 'Thank you — your listing is live. Nearby NGOs will be notified.'
      : "Your listing is posted, but this browser couldn't save it for next time.");
  });

  updateCount();
})();
