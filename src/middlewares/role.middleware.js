// Middleware to check if user is admin or super_admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: { message: 'Unauthorized: Authentication required' } 
    });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      error: { message: 'Forbidden: Admin access required' } 
    });
  }
  
  next();
};

// Middleware to check if user is super_admin
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: { message: 'Unauthorized: Authentication required' } 
    });
  }
  
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      error: { message: 'Forbidden: Super admin access required' } 
    });
  }
  
  next();
};

// Middleware to check if user is the owner of a resource or admin
const isOwnerOrAdmin = (resourceUserIdGetter) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: { message: 'Unauthorized: Authentication required' } 
      });
    }
    
    const resourceUserId = typeof resourceUserIdGetter === 'function' 
      ? resourceUserIdGetter(req) 
      : req.params.userId || req.body.user_id;
    
    if (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.id === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({ 
      error: { message: 'Forbidden: You do not have access to this resource' } 
    });
  };
};

module.exports = {
  isAdmin,
  isSuperAdmin,
  isOwnerOrAdmin
};
