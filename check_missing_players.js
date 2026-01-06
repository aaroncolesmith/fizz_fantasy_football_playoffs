#!/usr/bin/env node

const fs = require('fs');

// FantasyPros players (from browser extraction)
const fantasyProsPlayers = `Christian McCaffrey | SF | RB
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
Quentin Johnston | LAC | WR`.split('\n').map(line => {
    const parts = line.split(' | ');
    return { name: parts[0].trim(), team: parts[1].trim(), pos: parts[2].trim() };
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

// Playoff teams only
const playoffTeams = ['DEN', 'NE', 'JAX', 'JAC', 'PIT', 'HOU', 'BUF', 'LAC', 'SEA', 'CHI', 'PHI', 'CAR', 'LAR', 'SF', 'GB'];

console.log('MISSING PLAYERS FROM FANTASY PROS TOP 50:\n');
let missingCount = 0;

fantasyProsPlayers.forEach(fp => {
    // Normalize team (JAC vs JAX)
    const fpTeam = fp.team === 'JAC' ? 'JAX' : fp.team;

    // Only check playoff teams
    if (!playoffTeams.includes(fpTeam)) return;

    // Check if we have this player
    const found = ourPlayers.find(p => {
        const nameMatch = p.name.toLowerCase() === fp.name.toLowerCase() ||
            p.name.toLowerCase().includes(fp.name.toLowerCase()) ||
            fp.name.toLowerCase().includes(p.name.toLowerCase());
        const teamMatch = p.team === fpTeam;
        const posMatch = p.pos === fp.pos;
        return nameMatch && teamMatch && posMatch;
    });

    if (!found) {
        console.log(`❌ MISSING: ${fp.name.padEnd(25)} ${fpTeam.padEnd(5)} ${fp.pos}`);
        missingCount++;
    }
});

console.log(`\nTotal missing players: ${missingCount}`);
console.log(`Our player count: ${ourPlayers.length}`);
