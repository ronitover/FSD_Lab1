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

  const DRAFT_KEY = 'replate:donation-draft';
  const LISTINGS_KEY = 'replate:donations';
  let photoDataUrl = null;
  let coords = null;

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
  }

  function resetFormState() {
    form.reset();
    photoDataUrl = null;
    coords = null;
    preview.hidden = true;
    preview.removeAttribute('src');
    dropzoneHint.hidden = false;
    locationStatus.textContent = '';
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = event => {
      photoDataUrl = event.target.result;
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
        saveDraft();
      },
      () => {
        locationStatus.textContent = 'Could not detect your location — enter the pickup address manually.';
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  });

  [titleInput, quantityInput, addressInput].forEach(input => {
    input.addEventListener('input', saveDraft);
  });

  function openDialog() {
    toast.hidden = true;
    loadDraft();
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
    if (!titleInput.value.trim()) {
      titleInput.focus();
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
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    } catch {
      /* Quota exceeded (large photo) - the listing still gets posted for this session, just not persisted. */
    }
    localStorage.removeItem(DRAFT_KEY);
    updateCount();
    notify('Listing posted to RePlate', `${listing.title} is now visible to nearby NGOs.`);
    dialog.close();
    resetFormState();
    toast.hidden = false;
  });

  updateCount();
})();
