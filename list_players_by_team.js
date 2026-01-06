#!/usr/bin/env node

const fs = require('fs');

const content = fs.readFileSync('app.js', 'utf8');

// Extract all player entries
const playerRegex = /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)',\s*pos:\s*'([^']+)',\s*team:\s*'([^']+)'/g;
const players = [];
let match;

while ((match = playerRegex.exec(content)) !== null) {
    players.push({
        id: match[1],
        name: match[2],
        pos: match[3],
        team: match[4]
    });
}

// Group by team
const byTeam = {};
players.forEach(p => {
    if (!byTeam[p.team]) byTeam[p.team] = [];
    byTeam[p.team].push(p);
});

console.log('PLAYERS BY TEAM:\n');
Object.keys(byTeam).sort().forEach(team => {
    console.log(`${team} (${byTeam[team].length} players):`);
    byTeam[team].sort((a, b) => a.name.localeCompare(b.name)).forEach(p => {
        console.log(`  ${p.pos.padEnd(3)} ${p.name}`);
    });
    console.log('');
});

console.log(`Total unique players: ${players.length}`);
console.log(`Total teams: ${Object.keys(byTeam).length}`);
