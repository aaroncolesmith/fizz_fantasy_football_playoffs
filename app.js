/**
 * FizzyFestFantasyFootball | Playoff Edition
 * v1.4.1 - The "Supabase Production" Update
 */

// --- Constants & Pool Data ---
const VERSION = '1.6.3';

// Initialize Supabase (Using standard CDN global)
const SUPABASE_URL = 'https://rchbzcfhnhshbvtjtfay.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjaGJ6Y2ZobmhzaGJ2dGp0ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDI2NTAsImV4cCI6MjA4MTkxODY1MH0.jpsdpVw1DSNM8ZpqfzjK-H86w3uMRBgKqT1m65h7pfg';
const supabase = (window.supabase) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// We use a "Local Mirror" of the cloud ID (Sync Code)
let CLOUD_SYNC_ID = localStorage.getItem('ff_sync_id') || null;
const PLAYERS = [
    { id: 1, name: 'Josh Allen', pos: 'QB', team: 'BUF' },
    { id: 2, name: 'James Cook', pos: 'RB', team: 'BUF' },
    { id: 3, name: 'Dalton Kincaid', pos: 'TE', team: 'BUF' },
    { id: 4, name: 'Patrick Mahomes', pos: 'QB', team: 'KC' },
    { id: 5, name: 'Isiah Pacheco', pos: 'RB', team: 'KC' },
    { id: 6, name: 'Travis Kelce', pos: 'TE', team: 'KC' },
    { id: 7, name: 'Lamar Jackson', pos: 'QB', team: 'BAL' },
    { id: 8, name: 'Derrick Henry', pos: 'RB', team: 'BAL' },
    { id: 9, name: 'Amon-Ra St. Brown', pos: 'WR', team: 'DET' },
    { id: 10, name: 'Christian McCaffrey', pos: 'RB', team: 'SF' },
    { id: 11, name: 'CeeDee Lamb', pos: 'WR', team: 'DAL' },
    { id: 12, name: 'Jalen Hurts', pos: 'QB', team: 'PHI' },
    { id: 13, name: 'Saquon Barkley', pos: 'RB', team: 'PHI' },
    { id: 14, name: 'Tyreek Hill', pos: 'WR', team: 'MIA' },
    { id: 15, name: 'Amari Cooper', pos: 'WR', team: 'CLE' }
];
const SLOTS = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX1', 'FLEX2'];

// --- Persistence Keys ---
const KEY_LEAGUES = 'ff_leagues_v1';
const KEY_USER = 'ff_user_v1';

// --- State Management ---
let state = {
    currentUser: localStorage.getItem(KEY_USER) || null,
    leagues: JSON.parse(localStorage.getItem(KEY_LEAGUES)) || [],
    currentLeagueId: null,
    view: 'dashboard',
    search: '',
    filters: {
        pos: ['QB', 'RB', 'WR', 'TE', 'FLEX'],
        team: [],
        avail: ['undrafted']
    }
};

// --- Dropdown Management ---
let openDropdown = null; // 'pos', 'team', or 'avail'
let tempFilters = [];
let dropdownSearch = '';

// --- Helpers ---
function isAdmin() {
    return state.currentUser && state.currentUser.toLowerCase() === 'aaron';
}

// --- Storage Sync ---
// --- Storage Sync ---
window.saveSession = async function () {
    localStorage.setItem(KEY_USER, state.currentUser || '');
    localStorage.setItem(KEY_LEAGUES, JSON.stringify(state.leagues));
    if (CLOUD_SYNC_ID) localStorage.setItem('ff_sync_id', CLOUD_SYNC_ID);

    // Cloud Sync logic via Supabase
    if (state.leagues.length > 0 && supabase) {
        if (!CLOUD_SYNC_ID) {
            // First time: Create the cloud entry
            console.log("No Sync ID. Bootstrapping Supabase...");
            await createCloudSync();
        } else {
            console.log("Syncing state to Supabase ID:", CLOUD_SYNC_ID);
            try {
                const { error } = await supabase
                    .from('play_events')
                    .insert({
                        game_code: CLOUD_SYNC_ID,
                        hand_number: 999, // Reserved for state sync
                        event_type: 'FIZZYFEST_STATE',
                        event_data: { leagues: state.leagues },
                        player_name: state.currentUser,
                        occurred_at: new Date().toISOString()
                    });

                if (error) throw error;
                console.log("Cloud Sync Successful");
                updateUI();
            } catch (e) {
                console.warn("Cloud Sync Failed", e);
            }
        }
    }
};

async function createCloudSync() {
    if (!supabase) return null;
    try {
        // Generate a simple human-readable 6-digit sync code
        const code = 'FF-' + Math.floor(100000 + Math.random() * 900000);
        CLOUD_SYNC_ID = code;
        localStorage.setItem('ff_sync_id', CLOUD_SYNC_ID);

        // Push initial state
        const { error } = await supabase
            .from('play_events')
            .insert({
                game_code: CLOUD_SYNC_ID,
                hand_number: 999,
                event_type: 'FIZZYFEST_STATE',
                event_data: { leagues: state.leagues },
                player_name: state.currentUser,
                occurred_at: new Date().toISOString()
            });

        if (error) throw error;
        console.log("Created Cloud Sync ID:", CLOUD_SYNC_ID);
        updateUI();
        return CLOUD_SYNC_ID;
    } catch (e) {
        console.error("Failed to create Supabase sync", e);
        return null;
    }
}

async function loadFromCloud(syncId) {
    const id = syncId || CLOUD_SYNC_ID;
    if (!id || !supabase) return false;

    try {
        const { data, error } = await supabase
            .from('play_events')
            .select('event_data')
            .eq('game_code', id)
            .eq('event_type', 'FIZZYFEST_STATE')
            .order('occurred_at', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;

        if (data && data.event_data && Array.isArray(data.event_data.leagues)) {
            state.leagues = data.event_data.leagues;
            CLOUD_SYNC_ID = id;
            localStorage.setItem('ff_sync_id', id);
            localStorage.setItem(KEY_LEAGUES, JSON.stringify(state.leagues));
            console.log("Cloud Pull Successful for", id);
            return true;
        }
    } catch (e) {
        console.warn("Cloud Pull Failed", e);
    }
    return false;
}

/**
 * Searches Supabase for ANY league state where the user is involved.
 * This effectively makes the app "Global" without needing a sync code.
 */
async function refreshGlobalState() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase
            .from('play_events')
            .select('*')
            .eq('event_type', 'FIZZYFEST_STATE')
            .order('occurred_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            // We might have multiple states from different leagues. 
            // We merge them or find the most recent ones.
            // For now, let's collect all unique leagues across all state events.
            let allLeagues = [];
            let seenIds = new Set();

            data.forEach(event => {
                if (event.event_data && Array.isArray(event.event_data.leagues)) {
                    event.event_data.leagues.forEach(l => {
                        if (!seenIds.has(l.id)) {
                            allLeagues.push(l);
                            seenIds.add(l.id);
                        }
                    });
                }
                // If this event has a game_code, keep it as the primary sync ID if we don't have one
                if (!CLOUD_SYNC_ID && event.game_code) {
                    CLOUD_SYNC_ID = event.game_code;
                    localStorage.setItem('ff_sync_id', CLOUD_SYNC_ID);
                }
            });

            if (allLeagues.length > 0) {
                state.leagues = allLeagues;
                localStorage.setItem(KEY_LEAGUES, JSON.stringify(state.leagues));
                console.log(`Global Refresh: Found ${allLeagues.length} leagues.`);
                return true;
            }
        }
    } catch (e) {
        console.warn("Global Refresh Failed", e);
    }
    return false;
}

window.copyLeagueCode = function (e) {
    if (e) e.stopPropagation();
    if (!CLOUD_SYNC_ID) return;
    navigator.clipboard.writeText(CLOUD_SYNC_ID).then(() => {
        const btn = e?.target;
        if (btn && btn.tagName === 'BUTTON') {
            const originalText = btn.innerText;
            btn.innerText = 'COPIED!';
            setTimeout(() => btn.innerText = originalText, 2000);
        } else {
            alert("LEAGUE CODE COPIED TO CLIPBOARD!");
        }
    });
};

window.toggleLeagueCode = function (e) {
    if (e) e.stopPropagation();
    const badges = document.querySelectorAll('.league-code-container');
    badges.forEach(b => b.classList.toggle('hidden'));
};

function clearSession() {
    state.currentUser = null;
    state.currentLeagueId = null;
    state.view = 'dashboard';
    localStorage.setItem(KEY_USER, '');
    // Note: We DON'T clear leagues here so they stay on device, 
    // but the session (who is logged in) is cleared.
}

// --- Realtime Sync ---
let syncStatus = 'connecting';

function subscribeToChanges() {
    if (!supabase) return;

    console.log('🔄 Initializing Realtime Subscription...');
    const channel = supabase
        .channel('ff_global_sync')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'play_events',
            filter: 'event_type=eq.FIZZYFEST_STATE'
        }, payload => {
            console.log('🚀 Realtime Update Received!', payload);
            if (payload.new && payload.new.event_data && Array.isArray(payload.new.event_data.leagues)) {

                // Smart Merge: Only update if the incoming state is actually newer or different
                // To keep it simple for now, we'll trust the latest insert.
                state.leagues = payload.new.event_data.leagues;
                localStorage.setItem(KEY_LEAGUES, JSON.stringify(state.leagues));

                if (!CLOUD_SYNC_ID && payload.new.game_code) {
                    CLOUD_SYNC_ID = payload.new.game_code;
                    localStorage.setItem('ff_sync_id', CLOUD_SYNC_ID);
                }

                updateUI();

                // Visual feedback for the user
                const badge = document.querySelector('.live-indicator');
                if (badge) {
                    badge.style.background = '#00ff00';
                    setTimeout(() => badge.style.background = '#4cd964', 500);
                }
            }
        })
        .subscribe((status, err) => {
            console.log(`📡 Realtime Status: ${status}`, err || '');
            syncStatus = status;
            const indicators = document.querySelectorAll('.live-indicator');
            indicators.forEach(ind => {
                if (status === 'SUBSCRIBED') {
                    ind.style.background = '#4cd964'; // Green
                    ind.title = 'Live Sync Active';
                } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
                    ind.style.background = '#ff3b30'; // Red
                    ind.title = 'Live Sync Disconnected';
                }
            });
        });
}

// --- App Control ---
async function initApp() {
    console.log(`FF v${VERSION} Initializing...`);

    const vEl = document.getElementById('app-version');
    if (vEl) vEl.innerText = `v${VERSION}`;

    // 1. Always attempt a global fetch from Supabase on init
    if (state.currentUser && supabase) {
        console.log("Global cloud refresh for:", state.currentUser);
        await refreshGlobalState();
    }

    // 2. Setup Realtime Subscription
    if (supabase) {
        subscribeToChanges();
    }

    if (!state.currentUser) {
        showSection('login-view');
        updateDebugInfo();
    } else {
        showSection('dashboard-view');
        updateUI();
    }
}

function showSection(id) {
    document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
    const section = document.getElementById(id);
    if (section) section.classList.remove('hidden');
    renderBreadcrumbs();
}

function updateUI() {
    const l = getActiveLeague();
    if (state.view === 'dashboard') renderLeagues();
    if (state.view === 'league-detail') renderLeagueStats(l);
    if (state.view === 'draft') renderDraftUI(l);
    renderBreadcrumbs();
}

function getActiveLeague() {
    return state.leagues.find(l => l.id === state.currentLeagueId);
}

// --- Navigation ---
function renderBreadcrumbs() {
    const nav = document.getElementById('breadcrumb-nav');
    if (!nav || !state.currentUser) return;

    let html = `<span onclick="navigate('dashboard')">HOME</span>`;
    const l = getActiveLeague();

    if (l) {
        html += `<span class="${state.view === 'league-detail' ? 'active' : ''}" onclick="navigate('league-detail', '${l.id}')">${l.name}</span>`;
        if (state.view === 'draft') {
            html += `<span class="active">DRAFT</span>`;
        }
    } else if (state.view === 'new-league') {
        html += `<span class="active">NEW LEAGUE</span>`;
    }
    nav.innerHTML = html;
}

window.navigate = (view, leagueId = null) => {
    state.view = view;
    if (leagueId) {
        state.currentLeagueId = leagueId;
    } else if (view === 'dashboard') {
        state.currentLeagueId = null;
    }
    showSection(`${view}-view`);
    updateUI();
};

// --- Rendering Logic ---
function renderLeagues() {
    const grid = document.getElementById('leagues-grid');
    if (!grid) return;

    // Show/Hide create button for admins
    const createBtn = document.getElementById('show-create-league-btn');
    if (createBtn) createBtn.classList.toggle('hidden', !isAdmin());

    const myLeagues = state.leagues.filter(l => {
        const isCreator = l.creator.toLowerCase() === state.currentUser.toLowerCase();
        const isMember = l.teams.some(t => t.name.toLowerCase() === state.currentUser.toLowerCase());
        return isCreator || isMember;
    });

    if (myLeagues.length === 0) {
        grid.innerHTML = `<div class="card w-full text-center" style="grid-column: 1 / -1; opacity: 0.5;">No leagues found. Create one or ask to be added.</div>`;
    } else {
        grid.innerHTML = myLeagues.map(l => `
            <div class="league-card" onclick="navigate('league-detail', '${l.id}')">
                <h3>${l.name}</h3>
                <p>${l.teams.length} Teams</p>
                <div class="mt-4" onclick="event.stopPropagation()">
                    ${CLOUD_SYNC_ID ? `
                        <button onclick="toggleLeagueCode(event)" class="btn-mini" style="opacity: 0.3; border:none; background:transparent;">Show Code</button>
                        <div class="league-code-container sync-code-badge hidden" style="margin-top:4px;">
                            <span>${CLOUD_SYNC_ID}</span>
                            <button onclick="window.copyLeagueCode(event)" class="btn-mini text-link" style="padding:0; margin-left:8px; font-size:0.6rem;">[COPY]</button>
                        </div>
                    ` : `
                        <span style="font-size:0.6rem; color:var(--red); font-weight:800;">OFFLINE</span>
                    `}
                </div>
            </div>
        `).join('');
    }
}

function renderLeagueStats(l) {
    const container = document.getElementById('league-stats-table');
    if (!container || !l) return;

    let html = `
        <div class="d-flex justify-between items-center mb-6">
            <h2 style="font-weight: 800; letter-spacing: -1px; text-transform: uppercase; display: flex; align-items: center; gap: 10px;">
                ${l.name}
                <div class="live-indicator" style="width: 8px; height: 8px; border-radius: 50%; background: ${syncStatus === 'SUBSCRIBED' ? '#4cd964' : '#ff3b30'};"></div>
            </h2>
            ${CLOUD_SYNC_ID ? `
                <div style="text-align:right;">
                    <button onclick="toggleLeagueCode(event)" class="btn-mini" style="opacity: 0.3; border:none; background:transparent;">Show Code</button>
                    <div class="league-code-container sync-code-badge hidden" style="margin-top:0; font-size:0.7rem;">
                        <span>CODE: ${CLOUD_SYNC_ID}</span>
                        <button onclick="window.copyLeagueCode(event)" class="btn-mini text-link" style="padding:0; margin-left:8px; font-size:0.6rem;">[COPY]</button>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="table-row table-header">
            <div>TEAM</div>
            <div>SCORE</div>
            <div>PLAYERS REMAINING</div>
        </div>
    `;

    html += l.teams.map(t => `
        <div class="table-row">
            <div style="font-weight: 800; color: #1a73e8; cursor: pointer;" onclick="viewTeamRoster('${t.name}')">
                ${t.name} ${t.name.toLowerCase() === state.currentUser.toLowerCase() ? '<span style="color:var(--red)">(YOU)</span>' : ''}
            </div>
            <div style="font-weight: 800; color: var(--red);">${t.score || 0}</div>
            <div style="font-size: 0.8rem; color: var(--gray); font-weight: 600;">${SLOTS.length - t.roster.length} UNDRAFTED</div>
        </div>
    `).join('');

    container.innerHTML = html;

    // Admin restrictions
    document.getElementById('add-team-btn').classList.toggle('hidden', !isAdmin());
    document.getElementById('save-state-btn').classList.toggle('hidden', !isAdmin());

    const draftBtn = document.getElementById('start-draft-btn');
    const isStarted = l.draftOrder && l.draftOrder.length > 0;

    if (isStarted) {
        draftBtn.innerText = "ENTER DRAFT";
        draftBtn.classList.remove('hidden');
    } else {
        draftBtn.innerText = "START DRAFT";
        draftBtn.classList.toggle('hidden', !isAdmin());
    }
}

function renderDraftUI(l) {
    if (!l) return;
    renderFilters(l);
    renderPlayerList(l);
    renderDraftOrder(l);
    renderRoster(l);
}

window.viewTeamRoster = (teamName) => {
    const l = getActiveLeague();
    if (!l) return;
    const team = l.teams.find(t => t.name === teamName);
    if (!team) return;

    const rosterMap = getTeamRosterMap(team.roster);

    // Create a simple overlay/modal
    const modal = document.createElement('div');
    modal.className = 'glass';
    modal.style = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        z-index: 2000; padding: 30px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 400px; width: 90%; background: white;
    `;

    let rosterHtml = SLOTS.map(slot => {
        const p = rosterMap[slot];
        return `
            <div style="display:flex; justify-content:between; padding: 10px; border-bottom: 1px solid #eee;">
                <span style="font-weight: 800; opacity: 0.4; width: 60px;">${slot}</span>
                <span style="font-weight: 700;">${p ? p.name : '<span style="opacity:0.2">—</span>'}</span>
                <span style="margin-left: auto; font-size: 0.7rem; color: var(--gray);">${p ? p.team : ''}</span>
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <div style="display:flex; justify-content:between; align-items:center; margin-bottom: 20px;">
            <h3 style="margin:0; font-weight:800; text-transform:uppercase;">${teamName}'s Roster</h3>
            <button onclick="this.parentElement.parentElement.remove()" class="btn-mini">Close</button>
        </div>
        <div>${rosterHtml}</div>
    `;

    document.body.appendChild(modal);

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1999;";
    backdrop.onclick = () => { modal.remove(); backdrop.remove(); };
    document.body.appendChild(backdrop);
};

function renderFilters(l) {
    const bar = document.getElementById('filter-bar');
    if (!bar) return;

    // Get unique teams from player pool
    const teams = [...new Set(PLAYERS.map(p => p.team))].sort();
    if (state.filters.team.length === 0) state.filters.team = [...teams];

    bar.innerHTML = `
        <div class="filter-bar">
            ${renderDropdownField('POS', 'pos', ['QB', 'RB', 'WR', 'TE', 'FLEX'])}
            ${renderDropdownField('TEAM', 'team', teams)}
            ${renderDropdownField('STATUS', 'avail', ['undrafted', 'drafted'])}
        </div>
    `;
}

function renderDropdownField(label, cat, items) {
    const isActive = openDropdown === cat;
    const selectedCount = state.filters[cat].length;
    const totalCount = items.length;

    let displayValue = selectedCount === totalCount ? 'All' : `${selectedCount} selected`;
    if (selectedCount === 0) displayValue = 'None';

    return `
        <div class="filter-dropdown-container" id="dropdown-${cat}">
            <div class="dropdown-trigger ${isActive ? 'active' : ''}" onclick="toggleDropdown(event, '${cat}')">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-size:0.55rem; color:var(--gray); text-transform:uppercase;">${label}</span>
                    <span>${displayValue}</span>
                </div>
            </div>
            ${isActive ? renderDropdownMenu(cat, items) : ''}
        </div>
    `;
}

function renderDropdownMenu(cat, items) {
    const filtered = items.filter(i => i.toLowerCase().includes(dropdownSearch.toLowerCase()));

    return `
        <div class="dropdown-menu" onclick="event.stopPropagation()">
            <input type="text" class="dropdown-search" placeholder="Search..." value="${dropdownSearch}" 
                   oninput="handleDropdownSearch(event, '${cat}')" autofocus>
            
            <div class="dropdown-links">
                <a onclick="setAllTemp('${cat}', true)">Select all</a>
                <span style="color:var(--border)">|</span>
                <a onclick="setAllTemp('${cat}', false)">Clear</a>
            </div>

            <div class="dropdown-list">
                ${filtered.map(i => `
                    <div class="dropdown-item ${tempFilters.includes(i) ? 'selected' : ''}" onclick="toggleTempFilter('${i}')">
                        <div class="dropdown-checkbox"></div>
                        <span>${i.toUpperCase()}</span>
                    </div>
                `).join('')}
            </div>

            <div class="dropdown-footer">
                <button class="btn-cancel" onclick="closeDropdown()">Cancel</button>
                <button class="btn-ok" onclick="applyDropdown('${cat}')">OK</button>
            </div>
        </div>
    `;
}

window.toggleDropdown = (e, cat) => {
    e.stopPropagation();
    if (openDropdown === cat) {
        closeDropdown();
    } else {
        openDropdown = cat;
        tempFilters = [...state.filters[cat]];
        dropdownSearch = '';
        renderFilters();
    }
};

window.closeDropdown = () => {
    openDropdown = null;
    tempFilters = [];
    dropdownSearch = '';
    renderFilters();
};

window.handleDropdownSearch = (e, cat) => {
    dropdownSearch = e.target.value;
    // We need to re-render the menu. Instead of full updateUI (expensive), 
    // we just re-render the filters which contains the menu.
    renderFilters();
};

window.setAllTemp = (cat, all) => {
    if (all) {
        // Items depend on cat
        if (cat === 'pos') tempFilters = ['QB', 'RB', 'WR', 'TE', 'FLEX'];
        else if (cat === 'avail') tempFilters = ['undrafted', 'drafted'];
        else if (cat === 'team') tempFilters = [...new Set(PLAYERS.map(p => p.team))].sort();
    } else {
        tempFilters = [];
    }
    renderFilters();
};

window.toggleTempFilter = (val) => {
    if (tempFilters.includes(val)) {
        tempFilters = tempFilters.filter(v => v !== val);
    } else {
        tempFilters.push(val);
    }
    renderFilters();
};

window.applyDropdown = (cat) => {
    state.filters[cat] = [...tempFilters];
    closeDropdown();
    updateUI();
};

// Global click listener to close dropdowns
document.addEventListener('click', () => {
    if (openDropdown) closeDropdown();
});

function renderPlayerList(l) {
    const c = document.getElementById('player-list');
    if (!c) return;

    const picked = l.picks.map(p => p.playerId);

    // Filter the list
    let filtered = PLAYERS.filter(p => {
        const isPicked = picked.includes(p.id);

        // 1. Availability Filter
        const showDrafted = state.filters.avail.includes('drafted');
        const showUndrafted = state.filters.avail.includes('undrafted');

        if (!showDrafted && isPicked) return false;
        if (!showUndrafted && !isPicked) return false;

        // 2. Position Filter
        if (state.filters.pos.length > 0) {
            const flexPos = ['WR', 'RB', 'TE'];
            const matchPos = state.filters.pos.some(f => {
                if (f === 'FLEX') return flexPos.includes(p.pos);
                return p.pos === f;
            });
            if (!matchPos) return false;
        }

        // 3. Team Filter
        if (state.filters.team.length > 0) {
            if (!state.filters.team.includes(p.team)) return false;
        }

        // 4. Search Filter
        if (state.search && !p.name.toLowerCase().includes(state.search.toLowerCase())) return false;

        return true;
    });

    const currentPicker = l.draftOrder[l.currentPick];
    const isMyTurn = currentPicker && currentPicker.name.toLowerCase() === state.currentUser.toLowerCase();

    c.innerHTML = filtered.map(p => `
        <div class="player-item" style="${picked.includes(p.id) ? 'background: #fdf2f2; opacity: 0.8;' : ''}">
            <div>
                <strong>${p.name}</strong> ${picked.includes(p.id) ? '<span style="color:var(--red); font-size: 0.6rem; font-weight: 800;">[PICKED]</span>' : ''}<br>
                <small>${p.team} - ${p.pos}</small>
            </div>
            ${isMyTurn && !picked.includes(p.id) ? `<button class="btn primary" style="padding: 6px 16px; border-radius: 8px; font-size: 0.7rem;" onclick="draftPlayer(${p.id})">PICK</button>` : ''}
        </div>
    `).join('') || '<div class="p-8 text-center opacity-30">NO PLAYERS MATCH FILTERS</div>';
}

function getTeamRosterMap(roster = []) {
    const map = {};
    SLOTS.forEach(s => map[s] = null);

    const flexPositions = ['RB', 'WR', 'TE'];

    // 1st Pass: Fill natural positions
    roster.forEach(p => {
        if (p.pos === 'QB' && !map['QB']) {
            map['QB'] = p;
        } else if (p.pos === 'RB') {
            if (!map['RB1']) map['RB1'] = p;
            else if (!map['RB2']) map['RB2'] = p;
        } else if (p.pos === 'WR') {
            if (!map['WR1']) map['WR1'] = p;
            else if (!map['WR2']) map['WR2'] = p;
        } else if (p.pos === 'TE' && !map['TE']) {
            map['TE'] = p;
        }
    });

    // 2nd Pass: Fill FLEX entries for remaining RB/WR/TE
    roster.forEach(p => {
        // Find if this specific player instance is already mapped
        const isMapped = Object.values(map).some(m => m && m.id === p.id);
        if (!isMapped && flexPositions.includes(p.pos)) {
            if (!map['FLEX1']) map['FLEX1'] = p;
            else if (!map['FLEX2']) map['FLEX2'] = p;
        }
    });

    return map;
}

window.draftPlayer = (playerId) => {
    const l = getActiveLeague();
    const picker = l.draftOrder[l.currentPick];
    if (!picker || picker.name.toLowerCase() !== state.currentUser.toLowerCase()) return;

    const player = PLAYERS.find(p => p.id === playerId);
    const team = l.teams.find(t => t.name === picker.name);

    // Position Validation Logic
    const currentRosterMap = getTeamRosterMap(team.roster);
    let canDraft = false;

    if (player.pos === 'QB') {
        if (!currentRosterMap['QB']) canDraft = true;
    } else if (['RB', 'WR', 'TE'].includes(player.pos)) {
        // Check natural slots first, then FLEX
        const slotsToCheck = [];
        if (player.pos === 'RB') slotsToCheck.push('RB1', 'RB2');
        if (player.pos === 'WR') slotsToCheck.push('WR1', 'WR2');
        if (player.pos === 'TE') slotsToCheck.push('TE');
        slotsToCheck.push('FLEX1', 'FLEX2');

        canDraft = slotsToCheck.some(s => !currentRosterMap[s]);
    }

    if (!canDraft) {
        alert(`NO SLOTS AVAILABLE FOR ${player.name} (${player.pos})`);
        return;
    }

    team.roster.push(player);
    l.picks.push({ playerId, teamName: team.name });
    l.currentPick++;

    saveSession();
    updateUI();

    if (l.currentPick >= l.draftOrder.length) {
        alert("Draft Complete!");
        navigate('league-detail', l.id);
    }
};

function renderDraftOrder(l) {
    const c = document.getElementById('snake-order-list');
    const badge = document.getElementById('draft-status-badge');
    if (!c || !badge) return;

    const upcoming = l.draftOrder.slice(l.currentPick, l.currentPick + 6);
    c.innerHTML = upcoming.map((p, i) => `
        <div style="font-size: 0.75rem; margin-bottom: 6px; font-weight: 600; opacity: ${i === 0 ? 1 : 0.5}">
            ${l.currentPick + i + 1}. ${p.name} (R${p.round})
        </div>
    `).join('');

    badge.innerText = `Pick ${l.currentPick + 1}`;
}

function renderRoster(l) {
    const c = document.getElementById('roster-grid');
    if (!c) return;

    const team = l.teams.find(t => t.name.toLowerCase() === state.currentUser.toLowerCase());
    if (!team) return;

    const rosterMap = getTeamRosterMap(team.roster);

    c.innerHTML = SLOTS.map(slot => {
        const p = rosterMap[slot];
        return `
            <div style="padding: 6px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.65rem; margin-bottom: 4px; background: white; display: flex; justify-content: space-between;">
                <div><span style="opacity: 0.5; font-weight: 800; width: 45px; display: inline-block;">${slot}</span>: 
                <span style="font-weight: 800;">${p ? p.name : '-'}</span></div>
                ${p ? `<span style="font-size:0.55rem; color:var(--gray);">${p.team}</span>` : ''}
            </div>
        `;
    }).join('');
}

// --- Event Handlers ---
function setupListeners() {
    // Auth
    // Auth
    document.getElementById('login-btn').onclick = async () => {
        const input = document.getElementById('login-username').value.trim();
        if (!input) return alert('NAME REQUIRED');

        const normalized = input.toLowerCase();

        // 1. Global Search: See if Supabase knows about this user in any league
        console.log("Searching Supabase for user records...");
        await refreshGlobalState();

        const isAaron = normalized === 'aaron';
        let isKnown = state.leagues.some(l =>
            l.creator.toLowerCase() === normalized ||
            l.teams.some(t => t.name.toLowerCase() === normalized)
        );

        if (isAaron || isKnown) {
            state.currentUser = input;
            await saveSession();
            initApp();
        } else {
            alert(`USER "${input}" NOT FOUND IN ANY CLOUD LEAGUES. ASK AARON TO BE ADDED.`);
        }
    };

    document.getElementById('logout-btn').onclick = () => {
        clearSession();
        location.reload();
    };

    document.getElementById('emergency-reset-btn').onclick = () => {
        if (confirm("THIS WILL DELETE ALL LEAGUES ON THIS DEVICE. PROCEED?")) {
            localStorage.clear();
            location.reload();
        }
    };

    // Dashboard
    document.getElementById('show-create-league-btn').onclick = () => navigate('new-league');

    // League Creation
    document.getElementById('save-league-btn').onclick = () => {
        const name = document.getElementById('league-name').value.trim();
        if (!name) return alert('LEAGUE NAME REQUIRED');

        const newLeague = {
            id: 'l_' + Date.now(),
            name,
            creator: state.currentUser,
            teams: [{ name: state.currentUser, roster: [], score: 0 }],
            picks: [],
            draftOrder: [],
            currentPick: 0
        };

        state.leagues.push(newLeague);
        state.currentLeagueId = newLeague.id;
        document.getElementById('league-name').value = '';
        saveSession();
        navigate('league-detail', newLeague.id);
    };

    // League Detail
    document.getElementById('add-team-btn').onclick = () => {
        const name = prompt("TEAM OWNER NAME:");
        if (!name) return;
        const l = getActiveLeague();
        if (l.teams.find(t => t.name.toLowerCase() === name.trim().toLowerCase())) return alert("NAME ALREADY TAKEN");

        l.teams.push({ name: name.trim(), roster: [], score: 0 });
        saveSession();
        updateUI();
    };

    document.getElementById('save-state-btn').onclick = () => {
        saveSession();
        alert("LEAGUE DATA SAVED.");
    };

    document.getElementById('start-draft-btn').onclick = () => {
        const l = getActiveLeague();

        // Only Aaron can INITIALIZE the draft
        if (!l.draftOrder || l.draftOrder.length === 0) {
            if (!isAdmin()) return alert("WAITING FOR AARON TO START THE DRAFT.");
            if (l.teams.length < 2) return alert("NEED AT LEAST 2 TEAMS TO DRAFT.");

            // Snake Draft Generation
            const randomizedTeams = [...l.teams].sort(() => Math.random() - 0.5);
            const fullOrder = [];
            for (let r = 1; r <= SLOTS.length; r++) {
                let roundOrder = [...randomizedTeams];
                if (r % 2 === 0) roundOrder.reverse();
                roundOrder.forEach(t => fullOrder.push({ name: t.name, id: t.id, round: r }));
            }
            l.draftOrder = fullOrder;
            l.currentPick = 0;
            saveSession();
        }

        navigate('draft', l.id);
    };

    // Draft
    document.getElementById('player-search').oninput = (e) => {
        state.search = e.target.value;
        const l = getActiveLeague();
        renderPlayerList(l);
    };
}

function updateDebugInfo() {
    const c = document.getElementById('system-debug-content');
    if (!c) return;

    const users = [];
    state.leagues.forEach(l => {
        users.push(l.creator);
        l.teams.forEach(t => users.push(t.name));
    });

    c.innerHTML = `
        <strong>VER:</strong> ${VERSION}<br>
        <strong>SYNC CODE:</strong> <span style="color:var(--red); font-weight:800;">${CLOUD_SYNC_ID || 'PENDING (SAVE REQD)'}</span><br>
        <strong>LEAGUES:</strong> ${state.leagues.length}<br>
        <strong>AUTH LIST:</strong> ${[...new Set(users)].join(', ') || 'NONE'}
    `;
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    setupListeners();
    initApp();
});
