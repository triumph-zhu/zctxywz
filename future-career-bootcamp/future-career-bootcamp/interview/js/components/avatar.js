// Interviewer Avatar - SVG rendering with expression switching and multiple profiles

export const INTERVIEWER_PROFILES = {
  male_hr: {
    id: 'male_hr',
    name: '张经理',
    title: 'HR总监',
    skinColor: '#f0c8a0',
    skinLight: '#f5d5b0',
    skinShadow: '#e0b080',
    skinEar: '#e8b88a',
    hairColor: '#2c3e50',
    suitColor: '#2c3e50',
    suitDark: '#1a252f',
    tieColor: '#1abc9c',
    hasGlasses: true,
    hairStyle: 'short',
  },
  female_hr: {
    id: 'female_hr',
    name: '李经理',
    title: 'HR经理',
    skinColor: '#f5d5b8',
    skinLight: '#fae2cc',
    skinShadow: '#e5c0a0',
    skinEar: '#ecc5a5',
    hairColor: '#4a2c2a',
    suitColor: '#5b2c6f',
    suitDark: '#4a2060',
    tieColor: '#8e44ad',
    hasGlasses: false,
    hairStyle: 'long',
  },
  tech_lead: {
    id: 'tech_lead',
    name: '王工',
    title: '技术总监',
    skinColor: '#e8c8a0',
    skinLight: '#f0d5b5',
    skinShadow: '#d8b080',
    skinEar: '#ddb590',
    hairColor: '#1a1a1a',
    suitColor: '#34495e',
    suitDark: '#2c3e50',
    tieColor: '#e74c3c',
    hasGlasses: true,
    hairStyle: 'short',
  },
  defense_prof: {
    id: 'defense_prof',
    name: '刘教授',
    title: '答辩委员会主席',
    skinColor: '#f0c8a8',
    skinLight: '#f5d5b8',
    skinShadow: '#e0b088',
    skinEar: '#e8b890',
    hairColor: '#555555',
    suitColor: '#1a1a2e',
    suitDark: '#0f0f1e',
    tieColor: '#c0392b',
    hasGlasses: true,
    hairStyle: 'short',
  },
};

function _getProfile(profileId) {
  return INTERVIEWER_PROFILES[profileId] || INTERVIEWER_PROFILES.male_hr;
}

function _shortHairSVG(p) {
  return `
    <path d="M52,135 Q52,80 100,72 Q148,80 148,135 L148,120 Q148,95 130,90 Q115,86 100,88 Q85,86 70,90 Q52,95 52,120 Z" fill="${p.hairColor}"/>
    <path d="M52,120 Q48,110 52,95" stroke="${p.hairColor}" stroke-width="6" fill="none"/>
    <path d="M148,120 Q152,110 148,95" stroke="${p.hairColor}" stroke-width="6" fill="none"/>`;
}

function _longHairSVG(p) {
  return `
    <path d="M50,135 Q50,78 100,70 Q150,78 150,135 L150,120 Q150,95 132,88 Q115,82 100,84 Q85,82 68,88 Q50,95 50,120 Z" fill="${p.hairColor}"/>
    <!-- Long hair sides -->
    <path d="M50,120 Q46,140 48,170 Q50,180 52,175 Q54,150 56,130" fill="${p.hairColor}"/>
    <path d="M150,120 Q154,140 152,170 Q150,180 148,175 Q146,150 144,130" fill="${p.hairColor}"/>
    <!-- Hair highlights -->
    <path d="M70,85 Q100,75 130,85" stroke="${p.skinLight}" stroke-width="1" fill="none" opacity="0.15"/>`;
}

function _glassesSVG(show) {
  if (!show) return '';
  return `
    <g class="avatar-glasses">
      <circle cx="82" cy="138" r="14" stroke="#555" stroke-width="1.8" fill="none"/>
      <circle cx="118" cy="138" r="14" stroke="#555" stroke-width="1.8" fill="none"/>
      <line x1="96" y1="138" x2="104" y2="138" stroke="#555" stroke-width="1.5"/>
      <line x1="68" y1="138" x2="56" y2="135" stroke="#555" stroke-width="1.5"/>
      <line x1="132" y1="138" x2="144" y2="135" stroke="#555" stroke-width="1.5"/>
      <!-- Lens reflection -->
      <path d="M72,132 Q78,128 84,132" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>
      <path d="M108,132 Q114,128 120,132" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>
    </g>`;
}

export function createInterviewerSVG(profileId) {
  const p = _getProfile(profileId);
  const hairSVG = p.hairStyle === 'long' ? _longHairSVG(p) : _shortHairSVG(p);
  const glassesSVG = _glassesSVG(p.hasGlasses);
  // Female: scarf instead of tie
  const tieOrScarf = p.hairStyle === 'long'
    ? `<path d="M85,208 Q100,220 115,208" fill="${p.tieColor}" opacity="0.8"/>
       <path d="M92,215 L100,240 L108,215" fill="${p.tieColor}" opacity="0.6"/>`
    : `<path d="M96,210 L100,250 L104,210" fill="${p.tieColor}"/>`;

  return `
  <svg viewBox="0 0 200 280" class="interviewer-avatar" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="faceGrad" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stop-color="${p.skinLight}"/>
        <stop offset="70%" stop-color="${p.skinColor}"/>
        <stop offset="100%" stop-color="${p.skinShadow}"/>
      </radialGradient>
    </defs>

    <!-- Body - Suit -->
    <g class="avatar-body">
      <path d="M55,210 Q100,190 145,210 L155,280 L45,280 Z" fill="${p.suitColor}"/>
      <!-- Shirt collar -->
      <path d="M82,205 L100,225 L118,205" fill="#ffffff" stroke="#ddd" stroke-width="1"/>
      <!-- Tie/Scarf -->
      ${tieOrScarf}
      <!-- Lapel lines -->
      <path d="M82,205 L70,240" stroke="${p.suitDark}" stroke-width="1" fill="none"/>
      <path d="M118,205 L130,240" stroke="${p.suitDark}" stroke-width="1" fill="none"/>
      <!-- Shoulder seam -->
      <path d="M55,210 Q45,212 40,220" stroke="${p.suitDark}" stroke-width="0.5" fill="none"/>
      <path d="M145,210 Q155,212 160,220" stroke="${p.suitDark}" stroke-width="0.5" fill="none"/>
    </g>

    <!-- Arms - hands on desk (default) -->
    <g class="avatar-arms avatar-arms--desk">
      <path d="M55,215 Q38,240 32,258" fill="${p.suitColor}" stroke="${p.suitDark}" stroke-width="0.5"/>
      <ellipse cx="36" cy="260" rx="11" ry="6" fill="${p.skinColor}"/>
      <path d="M145,215 Q162,240 168,258" fill="${p.suitColor}" stroke="${p.suitDark}" stroke-width="0.5"/>
      <ellipse class="right-hand" cx="164" cy="260" rx="11" ry="6" fill="${p.skinColor}"/>
    </g>

    <!-- Arms - chin rest (thinking) -->
    <g class="avatar-arms avatar-arms--chin" style="display:none;">
      <path d="M55,215 Q38,240 32,258" fill="${p.suitColor}" stroke="${p.suitDark}" stroke-width="0.5"/>
      <ellipse cx="36" cy="260" rx="11" ry="6" fill="${p.skinColor}"/>
      <path d="M145,215 Q155,200 148,178" fill="${p.suitColor}" stroke="${p.suitDark}" stroke-width="0.5"/>
      <ellipse class="right-hand" cx="148" cy="175" rx="9" ry="7" fill="${p.skinColor}"/>
    </g>

    <!-- Neck -->
    <rect x="88" y="185" width="24" height="25" rx="4" fill="${p.skinColor}"/>
    <!-- Neck shadow -->
    <ellipse cx="100" cy="205" rx="14" ry="4" fill="${p.skinShadow}" opacity="0.2"/>

    <!-- Head group -->
    <g class="avatar-head">
      <!-- Face with gradient -->
      <ellipse cx="100" cy="148" rx="48" ry="55" fill="url(#faceGrad)"/>
      <!-- Cheekbone shadows -->
      <ellipse cx="65" cy="155" rx="8" ry="5" fill="rgba(180,140,100,0.12)"/>
      <ellipse cx="135" cy="155" rx="8" ry="5" fill="rgba(180,140,100,0.12)"/>
      <!-- Jaw shadow -->
      <ellipse cx="100" cy="195" rx="20" ry="6" fill="rgba(180,140,100,0.08)"/>

      <!-- Ears -->
      <ellipse cx="52" cy="148" rx="8" ry="12" fill="${p.skinEar}"/>
      <ellipse cx="52" cy="148" rx="4" ry="7" fill="${p.skinShadow}" opacity="0.2"/>
      <ellipse cx="148" cy="148" rx="8" ry="12" fill="${p.skinEar}"/>
      <ellipse cx="148" cy="148" rx="4" ry="7" fill="${p.skinShadow}" opacity="0.2"/>

      <!-- Hair -->
      ${hairSVG}

      <!-- Eyebrows -->
      <g class="avatar-eyebrows" style="transition: transform 0.3s ease;">
        <path d="M72,125 Q82,118 92,122" stroke="${p.hairColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M108,122 Q118,118 128,125" stroke="${p.hairColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </g>

      <!-- Eyes -->
      <g class="avatar-eyes">
        <ellipse cx="82" cy="138" rx="7" ry="8" fill="#ffffff"/>
        <circle cx="83" cy="139" r="4" fill="${p.hairColor}"/>
        <circle cx="84" cy="137" r="1.5" fill="#ffffff"/>
        <ellipse cx="118" cy="138" rx="7" ry="8" fill="#ffffff"/>
        <circle cx="117" cy="139" r="4" fill="${p.hairColor}"/>
        <circle cx="118" cy="137" r="1.5" fill="#ffffff"/>
      </g>

      <!-- Glasses -->
      ${glassesSVG}

      <!-- Nose -->
      <path d="M97,145 Q100,155 103,145" stroke="${p.skinShadow}" stroke-width="1.5" fill="none"/>
      <!-- Nose shadow -->
      <ellipse cx="100" cy="152" rx="3" ry="2" fill="${p.skinShadow}" opacity="0.1"/>

      <!-- Mouth -->
      <g class="mouth-group">
        <path class="mouth-smile" d="M86,165 Q100,176 114,165" stroke="#c0392b" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <ellipse class="mouth-speaking" cx="100" cy="168" rx="9" ry="5" fill="#c0392b" style="display:none"/>
        <path class="mouth-thinking" d="M92,168 Q100,166 108,168" stroke="#c0392b" stroke-width="2" fill="none" style="display:none"/>
      </g>
    </g>
  </svg>`;
}

export function setAvatarExpression(container, expression) {
  const avatar = container.querySelector('.interviewer-avatar');
  if (!avatar) return;

  avatar.classList.remove('avatar--smiling', 'avatar--speaking', 'avatar--thinking', 'avatar--nodding');

  switch (expression) {
    case 'smiling':
      avatar.classList.add('avatar--smiling');
      break;
    case 'speaking':
      avatar.classList.add('avatar--speaking');
      break;
    case 'thinking':
      avatar.classList.add('avatar--thinking');
      break;
    case 'nodding':
      avatar.classList.add('avatar--nodding');
      setTimeout(() => avatar.classList.remove('avatar--nodding'), 1200);
      break;
  }
}

// Select interviewer profile based on interview type
export function selectInterviewerProfile(interviewType) {
  switch (interviewType) {
    case 'hr':
      return Math.random() < 0.5 ? 'male_hr' : 'female_hr';
    case 'behavioral':
      return 'female_hr';
    case 'scenario':
      return 'tech_lead';
    case 'defense':
      return 'defense_prof';
    default:
      return 'male_hr';
  }
}
