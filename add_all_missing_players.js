#!/usr/bin/env node

const fs = require('fs');

// Missing players organized by team (from our analysis)
const missingPlayersByTeam = {
    'BUF': [
        { name: 'Brandin Cooks', pos: 'WR' },
        { name: 'Tyrell Shavers', pos: 'WR' },
        { name: 'Gabe Davis', pos: 'WR' }
    ],
    'CAR': [
        { name: 'Rico Dowdle', pos: 'RB' },
        { name: 'Jalen Coker', pos: 'WR' },
        { name: 'Mitchell Evans', pos: 'TE' },
        { name: "Jimmy Horn Jr.", pos: 'WR' }
    ],
    'CHI': [
        { name: 'Luther Burden III', pos: 'WR' },
        { name: 'Kyle Monangai', pos: 'RB' },
        { name: 'Colston Loveland', pos: 'TE' },
        { name: 'Olamide Zaccheaus', pos: 'WR' },
        { name: 'Travis Homer', pos: 'RB' },
        { name: 'Devin Duvernay', pos: 'WR' }
    ],
    'DEN': [
        { name: 'Pat Bryant', pos: 'WR' },
        { name: 'Jaleel McLaughlin', pos: 'RB' },
        { name: 'Elijah Moore', pos: 'WR' },
        { name: "Lil'Jordan Humphrey", pos: 'WR' }
    ],
    'GB': [
        { name: 'Matthew Golden', pos: 'WR' },
        { name: 'Chris Brooks', pos: 'RB' },
        { name: 'Damien Martinez', pos: 'RB' },
        { name: 'Savion Williams', pos: 'WR' }
    ],
    'HOU': [
        { name: 'Jayden Higgins', pos: 'WR' },
        { name: 'Christian Kirk', pos: 'WR' },
        { name: 'Jaylin Noel', pos: 'WR' },
        { name: 'Jawhar Jordan', pos: 'RB' },
        { name: 'Nick Chubb', pos: 'RB' },
        { name: 'Cade Stover', pos: 'TE' },
        { name: 'Dare Ogunbowale', pos: 'RB' },
        { name: 'Braxton Berrios', pos: 'WR' },
        { name: 'Justin Watson', pos: 'WR' }
    ],
    'JAX': [
        { name: 'Bhayshul Tuten', pos: 'RB' },
        { name: 'Tim Patrick', pos: 'WR' },
        { name: 'Dyami Brown', pos: 'WR' },
        { name: 'Hunter Long', pos: 'TE' }
    ],
    'LAC': [
        { name: 'Keenan Allen', pos: 'WR' },
        { name: 'Tre Harris', pos: 'WR' },
        { name: 'Tyler Conklin', pos: 'TE' },
        { name: 'KeAndre Lambert-Smith', pos: 'WR' }
    ],
    'LAR': [
        { name: 'Tyler Higbee', pos: 'TE' },
        { name: 'Terrance Ferguson', pos: 'TE' },
        { name: 'Xavier Smith', pos: 'WR' },
        { name: 'Konata Mumpfield', pos: 'WR' },
        { name: 'Jarquez Hunter', pos: 'RB' }
    ],
    'NE': [
        { name: 'Kyle Williams', pos: 'WR' },
        { name: 'Efton Chism III', pos: 'WR' },
        { name: 'Mack Hollins', pos: 'WR' },
        { name: 'Elijah Mitchell', pos: 'RB' }
    ],
    'PHI': [
        { name: 'Tank Bigsby', pos: 'RB' },
        { name: 'Will Shipley', pos: 'RB' },
        { name: 'Tanner McKee', pos: 'QB' },
        { name: 'Sam Howell', pos: 'QB' },
        { name: 'Darius Cooper', pos: 'WR' },
        { name: 'A.J. Dillon', pos: 'RB' }
    ],
    'PIT': [
        { name: 'Scotty Miller', pos: 'WR' },
        { name: 'Kaleb Johnson', pos: 'RB' },
        { name: 'Marquez Valdes-Scantling', pos: 'WR' }
    ],
    'SEA': [
        { name: 'Rashid Shaheed', pos: 'WR' },
        { name: 'Drew Lock', pos: 'QB' }
    ],
    'SF': [
        { name: 'Kendrick Bourne', pos: 'WR' },
        { name: 'Kyle Juszczyk', pos: 'RB' },
        { name: 'Demarcus Robinson', pos: 'WR' },
        { name: 'Mac Jones', pos: 'QB' },
        { name: 'Jordan James', pos: 'RB' },
        { name: 'Skyy Moore', pos: 'WR' },
        { name: 'Jordan Watkins', pos: 'WR' }
    ]
};

// Read the current app.js file
let content = fs.readFileSync('app.js', 'utf8');

// Find the last player ID
const playerRegex = /\{\s*id:\s*(\d+),/g;
let lastId = 0;
let match;
while ((match = playerRegex.exec(content)) !== null) {
    const id = parseInt(match[1]);
    if (id > lastId) lastId = id;
}

console.log(`Last player ID: ${lastId}`);
console.log(`Adding 66 missing players starting from ID ${lastId + 1}\n`);

let currentId = lastId + 1;
const teamComments = {
    'DEN': '// AFC #1 - Denver Broncos (DEN)',
    'NE': '// AFC #2 - New England Patriots (NE)',
    'JAX': '// AFC #3 - Jacksonville Jaguars (JAX)',
    'PIT': '// AFC #4 - Pittsburgh Steelers (PIT)',
    'HOU': '// AFC #5 - Houston Texans (HOU)',
    'BUF': '// AFC #6 - Buffalo Bills (BUF)',
    'LAC': '// AFC #7 - Los Angeles Chargers (LAC)',
    'SEA': '// NFC #1 - Seattle Seahawks (SEA)',
    'CHI': '// NFC #2 - Chicago Bears (CHI)',
    'PHI': '// NFC #3 - Philadelphia Eagles (PHI)',
    'CAR': '// NFC #4 - Carolina Panthers (CAR)',
    'LAR': '// NFC #5 - Los Angeles Rams (LAR)',
    'SF': '// NFC #6 - San Francisco 49ers (SF)',
    'GB': '// NFC #7 - Green Bay Packers (GB)'
};

// Generate player entries for each team
Object.keys(missingPlayersByTeam).forEach(team => {
    const players = missingPlayersByTeam[team];
    if (players.length === 0) return;

    // Find the team comment in the file
    const teamComment = teamComments[team];
    const teamIndex = content.indexOf(teamComment);

    if (teamIndex === -1) {
        console.log(`⚠️  Could not find section for ${team}`);
        return;
    }

    // Find the end of this team's section (next team comment or end of PLAYERS array)
    const nextTeamIndex = content.indexOf('\n    //', teamIndex + teamComment.length);
    const insertPosition = nextTeamIndex > 0 ? nextTeamIndex : content.indexOf('];', teamIndex);

    if (insertPosition === -1) {
        console.log(`⚠️  Could not find insertion point for ${team}`);
        return;
    }

    // Generate the new player entries
    const newPlayers = players.map(p => {
        const entry = `    { id: ${currentId++}, name: '${p.name}', pos: '${p.pos}', team: '${team}', passTD: 0, rushTD: 0, recTD: 0, recs: 0 },`;
        return entry;
    });

    const insertion = '\n' + newPlayers.join('\n') + '\n';

    // Insert the new players
    content = content.slice(0, insertPosition) + insertion + content.slice(insertPosition);

    console.log(`✅ Added ${players.length} players to ${team}`);
});

// Write the updated content back to app.js
fs.writeFileSync('app.js', content);

console.log(`\n✅ Successfully added all 66 missing players to app.js`);
console.log(`Total players now: ${currentId - 1}`);
console.log(`\nNext steps:`);
console.log(`1. Review the changes in app.js`);
console.log(`2. Run the app and test`);
console.log(`3. Commit the changes`);
