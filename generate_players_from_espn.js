#!/usr/bin/env node

/**
 * Script to generate a complete PLAYERS array from ESPN API for 2025 season
 * This eliminates the need for manual hardcoded player data
 */

const playoffTeams = {
    'DEN': 'Denver Broncos',
    'NE': 'New England Patriots',
    'JAX': 'Jacksonville Jaguars',
    'PIT': 'Pittsburgh Steelers',
    'HOU': 'Houston Texans',
    'BUF': 'Buffalo Bills',
    'LAC': 'Los Angeles Chargers',
    'SEA': 'Seattle Seahawks',
    'CHI': 'Chicago Bears',
    'PHI': 'Philadelphia Eagles',
    'CAR': 'Carolina Panthers',
    'LAR': 'Los Angeles Rams',
    'SF': 'San Francisco 49ers',
    'GB': 'Green Bay Packers'
};

const ESPN_STATS_URL = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/players?view=kona_player_info';

async function fetchAllPlayersFromESPN() {
    console.log('Fetching all 2025 players from ESPN API...\n');

    try {
        const response = await fetch(ESPN_STATS_URL, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        const espnPlayers = data.players || data;

        console.log(`Total players from ESPN: ${espnPlayers.length}\n`);

        // Filter for playoff teams and generate player objects
        const playoffPlayers = [];
        let playerId = 1;

        Object.keys(playoffTeams).forEach(teamAbbr => {
            const teamPlayers = espnPlayers.filter(ep => {
                const player = ep.player || ep;
                const proTeam = player.proTeamAbbreviation || '';
                return proTeam === teamAbbr || proTeam === (teamAbbr === 'JAX' ? 'JAC' : '');
            });

            console.log(`${teamAbbr}: ${teamPlayers.length} players`);

            teamPlayers.forEach(ep => {
                const player = ep.player || ep;
                const stats = player.stats?.find(s => s.statSourceId === 0 && s.statSplitTypeId === 0)?.stats || {};

                //  position mapping
                const posMap = { 1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE' };
                const pos = posMap[player.defaultPositionId] || 'FLEX';

                // Only include QB, RB, WR, TE
                if (!['QB', 'RB', 'WR', 'TE'].includes(pos)) return;

                const playerObj = {
                    id: playerId++,
                    name: player.fullName || 'Unknown',
                    pos: pos,
                    team: teamAbbr,
                    passTD: parseInt(stats['4'] || 0),
                    rushTD: parseInt(stats['25'] || 0),
                    recTD: parseInt(stats['43'] || 0),
                    recs: parseInt(stats['53'] || 0),
                    passYds: parseInt(stats['3'] || 0),
                    rushYds: parseInt(stats['24'] || 0),
                    recYds: parseInt(stats['42'] || 0)
                };

                playoffPlayers.push(playerObj);
            });
        });

        console.log(`\nTotal playoff players: ${playoffPlayers.length}\n`);

        // Generate JavaScript code
        const jsCode = `const PLAYERS = [\n${playoffPlayers.map(p =>
            `    { id: ${p.id}, name: '${p.name}', pos: '${p.pos}', team: '${p.team}', passTD: ${p.passTD}, rushTD: ${p.rushTD}, recTD: ${p.recTD}, recs: ${p.recs}, passYds: ${p.passYds}, rushYds: ${p.rushYds}, recYds: ${p.recYds} }`
        ).join(',\n')}\n];`;

        // Save to file
        const fs = require('fs');
        fs.writeFileSync('GENERATED_PLAYERS_ARRAY.js', jsCode);

        console.log('✅ Generated PLAYERS array saved to: GENERATED_PLAYERS_ARRAY.js');
        console.log('\nTo use: Copy the contents and replace the PLAYERS array in app.js');

    } catch (error) {
        console.error('Error fetching from ESPN:', error.message);
    }
}

fetchAllPlayersFromESPN();
