const { Group, GroupMember, User, Sport, League } = require('../models');
const { generateGroupCode } = require('../utils/generators.util');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, sport_id, league_id, is_private, max_members } = req.body;
    
    const code = generateGroupCode();
    
    const group = await Group.create({
      name,
      description,
      code,
      owner_id: req.user.id,
      sport_id,
      league_id,
      is_private,
      max_members
    });
    
    // Add creator as member
    await GroupMember.create({
      group_id: group.id,
      user_id: req.user.id,
      role: 'owner'
    });
    
    res.status(201).json({ message: 'Grupo creado', data: { group } });
  } catch (error) {
    next(error);
  }
};

exports.getMyGroups = async (req, res, next) => {
  try {
    const memberships = await GroupMember.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Group,
        as: 'group',
        include: [
          { model: Sport, as: 'sport' },
          { model: League, as: 'league' }
        ]
      }]
    });
    
    const groups = memberships.map(m => ({ ...m.group.toJSON(), my_role: m.role }));
    res.json({ data: { groups } });
  } catch (error) {
    next(error);
  }
};

exports.getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.groupId, {
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'league' },
        { model: User, as: 'owner', attributes: ['id', 'username', 'avatar'] }
      ]
    });
    
    if (!group) {
      return res.status(404).json({ error: { message: 'Grupo no encontrado' } });
    }
    
    const memberCount = await GroupMember.count({ where: { group_id: group.id } });
    
    res.json({ data: { group: { ...group.toJSON(), member_count: memberCount } } });
  } catch (error) {
    next(error);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ error: { message: 'Grupo no encontrado' } });
    }
    
    if (group.owner_id !== req.user.id) {
      return res.status(403).json({ error: { message: 'Solo el dueño puede editar el grupo' } });
    }
    
    await group.update(req.body);
    res.json({ message: 'Grupo actualizado', data: { group } });
  } catch (error) {
    next(error);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ error: { message: 'Grupo no encontrado' } });
    }
    
    if (group.owner_id !== req.user.id) {
      return res.status(403).json({ error: { message: 'Solo el dueño puede eliminar el grupo' } });
    }
    
    await group.destroy();
    res.json({ message: 'Grupo eliminado' });
  } catch (error) {
    next(error);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { code } = req.body;
    const group = await Group.findOne({ where: { code } });
    
    if (!group) {
      return res.status(404).json({ error: { message: 'Código de grupo inválido' } });
    }
    
    const memberCount = await GroupMember.count({ where: { group_id: group.id } });
    if (memberCount >= group.max_members) {
      return res.status(400).json({ error: { message: 'El grupo está lleno' } });
    }
    
    const existing = await GroupMember.findOne({
      where: { group_id: group.id, user_id: req.user.id }
    });
    
    if (existing) {
      return res.status(400).json({ error: { message: 'Ya eres miembro de este grupo' } });
    }
    
    await GroupMember.create({
      group_id: group.id,
      user_id: req.user.id,
      role: 'member'
    });
    
    res.json({ message: 'Te has unido al grupo', data: { group } });
  } catch (error) {
    next(error);
  }
};

exports.leaveGroup = async (req, res, next) => {
  try {
    const membership = await GroupMember.findOne({
      where: { group_id: req.params.groupId, user_id: req.user.id }
    });
    
    if (!membership) {
      return res.status(404).json({ error: { message: 'No eres miembro de este grupo' } });
    }
    
    if (membership.role === 'owner') {
      return res.status(400).json({ error: { message: 'El dueño no puede abandonar el grupo' } });
    }
    
    await membership.destroy();
    res.json({ message: 'Has abandonado el grupo' });
  } catch (error) {
    next(error);
  }
};

exports.getGroupRanking = async (req, res, next) => {
  try {
    const members = await GroupMember.findAll({
      where: { group_id: req.params.groupId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar']
      }],
      order: [['points', 'DESC']]
    });
    
    res.json({ data: { ranking: members } });
  } catch (error) {
    next(error);
  }
};
