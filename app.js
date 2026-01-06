/**
 * FizzyFestFantasyFootball | Playoff Edition
 * v1.4.1 - The "Supabase Production" Update
 */

// --- Constants & Pool Data ---
const VERSION = '5.2.0'; // Integrated Team Roster & Next Game View
const SYNC_EVENT_TYPE = 'FIZZ_V5_CLEAN';

// --- ESPN API Configuration ---
const ESPN_STATS_URL = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/players?view=kona_player_info';
// IMPORTANT: 2pt conversions DISABLED - ESPN API returns incorrect data
// Stat IDs 19, 37, 54 are documented but return garbage values (e.g., AJ Brown showing 11 rec 2pt)
const STAT_MAP = {
    passYds: '3',
    passTD: '4',
    ints: '20',
    rushYds: '24',
    rushTD: '25',
    recs: '53',
    recYds: '42',
    recTD: '43',
    fumbles: '72',
    pass2pt: '19',  // 2pt Passing Conversion (verified)
    rush2pt: '37',  // 2pt Rushing Conversion (verified)
    rec2pt: '54'    // 2pt Receiving Conversion (verified)
};

const DEFAULT_SCORING = {
    passYds: 0.04,
    rushYds: 0.1,
    recYds: 0.1,
    passTD: 4,
    rushTD: 6,
    recTD: 6,
    recs: 1,
    pass2pt: 2,
    rush2pt: 2,
    rec2pt: 2,
    ints: -2,
    fumbles: -2
};

// Initialize Supabase (Using standard CDN global)
const SUPABASE_URL = 'https://rchbzcfhnhshbvtjtfay.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjaGJ6Y2ZobmhzaGJ2dGp0ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDI2NTAsImV4cCI6MjA4MTkxODY1MH0.jpsdpVw1DSNM8ZpqfzjK-H86w3uMRBgKqT1m65h7pfg';
const supabase = (window.supabase) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// We use a "Local Mirror" of the cloud ID (Sync Code)
// Persistence handled via state.leagues[i].syncCode
const PLAYERS = [
    // AFC #1 - Denver Broncos (DEN)
    { id: 1, name: 'Bo Nix', pos: 'QB', team: 'DEN', passTD: 25, rushTD: 4, recTD: 0, recs: 0 },
    { id: 2, name: 'Jarrett Stidham', pos: 'QB', team: 'DEN', passTD: 2, rushTD: 0, recTD: 0, recs: 0 },
    { id: 3, name: 'J.K. Dobbins', pos: 'RB', team: 'DEN', passTD: 0, rushTD: 8, recTD: 1, recs: 32 },
    { id: 4, name: 'RJ Harvey', pos: 'RB', team: 'DEN', passTD: 0, rushTD: 7, recTD: 0, recs: 12 },
    { id: 5, name: 'Audric Estime', pos: 'RB', team: 'DEN', passTD: 0, rushTD: 2, recTD: 0, recs: 5 },
    { id: 6, name: 'Tyler Badie', pos: 'RB', team: 'DEN', passTD: 0, rushTD: 1, recTD: 0, recs: 8 },
    { id: 7, name: 'Courtland Sutton', pos: 'WR', team: 'DEN', passTD: 0, rushTD: 0, recTD: 7, recs: 72 },
    { id: 8, name: 'Marvin Mims Jr.', pos: 'WR', team: 'DEN', passTD: 0, rushTD: 1, recTD: 3, recs: 48 },
    { id: 9, name: 'Troy Franklin', pos: 'WR', team: 'DEN', passTD: 0, rushTD: 0, recTD: 2, recs: 35 },
    { id: 10, name: 'Lil\'Jordan Humphrey', pos: 'WR', team: 'DEN', passTD: 0, rushTD: 0, recTD: 1, recs: 22 },
    { id: 11, name: 'Devaughn Vele', pos: 'WR', team: 'DEN', passTD: 0, rushTD: 0, recTD: 0, recs: 18 },
    { id: 12, name: 'Josh Reynolds', pos: 'WR', team: 'DEN', passTD: 0, rushTD: 0, recTD: 1, recs: 15 },
    { id: 13, name: 'Evan Engram', pos: 'TE', team: 'DEN', passTD: 0, rushTD: 0, recTD: 5, recs: 88 },
    { id: 14, name: 'Adam Trautman', pos: 'TE', team: 'DEN', passTD: 0, rushTD: 0, recTD: 2, recs: 25 },
    { id: 15, name: 'Greg Dulcich', pos: 'TE', team: 'DEN', passTD: 0, rushTD: 0, recTD: 1, recs: 12 },

    { id: 177, name: 'Pat Bryant', pos: 'WR', team: 'DEN', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 178, name: 'Jaleel McLaughlin', pos: 'RB', team: 'DEN', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 179, name: 'Elijah Moore', pos: 'WR', team: 'DEN', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // REMOVED: Lil'Jordan Humphrey DEN - duplicate (id: 10)
    // AFC #2 - New England Patriots (NE)
    { id: 16, name: 'Drake Maye', pos: 'QB', team: 'NE', passTD: 28, rushTD: 6, recTD: 0, recs: 0 },
    { id: 17, name: 'Joshua Dobbs', pos: 'QB', team: 'NE', passTD: 3, rushTD: 2, recTD: 0, recs: 0 },
    { id: 18, name: 'Rhamondre Stevenson', pos: 'RB', team: 'NE', passTD: 0, rushTD: 9, recTD: 2, recs: 45 },
    { id: 19, name: 'TreVeyon Henderson', pos: 'RB', team: 'NE', passTD: 0, rushTD: 11, recTD: 1, recs: 28 },
    { id: 20, name: 'Antonio Gibson', pos: 'RB', team: 'NE', passTD: 0, rushTD: 3, recTD: 1, recs: 35 },
    { id: 21, name: 'JaMycal Hasty', pos: 'RB', team: 'NE', passTD: 0, rushTD: 1, recTD: 0, recs: 12 },
    // REMOVED: Stefon Diggs NE - duplicate, he's on HOU now (id: 63)
    { id: 23, name: 'DeMario Douglas', pos: 'WR', team: 'NE', passTD: 0, rushTD: 0, recTD: 4, recs: 68 },
    { id: 24, name: 'Ja\'Lynn Polk', pos: 'WR', team: 'NE', passTD: 0, rushTD: 0, recTD: 3, recs: 42 },
    // REMOVED: Kendrick Bourne NE - duplicate (moved to different team)
    { id: 26, name: 'Javon Baker', pos: 'WR', team: 'NE', passTD: 0, rushTD: 0, recTD: 1, recs: 15 },
    { id: 27, name: 'Kayshon Boutte', pos: 'WR', team: 'NE', passTD: 0, rushTD: 0, recTD: 1, recs: 12 },
    { id: 28, name: 'Hunter Henry', pos: 'TE', team: 'NE', passTD: 0, rushTD: 0, recTD: 6, recs: 58 },
    { id: 29, name: 'Austin Hooper', pos: 'TE', team: 'NE', passTD: 0, rushTD: 0, recTD: 2, recs: 22 },

    { id: 181, name: 'Kyle Williams', pos: 'WR', team: 'NE', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 182, name: 'Efton Chism III', pos: 'WR', team: 'NE', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 183, name: 'Mack Hollins', pos: 'WR', team: 'NE', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 184, name: 'Elijah Mitchell', pos: 'RB', team: 'NE', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // AFC #3 - Jacksonville Jaguars (JAX)
    { id: 30, name: 'Trevor Lawrence', pos: 'QB', team: 'JAX', passTD: 26, rushTD: 9, recTD: 0, recs: 0 },
    // REMOVED: Mac Jones JAX - duplicate (moved to different team)
    { id: 32, name: 'Travis Etienne Jr.', pos: 'RB', team: 'JAX', passTD: 0, rushTD: 7, recTD: 3, recs: 52 },
    // REMOVED: Tank Bigsby JAX - duplicate (moved to different team)
    { id: 34, name: 'D\'Ernest Johnson', pos: 'RB', team: 'JAX', passTD: 0, rushTD: 1, recTD: 1, recs: 15 },
    { id: 35, name: 'Brian Thomas Jr.', pos: 'WR', team: 'JAX', passTD: 0, rushTD: 0, recTD: 9, recs: 65 },
    // REMOVED: Christian Kirk JAX - duplicate (moved to different team)
    // REMOVED: Gabe Davis JAX - duplicate (moved to different team)
    { id: 38, name: 'Parker Washington', pos: 'WR', team: 'JAX', passTD: 0, rushTD: 0, recTD: 4, recs: 55 },
    { id: 39, name: 'Jakobi Meyers', pos: 'WR', team: 'JAX', passTD: 0, rushTD: 0, recTD: 5, recs: 62 },
    { id: 40, name: 'Brenton Strange', pos: 'TE', team: 'JAX', passTD: 0, rushTD: 0, recTD: 3, recs: 32 },
    { id: 41, name: 'Luke Farrell', pos: 'TE', team: 'JAX', passTD: 0, rushTD: 0, recTD: 1, recs: 12 },

    { id: 185, name: 'Bhayshul Tuten', pos: 'RB', team: 'JAX', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 186, name: 'Tim Patrick', pos: 'WR', team: 'JAX', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 187, name: 'Dyami Brown', pos: 'WR', team: 'JAX', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 188, name: 'Hunter Long', pos: 'TE', team: 'JAX', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // AFC #4 - Pittsburgh Steelers (PIT)
    { id: 42, name: 'Aaron Rodgers', pos: 'QB', team: 'PIT', passTD: 23, rushTD: 1, recTD: 0, recs: 0 },
    { id: 43, name: 'Justin Fields', pos: 'QB', team: 'PIT', passTD: 5, rushTD: 8, recTD: 0, recs: 0 },
    { id: 44, name: 'Jaylen Warren', pos: 'RB', team: 'PIT', passTD: 0, rushTD: 6, recTD: 3, recs: 64 },
    { id: 45, name: 'Najee Harris', pos: 'RB', team: 'PIT', passTD: 0, rushTD: 8, recTD: 1, recs: 32 },
    { id: 46, name: 'Kenneth Gainwell', pos: 'RB', team: 'PIT', passTD: 0, rushTD: 4, recTD: 3, recs: 48 },
    { id: 47, name: 'Cordarrelle Patterson', pos: 'RB', team: 'PIT', passTD: 0, rushTD: 2, recTD: 1, recs: 15 },
    { id: 48, name: 'DK Metcalf', pos: 'WR', team: 'PIT', passTD: 0, rushTD: 0, recTD: 6, recs: 72 },
    // REMOVED: George Pickens PIT - traded to DAL (not in playoffs)
    { id: 50, name: 'Adam Thielen', pos: 'WR', team: 'PIT', passTD: 0, rushTD: 0, recTD: 4, recs: 58 },
    { id: 51, name: 'Van Jefferson', pos: 'WR', team: 'PIT', passTD: 0, rushTD: 0, recTD: 2, recs: 25 },
    { id: 52, name: 'Calvin Austin III', pos: 'WR', team: 'PIT', passTD: 0, rushTD: 0, recTD: 2, recs: 22 },
    { id: 56, name: 'Roman Wilson', pos: 'WR', team: 'PIT', passTD: 0, rushTD: 0, recTD: 2, recs: 12, recYds: 166 },
    { id: 53, name: 'Pat Freiermuth', pos: 'TE', team: 'PIT', passTD: 0, rushTD: 0, recTD: 4, recs: 55 },
    { id: 54, name: 'Darnell Washington', pos: 'TE', team: 'PIT', passTD: 0, rushTD: 0, recTD: 1, recs: 18 },
    { id: 55, name: 'Connor Heyward', pos: 'TE', team: 'PIT', passTD: 0, rushTD: 0, recTD: 1, recs: 15 },
    { id: 57, name: 'Jonnu Smith', pos: 'TE', team: 'PIT', passTD: 0, rushTD: 0, recTD: 2, recs: 30, recYds: 220 },

    { id: 189, name: 'Scotty Miller', pos: 'WR', team: 'PIT', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 190, name: 'Kaleb Johnson', pos: 'RB', team: 'PIT', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 191, name: 'Marquez Valdes-Scantling', pos: 'WR', team: 'PIT', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // AFC #5 - Houston Texans (HOU)
    { id: 56, name: 'C.J. Stroud', pos: 'QB', team: 'HOU', passTD: 28, rushTD: 2, recTD: 0, recs: 0 },
    { id: 57, name: 'Davis Mills', pos: 'QB', team: 'HOU', passTD: 1, rushTD: 0, recTD: 0, recs: 0 },
    { id: 58, name: 'Joe Mixon', pos: 'RB', team: 'HOU', passTD: 0, rushTD: 10, recTD: 2, recs: 42 },
    { id: 59, name: 'Woody Marks', pos: 'RB', team: 'HOU', passTD: 0, rushTD: 6, recTD: 1, recs: 25 },
    { id: 60, name: 'Dameon Pierce', pos: 'RB', team: 'HOU', passTD: 0, rushTD: 3, recTD: 0, recs: 12 },
    { id: 61, name: 'Nico Collins', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 6, recs: 88 },
    { id: 62, name: 'Tank Dell', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 1, recTD: 5, recs: 62 },
    { id: 63, name: 'Stefon Diggs', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 7, recs: 95 },
    { id: 64, name: 'John Metchie III', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 2, recs: 32 },
    { id: 65, name: 'Xavier Hutchinson', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 1, recs: 22 },
    { id: 66, name: 'Dalton Schultz', pos: 'TE', team: 'HOU', passTD: 0, rushTD: 0, recTD: 4, recs: 58 },
    { id: 67, name: 'Brevin Jordan', pos: 'TE', team: 'HOU', passTD: 0, rushTD: 0, recTD: 2, recs: 18 },

    { id: 192, name: 'Jayden Higgins', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 193, name: 'Christian Kirk', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 194, name: 'Jaylin Noel', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 195, name: 'Jawhar Jordan', pos: 'RB', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 196, name: 'Nick Chubb', pos: 'RB', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 197, name: 'Cade Stover', pos: 'TE', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 198, name: 'Dare Ogunbowale', pos: 'RB', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 199, name: 'Braxton Berrios', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 200, name: 'Justin Watson', pos: 'WR', team: 'HOU', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // AFC #6 - Buffalo Bills (BUF)
    { id: 68, name: 'Josh Allen', pos: 'QB', team: 'BUF', passTD: 25, rushTD: 14, recTD: 0, recs: 0 },
    { id: 69, name: 'Mitchell Trubisky', pos: 'QB', team: 'BUF', passTD: 1, rushTD: 1, recTD: 0, recs: 0 },
    { id: 70, name: 'James Cook', pos: 'RB', team: 'BUF', passTD: 0, rushTD: 12, recTD: 4, recs: 58 },
    { id: 71, name: 'Ray Davis', pos: 'RB', team: 'BUF', passTD: 0, rushTD: 5, recTD: 1, recs: 15 },
    { id: 72, name: 'Ty Johnson', pos: 'RB', team: 'BUF', passTD: 0, rushTD: 2, recTD: 1, recs: 12 },
    { id: 73, name: 'Khalil Shakir', pos: 'WR', team: 'BUF', passTD: 0, rushTD: 0, recTD: 4, recs: 75 },
    { id: 74, name: 'Keon Coleman', pos: 'WR', team: 'BUF', passTD: 0, rushTD: 0, recTD: 6, recs: 52 },
    { id: 75, name: 'Joshua Palmer', pos: 'WR', team: 'BUF', passTD: 0, rushTD: 0, recTD: 3, recs: 48 },
    // REMOVED: Mack Hollins BUF - duplicate (moved to different team)
    { id: 77, name: 'Curtis Samuel', pos: 'WR', team: 'BUF', passTD: 0, rushTD: 1, recTD: 2, recs: 35 },
    { id: 78, name: 'Dalton Kincaid', pos: 'TE', team: 'BUF', passTD: 0, rushTD: 0, recTD: 5, recs: 72 },
    { id: 79, name: 'Dawson Knox', pos: 'TE', team: 'BUF', passTD: 0, rushTD: 0, recTD: 3, recs: 28 },

    { id: 201, name: 'Brandin Cooks', pos: 'WR', team: 'BUF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 202, name: 'Tyrell Shavers', pos: 'WR', team: 'BUF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 203, name: 'Gabe Davis', pos: 'WR', team: 'BUF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // AFC #7 - Los Angeles Chargers (LAC)
    { id: 80, name: 'Justin Herbert', pos: 'QB', team: 'LAC', passTD: 26, rushTD: 3, recTD: 0, recs: 0 },
    { id: 81, name: 'Easton Stick', pos: 'QB', team: 'LAC', passTD: 0, rushTD: 1, recTD: 0, recs: 0 },
    { id: 82, name: 'Kimani Vidal', pos: 'RB', team: 'LAC', passTD: 0, rushTD: 3, recTD: 2, recs: 38 },
    { id: 83, name: 'Omarion Hampton', pos: 'RB', team: 'LAC', passTD: 0, rushTD: 4, recTD: 1, recs: 15 },
    { id: 84, name: 'Gus Edwards', pos: 'RB', team: 'LAC', passTD: 0, rushTD: 6, recTD: 0, recs: 5 },
    // REMOVED: J.K. Dobbins LAC - duplicate, he's on DEN now (id: 3)
    { id: 86, name: 'Ladd McConkey', pos: 'WR', team: 'LAC', passTD: 0, rushTD: 0, recTD: 6, recs: 82 },
    { id: 87, name: 'Quentin Johnston', pos: 'WR', team: 'LAC', passTD: 0, rushTD: 0, recTD: 8, recs: 45 },
    // REMOVED: Joshua Palmer LAC - duplicate, he's on BUF now (id: 75)
    { id: 89, name: 'Derius Davis', pos: 'WR', team: 'LAC', passTD: 0, rushTD: 1, recTD: 1, recs: 25 },
    { id: 90, name: 'Oronde Gadsden', pos: 'TE', team: 'LAC', passTD: 0, rushTD: 0, recTD: 4, recs: 52 },
    { id: 91, name: 'Will Dissly', pos: 'TE', team: 'LAC', passTD: 0, rushTD: 0, recTD: 1, recs: 18 },
    { id: 92, name: 'Hayden Hurst', pos: 'TE', team: 'LAC', passTD: 0, rushTD: 0, recTD: 1, recs: 12 },

    { id: 204, name: 'Keenan Allen', pos: 'WR', team: 'LAC', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 205, name: 'Tre Harris', pos: 'WR', team: 'LAC', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 206, name: 'Tyler Conklin', pos: 'TE', team: 'LAC', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 207, name: 'KeAndre Lambert-Smith', pos: 'WR', team: 'LAC', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // NFC #1 - Seattle Seahawks (SEA)
    { id: 93, name: 'Sam Darnold', pos: 'QB', team: 'SEA', passTD: 35, rushTD: 4, recTD: 0, recs: 0 },
    { id: 94, name: 'Jalen Milroe', pos: 'QB', team: 'SEA', passTD: 2, rushTD: 5, recTD: 0, recs: 0 },
    { id: 95, name: 'Kenneth Walker III', pos: 'RB', team: 'SEA', passTD: 0, rushTD: 11, recTD: 2, recs: 38 },
    { id: 96, name: 'Zach Charbonnet', pos: 'RB', team: 'SEA', passTD: 0, rushTD: 6, recTD: 1, recs: 32 },
    { id: 97, name: 'Kenny McIntosh', pos: 'RB', team: 'SEA', passTD: 0, rushTD: 1, recTD: 0, recs: 8 },
    { id: 98, name: 'Jaxon Smith-Njigba', pos: 'WR', team: 'SEA', passTD: 0, rushTD: 0, recTD: 10, recs: 119 },
    { id: 101, name: 'Cooper Kupp', pos: 'WR', team: 'SEA', passTD: 0, rushTD: 0, recTD: 8, recs: 88 },
    { id: 100, name: 'Tyler Lockett', pos: 'WR', team: 'SEA', passTD: 0, rushTD: 0, recTD: 5, recs: 62 },
    { id: 102, name: 'Jake Bobo', pos: 'WR', team: 'SEA', passTD: 0, rushTD: 0, recTD: 2, recs: 25 },
    { id: 103, name: 'Noah Fant', pos: 'TE', team: 'SEA', passTD: 0, rushTD: 0, recTD: 4, recs: 52 },
    { id: 104, name: 'AJ Barner', pos: 'TE', team: 'SEA', passTD: 0, rushTD: 0, recTD: 1, recs: 15 },

    { id: 208, name: 'Rashid Shaheed', pos: 'WR', team: 'SEA', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 209, name: 'Drew Lock', pos: 'QB', team: 'SEA', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // NFC #2 - Chicago Bears (CHI)
    { id: 105, name: 'Caleb Williams', pos: 'QB', team: 'CHI', passTD: 25, rushTD: 6, recTD: 0, recs: 0 },
    { id: 106, name: 'Tyson Bagent', pos: 'QB', team: 'CHI', passTD: 1, rushTD: 1, recTD: 0, recs: 0 },
    { id: 107, name: 'D\'Andre Swift', pos: 'RB', team: 'CHI', passTD: 0, rushTD: 9, recTD: 3, recs: 62 },
    { id: 108, name: 'Roschon Johnson', pos: 'RB', team: 'CHI', passTD: 0, rushTD: 4, recTD: 0, recs: 18 },
    { id: 109, name: 'Khalil Herbert', pos: 'RB', team: 'CHI', passTD: 0, rushTD: 2, recTD: 0, recs: 12 },
    { id: 110, name: 'D.J. Moore', pos: 'WR', team: 'CHI', passTD: 0, rushTD: 0, recTD: 6, recs: 85, recYds: 671 },
    { id: 111, name: 'Rome Odunze', pos: 'WR', team: 'CHI', passTD: 0, rushTD: 0, recTD: 6, recs: 58 },
    // REMOVED: Keenan Allen CHI - duplicate (moved to different team)
    { id: 113, name: 'Tyler Scott', pos: 'WR', team: 'CHI', passTD: 0, rushTD: 0, recTD: 1, recs: 22 },
    { id: 114, name: 'Velus Jones Jr.', pos: 'WR', team: 'CHI', passTD: 0, rushTD: 1, recTD: 0, recs: 10 },
    { id: 115, name: 'Cole Kmet', pos: 'TE', team: 'CHI', passTD: 0, rushTD: 0, recTD: 6, recs: 72 },
    { id: 116, name: 'Gerald Everett', pos: 'TE', team: 'CHI', passTD: 0, rushTD: 0, recTD: 2, recs: 28 },

    { id: 210, name: 'Luther Burden III', pos: 'WR', team: 'CHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 211, name: 'Kyle Monangai', pos: 'RB', team: 'CHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 212, name: 'Colston Loveland', pos: 'TE', team: 'CHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 213, name: 'Olamide Zaccheaus', pos: 'WR', team: 'CHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 214, name: 'Travis Homer', pos: 'RB', team: 'CHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 215, name: 'Devin Duvernay', pos: 'WR', team: 'CHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // NFC #3 - Philadelphia Eagles (PHI)
    { id: 117, name: 'Jalen Hurts', pos: 'QB', team: 'PHI', passTD: 25, rushTD: 8, recTD: 0, recs: 0 },
    // REMOVED: Kenny Pickett PHI - traded to LV Raiders (not a playoff team)
    { id: 119, name: 'Saquon Barkley', pos: 'RB', team: 'PHI', passTD: 0, rushTD: 12, recTD: 4, recs: 55 },
    // REMOVED: Kenneth Gainwell PHI - duplicate, he's on PIT now (id: 46)
    { id: 121, name: 'A.J. Brown', pos: 'WR', team: 'PHI', passTD: 0, rushTD: 0, recTD: 7, recs: 92 },
    { id: 122, name: 'DeVonta Smith', pos: 'WR', team: 'PHI', passTD: 0, rushTD: 0, recTD: 4, recs: 85 },
    { id: 123, name: 'Jahan Dotson', pos: 'WR', team: 'PHI', passTD: 0, rushTD: 0, recTD: 3, recs: 38 },
    { id: 124, name: 'Johnny Wilson', pos: 'WR', team: 'PHI', passTD: 0, rushTD: 0, recTD: 1, recs: 12 },
    { id: 125, name: 'Dallas Goedert', pos: 'TE', team: 'PHI', passTD: 0, rushTD: 0, recTD: 11, recs: 58 },
    { id: 126, name: 'Grant Calcaterra', pos: 'TE', team: 'PHI', passTD: 0, rushTD: 0, recTD: 1, recs: 15 },

    { id: 216, name: 'Tank Bigsby', pos: 'RB', team: 'PHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 217, name: 'Will Shipley', pos: 'RB', team: 'PHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 218, name: 'Tanner McKee', pos: 'QB', team: 'PHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 219, name: 'Sam Howell', pos: 'QB', team: 'PHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 220, name: 'Darius Cooper', pos: 'WR', team: 'PHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 221, name: 'A.J. Dillon', pos: 'RB', team: 'PHI', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // NFC #4 - Carolina Panthers (CAR)
    { id: 127, name: 'Bryce Young', pos: 'QB', team: 'CAR', passTD: 21, rushTD: 2, recTD: 0, recs: 0 },
    { id: 128, name: 'Andy Dalton', pos: 'QB', team: 'CAR', passTD: 2, rushTD: 0, recTD: 0, recs: 0 },
    { id: 129, name: 'Chuba Hubbard', pos: 'RB', team: 'CAR', passTD: 0, rushTD: 6, recTD: 2, recs: 42 },
    { id: 130, name: 'Trevor Etienne', pos: 'RB', team: 'CAR', passTD: 0, rushTD: 4, recTD: 0, recs: 15 },
    { id: 131, name: 'Miles Sanders', pos: 'RB', team: 'CAR', passTD: 0, rushTD: 2, recTD: 1, recs: 22 },
    { id: 132, name: 'Tetairoa McMillan', pos: 'WR', team: 'CAR', passTD: 0, rushTD: 0, recTD: 7, recs: 78 },
    { id: 133, name: 'Xavier Legette', pos: 'WR', team: 'CAR', passTD: 0, rushTD: 0, recTD: 5, recs: 45 },
    { id: 134, name: 'Hunter Renfrow', pos: 'WR', team: 'CAR', passTD: 0, rushTD: 0, recTD: 3, recs: 52 },
    // REMOVED: Adam Thielen CAR - duplicate, he's on PIT now (id: 50)
    { id: 136, name: 'Jonathan Mingo', pos: 'WR', team: 'CAR', passTD: 0, rushTD: 0, recTD: 1, recs: 22 },
    { id: 137, name: 'Tommy Tremble', pos: 'TE', team: 'CAR', passTD: 0, rushTD: 0, recTD: 3, recs: 35 },
    { id: 138, name: 'Ja\'Tavion Sanders', pos: 'TE', team: 'CAR', passTD: 0, rushTD: 0, recTD: 1, recs: 18 },

    { id: 222, name: 'Rico Dowdle', pos: 'RB', team: 'CAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 223, name: 'Jalen Coker', pos: 'WR', team: 'CAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 224, name: 'Mitchell Evans', pos: 'TE', team: 'CAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 225, name: 'Jimmy Horn Jr.', pos: 'WR', team: 'CAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // NFC #5 - Los Angeles Rams (LAR)
    { id: 139, name: 'Matthew Stafford', pos: 'QB', team: 'LAR', passTD: 46, rushTD: 0, recTD: 0, recs: 0 },
    { id: 140, name: 'Jimmy Garoppolo', pos: 'QB', team: 'LAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 141, name: 'Kyren Williams', pos: 'RB', team: 'LAR', passTD: 0, rushTD: 10, recTD: 3, recs: 48 },
    { id: 142, name: 'Blake Corum', pos: 'RB', team: 'LAR', passTD: 0, rushTD: 5, recTD: 1, recs: 15 },
    { id: 143, name: 'Ronnie Rivers', pos: 'RB', team: 'LAR', passTD: 0, rushTD: 2, recTD: 0, recs: 12 },
    { id: 144, name: 'Puka Nacua', pos: 'WR', team: 'LAR', passTD: 0, rushTD: 0, recTD: 10, recs: 129 },
    { id: 145, name: 'Davante Adams', pos: 'WR', team: 'LAR', passTD: 0, rushTD: 0, recTD: 14, recs: 60 },
    // REMOVED: Cooper Kupp LAR - duplicate, he's on SEA now (id: 101)
    { id: 147, name: 'Tutu Atwell', pos: 'WR', team: 'LAR', passTD: 0, rushTD: 1, recTD: 4, recs: 42 },
    { id: 148, name: 'Jordan Whittington', pos: 'WR', team: 'LAR', passTD: 0, rushTD: 0, recTD: 2, recs: 28 },
    { id: 149, name: 'Colby Parkinson', pos: 'TE', team: 'LAR', passTD: 0, rushTD: 0, recTD: 5, recs: 62 },
    { id: 150, name: 'Davis Allen', pos: 'TE', team: 'LAR', passTD: 0, rushTD: 0, recTD: 2, recs: 18 },

    { id: 226, name: 'Tyler Higbee', pos: 'TE', team: 'LAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 227, name: 'Terrance Ferguson', pos: 'TE', team: 'LAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 228, name: 'Xavier Smith', pos: 'WR', team: 'LAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 229, name: 'Konata Mumpfield', pos: 'WR', team: 'LAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 230, name: 'Jarquez Hunter', pos: 'RB', team: 'LAR', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // NFC #6 - San Francisco 49ers (SF)
    { id: 151, name: 'Brock Purdy', pos: 'QB', team: 'SF', passTD: 30, rushTD: 3, recTD: 0, recs: 0 },
    // REMOVED: Josh Dobbs SF - duplicate, he's on NE now (id: 17)
    { id: 153, name: 'Christian McCaffrey', pos: 'RB', team: 'SF', passTD: 0, rushTD: 0, recTD: 0, recs: 15, rushYds: 216, recYds: 194 },
    { id: 154, name: 'Brian Robinson Jr.', pos: 'RB', team: 'SF', passTD: 0, rushTD: 7, recTD: 1, recs: 22 },
    { id: 155, name: 'Isaac Guerendo', pos: 'RB', team: 'SF', passTD: 0, rushTD: 4, recTD: 0, recs: 12 },
    { id: 156, name: 'Jordan Mason', pos: 'RB', team: 'SF', passTD: 0, rushTD: 3, recTD: 0, recs: 10 },
    { id: 157, name: 'Deebo Samuel', pos: 'WR', team: 'SF', passTD: 0, rushTD: 5, recTD: 6, recs: 68 },
    { id: 158, name: 'Brandon Aiyuk', pos: 'WR', team: 'SF', passTD: 0, rushTD: 0, recTD: 7, recs: 78 },
    { id: 159, name: 'Jauan Jennings', pos: 'WR', team: 'SF', passTD: 0, rushTD: 0, recTD: 8, recs: 52 },
    { id: 160, name: 'Ricky Pearsall', pos: 'WR', team: 'SF', passTD: 0, rushTD: 0, recTD: 4, recs: 48 },
    { id: 161, name: 'Chris Conley', pos: 'WR', team: 'SF', passTD: 0, rushTD: 0, recTD: 1, recs: 15 },
    { id: 162, name: 'George Kittle', pos: 'TE', team: 'SF', passTD: 0, rushTD: 0, recTD: 9, recs: 82 },
    { id: 163, name: 'Eric Saubert', pos: 'TE', team: 'SF', passTD: 0, rushTD: 0, recTD: 1, recs: 12 },

    { id: 231, name: 'Kendrick Bourne', pos: 'WR', team: 'SF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 232, name: 'Kyle Juszczyk', pos: 'RB', team: 'SF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 233, name: 'Demarcus Robinson', pos: 'WR', team: 'SF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 234, name: 'Mac Jones', pos: 'QB', team: 'SF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 235, name: 'Jordan James', pos: 'RB', team: 'SF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 236, name: 'Skyy Moore', pos: 'WR', team: 'SF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 237, name: 'Jordan Watkins', pos: 'WR', team: 'SF', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    // NFC #7 - Green Bay Packers (GB)
    { id: 164, name: 'Jordan Love', pos: 'QB', team: 'GB', passTD: 23, rushTD: 2, recTD: 0, recs: 0 },
    { id: 165, name: 'Malik Willis', pos: 'QB', team: 'GB', passTD: 2, rushTD: 3, recTD: 0, recs: 0 },
    { id: 166, name: 'Josh Jacobs', pos: 'RB', team: 'GB', passTD: 0, rushTD: 13, recTD: 1, recs: 38 },
    { id: 167, name: 'Emanuel Wilson', pos: 'RB', team: 'GB', passTD: 0, rushTD: 3, recTD: 0, recs: 15 },
    { id: 168, name: 'MarShawn Lloyd', pos: 'RB', team: 'GB', passTD: 0, rushTD: 2, recTD: 0, recs: 10 },
    { id: 169, name: 'Christian Watson', pos: 'WR', team: 'GB', passTD: 0, rushTD: 0, recTD: 6, recs: 42 },
    { id: 170, name: 'Romeo Doubs', pos: 'WR', team: 'GB', passTD: 0, rushTD: 0, recTD: 5, recs: 62, rec2pt: 1 },
    { id: 171, name: 'Jayden Reed', pos: 'WR', team: 'GB', passTD: 0, rushTD: 2, recTD: 4, recs: 75 },
    { id: 172, name: 'Dontayvion Wicks', pos: 'WR', team: 'GB', passTD: 0, rushTD: 0, recTD: 4, recs: 38 },
    { id: 173, name: 'Bo Melton', pos: 'WR', team: 'GB', passTD: 0, rushTD: 0, recTD: 2, recs: 22 },
    { id: 174, name: 'Malik Heath', pos: 'WR', team: 'GB', passTD: 0, rushTD: 0, recTD: 1, recs: 15 },
    { id: 175, name: 'Luke Musgrave', pos: 'TE', team: 'GB', passTD: 0, rushTD: 0, recTD: 3, recs: 32 },
    { id: 176, name: 'Tucker Kraft', pos: 'TE', team: 'GB', passTD: 0, rushTD: 0, recTD: 5, recs: 58 },
    { id: 238, name: 'Matthew Golden', pos: 'WR', team: 'GB', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 239, name: 'Chris Brooks', pos: 'RB', team: 'GB', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 240, name: 'Damien Martinez', pos: 'RB', team: 'GB', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
    { id: 241, name: 'Savion Williams', pos: 'WR', team: 'GB', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },
];

const TEAM_SCHEDULE = {
    'DEN': 'BYE',
    'NE': 'Sat. 1/10 vs LAC',
    'JAX': 'Sun. 1/11 vs BUF',
    'PIT': 'Mon. 1/12 vs HOU',
    'HOU': 'Mon. 1/12 @PIT',
    'BUF': 'Sun. 1/11 @JAX',
    'LAC': 'Sat. 1/10 @NE',
    'SEA': 'BYE',
    'CHI': 'Sun. 1/11 vs GB',
    'PHI': 'Sun. 1/11 vs SF',
    'CAR': 'Sat. 1/10 vs LAR',
    'LAR': 'Sat. 1/10 @CAR',
    'SF': 'Sun. 1/11 @PHI',
    'GB': 'Sun. 1/11 @CHI'
};

const SLOTS = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX1', 'FLEX2'];

// --- Persistence Keys ---
const KEY_LEAGUES = 'ff_leagues_v1';
const KEY_USER = 'ff_user_v1';

// --- State Management ---
let state = {
    currentUser: localStorage.getItem(KEY_USER) || null,
    leagues: [], // ONLY pull leagues from Global Cloud, never load from Local Storage
    currentLeagueId: null,
    view: 'dashboard',
    draftTab: 'board', // board, roster, feed
    selectedTeamName: null, // If set, 'roster' tab shows this team instead of current user
    statTab: 'fantasyPts', // fantasyPts, passTD, etc
    sortCol: 'fantasyPts',
    sortDir: 'desc',
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

    if (!supabase) return;

    for (let l of state.leagues) {
        if (!l.syncCode) {
            l.syncCode = 'FF-' + Math.floor(100000 + Math.random() * 900000);
        }

        console.log(`📡 Syncing League [${l.name}] to Cloud Code: ${l.syncCode}`);
        try {
            const { error } = await supabase
                .from('play_events')
                .insert({
                    game_code: l.syncCode,
                    hand_number: 999,
                    event_type: SYNC_EVENT_TYPE,
                    event_data: { leagues: [l] },
                    player_name: state.currentUser,
                    occurred_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (e) {
            console.warn(`Cloud Sync Failed for ${l.name}`, e);
        }
    }
    updateUI();
};

async function loadFromCloud(syncId) {
    if (!syncId || !supabase) return false;

    console.log("📥 Attempting to Join via Code:", syncId);
    try {
        const { data, error } = await supabase
            .from('play_events')
            .select('*')
            .eq('game_code', syncId)
            .eq('event_type', SYNC_EVENT_TYPE)
            .order('occurred_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            const leagueData = data[0].event_data.leagues[0];
            if (leagueData) {
                leagueData.syncCode = syncId;
                const existingIdx = state.leagues.findIndex(l => l.id === leagueData.id);
                if (existingIdx === -1) {
                    state.leagues.push(leagueData);
                    console.log("✅ Joined New League:", leagueData.name);
                } else {
                    state.leagues[existingIdx] = leagueData;
                    console.log("✅ Updated Existing League:", leagueData.name);
                }
                localStorage.setItem(KEY_LEAGUES, JSON.stringify(state.leagues));
                updateUI();
                return true;
            }
        }
    } catch (e) {
        console.warn("❌ Cloud Join Failed", e);
    }
    return false;
}

window.handleJoinCode = async function () {
    const input = document.getElementById('sync-input');
    const code = input.value.trim().toUpperCase();
    if (!code) return alert('ENTER A CODE');

    const btn = document.querySelector('button[onclick="handleJoinCode()"]');
    const originalText = btn.innerText;
    btn.innerText = 'WAIT...';
    btn.disabled = true;

    const success = await loadFromCloud(code);

    btn.innerText = originalText;
    btn.disabled = false;

    if (success) {
        alert('SUCCESS! LEAGUE(S) ADDED.');
        input.value = '';
        navigate('dashboard-view');
    } else {
        alert('CODE NOT FOUND OR NO CHANGES DETECTED.');
    }
};

/**
 * Searches Supabase for ANY league state where the user is involved.
 * This effectively makes the app "Global" without needing a sync code.
 */
async function refreshGlobalState() {
    if (!supabase) return;
    try {
        const username = state.currentUser || localStorage.getItem(KEY_USER) || '';
        if (!username) return;

        console.log(`📡 Requesting Global Sync for: ${username}...`);

        const [userEvents, recentEvents] = await Promise.all([
            supabase
                .from('play_events')
                .select('*')
                .eq('event_type', SYNC_EVENT_TYPE)
                .eq('player_name', username)
                .order('occurred_at', { ascending: false })
                .limit(50),
            supabase
                .from('play_events')
                .select('*')
                .eq('event_type', SYNC_EVENT_TYPE)
                .order('occurred_at', { ascending: false })
                .limit(200)
        ]);

        const allData = [...(userEvents.data || []), ...(recentEvents.data || [])];
        if (allData.length === 0) {
            console.log("No cloud data found.");
            return false;
        }

        const latestLeaguesMap = {};
        const normalizedUser = username.toLowerCase();
        let foundAnything = false;

        // Sort data by date to process newest snapshots first
        allData.sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));

        allData.forEach(event => {
            if (event.event_data && Array.isArray(event.event_data.leagues)) {
                event.event_data.leagues.forEach(l => {
                    const isCreator = (l.creator || '').toLowerCase() === normalizedUser;
                    const isMember = l.teams && l.teams.some(t => (t.name || '').toLowerCase() === normalizedUser);

                    if (isCreator || isMember) {
                        foundAnything = true;
                        // Rule: First one seen in the sorted list is the newest
                        if (!latestLeaguesMap[l.id]) {
                            latestLeaguesMap[l.id] = l;
                        }
                    }
                });
            }
            // Adopt the sync ID of the absolute most recent event found that includes us
            // Sync Code is now handled per-league inside event_data
        });

        const allLeagues = Object.values(latestLeaguesMap);
        if (allLeagues.length > 0) {
            state.leagues = allLeagues;
            localStorage.setItem(KEY_LEAGUES, JSON.stringify(state.leagues));
            console.log(`🏆 Global Sync Complete: Found ${allLeagues.length} leagues.`);
            updateUI();
            return true;
        }
    } catch (e) {
        console.warn("Global Refresh Failed", e);
    }
    return false;
}

window.forceCloudSync = async function () {
    const btn = document.getElementById('debug-force-sync');
    if (btn) btn.innerText = 'SYNCING...';

    console.log("🌀 Forced Cloud Sync initiated (Full wipe)...");

    // Clear local league cache to ensure we get a fresh build from the cloud
    state.leagues = [];
    localStorage.removeItem(KEY_LEAGUES);

    const recovered = await refreshGlobalState();

    if (recovered) {
        alert(`SUCCESS: Restored ${state.leagues.length} leagues from the cloud.`);
        updateUI();
    } else {
        alert("CLOUD REFRESH COMPLETE: No league data found for your username.");
    }
    if (btn) btn.innerText = 'Force Cloud Sync';
}

window.copyLeagueCode = function (e, code) {
    if (e) e.stopPropagation();
    const val = code || e.target.closest('.sync-code-badge')?.innerText?.split('[')[0]?.trim();
    if (!val) return;

    navigator.clipboard.writeText(val).then(() => {
        const btn = e?.target;
        if (btn && (btn.tagName === 'BUTTON' || btn.tagName === 'SPAN')) {
            const originalText = btn.innerText;
            btn.innerText = 'COPIED!';
            setTimeout(() => btn.innerText = originalText, 2000);
        } else {
            alert("LEAGUE CODE COPIED!");
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
            filter: 'event_type=eq.' + SYNC_EVENT_TYPE
        }, payload => {
            console.log('🚀 Realtime Update Received!', payload);
            if (payload.new && payload.new.event_data && Array.isArray(payload.new.event_data.leagues)) {

                const incomingLeagues = payload.new.event_data.leagues;
                let changedVisible = false;

                incomingLeagues.forEach(inL => {
                    const existingIndex = state.leagues.findIndex(l => l.id === inL.id);
                    const incomingPicks = inL.picks?.length || 0;
                    const incomingDraftStarted = !!(inL.draftOrder && inL.draftOrder.length > 0);

                    if (existingIndex > -1) {
                        const existingPicks = state.leagues[existingIndex].picks?.length || 0;
                        const existingDraftStarted = !!(state.leagues[existingIndex].draftOrder && state.leagues[existingIndex].draftOrder.length > 0);

                        if (incomingPicks > existingPicks || (incomingDraftStarted && !existingDraftStarted)) {
                            console.log(`✅ Updating League: ${inL.name} (Draft: ${incomingDraftStarted ? 'LIVE' : 'WAITING'})`);
                            state.leagues[existingIndex] = inL;
                            if (inL.id === state.currentLeagueId) changedVisible = true;
                        }
                    } else {
                        // Check if we should join this league
                        const normalizedUser = (state.currentUser || '').toLowerCase();
                        if (inL.teams.some(t => t.name.toLowerCase() === normalizedUser) || inL.creator.toLowerCase() === normalizedUser) {
                            console.log(`✨ Auto-Joined New League: ${inL.name}`);
                            state.leagues.push(inL);
                            changedVisible = true;
                        }
                    }
                });

                if (changedVisible) {
                    // If we just got an update for a league we care about, sync our global ID to match if we haven't yet
                    // Sync Code is now handled per-league
                    localStorage.setItem(KEY_LEAGUES, JSON.stringify(state.leagues));
                    updateUI();
                }

                // If on dashboard, refresh to show potential team changes
                if (state.view === 'dashboard') renderLeagues();

                // Pulse the indicator
                const badge = document.querySelector('.live-indicator');
                if (badge) {
                    badge.style.background = '#00ff00';
                    setTimeout(() => badge.style.background = (syncStatus === 'SUBSCRIBED' ? '#4cd964' : '#ff3b30'), 500);
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
async function syncStatsFromESPN() {
    console.log('Syncing stats from ESPN...');
    try {
        const response = await fetch(ESPN_STATS_URL, {
            headers: {
                'X-Fantasy-Filter': JSON.stringify({
                    "players": {
                        "limit": 1500,
                        "sortDraftRank": { "sortPriority": 100, "sortAsc": true },
                        "filterSlotIds": { "value": [0, 2, 4, 6] }
                    }
                })
            }
        });
        const data = await response.json();
        const espnPlayers = data.players || data;

        let matches = 0;
        PLAYERS.forEach(p => {
            const ep = espnPlayers.find(m =>
                (m.player?.fullName || m.fullName)?.toLowerCase() === p.name.toLowerCase()
            );

            if (ep) {
                const pData = ep.player || ep;
                // statSourceId 0 is actual, statSplitTypeId 0 is season total
                const statsObj = pData.stats?.find(s => s.statSourceId === 0 && s.statSplitTypeId === 0)?.stats || {};

                p.passYds = parseFloat(statsObj[STAT_MAP.passYds] || 0);
                p.passTD = parseFloat(statsObj[STAT_MAP.passTD] || 0);
                p.ints = parseFloat(statsObj[STAT_MAP.ints] || 0);
                p.rushYds = parseFloat(statsObj[STAT_MAP.rushYds] || 0);
                p.rushTD = parseFloat(statsObj[STAT_MAP.rushTD] || 0);
                p.recs = parseFloat(statsObj[STAT_MAP.recs] || 0);
                p.recYds = parseFloat(statsObj[STAT_MAP.recYds] || 0);
                p.recTD = parseFloat(statsObj[STAT_MAP.recTD] || 0);
                p.fumbles = parseFloat(statsObj[STAT_MAP.fumbles] || 0);

                // DISABLED: ESPN API returns garbage for 2pt conversions (e.g., Doubs showing 5, CMC showing 14)
                // We will handle these via manual overrides or hardcoded player data
                p.pass2pt = p.pass2pt || 0;
                p.rush2pt = p.rush2pt || 0;
                p.rec2pt = p.rec2pt || 0;

                p.fantasyPts = calculateFantasyPoints(p);
                matches++;
            }
        });
        console.log(`Synced ${matches} players core stats from ESPN.`);
        const l = getActiveLeague();
        if (l) renderDraftUI(l);
    } catch (err) {
        console.error('ESPN Sync Failed:', err);
    }
}

function calculateFantasyPoints(p) {
    const l = getActiveLeague();
    const s = l?.scoring || DEFAULT_SCORING;

    let pts = 0;
    pts += (p.passYds || 0) * (s.passYds || 0);
    pts += (p.passTD || 0) * (s.passTD || 0);
    pts += (p.ints || 0) * (s.ints || 0);
    pts += (p.rushYds || 0) * (s.rushYds || 0);
    pts += (p.rushTD || 0) * (s.rushTD || 0);
    pts += (p.recs || 0) * (s.recs || 0);
    pts += (p.recYds || 0) * (s.recYds || 0);
    pts += (p.recTD || 0) * (s.recTD || 0);
    pts += (p.fumbles || 0) * (s.fumbles || 0);
    pts += (p.pass2pt || 0) * (s.pass2pt || 0);
    pts += (p.rush2pt || 0) * (s.rush2pt || 0);
    pts += (p.rec2pt || 0) * (s.rec2pt || 0);

    return parseFloat(pts.toFixed(2));
}

function getPointsBreakdown(p) {
    const l = getActiveLeague();
    const s = l?.scoring || DEFAULT_SCORING;
    const lines = [];

    const check = (val, mult, label) => {
        if (val) lines.push(`${label}: ${val} * ${mult} = ${(val * mult).toFixed(2)}`);
    };

    check(p.passYds, s.passYds, "Pass Yds");
    check(p.passTD, s.passTD, "Pass TDs");
    check(p.ints, s.ints, "Ints");
    check(p.rushYds, s.rushYds, "Rush Yds");
    check(p.rushTD, s.rushTD, "Rush TDs");
    check(p.recs, s.recs, "Recs");
    check(p.recYds, s.recYds, "Rec Yds");
    check(p.recTD, s.recTD, "Rec TDs");
    check(p.fumbles, s.fumbles, "Fumbles");
    check(p.pass2pt, s.pass2pt, "Pass 2pt");
    check(p.rush2pt, s.rush2pt, "Rush 2pt");
    check(p.rec2pt, s.rec2pt, "Rec 2pt");

    return lines.length ? lines.join('\n') : "No points scored";
}

function normalizePlayers() {
    PLAYERS.forEach(p => {
        p.passYds = p.passYds || 0; p.ints = p.ints || 0;
        p.rushYds = p.rushYds || 0; p.recYds = p.recYds || 0;
        p.fumbles = p.fumbles || 0;
        // Preserving manual 2pt conversion overrides
        p.pass2pt = p.pass2pt || 0;
        p.rush2pt = p.rush2pt || 0;
        p.rec2pt = p.rec2pt || 0;
        p.fantasyPts = calculateFantasyPoints(p);
    });
}

async function initApp() {
    console.log(`FF v${VERSION} Initializing...`);
    normalizePlayers();
    syncStatsFromESPN();

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

    // 3. Migration: If any league is missing a sync code, generate and save now
    const needsMigration = state.leagues.some(l => !l.syncCode);
    if (needsMigration) {
        console.log("🛠 Migrating legacy leagues to unique sync codes...");
        await saveSession();
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
    if (state.view === 'settings') renderSettings(l);
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
            const teamName = state.selectedTeamName || state.currentUser;
            if (state.draftTab === 'roster' && teamName) {
                html += `<span class="active">${teamName}</span>`;
            } else {
                html += `<span class="active">DRAFT</span>`;
            }
        } else if (state.view === 'settings') {
            html += `<span class="active">SETTINGS</span>`;
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

    // Reset roster view when leaving draft/team view
    if (view !== 'draft') state.selectedTeamName = null;

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
                    ${l.syncCode ? `
                        <button onclick="toggleLeagueCode(event)" class="btn-mini" style="opacity: 0.3; border:none; background:transparent;">Show Code</button>
                        <div class="league-code-container sync-code-badge hidden" style="margin-top:4px;">
                            <span>${l.syncCode}</span>
                            <button onclick="window.copyLeagueCode(event, '${l.syncCode}')" class="btn-mini text-link" style="padding:0; margin-left:8px; font-size:0.6rem;">[COPY]</button>
                        </div>
                    ` : `
                        <span style="font-size:0.6rem; color:var(--red); font-weight:800;">SYNCING...</span>
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
                ${l.syncCode ? `
                <div style="text-align:right;">
                    <button onclick="toggleLeagueCode(event)" class="btn-mini" style="opacity: 0.3; border:none; background:transparent;">Show Code</button>
                    <div class="league-code-container sync-code-badge hidden" style="margin-top:4px;">
                        <span>${l.syncCode}</span>
                        <button onclick="window.copyLeagueCode(event, '${l.syncCode}')" class="btn-mini text-link" style="padding:0; margin-left:8px; font-size:0.6rem;">[COPY]</button>
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

    html += l.teams.map(t => {
        const teamScore = t.roster.reduce((sum, rp) => {
            const p = PLAYERS.find(pp => pp.id === rp.id);
            return sum + (p ? calculateFantasyPoints(p) : 0);
        }, 0);

        return `
            <div class="table-row">
                <div style="font-weight: 800; color: #1a73e8; cursor: pointer;" onclick="viewTeamRoster('${t.name}')">
                    ${t.name} ${t.name.toLowerCase() === state.currentUser.toLowerCase() ? '<span style="color:var(--red)">(YOU)</span>' : ''}
                </div>
                <div style="font-weight: 800; color: var(--red);">${teamScore.toFixed(2)}</div>
                <div style="font-size: 0.8rem; color: var(--gray); font-weight: 600;">${SLOTS.length - t.roster.length} UNDRAFTED</div>
            </div>
        `;
    }).join('');

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

function renderSettings(l) {
    const list = document.getElementById('scoring-settings-list');
    const adminActions = document.getElementById('settings-admin-actions');
    if (!list || !l) return;

    const s = l.scoring || DEFAULT_SCORING;
    const isAdminUser = isAdmin();

    adminActions.classList.toggle('hidden', !isAdminUser);

    const labels = {
        passYds: "Pass Yards (Multiplier)",
        rushYds: "Rush Yards (Multiplier)",
        recYds: "Rec Yards (Multiplier)",
        passTD: "Pass TDs",
        rushTD: "Rush TDs",
        recTD: "Rec TDs",
        recs: "Receptions",
        pass2pt: "Pass 2pt Conversion",
        rush2pt: "Rush 2pt Conversion",
        rec2pt: "Rec 2pt Conversion",
        ints: "Interceptions",
        fumbles: "Fumbles Lost"
    };

    list.innerHTML = Object.keys(DEFAULT_SCORING).map(key => `
        <div class="form-group mb-0">
            <label style="font-size: 0.65rem; color: var(--gray);">${labels[key].toUpperCase()}</label>
            <input type="number" step="0.001" value="${s[key]}" 
                   data-score-key="${key}" 
                   ${!isAdminUser ? 'disabled' : ''} 
                   style="font-weight: 800; padding: 8px; border-radius: 8px; border: 1px solid var(--border); width: 100%; ${!isAdminUser ? 'opacity: 0.6; background: #f9f9f9;' : ''}">
        </div>
    `).join('');
}

function renderDraftUI(l) {
    if (!l) return;

    // Toggle Tab Content Visibilty
    const tabs = ['board', 'roster', 'feed'];
    tabs.forEach(t => {
        const el = document.getElementById(`tab-content-${t}`);
        if (el) el.classList.toggle('hidden', state.draftTab !== t);

        const btn = document.querySelector(`[data-draft-tab="${t}"]`);
        if (btn) btn.classList.toggle('active', state.draftTab === t);
    });

    if (state.draftTab === 'board') {
        renderFilters(l);
        renderPlayerList(l);

        // Update Stat Tabs
        const stats = ['fantasyPts', 'passYds', 'passTD', 'rushYds', 'rushTD', 'recs', 'recYds', 'recTD'];
        stats.forEach(s => {
            const btn = document.querySelector(`[data-stat-tab="${s}"]`);
            if (btn) btn.classList.toggle('active', state.statTab === s);
        });
    } else if (state.draftTab === 'roster') {
        renderRoster(l);
    } else if (state.draftTab === 'feed') {
        renderDraftFeed(l);
    }

    // Update Draft Status
    const statusBadge = document.getElementById('draft-status-badge');
    if (statusBadge) {
        const pickNum = (l.currentPick || 0) + 1;
        const totalPicks = (l.draftOrder || []).length;
        if (pickNum > totalPicks && totalPicks > 0) {
            statusBadge.innerText = "DRAFT COMPLETE";
            statusBadge.className = "badge-red";
        } else {
            statusBadge.innerText = `Pick ${pickNum}`;
            statusBadge.className = "badge-red";
        }
    }
}

window.viewTeamRoster = (teamName) => {
    state.selectedTeamName = teamName;
    state.draftTab = 'roster';
    state.view = 'draft';
    showSection('draft-view');
    updateUI();
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

window.toggleSort = (col) => {
    if (state.sortCol === col) {
        state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
    } else {
        state.sortCol = col;
        state.sortDir = 'desc';
    }
    // Sync statTab with sortCol if it's a known stat tab
    const validTabs = ['fantasyPts', 'passYds', 'passTD', 'rushYds', 'rushTD', 'recs', 'recYds', 'recTD'];
    if (validTabs.includes(col)) {
        state.statTab = col;
    }
    updateUI();
};

function renderPlayerList(l) {
    const listEl = document.getElementById('player-list');
    if (!listEl) return;

    const picked = (l.picks || []).map(p => p.playerId);
    const query = state.search ? state.search.toLowerCase() : '';

    const filtered = PLAYERS.filter(p => {
        const isPicked = picked.includes(p.id);
        const showDrafted = state.filters.avail.includes('drafted');
        const showUndrafted = state.filters.avail.includes('undrafted');
        if (!showDrafted && isPicked) return false;
        if (!showUndrafted && !isPicked) return false;

        if (state.filters.pos.length > 0) {
            const flexPos = ['WR', 'RB', 'TE'];
            const matchPos = state.filters.pos.some(f => {
                if (f === 'FLEX') return flexPos.includes(p.pos);
                return p.pos === f;
            });
            if (!matchPos) return false;
        }

        if (state.filters.team.length > 0 && !state.filters.team.includes(p.team)) return false;
        if (query && !p.name.toLowerCase().includes(query) && !p.team.toLowerCase().includes(query)) return false;
        return true;
    });

    // Sorting Logic
    filtered.sort((a, b) => {
        let valA = a[state.sortCol] || 0;
        let valB = b[state.sortCol] || 0;

        // Special case: fantasyPts needs to be calculated dynamically
        if (state.sortCol === 'fantasyPts') {
            valA = calculateFantasyPoints(a);
            valB = calculateFantasyPoints(b);
        }

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return state.sortDir === 'desc' ? 1 : -1;
        if (valA > valB) return state.sortDir === 'desc' ? -1 : 1;
        return 0;
    });

    const currentPicker = (l.draftOrder || [])[l.currentPick];
    const isMyTurn = currentPicker && currentPicker.name.toLowerCase() === state.currentUser.toLowerCase();
    const pickNumTotal = (l.currentPick || 0) + 1;

    const getSortIcon = (col) => {
        if (state.sortCol !== col) return '<span style="opacity:0.2;">⇅</span>';
        return state.sortDir === 'desc' ? '↓' : '↑';
    };

    listEl.innerHTML = `
        <div class="table-wrapper" style="overflow-x: auto; background: white; border-radius: 12px; border: 1px solid var(--border);">
            <table class="simple-table">
                <thead>
                    <tr>
                        <th onclick="toggleSort('name')" style="cursor:pointer; min-width:160px; white-space:nowrap;">PLAYER ${getSortIcon('name')}</th>
                        <th onclick="toggleSort('team')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;">TEAM ${getSortIcon('team')}</th>
                        <th onclick="toggleSort('pos')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;">POS ${getSortIcon('pos')}</th>
                        <th onclick="toggleSort('fantasyPts')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;" class="${state.statTab === 'fantasyPts' ? 'active-col' : ''}">POINTS ${getSortIcon('fantasyPts')}</th>
                        <th onclick="toggleSort('passYds')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;" class="${state.statTab === 'passYds' ? 'active-col' : ''}">PASS YDS ${getSortIcon('passYds')}</th>
                        <th onclick="toggleSort('passTD')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;" class="${state.statTab === 'passTD' ? 'active-col' : ''}">PASS TD ${getSortIcon('passTD')}</th>
                        <th onclick="toggleSort('rushYds')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;" class="${state.statTab === 'rushYds' ? 'active-col' : ''}">RUSH YDS ${getSortIcon('rushYds')}</th>
                        <th onclick="toggleSort('rushTD')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;" class="${state.statTab === 'rushTD' ? 'active-col' : ''}">RUSH TD ${getSortIcon('rushTD')}</th>
                        <th onclick="toggleSort('recs')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;" class="${state.statTab === 'recs' ? 'active-col' : ''}">RECS ${getSortIcon('recs')}</th>
                        <th onclick="toggleSort('recYds')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;" class="${state.statTab === 'recYds' ? 'active-col' : ''}">REC YDS ${getSortIcon('recYds')}</th>
                        <th onclick="toggleSort('recTD')" style="cursor:pointer; white-space:nowrap; padding: 0 10px;" class="${state.statTab === 'recTD' ? 'active-col' : ''}">REC TD ${getSortIcon('recTD')}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="player-table-body"></tbody>
            </table>
        </div>
    `;

    const tbody = document.getElementById('player-table-body');
    filtered.forEach(p => {
        const isPicked = picked.includes(p.id);
        const tr = document.createElement('tr');
        if (isPicked) tr.className = 'picked';

        tr.innerHTML = `
            <td style="white-space:nowrap;"><div class="p-name">${p.name}</div></td>
            <td style="text-align:center; font-weight:800; color:var(--gray); padding: 0 10px;">${p.team}</td>
            <td style="text-align:center; font-weight:800; color:var(--gray); padding: 0 10px;">${p.pos}</td>
            <td class="stat-cell ${state.statTab === 'fantasyPts' ? 'active' : ''}" 
                style="text-align:center; padding: 0 10px; color: var(--red); font-weight:bold; cursor:help;"
                title="${getPointsBreakdown(p)}">${calculateFantasyPoints(p)}</td>
            <td class="stat-cell ${state.statTab === 'passYds' ? 'active' : ''}" style="text-align:center; padding: 0 10px;">${Math.round(p.passYds || 0)}</td>
            <td class="stat-cell ${state.statTab === 'passTD' ? 'active' : ''}" style="text-align:center; padding: 0 10px;">${p.passTD || 0}</td>
            <td class="stat-cell ${state.statTab === 'rushYds' ? 'active' : ''}" style="text-align:center; padding: 0 10px;">${Math.round(p.rushYds || 0)}</td>
            <td class="stat-cell ${state.statTab === 'rushTD' ? 'active' : ''}" style="text-align:center; padding: 0 10px;">${p.rushTD || 0}</td>
            <td class="stat-cell ${state.statTab === 'recs' ? 'active' : ''}" style="text-align:center; padding: 0 10px;">${p.recs || 0}</td>
            <td class="stat-cell ${state.statTab === 'recYds' ? 'active' : ''}" style="text-align:center; padding: 0 10px;">${Math.round(p.recYds || 0)}</td>
            <td class="stat-cell ${state.statTab === 'recTD' ? 'active' : ''}" style="text-align:center; padding: 0 10px;">${p.recTD || 0}</td>
            <td class="action-cell" style="padding: 10px 20px; text-align:right;"></td>
        `;

        if (!isPicked && isMyTurn) {
            const team = l.teams.find(t => t.name.toLowerCase() === state.currentUser.toLowerCase());
            const canDraft = team ? canDraftPosition(p, team.roster) : false;

            if (canDraft) {
                const btn = document.createElement('button');
                btn.className = 'btn primary btn-sm';
                btn.innerText = `Pick`;
                btn.onclick = () => draftPlayer(p.id);
                tr.querySelector('.action-cell').appendChild(btn);
            } else {
                const badge = document.createElement('span');
                badge.className = 'badge-locked';
                badge.innerText = 'SLOT FULL';
                tr.querySelector('.action-cell').appendChild(badge);
            }
        }
        tbody.appendChild(tr);
    });

    if (filtered.length === 0) {
        listEl.innerHTML = '<div class="p-12 text-center opacity-30 font-bold">NO MATCHES FOUND</div>';
    }
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

function canDraftPosition(player, roster) {
    const currentRosterMap = getTeamRosterMap(roster);
    if (player.pos === 'QB') {
        return !currentRosterMap['QB'];
    } else if (['RB', 'WR', 'TE'].includes(player.pos)) {
        const slotsToCheck = [];
        if (player.pos === 'RB') slotsToCheck.push('RB1', 'RB2');
        if (player.pos === 'WR') slotsToCheck.push('WR1', 'WR2');
        if (player.pos === 'TE') slotsToCheck.push('TE');
        slotsToCheck.push('FLEX1', 'FLEX2');
        return slotsToCheck.some(s => !currentRosterMap[s]);
    }
    return false;
}

window.draftPlayer = (playerId) => {
    const l = getActiveLeague();
    const picker = l.draftOrder[l.currentPick];
    if (!picker || picker.name.toLowerCase() !== state.currentUser.toLowerCase()) return;

    const player = PLAYERS.find(p => p.id === playerId);
    const team = l.teams.find(t => t.name === picker.name);

    if (!canDraftPosition(player, team.roster)) {
        alert(`NO SLOTS AVAILABLE FOR ${player.name} (${player.pos})`);
        return;
    }

    team.roster.push(player);
    l.picks.push({
        playerId,
        owner: team.name,
        pickNum: (l.currentPick || 0) + 1,
        pos: player.pos,
        team: player.team
    });
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
    const grid = document.getElementById('roster-grid-main');
    if (!grid) return;

    const targetTeamName = state.selectedTeamName || state.currentUser;
    const team = l.teams.find(t => t.name.toLowerCase() === targetTeamName.toLowerCase());

    if (!team) {
        grid.innerHTML = '<div class="text-center font-bold p-8">TEAM NOT FOUND</div>';
        return;
    }

    const map = getTeamRosterMap(team.roster);

    // Build roster table with "Next Game" and cleaner aesthetics
    let tableHTML = `
        <table class="simple-table roster-premium-table">
            <thead>
                <tr>
                    <th style="padding: 14px 16px;">SLOT</th>
                    <th style="padding: 14px 16px;">PLAYER</th>
                    <th style="padding: 14px 16px;">TEAM</th>
                    <th style="padding: 14px 16px;">NEXT GAME</th>
                    <th style="padding: 14px 16px; text-align: center;">POS</th>
                    <th style="padding: 14px 16px; text-align: center; color: var(--red);">POINTS</th>
                    <th style="padding: 14px 16px; text-align: center;">PASS YDS</th>
                    <th style="padding: 14px 16px; text-align: center;">PASS TD</th>
                    <th style="padding: 14px 16px; text-align: center;">RUSH YDS</th>
                    <th style="padding: 14px 16px; text-align: center;">RUSH TD</th>
                </tr>
            </thead>
            <tbody>
    `;

    SLOTS.forEach(slot => {
        const p = map[slot];

        if (p) {
            const pts = calculateFantasyPoints(p);
            const nextGame = TEAM_SCHEDULE[p.team] || 'TBD';

            tableHTML += `
                <tr>
                    <td style="padding: 14px 16px; font-weight: 800; color: var(--gray); font-size: 0.7rem;">${slot}</td>
                    <td style="padding: 14px 16px; font-weight: 800;">
                        <div class="p-name" style="font-size:0.9rem;">${p.name}</div>
                    </td>
                    <td style="padding: 14px 16px; font-weight: 800; color: var(--gray); font-size: 0.8rem;">${p.team}</td>
                    <td style="padding: 14px 16px; font-weight: 600; font-size: 0.75rem; color: #444;">${nextGame}</td>
                    <td style="text-align: center; padding: 14px 16px; font-weight: 800; color: var(--gray);">${p.pos}</td>
                    <td style="text-align: center; padding: 14px 16px; font-weight: 800; color: var(--red); font-size: 0.9rem;">${pts.toFixed(2)}</td>
                    <td style="text-align: center; padding: 14px 16px; font-size: 0.85rem; font-weight: 600;">${Math.round(p.passYds || 0).toLocaleString()}</td>
                    <td style="text-align: center; padding: 14px 16px; font-size: 0.85rem; font-weight: 600;">${p.passTD || 0}</td>
                    <td style="text-align: center; padding: 14px 16px; font-size: 0.85rem; font-weight: 600;">${Math.round(p.rushYds || 0).toLocaleString()}</td>
                    <td style="text-align: center; padding: 14px 16px; font-size: 0.85rem; font-weight: 600;">${p.rushTD || 0}</td>
                </tr>
            `;
        } else {
            tableHTML += `
                <tr style="opacity: 0.3;">
                    <td style="padding: 14px 16px; font-weight: 800; color: var(--gray); font-size: 0.7rem;">${slot}</td>
                    <td colspan="9" style="padding: 14px 16px; font-style: italic; font-size: 0.8rem;">Empty</td>
                </tr>
            `;
        }
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    grid.innerHTML = tableHTML;
}

// Global state for feed filter
let feedTeamFilter = null; // null means "All Teams"

function renderDraftFeed(l) {
    const feedEl = document.getElementById('unified-draft-feed');
    const filterMenu = document.getElementById('feed-team-filter-menu');
    if (!feedEl || !l) return;

    // Populate team filter menu
    if (filterMenu) {
        const teams = l.teams || [];
        filterMenu.innerHTML = `
            <div class="dropdown-item ${feedTeamFilter === null ? 'active' : ''}" 
                 onclick="setFeedTeamFilter(null)">
                All Teams
            </div>
            ${teams.map(t => `
                <div class="dropdown-item ${feedTeamFilter === t.name ? 'active' : ''}" 
                     onclick="setFeedTeamFilter('${t.name}')">
                    ${t.name.toUpperCase()}
                </div>
            `).join('')}
        `;
    }

    // Update filter display
    const filterDisplay = document.getElementById('feed-filter-display');
    if (filterDisplay) {
        filterDisplay.innerText = feedTeamFilter ? feedTeamFilter.toUpperCase() : 'All Teams';
    }

    feedEl.innerHTML = '';
    const pickNum = l.currentPick || 0;
    const totalPicks = (l.draftOrder || []).length;
    const picks = l.picks || [];

    // Create unified array of all draft events (past and future)
    const allEvents = [];

    // Add all past picks
    picks.forEach((pk, idx) => {
        const p = PLAYERS.find(pp => pp.id === pk.playerId);
        allEvents.push({
            type: 'pick',
            pickNum: pk.pickNum,
            owner: pk.owner,
            player: p,
            timestamp: pk.timestamp || idx
        });
    });

    // Add upcoming picks
    const upcomingCount = Math.min(totalPicks - pickNum, 20); // Show next 20 picks
    for (let i = 0; i < upcomingCount; i++) {
        const turn = l.draftOrder[pickNum + i];
        if (turn) {
            allEvents.push({
                type: 'upcoming',
                pickNum: pickNum + i + 1,
                owner: turn.name,
                player: null,
                isCurrent: i === 0
            });
        }
    }

    // Filter by team if selected
    const filteredEvents = feedTeamFilter
        ? allEvents.filter(e => e.owner.toLowerCase() === feedTeamFilter.toLowerCase())
        : allEvents;

    // Render all events
    if (filteredEvents.length === 0) {
        feedEl.innerHTML = '<div class="p-12 text-center opacity-30 font-bold">NO PICKS FOR THIS TEAM</div>';
        return;
    }

    filteredEvents.forEach(event => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #eee;';

        if (event.type === 'upcoming') {
            // Upcoming pick - green style
            if (event.isCurrent) {
                div.style.cssText += ' background: rgba(76, 217, 100, 0.1); border-left: 3px solid var(--green);';
            }
            div.innerHTML = `
                <span style="font-weight: 700; color: ${event.isCurrent ? 'var(--green)' : 'var(--gray)'}; min-width: 80px;">PICK ${event.pickNum}</span>
                <span style="flex: 1; text-align: right; font-weight: 800;">${event.owner.toUpperCase()} ${event.isCurrent ? '🏈' : ''}</span>
            `;
        } else {
            // Past pick - show player info on one line
            const playerInfo = event.player
                ? `${event.player.name} <span style="color: var(--gray); font-weight: 600;">${event.player.pos} • ${event.player.team}</span>`
                : 'Unknown Player';

            div.innerHTML = `
                <span style="font-weight: 700; color: var(--gray); min-width: 80px;">#${event.pickNum}</span>
                <span style="flex: 1; font-weight: 700;">${playerInfo}</span>
                <span style="font-weight: 800; min-width: 120px; text-align: right;">${event.owner.toUpperCase()}</span>
            `;
        }

        feedEl.appendChild(div);
    });

    // Auto-scroll to current pick on initial load
    if (!feedTeamFilter && pickNum > 0) {
        const currentPickEl = feedEl.querySelector('.feed-item.active');
        if (currentPickEl) {
            setTimeout(() => {
                currentPickEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
}

window.toggleFeedTeamFilter = function (event) {
    event.stopPropagation();
    const menu = document.getElementById('feed-team-filter-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
};

window.setFeedTeamFilter = function (teamName) {
    feedTeamFilter = teamName;
    const menu = document.getElementById('feed-team-filter-menu');
    if (menu) menu.classList.add('hidden');

    const l = getActiveLeague();
    if (l) renderDraftFeed(l);
};

// Close feed filter when clicking outside
document.addEventListener('click', () => {
    const menu = document.getElementById('feed-team-filter-menu');
    if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
    }
});


// --- Event Handlers ---
function setupListeners() {
    // Auth
    // Auth
    document.getElementById('login-btn').onclick = async () => {
        const input = document.getElementById('login-username').value.trim();
        if (!input) return alert('NAME REQUIRED');

        const btn = document.getElementById('login-btn');
        const originalText = btn.innerText;
        btn.innerText = 'SYNCING LEAGUES...';
        btn.disabled = true;

        const normalized = input.toLowerCase();

        // 1. Global Search: Clear local first to enforce cloud-only source of truth
        console.log("Searching Supabase for user records...");
        state.currentUser = input;
        state.leagues = [];
        localStorage.removeItem(KEY_LEAGUES);
        await refreshGlobalState();

        const isAaron = normalized === 'aaron';
        let isKnown = state.leagues.some(l =>
            l.creator.toLowerCase() === normalized ||
            l.teams.some(t => t.name.toLowerCase() === normalized)
        );

        if (isAaron || isKnown) {
            await saveSession();
            initApp();
        } else {
            btn.innerText = originalText;
            btn.disabled = false;
            state.currentUser = null;
            alert(`USER "${input}" NOT FOUND IN ANY CLOUD RECORDS. ENSURE YOU CREATED A LEAGUE ON YOUR OTHER DEVICE FIRST.`);
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

    // Settings
    document.getElementById('show-settings-btn').onclick = () => {
        const l = getActiveLeague();
        navigate('settings', l.id);
    };

    document.getElementById('settings-back-btn').onclick = () => {
        const l = getActiveLeague();
        navigate('league-detail', l.id);
    };

    document.getElementById('save-settings-btn').onclick = () => {
        const l = getActiveLeague();
        if (!isAdmin()) return;

        const inputs = document.querySelectorAll('#scoring-settings-list input');
        const newScoring = {};
        inputs.forEach(input => {
            const key = input.dataset.scoreKey;
            newScoring[key] = parseFloat(input.value) || 0;
        });

        l.scoring = newScoring;
        normalizePlayers(); // Recalculate fantasy pts for everyone
        saveSession();
        alert("SETTINGS SAVED AND SCORES RECALCULATED.");
        navigate('league-detail', l.id);
    };

    // League Creation
    document.getElementById('save-league-btn').onclick = () => {
        const name = document.getElementById('league-name').value.trim();
        if (!name) return alert('LEAGUE NAME REQUIRED');

        const newLeague = {
            id: 'l_' + Date.now(),
            name,
            creator: state.currentUser,
            teams: [{ name: state.currentUser, roster: [], score: 0 }],
            scoring: { ...DEFAULT_SCORING },
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

    // Tab Switching
    document.addEventListener('click', (e) => {
        const draftTab = e.target.closest('[data-draft-tab]');
        if (draftTab) {
            state.draftTab = draftTab.dataset.draftTab;
            // If clicking the tab manually, reset selected team to show own roster
            if (state.draftTab === 'roster') state.selectedTeamName = null;
            const l = getActiveLeague();
            renderDraftUI(l);
        }

        // Stat Selection Tabs
        const statTab = e.target.closest('[data-stat-tab]');
        if (statTab) {
            state.statTab = statTab.dataset.statTab;
            const l = getActiveLeague();
            renderDraftUI(l);
        }
    });
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
        <div class="mb-2"><strong>VER:</strong> ${VERSION}</div>
        <div class="mb-2"><strong>LEAGUES:</strong> ${state.leagues.length}</div>
        <div class="mb-4"><strong>AUTH:</strong> ${[...new Set(users)].join(', ') || 'NONE'}</div>
        <button id="debug-force-sync" onclick="forceCloudSync()" class="btn primary p-2 w-full" style="font-size: 0.6rem;">Force Cloud Sync</button>
    `;
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    setupListeners();
    initApp();
});
