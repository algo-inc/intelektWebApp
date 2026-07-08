import { firebaseConfig } from "./firebase-config.js";

const firebaseReady = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE_");
const workspaceStorageKey = "demo-workspace-v3";
const legacySheetStorageKey = "demo-sheet";

const fieldTypes = [
  { value: "text", label: "РўРµРєСЃС‚" },
  { value: "number", label: "Р§РёСЃР»Рѕ" },
  { value: "status", label: "РЎС‚Р°С‚СѓСЃ" },
  { value: "block", label: "Р‘Р»РѕРє" },
  { value: "department", label: "РџС–РґСЂРѕР·РґС–Р»" },
  { value: "date", label: "Р”Р°С‚Р°" },
  { value: "currency", label: "Р’Р°Р»СЋС‚Р°" },
  { value: "checkbox", label: "РўР°Рє/РќС–" }
];

const defaultStatuses = ["РќР° СЃРєР»Р°РґС–", "Р’ СЂРѕР±РѕС‚С–", "Р РµРјРѕРЅС‚", "РЎРїРёСЃР°РЅРѕ"];

const defaultTheme = {
  mode: "dark",
  primary: "#cfbdff",
  primaryContainer: "#54389a",
  secondaryContainer: "#4a4458",
  tertiary: "#efb8c8",
  background: "#141218",
  surface: "#211f26",
  blockAccent: "#7c5cff"
};

const themePresets = {
  dark: defaultTheme,
  light: {
    mode: "light",
    primary: "#6750a4",
    primaryContainer: "#eaddff",
    secondaryContainer: "#e8def8",
    tertiary: "#7d5260",
    background: "#fffbff",
    surface: "#f3edf7",
    blockAccent: "#6750a4"
  }
};

const roleDefinitions = {
  admin: {
    label: "РђРґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂ",
    description: "РџРѕРІРЅРёР№ РґРѕСЃС‚СѓРї"
  },
  storekeeper: {
    label: "РљРѕРјС–СЂРЅРёРє",
    description: "Р’РёРґР°С‡Р°, РїРѕРІРµСЂРЅРµРЅРЅСЏ, С–РЅРІРµРЅС‚Р°СЂРёР·Р°С†С–СЏ"
  },
  user: {
    label: "РљРѕСЂРёСЃС‚СѓРІР°С‡",
    description: "РџРµСЂРµРіР»СЏРґ СЃРІРѕРіРѕ РјР°Р№РЅР°, Р·Р°РїРёС‚ РЅР° РїРµСЂРµРґР°С‡Сѓ"
  },
  manager: {
    label: "РљРµСЂС–РІРЅРёРє",
    description: "РџРµСЂРµРіР»СЏРґ Р·РІС–С‚С–РІ, РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ РѕРїРµСЂР°С†С–Р№"
  }
};

const defaultWorkspace = {
  id: "default",
  name: "Intelekt Workspace",
  activePageId: "assets",
  settings: {
    statusOptions: defaultStatuses,
    showStats: true,
    theme: structuredClone(defaultTheme)
  },
  departments: [
    {
      id: "main-department",
      name: "РћСЃРЅРѕРІРЅРёР№ РїС–РґСЂРѕР·РґС–Р»",
      responsibleUid: ""
    }
  ],
  pages: [
    {
      id: "assets",
      name: "РћР±Р»С–Рє РјР°Р№РЅР°",
      icon: "в–¦",
      blocks: [
        {
          id: "main-assets",
          title: "РћСЃРЅРѕРІРЅР° С‚Р°Р±Р»РёС†СЏ",
          columns: [],
          rows: []
        }
      ]
    }
  ]
};

const state = {
  user: null,
  users: [],
  workspace: null,
  view: "page",
  activeDepartmentId: "",
  departmentAssetSort: "block",
  openBlockSettings: new Set(),
  collapsedBlocks: new Set(),
  selectedProductRefs: new Set(),
  searchQuery: "",
  snackbarTimer: null,
  cellInputTimer: null,
  firebase: null,
  unsubscribeWorkspace: null,
  unsubscribeUsers: null
};

const els = {
  authView: document.querySelector("#authView"),
  workspaceShell: document.querySelector("#workspace"),
  googleLogin: document.querySelector("#googleLogin"),
  emailLogin: document.querySelector("#emailLogin"),
  passwordReset: document.querySelector("#passwordReset"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  pinLogin: document.querySelector("#pinLogin"),
  biometricLogin: document.querySelector("#biometricLogin"),
  demoAdminLogin: document.querySelector("#demoAdminLogin"),
  demoUserLogin: document.querySelector("#demoUserLogin"),
  authModeText: document.querySelector("#authModeText"),
  logoutButton: document.querySelector("#logoutButton"),
  userName: document.querySelector("#userName"),
  userRole: document.querySelector("#userRole"),
  workspaceName: document.querySelector("#workspaceName"),
  modeBadge: document.querySelector("#modeBadge"),
  crumbs: document.querySelector("#crumbs"),
  pageTitle: document.querySelector("#pageTitle"),
  pageKicker: document.querySelector("#pageKicker"),
  pageTabs: document.querySelector("#pageTabs"),
  pageView: document.querySelector("#pageView"),
  settingsView: document.querySelector("#settingsView"),
  departmentsView: document.querySelector("#departmentsView"),
  departmentDetailView: document.querySelector("#departmentDetailView"),
  transfersView: document.querySelector("#transfersView"),
  statsToggleButton: document.querySelector("#statsToggleButton"),
  pagesList: document.querySelector("#pagesList"),
  statsGrid: document.querySelector("#statsGrid"),
  blocksList: document.querySelector("#blocksList"),
  addPageButton: document.querySelector("#addPageButton"),
  addDepartmentNavButton: document.querySelector("#addDepartmentNavButton"),
  addBlockButton: document.querySelector("#addBlockButton"),
  settingsButton: document.querySelector("#settingsButton"),
  sidebarSettingsButton: document.querySelector("#sidebarSettingsButton"),
  adminPanel: document.querySelector("#adminPanel"),
  themeSettings: document.querySelector("#themeSettings"),
  resetThemeButton: document.querySelector("#resetThemeButton"),
  usersList: document.querySelector("#usersList"),
  departmentsList: document.querySelector("#departmentsList"),
  departmentsNavList: document.querySelector("#departmentsNavList"),
  departmentDetailTitle: document.querySelector("#departmentDetailTitle"),
  departmentDetailList: document.querySelector("#departmentDetailList"),
  transfersList: document.querySelector("#transfersList"),
  addDepartmentButton: document.querySelector("#addDepartmentButton"),
  departmentDialog: document.querySelector("#departmentDialog"),
  departmentForm: document.querySelector("#departmentForm"),
  departmentResponsibleSelect: document.querySelector("#departmentResponsibleSelect"),
  pageDialog: document.querySelector("#pageDialog"),
  pageForm: document.querySelector("#pageForm"),
  blockDialog: document.querySelector("#blockDialog"),
  blockForm: document.querySelector("#blockForm"),
  blockTemplateSelect: document.querySelector("#blockTemplateSelect"),
  columnDialog: document.querySelector("#columnDialog"),
  columnForm: document.querySelector("#columnForm"),
  columnBlockId: document.querySelector("#columnBlockId"),
  rowDialog: document.querySelector("#rowDialog"),
  rowForm: document.querySelector("#rowForm"),
  rowBlockId: document.querySelector("#rowBlockId"),
  rowFields: document.querySelector("#rowFields"),
  bulkTransferDialog: document.querySelector("#bulkTransferDialog"),
  bulkTransferForm: document.querySelector("#bulkTransferForm"),
  bulkTransferDepartment: document.querySelector("#bulkTransferDepartment"),
  bulkTransferItems: document.querySelector("#bulkTransferItems"),
  searchInput: document.querySelector("#searchInput"),
  quickAddBlockButton: document.querySelector("#quickAddBlockButton"),
  snackbar: document.querySelector("#snackbar"),
  bottomSheet: document.querySelector("#bottomSheet"),
  bottomSheetContent: document.querySelector("#bottomSheetContent")
};

boot();

async function boot() {
  els.authModeText.textContent = firebaseReady
    ? "Firebase РїС–РґРєР»СЋС‡РµРЅРѕ. РЈРІС–Р№РґС–С‚СЊ С‡РµСЂРµР· Google."
    : "Firebase С‰Рµ РЅРµ РїС–РґРєР»СЋС‡РµРЅРѕ. РњРѕР¶РЅР° РїСЂР°С†СЋРІР°С‚Рё Сѓ Р»РѕРєР°Р»СЊРЅРѕРјСѓ demo mode.";
  els.googleLogin.disabled = !firebaseReady;
  els.emailLogin.disabled = !firebaseReady;
  els.passwordReset.disabled = !firebaseReady;

  if (firebaseReady) {
    await initFirebase();
  }

  bindEvents();
  restoreDemoSession();
}

async function initFirebase() {
  const [
    { initializeApp },
    {
      getAuth,
      GoogleAuthProvider,
      signInWithPopup,
      signInWithEmailAndPassword,
      sendPasswordResetEmail,
      signOut,
      onAuthStateChanged
    },
    firestore
  ] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = firestore.getFirestore(app);
  const provider = new GoogleAuthProvider();

  state.firebase = {
    auth,
    db,
    provider,
    signInWithPopup,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    ...firestore
  };

  onAuthStateChanged(auth, async (account) => {
    if (!account) {
      showAuth();
      return;
    }

    state.user = await ensureUserProfile(account);
    await openWorkspace();
  });
}

function bindEvents() {
  els.googleLogin.addEventListener("click", async () => {
    const { auth, provider, signInWithPopup } = state.firebase;
    await signInWithPopup(auth, provider);
  });

  els.emailLogin.addEventListener("click", loginWithEmail);
  els.passwordReset.addEventListener("click", resetPassword);
  els.pinLogin.addEventListener("click", loginWithPin);
  els.biometricLogin.addEventListener("click", loginWithBiometrics);
  els.demoAdminLogin.addEventListener("click", () => startDemo("admin"));
  els.demoUserLogin.addEventListener("click", () => startDemo("user"));
  els.logoutButton.addEventListener("click", logout);
  els.userName.addEventListener("click", openSecuritySetup);
  els.addDepartmentButton.addEventListener("click", openDepartmentDialog);
  els.addDepartmentNavButton.addEventListener("click", openDepartmentDialog);

  els.addPageButton.addEventListener("click", openPageDialog);
  els.addBlockButton.addEventListener("click", openBlockDialog);
  els.quickAddBlockButton.addEventListener("click", openBlockDialog);
  els.settingsButton.addEventListener("click", () => showView("settings"));
  els.sidebarSettingsButton.addEventListener("click", () => showView("settings"));
  els.themeSettings.addEventListener("input", handleThemeInput);
  els.resetThemeButton.addEventListener("click", resetTheme);
  els.statsToggleButton.addEventListener("click", toggleStats);
  els.searchInput.addEventListener("input", () => {
    state.searchQuery = els.searchInput.value;
    renderBlocks();
  });

  document.querySelectorAll("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", () => showView("settings"));
  });

  document.querySelectorAll("[data-open-departments]").forEach((button) => {
    button.addEventListener("click", () => showView("departments"));
  });
  document.querySelectorAll("[data-open-transfers]").forEach((button) => {
    button.addEventListener("click", () => showView("transfers"));
  });

  document.querySelectorAll("[data-open-tables]").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 680px)").matches) {
        openTablesSheet();
        return;
      }
      showView("page");
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(`#${button.dataset.closeDialog}`)?.close();
    });
  });

  els.pageForm.addEventListener("submit", addPage);
  els.departmentForm.addEventListener("submit", addDepartment);
  els.blockForm.addEventListener("submit", addBlock);
  els.columnForm.addEventListener("submit", addColumn);
  els.rowForm.addEventListener("submit", addRow);
  els.bulkTransferForm.addEventListener("submit", submitBulkTransfer);

  els.pagesList.addEventListener("click", handlePagesClick);
  els.pageTabs.addEventListener("click", handlePagesClick);
  els.bottomSheetContent.addEventListener("click", handlePagesClick);
  els.blocksList.addEventListener("click", handleBlocksClick);
  els.blocksList.addEventListener("input", handleBlocksInput);
  els.blocksList.addEventListener("change", handleBlocksChange);
  els.blocksList.addEventListener("pointerdown", handleDragPointerDown);
  els.blocksList.addEventListener("dragstart", handleDragStart);
  els.blocksList.addEventListener("dragover", handleDragOver);
  els.blocksList.addEventListener("dragleave", handleDragLeave);
  els.blocksList.addEventListener("drop", handleDrop);
  els.blocksList.addEventListener("dragend", handleDragEnd);
  document.addEventListener("pointerup", clearDragArmed);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshFirebaseToken();
  });
  els.usersList.addEventListener("change", handleUsersChange);
  els.departmentsNavList.addEventListener("click", handleDepartmentsNavClick);
  els.departmentsList.addEventListener("click", handleDepartmentsClick);
  els.departmentsList.addEventListener("change", handleDepartmentsChange);
  els.departmentDetailList.addEventListener("click", handleDepartmentDetailClick);
  els.departmentDetailList.addEventListener("change", handleDepartmentDetailChange);
  els.transfersList.addEventListener("click", handleTransfersClick);
}

function restoreDemoSession() {
  if (firebaseReady) return;

  const raw = localStorage.getItem("demo-user");
  if (!raw) return;

  state.user = JSON.parse(raw);
  openWorkspace();
}

function startDemo(role) {
  const normalizedRole = normalizeRole(role);
  state.user = {
    uid: normalizedRole === "admin" ? "demo-admin" : "demo-user",
    name: normalizedRole === "admin" ? "Demo Admin" : "Demo User",
    email: normalizedRole === "admin" ? "admin@local.demo" : "user@local.demo",
    role: normalizedRole
  };
  localStorage.setItem("demo-user", JSON.stringify(state.user));
  saveQuickAuthProfile();
  openWorkspace();
}

async function loginWithEmail() {
  if (!firebaseReady) {
    showSnackbar("Email-РІС…С–Рґ Р±СѓРґРµ РґРѕСЃС‚СѓРїРЅРёР№ РїС–СЃР»СЏ РїС–РґРєР»СЋС‡РµРЅРЅСЏ Firebase");
    return;
  }

  const email = els.emailInput.value.trim();
  const password = els.passwordInput.value;
  if (!email || !password) {
    showSnackbar("Р’РІРµРґС–С‚СЊ email С– РїР°СЂРѕР»СЊ");
    return;
  }

  try {
    const { auth, signInWithEmailAndPassword } = state.firebase;
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showSnackbar(getAuthErrorMessage(error));
  }
}

async function resetPassword() {
  if (!firebaseReady) {
    showSnackbar("Р’С–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ Р±СѓРґРµ РґРѕСЃС‚СѓРїРЅРµ РїС–СЃР»СЏ РїС–РґРєР»СЋС‡РµРЅРЅСЏ Firebase");
    return;
  }

  const email = els.emailInput.value.trim();
  if (!email) {
    showSnackbar("Р’РєР°Р¶С–С‚СЊ email РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ");
    return;
  }

  try {
    const { auth, sendPasswordResetEmail } = state.firebase;
    await sendPasswordResetEmail(auth, email);
    showSnackbar("Р›РёСЃС‚ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РЅР°РґС–СЃР»Р°РЅРѕ");
  } catch (error) {
    showSnackbar(getAuthErrorMessage(error));
  }
}

async function loginWithPin() {
  const quickProfile = loadQuickAuthProfile();
  const pinHash = localStorage.getItem("quick-auth-pin");
  if (!quickProfile || !pinHash) {
    showSnackbar("PIN С‰Рµ РЅРµ РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ");
    return;
  }
  if (firebaseReady) {
    showSnackbar("PIN РїСЂР°С†СЋС” РґР»СЏ Р»РѕРєР°Р»СЊРЅРѕРіРѕ demo-РІС…РѕРґСѓ. Firebase-СЃРµСЃС–СЋ РІС–РґРЅРѕРІР»СЋС” СЃР°Рј Firebase.");
    return;
  }

  const pin = window.prompt("Р’РІРµРґС–С‚СЊ PIN-РєРѕРґ");
  if (!pin) return;

  const inputHash = await hashText(pin);
  if (inputHash !== pinHash) {
    showSnackbar("РќРµРІС–СЂРЅРёР№ PIN-РєРѕРґ");
    return;
  }

  state.user = quickProfile;
  localStorage.setItem("demo-user", JSON.stringify(state.user));
  await openWorkspace();
  showSnackbar("Р’С…С–Рґ С‡РµСЂРµР· PIN РІРёРєРѕРЅР°РЅРѕ");
}

async function loginWithBiometrics() {
  const quickProfile = loadQuickAuthProfile();
  const credentialId = localStorage.getItem("quick-auth-biometric-id");
  if (!quickProfile || !credentialId) {
    showSnackbar("Р‘С–РѕРјРµС‚СЂС–СЋ С‰Рµ РЅРµ РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ");
    return;
  }
  if (!window.PublicKeyCredential || !navigator.credentials?.get) {
    showSnackbar("Р‘С–РѕРјРµС‚СЂС–СЏ РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ С†РёРј Р±СЂР°СѓР·РµСЂРѕРј");
    return;
  }
  if (firebaseReady) {
    showSnackbar("Р‘С–РѕРјРµС‚СЂС–СЏ РїС–РґРіРѕС‚РѕРІР»РµРЅР° РґР»СЏ Р»РѕРєР°Р»СЊРЅРѕРіРѕ demo-РІС…РѕРґСѓ. Firebase-СЃРµСЃС–СЋ РІС–РґРЅРѕРІР»СЋС” СЃР°Рј Firebase.");
    return;
  }

  try {
    await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: "public-key", id: base64UrlToBuffer(credentialId) }],
        userVerification: "preferred",
        timeout: 60000
      }
    });
    state.user = quickProfile;
    localStorage.setItem("demo-user", JSON.stringify(state.user));
    await openWorkspace();
    showSnackbar("Р‘С–РѕРјРµС‚СЂРёС‡РЅРёР№ РІС…С–Рґ РІРёРєРѕРЅР°РЅРѕ");
  } catch {
    showSnackbar("Р‘С–РѕРјРµС‚СЂРёС‡РЅСѓ РїРµСЂРµРІС–СЂРєСѓ СЃРєР°СЃРѕРІР°РЅРѕ");
  }
}

async function openSecuritySetup() {
  if (!state.user) return;
  const action = window.prompt("РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ РІС…РѕРґСѓ: 1 - PIN, 2 - Р‘С–РѕРјРµС‚СЂС–СЏ");
  if (action === "1") {
    await setupPin();
    return;
  }
  if (action === "2") {
    await setupBiometrics();
  }
}

async function setupPin() {
  const pin = window.prompt("РЎС‚РІРѕСЂС–С‚СЊ PIN-РєРѕРґ РјС–РЅС–РјСѓРј Р· 4 СЃРёРјРІРѕР»С–РІ");
  if (!pin) return;
  if (pin.length < 4) {
    showSnackbar("PIN РјР°С” РјС–СЃС‚РёС‚Рё РјС–РЅС–РјСѓРј 4 СЃРёРјРІРѕР»Рё");
    return;
  }

  localStorage.setItem("quick-auth-pin", await hashText(pin));
  saveQuickAuthProfile();
  showSnackbar("PIN-РєРѕРґ Р·Р±РµСЂРµР¶РµРЅРѕ");
}

async function setupBiometrics() {
  if (!window.PublicKeyCredential || !navigator.credentials?.create) {
    showSnackbar("Р‘С–РѕРјРµС‚СЂС–СЏ РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ С†РёРј Р±СЂР°СѓР·РµСЂРѕРј");
    return;
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "Intelekt Workspace" },
        user: {
          id: new TextEncoder().encode(state.user.uid || "local-user"),
          name: state.user.email || state.user.name || "local-user",
          displayName: state.user.name || state.user.email || "РљРѕСЂРёСЃС‚СѓРІР°С‡"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { userVerification: "preferred" },
        timeout: 60000,
        attestation: "none"
      }
    });
    if (!credential?.rawId) return;
    localStorage.setItem("quick-auth-biometric-id", bufferToBase64Url(credential.rawId));
    saveQuickAuthProfile();
    showSnackbar("Р‘С–РѕРјРµС‚СЂС–СЋ РЅР°Р»Р°С€С‚РѕРІР°РЅРѕ");
  } catch {
    showSnackbar("РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ Р±С–РѕРјРµС‚СЂС–С— СЃРєР°СЃРѕРІР°РЅРѕ");
  }
}

function saveQuickAuthProfile() {
  if (!state.user) return;
  const profile = {
    uid: state.user.uid,
    name: state.user.name,
    email: state.user.email,
    role: normalizeRole(state.user.role)
  };
  localStorage.setItem("quick-auth-user", JSON.stringify(profile));
}

function loadQuickAuthProfile() {
  const raw = localStorage.getItem("quick-auth-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function refreshFirebaseToken() {
  if (!firebaseReady || !state.firebase?.auth.currentUser) return;
  try {
    await state.firebase.auth.currentUser.getIdToken(true);
  } catch {
    showSnackbar("РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё Firebase token");
  }
}

async function hashText(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return bufferToBase64Url(hash);
}

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function getAuthErrorMessage(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "РќРµРІС–СЂРЅРёР№ email Р°Р±Рѕ РїР°СЂРѕР»СЊ";
  if (code.includes("user-not-found")) return "РљРѕСЂРёСЃС‚СѓРІР°С‡Р° РЅРµ Р·РЅР°Р№РґРµРЅРѕ";
  if (code.includes("invalid-email")) return "РќРµРєРѕСЂРµРєС‚РЅРёР№ email";
  if (code.includes("too-many-requests")) return "Р—Р°Р±Р°РіР°С‚Рѕ СЃРїСЂРѕР±. РЎРїСЂРѕР±СѓР№С‚Рµ РїС–Р·РЅС–С€Рµ";
  return "РџРѕРјРёР»РєР° Р°РІС‚РѕСЂРёР·Р°С†С–С—";
}

async function ensureUserProfile(account) {
  const { db, doc, getDoc, setDoc, serverTimestamp } = state.firebase;
  const ref = doc(db, "users", account.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { uid: account.uid, ...snap.data() };
  }

  const profile = {
    name: account.displayName || account.email || "РљРѕСЂРёСЃС‚СѓРІР°С‡",
    email: account.email || "",
    photoURL: account.photoURL || "",
    role: "user",
    createdAt: serverTimestamp()
  };

  await setDoc(ref, profile);
  return { uid: account.uid, ...profile };
}

async function openWorkspace() {
  els.authView.classList.add("hidden");
  els.workspaceShell.classList.remove("hidden");
  const displayName = state.user.name || state.user.email || "РљРѕСЂРёСЃС‚СѓРІР°С‡";
  els.userName.textContent = getInitials(displayName);
  els.userName.title = displayName;
  state.user.role = normalizeRole(state.user.role);
  els.userRole.textContent = getRoleLabel(state.user.role);
  els.modeBadge.textContent = firebaseReady ? "Firebase + Google Auth" : "Р›РѕРєР°Р»СЊРЅРёР№ demo mode";
  saveQuickAuthProfile();
  refreshFirebaseToken();

  if (firebaseReady) {
    subscribeToFirebaseData();
  } else {
    state.workspace = normalizeWorkspace(loadLocalWorkspace());
    state.users = loadLocalUsers();
    render();
  }
}

function showAuth() {
  state.user = null;
  state.unsubscribeWorkspace?.();
  state.unsubscribeUsers?.();
  els.authView.classList.remove("hidden");
  els.workspaceShell.classList.add("hidden");
}

async function logout() {
  if (firebaseReady && state.firebase?.auth.currentUser) {
    await state.firebase.signOut(state.firebase.auth);
  }
  localStorage.removeItem("demo-user");
  showAuth();
}

function subscribeToFirebaseData() {
  const { db, doc, collection, onSnapshot, setDoc } = state.firebase;
  const workspaceRef = doc(db, "workspaces", "default", "sheets", "main-assets");

  state.unsubscribeWorkspace?.();
  state.unsubscribeUsers?.();

  state.unsubscribeWorkspace = onSnapshot(workspaceRef, async (snap) => {
    if (!snap.exists() && isAdmin()) {
      await setDoc(workspaceRef, { ...structuredClone(defaultWorkspace), updatedAt: new Date().toISOString() });
      return;
    }

    state.workspace = normalizeWorkspace(snap.exists() ? { id: snap.id, ...snap.data() } : structuredClone(defaultWorkspace));
    render();
  });

  if (isAdmin() || canManageAssets() || canViewReports()) {
    state.unsubscribeUsers = onSnapshot(collection(db, "users"), (snap) => {
      state.users = snap.docs.map((item) => ({ uid: item.id, ...item.data() }));
      renderDepartments();
      renderUsers();
    });
  }
}

function loadLocalWorkspace() {
  const raw = localStorage.getItem(workspaceStorageKey);
  if (raw) return JSON.parse(raw);

  return structuredClone(defaultWorkspace);
}

function migrateLegacySheet(sheet) {
  return {
    ...structuredClone(defaultWorkspace),
    name: "Intelekt Workspace",
    activePageId: "assets",
    pages: [
      {
        id: "assets",
        name: sheet.name || "РћР±Р»С–Рє РјР°Р№РЅР°",
        icon: "в–¦",
        blocks: [
          {
            id: sheet.id || "main-assets",
            title: sheet.name || "РћСЃРЅРѕРІРЅР° С‚Р°Р±Р»РёС†СЏ",
            columns: sheet.columns || [],
            rows: sheet.rows || []
          }
        ]
      }
    ],
    settings: {
      statusOptions: sheet.settings?.statusOptions || defaultStatuses,
      showStats: sheet.settings?.showStats ?? true,
      theme: normalizeTheme(sheet.settings?.theme)
    }
  };
}

function loadLocalUsers() {
  const raw = localStorage.getItem("demo-users");
  if (raw) return JSON.parse(raw);

  return [
    { uid: "demo-admin", name: "Demo Admin", email: "admin@local.demo", role: "admin" },
    { uid: "demo-storekeeper", name: "Demo Storekeeper", email: "storekeeper@local.demo", role: "storekeeper" },
    { uid: "demo-manager", name: "Demo Manager", email: "manager@local.demo", role: "manager" },
    { uid: "demo-user", name: "Demo User", email: "user@local.demo", role: "user" }
  ];
}

async function persistWorkspace() {
  normalizeWorkspace(state.workspace);

  if (firebaseReady) {
    if (!canManageAssets()) return;
    const { db, doc, setDoc, serverTimestamp } = state.firebase;
    await setDoc(doc(db, "workspaces", "default", "sheets", "main-assets"), {
      ...state.workspace,
      updatedAt: serverTimestamp()
    });
  } else {
    localStorage.setItem(workspaceStorageKey, JSON.stringify(state.workspace));
    render();
  }
}

async function persistWorkspaceQuiet() {
  normalizeWorkspace(state.workspace);

  if (firebaseReady) {
    if (!canManageAssets()) return;
    const { db, doc, setDoc, serverTimestamp } = state.firebase;
    await setDoc(doc(db, "workspaces", "default", "sheets", "main-assets"), {
      ...state.workspace,
      updatedAt: serverTimestamp()
    });
  } else {
    localStorage.setItem(workspaceStorageKey, JSON.stringify(state.workspace));
  }
}

async function persistUserRole(uid, role) {
  if (!canManageStructure()) return;
  const normalizedRole = normalizeRole(role);

  if (firebaseReady) {
    const { db, doc, updateDoc } = state.firebase;
    await updateDoc(doc(db, "users", uid), { role: normalizedRole });
  } else {
    state.users = state.users.map((user) => user.uid === uid ? { ...user, role: normalizedRole } : user);
    localStorage.setItem("demo-users", JSON.stringify(state.users));
    if (state.user.uid === uid) {
      state.user.role = normalizedRole;
      localStorage.setItem("demo-user", JSON.stringify(state.user));
      await openWorkspace();
    }
    renderUsers();
  }
}

function openDepartmentDialog() {
  if (!canManageStructure()) {
    showSnackbar("РЎС‚РІРѕСЂСЋРІР°С‚Рё РїС–РґСЂРѕР·РґС–Р»Рё РјРѕР¶Рµ С‚С–Р»СЊРєРё Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂ", "error");
    return;
  }
  els.departmentForm.reset();
  els.departmentResponsibleSelect.innerHTML = renderUserOptions("");
  els.departmentDialog.showModal();
}

async function addDepartment(event) {
  event.preventDefault();
  if (!canManageStructure()) {
    showSnackbar("РЎС‚РІРѕСЂСЋРІР°С‚Рё РїС–РґСЂРѕР·РґС–Р»Рё РјРѕР¶Рµ С‚С–Р»СЊРєРё Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂ", "error");
    return;
  }

  const form = new FormData(els.departmentForm);
  const name = String(form.get("name") || "").trim();
  const responsibleUid = String(form.get("responsibleUid") || "");
  if (!name) {
    showSnackbar("РќР°Р·РІР° РїС–РґСЂРѕР·РґС–Р»Сѓ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅСЊРѕСЋ", "error");
    return;
  }

  getDepartments().push({
    id: createId("department"),
    name,
    responsibleUid
  });
  try {
    els.departmentDialog.close();
    await persistWorkspace();
    showSnackbar("РџС–РґСЂРѕР·РґС–Р» СЃС‚РІРѕСЂРµРЅРѕ");
  } catch {
    showSnackbar("РќРµ РІРґР°Р»РѕСЃСЏ СЃС‚РІРѕСЂРёС‚Рё РїС–РґСЂРѕР·РґС–Р»", "error");
  }
}

async function updateDepartment(departmentId, patch) {
  if (!canManageStructure()) {
    showSnackbar("Р РµРґР°РіСѓРІР°С‚Рё РїС–РґСЂРѕР·РґС–Р»Рё РјРѕР¶Рµ С‚С–Р»СЊРєРё Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂ", "error");
    renderDepartments();
    return;
  }
  const department = getDepartment(departmentId);
  if (!department) {
    showSnackbar("РџС–РґСЂРѕР·РґС–Р» РЅРµ Р·РЅР°Р№РґРµРЅРѕ", "error");
    renderDepartments();
    return;
  }

  if ("name" in patch) {
    const name = String(patch.name || "").trim();
    if (!name) {
      showSnackbar("РќР°Р·РІР° РїС–РґСЂРѕР·РґС–Р»Сѓ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅСЊРѕСЋ", "error");
      renderDepartments();
      return;
    }
    department.name = name;
  }
  if ("responsibleUid" in patch) {
    department.responsibleUid = String(patch.responsibleUid || "");
  }
  try {
    await persistWorkspace();
  } catch {
    showSnackbar("РќРµ РІРґР°Р»РѕСЃСЏ Р·Р±РµСЂРµРіС‚Рё РїС–РґСЂРѕР·РґС–Р»", "error");
    renderDepartments();
  }
}

async function deleteDepartment(departmentId) {
  if (!canManageStructure()) {
    showSnackbar("Р’РёРґР°Р»СЏС‚Рё РїС–РґСЂРѕР·РґС–Р»Рё РјРѕР¶Рµ С‚С–Р»СЊРєРё Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂ", "error");
    return;
  }
  if (getDepartmentAssets(departmentId).length) {
    showSnackbar("РЎРїРѕС‡Р°С‚РєСѓ Р·Р°Р±РµСЂС–С‚СЊ РјР°Р№РЅРѕ Р· РїС–РґСЂРѕР·РґС–Р»Сѓ", "error");
    return;
  }

  state.workspace.departments = getDepartments().filter((department) => department.id !== departmentId);
  if (state.activeDepartmentId === departmentId) {
    state.activeDepartmentId = "";
    state.view = "departments";
  }
  try {
    await persistWorkspace();
    showSnackbar("РџС–РґСЂРѕР·РґС–Р» РІРёРґР°Р»РµРЅРѕ");
  } catch {
    showSnackbar("РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё РїС–РґСЂРѕР·РґС–Р»", "error");
  }
}

function openDepartmentDetail(departmentId) {
  const department = getDepartment(departmentId);
  if (!department) {
    showSnackbar("РџС–РґСЂРѕР·РґС–Р» РЅРµ Р·РЅР°Р№РґРµРЅРѕ", "error");
    renderDepartmentsNav();
    return;
  }
  state.activeDepartmentId = department.id;
  showView("department");
}

function render() {
  if (!state.workspace) return;
  normalizeWorkspace(state.workspace);
  applyTheme(getThemeSettings());
  renderChrome();
  renderPages();
  renderDepartmentsNav();
  renderPageTabs();
  renderStats();
  renderBlocks();
  renderSettings();
  renderUsers();
  renderTransfers();
}

function renderChrome() {
  const page = getActivePage();
  els.workspaceName.textContent = state.workspace.name;
  const activeDepartment = getDepartment(state.activeDepartmentId);
  const viewTitle = state.view === "department" ? activeDepartment?.name || "РџС–РґСЂРѕР·РґС–Р»" : state.view === "transfers" ? "РџРµСЂРµРґР°С‡Р° РјР°Р№РЅР°" : state.view === "departments" ? "РџС–РґСЂРѕР·РґС–Р»Рё" : state.view === "settings" ? "РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ" : page.name;
  els.crumbs.textContent = `${state.workspace.name} / ${viewTitle}`;
  els.pageTitle.textContent = page.name;
  els.pageKicker.textContent = `${page.blocks.length} Р±Р»РѕРє(С–РІ) С‚Р°Р±Р»РёС†СЊ`;

  els.pageView.classList.toggle("hidden", state.view !== "page");
  els.settingsView.classList.toggle("hidden", state.view !== "settings");
  els.departmentsView.classList.toggle("hidden", state.view !== "departments");
  els.departmentDetailView.classList.toggle("hidden", state.view !== "department");
  els.transfersView.classList.toggle("hidden", state.view !== "transfers");
  els.addBlockButton.classList.toggle("hidden", state.view !== "page");
  els.quickAddBlockButton.classList.toggle("hidden", state.view !== "page" || !canManageStructure());
  els.addBlockButton.disabled = !canManageStructure();
  els.quickAddBlockButton.disabled = !canManageStructure();
  els.addPageButton.disabled = !canManageStructure();
  els.addDepartmentNavButton.disabled = !canManageStructure();

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });

  document.querySelectorAll("[data-open-tables]").forEach((button) => {
    button.classList.toggle("active", state.view === "page");
  });
  document.querySelectorAll("[data-open-settings]").forEach((button) => {
    button.classList.toggle("active", state.view === "settings");
  });
  document.querySelectorAll("[data-open-departments]").forEach((button) => {
    button.classList.toggle("active", state.view === "departments" || state.view === "department");
  });
  document.querySelectorAll("[data-open-transfers]").forEach((button) => {
    button.classList.toggle("active", state.view === "transfers");
  });

  renderTransferIndicators();
}

function renderPages() {
  els.pagesList.innerHTML = state.workspace.pages.map((page) => `
    <div class="page-list-row ${page.id === state.workspace.activePageId ? "active" : ""}">
      <button class="page-link" type="button" data-page-id="${page.id}">
        <strong>${escapeHtml(page.icon || "в–¦")}</strong>
        <span>${escapeHtml(page.name)}</span>
      </button>
      <button class="page-delete-button" type="button" data-delete-page="${page.id}" ${canManageStructure() && state.workspace.pages.length > 1 ? "" : "disabled"} title="Р’РёРґР°Р»РёС‚Рё С‚Р°Р±Р»РёС†СЋ">рџ—‘</button>
    </div>
  `).join("");
}

function renderDepartmentsNav() {
  const departments = getDepartments();
  if (!departments.length) {
    els.departmentsNavList.innerHTML = `
      <div class="sidebar-empty">РџС–РґСЂРѕР·РґС–Р»С–РІ С‰Рµ РЅРµРјР°С”</div>
    `;
    return;
  }

  els.departmentsNavList.innerHTML = departments.map((department) => {
    const assets = getDepartmentAssets(department.id);
    const active = state.view === "department" && state.activeDepartmentId === department.id;
    const canDelete = canManageStructure() && assets.length === 0;
    return `
      <div class="page-list-row department-list-row ${active ? "active" : ""}">
      <button class="page-link department-nav-item md3-list-item" type="button" data-open-department="${department.id}">
        <span>вЊ‚</span>
        <span>${escapeHtml(department.name)}</span>
        <strong>${assets.length}</strong>
      </button>
      <button class="page-delete-button" type="button" data-delete-department="${department.id}" ${canDelete ? "" : "disabled"} title="${assets.length ? "РџС–РґСЂРѕР·РґС–Р» РјР°С” РјР°Р№РЅРѕ" : "Р’РёРґР°Р»РёС‚Рё РїС–РґСЂРѕР·РґС–Р»"}">рџ—‘</button>
      </div>
    `;
  }).join("");
}

function renderPageTabs() {
  els.pageTabs.innerHTML = state.workspace.pages.map((page) => `
    <button class="view-tab ${page.id === state.workspace.activePageId ? "active" : ""}" type="button" data-page-id="${page.id}">
      ${escapeHtml(page.name)}
    </button>
  `).join("");
}

function renderStats() {
  const statsVisible = state.workspace.settings.showStats !== false;
  els.statsGrid.classList.toggle("hidden", !statsVisible);
  els.statsToggleButton.textContent = statsVisible ? "РЎС…РѕРІР°С‚Рё РїРѕРєР°Р·РЅРёРєРё" : "РџРѕРєР°Р·Р°С‚Рё РїРѕРєР°Р·РЅРёРєРё";

  if (!statsVisible) {
    els.statsGrid.innerHTML = "";
    return;
  }

  const blocks = getActivePage().blocks;
  const rows = blocks.flatMap((block) => block.rows);
  const columns = blocks.flatMap((block) => block.columns);
  const statusRows = rows.filter((row) => Object.values(row.values || {}).includes("Р’ СЂРѕР±РѕС‚С–")).length;
  const totalValue = blocks.reduce((total, block) => {
    const valueColumns = block.columns.filter((column) => ["currency", "number"].includes(column.type) && /РІР°СЂС‚|value|С†С–РЅР°|СЃСѓРјР°/i.test(column.label));
    return total + block.rows.reduce((rowTotal, row) => (
      rowTotal + valueColumns.reduce((colTotal, column) => colTotal + Number(row.values?.[column.id] || 0), 0)
    ), 0);
  }, 0);

  const stats = [
    ["РЎС‚РѕСЂС–РЅРѕРє", state.workspace.pages.length],
    ["Р‘Р»РѕРєС–РІ", blocks.length],
    ["Р СЏРґРєС–РІ", rows.length],
    ["РџРѕР»С–РІ", columns.length],
    ["Р’ СЂРѕР±РѕС‚С–", statusRows],
    ["РЎСѓРјР°", formatNumber(totalValue)]
  ];

  els.statsGrid.innerHTML = stats.map(([label, value]) => `
    <article class="stat md3-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");
}

function renderBlocks() {
  const page = getActivePage();
  if (!page.blocks.length) {
    els.blocksList.innerHTML = `
      <div class="empty-state">
        РќР° С†С–Р№ СЃС‚РѕСЂС–РЅС†С– С‰Рµ РЅРµРјР°С” Р±Р»РѕРєС–РІ С‚Р°Р±Р»РёС†СЊ.
        <br>
        ${canManageStructure() ? "РќР°С‚РёСЃРЅС–С‚СЊ вЂњР‘Р»РѕРє С‚Р°Р±Р»РёС†С–вЂќ, С‰РѕР± СЃС‚РІРѕСЂРёС‚Рё РїРµСЂС€РёР№ Р±Р»РѕРє." : "Р—РІРµСЂРЅС–С‚СЊСЃСЏ РґРѕ Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂР° РґР»СЏ РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ СЃС‚СЂСѓРєС‚СѓСЂРё."}
      </div>
    `;
    return;
  }

  els.blocksList.innerHTML = page.blocks.map((block) => renderBlock(block)).join("");
}

function renderBlock(block) {
  const editable = canManageAssets();
  const structureEditable = canManageStructure();
  const canAddRow = editable && block.columns.length > 0;
  const settingsOpen = state.openBlockSettings.has(block.id);
  const collapsed = state.collapsedBlocks.has(block.id);
  const filterStatus = getBlockFilterStatus(block);
  const visibleRows = getVisibleRows(block);
  const selectedCount = getSelectedRowsForBlock(block).length;
  return `
    <article class="table-block md3-card ${collapsed ? "is-collapsed" : ""}" data-block-id="${block.id}" style="--block-accent: ${escapeHtml(block.color || "#7c5cff")};">
      <header class="block-header">
        <div class="block-title">
          <span class="status-pill">${escapeHtml(block.badge || "Р‘Р»РѕРє")}</span>
          <strong>${escapeHtml(block.title)}</strong>
          <button class="icon-button md3-icon-button block-title-edit" type="button" data-quick-edit-block-title="${block.id}" ${structureEditable ? "" : "disabled"} title="Р—РјС–РЅРёС‚Рё РЅР°Р·РІСѓ Р±Р»РѕРєСѓ">вњЋ</button>
          <span>${block.rows.length}</span>
        </div>
        <div class="block-actions">
          <button class="icon-button md3-icon-button" type="button" data-toggle-block-collapse="${block.id}" title="${collapsed ? "Р РѕР·РіРѕСЂРЅСѓС‚Рё Р±Р»РѕРє" : "Р—РіРѕСЂРЅСѓС‚Рё Р±Р»РѕРє"}">${collapsed ? "в–ѕ" : "в–ґ"}</button>
          <button class="button ghost compact md3-button md3-button-tonal" type="button" data-toggle-block-settings="${block.id}" ${structureEditable ? "" : "disabled"}>${settingsOpen ? "РЎС…РѕРІР°С‚Рё СЃС‚СЂСѓРєС‚СѓСЂСѓ" : "вљ™ РЎС‚СЂСѓРєС‚СѓСЂР°"}</button>
          <button class="button ghost compact md3-button md3-button-tonal" type="button" data-add-column="${block.id}" ${structureEditable ? "" : "disabled"}>пј‹ РџРѕР»Рµ</button>
          <button class="button primary compact md3-button md3-button-filled" type="button" data-add-row="${block.id}" ${canAddRow ? "" : "disabled"}>пј‹ Р СЏРґРѕРє</button>
          <button class="icon-button md3-icon-button" type="button" data-delete-block="${block.id}" ${structureEditable ? "" : "disabled"} title="Р’РёРґР°Р»РёС‚Рё Р±Р»РѕРє">Г—</button>
        </div>
      </header>
      <section class="block-structure ${settingsOpen && !collapsed ? "" : "hidden"}">
        <div class="structure-block-header">
          <label>
            РќР°Р·РІР° Р±Р»РѕРєСѓ
            <input data-block-title="${block.id}" value="${escapeHtml(block.title)}" ${structureEditable ? "" : "disabled"}>
          </label>
          <label>
            Р‘РµР№РґР¶
            <input data-block-badge="${block.id}" value="${escapeHtml(block.badge || "")}" ${structureEditable ? "" : "disabled"}>
          </label>
          <label>
            РЎС‚Р°С‚СѓСЃ СЃРѕСЂС‚СѓРІР°РЅРЅСЏ
            <input data-block-filter-status="${block.id}" value="${escapeHtml(filterStatus)}" placeholder="РќР°РїСЂРёРєР»Р°Рґ: Р РµРјРѕРЅС‚" ${structureEditable ? "" : "disabled"}>
          </label>
          <label>
            РљРѕР»С–СЂ
            <input class="block-color-picker" type="color" data-block-color="${block.id}" value="${escapeHtml(block.color || "#7c5cff")}" ${structureEditable ? "" : "disabled"}>
          </label>
          <button class="button ghost compact md3-button md3-button-tonal" type="button" data-add-column="${block.id}" ${structureEditable ? "" : "disabled"}>пј‹ РџРѕР»Рµ</button>
        </div>
        <div class="field-presets">
          ${[
            ["name", "РќР°Р·РІР°"],
            ["serial", "РЎРµСЂС–Р№РЅРёР№ РЅРѕРјРµСЂ"],
            ["quantity", "РљС–Р»СЊРєС–СЃС‚СЊ"],
            ["status", "РЎС‚Р°С‚СѓСЃ"],
            ["block", "Р‘Р»РѕРє"],
            ["department", "РџС–РґСЂРѕР·РґС–Р»"],
            ["checkbox", "Р§РµРєР±РѕРєСЃ"],
            ["date", "Р”Р°С‚Р°"]
          ].map(([preset, label]) => `
            <button class="button text compact md3-button md3-button-text" type="button" data-add-preset-column="${block.id}:${preset}" ${structureEditable ? "" : "disabled"}>пј‹ ${label}</button>
          `).join("")}
        </div>
        <div class="settings-list">
          ${block.columns.length ? block.columns.map((column) => `
            <article class="field-row" draggable="${structureEditable ? "true" : "false"}" data-drag-column="${block.id}:${column.id}">
              <span class="drag-handle md3-drag-handle" data-drag-handle title="РџРµСЂРµС‚СЏРіРЅСѓС‚Рё РїРѕР»Рµ" aria-label="РџРµСЂРµС‚СЏРіРЅСѓС‚Рё РїРѕР»Рµ">в‹®в‹®</span>
              <label>
                РќР°Р·РІР° РїРѕР»СЏ
                <input data-column-label="${block.id}:${column.id}" value="${escapeHtml(column.label)}" ${structureEditable ? "" : "disabled"}>
              </label>
              <label>
                РўРёРї
                <select data-column-type="${block.id}:${column.id}" ${structureEditable ? "" : "disabled"}>
                  ${fieldTypes.map((type) => `<option value="${type.value}" ${column.type === type.value ? "selected" : ""}>${type.label}</option>`).join("")}
                </select>
              </label>
              ${column.type === "status" ? `
                <label class="field-options">
                  Р’Р°СЂС–Р°РЅС‚Рё СЃС‚Р°С‚СѓСЃСѓ
                  <input data-column-options="${block.id}:${column.id}" value="${escapeHtml(getColumnStatusOptions(column).join(", "))}" placeholder="РќРѕРІРёР№, Р’ СЂРѕР±РѕС‚С–, Р“РѕС‚РѕРІРѕ" ${structureEditable ? "" : "disabled"}>
                </label>
              ` : ""}
              <button class="icon-button md3-icon-button" type="button" data-delete-column="${block.id}:${column.id}" ${structureEditable ? "" : "disabled"} title="Р’РёРґР°Р»РёС‚Рё РїРѕР»Рµ">Г—</button>
            </article>
          `).join("") : `<div class="structure-empty">РџРѕР»СЏ С‰Рµ РЅРµ СЃС‚РІРѕСЂРµРЅС–. Р”РѕРґР°Р№С‚Рµ РїРµСЂС€Рµ РїРѕР»Рµ, С‰РѕР± СЃС„РѕСЂРјСѓРІР°С‚Рё СЃС‚СЂСѓРєС‚СѓСЂСѓ С‚Р°Р±Р»РёС†С–.</div>`}
        </div>
      </section>
      <div class="product-card-grid md3-card-grid ${collapsed ? "hidden" : ""}">
        ${selectedCount ? renderBulkTransferBar(block, selectedCount) : ""}
        ${visibleRows.length ? visibleRows.map((row, index) => renderProductCard(block, row, index, editable)).join("") : ""}
        ${!visibleRows.length ? `<div class="product-empty-state md3-card">${state.searchQuery ? "Р—Р° С†РёРј РїРѕС€СѓРєРѕРј СЂСЏРґРєС–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ." : "РЈ С†СЊРѕРјСѓ Р±Р»РѕС†С– С‰Рµ РЅРµРјР°С” СЂСЏРґРєС–РІ."}</div>` : ""}
        <div class="product-add-card md3-card">
          <button class="button primary compact md3-button md3-button-filled" type="button" data-add-row="${block.id}" ${canAddRow ? "" : "disabled"}>пј‹ Р”РѕРґР°С‚Рё РїСЂРѕРґСѓРєС‚</button>
          ${block.columns.length ? "" : `<span class="hint-text">РЎРїРѕС‡Р°С‚РєСѓ РґРѕРґР°Р№С‚Рµ РїРѕР»СЏ С‚Р°Р±Р»РёС†С–.</span>`}
        </div>
      </div>
    </article>
  `;
}

function renderProductCard(block, row, index, editable) {
  const titleColumn = getPrimaryColumn(block);
  const subtitleColumn = getSubtitleColumn(block, titleColumn?.id);
  const titleValue = titleColumn ? row.values?.[titleColumn.id] : "";
  const subtitleValue = row.description || (subtitleColumn ? row.values?.[subtitleColumn.id] : "");
  const cardTitle = titleValue || `РџСЂРѕРґСѓРєС‚ ${index + 1}`;
  const cardSubtitle = subtitleValue || block.title;
  const visibleColumns = block.columns.filter((column) => (
    column.id !== titleColumn?.id
  ));
  const rowRef = getRowRef(block.id, row.id);
  const selected = state.selectedProductRefs.has(rowRef);

  return renderAssetCard({
    className: `product-card ${selected ? "is-selected" : ""}`,
    attrs: `data-row-id="${row.id}" draggable="${editable ? "true" : "false"}" data-drag-row="${block.id}:${row.id}"`,
    leading: `
      <div class="product-list-tile md3-list-tile asset-card-title">
        <input class="product-select-checkbox" type="checkbox" data-select-product="${rowRef}" ${selected ? "checked" : ""} ${editable ? "" : "disabled"} title="Вибрати товар">
        <span class="drag-handle md3-drag-handle" data-drag-handle title="РџРµСЂРµС‚СЏРіРЅСѓС‚Рё РєР°СЂС‚РєСѓ" aria-label="РџРµСЂРµС‚СЏРіРЅСѓС‚Рё РєР°СЂС‚РєСѓ">в‹®в‹®</span>
        <span class="product-badge md3-badge">${index + 1}</span>
        <div class="product-title-wrap">
          ${renderProductTitleEditor(block, row, titleColumn, cardTitle, editable, "title")}
          ${renderProductDescriptionEditor(row, cardSubtitle, editable)}
        </div>
      </div>`,
    aside: "",
    body: `
      <div class="product-chip-grid asset-card-fields">
        ${visibleColumns.map((column) => renderProductField(block, row, column, editable)).join("")}
        ${renderPendingDepartmentTransfer(block, row)}
      </div>`,
    actions: `
      <div class="product-card-actions asset-card-actions">
        <button class="icon-button md3-icon-button" type="button" data-duplicate-row="${block.id}:${row.id}" ${editable ? "" : "disabled"} title="Р”СѓР±Р»СЋРІР°С‚Рё СЂСЏРґРѕРє">в§‰</button>
        <button class="icon-button md3-icon-button" type="button" data-delete-row="${block.id}:${row.id}" ${editable ? "" : "disabled"} title="Р’РёРґР°Р»РёС‚Рё СЂСЏРґРѕРє">Г—</button>
      </div>`
  });
}

function renderBulkTransferBar(block, selectedCount) {
  const hasDepartmentField = block.columns.some((column) => column.type === "department");
  return `
    <div class="bulk-transfer-bar md3-card">
      <strong>Вибрано: ${selectedCount}</strong>
      <div>
        <button class="button ghost compact md3-button md3-button-tonal" type="button" data-clear-selection="${block.id}">Скинути</button>
        <button class="button primary compact md3-button md3-button-filled" type="button" data-open-bulk-transfer="${block.id}" ${hasDepartmentField ? "" : "disabled"}>Передати вибрані</button>
      </div>
    </div>
  `;
}

function renderProductTitleEditor(block, row, column, fallbackValue, editable, variant) {
  const value = column ? row.values?.[column.id] ?? "" : fallbackValue;
  const label = variant === "title" ? "РќР°Р·РІР°" : "РћРїРёСЃ";
  const className = variant === "title" ? "product-title-input" : "product-description-input";

  if (!column || !editable) {
    const Tag = variant === "title" ? "strong" : "span";
    return `<${Tag} class="${className}">${escapeHtml(String(value || fallbackValue))}</${Tag}>`;
  }

  return `
    <label class="product-title-control ${className}">
      <span>${label}</span>
      ${variant === "description" ? `
        <textarea data-cell="${block.id}:${row.id}:${column.id}" data-live-cell rows="1" placeholder="${escapeHtml(String(fallbackValue || label))}">${escapeHtml(String(value || ""))}</textarea>
      ` : `
        <input data-cell="${block.id}:${row.id}:${column.id}" data-live-cell value="${escapeHtml(String(value || ""))}" placeholder="${escapeHtml(String(fallbackValue || label))}">
      `}
    </label>
  `;
}

function renderProductDescriptionEditor(row, fallbackValue, editable) {
  const value = row.description ?? "";
  if (!editable) {
    return `<span class="product-description-input">${escapeHtml(String(value || fallbackValue))}</span>`;
  }

  return `
    <label class="product-title-control product-description-input">
      <span>РћРїРёСЃ</span>
      <textarea data-row-description="${row.id}" rows="1" placeholder="${escapeHtml(String(fallbackValue || "РћРїРёСЃ"))}">${escapeHtml(String(value || ""))}</textarea>
    </label>
  `;
}

function renderAssetCard({ className = "", attrs = "", leading = "", body = "", aside = "", status = "", actions = "" }) {
  return `
    <article class="asset-card md3-card ${className}" ${attrs}>
      ${leading ? `<div class="asset-card-leading">${leading}</div>` : ""}
      ${aside ? `<div class="asset-card-aside">${aside}</div>` : ""}
      ${body ? `<div class="asset-card-body">${body}</div>` : ""}
      ${status ? `<div class="asset-card-status">${status}</div>` : ""}
      ${actions ? `<div class="asset-card-action-slot">${actions}</div>` : ""}
    </article>
  `;
}

function renderProductField(block, row, column, editable, featured = false) {
  const value = column.type === "department"
    ? getDepartmentFieldValue(row, column)
    : row.values?.[column.id] ?? getEmptyValue(column.type, block, column);
  const disabled = editable ? "" : "disabled";
  const fieldRef = `${block.id}:${row.id}:${column.id}`;
  const emptyClass = isEmptyCellValue(value, column.type) ? "empty-field" : "";
  const className = featured ? "product-field product-field-featured" : `product-field md3-chip ${emptyClass}`;

  if (isBlockMoveColumn(column)) {
    return `
      <label class="${className} block-select-field">
        <span>${escapeHtml(column.label)}</span>
        ${renderBlockDropdown(block, value, fieldRef, editable)}
      </label>
    `;
  }

  if (column.type === "status") {
    return `
      <label class="${className}">
        <span>${escapeHtml(column.label)} <small>${getTypeLabel(column.type)}</small></span>
        ${renderProductDropdown(fieldRef, value, getColumnStatusOptions(column).map((option) => ({ value: option, label: option })), editable)}
      </label>
    `;
  }

  if (column.type === "department") {
    return `
      <label class="${className}">
        <span>${escapeHtml(column.label)} <small>${getTypeLabel(column.type)}</small></span>
        ${renderProductDropdown(fieldRef, value, getDepartmentDropdownOptions(), editable)}
      </label>
    `;
  }

  if (column.type === "checkbox") {
    return `
      <label class="${className}">
        <span>${escapeHtml(column.label)}</span>
        <input data-cell="${fieldRef}" type="checkbox" ${value ? "checked" : ""} ${disabled}>
      </label>
    `;
  }

  return `
    <label class="${className}">
      <span>${escapeHtml(column.label)} <small>${getTypeLabel(column.type)}</small></span>
      <input data-cell="${fieldRef}" data-live-cell type="${getInputType(column.type)}" value="${escapeHtml(String(value))}" ${disabled}>
    </label>
  `;
}

function renderPendingDepartmentTransfer(block, row) {
  const transfer = getPendingDepartmentTransfer(row);
  if (!transfer) return "";

  const column = block.columns.find((item) => item.id === transfer.columnId && item.type === "department");
  if (!column) return "";

  const department = getDepartment(transfer.targetDepartmentId);
  const canConfirm = canConfirmDepartmentTransfer(transfer);
  const responsible = getUserLabel(department?.responsibleUid);

  return `
    <div class="product-transfer-chip md3-chip">
      <span>
        РћС‡С–РєСѓС” РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ
        <small>${escapeHtml(column.label)}</small>
      </span>
      <strong>${escapeHtml(department?.name || "РџС–РґСЂРѕР·РґС–Р»")}</strong>
      ${responsible ? `<small>Р’С–РґРїРѕРІС–РґР°Р»СЊРЅРёР№: ${escapeHtml(responsible)}</small>` : ""}
      ${canConfirm ? `
        <button class="button compact md3-button md3-button-tonal" type="button" data-confirm-department-transfer="${block.id}:${row.id}">
          РџС–РґС‚РІРµСЂРґРёС‚Рё
        </button>
      ` : ""}
    </div>
  `;
}

function renderCell(block, row, column, editable) {
  const value = row.values?.[column.id] ?? getEmptyValue(column.type, block, column);
  const disabled = editable ? "" : "disabled";
  const fieldRef = `${block.id}:${row.id}:${column.id}`;
  const emptyClass = isEmptyCellValue(value, column.type) ? "empty-cell" : "";

  if (isBlockMoveColumn(column)) {
    return `
      <td class="${emptyClass}">
        <select data-cell="${fieldRef}" ${disabled}>
          ${renderBlockOptions(block, value)}
        </select>
      </td>
    `;
  }

  if (column.type === "status") {
    return `
      <td class="${emptyClass}">
        <select data-cell="${fieldRef}" ${disabled}>
          ${renderStatusOptions(column, value)}
        </select>
      </td>
    `;
  }

  if (column.type === "department") {
    return `
      <td class="${emptyClass}">
        <select data-cell="${fieldRef}" ${disabled}>
          ${renderDepartmentOptions(value)}
        </select>
      </td>
    `;
  }

  if (column.type === "checkbox") {
    return `
      <td class="${emptyClass}">
        <input data-cell="${fieldRef}" type="checkbox" ${value ? "checked" : ""} ${disabled}>
      </td>
    `;
  }

  return `
    <td class="${emptyClass}">
      <input data-cell="${fieldRef}" type="${getInputType(column.type)}" value="${escapeHtml(String(value))}" ${disabled}>
    </td>
  `;
}

function renderSettings() {
  renderThemeSettings();
  renderDepartments();
  renderDepartmentDetail();
  renderUsers();
}

function renderThemeSettings() {
  const theme = getThemeSettings();
  const editable = canManageStructure();
  const items = [
    ["primary", "РћСЃРЅРѕРІРЅРёР№ Р°РєС†РµРЅС‚", "РљРЅРѕРїРєРё, Р°РєС‚РёРІРЅС– РµР»РµРјРµРЅС‚Рё"],
    ["primaryContainer", "РљРѕРЅС‚РµР№РЅРµСЂ Р°РєС†РµРЅС‚Сѓ", "РџР»Р°С€РєРё С‚Р° FAB"],
    ["secondaryContainer", "Р”СЂСѓРіРёР№ Р°РєС†РµРЅС‚", "РќР°РІС–РіР°С†С–СЏ С‚Р° РІРёР±СЂР°РЅС– РµР»РµРјРµРЅС‚Рё"],
    ["tertiary", "Р”РѕРґР°С‚РєРѕРІРёР№ Р°РєС†РµРЅС‚", "РџРµСЂРµРґР°С‡С– С‚Р° СЃР»СѓР¶Р±РѕРІС– РјС–С‚РєРё"],
    ["blockAccent", "РђРєС†РµРЅС‚ Р±Р»РѕРєС–РІ", "РќРѕРІС– Р±Р»РѕРєРё С‚Р° РєР°СЂС‚РєРё"],
    ["background", "Р¤РѕРЅ Р·Р°СЃС‚РѕСЃСѓРЅРєСѓ", "РћСЃРЅРѕРІРЅРёР№ С‚РµРјРЅРёР№ С„РѕРЅ"],
    ["surface", "РџРѕРІРµСЂС…РЅС–", "РџР°РЅРµР»С– С‚Р° РєР°СЂС‚РєРё"]
  ];

  els.themeSettings.innerHTML = `
    <div class="theme-mode-toggle" role="radiogroup" aria-label="Theme mode">
      <label class="${theme.mode === "dark" ? "active" : ""}">
        <input type="radio" name="themeMode" data-theme-mode value="dark" ${theme.mode === "dark" ? "checked" : ""} ${editable ? "" : "disabled"}>
        <span>РўРµРјРЅР°</span>
      </label>
      <label class="${theme.mode === "light" ? "active" : ""}">
        <input type="radio" name="themeMode" data-theme-mode value="light" ${theme.mode === "light" ? "checked" : ""} ${editable ? "" : "disabled"}>
        <span>РЎРІС–С‚Р»Р°</span>
      </label>
    </div>
  ` + items.map(([key, label, description]) => `
    <label class="theme-color-field">
      <span>
        <strong>${label}</strong>
        <small>${description}</small>
      </span>
      <input type="color" data-theme-color="${key}" value="${escapeHtml(theme[key])}" ${editable ? "" : "disabled"}>
    </label>
  `).join("");
  els.resetThemeButton.disabled = !editable;
}

function handleThemeInput(event) {
  if (!canManageStructure()) return;
  const modeInput = event.target.closest("[data-theme-mode]");
  if (modeInput) {
    const mode = normalizeThemeMode(modeInput.value);
    state.workspace.settings.theme = structuredClone(themePresets[mode]);
    applyTheme(state.workspace.settings.theme);
    renderThemeSettings();
    scheduleWorkspaceQuietSave();
    return;
  }

  const input = event.target.closest("[data-theme-color]");
  if (!input) return;

  const key = input.dataset.themeColor;
  const theme = getThemeSettings();
  theme[key] = normalizeHexColor(input.value, themePresets[theme.mode][key]);
  state.workspace.settings.theme = theme;
  applyTheme(theme);
  scheduleWorkspaceQuietSave();
}

async function resetTheme() {
  if (!canManageStructure()) return;
  state.workspace.settings.theme = structuredClone(defaultTheme);
  applyTheme(state.workspace.settings.theme);
  renderThemeSettings();
  await persistWorkspace();
  showSnackbar("РўРµРјСѓ СЃРєРёРЅСѓС‚Рѕ");
}

function renderDepartments() {
  const editable = canManageStructure();
  els.addDepartmentButton.disabled = false;
  els.addDepartmentButton.classList.toggle("is-permission-muted", !editable);
  const departments = getDepartments();
  if (!departments.length) {
    els.departmentsList.innerHTML = `
      <div class="empty-state compact">РџС–РґСЂРѕР·РґС–Р»Рё С‰Рµ РЅРµ СЃС‚РІРѕСЂРµРЅС–.</div>
    `;
    return;
  }

  els.departmentsList.innerHTML = departments.map((department) => {
    const assets = getDepartmentAssets(department.id);
    const pendingAssets = getDepartmentPendingAssets(department.id);
    return `
      <article class="department-row md3-card">
        <div class="department-main">
          <input data-department-name="${department.id}" value="${escapeHtml(department.name)}" ${editable ? "" : "disabled"}>
          <label>
            Р’С–РґРїРѕРІС–РґР°Р»СЊРЅРёР№
            <select data-department-responsible="${department.id}" ${editable ? "" : "disabled"}>
              ${renderUserOptions(department.responsibleUid)}
            </select>
          </label>
        </div>
        <div class="department-assets">
          <strong>${assets.length}</strong>
          <span>РѕРґ. РјР°Р№РЅР°</span>
          ${pendingAssets.length ? `<em>${pendingAssets.length} РѕС‡С–РєСѓС” РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ</em>` : ""}
          <small>${assets.length ? assets.slice(0, 4).map((asset) => escapeHtml(asset.title)).join(", ") : "РњР°Р№РЅРѕ С‰Рµ РЅРµ РїРµСЂРµРґР°РЅРѕ"}</small>
        </div>
        <button class="icon-button md3-icon-button" type="button" data-delete-department="${department.id}" ${editable && !assets.length ? "" : "disabled"} title="Р’РёРґР°Р»РёС‚Рё РїС–РґСЂРѕР·РґС–Р»">Г—</button>
      </article>
    `;
  }).join("");
}

function renderDepartmentDetail() {
  if (!els.departmentDetailTitle || !els.departmentDetailList) return;
  const department = getDepartment(state.activeDepartmentId);

  if (!department) {
    els.departmentDetailTitle.textContent = "РџС–РґСЂРѕР·РґС–Р»";
    els.departmentDetailList.innerHTML = `
      <div class="empty-state compact md3-card">РћР±РµСЂС–С‚СЊ РїС–РґСЂРѕР·РґС–Р» Сѓ РјРµРЅСЋ.</div>
    `;
    return;
  }

  const assets = getDepartmentAssets(department.id);
  const pendingAssets = getDepartmentPendingAssets(department.id);
  els.departmentDetailTitle.textContent = department.name;

  if (!assets.length && !pendingAssets.length) {
    els.departmentDetailList.innerHTML = `
      <div class="empty-state compact md3-card">РЈ С†СЊРѕРјСѓ РїС–РґСЂРѕР·РґС–Р»С– С‰Рµ РЅРµРјР°С” РјР°Р№РЅР°.</div>
    `;
    return;
  }

  els.departmentDetailList.innerHTML = `
    <section class="department-detail-summary">
      <article class="department-summary-card md3-card">
        <span>РћС‚СЂРёРјР°РЅРµ РјР°Р№РЅРѕ</span>
        <strong>${assets.length}</strong>
      </article>
      <article class="department-summary-card md3-card">
        <span>РћС‡С–РєСѓС” РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ</span>
        <strong>${pendingAssets.length}</strong>
      </article>
      <article class="department-summary-card md3-card">
        <span>Р’С–РґРїРѕРІС–РґР°Р»СЊРЅРёР№</span>
        <strong>${escapeHtml(getUserLabel(department.responsibleUid) || "РќРµ РїСЂРёР·РЅР°С‡РµРЅРѕ")}</strong>
      </article>
    </section>
    <section class="department-detail-toolbar md3-card">
      <div>
        <strong>РњР°Р№РЅРѕ РїС–РґСЂРѕР·РґС–Р»Сѓ</strong>
        <span>Р“СЂСѓРїСѓРІР°РЅРЅСЏ Р±Р»РѕРєР°РјРё, СЃРѕСЂС‚СѓРІР°РЅРЅСЏ РІСЃРµСЂРµРґРёРЅС– СЃРїРёСЃРєСѓ</span>
      </div>
      <label>
        РЎРѕСЂС‚СѓРІР°РЅРЅСЏ
        <select data-department-sort>
          ${renderDepartmentSortOptions()}
        </select>
      </label>
    </section>
    ${pendingAssets.length ? `
      <section class="department-detail-group">
        <h3>РћС‡С–РєСѓС” РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ</h3>
        ${renderDepartmentAssetBlocks(pendingAssets, true)}
      </section>
    ` : ""}
    ${assets.length ? `
      <section class="department-detail-group">
        <h3>РћС‚СЂРёРјР°РЅРµ РјР°Р№РЅРѕ</h3>
        ${renderDepartmentAssetBlocks(assets, false)}
      </section>
    ` : ""}
  `;
}

function renderDepartmentAssetCard(asset, pending) {
  const transferPending = pending || asset.pendingTransfer;
  const statusText = pending
    ? "РћС‡С–РєСѓС” РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ"
    : asset.pendingTransfer
      ? `РџРµСЂРµРґР°С‡Р°: ${asset.targetDepartmentName}`
      : "РќР° РїС–РґСЂРѕР·РґС–Р»С–";
  return renderAssetCard({
    className: "department-asset-card",
    attrs: `style="--block-accent: ${escapeHtml(asset.blockColor || "#7c5cff")};"`,
    leading: `
      <div class="department-asset-main">
        <div class="department-asset-title">
          <span class="department-asset-avatar">${escapeHtml(getInitials(asset.title))}</span>
          <div>
            <strong>
              ${escapeHtml(asset.title)}
              <span class="department-asset-status ${transferPending ? "pending" : ""}">${escapeHtml(statusText)}</span>
            </strong>
            <span>${escapeHtml(asset.pageName)} / ${escapeHtml(asset.blockTitle)}</span>
          </div>
        </div>
      </div>`,
    body: asset.fields?.length ? `
      <div class="department-asset-fields">
        ${asset.fields.map((field) => `
          <span class="department-asset-field">
            <small>${escapeHtml(field.label)}</small>
            <strong>${escapeHtml(field.value)}</strong>
          </span>
        `).join("")}
      </div>
    ` : "",
    aside: renderDepartmentAssetToolbar(asset, pending, transferPending)
  });
}

function renderDepartmentAssetToolbar(asset, pending, transferPending) {
  const transfer = asset.transfer || null;
  const canConfirm = pending && transfer && canConfirmDepartmentTransfer(transfer);
  const canEdit = canManageAssets();

  return `
    <div class="asset-card-toolbar md3-card">
      <label class="asset-toolbar-transfer">
        <span>${transferPending ? "РћС‡С–РєСѓС” РїРµСЂРµРґР°С‡Сѓ" : "РџРµСЂРµРґР°С‚Рё РІ"}</span>
        <select data-department-asset-transfer="${asset.blockId}:${asset.rowId}:${asset.departmentColumnId}" ${canEdit ? "" : "disabled"}>
          ${renderDepartmentOptions(asset.departmentValue)}
        </select>
      </label>
      <div class="asset-toolbar-actions">
        ${canConfirm ? `
          <button class="button compact md3-button md3-button-filled" type="button" data-confirm-department-transfer="${asset.blockId}:${asset.rowId}">
            РџС–РґС‚РІРµСЂРґРёС‚Рё
          </button>
        ` : ""}
        <button class="icon-button md3-icon-button" type="button" data-duplicate-row="${asset.blockId}:${asset.rowId}" ${canEdit ? "" : "disabled"} title="Р”СѓР±Р»СЋРІР°С‚Рё">в§‰</button>
        <button class="icon-button md3-icon-button" type="button" data-delete-row="${asset.blockId}:${asset.rowId}" ${canEdit ? "" : "disabled"} title="Р’РёРґР°Р»РёС‚Рё">Г—</button>
      </div>
    </div>
  `;
}

function renderDepartmentAssetBlocks(assets, pending) {
  return groupDepartmentAssets(sortDepartmentAssets(assets)).map((group) => `
    <article class="department-asset-block md3-card">
      <header>
        <div>
          <span>${escapeHtml(group.meta)}</span>
          <strong>${escapeHtml(group.title)}</strong>
        </div>
        <em>${group.items.length}</em>
      </header>
      <div class="department-asset-block-list">
        ${group.items.map((asset) => renderDepartmentAssetCard(asset, pending)).join("")}
      </div>
    </article>
  `).join("");
}

function renderDepartmentSortOptions() {
  const options = [
    ["block", "Р—Р° Р±Р»РѕРєРѕРј"],
    ["name", "Р—Р° РЅР°Р·РІРѕСЋ"],
    ["status", "Р—Р° СЃС‚Р°С‚СѓСЃРѕРј"],
    ["table", "Р—Р° С‚Р°Р±Р»РёС†РµСЋ"]
  ];
  return options.map(([value, label]) => (
    `<option value="${value}" ${state.departmentAssetSort === value ? "selected" : ""}>${label}</option>`
  )).join("");
}

function renderTransfers() {
  if (!els.transfersList) return;
  const transfers = getDepartmentTransferRequests();

  if (!transfers.length) {
    els.transfersList.innerHTML = `
      <div class="empty-state compact md3-card">РђРєС‚РёРІРЅРёС… Р·Р°РїРёС‚С–РІ РЅР° РїРµСЂРµРґР°С‡Сѓ РјР°Р№РЅР° РЅРµРјР°С”.</div>
    `;
    return;
  }

  els.transfersList.innerHTML = transfers.map((item) => {
    const canConfirm = canConfirmDepartmentTransfer(item.transfer);
    return renderTransferAssetCard(item, canConfirm);
  }).join("");
}

function renderTransferAssetCard(item, canConfirm) {
  return renderAssetCard({
    className: "transfer-asset-card",
    attrs: `style="--block-accent: ${escapeHtml(item.blockColor || "#7c5cff")};"`,
    leading: `
      <div class="department-asset-main">
        <div class="department-asset-title">
          <span class="department-asset-avatar transfer-icon">в‡„</span>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.pageName)} / ${escapeHtml(item.blockTitle)}</span>
          </div>
        </div>
        ${item.fields?.length ? `
          <div class="department-asset-fields">
            ${item.fields.map((field) => `
              <span class="department-asset-field">
                <small>${escapeHtml(field.label)}</small>
                <strong>${escapeHtml(field.value)}</strong>
              </span>
            `).join("")}
          </div>
        ` : ""}
      </div>`,
    body: `
      <div class="transfer-route">
        <span class="transfer-route-item">
          <small>Р—РІС–РґРєРё</small>
          <strong>${escapeHtml(item.fromDepartmentName)}</strong>
        </span>
        <span class="transfer-route-arrow">в†’</span>
        <span class="transfer-route-item">
          <small>РљСѓРґРё</small>
          <strong>${escapeHtml(item.targetDepartmentName)}</strong>
          ${item.responsibleName ? `<em>Р’С–РґРїРѕРІС–РґР°Р»СЊРЅРёР№: ${escapeHtml(item.responsibleName)}</em>` : ""}
        </span>
        <span class="transfer-route-item">
          <small>Р—Р°РїРёС‚ СЃС‚РІРѕСЂРёРІ</small>
          <strong>${escapeHtml(item.requestedByName || "РљРѕСЂРёСЃС‚СѓРІР°С‡")}</strong>
          ${item.requestedAt ? `<em>${escapeHtml(formatDateTime(item.requestedAt))}</em>` : ""}
        </span>
      </div>`,
    actions: `
      <div class="transfer-actions">
        ${canConfirm ? `
          <button class="button compact md3-button md3-button-filled" type="button" data-confirm-department-transfer="${item.blockId}:${item.rowId}">
            РџС–РґС‚РІРµСЂРґРёС‚Рё
          </button>
        ` : `<span class="transfer-waiting">РћС‡С–РєСѓС” РІС–РґРїРѕРІС–РґР°Р»СЊРЅРѕРіРѕ</span>`}
      </div>`
  });
}

function renderTransferIndicators() {
  const count = getDepartmentTransferRequests().length;
  document.querySelectorAll("[data-transfer-count]").forEach((badge) => {
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.classList.toggle("hidden", count === 0);
  });
}

function renderBlockTemplateOptions() {
  const blocks = getActivePage().blocks.filter((block) => block.columns.length);
  els.blockTemplateSelect.innerHTML = `
    <option value="">РџРѕСЂРѕР¶РЅС–Р№ Р±Р»РѕРє</option>
    ${blocks.map((block) => `<option value="${block.id}">${escapeHtml(block.title)} (${block.columns.length})</option>`).join("")}
  `;
}

function renderUsers() {
  if (!isAdmin()) {
    els.adminPanel.classList.add("hidden");
    return;
  }

  els.adminPanel.classList.remove("hidden");
  els.usersList.innerHTML = state.users.map((user) => `
    <div class="user-row">
      <div>
        <strong>${escapeHtml(user.name || user.email || user.uid)}</strong>
        <span>${escapeHtml(user.email || user.uid)}</span>
        <small>${escapeHtml(getRoleDescription(user.role))}</small>
      </div>
      <select data-role-user="${user.uid}">
        ${Object.entries(roleDefinitions).map(([role, info]) => `
          <option value="${role}" ${normalizeRole(user.role) === role ? "selected" : ""}>${info.label}</option>
        `).join("")}
      </select>
    </div>
  `).join("");
}

function openPageDialog() {
  if (!canManageStructure()) return;
  els.pageForm.reset();
  els.pageDialog.showModal();
}

function openBlockDialog() {
  if (!canManageStructure()) return;
  els.blockForm.reset();
  renderBlockTemplateOptions();
  els.blockDialog.showModal();
}

function openColumnDialog(blockId) {
  if (!canManageStructure()) return;
  els.columnForm.reset();
  els.columnBlockId.value = blockId;
  els.columnDialog.showModal();
}

function openRowDialog(blockId) {
  if (!canManageAssets()) return;
  const block = getBlock(blockId);
  if (!block || !block.columns.length) return;

  els.rowForm.reset();
  els.rowBlockId.value = blockId;
  els.rowFields.innerHTML = block.columns.map((column) => renderRowField(column, block)).join("");
  els.rowDialog.showModal();
}

async function addPage(event) {
  event.preventDefault();
  if (!canManageStructure()) return;

  const form = new FormData(els.pageForm);
  const name = String(form.get("name") || "").trim();
  if (!name) return;

  const page = {
    id: createId("page"),
    name,
    icon: "в–¦",
    blocks: [createDefaultBlock("РћСЃРЅРѕРІРЅР° С‚Р°Р±Р»РёС†СЏ")]
  };
  state.workspace.pages.push(page);
  state.workspace.activePageId = page.id;
  state.view = "page";
  els.pageDialog.close();
  await persistWorkspace();
  showSnackbar("РўР°Р±Р»РёС†СЋ СЃС‚РІРѕСЂРµРЅРѕ");
}

async function addBlock(event) {
  event.preventDefault();
  if (!canManageStructure()) return;

  const form = new FormData(els.blockForm);
  const title = String(form.get("title") || "").trim();
  const badge = String(form.get("badge") || "").trim();
  const filterStatus = String(form.get("filterStatus") || badge || title).trim();
  const color = normalizeBlockColor(form.get("color"));
  const templateBlockId = String(form.get("templateBlockId") || "");
  if (!title) return;

  const block = createDefaultBlock(title, { badge, filterStatus, color });
  const templateBlock = getBlock(templateBlockId);
  if (templateBlock?.columns?.length) {
    block.columns = cloneColumnsForNewBlock(templateBlock.columns);
  }
  getActivePage().blocks.push(block);
  state.openBlockSettings.add(block.id);
  els.blockDialog.close();
  await persistWorkspace();
  showSnackbar("Р‘Р»РѕРє РґРѕРґР°РЅРѕ");
}

async function addColumn(event) {
  event.preventDefault();
  if (!canManageStructure()) return;

  const form = new FormData(els.columnForm);
  const blockId = String(form.get("blockId"));
  const label = String(form.get("label") || "").trim();
  const type = String(form.get("type") || "text");
  const block = getBlock(blockId);
  if (!block || !label) return;

  const column = createColumn(label, type, block);
  block.columns.push(column);
  block.rows.forEach((row) => {
    row.values[column.id] = getEmptyValue(type, block, column);
  });
  els.columnDialog.close();
  await persistWorkspace();
  showSnackbar("РџРѕР»Рµ РґРѕРґР°РЅРѕ");
}

async function addPresetColumn(ref) {
  if (!canManageStructure()) return;
  const [blockId, preset] = ref.split(":");
  const block = getBlock(blockId);
  if (!block) return;

  const presetMap = {
    name: ["РќР°Р·РІР°", "text"],
    serial: ["РЎРµСЂС–Р№РЅРёР№ РЅРѕРјРµСЂ", "text"],
    quantity: ["РљС–Р»СЊРєС–СЃС‚СЊ", "number"],
    status: ["РЎС‚Р°С‚СѓСЃ", "status"],
    block: ["Р‘Р»РѕРє", "block"],
    department: ["РџС–РґСЂРѕР·РґС–Р»", "department"],
    checkbox: ["Р“РѕС‚РѕРІРЅС–СЃС‚СЊ", "checkbox"],
    date: ["Р”Р°С‚Р°", "date"]
  };
  const [label, type] = presetMap[preset] || ["РќРѕРІРµ РїРѕР»Рµ", "text"];
  const column = createColumn(label, type, block);
  block.columns.push(column);
  block.rows.forEach((row) => {
    row.values[column.id] = getEmptyValue(column.type, block, column);
  });
  await persistWorkspace();
  showSnackbar("РџРѕР»Рµ РґРѕРґР°РЅРѕ");
}

async function addRow(event) {
  event.preventDefault();
  if (!canManageAssets()) return;

  const form = new FormData(els.rowForm);
  const blockId = String(form.get("blockId"));
  const block = getBlock(blockId);
  if (!block) return;

  const values = Object.fromEntries(block.columns.map((column) => {
    if (column.type === "checkbox") return [column.id, form.get(column.id) === "on"];
    const rawValue = form.get(column.id);
    return [column.id, normalizeValue(rawValue, column.type, column)];
  }));

  const row = { id: crypto.randomUUID(), values };
  block.rows.push(row);
  routeRowByBlockField(block.id, row);
  els.rowDialog.close();
  await persistWorkspace();
  showSnackbar("Р СЏРґРѕРє СЃС‚РІРѕСЂРµРЅРѕ");
}

function renderRowField(column, block) {
  if (isBlockMoveColumn(column)) {
    return `
      <label>
        ${escapeHtml(column.label)}
        <select name="${column.id}">
          ${renderBlockOptions(block, block.id)}
        </select>
      </label>
    `;
  }

  if (column.type === "status") {
    return `
      <label>
        ${escapeHtml(column.label)}
        <select name="${column.id}">
          ${renderStatusOptions(column, getEmptyValue(column.type, block, column))}
        </select>
      </label>
    `;
  }

  if (column.type === "department") {
    return `
      <label>
        ${escapeHtml(column.label)}
        <select name="${column.id}">
          ${renderDepartmentOptions(getEmptyValue(column.type, block, column))}
        </select>
      </label>
    `;
  }

  if (column.type === "checkbox") {
    return `
      <label>
        ${escapeHtml(column.label)}
        <input name="${column.id}" type="checkbox">
      </label>
    `;
  }

  return `
    <label>
      ${escapeHtml(column.label)}
      <input name="${column.id}" type="${getInputType(column.type)}" value="${escapeHtml(String(getEmptyValue(column.type, block, column)))}">
    </label>
  `;
}

function handlePagesClick(event) {
  const deletePageButton = event.target.closest("[data-delete-page]");
  if (deletePageButton) {
    deletePage(deletePageButton.dataset.deletePage);
    return;
  }

  const pageButton = event.target.closest("[data-page-id]");
  if (!pageButton) return;
  state.workspace.activePageId = pageButton.dataset.pageId;
  state.view = "page";
  closeBottomSheet();
  render();
}

function handleBlocksClick(event) {
  if (!event.target.closest("[data-block-dropdown]")) {
    closeBlockDropdowns();
  }

  const productSelectOption = event.target.closest("[data-set-product-select]");
  if (productSelectOption) {
    setProductDropdownValue(productSelectOption.dataset.setProductSelect, productSelectOption.dataset.selectValue);
    return;
  }

  const productSelectToggle = event.target.closest("[data-toggle-product-select]");
  if (productSelectToggle) {
    toggleProductDropdown(productSelectToggle.dataset.toggleProductSelect);
    return;
  }

  const blockDropdownOption = event.target.closest("[data-set-block-cell]");
  if (blockDropdownOption) {
    setBlockDropdownValue(blockDropdownOption.dataset.setBlockCell, blockDropdownOption.dataset.blockValue);
    return;
  }

  const blockDropdownToggle = event.target.closest("[data-toggle-block-dropdown]");
  if (blockDropdownToggle) {
    toggleBlockDropdown(blockDropdownToggle.dataset.toggleBlockDropdown);
    return;
  }

  const toggleCollapseButton = event.target.closest("[data-toggle-block-collapse]");
  if (toggleCollapseButton) {
    toggleBlockCollapse(toggleCollapseButton.dataset.toggleBlockCollapse);
    return;
  }

  const quickEditTitleButton = event.target.closest("[data-quick-edit-block-title]");
  if (quickEditTitleButton) {
    quickEditBlockTitle(quickEditTitleButton.dataset.quickEditBlockTitle);
    return;
  }

  const toggleSettingsButton = event.target.closest("[data-toggle-block-settings]");
  if (toggleSettingsButton) {
    toggleBlockSettings(toggleSettingsButton.dataset.toggleBlockSettings);
    return;
  }

  const addColumnButton = event.target.closest("[data-add-column]");
  if (addColumnButton) {
    openColumnDialog(addColumnButton.dataset.addColumn);
    return;
  }

  const addPresetColumnButton = event.target.closest("[data-add-preset-column]");
  if (addPresetColumnButton) {
    addPresetColumn(addPresetColumnButton.dataset.addPresetColumn);
    return;
  }

  const addRowButton = event.target.closest("[data-add-row]");
  if (addRowButton) {
    openRowDialog(addRowButton.dataset.addRow);
    return;
  }

  const deleteRowButton = event.target.closest("[data-delete-row]");
  if (deleteRowButton) {
    deleteRow(deleteRowButton.dataset.deleteRow);
    return;
  }

  const duplicateRowButton = event.target.closest("[data-duplicate-row]");
  if (duplicateRowButton) {
    duplicateRow(duplicateRowButton.dataset.duplicateRow);
    return;
  }

  const confirmDepartmentTransferButton = event.target.closest("[data-confirm-department-transfer]");
  if (confirmDepartmentTransferButton) {
    confirmDepartmentTransfer(confirmDepartmentTransferButton.dataset.confirmDepartmentTransfer);
    return;
  }

  const clearSelectionButton = event.target.closest("[data-clear-selection]");
  if (clearSelectionButton) {
    clearSelectedRowsForBlock(clearSelectionButton.dataset.clearSelection);
    return;
  }

  const bulkTransferButton = event.target.closest("[data-open-bulk-transfer]");
  if (bulkTransferButton) {
    openBulkTransferDialog(bulkTransferButton.dataset.openBulkTransfer);
    return;
  }

  const deleteColumnButton = event.target.closest("[data-delete-column]");
  if (deleteColumnButton) {
    deleteColumn(deleteColumnButton.dataset.deleteColumn);
    return;
  }

  const deleteBlockButton = event.target.closest("[data-delete-block]");
  if (deleteBlockButton) {
    deleteBlock(deleteBlockButton.dataset.deleteBlock);
  }
}

function handleBlocksChange(event) {
  const selectProduct = event.target.closest("[data-select-product]");
  if (selectProduct) {
    toggleProductSelection(selectProduct.dataset.selectProduct, selectProduct.checked);
    return;
  }

  const blockTitle = event.target.closest("[data-block-title]");
  if (blockTitle) {
    if (!canManageStructure()) return;
    updateBlockTitle(blockTitle.dataset.blockTitle, blockTitle.value);
    return;
  }

  const blockBadge = event.target.closest("[data-block-badge]");
  if (blockBadge) {
    if (!canManageStructure()) return;
    updateBlockMeta(blockBadge.dataset.blockBadge, { badge: blockBadge.value });
    return;
  }

  const blockFilterStatus = event.target.closest("[data-block-filter-status]");
  if (blockFilterStatus) {
    if (!canManageStructure()) return;
    updateBlockMeta(blockFilterStatus.dataset.blockFilterStatus, { filterStatus: blockFilterStatus.value });
    return;
  }

  const blockColor = event.target.closest("[data-block-color]");
  if (blockColor) {
    if (!canManageStructure()) return;
    updateBlockMeta(blockColor.dataset.blockColor, { color: blockColor.value });
    return;
  }

  const labelInput = event.target.closest("[data-column-label]");
  if (labelInput) {
    if (!canManageStructure()) return;
    updateColumnLabel(labelInput.dataset.columnLabel, labelInput.value);
    return;
  }

  const typeSelect = event.target.closest("[data-column-type]");
  if (typeSelect) {
    if (!canManageStructure()) return;
    updateColumnType(typeSelect.dataset.columnType, typeSelect.value);
    return;
  }

  const optionsInput = event.target.closest("[data-column-options]");
  if (optionsInput) {
    if (!canManageStructure()) return;
    updateColumnOptions(optionsInput.dataset.columnOptions, optionsInput.value);
    return;
  }

  if (!canManageAssets()) return;
  const descriptionInput = event.target.closest("[data-row-description]");
  if (descriptionInput) {
    updateRowDescription(descriptionInput);
    persistWorkspace();
    return;
  }

  const cell = event.target.closest("[data-cell]");
  if (!cell) return;

  const [blockId, rowId, columnId] = cell.dataset.cell.split(":");
  const block = getBlock(blockId);
  const row = block?.rows.find((item) => item.id === rowId);
  const column = block?.columns.find((item) => item.id === columnId);
  if (!block || !row || !column) return;

  if (column.type === "department") {
    requestDepartmentTransfer(block, row, column, cell.value);
    return;
  }

  row.values[columnId] = column.type === "checkbox" ? cell.checked : normalizeValue(cell.value, column.type, column);
  if (isBlockMoveColumn(column)) {
    routeRowByBlockField(blockId, row);
    persistWorkspace();
    return;
  }
  persistWorkspace();
}

function handleBlocksInput(event) {
  if (!canManageAssets()) return;
  const descriptionInput = event.target.closest("[data-row-description]");
  if (descriptionInput) {
    updateRowDescription(descriptionInput);
    scheduleWorkspaceQuietSave();
    return;
  }

  const cell = event.target.closest("[data-live-cell][data-cell]");
  if (!cell) return;

  const [blockId, rowId, columnId] = cell.dataset.cell.split(":");
  const block = getBlock(blockId);
  const row = block?.rows.find((item) => item.id === rowId);
  const column = block?.columns.find((item) => item.id === columnId);
  if (!block || !row || !column || column.type === "department" || isBlockMoveColumn(column)) return;

  row.values[columnId] = normalizeValue(cell.value, column.type, column);
  scheduleWorkspaceQuietSave();
}

function updateRowDescription(input) {
  const card = input.closest("[data-drag-row]");
  const ref = card?.dataset.dragRow;
  if (!ref) return;
  const [blockId, rowId] = ref.split(":");
  const block = getBlock(blockId);
  const row = block?.rows.find((item) => item.id === rowId);
  if (!row) return;
  row.description = String(input.value || "");
}

function scheduleWorkspaceQuietSave() {
  window.clearTimeout(state.cellInputTimer);
  state.cellInputTimer = window.setTimeout(() => {
    persistWorkspaceQuiet();
  }, 420);
}

function toggleBlockDropdown(fieldRef) {
  const target = els.blocksList.querySelector(`[data-block-dropdown-menu="${cssEscape(fieldRef)}"]`);
  if (!target) return;
  closeProductDropdowns(fieldRef);
  els.blocksList.querySelectorAll("[data-block-dropdown-menu]").forEach((menu) => {
    if (menu !== target) menu.classList.add("hidden");
  });
  target.classList.toggle("hidden");
}

function closeBlockDropdowns() {
  els.blocksList.querySelectorAll("[data-block-dropdown-menu]").forEach((menu) => {
    menu.classList.add("hidden");
  });
  closeProductDropdowns();
}

function toggleProductDropdown(fieldRef) {
  const target = els.blocksList.querySelector(`[data-product-select-menu="${cssEscape(fieldRef)}"]`);
  if (!target) return;
  els.blocksList.querySelectorAll("[data-block-dropdown-menu]").forEach((menu) => {
    menu.classList.add("hidden");
  });
  closeProductDropdowns(fieldRef);
  target.classList.toggle("hidden");
}

function closeProductDropdowns(exceptRef = "") {
  els.blocksList.querySelectorAll("[data-product-select-menu]").forEach((menu) => {
    if (menu.dataset.productSelectMenu !== exceptRef) {
      menu.classList.add("hidden");
    }
  });
}

async function setBlockDropdownValue(fieldRef, value) {
  if (!canManageAssets()) return;
  const [blockId, rowId, columnId] = fieldRef.split(":");
  const block = getBlock(blockId);
  const row = block?.rows.find((item) => item.id === rowId);
  const column = block?.columns.find((item) => item.id === columnId);
  if (!block || !row || !column || !isBlockMoveColumn(column)) return;

  row.values[columnId] = normalizeValue(value, column.type, column);
  routeRowByBlockField(blockId, row);
  closeBlockDropdowns();
  await persistWorkspace();
}

async function setProductDropdownValue(fieldRef, value) {
  if (!canManageAssets()) return;
  const [blockId, rowId, columnId] = fieldRef.split(":");
  const block = getBlock(blockId);
  const row = block?.rows.find((item) => item.id === rowId);
  const column = block?.columns.find((item) => item.id === columnId);
  if (!block || !row || !column) return;

  closeBlockDropdowns();
  if (column.type === "department") {
    await requestDepartmentTransfer(block, row, column, value);
    return;
  }

  row.values[columnId] = normalizeValue(value, column.type, column);
  await persistWorkspace();
}

function handleUsersChange(event) {
  const select = event.target.closest("[data-role-user]");
  if (!select) return;
  persistUserRole(select.dataset.roleUser, select.value);
}

function handleDepartmentsClick(event) {
  const deleteButton = event.target.closest("[data-delete-department]");
  if (!deleteButton) return;
  deleteDepartment(deleteButton.dataset.deleteDepartment);
}

function handleDepartmentsNavClick(event) {
  const deleteButton = event.target.closest("[data-delete-department]");
  if (deleteButton) {
    event.stopPropagation();
    deleteDepartment(deleteButton.dataset.deleteDepartment);
    return;
  }

  const departmentButton = event.target.closest("[data-open-department]");
  if (!departmentButton) return;
  openDepartmentDetail(departmentButton.dataset.openDepartment);
}

function handleDepartmentsChange(event) {
  const nameInput = event.target.closest("[data-department-name]");
  if (nameInput) {
    updateDepartment(nameInput.dataset.departmentName, { name: nameInput.value });
    return;
  }

  const responsibleSelect = event.target.closest("[data-department-responsible]");
  if (responsibleSelect) {
    updateDepartment(responsibleSelect.dataset.departmentResponsible, { responsibleUid: responsibleSelect.value });
  }
}

function handleDepartmentDetailChange(event) {
  const sortSelect = event.target.closest("[data-department-sort]");
  if (sortSelect) {
    state.departmentAssetSort = sortSelect.value;
    renderDepartmentDetail();
    return;
  }

  const transferSelect = event.target.closest("[data-department-asset-transfer]");
  if (!transferSelect) return;

  const [blockId, rowId, columnId] = transferSelect.dataset.departmentAssetTransfer.split(":");
  const block = getBlockAcrossWorkspace(blockId);
  const row = block?.rows.find((item) => item.id === rowId);
  const column = block?.columns.find((item) => item.id === columnId && item.type === "department");
  if (!block || !row || !column) {
    showSnackbar("РќРµ РІРґР°Р»РѕСЃСЏ Р·РЅР°Р№С‚Рё РјР°Р№РЅРѕ РґР»СЏ РїРµСЂРµРґР°С‡С–", "error");
    renderDepartmentDetail();
    return;
  }

  requestDepartmentTransfer(block, row, column, transferSelect.value);
}

function handleDepartmentDetailClick(event) {
  const confirmButton = event.target.closest("[data-confirm-department-transfer]");
  if (confirmButton) {
    confirmDepartmentTransfer(confirmButton.dataset.confirmDepartmentTransfer);
    return;
  }

  const duplicateRowButton = event.target.closest("[data-duplicate-row]");
  if (duplicateRowButton) {
    duplicateRow(duplicateRowButton.dataset.duplicateRow);
    return;
  }

  const deleteRowButton = event.target.closest("[data-delete-row]");
  if (deleteRowButton) {
    deleteRow(deleteRowButton.dataset.deleteRow);
  }
}

function handleTransfersClick(event) {
  const confirmButton = event.target.closest("[data-confirm-department-transfer]");
  if (!confirmButton) return;
  confirmDepartmentTransfer(confirmButton.dataset.confirmDepartmentTransfer);
}

function handleDragPointerDown(event) {
  clearDragArmed();
  const handle = event.target.closest("[data-drag-handle]");
  if (!handle) return;

  const source = handle.closest("[data-drag-column], [data-drag-row]");
  source?.classList.add("md3-drag-armed");
}

function handleDragStart(event) {
  const column = event.target.closest("[data-drag-column]");
  const row = event.target.closest("[data-drag-row]");
  if (column && !canManageStructure()) return;
  if (row && !canManageAssets()) return;
  const source = column || row;
  if (!source?.classList.contains("md3-drag-armed")) {
    event.preventDefault();
    return;
  }

  const handle = source.querySelector("[data-drag-handle]");
  const ref = column?.dataset.dragColumn || row?.dataset.dragRow;
  const type = column ? "column" : row ? "row" : "";
  if (!ref || !type) return;

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", `${type}:${ref}`);
  event.dataTransfer.setDragImage?.(handle, 10, 10);
  source.classList.remove("md3-drag-armed");
  source.classList.add("dragging");
  els.blocksList.classList.add("md3-drag-active");
}

function handleDragOver(event) {
  const target = event.target.closest("[data-drag-column], [data-drag-row]");
  if (!target) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  setDropTarget(target);
}

function handleDragLeave(event) {
  const target = event.target.closest("[data-drag-column], [data-drag-row]");
  if (!target || target.contains(event.relatedTarget)) return;
  target.classList.remove("md3-drop-target");
}

function handleDrop(event) {
  const targetColumn = event.target.closest("[data-drag-column]");
  const targetRow = event.target.closest("[data-drag-row]");
  if (targetColumn && !canManageStructure()) return;
  if (targetRow && !canManageAssets()) return;
  const payload = event.dataTransfer.getData("text/plain");
  if (!payload) return;

  const [type, blockId, itemId] = payload.split(":");
  const targetRef = targetColumn?.dataset.dragColumn || targetRow?.dataset.dragRow || "";
  const [targetBlockId, targetItemId] = targetRef.split(":");
  if (!type || !blockId || !itemId || blockId !== targetBlockId || itemId === targetItemId) {
    clearDragState();
    return;
  }

  event.preventDefault();
  if (type === "column" && targetColumn) {
    reorderBlockItem(blockId, "columns", itemId, targetItemId);
  }
  if (type === "row" && targetRow) {
    reorderBlockItem(blockId, "rows", itemId, targetItemId);
  }
  clearDragState();
}

function handleDragEnd() {
  clearDragState();
}

function setDropTarget(target) {
  els.blocksList.querySelectorAll(".md3-drop-target").forEach((item) => {
    if (item !== target) item.classList.remove("md3-drop-target");
  });
  if (!target.classList.contains("dragging")) {
    target.classList.add("md3-drop-target");
  }
}

function clearDragState() {
  els.blocksList.classList.remove("md3-drag-active");
  els.blocksList.querySelectorAll(".dragging, .md3-drop-target, .md3-drag-armed").forEach((item) => {
    item.classList.remove("dragging", "md3-drop-target", "md3-drag-armed");
  });
}

function clearDragArmed() {
  els.blocksList.querySelectorAll(".md3-drag-armed").forEach((item) => {
    item.classList.remove("md3-drag-armed");
  });
}

async function deletePage(pageId) {
  if (!canManageStructure() || state.workspace.pages.length <= 1) return;
  state.workspace.pages = state.workspace.pages.filter((page) => page.id !== pageId);
  if (state.workspace.activePageId === pageId) {
    state.workspace.activePageId = state.workspace.pages[0].id;
  }
  await persistWorkspace();
  showSnackbar("РўР°Р±Р»РёС†СЋ РІРёРґР°Р»РµРЅРѕ");
}

async function deleteBlock(blockId) {
  if (!canManageStructure()) return;
  const page = getActivePage();
  if (page.blocks.length <= 1) return;
  page.blocks = page.blocks.filter((block) => block.id !== blockId);
  await persistWorkspace();
  showSnackbar("Р‘Р»РѕРє РІРёРґР°Р»РµРЅРѕ");
}

async function deleteRow(ref) {
  if (!canManageAssets()) return;
  const [blockId, rowId] = ref.split(":");
  const block = getBlock(blockId) || getBlockAcrossWorkspace(blockId);
  if (!block) return;
  block.rows = block.rows.filter((row) => row.id !== rowId);
  state.selectedProductRefs.delete(getRowRef(blockId, rowId));
  await persistWorkspace();
  showSnackbar("Р СЏРґРѕРє РІРёРґР°Р»РµРЅРѕ");
}

async function duplicateRow(ref) {
  if (!canManageAssets()) return;
  const [blockId, rowId] = ref.split(":");
  const block = getBlock(blockId) || getBlockAcrossWorkspace(blockId);
  const sourceIndex = block?.rows.findIndex((row) => row.id === rowId) ?? -1;
  if (!block || sourceIndex < 0) return;

  const sourceRow = block.rows[sourceIndex];
  const row = {
    id: crypto.randomUUID(),
    values: structuredClone(sourceRow.values || {}),
    description: String(sourceRow.description || "")
  };
  block.rows.splice(sourceIndex + 1, 0, row);
  await persistWorkspace();
  showSnackbar("Р СЏРґРѕРє РїСЂРѕРґСѓР±Р»СЊРѕРІР°РЅРѕ");
}

function getRowRef(blockId, rowId) {
  return `${blockId}:${rowId}`;
}

function toggleProductSelection(ref, selected) {
  if (selected) {
    state.selectedProductRefs.add(ref);
  } else {
    state.selectedProductRefs.delete(ref);
  }
  renderBlocks();
}

function getSelectedRowsForBlock(block) {
  return block.rows
    .map((row) => ({ block, row, ref: getRowRef(block.id, row.id) }))
    .filter((item) => state.selectedProductRefs.has(item.ref));
}

function clearSelectedRowsForBlock(blockId) {
  [...state.selectedProductRefs].forEach((ref) => {
    if (ref.startsWith(`${blockId}:`)) state.selectedProductRefs.delete(ref);
  });
  renderBlocks();
}

function openBulkTransferDialog(blockId) {
  const block = getBlock(blockId);
  if (!block) return;
  const items = getSelectedRowsForBlock(block).filter(({ row }) => block.rows.includes(row));
  const departmentColumn = block.columns.find((column) => column.type === "department");
  if (!departmentColumn) {
    showSnackbar("Додайте поле Підрозділ для передачі майна", "error");
    return;
  }
  if (!items.length) {
    showSnackbar("Виберіть товари для передачі", "error");
    return;
  }

  els.bulkTransferDepartment.innerHTML = getDepartments().map((department) => (
    `<option value="${department.id}">${escapeHtml(department.name)}</option>`
  )).join("");
  els.bulkTransferItems.innerHTML = items.map(({ row, ref }, index) => renderBulkTransferItem(block, row, ref, index)).join("");
  els.bulkTransferDialog.showModal();
}

function renderBulkTransferItem(block, row, ref, index) {
  const titleColumn = getPrimaryColumn(block);
  const quantityColumn = getQuantityColumn(block);
  const title = titleColumn ? row.values?.[titleColumn.id] || `Товар ${index + 1}` : `Товар ${index + 1}`;
  const quantity = quantityColumn ? Number(row.values?.[quantityColumn.id] || 0) : 0;
  return `
    <article class="bulk-transfer-item">
      <input type="hidden" name="ref_${index}" value="${escapeHtml(ref)}">
      <div>
        <strong>${escapeHtml(String(title))}</strong>
        ${quantityColumn ? `<span>${escapeHtml(quantityColumn.label)}: ${formatNumber(quantity)}</span>` : `<span>Без поля кількості</span>`}
      </div>
      ${quantityColumn && quantity > 1 ? `
        <label class="bulk-quantity-mode">
          <input type="radio" name="qtyMode_${index}" value="all" checked>
          <span>Всю кількість</span>
        </label>
        <label class="bulk-quantity-mode">
          <input type="radio" name="qtyMode_${index}" value="partial">
          <span>Частину</span>
          <input name="qty_${index}" type="number" min="1" max="${quantity}" value="1">
        </label>
      ` : `
        <input type="hidden" name="qtyMode_${index}" value="all">
      `}
    </article>
  `;
}

async function submitBulkTransfer(event) {
  event.preventDefault();
  if (!canManageAssets()) return;

  const form = new FormData(els.bulkTransferForm);
  const targetDepartmentId = normalizeDepartmentValue(form.get("departmentId"));
  if (!targetDepartmentId) {
    showSnackbar("Виберіть підрозділ отримувач", "error");
    return;
  }

  const refs = [...form.keys()]
    .filter((key) => key.startsWith("ref_"))
    .sort((a, b) => Number(a.split("_")[1]) - Number(b.split("_")[1]))
    .map((key) => [Number(key.split("_")[1]), String(form.get(key) || "")]);

  let count = 0;
  for (const [index, ref] of refs) {
    const [blockId, rowId] = ref.split(":");
    const block = getBlock(blockId);
    const row = block?.rows.find((item) => item.id === rowId);
    const column = block?.columns.find((item) => item.type === "department");
    if (!block || !row || !column) continue;

    const quantityColumn = getQuantityColumn(block);
    const availableQuantity = quantityColumn ? Number(row.values?.[quantityColumn.id] || 0) : 0;
    const mode = String(form.get(`qtyMode_${index}`) || "all");
    const requestedQuantity = mode === "partial" && quantityColumn
      ? Math.max(1, Math.min(Number(form.get(`qty_${index}`) || 1), availableQuantity || 1))
      : null;

    await requestDepartmentTransfer(block, row, column, targetDepartmentId, { quantity: requestedQuantity, quantityColumnId: quantityColumn?.id || "", silent: true });
    count += 1;
  }

  els.bulkTransferDialog.close();
  state.selectedProductRefs.clear();
  await persistWorkspace();
  showSnackbar(`Передачу створено: ${count}`);
}
async function requestDepartmentTransfer(block, row, column, rawValue, options = {}) {
  if (!canManageAssets()) return;

  const targetDepartmentId = normalizeDepartmentValue(rawValue);
  const currentDepartmentId = normalizeDepartmentValue(row.values?.[column.id]);

  if (!targetDepartmentId) {
    row.values[column.id] = "";
    if (row.pendingDepartmentTransfer?.columnId === column.id) {
      delete row.pendingDepartmentTransfer;
    }
    if (!options.silent) {
      await persistWorkspace();
      showSnackbar("РџС–РґСЂРѕР·РґС–Р» РїСЂРёР±СЂР°РЅРѕ");
    }
    return;
  }

  if (targetDepartmentId === currentDepartmentId) {
    if (row.pendingDepartmentTransfer?.columnId === column.id) {
      delete row.pendingDepartmentTransfer;
      await persistWorkspace();
    } else {
      renderBlocks();
    }
    return;
  }

  row.pendingDepartmentTransfer = {
    columnId: column.id,
    fromDepartmentId: currentDepartmentId,
    targetDepartmentId,
    quantity: options.quantity ? Number(options.quantity) : null,
    quantityColumnId: String(options.quantityColumnId || ""),
    requestedBy: state.user?.uid || "",
    requestedAt: new Date().toISOString()
  };

  if (!options.silent) {
    await persistWorkspace();
    showSnackbar("РџРµСЂРµРґР°С‡Сѓ РІС–РґРїСЂР°РІР»РµРЅРѕ РЅР° РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ");
  }
}

async function confirmDepartmentTransfer(ref) {
  const [blockId, rowId] = ref.split(":");
  const block = getBlock(blockId);
  const row = block?.rows.find((item) => item.id === rowId);
  const transfer = getPendingDepartmentTransfer(row);
  const column = block?.columns.find((item) => item.id === transfer?.columnId && item.type === "department");

  if (!block || !row || !transfer || !column) {
    showSnackbar("РќРµРјР°С” Р°РєС‚РёРІРЅРѕС— РїРµСЂРµРґР°С‡С– РґР»СЏ РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ", "error");
    return;
  }

  if (!canConfirmDepartmentTransfer(transfer)) {
    showSnackbar("РџС–РґС‚РІРµСЂРґРёС‚Рё РјРѕР¶Рµ РІС–РґРїРѕРІС–РґР°Р»СЊРЅРёР№ РїС–РґСЂРѕР·РґС–Р»Сѓ, РєРµСЂС–РІРЅРёРє Р°Р±Рѕ Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂ", "error");
    return;
  }

  applyConfirmedDepartmentTransfer(block, row, column, transfer);
  row.departmentTransferHistory ??= [];
  row.departmentTransferHistory.push({
    ...transfer,
    confirmedBy: state.user?.uid || "",
    confirmedAt: new Date().toISOString()
  });
  delete row.pendingDepartmentTransfer;

  await persistWorkspace();
  showSnackbar("РћС‚СЂРёРјР°РЅРЅСЏ РјР°Р№РЅР° РїС–РґС‚РІРµСЂРґР¶РµРЅРѕ");
}

function applyConfirmedDepartmentTransfer(block, row, departmentColumn, transfer) {
  const quantityColumn = transfer.quantityColumnId
    ? block.columns.find((column) => column.id === transfer.quantityColumnId)
    : getQuantityColumn(block);
  const availableQuantity = quantityColumn ? Number(row.values?.[quantityColumn.id] || 0) : 0;
  const transferQuantity = transfer.quantity ? Number(transfer.quantity) : null;

  if (quantityColumn && transferQuantity && transferQuantity > 0 && availableQuantity > transferQuantity) {
    row.values[quantityColumn.id] = availableQuantity - transferQuantity;
    const transferredRow = {
      id: crypto.randomUUID(),
      values: structuredClone(row.values || {}),
      description: String(row.description || ""),
      departmentTransferHistory: structuredClone(row.departmentTransferHistory || [])
    };
    transferredRow.values[quantityColumn.id] = transferQuantity;
    transferredRow.values[departmentColumn.id] = transfer.targetDepartmentId;
    delete transferredRow.pendingDepartmentTransfer;
    const sourceIndex = block.rows.findIndex((item) => item.id === row.id);
    block.rows.splice(sourceIndex + 1, 0, transferredRow);
    return;
  }

  row.values[departmentColumn.id] = transfer.targetDepartmentId;
}

async function deleteColumn(ref) {
  if (!canManageStructure()) return;
  const [blockId, columnId] = ref.split(":");
  const block = getBlock(blockId);
  if (!block) return;

  block.columns = block.columns.filter((column) => column.id !== columnId);
  block.rows.forEach((row) => {
    delete row.values[columnId];
  });
  await persistWorkspace();
  showSnackbar("РџРѕР»Рµ РІРёРґР°Р»РµРЅРѕ");
}

async function updateBlockMeta(blockId, patch) {
  const block = getBlock(blockId);
  if (!block) return;
  Object.assign(block, patch);
  await persistWorkspace();
}

async function updateBlockTitle(blockId, value) {
  const block = getBlock(blockId);
  const title = value.trim();
  if (!block || !title) {
    renderBlocks();
    return;
  }
  block.title = title;
  await persistWorkspace();
}

async function quickEditBlockTitle(blockId) {
  if (!canManageStructure()) return;
  const block = getBlock(blockId);
  if (!block) return;

  const title = window.prompt("РќРѕРІР° РЅР°Р·РІР° Р±Р»РѕРєСѓ", block.title);
  if (title === null) return;
  await updateBlockTitle(blockId, title);
}

async function updateColumnLabel(ref, value) {
  const [blockId, columnId] = ref.split(":");
  const column = getBlock(blockId)?.columns.find((item) => item.id === columnId);
  const label = value.trim();
  if (!column || !label) {
    renderBlocks();
    return;
  }
  column.label = label;
  await persistWorkspace();
}

async function updateColumnType(ref, type) {
  const [blockId, columnId] = ref.split(":");
  const block = getBlock(blockId);
  const column = block?.columns.find((item) => item.id === columnId);
  if (!block || !column) return;

  column.type = type;
  if (type === "status") {
    column.options = getColumnStatusOptions(column);
  } else {
    delete column.options;
  }
  block.rows.forEach((row) => {
    row.values[columnId] = normalizeValue(row.values[columnId], type, column);
  });
  await persistWorkspace();
}

async function updateColumnOptions(ref, value) {
  const [blockId, columnId] = ref.split(":");
  const block = getBlock(blockId);
  const column = block?.columns.find((item) => item.id === columnId);
  if (!block || !column || column.type !== "status") return;

  column.options = parseStatusOptions(value);
  block.rows.forEach((row) => {
    row.values[columnId] = normalizeValue(row.values[columnId], column.type, column);
  });
  await persistWorkspace();
}

async function reorderBlockItem(blockId, collection, sourceId, targetId) {
  const block = getBlock(blockId);
  const items = block?.[collection];
  if (!Array.isArray(items)) return;

  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;

  const [item] = items.splice(sourceIndex, 1);
  items.splice(targetIndex, 0, item);
  await persistWorkspace();
}

function showView(view) {
  state.view = view;
  closeBottomSheet();
  render();
}

function openTablesSheet() {
  if (!state.workspace || !els.bottomSheet || !els.bottomSheetContent) return;
  els.bottomSheetContent.innerHTML = `
    <div class="bottom-sheet-title">РўР°Р±Р»РёС†С–</div>
    <div class="bottom-sheet-list">
      ${state.workspace.pages.map((page) => `
        <button class="bottom-sheet-item ${page.id === state.workspace.activePageId ? "active" : ""}" type="button" data-page-id="${page.id}">
          <strong>${escapeHtml(page.icon || "в–¦")}</strong>
          <span>${escapeHtml(page.name)}</span>
        </button>
      `).join("")}
    </div>
  `;
  els.bottomSheet.classList.add("open");
  els.bottomSheet.setAttribute("aria-hidden", "false");
}

function closeBottomSheet() {
  if (!els.bottomSheet) return;
  els.bottomSheet.classList.remove("open");
  els.bottomSheet.setAttribute("aria-hidden", "true");
}

function showSnackbar(message, variant = "info") {
  if (!els.snackbar) return;
  window.clearTimeout(state.snackbarTimer);
  els.snackbar.textContent = message;
  els.snackbar.classList.toggle("error", variant === "error");
  els.snackbar.classList.add("show");
  state.snackbarTimer = window.setTimeout(() => {
    els.snackbar.classList.remove("show");
    els.snackbar.classList.remove("error");
  }, 2800);
}

function normalizeWorkspace(workspace) {
  if (workspace.pages && workspace.pages.length) {
    workspace.settings ??= {};
    workspace.settings.statusOptions = parseStatusOptions(workspace.settings.statusOptions || defaultStatuses);
    workspace.settings.showStats ??= true;
    workspace.settings.theme = normalizeTheme(workspace.settings.theme);
    workspace.departments = normalizeDepartments(workspace.departments);
    workspace.pages.forEach((page) => normalizePage(page, workspace.departments));
    if (!workspace.pages.some((page) => page.id === workspace.activePageId)) {
      workspace.activePageId = workspace.pages[0].id;
    }
    return workspace;
  }

  return normalizeWorkspace(migrateLegacySheet(workspace));
}

function normalizePage(page, departments = null) {
  page.icon ??= "в–¦";
  page.blocks ??= [];
  if (!page.blocks.length) {
    page.blocks.push(createDefaultBlock("РћСЃРЅРѕРІРЅР° С‚Р°Р±Р»РёС†СЏ"));
  }
  page.blocks.forEach((block) => normalizeBlock(block, departments));
  repairEmptyBlockStructures(page);
  page.blocks.forEach((block) => normalizeBlock(block, departments));
}

function normalizeBlock(block, departments = null) {
  block.badge ??= "";
  block.filterStatus ??= block.badge || block.title || "";
  block.color = normalizeBlockColor(block.color);
  block.columns ??= [];
  block.rows ??= [];
  block.columns.forEach(normalizeColumn);
  block.rows.forEach((row) => {
    row.id ??= crypto.randomUUID();
    row.description = String(row.description || "");
    row.values ??= {};
    block.columns.forEach((column) => {
      row.values[column.id] = normalizeValue(row.values[column.id], column.type, column, departments);
      if (isBlockMoveColumn(column)) {
        row.values[column.id] = block.id;
      }
    });
  });
}

function createDefaultBlock(title, options = {}) {
  return {
    id: createId("block"),
    title,
    badge: options.badge || "",
    filterStatus: options.filterStatus || options.badge || title || "",
    color: normalizeBlockColor(options.color),
    columns: [],
    rows: []
  };
}

function normalizeColumn(column) {
  column.type ??= "text";
  if (column.type === "status") {
    column.options = getColumnStatusOptions(column);
  } else {
    delete column.options;
  }
}

function createColumn(label, type, block = null) {
  const column = { id: createId("field"), label, type };
  if (type === "status") {
    column.options = structuredClone(defaultStatuses);
  }
  if (type === "block" && block) {
    column.defaultBlockId = block.id;
  }
  return column;
}

function toggleBlockSettings(blockId) {
  state.collapsedBlocks.delete(blockId);
  if (state.openBlockSettings.has(blockId)) {
    state.openBlockSettings.delete(blockId);
  } else {
    state.openBlockSettings.add(blockId);
  }
  renderBlocks();
}

function toggleBlockCollapse(blockId) {
  if (state.collapsedBlocks.has(blockId)) {
    state.collapsedBlocks.delete(blockId);
  } else {
    state.collapsedBlocks.add(blockId);
    state.openBlockSettings.delete(blockId);
  }
  renderBlocks();
}

async function toggleStats() {
  state.workspace.settings.showStats = state.workspace.settings.showStats === false;
  await persistWorkspace();
}

function routeAllRowsByStatus() {
  getActivePage().blocks.forEach((block) => {
    [...block.rows].forEach((row) => routeRowByStatus(block.id, row));
  });
}

function routeRowByStatus(sourceBlockId, row) {
  const page = getActivePage();
  const sourceBlock = page.blocks.find((block) => block.id === sourceBlockId);
  const status = getRowStatus(sourceBlock, row);
  if (!sourceBlock || !status) return;

  const targetBlock = page.blocks.find((block) => {
    const filterStatus = getBlockFilterStatus(block);
    return filterStatus && normalizeText(filterStatus) === normalizeText(status);
  });
  if (!targetBlock || targetBlock.id === sourceBlock.id) return;

  moveRowToBlock(sourceBlock.id, row, targetBlock.id);
}

function routeRowByBlockField(sourceBlockId, row) {
  const sourceBlock = getActivePage().blocks.find((block) => block.id === sourceBlockId);
  const moveColumn = sourceBlock?.columns.find(isBlockMoveColumn);
  const targetBlockId = moveColumn ? row.values?.[moveColumn.id] : "";
  if (!targetBlockId || targetBlockId === sourceBlockId) return false;
  moveRowToBlock(sourceBlockId, row, targetBlockId);
  return true;
}

function getRowStatus(block, row) {
  const statusColumn = block?.columns.find((column) => column.type === "status" && !isBlockMoveColumn(column));
  return statusColumn ? row.values?.[statusColumn.id] : "";
}

function getBlockFilterStatus(block) {
  return String(block?.filterStatus || block?.badge || block?.title || "").trim();
}

function normalizeText(value) {
  return String(value || "").trim().toLocaleLowerCase("uk-UA");
}

function getVisibleRows(block) {
  const query = normalizeText(state.searchQuery);
  if (!query) return block.rows;

  return block.rows.filter((row) => (
    block.columns.some((column) => (
      normalizeText(formatCellSearchValue(row.values?.[column.id], column, block)).includes(query)
    ))
  ));
}

function formatCellSearchValue(value, column, block) {
  if (isBlockMoveColumn(column)) {
    return getActivePage().blocks.find((item) => item.id === value)?.title || block.title;
  }
  if (column.type === "department") {
    return getDepartment(value)?.name || "РќРµ РїРµСЂРµРґР°РЅРѕ";
  }
  if (column.type === "checkbox") return value ? "С‚Р°Рє" : "РЅС–";
  return value ?? "";
}

function getPrimaryColumn(block) {
  return block.columns.find((column) => (
    column.type === "text" && /РЅР°Р·РІР°|name|РјР°Р№РЅРѕ|РїСЂРѕРґСѓРєС‚|С‚РѕРІР°СЂ/i.test(column.label)
  )) || block.columns.find((column) => !isBlockMoveColumn(column) && column.type === "text")
    || block.columns.find((column) => !isBlockMoveColumn(column));
}

function getSubtitleColumn(block, primaryColumnId) {
  return block.columns.find((column) => (
    column.id !== primaryColumnId && /РЅРѕРјРµСЂ|СЃРµСЂС–Р№|serial|С–РЅРІ/i.test(column.label)
  )) || block.columns.find((column) => column.id !== primaryColumnId && !isBlockMoveColumn(column));
}

function getQuantityColumn(block) {
  return block.columns.find((column) => (
    ["number", "currency"].includes(column.type)
    && /кільк|к-сть|qty|quantity|од\b|шт/i.test(column.label)
  )) || block.columns.find((column) => ["number", "currency"].includes(column.type));
}

function getActivePage() {
  return getPage(state.workspace.activePageId) || state.workspace.pages[0];
}

function getPage(pageId) {
  return state.workspace.pages.find((page) => page.id === pageId);
}

function getBlock(blockId) {
  return getActivePage().blocks.find((block) => block.id === blockId);
}

function getBlockAcrossWorkspace(blockId) {
  for (const page of state.workspace.pages) {
    const block = page.blocks.find((item) => item.id === blockId);
    if (block) return block;
  }
  return null;
}

function getDepartments() {
  if (!state.workspace) return [];
  state.workspace.departments = normalizeDepartments(state.workspace.departments);
  return state.workspace.departments;
}

function getDepartment(departmentId) {
  return getDepartments().find((department) => department.id === departmentId);
}

function getPendingDepartmentTransfer(row) {
  const transfer = row?.pendingDepartmentTransfer;
  if (!transfer || typeof transfer !== "object") return null;
  const targetDepartmentId = normalizeDepartmentValue(transfer.targetDepartmentId);
  if (!targetDepartmentId) return null;
  return {
    columnId: String(transfer.columnId || ""),
    fromDepartmentId: normalizeDepartmentValue(transfer.fromDepartmentId),
    targetDepartmentId,
    quantity: transfer.quantity ? Number(transfer.quantity) : null,
    quantityColumnId: String(transfer.quantityColumnId || ""),
    requestedBy: String(transfer.requestedBy || ""),
    requestedAt: String(transfer.requestedAt || "")
  };
}

function getDepartmentFieldValue(row, column) {
  const transfer = getPendingDepartmentTransfer(row);
  if (transfer?.columnId === column.id) {
    return transfer.targetDepartmentId;
  }
  return row.values?.[column.id] ?? "";
}

function canConfirmDepartmentTransfer(transfer) {
  const department = getDepartment(transfer?.targetDepartmentId);
  const responsibleUid = department?.responsibleUid || "";
  return canApproveOperations() || Boolean(responsibleUid && responsibleUid === state.user?.uid);
}

function getUserLabel(uid) {
  if (!uid) return "";
  const user = state.users.find((item) => item.uid === uid);
  return user?.name || user?.email || uid;
}

function normalizeDepartments(departments) {
  const source = Array.isArray(departments) ? departments : [];
  return source.map((department) => ({
    id: department.id || createId("department"),
    name: String(department.name || "РџС–РґСЂРѕР·РґС–Р»").trim() || "РџС–РґСЂРѕР·РґС–Р»",
    responsibleUid: String(department.responsibleUid || "")
  }));
}

function renderDepartmentOptions(value) {
  const selectedDepartmentId = normalizeDepartmentValue(value);
  return `
    <option value="">РќРµ РїРµСЂРµРґР°РЅРѕ</option>
    ${getDepartments().map((department) => (
      `<option value="${department.id}" ${selectedDepartmentId === department.id ? "selected" : ""}>${escapeHtml(department.name)}</option>`
    )).join("")}
  `;
}

function renderUserOptions(selectedUid = "") {
  return `
    <option value="">РќРµ РїСЂРёР·РЅР°С‡РµРЅРѕ</option>
    ${state.users.map((user) => `
      <option value="${user.uid}" ${selectedUid === user.uid ? "selected" : ""}>${escapeHtml(user.name || user.email || user.uid)}</option>
    `).join("")}
  `;
}

function normalizeDepartmentValue(value, departments = null) {
  const source = String(value || "");
  const sourceDepartments = Array.isArray(departments) ? normalizeDepartments(departments) : getDepartments();
  const department = sourceDepartments.find((item) => (
    item.id === source || normalizeText(item.name) === normalizeText(source)
  ));
  return department?.id || "";
}

function getDepartmentAssets(departmentId) {
  const assets = [];
  state.workspace.pages.forEach((page) => {
    page.blocks.forEach((block) => {
      const departmentColumn = block.columns.find((column) => column.type === "department");
      if (!departmentColumn) return;
      const titleColumn = getPrimaryColumn(block);
      block.rows.forEach((row) => {
        if (normalizeDepartmentValue(row.values?.[departmentColumn.id]) !== departmentId) return;
        assets.push(createDepartmentAssetItem(page, block, row, titleColumn, departmentColumn));
      });
    });
  });
  return assets;
}

function getDepartmentPendingAssets(departmentId) {
  const assets = [];
  state.workspace.pages.forEach((page) => {
    page.blocks.forEach((block) => {
      const titleColumn = getPrimaryColumn(block);
      block.rows.forEach((row) => {
        const transfer = getPendingDepartmentTransfer(row);
        if (!transfer || transfer.targetDepartmentId !== departmentId) return;
        const departmentColumn = block.columns.find((column) => column.id === transfer.columnId);
        assets.push(createDepartmentAssetItem(page, block, row, titleColumn, departmentColumn));
      });
    });
  });
  return assets;
}

function createDepartmentAssetItem(page, block, row, titleColumn, departmentColumn) {
  const title = titleColumn ? row.values?.[titleColumn.id] || block.title : block.title;
  const transfer = getPendingDepartmentTransfer(row);
  const status = getRowStatus(block, row);
  const fields = block.columns
    .filter((column) => (
      column.id !== titleColumn?.id
      && column.id !== departmentColumn?.id
      && !isBlockMoveColumn(column)
    ))
    .map((column) => ({
      label: column.label,
      value: formatAssetFieldValue(row.values?.[column.id], column, block)
    }))
    .filter((field) => field.value)
    .slice(0, 6);

  return {
    pageId: page.id,
    blockId: block.id,
    rowId: row.id,
    departmentColumnId: departmentColumn?.id || "",
    departmentValue: transfer?.targetDepartmentId || row.values?.[departmentColumn?.id] || "",
    title,
    pageName: page.name,
    blockTitle: block.title,
    blockBadge: block.badge || block.filterStatus || block.title,
    blockColor: normalizeBlockColor(block.color),
    status,
    transfer,
    pendingTransfer: Boolean(transfer),
    targetDepartmentName: transfer ? getDepartment(transfer.targetDepartmentId)?.name || "РџС–РґСЂРѕР·РґС–Р»" : "",
    fields
  };
}

function sortDepartmentAssets(assets) {
  const collator = new Intl.Collator("uk-UA", { numeric: true, sensitivity: "base" });
  const getSortValue = (asset) => {
    if (state.departmentAssetSort === "name") return asset.title;
    if (state.departmentAssetSort === "status") return asset.status || "";
    if (state.departmentAssetSort === "table") return asset.pageName;
    return `${asset.pageName} ${asset.blockTitle}`;
  };
  return [...assets].sort((a, b) => (
    collator.compare(getSortValue(a), getSortValue(b))
    || collator.compare(a.blockTitle, b.blockTitle)
    || collator.compare(a.title, b.title)
  ));
}

function groupDepartmentAssets(assets) {
  const groups = new Map();
  assets.forEach((asset) => {
    const key = `${asset.pageId}:${asset.blockId}`;
    if (!groups.has(key)) {
      groups.set(key, {
        title: asset.blockTitle,
        meta: asset.pageName,
        items: []
      });
    }
    groups.get(key).items.push(asset);
  });
  return [...groups.values()];
}

function formatAssetFieldValue(value, column, block) {
  if (isEmptyCellValue(value, column.type)) return "";
  if (column.type === "checkbox") return value ? "РўР°Рє" : "РќС–";
  if (column.type === "currency") return `${formatNumber(Number(value || 0))} РіСЂРЅ`;
  if (column.type === "number") return formatNumber(Number(value || 0));
  if (column.type === "date") return value ? formatDate(value) : "";
  if (column.type === "status") return String(value || "");
  if (column.type === "department") return getDepartment(value)?.name || "";
  if (isBlockMoveColumn(column)) return getActivePage().blocks.find((item) => item.id === value)?.title || block.title;
  return String(value || "").trim();
}

function getDepartmentTransferRequests() {
  const requests = [];
  state.workspace.pages.forEach((page) => {
    page.blocks.forEach((block) => {
      const titleColumn = getPrimaryColumn(block);
      block.rows.forEach((row) => {
        const transfer = getPendingDepartmentTransfer(row);
        if (!transfer) return;

        const department = getDepartment(transfer.targetDepartmentId);
        const departmentColumn = block.columns.find((column) => column.id === transfer.columnId);
        const asset = createDepartmentAssetItem(page, block, row, titleColumn, departmentColumn);
        requests.push({
          ...asset,
          pageId: page.id,
          pageName: page.name,
          blockId: block.id,
          blockTitle: block.title,
          rowId: row.id,
          transfer,
          targetDepartmentName: department?.name || "РџС–РґСЂРѕР·РґС–Р»",
          fromDepartmentName: getDepartment(transfer.fromDepartmentId)?.name || "РќРµ РїРµСЂРµРґР°РЅРѕ",
          responsibleName: getUserLabel(department?.responsibleUid),
          requestedByName: getUserLabel(transfer.requestedBy),
          requestedAt: transfer.requestedAt
        });
      });
    });
  });
  return requests.sort((a, b) => String(b.transfer.requestedAt || "").localeCompare(String(a.transfer.requestedAt || "")));
}

function isAdmin() {
  return normalizeRole(state.user?.role) === "admin";
}

function canManageStructure() {
  return isAdmin();
}

function canManageAssets() {
  return ["admin", "storekeeper"].includes(normalizeRole(state.user?.role));
}

function canViewReports() {
  return ["admin", "manager"].includes(normalizeRole(state.user?.role));
}

function canApproveOperations() {
  return ["admin", "manager"].includes(normalizeRole(state.user?.role));
}

function normalizeRole(role) {
  return roleDefinitions[role] ? role : "user";
}

function getRoleLabel(role) {
  return roleDefinitions[normalizeRole(role)].label;
}

function getRoleDescription(role) {
  return roleDefinitions[normalizeRole(role)].description;
}

function getStatusOptions() {
  return parseStatusOptions(state.workspace?.settings?.statusOptions || defaultStatuses);
}

function parseStatusOptions(value) {
  const source = Array.isArray(value) ? value.join("\n") : String(value || "");
  const options = source
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  return options.length ? [...new Set(options)] : structuredClone(defaultStatuses);
}

function moveRowToBlock(sourceBlockId, row, targetBlockId) {
  const page = getActivePage();
  const sourceBlock = page.blocks.find((block) => block.id === sourceBlockId);
  const targetBlock = page.blocks.find((block) => block.id === targetBlockId);
  if (!sourceBlock || !targetBlock || sourceBlock.id === targetBlock.id) return;

  ensureTargetBlockStructure(sourceBlock, targetBlock);
  const mappedRow = {
    ...row,
    values: mapRowValues(sourceBlock, targetBlock, row)
  };

  sourceBlock.rows = sourceBlock.rows.filter((item) => item.id !== row.id);
  if (!targetBlock.rows.some((item) => item.id === row.id)) {
    targetBlock.rows.push(mappedRow);
  }
  normalizeBlock(sourceBlock);
  normalizeBlock(targetBlock);
}

function repairEmptyBlockStructures(page) {
  page.blocks.forEach((block) => {
    if (block.columns.length || !block.rows.length) return;

    const donor = page.blocks.find((candidate) => (
      candidate.id !== block.id
      && candidate.columns.length
      && block.rows.some((row) => candidate.columns.some((column) => row.values?.[column.id] !== undefined))
    )) || page.blocks.find((candidate) => candidate.id !== block.id && candidate.columns.length);

    if (donor) {
      block.columns = cloneColumns(donor.columns);
    }
  });
}

function ensureTargetBlockStructure(sourceBlock, targetBlock) {
  if (targetBlock.columns.length || !sourceBlock.columns.length) return;
  targetBlock.columns = cloneColumns(sourceBlock.columns);
}

function cloneColumns(columns) {
  return columns.map((column) => ({ ...column }));
}

function cloneColumnsForNewBlock(columns) {
  return columns.map((column) => ({
    ...column,
    id: createId("field")
  }));
}

function mapRowValues(sourceBlock, targetBlock, row) {
  const values = { ...(row.values || {}) };
  targetBlock.columns.forEach((targetColumn) => {
    if (isBlockMoveColumn(targetColumn)) {
      values[targetColumn.id] = targetBlock.id;
      return;
    }

    if (values[targetColumn.id] !== undefined) {
      values[targetColumn.id] = normalizeValue(values[targetColumn.id], targetColumn.type, targetColumn);
      return;
    }

    const sourceColumn = sourceBlock.columns.find((column) => (
      column.type === targetColumn.type && normalizeText(column.label) === normalizeText(targetColumn.label)
    ));
    values[targetColumn.id] = sourceColumn
      ? normalizeValue(values[sourceColumn.id], targetColumn.type, targetColumn)
      : getEmptyValue(targetColumn.type, targetBlock, targetColumn);
  });
  return values;
}

function getEmptyValue(type, block = null, column = null) {
  if (["number", "currency"].includes(type)) return 0;
  if (type === "checkbox") return false;
  if (type === "status") return getColumnStatusOptions(column)[0] || "";
  if (type === "block") return block?.id || "";
  if (type === "department") return "";
  return "";
}

function normalizeValue(value, type, column = null, departments = null) {
  if (["number", "currency"].includes(type)) return Number(value || 0);
  if (type === "checkbox") return value === true || value === "true" || value === "on";
  if (type === "status") {
    const options = getColumnStatusOptions(column);
    const currentValue = String(value || "");
    return options.includes(currentValue) ? currentValue : options[0] || "";
  }
  if (type === "department") return normalizeDepartmentValue(value, departments);
  if (type === "block") return String(value || "");
  return String(value || "");
}

function getInputType(type) {
  if (["number", "currency"].includes(type)) return "number";
  if (type === "date") return "date";
  return "text";
}

function isEmptyCellValue(value, type) {
  if (type === "checkbox" || type === "status" || type === "block") return false;
  return value === null || value === undefined || String(value).trim() === "";
}

function isBlockMoveColumn(column) {
  return column?.type === "block";
}

function normalizeBlockValue(value) {
  const source = String(value || "");
  const pageBlock = getActivePage().blocks.find((block) => (
    block.id === source || normalizeText(block.title) === normalizeText(source) || normalizeText(block.badge) === normalizeText(source)
  ));
  return pageBlock?.id || "";
}

function renderBlockOptions(currentBlock, value) {
  const selectedBlockId = normalizeBlockValue(value) || currentBlock.id;
  return getActivePage().blocks.map((pageBlock) => (
    `<option value="${pageBlock.id}" ${selectedBlockId === pageBlock.id ? "selected" : ""}>${escapeHtml(pageBlock.title)}</option>`
  )).join("");
}

function renderBlockDropdown(currentBlock, value, fieldRef, editable = true) {
  const selectedBlockId = normalizeBlockValue(value) || currentBlock.id;
  const selectedBlock = getActivePage().blocks.find((pageBlock) => pageBlock.id === selectedBlockId) || currentBlock;
  return `
    <div class="md3-select block-dropdown ${editable ? "" : "disabled"}" data-block-dropdown>
      <button class="md3-select-button" type="button" data-toggle-block-dropdown="${fieldRef}" ${editable ? "" : "disabled"}>
        <span>${escapeHtml(selectedBlock.title)}</span>
      </button>
      <div class="md3-select-menu hidden" data-block-dropdown-menu="${fieldRef}">
        ${getActivePage().blocks.map((pageBlock) => `
          <button class="md3-select-option ${selectedBlockId === pageBlock.id ? "selected" : ""}" type="button" data-set-block-cell="${fieldRef}" data-block-value="${pageBlock.id}">
            ${escapeHtml(pageBlock.title)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProductDropdown(fieldRef, selectedValue, options, editable = true) {
  const normalizedValue = String(selectedValue || "");
  const selectedOption = options.find((option) => option.value === normalizedValue) || options[0] || { value: "", label: "" };
  return `
    <div class="md3-select product-dropdown ${editable ? "" : "disabled"}" data-product-dropdown>
      <button class="md3-select-button" type="button" data-toggle-product-select="${fieldRef}" ${editable ? "" : "disabled"}>
        <span>${escapeHtml(selectedOption.label)}</span>
      </button>
      <div class="md3-select-menu hidden" data-product-select-menu="${fieldRef}">
        ${options.map((option) => `
          <button class="md3-select-option ${normalizedValue === option.value ? "selected" : ""}" type="button" data-set-product-select="${fieldRef}" data-select-value="${escapeHtml(option.value)}">
            ${escapeHtml(option.label)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function getDepartmentDropdownOptions() {
  return [
    { value: "", label: "РќРµ РїРµСЂРµРґР°РЅРѕ" },
    ...getDepartments().map((department) => ({ value: department.id, label: department.name }))
  ];
}

function getColumnStatusOptions(column) {
  return parseStatusOptions(column?.options || defaultStatuses);
}

function renderStatusOptions(column, value) {
  const selectedValue = normalizeValue(value, "status", column);
  return getColumnStatusOptions(column).map((option) => (
    `<option value="${escapeHtml(option)}" ${selectedValue === option ? "selected" : ""}>${escapeHtml(option)}</option>`
  )).join("");
}

function getTypeLabel(type) {
  return fieldTypes.find((item) => item.value === type)?.label || "РўРµРєСЃС‚";
}

function normalizeBlockColor(value) {
  const source = String(value || "").trim();
  const legacyColors = {
    green: "#36df91",
    orange: "#ff7a1a",
    red: "#ff5570",
    blue: "#35b7ff",
    purple: "#8c6cff"
  };
  if (legacyColors[source]) return legacyColors[source];
  if (/^#[0-9a-f]{6}$/i.test(source)) return source;
  return getThemeSettings().blockAccent;
}

function normalizeTheme(theme) {
  const source = theme && typeof theme === "object" ? theme : {};
  const mode = normalizeThemeMode(source.mode);
  const preset = themePresets[mode];
  return {
    mode,
    ...Object.fromEntries(Object.entries(preset).filter(([key]) => key !== "mode").map(([key, fallback]) => (
      [key, normalizeHexColor(source[key], fallback)]
    )))
  };
}

function normalizeThemeMode(value) {
  return value === "light" ? "light" : "dark";
}

function normalizeHexColor(value, fallback) {
  const source = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(source) ? source : fallback;
}

function getThemeSettings() {
  if (!state.workspace?.settings) return structuredClone(defaultTheme);
  state.workspace.settings.theme = normalizeTheme(state.workspace.settings.theme);
  return state.workspace.settings.theme;
}

function applyTheme(theme = defaultTheme) {
  const normalized = normalizeTheme(theme);
  const root = document.documentElement;
  const dark = normalized.mode !== "light";
  root.dataset.theme = normalized.mode;
  root.style.setProperty("color-scheme", dark ? "dark" : "light");
  root.style.setProperty("--md-primary", normalized.primary);
  root.style.setProperty("--md-on-primary", dark ? "#371e73" : "#ffffff");
  root.style.setProperty("--md-primary-container", normalized.primaryContainer);
  root.style.setProperty("--md-on-primary-container", dark ? "#eaddff" : "#21005d");
  root.style.setProperty("--md-secondary-container", normalized.secondaryContainer);
  root.style.setProperty("--md-on-secondary-container", dark ? "#e8def8" : "#1d192b");
  root.style.setProperty("--md-tertiary", normalized.tertiary);
  root.style.setProperty("--md-on-tertiary", dark ? "#492532" : "#ffffff");
  root.style.setProperty("--md-tertiary-container", dark ? "#633b48" : "#ffd8e4");
  root.style.setProperty("--md-on-tertiary-container", dark ? "#ffd8e4" : "#31111d");
  root.style.setProperty("--md-error", dark ? "#ffb4ab" : "#ba1a1a");
  root.style.setProperty("--md-on-error", dark ? "#690005" : "#ffffff");
  root.style.setProperty("--md-error-container", dark ? "#93000a" : "#ffdad6");
  root.style.setProperty("--md-background", normalized.background);
  root.style.setProperty("--md-on-background", dark ? "#e6e0e9" : "#1d1b20");
  root.style.setProperty("--md-surface", normalized.background);
  root.style.setProperty("--md-surface-container", normalized.surface);
  root.style.setProperty("--md-surface-container-lowest", dark ? colorMix(normalized.background, "#000000", 82) : "#ffffff");
  root.style.setProperty("--md-surface-container-low", colorMix(normalized.surface, normalized.background, 72));
  root.style.setProperty("--md-surface-container-high", colorMix(normalized.surface, dark ? "#ffffff" : "#000000", dark ? 86 : 94));
  root.style.setProperty("--md-surface-container-highest", colorMix(normalized.surface, dark ? "#ffffff" : "#000000", dark ? 76 : 90));
  root.style.setProperty("--md-on-surface", dark ? "#e6e0e9" : "#1d1b20");
  root.style.setProperty("--md-on-surface-variant", dark ? "#cac4d0" : "#49454f");
  root.style.setProperty("--md-outline", dark ? "#938f99" : "#79747e");
  root.style.setProperty("--md-outline-variant", dark ? "#49454f" : "#cac4d0");
  root.style.setProperty("--md-shadow", dark ? "rgba(0, 0, 0, 0.36)" : "rgba(0, 0, 0, 0.18)");
  root.style.setProperty("--md-state-hover", dark ? "rgba(230, 224, 233, 0.08)" : "rgba(29, 27, 32, 0.08)");
  root.style.setProperty("--md-state-focus", dark ? "rgba(230, 224, 233, 0.12)" : "rgba(29, 27, 32, 0.12)");
  root.style.setProperty("--primary", normalized.primaryContainer);
  root.style.setProperty("--primary-strong", normalized.blockAccent);
  document.querySelector("meta[name='theme-color']")?.setAttribute("content", normalized.background);
}

function colorMix(colorA, colorB, amountA = 50) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const weightA = amountA / 100;
  const weightB = 1 - weightA;
  return `#${[0, 1, 2].map((index) => (
    Math.round(a[index] * weightA + b[index] * weightB).toString(16).padStart(2, "0")
  )).join("")}`;
}

function hexToRgb(value) {
  const hex = normalizeHexColor(value, "#000000").slice(1);
  return [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function formatNumber(value) {
  return new Intl.NumberFormat("uk-UA").format(value);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function getInitials(value) {
  const words = String(value || "Рљ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "Рљ";
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}
