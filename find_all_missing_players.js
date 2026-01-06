#!/usr/bin/env node

const fs = require('fs');

// Complete FantasyPros Top 200+ from browser extraction
const fantasyProsData = `Christian McCaffrey | SF | RB
Puka Nacua | LAR | WR
Saquon Barkley | PHI | RB
Travis Etienne Jr. | JAC | RB
James Cook III | BUF | RB
Jaxon Smith-Njigba | SEA | WR
Davante Adams | LAR | WR
Kyren Williams | LAR | RB
Stefon Diggs | NE | WR
DeVonta Smith | PHI | WR
TreVeyon Henderson | NE | RB
A.J. Brown | PHI | WR
RJ Harvey | DEN | RB
Nico Collins | HOU | WR
Kenneth Walker III | SEA | RB
Khalil Shakir | BUF | WR
Courtland Sutton | DEN | WR
Josh Jacobs | GB | RB
Rhamondre Stevenson | NE | RB
Jakobi Meyers | JAC | WR
D'Andre Swift | CHI | RB
Blake Corum | LAR | RB
Jauan Jennings | SF | WR
George Kittle | SF | TE
Josh Allen | BUF | QB
Parker Washington | JAC | WR
Matthew Stafford | LAR | QB
Ladd McConkey | LAC | WR
Drake Maye | NE | QB
Luther Burden III | CHI | WR
Brian Thomas Jr. | JAC | WR
Christian Watson | GB | WR
Woody Marks | HOU | RB
Ricky Pearsall | SF | WR
Jalen Hurts | PHI | QB
DJ Moore | CHI | WR
Zach Charbonnet | SEA | RB
Dallas Goedert | PHI | TE
DK Metcalf | PIT | WR
Troy Franklin | DEN | WR
Omarion Hampton | LAC | RB
Jaylen Warren | PIT | RB
Tetairoa McMillan | CAR | WR
Rome Odunze | CHI | WR
Quentin Johnston | LAC | WR
Kayshon Boutte | NE | WR
Jayden Higgins | HOU | WR
Kenneth Gainwell | PIT | RB
Bo Nix | DEN | QB
Keenan Allen | LAC | WR
Jayden Reed | GB | WR
Kyle Monangai | CHI | RB
Bhayshul Tuten | JAC | RB
Cooper Kupp | SEA | WR
Rashid Shaheed | SEA | WR
Romeo Doubs | GB | WR
Rico Dowdle | CAR | RB
Brandin Cooks | BUF | WR
Brock Purdy | SF | QB
Trevor Lawrence | JAC | QB
DeMario Douglas | NE | WR
Hunter Henry | NE | TE
Kyle Williams | NE | WR
Ty Johnson | BUF | RB
Pat Bryant | DEN | WR
Dalton Kincaid | BUF | TE
Colston Loveland | CHI | TE
Caleb Williams | CHI | QB
Chuba Hubbard | CAR | RB
Marvin Mims Jr. | DEN | WR
Tank Bigsby | PHI | RB
Joshua Palmer | BUF | WR
Sam Darnold | SEA | QB
Brian Robinson Jr. | SF | RB
Tyrell Shavers | BUF | WR
Keon Coleman | BUF | WR
Christian Kirk | HOU | WR
Dontayvion Wicks | GB | WR
Jaylin Noel | HOU | WR
Xavier Legette | CAR | WR
Matthew Golden | GB | WR
Ray Davis | BUF | RB
Justin Herbert | LAC | QB
Emanuel Wilson | GB | RB
J.K. Dobbins | DEN | RB
Jalen Coker | CAR | WR
Jordan Love | GB | QB
Tyler Higbee | LAR | TE
C.J. Stroud | HOU | QB
Jahan Dotson | PHI | WR
Kendrick Bourne | SF | WR
Brenton Strange | JAC | TE
Adam Thielen | PIT | WR
Tutu Atwell | LAR | WR
Dalton Schultz | HOU | TE
Aaron Rodgers | PIT | QB
Tim Patrick | JAC | WR
Tre Harris | LAC | WR
Bryce Young | CAR | QB
Dawson Knox | BUF | TE
AJ Barner | SEA | TE
Kimani Vidal | LAC | RB
Dyami Brown | JAC | WR
Calvin Austin III | PIT | WR
Colby Parkinson | LAR | TE
Oronde Gadsden II | LAC | TE
Evan Engram | DEN | TE
Gabe Davis | BUF | WR
Pat Freiermuth | PIT | TE
Terrance Ferguson | LAR | TE
Jaleel McLaughlin | DEN | RB
Elijah Moore | DEN | WR
Luke Musgrave | GB | TE
Roman Wilson | PIT | WR
Cole Kmet | CHI | TE
Jawhar Jordan | HOU | RB
Austin Hooper | NE | TE
Jonnu Smith | PIT | TE
Nick Chubb | HOU | RB
Kyle Juszczyk | SF | RB
Cade Stover | HOU | TE
Tommy Tremble | CAR | TE
Will Shipley | PHI | RB
Ronnie Rivers | LAR | RB
Mitchell Evans | CAR | TE
Demarcus Robinson | SF | WR
Xavier Smith | LAR | WR
Adam Trautman | DEN | TE
Hunter Long | JAC | TE
Malik Willis | GB | QB
Tanner McKee | PHI | QB
Will Dissly | LAC | TE
Tyler Conklin | LAC | TE
Jimmy Garoppolo | LAR | QB
Tyler Badie | DEN | RB
Lil'Jordan Humphrey | DEN | WR
Mitchell Trubisky | BUF | QB
Efton Chism III | NE | WR
Dare Ogunbowale | HOU | RB
Mac Jones | SF | QB
Scotty Miller | PIT | WR
Sam Howell | PHI | QB
Tyson Bagent | CHI | QB
Olamide Zaccheaus | CHI | WR
Konata Mumpfield | LAR | WR
Joshua Dobbs | NE | QB
Kaleb Johnson | PIT | RB
Jordan Whittington | LAR | WR
Marquez Valdes-Scantling | PIT | WR
Jake Bobo | SEA | WR
Davis Mills | HOU | QB
Isaac Guerendo | SF | RB
Chris Brooks | GB | RB
Jarquez Hunter | LAR | RB
Mack Hollins | NE | WR
Darius Cooper | PHI | WR
Drew Lock | SEA | QB
Elijah Mitchell | NE | RB
Jimmy Horn Jr. | CAR | WR
KeAndre Lambert-Smith | LAC | WR
Trevor Etienne | CAR | RB
Xavier Hutchinson | HOU | WR
Damien Martinez | GB | RB
Jordan James | SF | RB
Curtis Samuel | BUF | WR
A.J. Dillon | PHI | RB
Travis Homer | CHI | RB
Derius Davis | LAC | WR
Hunter Renfrow | CAR | WR
Skyy Moore | SF | WR
Devin Duvernay | CHI | WR
Braxton Berrios | HOU | WR
Savion Williams | GB | WR
Justin Watson | HOU | WR
Jordan Watkins | SF | WR`;

const fantasyProsPlayers = fantasyProsData.split('\n').map(line => {
    const parts = line.split(' | ');
    return {
        name: parts[0].trim(),
        team: parts[1].trim() === 'JAC' ? 'JAX' : parts[1].trim(), // Normalize
        pos: parts[2].trim()
    };
});

// Read our PLAYERS array
const content = fs.readFileSync('app.js', 'utf8');
const playerRegex = /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)',\s*pos:\s*'([^']+)',\s*team:\s*'([^']+)'/g;
const ourPlayers = [];
let match;

while ((match = playerRegex.exec(content)) !== null) {
    ourPlayers.push({
        id: match[1],
        name: match[2],
        pos: match[3],
        team: match[4]
    });
}

const playoffTeams = ['DEN', 'NE', 'JAX', 'PIT', 'HOU', 'BUF', 'LAC', 'SEA', 'CHI', 'PHI', 'CAR', 'LAR', 'SF', 'GB'];

console.log('=== COMPREHENSIVE MISSING PLAYER ANALYSIS ===\n');
const missingPlayers = [];

fantasyProsPlayers.forEach(fp => {
    // Only check playoff teams
    if (!playoffTeams.includes(fp.team)) return;

    // Try various name matching strategies
    const found = ourPlayers.find(p => {
        // Exact match
        if (p.name === fp.name && p.team === fp.team && p.pos === fp.pos) return true;

        // Case insensitive match
        if (p.name.toLowerCase() === fp.name.toLowerCase() && p.team === fp.team && p.pos === fp.pos) return true;

        // Without punctuation (D.J. vs DJ)
        const ourNameNoPunct = p.name.replace(/[.']/g, '');
        const fpNameNoPunct = fp.name.replace(/[.']/g, '');
        if (ourNameNoPunct.toLowerCase() === fpNameNoPunct.toLowerCase() && p.team === fp.team && p.pos === fp.pos) return true;

        // Contains match
        if (p.name.toLowerCase().includes(fp.name.toLowerCase()) && p.team === fp.team && p.pos === fp.pos) return true;
        if (fp.name.toLowerCase().includes(p.name.toLowerCase()) && p.team === fp.team && p.pos === fp.pos) return true;

        // Handle "III" suffix
        if ((p.name + ' III').toLowerCase() === fp.name.toLowerCase() && p.team === fp.team && p.pos === fp.pos) return true;
        if (p.name.toLowerCase() === (fp.name + ' III').toLowerCase() && p.team === fp.team && p.pos === fp.pos) return true;

        return false;
    });

    if (!found) {
        missingPlayers.push(fp);
    }
});

console.log(`Missing ${missingPlayers.length} players from FantasyPros Top 200:\n`);
missingPlayers.forEach((p, idx) => {
    console.log(`${(idx + 1).toString().padStart(3)}. ${p.name.padEnd(30)} ${p.team.padEnd(5)} ${p.pos}`);
});

console.log(`\n\nTotal missing: ${missingPlayers.length}`);
console.log(`Our current count: ${ourPlayers.length}`);
console.log(`\nGenerating player entries...\n`);

// Generate the JavaScript code to add these players
let nextId = Math.max(...ourPlayers.map(p => parseInt(p.id))) + 1;
const groupedByTeam = {};

missingPlayers.forEach(p => {
    if (!groupedByTeam[p.team]) groupedByTeam[p.team] = [];
    groupedByTeam[p.team].push(p);
});

console.log('// ADD THESE MISSING PLAYERS TO app.js:\n');
Object.keys(groupedByTeam).sort().forEach(team => {
    console.log(`\n    // Missing ${team} players:`);
    groupedByTeam[team].forEach(p => {
        console.log(`    { id: ${nextId++}, name: '${p.name}', pos: '${p.pos}', team: '${p.team}', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },`);
    });
});

// Save to file for easy copying
fs.writeFileSync('missing_players_to_add.txt', missingPlayers.map((p, idx) =>
    `${idx + 1}. ${p.name} (${p.team} ${p.pos})`
).join('\n'));

console.log('\n\n✅ Missing players list saved to: missing_players_to_add.txt');
