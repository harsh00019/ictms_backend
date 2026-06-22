require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const College = require('./models/College');
const Tournament = require('./models/Tournament');
const Team = require('./models/Team');
const Player = require('./models/Player');
const Match = require('./models/Match');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ictms';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');

    // Clear DB
    await User.deleteMany();
    await College.deleteMany();
    await Tournament.deleteMany();
    await Team.deleteMany();
    await Player.deleteMany();
    await Match.deleteMany();
    console.log('All collections cleared!');

    // 1. Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@ictms.com',
      password: 'password123',
      role: 'admin'
    });
    console.log('Admin user created');

    // 2. Create Colleges
    const colleges = await College.create([
      {
        name: 'Massachusetts Institute of Technology',
        code: 'MIT',
        logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&h=100&fit=crop',
        address: 'Cambridge, MA',
        contactEmail: 'athletics@mit.edu'
      },
      {
        name: 'Stanford University',
        code: 'STAN',
        logo: 'https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?w=100&h=100&fit=crop',
        address: 'Stanford, CA',
        contactEmail: 'sports@stanford.edu'
      },
      {
        name: 'Harvard University',
        code: 'HARV',
        logo: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=100&h=100&fit=crop',
        address: 'Cambridge, MA',
        contactEmail: 'crimson@harvard.edu'
      }
    ]);
    console.log('Colleges created');

    const mitId = colleges[0]._id;
    const stanId = colleges[1]._id;
    const harvId = colleges[2]._id;

    // 3. Create Coordinators
    await User.create([
      {
        name: 'MIT Coordinator',
        email: 'mit_coord@ictms.com',
        password: 'password123',
        role: 'coordinator',
        college: mitId
      },
      {
        name: 'Stanford Coordinator',
        email: 'stan_coord@ictms.com',
        password: 'password123',
        role: 'coordinator',
        college: stanId
      },
      {
        name: 'Harvard Coordinator',
        email: 'harv_coord@ictms.com',
        password: 'password123',
        role: 'coordinator',
        college: harvId
      }
    ]);
    console.log('Coordinators created');

    // 4. Create Tournaments
    const tournaments = await Tournament.create([
      {
        name: 'Inter-College Football Championship 2026',
        sport: 'Football',
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-30'),
        venue: 'MIT Athletics Stadium',
        status: 'Ongoing',
        description: 'Annual football battle between top varsity colleges'
      },
      {
        name: 'Spring Cricket Cup 2026',
        sport: 'Cricket',
        startDate: new Date('2026-07-05'),
        endDate: new Date('2026-07-15'),
        venue: 'Stanford Cricket Oval',
        status: 'Upcoming',
        description: 'T20 format inter-collegiate tournament'
      },
      {
        name: 'Varsity Basketball Classic',
        sport: 'Basketball',
        startDate: new Date('2026-05-10'),
        endDate: new Date('2026-05-20'),
        venue: 'Harvard Indoor Arena',
        status: 'Completed',
        description: 'Elite basketball championship'
      }
    ]);
    console.log('Tournaments created');

    const fbTourneyId = tournaments[0]._id;

    // 5. Create Teams for Football
    const teams = await Team.create([
      {
        name: 'MIT Engineers',
        college: mitId,
        tournament: fbTourneyId
      },
      {
        name: 'Stanford Cardinals',
        college: stanId,
        tournament: fbTourneyId
      },
      {
        name: 'Harvard Crimson',
        college: harvId,
        tournament: fbTourneyId
      }
    ]);
    console.log('Teams created');

    const mitTeamId = teams[0]._id;
    const stanTeamId = teams[1]._id;
    const harvTeamId = teams[2]._id;

    // 6. Create Players
    await Player.create([
      // MIT Players
      { name: 'John Doe', team: mitTeamId, age: 20, position: 'Forward', jerseyNumber: 10 },
      { name: 'Bob Smith', team: mitTeamId, age: 21, position: 'Midfielder', jerseyNumber: 7 },
      { name: 'Alice Jones', team: mitTeamId, age: 19, position: 'Goalkeeper', jerseyNumber: 1 },
      
      // Stanford Players
      { name: 'Michael Jordan', team: stanTeamId, age: 22, position: 'Forward', jerseyNumber: 23 },
      { name: 'LeBron James', team: stanTeamId, age: 21, position: 'Defender', jerseyNumber: 6 },
      { name: 'Stephen Curry', team: stanTeamId, age: 20, position: 'Midfielder', jerseyNumber: 30 },
      
      // Harvard Players
      { name: 'Tom Brady', team: harvTeamId, age: 22, position: 'Forward', jerseyNumber: 12 },
      { name: 'Patrick Mahomes', team: harvTeamId, age: 21, position: 'Midfielder', jerseyNumber: 15 },
      { name: 'Aaron Rodgers', team: harvTeamId, age: 20, position: 'Defender', jerseyNumber: 8 }
    ]);
    console.log('Players created');

    // 7. Create Matches & Results
    // Match 1: MIT vs Stanford (Completed, MIT Won 3-1)
    const match1 = await Match.create({
      tournament: fbTourneyId,
      team1: mitTeamId,
      team2: stanTeamId,
      matchDate: new Date('2026-06-16T15:00:00Z'),
      venue: 'MIT Athletics Stadium',
      status: 'Completed',
      score1: 3,
      score2: 1,
      winner: mitTeamId,
      isDraw: false,
      resultPublished: true,
      resultDetails: 'MIT Engineers dominated the first half with 2 goals from John Doe. Stanford scored a consolation goal in the 75th minute.'
    });

    // Match 2: Stanford vs Harvard (Completed, Draw 2-2)
    const match2 = await Match.create({
      tournament: fbTourneyId,
      team1: stanTeamId,
      team2: harvTeamId,
      matchDate: new Date('2026-06-18T16:00:00Z'),
      venue: 'MIT Athletics Stadium',
      status: 'Completed',
      score1: 2,
      score2: 2,
      winner: null,
      isDraw: true,
      resultPublished: true,
      resultDetails: 'Thrilling match ending in a draw. Late equalizer by Harvard midfielder Patrick Mahomes in extra time.'
    });

    // Match 3: MIT vs Harvard (Scheduled/Upcoming)
    const match3 = await Match.create({
      tournament: fbTourneyId,
      team1: mitTeamId,
      team2: harvTeamId,
      matchDate: new Date('2026-06-25T15:30:00Z'),
      venue: 'MIT Athletics Stadium',
      status: 'Scheduled'
    });

    console.log('Matches & results created');
    console.log('Database seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
