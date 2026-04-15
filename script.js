const documentBodyElement = document.body;
const customCursorGlowElement = document.getElementById('customCursorGlow');
const customCursorShapeElement = document.getElementById('customCursorShape');
const themeSelectorDropdownElement = document.getElementById('themeSelectorDropdown');
const themeSelectorDropdownTriggerElement = document.getElementById('themeSelectorDropdownTrigger');
const themeSelectorDropdownTriggerIconElement = document.getElementById('themeSelectorDropdownTriggerIcon');
const themeSelectorDropdownMenuElement = document.getElementById('themeSelectorDropdownMenu');

const verificationLabelTextElement = document.getElementById('verificationLabelText');
const verificationInputFieldElement = document.getElementById('verificationInputField');
const verificationSubmitButtonElement = document.getElementById('verificationSubmitButton');
const verificationInputRowElement = document.getElementById('verificationInputRow');
const verificationOutputPanelElement = document.getElementById('verificationOutputPanel');

const revealedFullNameElement = document.getElementById('revealedFullName');
const revealedEmailAddressElement = document.getElementById('revealedEmailAddress');
const revealedPrimaryPhoneElement = document.getElementById('revealedPrimaryPhone');
const revealedSecondaryPhoneElement = document.getElementById('revealedSecondaryPhone');
const revealedThirdPhoneElement = document.getElementById('revealedThirdPhone');
const revealedFourthPhoneElement = document.getElementById('revealedFourthPhone');

const dynamicPhotographyGalleryContainerElement = document.getElementById('dynamicPhotographyGalleryContainer');
const dynamicPhotographyGalleryStatusMessageElement = document.getElementById('dynamicPhotographyGalleryStatusMessage');
const dynamicPhotographyGalleryGridElement = document.getElementById('dynamicPhotographyGalleryGrid');

const fullViewPhotoModalElement = document.getElementById('fullViewPhotoModal');
const fullViewPhotoModalCloseButtonElement = document.getElementById('fullViewPhotoModalCloseButton');
const fullViewPhotoModalContentElement = document.getElementById('fullViewPhotoModalContent');
const fullViewPhotoModalImageElement = document.getElementById('fullViewPhotoModalImage');
const fullViewPhotoModalInformationElement = document.getElementById('fullViewPhotoModalInformation');
const topNavigationLogoStackElement = document.querySelector('.top-navigation-logo-stack');

const interactiveElementSelector = 'a, button, .action-button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], summary, label[for]';

const encryptedVerificationBytes = Uint8Array.from(atob('kN8vIFK8x7NYBsH/4VkwmBqm+9M='), (character) => character.charCodeAt(0));
const encryptedProfileDataString = 'GFZIGwAcAFYXEF9UUAoXRBcNWw0SX1NRSHYEGUwfDVsPG0AQHBBGCxtDExJXVi8PGQkEA0NBGE9ZVVxCGgUSHhRITRtDQUBZRB4SBgoGU1YBVEpBVVQcBwcHA0NAGE9XTF1WARAbCwdDTBxCWUBMRBoHCAYUPgk=';
const encryptedProfileDataKey = 'ct-vault-2026';
const availableThemeList = ['default', 'winter', 'summer', 'minimal'];
const themeMetadataByThemeName = {
  default: { themeNameLabel: 'Default' },
  winter: { themeNameLabel: 'Winter' },
  summer: { themeNameLabel: 'Summer' },
  minimal: { themeNameLabel: 'Minimal' }
};
const photographyRepositoryFolderContentsEndpointAddress = 'https://api.github.com/repos/Contemelia/contemelia.github.io/contents/Assets/Photographs';
const validImageFileExtensionList = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
const photographyMarqueePixelsPerSecond = 46;

let targetCursorXPosition = window.innerWidth / 2;
let targetCursorYPosition = window.innerHeight / 2;
let animatedCursorXPosition = targetCursorXPosition;
let animatedCursorYPosition = targetCursorYPosition;
let currentCursorRotation = 0;
let targetCursorRotation = 0;
let cursorAngularVelocity = 0;
let cursorIsVisible = false;
let selectedThemeName = 'default';
let interactiveHoverDepth = 0;
let photographyMarqueeResizeTimeoutId = null;
let lastAnimationFrameTimestampInMilliseconds = null;

let logoOuterRotationAngleInDegrees = 0;
let logoInnerRotationAngleInDegrees = 0;
let logoOuterCurrentAngularSpeedInDegreesPerSecond = 20;
let logoInnerCurrentAngularSpeedInDegreesPerSecond = -25.71;

let photographyMarqueeTrackElement = null;
let photographyMarqueeFirstGroupElement = null;
let photographyMarqueeOffsetInPixels = 0;
let photographyMarqueeGroupWidthInPixels = 0;
let photographyMarqueeCurrentSpeedInPixelsPerSecond = photographyMarqueePixelsPerSecond;
let photographyMarqueeTargetSpeedInPixelsPerSecond = photographyMarqueePixelsPerSecond;
let photographyMarqueeIsPausedByHover = false;

function normalizeRotationAngle(rawAngle) {
  return ((rawAngle + 540) % 360) - 180;
}

function decodeEncryptedProfileData(encryptedDataString, dataKey) {
  const encryptedByteArray = Uint8Array.from(atob(encryptedDataString), (character) => character.charCodeAt(0));
  const keyByteArray = new TextEncoder().encode(dataKey);

  for (let encryptedByteIndex = 0; encryptedByteIndex < encryptedByteArray.length; encryptedByteIndex += 1) {
    encryptedByteArray[encryptedByteIndex] ^= keyByteArray[encryptedByteIndex % keyByteArray.length];
  }

  return new TextDecoder().decode(encryptedByteArray);
}

function applySelectedTheme(themeName) {
  documentBodyElement.setAttribute('data-theme', themeName);
  selectedThemeName = themeName;

  const selectedThemeMetadataObject = themeMetadataByThemeName[themeName] || themeMetadataByThemeName.default;

  if (themeSelectorDropdownTriggerIconElement) {
    themeSelectorDropdownTriggerIconElement.dataset.themeIcon = themeName;
  }

  if (themeSelectorDropdownElement) {
    themeSelectorDropdownElement.dataset.activeTheme = themeName;
  }

  if (themeSelectorDropdownTriggerElement) {
    themeSelectorDropdownTriggerElement.setAttribute('aria-label', `${selectedThemeMetadataObject.themeNameLabel} theme selector`);
  }

  renderThemeSelectorDropdownOptions();
}

function renderThemeSelectorDropdownOptions() {
  if (!themeSelectorDropdownMenuElement) {
    return;
  }

  themeSelectorDropdownMenuElement.innerHTML = '';

  availableThemeList.forEach((themeName) => {
    const themeMetadataObject = themeMetadataByThemeName[themeName];
    const themeSelectorOptionButtonElement = document.createElement('button');
    const themeSelectorOptionIconElement = document.createElement('span');
    const optionIsActive = themeName === selectedThemeName;

    themeSelectorOptionButtonElement.className = 'theme-selector-dropdown-option-button';
    themeSelectorOptionButtonElement.classList.toggle('theme-selector-dropdown-option-button-active', optionIsActive);
    themeSelectorOptionButtonElement.type = 'button';
    themeSelectorOptionButtonElement.dataset.themeTarget = themeName;
    themeSelectorOptionButtonElement.setAttribute('aria-label', `${themeMetadataObject.themeNameLabel} theme`);

    themeSelectorOptionIconElement.className = 'theme-selector-dropdown-option-icon';
  themeSelectorOptionIconElement.dataset.themeIcon = themeName;

  themeSelectorOptionButtonElement.append(themeSelectorOptionIconElement);

    themeSelectorOptionButtonElement.addEventListener('click', () => {
      applySelectedTheme(themeName);
      themeSelectorDropdownElement?.classList.remove('theme-selector-dropdown-open');
      themeSelectorDropdownTriggerElement?.setAttribute('aria-expanded', 'false');
    });

    themeSelectorDropdownMenuElement.append(themeSelectorOptionButtonElement);
  });
}

function setCursorInteractiveState(isInteractiveState) {
  customCursorShapeElement.classList.toggle('cursor-state-active', isInteractiveState);
  customCursorGlowElement.classList.toggle('cursor-state-active', isInteractiveState);

  if (isInteractiveState) {
    const randomDirectionMultiplier = Math.random() < 0.5 ? -1 : 1;
    cursorAngularVelocity += randomDirectionMultiplier * (1.2 + Math.random() * 1.6);
  }
}

function setInteractiveRotationState(isActiveState) {
  documentBodyElement.classList.toggle('interactive-rotation-active', isActiveState);
}

async function revealVerificationProfileData() {
  const rawInputText = verificationInputFieldElement.value.trim();

  if (!rawInputText) {
    return;
  }

  try {
    const hashedInputBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawInputText));
    const hashedInputArray = new Uint8Array(hashedInputBuffer);
    const decodedVerificationArray = new Uint8Array(encryptedVerificationBytes.length);

    for (let verificationByteIndex = 0; verificationByteIndex < encryptedVerificationBytes.length; verificationByteIndex += 1) {
      decodedVerificationArray[verificationByteIndex] = encryptedVerificationBytes[verificationByteIndex] ^ hashedInputArray[verificationByteIndex % hashedInputArray.length];
    }

    const decodedFullName = new TextDecoder().decode(decodedVerificationArray);
    const decodedTextIsValid = /^[\x20-\x7E]+$/.test(decodedFullName) && decodedFullName.trim().split(' ').length >= 2 && decodedFullName.trim().length > 4;

    if (!decodedTextIsValid) {
      throw new Error('Invalid key phrase');
    }

    verificationInputRowElement.classList.remove('verification-state-error');
    verificationInputRowElement.classList.add('verification-state-success');

    const decodedProfileData = JSON.parse(decodeEncryptedProfileData(encryptedProfileDataString, encryptedProfileDataKey));

    revealedFullNameElement.textContent = decodedFullName;
    revealedEmailAddressElement.textContent = decodedProfileData.email;
    revealedPrimaryPhoneElement.textContent = decodedProfileData.phones[0] || '';
    revealedSecondaryPhoneElement.textContent = decodedProfileData.phones[1] || '';
    revealedThirdPhoneElement.textContent = decodedProfileData.phones[2] || '';
    revealedFourthPhoneElement.textContent = decodedProfileData.phones[3] || '';

    verificationLabelTextElement.textContent = '// me, myself, and I';
    verificationInputRowElement.style.display = 'none';
    verificationOutputPanelElement.classList.add('verification-output-visible');
  } catch (verificationError) {
    verificationInputRowElement.classList.remove('verification-state-success');
    verificationInputRowElement.classList.add('verification-state-error');
    verificationOutputPanelElement.classList.remove('verification-output-visible');

    setTimeout(() => {
      verificationInputRowElement.classList.remove('verification-state-error');
    }, 650);
  }
}

function initializeThemeButtons() {
  const randomThemeIndex = Math.floor(Math.random() * availableThemeList.length);
  applySelectedTheme(availableThemeList[randomThemeIndex]);
}

function initializeCursorTracking() {
  document.addEventListener('mousemove', (mouseEvent) => {
    const deltaXPosition = mouseEvent.clientX - targetCursorXPosition;
    const deltaYPosition = mouseEvent.clientY - targetCursorYPosition;

    targetCursorXPosition = mouseEvent.clientX;
    targetCursorYPosition = mouseEvent.clientY;

    if (!cursorIsVisible) {
      cursorIsVisible = true;
      customCursorGlowElement.style.opacity = '1';
      customCursorShapeElement.style.opacity = '1';
    }

    if (Math.hypot(deltaXPosition, deltaYPosition) > 0.2) {
      targetCursorRotation = (Math.atan2(deltaYPosition, deltaXPosition) * 180) / Math.PI;
    }
  });

  document.addEventListener('mouseleave', () => {
    cursorIsVisible = false;
    customCursorGlowElement.style.opacity = '0';
    customCursorShapeElement.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursorIsVisible = true;
    customCursorGlowElement.style.opacity = '1';
    customCursorShapeElement.style.opacity = '1';
  });
}

function initializeVerificationPanel() {
  verificationSubmitButtonElement.addEventListener('click', revealVerificationProfileData);
  verificationInputFieldElement.addEventListener('keydown', (keyboardEvent) => {
    if (keyboardEvent.key === 'Enter') {
      revealVerificationProfileData();
    }
  });
}

function initializeHorizontalScrollControls() {
  const horizontalScrollControlButtons = document.querySelectorAll('.horizontal-scroll-control-button');

  horizontalScrollControlButtons.forEach((scrollControlButtonElement) => {
    scrollControlButtonElement.addEventListener('click', () => {
      const targetViewportElement = document.getElementById(scrollControlButtonElement.dataset.scrollTarget);

      if (!targetViewportElement) {
        return;
      }

      const scrollDirection = Number(scrollControlButtonElement.dataset.scrollDirection || 1);
      const scrollDistance = Math.max(220, Math.floor(targetViewportElement.clientWidth * 0.78));

      targetViewportElement.scrollBy({
        left: scrollDirection * scrollDistance,
        behavior: 'smooth'
      });
    });
  });

  const gamesScrollViewportElement = document.getElementById('gamesScrollViewport');

  if (gamesScrollViewportElement) {
    gamesScrollViewportElement.addEventListener('wheel', (wheelEvent) => {
      if (Math.abs(wheelEvent.deltaY) <= Math.abs(wheelEvent.deltaX)) {
        return;
      }

      wheelEvent.preventDefault();
      gamesScrollViewportElement.scrollBy({
        left: wheelEvent.deltaY,
        behavior: 'auto'
      });
    }, { passive: false });
  }
}

function initializeInteractiveCursorState() {
  document.querySelectorAll(interactiveElementSelector).forEach((interactiveElement) => {
    interactiveElement.addEventListener('mouseenter', () => {
      interactiveHoverDepth += 1;
      setCursorInteractiveState(true);
      setInteractiveRotationState(interactiveHoverDepth > 0);
    });

    interactiveElement.addEventListener('mouseleave', () => {
      interactiveHoverDepth = Math.max(0, interactiveHoverDepth - 1);
      setCursorInteractiveState(interactiveHoverDepth > 0);
      setInteractiveRotationState(interactiveHoverDepth > 0);
    });
  });
}

function formatFileSizeInHumanReadableUnits(rawFileSizeInBytes) {
  if (rawFileSizeInBytes < 1024) {
    return `${rawFileSizeInBytes} B`;
  }

  if (rawFileSizeInBytes < 1024 * 1024) {
    return `${(rawFileSizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(rawFileSizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function deriveImageDimensionPromise(imageSourceAddress) {
  return new Promise((resolve) => {
    const probeImageElement = new Image();

    probeImageElement.onload = () => {
      resolve({
        imageWidthPixels: probeImageElement.naturalWidth,
        imageHeightPixels: probeImageElement.naturalHeight
      });
    };

    probeImageElement.onerror = () => {
      resolve({
        imageWidthPixels: 'unknown',
        imageHeightPixels: 'unknown'
      });
    };

    probeImageElement.src = imageSourceAddress;
  });
}

function openFullViewPhotoModal(photoMetadataObject) {
  fullViewPhotoModalImageElement.src = photoMetadataObject.downloadAddress;
  fullViewPhotoModalImageElement.alt = `Full view of ${photoMetadataObject.fileName}`;

  fullViewPhotoModalInformationElement.textContent = `Name: ${photoMetadataObject.fileName} | Size: ${photoMetadataObject.formattedFileSize} | Dimensions: ${photoMetadataObject.imageWidthPixels} x ${photoMetadataObject.imageHeightPixels}`;

  fullViewPhotoModalElement.classList.add('full-view-photo-modal-visible');
  fullViewPhotoModalElement.setAttribute('aria-hidden', 'false');
}

function closeFullViewPhotoModal() {
  fullViewPhotoModalElement.classList.remove('full-view-photo-modal-visible');
  fullViewPhotoModalElement.setAttribute('aria-hidden', 'true');
  fullViewPhotoModalImageElement.src = '';
  fullViewPhotoModalInformationElement.textContent = '';
}

function createPhotographyGalleryCardElement(photoMetadataObject) {
  const photographyGalleryItemButtonElement = document.createElement('button');
  photographyGalleryItemButtonElement.className = 'photography-gallery-item-button';
  photographyGalleryItemButtonElement.type = 'button';

  if (typeof photoMetadataObject.imageWidthPixels === 'number' && typeof photoMetadataObject.imageHeightPixels === 'number' && photoMetadataObject.imageHeightPixels > 0) {
    const imageAspectRatioValue = photoMetadataObject.imageWidthPixels / photoMetadataObject.imageHeightPixels;
    photographyGalleryItemButtonElement.style.setProperty('--photo-aspect-ratio', String(imageAspectRatioValue));
  } else {
    photographyGalleryItemButtonElement.style.setProperty('--photo-aspect-ratio', '1');
  }

  const photographyGalleryItemImageElement = document.createElement('img');
  photographyGalleryItemImageElement.className = 'photography-gallery-item-image';
  photographyGalleryItemImageElement.src = photoMetadataObject.downloadAddress;
  photographyGalleryItemImageElement.alt = photoMetadataObject.fileName;
  photographyGalleryItemImageElement.loading = 'lazy';

  const photographyGalleryItemInformationElement = document.createElement('div');
  photographyGalleryItemInformationElement.className = 'photography-gallery-item-information';

  const photographyGalleryItemTitleElement = document.createElement('span');
  photographyGalleryItemTitleElement.className = 'photography-gallery-item-title';
  photographyGalleryItemTitleElement.textContent = photoMetadataObject.fileName;

  const photographyGalleryItemSizeElement = document.createElement('span');
  photographyGalleryItemSizeElement.className = 'photography-gallery-item-detail';
  photographyGalleryItemSizeElement.textContent = `Size: ${photoMetadataObject.formattedFileSize}`;

  const photographyGalleryItemDimensionsElement = document.createElement('span');
  photographyGalleryItemDimensionsElement.className = 'photography-gallery-item-detail';
  photographyGalleryItemDimensionsElement.textContent = `Dimensions: ${photoMetadataObject.imageWidthPixels} x ${photoMetadataObject.imageHeightPixels}`;

  photographyGalleryItemInformationElement.append(photographyGalleryItemTitleElement, photographyGalleryItemSizeElement, photographyGalleryItemDimensionsElement);
  photographyGalleryItemButtonElement.append(photographyGalleryItemImageElement, photographyGalleryItemInformationElement);

  photographyGalleryItemButtonElement.addEventListener('click', () => {
    openFullViewPhotoModal(photoMetadataObject);
  });

  return photographyGalleryItemButtonElement;
}

function updatePhotographyGalleryMarqueeMetrics() {
  if (!dynamicPhotographyGalleryGridElement || !photographyMarqueeTrackElement || !photographyMarqueeFirstGroupElement) {
    return;
  }

  const firstGroupWidthInPixels = photographyMarqueeFirstGroupElement.getBoundingClientRect().width;

  if (!Number.isFinite(firstGroupWidthInPixels) || firstGroupWidthInPixels <= 0) {
    return;
  }

  photographyMarqueeGroupWidthInPixels = firstGroupWidthInPixels;

  if (photographyMarqueeOffsetInPixels <= -photographyMarqueeGroupWidthInPixels || photographyMarqueeOffsetInPixels > 0) {
    photographyMarqueeOffsetInPixels = 0;
  }
}

function initializePhotographyGalleryMarqueeState() {
  if (!dynamicPhotographyGalleryGridElement) {
    return;
  }

  photographyMarqueeTrackElement = dynamicPhotographyGalleryGridElement.querySelector('.photography-gallery-marquee-track');
  photographyMarqueeFirstGroupElement = dynamicPhotographyGalleryGridElement.querySelector('.photography-gallery-marquee-group');
  photographyMarqueeOffsetInPixels = 0;
  photographyMarqueeCurrentSpeedInPixelsPerSecond = photographyMarqueePixelsPerSecond;
  photographyMarqueeTargetSpeedInPixelsPerSecond = photographyMarqueePixelsPerSecond;
  photographyMarqueeIsPausedByHover = false;

  if (!photographyMarqueeTrackElement || !photographyMarqueeFirstGroupElement) {
    return;
  }

  dynamicPhotographyGalleryGridElement.addEventListener('mouseenter', () => {
    photographyMarqueeIsPausedByHover = true;
  });

  dynamicPhotographyGalleryGridElement.addEventListener('mouseleave', () => {
    photographyMarqueeIsPausedByHover = false;
  });

  updatePhotographyGalleryMarqueeMetrics();
}

function updateLogoAndPhotographyMotion(elapsedSecondsSinceLastFrame) {
  const interactiveRotationIsActive = documentBodyElement.classList.contains('interactive-rotation-active');
  const logoOuterTargetAngularSpeedInDegreesPerSecond = interactiveRotationIsActive ? 45 : 20;
  const logoInnerTargetAngularSpeedInDegreesPerSecond = interactiveRotationIsActive ? -180 : -25.71;

  logoOuterCurrentAngularSpeedInDegreesPerSecond += (logoOuterTargetAngularSpeedInDegreesPerSecond - logoOuterCurrentAngularSpeedInDegreesPerSecond) * Math.min(1, elapsedSecondsSinceLastFrame * 5.5);
  logoInnerCurrentAngularSpeedInDegreesPerSecond += (logoInnerTargetAngularSpeedInDegreesPerSecond - logoInnerCurrentAngularSpeedInDegreesPerSecond) * Math.min(1, elapsedSecondsSinceLastFrame * 5.5);

  logoOuterRotationAngleInDegrees = (logoOuterRotationAngleInDegrees + (logoOuterCurrentAngularSpeedInDegreesPerSecond * elapsedSecondsSinceLastFrame)) % 360;
  logoInnerRotationAngleInDegrees = (logoInnerRotationAngleInDegrees + (logoInnerCurrentAngularSpeedInDegreesPerSecond * elapsedSecondsSinceLastFrame)) % 360;

  if (topNavigationLogoStackElement) {
    topNavigationLogoStackElement.style.setProperty('--logo-outer-rotation-angle', `${logoOuterRotationAngleInDegrees}deg`);
    topNavigationLogoStackElement.style.setProperty('--logo-inner-rotation-angle', `${logoInnerRotationAngleInDegrees}deg`);
  }

  if (!photographyMarqueeTrackElement || photographyMarqueeGroupWidthInPixels <= 0) {
    return;
  }

  photographyMarqueeTargetSpeedInPixelsPerSecond = photographyMarqueeIsPausedByHover ? 0 : photographyMarqueePixelsPerSecond;
  photographyMarqueeCurrentSpeedInPixelsPerSecond += (photographyMarqueeTargetSpeedInPixelsPerSecond - photographyMarqueeCurrentSpeedInPixelsPerSecond) * Math.min(1, elapsedSecondsSinceLastFrame * 6.2);

  photographyMarqueeOffsetInPixels -= photographyMarqueeCurrentSpeedInPixelsPerSecond * elapsedSecondsSinceLastFrame;

  if (photographyMarqueeOffsetInPixels <= -photographyMarqueeGroupWidthInPixels) {
    photographyMarqueeOffsetInPixels += photographyMarqueeGroupWidthInPixels;
  }

  photographyMarqueeTrackElement.style.setProperty('--photo-marquee-offset', `${photographyMarqueeOffsetInPixels}px`);
}

async function loadDynamicPhotographyGallery() {
  if (!dynamicPhotographyGalleryContainerElement || !dynamicPhotographyGalleryStatusMessageElement || !dynamicPhotographyGalleryGridElement) {
    return;
  }

  dynamicPhotographyGalleryStatusMessageElement.textContent = 'Loading photographs from repository...';
  dynamicPhotographyGalleryGridElement.innerHTML = '';
  photographyMarqueeTrackElement = null;
  photographyMarqueeFirstGroupElement = null;
  photographyMarqueeGroupWidthInPixels = 0;
  photographyMarqueeOffsetInPixels = 0;

  try {
    const folderContentsResponse = await fetch(photographyRepositoryFolderContentsEndpointAddress, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    });

    if (!folderContentsResponse.ok) {
      throw new Error(`Repository response status: ${folderContentsResponse.status}`);
    }

    const folderContentsArray = await folderContentsResponse.json();

    const imageFileObjectList = folderContentsArray.filter((contentObject) => {
      if (contentObject.type !== 'file' || typeof contentObject.name !== 'string') {
        return false;
      }

      const lowercaseFileName = contentObject.name.toLowerCase();
      return validImageFileExtensionList.some((validImageFileExtension) => lowercaseFileName.endsWith(validImageFileExtension));
    }).sort((firstFileObject, secondFileObject) => firstFileObject.name.localeCompare(secondFileObject.name));

    if (imageFileObjectList.length === 0) {
      dynamicPhotographyGalleryStatusMessageElement.textContent = 'No photographs were found in the repository folder.';
      return;
    }

    const photoMetadataObjectList = await Promise.all(imageFileObjectList.map(async (imageFileObject) => {
      const downloadAddress = imageFileObject.download_url || imageFileObject.html_url;
      const imageDimensionsObject = await deriveImageDimensionPromise(downloadAddress);

      return {
        fileName: imageFileObject.name,
        downloadAddress,
        formattedFileSize: formatFileSizeInHumanReadableUnits(Number(imageFileObject.size || 0)),
        imageWidthPixels: imageDimensionsObject.imageWidthPixels,
        imageHeightPixels: imageDimensionsObject.imageHeightPixels
      };
    }));

    const marqueeTrackElement = document.createElement('div');
    marqueeTrackElement.className = 'photography-gallery-marquee-track';

    const firstMarqueeGroupElement = document.createElement('div');
    firstMarqueeGroupElement.className = 'photography-gallery-marquee-group';

    const secondMarqueeGroupElement = document.createElement('div');
    secondMarqueeGroupElement.className = 'photography-gallery-marquee-group';

    photoMetadataObjectList.forEach((photoMetadataObject) => {
      firstMarqueeGroupElement.append(createPhotographyGalleryCardElement(photoMetadataObject));
      secondMarqueeGroupElement.append(createPhotographyGalleryCardElement(photoMetadataObject));
    });

    marqueeTrackElement.append(firstMarqueeGroupElement, secondMarqueeGroupElement);
    dynamicPhotographyGalleryGridElement.append(marqueeTrackElement);
    initializePhotographyGalleryMarqueeState();
    requestAnimationFrame(updatePhotographyGalleryMarqueeMetrics);

    dynamicPhotographyGalleryStatusMessageElement.textContent = `${photoMetadataObjectList.length} photograph(s) loaded from repository.`;
  } catch (galleryLoadingError) {
    dynamicPhotographyGalleryStatusMessageElement.textContent = 'Unable to load photographs from repository right now.';
  }
}

function initializeFullViewPhotoModalInteractions() {
  if (!fullViewPhotoModalElement || !fullViewPhotoModalCloseButtonElement || !fullViewPhotoModalContentElement) {
    return;
  }

  fullViewPhotoModalCloseButtonElement.addEventListener('click', closeFullViewPhotoModal);

  fullViewPhotoModalElement.addEventListener('click', (mouseEvent) => {
    if (!fullViewPhotoModalContentElement.contains(mouseEvent.target)) {
      closeFullViewPhotoModal();
    }
  });

  document.addEventListener('keydown', (keyboardEvent) => {
    if (keyboardEvent.key === 'Escape' && fullViewPhotoModalElement.classList.contains('full-view-photo-modal-visible')) {
      closeFullViewPhotoModal();
    }
  });
}

function animateCustomCursor(currentTimestampInMilliseconds) {
  if (lastAnimationFrameTimestampInMilliseconds === null) {
    lastAnimationFrameTimestampInMilliseconds = currentTimestampInMilliseconds;
  }

  const elapsedSecondsSinceLastFrame = Math.min(0.05, Math.max(0.001, (currentTimestampInMilliseconds - lastAnimationFrameTimestampInMilliseconds) / 1000));
  lastAnimationFrameTimestampInMilliseconds = currentTimestampInMilliseconds;

  animatedCursorXPosition += (targetCursorXPosition - animatedCursorXPosition) * 0.22;
  animatedCursorYPosition += (targetCursorYPosition - animatedCursorYPosition) * 0.22;

  const rotationDifference = normalizeRotationAngle(targetCursorRotation - currentCursorRotation);
  currentCursorRotation += rotationDifference * 0.13;
  currentCursorRotation += cursorAngularVelocity;
  cursorAngularVelocity *= 0.9;

  customCursorGlowElement.style.left = `${animatedCursorXPosition}px`;
  customCursorGlowElement.style.top = `${animatedCursorYPosition}px`;
  customCursorShapeElement.style.transform = `translate3d(${animatedCursorXPosition}px, ${animatedCursorYPosition}px, 0) translate(-50%, -50%) rotate(${currentCursorRotation}deg)`;

  updateLogoAndPhotographyMotion(elapsedSecondsSinceLastFrame);

  requestAnimationFrame(animateCustomCursor);
}

function initializePortfolioPage() {
  initializeThemeButtons();
  initializeCursorTracking();
  initializeVerificationPanel();
  initializeHorizontalScrollControls();
  initializeInteractiveCursorState();
  initializeFullViewPhotoModalInteractions();
  loadDynamicPhotographyGallery();

  window.addEventListener('resize', () => {
    if (photographyMarqueeResizeTimeoutId !== null) {
      clearTimeout(photographyMarqueeResizeTimeoutId);
    }

    photographyMarqueeResizeTimeoutId = setTimeout(() => {
      updatePhotographyGalleryMarqueeMetrics();
    }, 120);
  });

  requestAnimationFrame(animateCustomCursor);
}

initializePortfolioPage();