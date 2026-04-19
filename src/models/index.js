const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Sport = require('./Sport');
const League = require('./League');
const Team = require('./Team');
const Match = require('./Match');
const Prediction = require('./Prediction');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Notification = require('./Notification');
const Round = require('./Round');
const LeagueStanding = require('./LeagueStanding');

// Define associations

// Sport associations
Sport.hasMany(League, { foreignKey: 'sport_id', as: 'leagues' });
Sport.hasMany(Team, { foreignKey: 'sport_id', as: 'teams' });
Sport.hasMany(Match, { foreignKey: 'sport_id', as: 'matches' });

// League associations
League.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
League.hasMany(Match, { foreignKey: 'league_id', as: 'matches' });
League.hasMany(Group, { foreignKey: 'league_id', as: 'groups' });
League.hasMany(Round, { foreignKey: 'league_id', as: 'rounds' });
League.hasMany(LeagueStanding, { foreignKey: 'league_id', as: 'standings' });

// Team associations
Team.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Team.hasMany(Match, { foreignKey: 'home_team_id', as: 'home_matches' });
Team.hasMany(Match, { foreignKey: 'away_team_id', as: 'away_matches' });
Team.hasMany(LeagueStanding, { foreignKey: 'team_id', as: 'standings' });

// Round associations
Round.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
Round.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Round.hasMany(Match, { foreignKey: 'round_id', as: 'matches' });
Round.hasMany(LeagueStanding, { foreignKey: 'round_id', as: 'standings' });

// Match associations
Match.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
Match.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Match.belongsTo(Round, { foreignKey: 'round_id', as: 'roundInfo' }); // Changed from 'round' to avoid collision
Match.belongsTo(Team, { foreignKey: 'home_team_id', as: 'home_team' });
Match.belongsTo(Team, { foreignKey: 'away_team_id', as: 'away_team' });
Match.hasMany(Prediction, { foreignKey: 'match_id', as: 'predictions' });

// User associations
User.hasMany(Prediction, { foreignKey: 'user_id', as: 'predictions' });
User.hasMany(Group, { foreignKey: 'owner_id', as: 'owned_groups' });
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'user_id', as: 'groups' });
User.hasMany(GroupMember, { foreignKey: 'user_id', as: 'group_memberships' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// Prediction associations
Prediction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Prediction.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });

// Group associations
Group.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Group.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Group.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'group_id', as: 'members' });
Group.hasMany(GroupMember, { foreignKey: 'group_id', as: 'memberships' });

// GroupMember associations
GroupMember.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
GroupMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// LeagueStanding associations
LeagueStanding.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
LeagueStanding.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
LeagueStanding.belongsTo(Round, { foreignKey: 'round_id', as: 'round' });

module.exports = {
  sequelize,
  User,
  Sport,
  League,
  Team,
  Match,
  Prediction,
  Group,
  GroupMember,
  Notification,
  Round,
  LeagueStanding
};
