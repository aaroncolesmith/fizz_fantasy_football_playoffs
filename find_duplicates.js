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
        team: match[4],
        line: content.substring(0, match.index).split('\n').length
    });
}

// Find duplicates by name
const nameCount = {};
players.forEach(p => {
    if (!nameCount[p.name]) nameCount[p.name] = [];
    nameCount[p.name].push(p);
});

console.log('DUPLICATE PLAYERS FOUND:\n');
let hasDuplicates = false;

Object.keys(nameCount).sort().forEach(name => {
    if (nameCount[name].length > 1) {
        hasDuplicates = true;
        console.log(`${name}:`);
        nameCount[name].forEach(p => {
            console.log(`  - ID ${p.id}: ${p.pos} ${p.team} (line ${p.line})`);
        });
        console.log('');
    }
});

if (!hasDuplicates) {
    console.log('No duplicates found!');
}

console.log(`\nTotal players: ${players.length}`);
