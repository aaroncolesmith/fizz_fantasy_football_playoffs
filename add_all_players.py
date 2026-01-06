#!/usr/bin/env python3
"""
Script to add all 66 missing players to app.js and remove 7 duplicates.
Python handles string escaping and file manipulation better than JavaScript.
"""

import re

# Missing players organized by team
MISSING_PLAYERS = {
    'BUF': [
        {'name': 'Brandin Cooks', 'pos': 'WR'},
        {'name': 'Tyrell Shavers', 'pos': 'WR'},
        {'name': 'Gabe Davis', 'pos': 'WR'},
    ],
    'CAR': [
        {'name': 'Rico Dowdle', 'pos': 'RB'},
        {'name': 'Jalen Coker', 'pos': 'WR'},
        {'name': 'Mitchell Evans', 'pos': 'TE'},
        {'name': 'Jimmy Horn Jr.', 'pos': 'WR'},
    ],
    'CHI': [
        {'name': 'Luther Burden III', 'pos': 'WR'},
        {'name': 'Kyle Monangai', 'pos': 'RB'},
        {'name': 'Colston Loveland', 'pos': 'TE'},
        {'name': 'Olamide Zaccheaus', 'pos': 'WR'},
        {'name': 'Travis Homer', 'pos': 'RB'},
        {'name': 'Devin Duvernay', 'pos': 'WR'},
    ],
    'DEN': [
        {'name': 'Pat Bryant', 'pos': 'WR'},
        {'name': 'Jaleel McLaughlin', 'pos': 'RB'},
        {'name': 'Elijah Moore', 'pos': 'WR'},
        {'name': "Lil'Jordan Humphrey", 'pos': 'WR'},
    ],
    'GB': [
        {'name': 'Matthew Golden', 'pos': 'WR'},
        {'name': 'Chris Brooks', 'pos': 'RB'},
        {'name': 'Damien Martinez', 'pos': 'RB'},
        {'name': 'Savion Williams', 'pos': 'WR'},
    ],
    'HOU': [
        {'name': 'Jayden Higgins', 'pos': 'WR'},
        {'name': 'Christian Kirk', 'pos': 'WR'},
        {'name': 'Jaylin Noel', 'pos': 'WR'},
        {'name': 'Jawhar Jordan', 'pos': 'RB'},
        {'name': 'Nick Chubb', 'pos': 'RB'},
        {'name': 'Cade Stover', 'pos': 'TE'},
        {'name': 'Dare Ogunbowale', 'pos': 'RB'},
        {'name': 'Braxton Berrios', 'pos': 'WR'},
        {'name': 'Justin Watson', 'pos': 'WR'},
    ],
    'JAX': [
        {'name': 'Bhayshul Tuten', 'pos': 'RB'},
        {'name': 'Tim Patrick', 'pos': 'WR'},
        {'name': 'Dyami Brown', 'pos': 'WR'},
        {'name': 'Hunter Long', 'pos': 'TE'},
    ],
    'LAC': [
        {'name': 'Keenan Allen', 'pos': 'WR'},
        {'name': 'Tre Harris', 'pos': 'WR'},
        {'name': 'Tyler Conklin', 'pos': 'TE'},
        {'name': 'KeAndre Lambert-Smith', 'pos': 'WR'},
    ],
    'LAR': [
        {'name': 'Tyler Higbee', 'pos': 'TE'},
        {'name': 'Terrance Ferguson', 'pos': 'TE'},
        {'name': 'Xavier Smith', 'pos': 'WR'},
        {'name': 'Konata Mumpfield', 'pos': 'WR'},
        {'name': 'Jarquez Hunter', 'pos': 'RB'},
    ],
    'NE': [
        {'name': 'Kyle Williams', 'pos': 'WR'},
        {'name': 'Efton Chism III', 'pos': 'WR'},
        {'name': 'Mack Hollins', 'pos': 'WR'},
        {'name': 'Elijah Mitchell', 'pos': 'RB'},
    ],
    'PHI': [
        {'name': 'Tank Bigsby', 'pos': 'RB'},
        {'name': 'Will Shipley', 'pos': 'RB'},
        {'name': 'Tanner McKee', 'pos': 'QB'},
        {'name': 'Sam Howell', 'pos': 'QB'},
        {'name': 'Darius Cooper', 'pos': 'WR'},
        {'name': 'A.J. Dillon', 'pos': 'RB'},
    ],
    'PIT': [
        {'name': 'Scotty Miller', 'pos': 'WR'},
        {'name': 'Kaleb Johnson', 'pos': 'RB'},
        {'name': 'Marquez Valdes-Scantling', 'pos': 'WR'},
    ],
    'SEA': [
        {'name': 'Rashid Shaheed', 'pos': 'WR'},
        {'name': 'Drew Lock', 'pos': 'QB'},
    ],
    'SF': [
        {'name': 'Kendrick Bourne', 'pos': 'WR'},
        {'name': 'Kyle Juszczyk', 'pos': 'RB'},
        {'name': 'Demarcus Robinson', 'pos': 'WR'},
        {'name': 'Mac Jones', 'pos': 'QB'},
        {'name': 'Jordan James', 'pos': 'RB'},
        {'name': 'Skyy Moore', 'pos': 'WR'},
        {'name': 'Jordan Watkins', 'pos': 'WR'},
    ],
}

# Players to remove (duplicates - old team entries)
PLAYERS_TO_REMOVE = [
    ('Christian Kirk', 'JAX'),  # Now at HOU
    ('Gabe Davis', 'JAX'),  # Now at BUF
    ('Keenan Allen', 'CHI'),  # Now at LAC
    ('Kendrick Bourne', 'NE'),  # Now at SF
    ('Mac Jones', 'JAX'),  # Now at SF
    ('Mack Hollins', 'BUF'),  # Now at NE
    ('Tank Bigsby', 'JAX'),  # Now at PHI
]

# Team section markers
TEAM_MARKERS = {
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
    'GB': '// NFC #7 - Green Bay Packers (GB)',
}

def escape_name(name):
    """Properly escape apostrophes in player names for JavaScript."""
    return name.replace("'", "\\'")

def main():
    print("=" * 60)
    print("ADDING 66 MISSING PLAYERS TO app.js")
    print("=" * 60)
    
    # Read the file
    with open('app.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the highest player ID
    id_pattern = r'\{\s*id:\s*(\d+)'
    ids = [int(m.group(1)) for m in re.finditer(id_pattern, content)]
    next_id = max(ids) + 1
    
    print(f"\nStarting ID: {next_id}")
    
    # Split content into lines for easier manipulation
    lines = content.split('\n')
    
    # First, remove duplicate players
    print(f"\n📝 Removing {len(PLAYERS_TO_REMOVE)} duplicate players...")
    for name, team in PLAYERS_TO_REMOVE:
        # Find and comment out the duplicate
        for i, line in enumerate(lines):
            if f"name: '{name}'" in line and f"team: '{team}'" in line:
                old_line = lines[i]
                lines[i] = f"    // REMOVED: {name} {team} - duplicate (moved to different team)"
                print(f"   ✓ Removed: {name} ({team})")
                break
    
    # Now add missing players team by team
    total_added = 0
    for team, marker in TEAM_MARKERS.items():
        if team not in MISSING_PLAYERS:
            continue
            
        players = MISSING_PLAYERS[team]
        if not players:
            continue
        
        print(f"\n📝 Adding {len(players)} players to {team}...")
        
        # Find the team section
        team_line_idx = None
        for i, line in enumerate(lines):
            if marker in line:
                team_line_idx = i
                break
        
        if team_line_idx is None:
            print(f"   ⚠️  Could not find section for {team}")
            continue
        
        # Find the end of this team's section (next team marker or end of array)
        insert_idx = None
        for i in range(team_line_idx + 1, len(lines)):
            # Look for next team comment or end of PLAYERS array
            if lines[i].strip().startswith('//') and any(m in lines[i] for m in ['AFC', 'NFC']):
                insert_idx = i
                break
            if '];' in lines[i]:
                insert_idx = i
                break
        
        if insert_idx is None:
            print(f"   ⚠️  Could not find insertion point for {team}")
            continue
        
        # Generate player entries
        new_lines = []
        for player in players:
            escaped_name = escape_name(player['name'])
            player_line = f"    {{ id: {next_id}, name: '{escaped_name}', pos: '{player['pos']}', team: '{team}', passTD: 0, rushTD: 0, recTD: 0, recs: 0 }},"
            new_lines.append(player_line)
            print(f"   ✓ Adding: {player['name']} ({player['pos']})")
            next_id += 1
            total_added += 1
        
        # Insert before the next section
        lines[insert_idx:insert_idx] = new_lines
    
    # Join lines back together
    new_content = '\n'.join(lines)
    
    # Write back to file
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("\n" + "=" * 60)
    print(f"✅ SUCCESS!")
    print(f"   Added: {total_added} players")
    print(f"   Removed: {len(PLAYERS_TO_REMOVE)} duplicates")
    print(f"   Final player count: {next_id - 1}")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Verify the changes in app.js")
    print("2. Test the application")
    print("3. Commit the changes")

if __name__ == '__main__':
    main()
