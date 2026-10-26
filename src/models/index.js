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
const Tournament = require('./Tournament');
const TournamentParticipant = require('./TournamentParticipant');
const TournamentSpecialPrediction = require('./TournamentSpecialPrediction');
const TeamLeague = require('./TeamLeague');
const Driver = require('./Driver');
const F1Event = require('./F1Event');
const F1EventDriver = require('./F1EventDriver');
const F1EventResult = require('./F1EventResult');
const F1Prediction = require('./F1Prediction');
const F1EventParticipant = require('./F1EventParticipant');

// ─── Sport associations ───────────────────────────────────────────
Sport.hasMany(League, { foreignKey: 'sport_id', as: 'leagues' });
Sport.hasMany(Team, { foreignKey: 'sport_id', as: 'teams' });
Sport.hasMany(Match, { foreignKey: 'sport_id', as: 'matches' });

// ─── League associations ──────────────────────────────────────────
League.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
League.hasMany(Match, { foreignKey: 'league_id', as: 'matches' });
League.hasMany(Group, { foreignKey: 'league_id', as: 'groups' });
League.hasMany(Round, { foreignKey: 'league_id', as: 'rounds' });
League.hasMany(LeagueStanding, { foreignKey: 'league_id', as: 'standings' });
League.hasMany(Tournament, { foreignKey: 'league_id', as: 'tournaments' });

// ─── Team associations ────────────────────────────────────────────
Team.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Team.hasMany(Match, { foreignKey: 'home_team_id', as: 'home_matches' });
Team.hasMany(Match, { foreignKey: 'away_team_id', as: 'away_matches' });
Team.hasMany(LeagueStanding, { foreignKey: 'team_id', as: 'standings' });
Team.belongsToMany(League, { through: TeamLeague, foreignKey: 'team_id', otherKey: 'league_id', as: 'leagues' });
League.belongsToMany(Team, { through: TeamLeague, foreignKey: 'league_id', otherKey: 'team_id', as: 'teams' });
Team.hasMany(TournamentSpecialPrediction, { foreignKey: 'champion_team_id', as: 'champion_predictions' });
Team.hasMany(TournamentSpecialPrediction, { foreignKey: 'runner_up_team_id', as: 'runner_up_predictions' });
Team.hasMany(TournamentSpecialPrediction, { foreignKey: 'third_place_team_id', as: 'third_place_predictions' });

// ─── Round associations ───────────────────────────────────────────
Round.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
Round.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Round.hasMany(Match, { foreignKey: 'round_id', as: 'matches' });
Round.hasMany(LeagueStanding, { foreignKey: 'round_id', as: 'standings' });

// ─── Match associations ───────────────────────────────────────────
Match.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
Match.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Match.belongsTo(Round, { foreignKey: 'round_id', as: 'roundInfo' });
Match.belongsTo(Team, { foreignKey: 'home_team_id', as: 'home_team' });
Match.belongsTo(Team, { foreignKey: 'away_team_id', as: 'away_team' });
Match.hasMany(Prediction, { foreignKey: 'match_id', as: 'predictions' });

// ─── User associations ────────────────────────────────────────────
User.hasMany(Prediction, { foreignKey: 'user_id', as: 'predictions' });
User.hasMany(Group, { foreignKey: 'owner_id', as: 'owned_groups' });
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'user_id', as: 'groups' });
User.hasMany(GroupMember, { foreignKey: 'user_id', as: 'group_memberships' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(TournamentParticipant, { foreignKey: 'user_id', as: 'tournament_participations' });
User.hasMany(TournamentSpecialPrediction, { foreignKey: 'user_id', as: 'special_predictions' });
User.hasMany(Tournament, { foreignKey: 'created_by', as: 'created_tournaments' });

// ─── Prediction associations ──────────────────────────────────────
Prediction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Prediction.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });

// ─── Group associations ───────────────────────────────────────────
Group.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Group.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Group.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'group_id', as: 'members' });
Group.hasMany(GroupMember, { foreignKey: 'group_id', as: 'memberships' });

// ─── GroupMember associations ─────────────────────────────────────
GroupMember.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
GroupMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── Notification associations ────────────────────────────────────
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── LeagueStanding associations ──────────────────────────────────
LeagueStanding.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
LeagueStanding.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
LeagueStanding.belongsTo(Round, { foreignKey: 'round_id', as: 'round' });

// ─── Prediction → Tournament ──────────────────────────────────────
Prediction.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
Tournament.hasMany(Prediction, { foreignKey: 'tournament_id', as: 'predictions' });

// ─── Tournament associations ──────────────────────────────────────
Tournament.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Tournament.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
Tournament.hasMany(TournamentParticipant, { foreignKey: 'tournament_id', as: 'participants' });
Tournament.hasMany(TournamentSpecialPrediction, { foreignKey: 'tournament_id', as: 'special_predictions' });

// ─── TournamentParticipant associations ───────────────────────────
TournamentParticipant.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
TournamentParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── TournamentSpecialPrediction associations ─────────────────────
TournamentSpecialPrediction.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
TournamentSpecialPrediction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
TournamentSpecialPrediction.belongsTo(Team, { foreignKey: 'champion_team_id', as: 'champion_team' });
TournamentSpecialPrediction.belongsTo(Team, { foreignKey: 'runner_up_team_id', as: 'runner_up_team' });
TournamentSpecialPrediction.belongsTo(Team, { foreignKey: 'third_place_team_id', as: 'third_place_team' });

// ─── F1: Driver associations ──────────────────────────────────────
Driver.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Driver.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Team.hasMany(Driver, { foreignKey: 'team_id', as: 'drivers' });
Sport.hasMany(Driver, { foreignKey: 'sport_id', as: 'drivers' });

// ─── F1: Event associations ───────────────────────────────────────
F1Event.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
F1Event.belongsTo(League, { foreignKey: 'league_id', as: 'league' });
F1Event.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
League.hasMany(F1Event, { foreignKey: 'league_id', as: 'f1_events' });
Tournament.hasMany(F1Event, { foreignKey: 'tournament_id', as: 'f1_events' });

// Parrilla del evento (N:M Event <-> Driver)
F1Event.belongsToMany(Driver, { through: F1EventDriver, foreignKey: 'event_id', otherKey: 'driver_id', as: 'drivers' });
Driver.belongsToMany(F1Event, { through: F1EventDriver, foreignKey: 'driver_id', otherKey: 'event_id', as: 'events' });
F1EventDriver.belongsTo(F1Event, { foreignKey: 'event_id', as: 'event' });
F1EventDriver.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });
F1EventDriver.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

// ─── F1: Result associations ──────────────────────────────────────
F1Event.hasOne(F1EventResult, { foreignKey: 'event_id', as: 'result' });
F1EventResult.belongsTo(F1Event, { foreignKey: 'event_id', as: 'event' });
F1EventResult.belongsTo(Driver, { foreignKey: 'pole_driver_id', as: 'pole_driver' });
F1EventResult.belongsTo(Driver, { foreignKey: 'fastest_lap_driver_id', as: 'fastest_lap_driver' });
F1EventResult.belongsTo(Driver, { foreignKey: 'driver_of_the_day_id', as: 'driver_of_the_day' });

// ─── F1: Prediction associations ──────────────────────────────────
F1Event.hasMany(F1Prediction, { foreignKey: 'event_id', as: 'predictions' });
F1Prediction.belongsTo(F1Event, { foreignKey: 'event_id', as: 'event' });
F1Prediction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
F1Prediction.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });
F1Prediction.belongsTo(Driver, { foreignKey: 'pole_driver_id', as: 'pole_driver' });
F1Prediction.belongsTo(Driver, { foreignKey: 'fastest_lap_driver_id', as: 'fastest_lap_driver' });
F1Prediction.belongsTo(Driver, { foreignKey: 'driver_of_the_day_id', as: 'driver_of_the_day' });
User.hasMany(F1Prediction, { foreignKey: 'user_id', as: 'f1_predictions' });

F1Event.hasMany(F1EventParticipant, { foreignKey: 'event_id', as: 'participants' });
F1EventParticipant.belongsTo(F1Event, { foreignKey: 'event_id', as: 'event' });
F1EventParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(F1EventParticipant, { foreignKey: 'user_id', as: 'f1_event_participations' });

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
  LeagueStanding,
  Tournament,
  TournamentParticipant,
  TournamentSpecialPrediction,
  TeamLeague,
  Driver,
  F1Event,
  F1EventDriver,
  F1EventResult,
  F1Prediction,
  F1EventParticipant,
};
